'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ClubMemberWithUser, PlayerStats } from '@/types/club'
import { updatePlayerStatsForMatch } from '@/app/club/[clubId]/ranking/actions'
import {
  type Phase,
  type SetupSource,
  type AssignMode,
  type GameMode,
  type PlayerEntry,
  type CourtEntry,
  type DialogState,
  type RecentSessionData,
  type InProgressData,
  type PartnerHistory,
  type KingStreaks,
  ASSIGN_MODE_MAP,
  pickTeams,
  updatePartnerHistory,
} from './gameboard/types'
import { SetupPhase } from './gameboard/SetupPhase'
import { PlayingPhase } from './gameboard/PlayingPhase'

// 하위 호환을 위해 재익스포트
export type { RecentSessionData, InProgressData }

interface Props {
  clubId: string
  courtCount: number
  members: ClubMemberWithUser[]
  stats: PlayerStats[]
  recentSessions: RecentSessionData[]
  membership: { id: string; role: string }
  inProgressData?: InProgressData | null
  /** true 이면 체험 모드 — Supabase DB 쓰기를 모두 건너뜀 */
  isDemo?: boolean
}

export function GameBoardClient({
  clubId,
  courtCount,
  members,
  recentSessions,
  membership,
  inProgressData,
  isDemo = false,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  /* ── 페이즈: idle 제거, setup 이 초기 화면 ── */
  const [phase, setPhase] = useState<Phase>('setup')

  /* ── Setup 상태 ── */
  const [gameMode, setGameMode] = useState<GameMode>('normal')
  const [setupSource, setSetupSource] = useState<SetupSource>('manual')
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0)
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())
  // localStorage 에서 마지막 배정 방식 복원
  const [assignMode, setAssignMode] = useState<AssignMode>(() => {
    if (typeof window === 'undefined') return 'random'
    return (localStorage.getItem(`gameboard-assign-${clubId}`) as AssignMode) || 'random'
  })
  const [tempPlayers, setTempPlayers] = useState<Array<{ id: string; name: string }>>([])
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

  const handleSourceChange = useCallback((src: SetupSource) => {
    setSetupSource(src)
    if (src === 'session' && recentSessions.length > 0) {
      setSelectedPlayers(new Set(recentSessions[0].memberIds))
      setSelectedSessionIdx(0)
    } else {
      setSelectedPlayers(new Set())
    }
  }, [recentSessions])

  const handleSessionSelect = (idx: number) => {
    setSelectedSessionIdx(idx)
    setSelectedPlayers(new Set(recentSessions[idx].memberIds))
  }

  const togglePlayer = (memberId: string) =>
    setSelectedPlayers((prev) => {
      const next = new Set(prev)
      next.has(memberId) ? next.delete(memberId) : next.add(memberId)
      return next
    })

  const addTempPlayer = (name: string) => {
    const id = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setTempPlayers(prev => [...prev, { id, name }])
    setSelectedPlayers(prev => { const n = new Set(prev); n.add(id); return n })
  }

  const removeTempPlayer = (id: string) => {
    setTempPlayers(prev => prev.filter(p => p.id !== id))
    setSelectedPlayers(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  /* ── 세션 재개 ── */
  const handleResumeGame = () => {
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
  }

  /* ── 게임 시작 ── */
  const handleStartGame = () => {
    if (selectedPlayers.size < 4) return
    setError(null)

    const capturedPlayers = new Set(selectedPlayers)
    const capturedMode = assignMode

    startTransition(async () => {
      try {
        const now = Date.now()
        const newPlayerMap = new Map<string, PlayerEntry>()
        for (const memberId of capturedPlayers) {
          const member = members.find((m) => m.id === memberId)
          if (!member) continue
          newPlayerMap.set(memberId, {
            memberId,
            name: member.user?.name ?? '?',
            skillScore: member.skill_score,
            todayGames: 0,
            waitingSince: now,
            status: 'waiting',
          })
        }

        for (const t of tempPlayers) {
          if (!capturedPlayers.has(t.id)) continue
          newPlayerMap.set(t.id, {
            memberId: t.id,
            name: t.name,
            skillScore: 50,
            todayGames: 0,
            waitingSince: now,
            status: 'waiting',
          })
        }

        const initCourts: CourtEntry[] = Array.from({ length: activeCourts }, (_, i) => ({
          courtIndex: i,
          matchDbId: null,
          teamA: [],
          teamB: [],
          scoreA: 0,
          scoreB: 0,
          startedAt: 0,
          isSaving: false,
        }))

        const finalCourts = [...initCourts]
        const finalPlayerMap = new Map(newPlayerMap)
        const courtsPayload: Array<{
          court_number: number
          team_a: string[]
          team_b: string[]
          excluded: boolean
        }> = []

        // 게임 시작 시 파트너 기록 초기화
        setPartnerHistory(new Map())
        let localHistory: PartnerHistory = new Map()

        for (let i = 0; i < activeCourts; i++) {
          const waiting = Array.from(finalPlayerMap.values()).filter((p) => p.status === 'waiting')
          const result = pickTeams(waiting, capturedMode, localHistory)
          if (!result) break

          const [teamA, teamB] = result
          const hasTempPlayer = [...teamA, ...teamB].some(p => p.memberId.startsWith('temp-'))
          courtsPayload.push({
            court_number: i + 1,
            team_a: teamA.filter(p => !p.memberId.startsWith('temp-')).map(p => p.memberId),
            team_b: teamB.filter(p => !p.memberId.startsWith('temp-')).map(p => p.memberId),
            excluded: hasTempPlayer,
          })

          finalCourts[i] = {
            ...initCourts[i],
            matchDbId: null,
            teamA: teamA.map((p) => p.memberId),
            teamB: teamB.map((p) => p.memberId),
            startedAt: Date.now(),
          }
          for (const p of [...teamA, ...teamB]) {
            finalPlayerMap.set(p.memberId, { ...p, status: 'playing' })
          }
          // smart 모드: 초기 배정도 파트너 기록에 반영
          localHistory = updatePartnerHistory(
            localHistory,
            teamA.map(p => p.memberId),
            teamB.map(p => p.memberId)
          )
        }
        setPartnerHistory(localHistory)

        const realAttendees = Array.from(capturedPlayers).filter(id => !id.startsWith('temp-'))

        if (!isDemo) {
          const supabase = createClient()
          const { data: sessionId, error: rpcErr } = await supabase.rpc('start_game_session', {
            p_club_id: clubId,
            p_session_date: sessionDate,
            p_match_mode: ASSIGN_MODE_MAP[capturedMode],
            p_notes: null,
            p_created_by: membership.id,
            p_attendees_json: realAttendees,
            p_courts_json: courtsPayload,
          })
          if (rpcErr || !sessionId) throw new Error(rpcErr?.message ?? '세션 생성 실패')

          await supabase.from('sessions').update({ status: 'in_progress' }).eq('id', sessionId)

          const { data: createdMatches } = await supabase
            .from('matches')
            .select('id, court_number')
            .eq('session_id', sessionId)
            .order('court_number', { ascending: true })

          for (const match of createdMatches ?? []) {
            const idx = match.court_number - 1
            if (finalCourts[idx]) {
              finalCourts[idx] = { ...finalCourts[idx], matchDbId: match.id }
            }
          }
          setSessionDbId(sessionId)
        } else {
          // 체험 모드: 가짜 ID로 로컬 상태만 업데이트
          const ts = Date.now()
          setSessionDbId(`demo-session-${ts}`)
          for (let i = 0; i < finalCourts.length; i++) {
            if (finalCourts[i].teamA.length > 0) {
              finalCourts[i] = { ...finalCourts[i], matchDbId: `demo-match-${i}-${ts}` }
            }
          }
        }

        const startTime = Date.now()
        setPlayerMap(finalPlayerMap)
        setCourts(finalCourts)
        setGameStartedAt(startTime)
        setElapsed(0)
        setPhase('playing')
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      }
    })
  }

  /* ── 코트 배정 ── */
  const handleAssignCourt = (courtIndex: number) => {
    if (!sessionDbId) return
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
        // 21점 최초 도달 시 모바일 진동 피드백
        if (delta > 0) {
          const newScore = team === 'A' ? updated.scoreA : updated.scoreB
          const oldScore = team === 'A' ? c.scoreA : c.scoreB
          if (oldScore < 21 && newScore >= 21) {
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
      confirmText: '취소',
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

  /* ── 게임 전체 종료 ── */
  const handleEndGame = () => {
    if (!sessionDbId) return
    const capturedCourts = courts
    const capturedSessionId = sessionDbId

    startTransition(async () => {
      if (!isDemo) {
        const supabase = createClient()
        for (const court of capturedCourts) {
          if (court.matchDbId && court.teamA.length > 0) {
            await supabase
              .from('matches')
              .update({ team_a_score: court.scoreA, team_b_score: court.scoreB })
              .eq('id', court.matchDbId)
          }
        }
        await supabase.from('sessions').update({ status: 'closed' }).eq('id', capturedSessionId)
      }

      setPhase('setup')
      setSessionDbId(null)
      setPlayerMap(new Map())
      setCourts([])
      setPartnerHistory(new Map())
      setKingStreaks(new Map())
      // 날짜/코트 초기화
      setSessionDate(new Date().toISOString().split('T')[0])
      setActiveCourts(courtCount)
      setSelectedPlayers(new Set())
      setTempPlayers([])
      if (!isDemo) router.refresh()
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

  /* ══════════════════════════════════════
     렌더
  ══════════════════════════════════════ */

  if (phase === 'setup') {
    return (
      <SetupPhase
        members={members}
        recentSessions={recentSessions}
        selectedPlayers={selectedPlayers}
        tempPlayers={tempPlayers}
        setupSource={setupSource}
        selectedSessionIdx={selectedSessionIdx}
        assignMode={assignMode}
        gameMode={gameMode}
        courtCount={courtCount}
        activeCourts={activeCourts}
        maxCourts={courtCount}
        sessionDate={sessionDate}
        inProgressData={inProgressData}
        isPending={isPending}
        error={error}
        onBack={() => {
          if (
            typeof document !== 'undefined' &&
            document.referrer &&
            document.referrer.startsWith(window.location.origin)
          ) {
            router.back()
          } else {
            router.push(`/club/${clubId}/view`)
          }
        }}
        onSourceChange={handleSourceChange}
        onSessionSelect={handleSessionSelect}
        onTogglePlayer={togglePlayer}
        onAddTempPlayer={addTempPlayer}
        onRemoveTempPlayer={removeTempPlayer}
        onAssignModeChange={handleAssignModeChange}
        onGameModeChange={setGameMode}
        onActiveCourtsChange={setActiveCourts}
        onSessionDateChange={setSessionDate}
        onStartGame={handleStartGame}
        onResume={handleResumeGame}
      />
    )
  }

  // phase === 'playing'
  return (
    <PlayingPhase
      courts={courts}
      playerMap={playerMap}
      elapsed={elapsed}
      isPending={isPending}
      error={error}
      dialog={dialog}
      gameMode={gameMode}
      kingStreaks={kingStreaks}
      onDialogCancel={() => setDialog(null)}
      onEndGame={handleEndGame}
      onDeleteGame={handleDeleteGame}
      onAssignCourt={handleAssignCourt}
      onScoreChange={handleScoreChange}
      onEndCourt={handleEndCourt}
      onCancelCourt={handleCancelCourt}
    />
  )
}
