'use client'

import { useState, useTransition, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ClubMemberWithUser, PlayerStats } from '@/types/club'
import type { RatingMap } from '@/lib/club/client'
import { updatePlayerStatsForMatch } from '@/app/club/[clubId]/ranking/actions'
import { buildRankMap, gradeToSkill } from '@/lib/club/grade'
import {
  type Phase,
  type AssignMode,
  type GameMode,
  type PlayerEntry,
  type CourtEntry,
  type DialogState,
  type InProgressData,
  type PartnerHistory,
  type KingStreaks,
  type GameboardEvent,
  type SessionGuest,
  ASSIGN_MODE_MAP,
  pickTeams,
  updatePartnerHistory,
} from './gameboard/types'
import { SetupPhase } from './gameboard/SetupPhase'
import { PlayingPhase } from './gameboard/PlayingPhase'

// 하위 호환을 위해 재익스포트
export type { InProgressData }

interface Props {
  clubId: string
  clubName: string
  /** 셔틀콕 1개당 기본 가격 — 이전 정산 시스템 잔재 (v2에선 /shuttle 페이지에서 사용) */
  shuttleDefaultPrice: number
  /** 입금 계좌 안내 — 이전 정산 시스템 잔재 (v2에선 /shuttle 페이지에서 사용) */
  settlementAccount: string | null
  courtCount: number
  members: ClubMemberWithUser[]
  stats: PlayerStats[]
  /** member_id → Glicko-2 레이팅. skill_balance 매칭에서 mu가 1순위 키. */
  ratingsMap?: RatingMap
  membership: { id: string; role: string }
  inProgressData?: InProgressData | null
  /** 게임 종료 점수 (21 정식 / 25 일반) — 디폴트 25 */
  matchPointTarget?: 21 | 25
  /** 정기 모임 목록 (최근 7일 ~ 향후 30일) */
  events?: GameboardEvent[]
  /** true 이면 체험 모드 — Supabase DB 쓰기를 모두 건너뜀 */
  isDemo?: boolean
  /**
   * true 이면 inProgressData 가 있을 때 마운트 직후 자동으로 handleResumeGame() 을 1회 호출.
   * `/[sessionId]` 라우트(이미 in_progress 세션) 전용 — 사용자가 재개 배너를 누르지 않아도
   * 즉시 playing 페이즈로 진입.
   */
  autoResume?: boolean
  /** session_guests 행 목록 — in_progress 재개 시 게스트를 playerMap 에 포함 */
  guests?: SessionGuest[]
}

export function GameBoardClient({
  clubId,
  clubName,
  shuttleDefaultPrice,
  settlementAccount,
  courtCount,
  members,
  ratingsMap = {},
  membership,
  inProgressData,
  matchPointTarget = 25,
  events = [],
  isDemo = false,
  autoResume = false,
  guests = [],
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  /* ── 클럽 내 랭킹 맵 (skill_score 기준, 1 = 최상위) ── */
  const rankMap = useMemo(() => buildRankMap(members), [members])

  /* ── 페이즈: idle 제거, setup 이 초기 화면 ── */
  const [phase, setPhase] = useState<Phase>('setup')

  /* ── Setup 상태 ── */
  const [gameMode, setGameMode] = useState<GameMode>('normal')
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())
  // localStorage 에서 마지막 배정 방식 복원
  // v2 단순화: UI는 freshness/custom 2개만 노출. 구 값(random/skill_balance/game_count/smart)이
  // 들어오면 모두 freshness 로 통합. custom 만 그대로 보존.
  const [assignMode, setAssignMode] = useState<AssignMode>(() => {
    if (typeof window === 'undefined') return 'freshness'
    const stored = localStorage.getItem(`gameboard-assign-${clubId}`)
    if (stored === 'custom') return 'custom'
    return 'freshness'
  })
  /* ── 선택된 정기 모임 ── */
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  /* ── 직접 배정 모드: 열린 코트 인덱스 ── */
  const [customPickCourt, setCustomPickCourt] = useState<number | null>(null)

  /* settlementDialog state 는 v2에서 dead — 셔틀콕은 /club/[id]/shuttle 에서 별도 관리 */
  const [tempPlayers, setTempPlayers] = useState<Array<{ id: string; name: string; gender?: 'M' | 'F' | null; grade?: import('@/lib/club/grade').Grade | null }>>([])
  // 날짜 및 코트 수 (SetupPhase 에서 조정 가능)
  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [activeCourts, setActiveCourts] = useState<number>(courtCount)

  /* ── Playing 상태 ── */
  const [sessionDbId, setSessionDbId] = useState<string | null>(null)
  const [playerMap, setPlayerMap] = useState<Map<string, PlayerEntry>>(new Map())
  const [courts, setCourts] = useState<CourtEntry[]>([])
  const [partnerHistory, setPartnerHistory] = useState<PartnerHistory>(new Map())
  const [kingStreaks, setKingStreaks] = useState<KingStreaks>(new Map())
  const [gameStartedAt, setGameStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [dialog, setDialog] = useState<DialogState | null>(null)

  /* ── 타이머 ── */
  useEffect(() => {
    if (phase === 'playing' && gameStartedAt > 0) {
      timerRef.current = setInterval(() => setElapsed(Date.now() - gameStartedAt), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, gameStartedAt])

  /* ── Setup 핸들러 ── */

  /* ── 배정 방식 변경 (localStorage 동기화) ── */
  const handleAssignModeChange = useCallback((v: AssignMode) => {
    setAssignMode(v)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`gameboard-assign-${clubId}`, v)
    }
  }, [clubId])

  /* ── 정기 모임 선택 핸들러 ── */
  const handleEventSelect = useCallback((eventId: string | null) => {
    setSelectedEventId(eventId)
    if (!eventId) return
    const event = events.find(e => e.id === eventId)
    if (!event) return
    // 날짜 자동 설정
    setSessionDate(event.event_date)
    // RSVP 참가자로 selectedPlayers 교체 (게스트 tempPlayers 는 유지)
    setSelectedPlayers(new Set(event.goingMemberIds))
  }, [events])

  /* ── 게임 시작 핸들러 (셋업 → 게임 시작 → 플레이, 원스텝) ── */
  const handleStartGame = useCallback(() => {
    const totalPlayers = Array.from(selectedPlayers).length
    if (totalPlayers < 4) { setError('최소 4명 필요합니다'); return }
    if (!selectedEventId && !isDemo) { setError('정기 모임을 선택해주세요'); return }
    if (activeCourts < 1) { setError('코트 수는 1 이상이어야 합니다'); return }

    setError(null)
    const capturedPlayers = new Set(selectedPlayers)
    const capturedMode = assignMode
    const capturedEventId = selectedEventId
    const capturedDate = sessionDate
    const capturedCourts = activeCourts

    startTransition(async () => {
      try {
        // playerMap 빌드 (회원 + 게스트)
        const now = Date.now()
        const newPlayerMap = new Map<string, PlayerEntry>()

        for (const memberId of capturedPlayers) {
          if (memberId.startsWith('temp-')) continue
          const member = members.find(m => m.id === memberId)
          if (!member) continue
          newPlayerMap.set(memberId, {
            memberId,
            name: member.user?.name ?? '?',
            skillScore: member.skill_score,
            muScore: ratingsMap[memberId]?.mu,
            phiScore: ratingsMap[memberId]?.phi,
            rank: rankMap.get(memberId),
            gender: member.gender ?? null,
            todayGames: 0,
            waitingSince: now,
            status: 'waiting',
          })
        }

        // 선택된 게스트 (temp- 접두사 항목)
        const selectedGuests = tempPlayers.filter(t => capturedPlayers.has(t.id))
        for (const g of selectedGuests) {
          newPlayerMap.set(g.id, {
            memberId: g.id,
            name: g.name,
            skillScore: gradeToSkill(g.grade ?? null) ?? 50,
            gender: g.gender ?? null,
            todayGames: 0,
            waitingSince: now,
            status: 'waiting',
          })
        }

        // 코트별 팀 배정 (pickTeams)
        const courtsPayload: Array<{ court_number: number; team_a: string[]; team_b: string[]; excluded: boolean }> = []
        const localPlayerMap = new Map(newPlayerMap)
        let localHistory: PartnerHistory = new Map()

        for (let i = 0; i < capturedCourts; i++) {
          const waiting = Array.from(localPlayerMap.values()).filter(p => p.status === 'waiting')
          const result = pickTeams(waiting, capturedMode, localHistory)
          if (!result) break

          const [teamA, teamB] = result
          const teamAIds = teamA.map(p => p.memberId)
          const teamBIds = teamB.map(p => p.memberId)
          const hasGuest = [...teamAIds, ...teamBIds].some(id => id.startsWith('temp-') || id.startsWith('guest-'))

          courtsPayload.push({
            court_number: i + 1,
            team_a: teamAIds.filter(id => !id.startsWith('temp-') && !id.startsWith('guest-')),
            team_b: teamBIds.filter(id => !id.startsWith('temp-') && !id.startsWith('guest-')),
            excluded: hasGuest,
          })

          for (const p of [...teamA, ...teamB]) {
            localPlayerMap.set(p.memberId, { ...p, status: 'playing' })
          }
          localHistory = updatePartnerHistory(localHistory, teamAIds, teamBIds)
        }

        // 데모: DB 건너뜀 — 로컬 상태로 playing 페이즈 전환
        if (isDemo) {
          const newCourts: CourtEntry[] = Array.from({ length: capturedCourts }, (_, i) => ({
            courtIndex: i,
            matchDbId: null,
            teamA: [],
            teamB: [],
            scoreA: 0,
            scoreB: 0,
            startedAt: 0,
            isSaving: false,
          }))
          courtsPayload.forEach((cp, i) => {
            if (i < newCourts.length) {
              newCourts[i] = {
                ...newCourts[i],
                matchDbId: `demo-match-${i}-${Date.now()}`,
                teamA: cp.team_a,
                teamB: cp.team_b,
                startedAt: now,
              }
              for (const id of [...cp.team_a, ...cp.team_b]) {
                const p = newPlayerMap.get(id)
                if (p) newPlayerMap.set(id, { ...p, status: 'playing' })
              }
            }
          })
          setSessionDbId(`demo-session-${Date.now()}`)
          setPlayerMap(newPlayerMap)
          setCourts(newCourts)
          setGameStartedAt(now)
          setElapsed(0)
          setPhase('playing')
          return
        }

        // 실서비스: 2-step RPC (create_pending_session → start_pending_session)
        const supabase = createClient()
        const realAttendees = Array.from(capturedPlayers).filter(id => !id.startsWith('temp-'))
        const guestsPayload = selectedGuests.map(g => ({
          name: g.name,
          gender: g.gender ?? null,
          grade: g.grade ?? null,
        }))

        const { data: newSessionId, error: createErr } = await supabase.rpc('create_pending_session', {
          p_club_id: clubId,
          p_event_id: capturedEventId,
          p_session_date: capturedDate,
          p_match_mode: ASSIGN_MODE_MAP[capturedMode],
          p_court_count: capturedCourts,
          p_notes: null,
          p_created_by: membership.id,
          p_attendees_json: realAttendees,
          p_guests_json: guestsPayload,
        })
        if (createErr || !newSessionId) throw new Error(createErr?.message ?? '세션 생성 실패')

        const { error: startErr } = await supabase.rpc('start_pending_session', {
          p_session_id: newSessionId,
          p_courts_json: courtsPayload,
        })
        if (startErr) throw new Error(startErr?.message ?? '게임 시작 실패')

        // in_progress 페이지로 이동 (autoResume 이 playing 페이즈로 자동 전환)
        router.push(`/club/${clubId}/gameboard/${newSessionId}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : '알 수 없는 오류')
      }
    })
  }, [selectedPlayers, selectedEventId, isDemo, activeCourts, assignMode, sessionDate, tempPlayers, members, ratingsMap, rankMap, clubId, membership.id, router])

  const togglePlayer = (memberId: string) =>
    setSelectedPlayers((prev) => {
      const next = new Set(prev)
      next.has(memberId) ? next.delete(memberId) : next.add(memberId)
      return next
    })

  const addTempPlayer = (guest: { name: string; gender?: 'M' | 'F' | null; grade?: import('@/lib/club/grade').Grade | null }) => {
    const id = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setTempPlayers(prev => [...prev, { id, ...guest }])
    setSelectedPlayers(prev => { const n = new Set(prev); n.add(id); return n })
  }

  const removeTempPlayer = (id: string) => {
    setTempPlayers(prev => prev.filter(p => p.id !== id))
    setSelectedPlayers(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  /* ── 세션 재개 ── */
  const handleResumeGame = useCallback(() => {
    if (!inProgressData) return
    const now = Date.now()

    const newPlayerMap = new Map<string, PlayerEntry>()
    for (const memberId of inProgressData.attendeeMemberIds) {
      const member = members.find((m) => m.id === memberId)
      if (!member) continue
      newPlayerMap.set(memberId, {
        memberId,
        name: member.user?.name ?? '?',
        skillScore: member.skill_score,
        muScore: ratingsMap[memberId]?.mu,
        phiScore: ratingsMap[memberId]?.phi,
        rank: rankMap.get(memberId),
        gender: member.gender ?? null,
        todayGames: 0,
        waitingSince: now,
        status: 'waiting',
      })
    }

    // 게스트 추가 — session_guests UUID 앞에 'guest-' 접두사
    for (const g of guests) {
      const id = `guest-${g.id}`
      newPlayerMap.set(id, {
        memberId: id,
        name: g.name,
        skillScore: gradeToSkill(g.grade) ?? 50,
        gender: g.gender ?? null,
        todayGames: 0,
        waitingSince: now,
        status: 'waiting',
      })
    }

    const newCourts: CourtEntry[] = Array.from({ length: courtCount }, (_, i) => ({
      courtIndex: i,
      matchDbId: null,
      teamA: [],
      teamB: [],
      scoreA: 0,
      scoreB: 0,
      startedAt: 0,
      isSaving: false,
    }))

    for (const match of inProgressData.matches) {
      const isActive = match.team_a_score === null
      if (!isActive) continue
      const idx = match.court_number - 1
      if (idx < 0 || idx >= newCourts.length) continue

      const teamA = match.players.filter((p) => p.team === 'A').map((p) => p.member_id)
      const teamB = match.players.filter((p) => p.team === 'B').map((p) => p.member_id)

      newCourts[idx] = { ...newCourts[idx], matchDbId: match.id, teamA, teamB, startedAt: now }
      for (const mid of [...teamA, ...teamB]) {
        const p = newPlayerMap.get(mid)
        if (p) newPlayerMap.set(mid, { ...p, status: 'playing' })
      }
    }

    setSessionDbId(inProgressData.sessionId)
    setPlayerMap(newPlayerMap)
    setCourts(newCourts)
    setGameStartedAt(now)
    setElapsed(0)
    setPhase('playing')
  }, [inProgressData, members, ratingsMap, rankMap, courtCount, guests])

  /* ── autoResume: /[sessionId] 라우트에서 in_progress 진입 시 자동 재개 ── */
  const autoResumeFiredRef = useRef(false)
  useEffect(() => {
    if (!autoResume) return
    if (autoResumeFiredRef.current) return
    if (!inProgressData) return
    if (phase === 'playing') return
    autoResumeFiredRef.current = true
    handleResumeGame()
  }, [autoResume, inProgressData, phase, handleResumeGame])

  /* ── 직접 배정 오버라이드 (기본 모드와 관계없이 피커 열기) ── */
  const handleOpenCustomPick = (courtIndex: number) => {
    if (!sessionDbId) return
    setError(null)
    setCustomPickCourt(courtIndex)
  }

  /* ── 직접 배정 확정 핸들러 ──
   * overrideCourtIndex: 매칭보드 등록처럼 코트 인덱스를 직접 넘기는 경우.
   * 없으면 customPickCourt (피커 오버레이 경로).
   */
  const handleCustomAssign = (teamAIds: string[], teamBIds: string[], overrideCourtIndex?: number) => {
    const courtIndex = overrideCourtIndex ?? customPickCourt
    if (courtIndex === null || courtIndex === undefined || !sessionDbId) return
    const capturedSessionId = sessionDbId
    if (overrideCourtIndex === undefined) setCustomPickCourt(null)
    setError(null)

    startTransition(async () => {
      let matchId: string
      if (!isDemo) {
        const supabase = createClient()
        const hasTempPlayer = [...teamAIds, ...teamBIds].some(id => id.startsWith('temp-'))
        const { data: match, error: matchErr } = await supabase
          .from('matches')
          .insert({ session_id: capturedSessionId, court_number: courtIndex + 1, excluded_from_ranking: hasTempPlayer })
          .select()
          .single()
        if (matchErr || !match) { setError('경기 배정에 실패했습니다'); return }

        const realPlayers = [...teamAIds, ...teamBIds].filter(id => !id.startsWith('temp-'))
        if (realPlayers.length > 0) {
          await supabase.from('match_players').insert(
            realPlayers.map(id => ({
              match_id: match.id,
              member_id: id,
              team: teamAIds.includes(id) ? 'A' : 'B',
            }))
          )
        }
        matchId = match.id
      } else {
        matchId = `demo-match-custom-${courtIndex}-${Date.now()}`
      }

      setCourts(prev => prev.map((c, i) =>
        i !== courtIndex ? c : {
          ...c,
          matchDbId: matchId,
          teamA: teamAIds,
          teamB: teamBIds,
          scoreA: 0,
          scoreB: 0,
          startedAt: Date.now(),
        }
      ))
      setPlayerMap(prev => {
        const next = new Map(prev)
        for (const id of [...teamAIds, ...teamBIds]) {
          const p = next.get(id)
          if (p) next.set(id, { ...p, status: 'playing' })
        }
        return next
      })
      setPartnerHistory(prev => updatePartnerHistory(prev, teamAIds, teamBIds))
    })
  }

  /* ── 코트 배정 ──
   * teamAIds / teamBIds 가 있으면 명시 배정 (매칭보드에서 등록),
   * 없으면 기존처럼 pickTeams 자동 배정.
   */
  const handleAssignCourt = (courtIndex: number, teamAIds?: string[], teamBIds?: string[]) => {
    if (!sessionDbId) return

    // 명시 팀이 있는 경우 → handleCustomAssign 로직 재사용
    if (teamAIds && teamBIds) {
      handleCustomAssign(teamAIds, teamBIds, courtIndex)
      return
    }

    // 직접 배정 모드: 피커 오버레이 열기
    if (assignMode === 'custom') {
      setCustomPickCourt(courtIndex)
      return
    }

    setError(null)

    const capturedMap = playerMap
    const capturedMode = assignMode
    const capturedSessionId = sessionDbId
    const capturedHistory = partnerHistory

    startTransition(async () => {
      const waiting = Array.from(capturedMap.values()).filter((p) => p.status === 'waiting')
      const result = pickTeams(waiting, capturedMode, capturedHistory)
      if (!result) { setError('대기 인원이 부족합니다 (4명 이상 필요)'); return }

      const [teamA, teamB] = result

      let matchId: string
      if (!isDemo) {
        const supabase = createClient()
        const hasTempPlayer = [...teamA, ...teamB].some(p => p.memberId.startsWith('temp-'))
        const { data: match, error: matchErr } = await supabase
          .from('matches')
          .insert({
            session_id: capturedSessionId,
            court_number: courtIndex + 1,
            excluded_from_ranking: hasTempPlayer,
          })
          .select()
          .single()
        if (matchErr || !match) { setError('경기 배정에 실패했습니다'); return }

        const realPlayers = [...teamA, ...teamB].filter(p => !p.memberId.startsWith('temp-'))
        if (realPlayers.length > 0) {
          await supabase.from('match_players').insert(
            realPlayers.map(p => ({
              match_id: match.id,
              member_id: p.memberId,
              team: teamA.some(a => a.memberId === p.memberId) ? 'A' : 'B',
            }))
          )
        }
        matchId = match.id
      } else {
        // 체험 모드: 가짜 matchId
        matchId = `demo-match-${courtIndex}-${Date.now()}`
      }

      setCourts((prev) =>
        prev.map((c, i) =>
          i !== courtIndex ? c : {
            ...c,
            matchDbId: matchId,
            teamA: teamA.map((p) => p.memberId),
            teamB: teamB.map((p) => p.memberId),
            scoreA: 0,
            scoreB: 0,
            startedAt: Date.now(),
          }
        )
      )
      setPlayerMap((prev) => {
        const next = new Map(prev)
        for (const p of [...teamA, ...teamB]) {
          const existing = next.get(p.memberId)
          if (existing) next.set(p.memberId, { ...existing, status: 'playing' })
        }
        return next
      })
      // 파트너 기록 갱신 (smart 모드에서 다음 배정 시 참조)
      setPartnerHistory(prev =>
        updatePartnerHistory(
          prev,
          teamA.map(p => p.memberId),
          teamB.map(p => p.memberId)
        )
      )
    })
  }

  /* ── 점수 변경 ── */
  const handleScoreChange = (courtIndex: number, team: 'A' | 'B', delta: number) => {
    setCourts((prev) =>
      prev.map((c, i) => {
        if (i !== courtIndex) return c
        const updated =
          team === 'A'
            ? { ...c, scoreA: Math.max(0, c.scoreA + delta) }
            : { ...c, scoreB: Math.max(0, c.scoreB + delta) }
        // 목표 점수 최초 도달 시 모바일 진동 피드백 (클럽 설정 21/25)
        if (delta > 0) {
          const newScore = team === 'A' ? updated.scoreA : updated.scoreB
          const oldScore = team === 'A' ? c.scoreA : c.scoreB
          if (oldScore < matchPointTarget && newScore >= matchPointTarget) {
            if (typeof navigator !== 'undefined') navigator.vibrate?.(200)
          }
        }
        return updated
      })
    )
  }

  /* ── 경기 종료 (코트 단위) ── */
  const handleEndCourt = (courtIndex: number) => {
    const court = courts[courtIndex]
    if (!court.matchDbId || court.isSaving) return

    const { matchDbId, scoreA, scoreB, teamA, teamB } = court
    const capturedGameMode = gameMode
    const capturedSessionId = sessionDbId
    const capturedAssignMode = assignMode

    setCourts((prev) => prev.map((c, i) => (i === courtIndex ? { ...c, isSaving: true } : c)))

    startTransition(async () => {
      if (!isDemo) {
        const supabase = createClient()
        const { error: updateErr } = await supabase
          .from('matches')
          .update({ team_a_score: scoreA, team_b_score: scoreB })
          .eq('id', matchDbId)

        if (updateErr) {
          setError('점수 저장에 실패했습니다')
          setCourts((prev) => prev.map((c, i) => (i === courtIndex ? { ...c, isSaving: false } : c)))
          return
        }

        updatePlayerStatsForMatch(matchDbId, clubId, null, null, scoreA, scoreB).catch(console.error)
      }

      const now = Date.now()

      if (capturedGameMode === 'king_of_court') {
        /* ── 킹 오브 코트: 승자 유지, 도전자 자동 배정 ── */
        const winners = scoreA >= scoreB ? teamA : teamB
        const losers  = scoreA >= scoreB ? teamB : teamA

        // 킹 스트릭 업데이트
        setKingStreaks(prev => {
          const next = new Map(prev)
          for (const id of winners) next.set(id, (next.get(id) ?? 0) + 1)
          for (const id of losers) next.set(id, 0)
          return next
        })

        // 다음 상태 미리 계산 (패자 대기 복귀 + 도전자 선발)
        const nextPlayerMap = new Map(playerMap)
        for (const id of losers) {
          const p = nextPlayerMap.get(id)
          if (p) nextPlayerMap.set(id, { ...p, status: 'waiting', todayGames: p.todayGames + 1, waitingSince: now })
        }

        // 대기 중인 도전자 2명 선발 (승자 제외)
        const winnerSet = new Set(winners)
        const challengers = Array.from(nextPlayerMap.values())
          .filter(p => p.status === 'waiting' && !winnerSet.has(p.memberId))
          .sort((a, b) => a.todayGames - b.todayGames || a.waitingSince - b.waitingSince)
          .slice(0, 2)

        if (challengers.length < 2 || !capturedSessionId) {
          // 도전자 부족 → 일반 종료로 폴백
          for (const id of winners) {
            const p = nextPlayerMap.get(id)
            if (p) nextPlayerMap.set(id, { ...p, status: 'waiting', todayGames: p.todayGames + 1, waitingSince: now })
          }
          setPlayerMap(nextPlayerMap)
          setCourts(prev =>
            prev.map((c, i) =>
              i === courtIndex
                ? { ...c, matchDbId: null, teamA: [], teamB: [], scoreA: 0, scoreB: 0, startedAt: 0, isSaving: false }
                : c
            )
          )
          return
        }

        // 새 경기 생성 (승자 팀 A, 도전자 팀 B)
        const newTeamA = winners
        const newTeamB = challengers.map(p => p.memberId)

        let newMatchId: string
        if (!isDemo) {
          const supabase = createClient()
          const hasTempPlayer = [...newTeamA, ...newTeamB].some(id => id.startsWith('temp-'))
          const { data: newMatch, error: matchErr } = await supabase
            .from('matches')
            .insert({ session_id: capturedSessionId, court_number: courtIndex + 1, excluded_from_ranking: hasTempPlayer })
            .select()
            .single()

          if (matchErr || !newMatch) {
            setError('다음 경기 배정에 실패했습니다')
            setPlayerMap(nextPlayerMap)
            setCourts(prev =>
              prev.map((c, i) =>
                i === courtIndex
                  ? { ...c, matchDbId: null, teamA: [], teamB: [], scoreA: 0, scoreB: 0, startedAt: 0, isSaving: false }
                  : c
              )
            )
            return
          }

          const realPlayers = [...newTeamA, ...newTeamB].filter(id => !id.startsWith('temp-'))
          if (realPlayers.length > 0) {
            await supabase.from('match_players').insert(
              realPlayers.map(id => ({
                match_id: newMatch.id,
                member_id: id,
                team: newTeamA.includes(id) ? 'A' : 'B',
              }))
            )
          }
          newMatchId = newMatch.id
        } else {
          newMatchId = `demo-match-king-${courtIndex}-${Date.now()}`
        }

        // 도전자를 playing 상태로
        for (const p of challengers) {
          nextPlayerMap.set(p.memberId, { ...p, status: 'playing' })
        }

        setPlayerMap(nextPlayerMap)
        setPartnerHistory(prev =>
          updatePartnerHistory(prev, newTeamA, newTeamB)
        )
        setCourts(prev =>
          prev.map((c, i) =>
            i === courtIndex
              ? { ...c, matchDbId: newMatchId, teamA: newTeamA, teamB: newTeamB, scoreA: 0, scoreB: 0, startedAt: Date.now(), isSaving: false }
              : c
          )
        )
      } else {
        /* ── 일반 모드: 모든 플레이어 대기 복귀 ── */
        setPlayerMap((prev) => {
          const next = new Map(prev)
          for (const memberId of [...teamA, ...teamB]) {
            const p = next.get(memberId)
            if (!p) continue
            next.set(memberId, { ...p, status: 'waiting', todayGames: p.todayGames + 1, waitingSince: now })
          }
          return next
        })

        setCourts((prev) =>
          prev.map((c, i) =>
            i === courtIndex
              ? { ...c, matchDbId: null, teamA: [], teamB: [], scoreA: 0, scoreB: 0, startedAt: 0, isSaving: false }
              : c
          )
        )
      }
    })
  }

  /* ── 코트 경기 취소 ── */
  const handleCancelCourt = (courtIndex: number) => {
    const court = courts[courtIndex]
    if (!court || court.teamA.length === 0 || court.isSaving) return

    const { matchDbId, teamA, teamB } = court
    setDialog({
      title: '경기 취소',
      description: '이 경기를 취소하시겠어요? 점수는 저장되지 않습니다.',
      confirmText: '경기 취소',
      cancelText: '닫기',
      variant: 'destructive',
      onConfirm: () => {
        setDialog(null)
        startTransition(async () => {
          if (!isDemo && matchDbId) {
            const supabase = createClient()
            await supabase.from('match_players').delete().eq('match_id', matchDbId)
            await supabase.from('matches').delete().eq('id', matchDbId)
          }
          setPlayerMap((prev) => {
            const next = new Map(prev)
            for (const memberId of [...teamA, ...teamB]) {
              const p = next.get(memberId)
              if (p) next.set(memberId, { ...p, status: 'waiting', waitingSince: Date.now() })
            }
            return next
          })
          setCourts((prev) =>
            prev.map((c, i) =>
              i === courtIndex
                ? { ...c, matchDbId: null, teamA: [], teamB: [], scoreA: 0, scoreB: 0, startedAt: 0, isSaving: false }
                : c
            )
          )
        })
      },
    })
  }

  /* ── 마감 내부 로직: 세션 closed 후 /view?tab=게임보드 로 이동 ── */
  const finalizeEndGameInternal = useCallback(
    async (sessionId: string | null) => {
      if (!isDemo && sessionId) {
        const supabase = createClient()
        await supabase.from('sessions').update({ status: 'closed' }).eq('id', sessionId)
      }
      /* 모든 로컬 상태 리셋 */
      setPhase('setup')
      setSessionDbId(null)
      setPlayerMap(new Map())
      setCourts([])
      setPartnerHistory(new Map())
      setKingStreaks(new Map())
      setSessionDate(new Date().toISOString().split('T')[0])
      setActiveCourts(courtCount)
      setSelectedPlayers(new Set())
      setTempPlayers([])

      /* 데모는 게임보드 페이지 내에서 머물고 (세션 DB 없음), 실제는 모임 뷰의 게임보드 탭으로 이동해 히스토리 확인 */
      if (!isDemo) {
        router.push(`/club/${clubId}?tab=${encodeURIComponent('게임보드')}`)
      }
    },
    [isDemo, courtCount, router, clubId]
  )

  /* ── 게임 전체 종료 ── */
  const handleEndGame = () => {
    if (!sessionDbId) return
    const capturedCourts = courts
    const capturedSessionId = sessionDbId
    /* 실제 클럽 멤버(temp- 제외)만 카운트 — 임시 참가자는 정산 대상 아님 */
    const attendeeCount = Array.from(playerMap.keys()).filter(
      (id) => !id.startsWith('temp-')
    ).length

    startTransition(async () => {
      if (!isDemo) {
        const supabase = createClient()
        for (const court of capturedCourts) {
          if (court.matchDbId && court.teamA.length > 0) {
            await supabase
              .from('matches')
              .update({ team_a_score: court.scoreA, team_b_score: court.scoreB })
              .eq('id', court.matchDbId)
            // 스탯 업데이트 (코트별, fire-and-forget)
            updatePlayerStatsForMatch(court.matchDbId, clubId, null, null, court.scoreA, court.scoreB)
              .catch(console.error)
          }
        }
      }

      /* v2: 셔틀콕비 정산 다이얼로그 제거. 운영 방식은 /club/[id]/shuttle 의
       * 제출 트래커(평일 2개·주말 3개) + 잔여 분배로 별도 처리. */
      await finalizeEndGameInternal(capturedSessionId)
    })
  }

  /* ── 게임 전체 삭제 ── */
  const handleDeleteGame = () => {
    const capturedSessionId = sessionDbId
    setDialog({
      title: '게임 삭제',
      description: '게임을 삭제하시겠어요?\n\n모든 경기 기록이 사라지고 세션이 취소됩니다.',
      confirmText: '삭제',
      variant: 'destructive',
      onConfirm: () => {
        setDialog(null)
        startTransition(async () => {
          if (!isDemo && capturedSessionId) {
            const supabase = createClient()
            const { data: matches } = await supabase.from('matches').select('id').eq('session_id', capturedSessionId)
            for (const m of matches ?? []) {
              await supabase.from('match_players').delete().eq('match_id', m.id)
            }
            await supabase.from('matches').delete().eq('session_id', capturedSessionId)
            await supabase.from('attendances').delete().eq('session_id', capturedSessionId)
            await supabase.from('sessions').delete().eq('id', capturedSessionId)
          }
          setPhase('setup')
          setSessionDbId(null)
          setPlayerMap(new Map())
          setCourts([])
          setGameStartedAt(0)
          setPartnerHistory(new Map())
          setKingStreaks(new Map())
          setSessionDate(new Date().toISOString().split('T')[0])
          setActiveCourts(courtCount)
          setSelectedPlayers(new Set())
          setTempPlayers([])
          if (!isDemo) router.refresh()
        })
      },
    })
  }

  /* ── 상태 전환 (waiting / resting / departed) ──
   * playing 상태인 플레이어는 변경 X (경기 중 — 매치 종료 후 자동 waiting 복귀).
   * waitingSince 는 대기 복귀 시 재설정 (대기열 끝으로).
   */
  const handleTogglePlayerStatus = useCallback(
    (memberId: string, target: 'waiting' | 'resting' | 'departed') => {
      setPlayerMap(prev => {
        const p = prev.get(memberId)
        if (!p) return prev
        if (p.status === 'playing') return prev // 경기 중이면 무시
        if (p.status === target) return prev    // 변화 없음
        const next = new Map(prev)
        next.set(memberId, {
          ...p,
          status: target,
          // 휴식·퇴장 → 대기로 복귀할 때 waitingSince 재설정 (대기열 끝으로)
          waitingSince: target === 'waiting' ? Date.now() : p.waitingSince,
        })
        return next
      })
    },
    [],
  )

  /* ── 코트 추가 (in_progress 중) ── */
  const handleAddCourt = useCallback(() => {
    setCourts(prev => {
      const nextIndex = prev.length
      return [
        ...prev,
        {
          courtIndex: nextIndex,
          matchDbId: null,
          teamA: [],
          teamB: [],
          scoreA: 0,
          scoreB: 0,
          startedAt: 0,
          isSaving: false,
        },
      ]
    })
    setActiveCourts(c => c + 1)

    if (!isDemo && sessionDbId) {
      startTransition(async () => {
        const supabase = createClient()
        await supabase
          .from('sessions')
          .update({ court_count: courts.length + 1 })
          .eq('id', sessionDbId)
      })
    }
  }, [isDemo, sessionDbId, courts.length])

  /* ── 코트 제거 (in_progress 중) — 마지막 코트가 빈 경우만 ── */
  const handleRemoveCourt = useCallback(() => {
    setCourts(prev => {
      if (prev.length <= 1) return prev
      const last = prev[prev.length - 1]
      // 보호: 매치가 진행 중이거나 매치 ID가 있으면 취소
      if (last.matchDbId !== null || last.teamA.length > 0 || last.teamB.length > 0) return prev
      return prev.slice(0, -1)
    })
    setActiveCourts(c => Math.max(1, c - 1))

    if (!isDemo && sessionDbId && courts.length > 1) {
      const last = courts[courts.length - 1]
      if (last && last.matchDbId === null && last.teamA.length === 0 && last.teamB.length === 0) {
        startTransition(async () => {
          const supabase = createClient()
          await supabase
            .from('sessions')
            .update({ court_count: courts.length - 1 })
            .eq('id', sessionDbId)
        })
      }
    }
  }, [isDemo, sessionDbId, courts])

  /* ══════════════════════════════════════
     렌더
  ══════════════════════════════════════ */

  if (phase === 'setup') {
    return (
      <SetupPhase
        members={members}
        clubId={clubId}
        selectedPlayers={selectedPlayers}
        tempPlayers={tempPlayers}
        assignMode={assignMode}
        gameMode={gameMode}
        courtCount={courtCount}
        activeCourts={activeCourts}
        maxCourts={courtCount}
        sessionDate={sessionDate}
        inProgressData={inProgressData}
        isPending={isPending}
        error={error}
        isDemo={isDemo}
        events={events}
        selectedEventId={selectedEventId}
        onBack={() => {
          if (
            typeof document !== 'undefined' &&
            document.referrer &&
            document.referrer.startsWith(window.location.origin)
          ) {
            router.back()
          } else {
            router.push(`/club/${clubId}`)
          }
        }}
        onTogglePlayer={togglePlayer}
        onAddTempPlayer={addTempPlayer}
        onRemoveTempPlayer={removeTempPlayer}
        onAssignModeChange={handleAssignModeChange}
        onGameModeChange={setGameMode}
        onActiveCourtsChange={setActiveCourts}
        onSessionDateChange={setSessionDate}
        onStartGame={handleStartGame}
        onEventSelect={handleEventSelect}
        onResume={handleResumeGame}
      />
    )
  }

  // phase === 'playing'
  return (
    <>
      <PlayingPhase
        courts={courts}
        playerMap={playerMap}
        elapsed={elapsed}
        isPending={isPending}
        error={error}
        dialog={dialog}
        gameMode={gameMode}
        kingStreaks={kingStreaks}
        membershipId={membership.id}
        clubName={clubName}
        sessionDate={sessionDate}
        assignMode={assignMode}
        onAssignModeChange={handleAssignModeChange}
        matchPointTarget={matchPointTarget}
        onOpenCustomPick={handleOpenCustomPick}
        customPickCourt={customPickCourt}
        onCustomAssign={handleCustomAssign}
        onCancelCustomPick={() => setCustomPickCourt(null)}
        onDialogCancel={() => setDialog(null)}
        onEndGame={handleEndGame}
        onDeleteGame={handleDeleteGame}
        onAssignCourt={handleAssignCourt}
        onScoreChange={handleScoreChange}
        onEndCourt={handleEndCourt}
        onCancelCourt={handleCancelCourt}
        onAddCourt={handleAddCourt}
        onRemoveCourt={handleRemoveCourt}
        onTogglePlayerStatus={handleTogglePlayerStatus}
      />
    </>
  )
}
