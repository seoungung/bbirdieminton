'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ClubMemberWithUser, PlayerStats, Session, MatchMode } from '@/types/club'
import { Plus, Check, ChevronDown, AlertCircle, ArrowLeft, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { updatePlayerStatsForMatch } from '@/app/club/[clubId]/ranking/actions'

/* ─────────────────────────────────────────
   타입 정의
───────────────────────────────────────── */

type Phase = 'idle' | 'setup' | 'playing'
type SetupSource = 'manual' | 'session'
type AssignMode = 'random' | 'skill_balance' | 'game_count'

/** 게임 진행 중 플레이어 상태 */
interface PlayerEntry {
  memberId: string
  name: string
  skillScore: number
  todayGames: number   // 오늘 세션에서 뛴 경기 수
  waitingSince: number // 대기 시작 시각 (Date.now())
  status: 'waiting' | 'playing'
}

/** 코트 상태 */
interface CourtEntry {
  courtIndex: number
  matchDbId: string | null
  teamA: string[]  // member IDs
  teamB: string[]
  scoreA: number
  scoreB: number
  startedAt: number  // Date.now() when match started
  isSaving: boolean
}

export interface RecentSessionData {
  session: Session
  memberIds: string[]
  attendeeCount: number
}

export interface InProgressData {
  sessionId: string
  sessionDate: string
  matches: Array<{
    id: string
    court_number: number
    team_a_score: number | null
    team_b_score: number | null
    players: Array<{ member_id: string; team: string }>
  }>
  attendeeMemberIds: string[]
}

interface Props {
  clubId: string
  courtCount: number
  members: ClubMemberWithUser[]
  stats: PlayerStats[]
  recentSessions: RecentSessionData[]
  membership: { id: string; role: string }
  inProgressData?: InProgressData | null
}

/* ─────────────────────────────────────────
   유틸 함수
───────────────────────────────────────── */

function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/**
 * 대기 중인 플레이어 4명을 선발해 팀 A / B 로 나눕니다.
 * skill_balance: [1위,4위] vs [2위,3위] (스네이크 분배)
 * game_count: 게임수 적은 순 → 대기시간 긴 순
 * random: 무작위
 */
function pickTeams(
  waiting: PlayerEntry[],
  mode: AssignMode
): [PlayerEntry[], PlayerEntry[]] | null {
  if (waiting.length < 4) return null

  let sorted: PlayerEntry[]
  if (mode === 'random') {
    sorted = [...waiting].sort(() => Math.random() - 0.5)
  } else if (mode === 'skill_balance') {
    sorted = [...waiting].sort((a, b) => b.skillScore - a.skillScore)
  } else {
    // game_count
    sorted = [...waiting].sort(
      (a, b) => a.todayGames - b.todayGames || a.waitingSince - b.waitingSince
    )
  }

  const top4 = sorted.slice(0, 4)
  if (mode === 'skill_balance') {
    // 스네이크: [1등,4등] vs [2등,3등]
    return [[top4[0], top4[3]], [top4[1], top4[2]]]
  }
  return [[top4[0], top4[1]], [top4[2], top4[3]]]
}

const ASSIGN_MODE_MAP: Record<AssignMode, MatchMode> = {
  random: 'random',
  skill_balance: 'skill_balance',
  game_count: 'game_count',
}

/* ─────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────── */

export function GameBoardClient({
  clubId,
  courtCount,
  members,
  stats,
  recentSessions,
  membership,
  inProgressData,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [defaultAssignMode, setDefaultAssignMode] = useState<AssignMode>('random')

  /* 페이즈 */
  const [phase, setPhase] = useState<Phase>('idle')

  /* Setup 상태 */
  const [setupSource, setSetupSource] = useState<SetupSource>('manual')
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0)
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())
  const [assignMode, setAssignMode] = useState<AssignMode>('random')

  /* 임시 참가자 */
  const [tempPlayers, setTempPlayers] = useState<Array<{ id: string; name: string }>>([])
  const [tempInput, setTempInput] = useState('')

  /* Playing 상태 */
  const [sessionDbId, setSessionDbId] = useState<string | null>(null)
  const [playerMap, setPlayerMap] = useState<Map<string, PlayerEntry>>(new Map())
  const [courts, setCourts] = useState<CourtEntry[]>([])
  const [gameStartedAt, setGameStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [dialog, setDialog] = useState<{
    title: string
    description: string
    confirmText?: string
    variant?: 'default' | 'destructive'
    onConfirm: () => void
  } | null>(null)

  /* 게임 진행 중 타이머 */
  useEffect(() => {
    // gameStartedAt === 0 방어: 배치 업데이트 타이밍에서 비정상 elapsed 방지
    if (phase === 'playing' && gameStartedAt > 0) {
      timerRef.current = setInterval(
        () => setElapsed(Date.now() - gameStartedAt),
        1000
      )
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, gameStartedAt])

  /* 참가자 소스 변경 */
  const handleSourceChange = useCallback(
    (src: SetupSource) => {
      setSetupSource(src)
      if (src === 'session' && recentSessions.length > 0) {
        setSelectedPlayers(new Set(recentSessions[0].memberIds))
        setSelectedSessionIdx(0)
      } else {
        setSelectedPlayers(new Set())
      }
    },
    [recentSessions]
  )

  /* 정기모임 세션 선택 */
  const handleSessionSelect = (idx: number) => {
    setSelectedSessionIdx(idx)
    setSelectedPlayers(new Set(recentSessions[idx].memberIds))
  }

  /* 플레이어 토글 */
  const togglePlayer = (memberId: string) =>
    setSelectedPlayers((prev) => {
      const next = new Set(prev)
      next.has(memberId) ? next.delete(memberId) : next.add(memberId)
      return next
    })

  /* 임시 참가자 추가 */
  const addTempPlayer = () => {
    const name = tempInput.trim()
    if (!name) return
    const id = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setTempPlayers(prev => [...prev, { id, name }])
    setSelectedPlayers(prev => { const n = new Set(prev); n.add(id); return n })
    setTempInput('')
  }

  const removeTempPlayer = (id: string) => {
    setTempPlayers(prev => prev.filter(p => p.id !== id))
    setSelectedPlayers(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  /* ── 세션 재개 ──────────────────────────── */
  const handleResumeGame = () => {
    if (!inProgressData) return
    const now = Date.now()

    // 출석자 → playerMap 초기화 (모두 대기 상태)
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

    // 코트 초기화
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

    // 점수 미저장 매치 → 코트 복원
    for (const match of inProgressData.matches) {
      const isActive = match.team_a_score === null
      if (!isActive) continue
      const idx = match.court_number - 1
      if (idx < 0 || idx >= newCourts.length) continue

      const teamA = match.players.filter((p) => p.team === 'A').map((p) => p.member_id)
      const teamB = match.players.filter((p) => p.team === 'B').map((p) => p.member_id)

      newCourts[idx] = {
        ...newCourts[idx],
        matchDbId: match.id,
        teamA,
        teamB,
        scoreA: 0,
        scoreB: 0,
        startedAt: now,
      }

      // playing 상태로 변경
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

  /* ── 게임 시작 ──────────────────────────── */
  const handleStartGame = () => {
    if (selectedPlayers.size < 4) return
    setError(null)

    // 현재 시점 값 캡처 (closure 안전)
    const capturedPlayers = new Set(selectedPlayers)
    const capturedMode = assignMode

    startTransition(async () => {
      try {
        const supabase = createClient()

        /* 1. 플레이어 맵 구성 */
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

        // 임시 참가자 추가
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

        /* 2. 빈 코트 초기화 */
        const initCourts: CourtEntry[] = Array.from({ length: courtCount }, (_, i) => ({
          courtIndex: i,
          matchDbId: null,
          teamA: [],
          teamB: [],
          scoreA: 0,
          scoreB: 0,
          startedAt: 0,
          isSaving: false,
        }))

        /* 3. 코트마다 팀 사전 배정 (RPC 전달용 payload 동시 구성) */
        const finalCourts = [...initCourts]
        const finalPlayerMap = new Map(newPlayerMap)
        const courtsPayload: Array<{
          court_number: number
          team_a: string[]
          team_b: string[]
          excluded: boolean
        }> = []

        for (let i = 0; i < courtCount; i++) {
          const waiting = Array.from(finalPlayerMap.values()).filter(
            (p) => p.status === 'waiting'
          )
          const result = pickTeams(waiting, capturedMode)
          if (!result) break

          const [teamA, teamB] = result

          // RPC payload: 임시 참가자(temp-)는 UUID가 아니므로 제외
          const hasTempPlayer = [...teamA, ...teamB].some(p => p.memberId.startsWith('temp-'))
          courtsPayload.push({
            court_number: i + 1,
            team_a: teamA.filter(p => !p.memberId.startsWith('temp-')).map(p => p.memberId),
            team_b: teamB.filter(p => !p.memberId.startsWith('temp-')).map(p => p.memberId),
            excluded: hasTempPlayer,
          })

          finalCourts[i] = {
            ...initCourts[i],
            matchDbId: null,  // RPC 결과 조회 후 채움
            teamA: teamA.map((p) => p.memberId),
            teamB: teamB.map((p) => p.memberId),
            startedAt: Date.now(),
          }
          for (const p of [...teamA, ...teamB]) {
            finalPlayerMap.set(p.memberId, { ...p, status: 'playing' })
          }
        }

        /* 4. RPC: 세션 + 출석 + 매치 + 플레이어 원자적 생성 */
        const realAttendees = Array.from(capturedPlayers).filter(id => !id.startsWith('temp-'))
        const { data: sessionId, error: rpcErr } = await supabase.rpc('start_game_session', {
          p_club_id: clubId,
          p_session_date: new Date().toISOString().split('T')[0],
          p_match_mode: ASSIGN_MODE_MAP[capturedMode],
          p_notes: null,
          p_created_by: membership.id,
          p_attendees_json: realAttendees,
          p_courts_json: courtsPayload,
        })
        if (rpcErr || !sessionId)
          throw new Error(rpcErr?.message ?? '세션 생성 실패')

        /* 5. 세션 상태를 in_progress 로 업데이트 (RPC는 'open'으로 생성) */
        await supabase.from('sessions').update({ status: 'in_progress' }).eq('id', sessionId)

        /* 6. 생성된 매치 ID 조회 → finalCourts.matchDbId 채우기 */
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

        /* 7. 상태 일괄 반영 */
        const startTime = Date.now()
        setSessionDbId(sessionId)
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

  /* ── 코트 배정 ──────────────────────────── */
  const handleAssignCourt = (courtIndex: number) => {
    if (!sessionDbId) return
    setError(null)

    // 현재 시점 값 캡처
    const capturedMap = playerMap
    const capturedMode = assignMode
    const capturedSessionId = sessionDbId

    startTransition(async () => {
      const waiting = Array.from(capturedMap.values()).filter((p) => p.status === 'waiting')
      const result = pickTeams(waiting, capturedMode)
      if (!result) { setError('대기 인원이 부족합니다 (4명 이상 필요)'); return }

      const [teamA, teamB] = result
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

      setCourts((prev) =>
        prev.map((c, i) =>
          i !== courtIndex
            ? c
            : {
                ...c,
                matchDbId: match.id,
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
    })
  }

  /* ── 점수 변경 ──────────────────────────── */
  const handleScoreChange = (courtIndex: number, team: 'A' | 'B', delta: number) => {
    setCourts((prev) =>
      prev.map((c, i) => {
        if (i !== courtIndex) return c
        return team === 'A'
          ? { ...c, scoreA: Math.max(0, c.scoreA + delta) }
          : { ...c, scoreB: Math.max(0, c.scoreB + delta) }
      })
    )
  }

  /* ── 경기 종료 (코트 단위) ───────────────── */
  const handleEndCourt = (courtIndex: number) => {
    const court = courts[courtIndex]
    if (!court.matchDbId || court.isSaving) return

    // 로컬 점수 캡처
    const { matchDbId, scoreA, scoreB, teamA, teamB } = court

    setCourts((prev) =>
      prev.map((c, i) => (i === courtIndex ? { ...c, isSaving: true } : c))
    )

    startTransition(async () => {
      const supabase = createClient()
      const { error: updateErr } = await supabase
        .from('matches')
        .update({ team_a_score: scoreA, team_b_score: scoreB })
        .eq('id', matchDbId)

      if (updateErr) {
        setError('점수 저장에 실패했습니다')
        setCourts((prev) =>
          prev.map((c, i) => (i === courtIndex ? { ...c, isSaving: false } : c))
        )
        return
      }

      // 스탯 업데이트 (fire-and-forget: 실패해도 게임은 계속)
      updatePlayerStatsForMatch(matchDbId, clubId, null, null, scoreA, scoreB).catch(console.error)

      // 선수 대기열 복귀
      const now = Date.now()
      setPlayerMap((prev) => {
        const next = new Map(prev)
        for (const memberId of [...teamA, ...teamB]) {
          const p = next.get(memberId)
          if (!p) continue
          next.set(memberId, {
            ...p,
            status: 'waiting',
            todayGames: p.todayGames + 1,
            waitingSince: now,
          })
        }
        return next
      })

      // 코트 초기화
      setCourts((prev) =>
        prev.map((c, i) =>
          i === courtIndex
            ? {
                ...c,
                matchDbId: null,
                teamA: [],
                teamB: [],
                scoreA: 0,
                scoreB: 0,
                startedAt: 0,
                isSaving: false,
              }
            : c
        )
      )
    })
  }

  /* ── 코트 경기 취소 (점수 미저장) ──────────── */
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
          const supabase = createClient()
          if (matchDbId) {
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

  /* ── 게임 전체 종료 ─────────────────────── */
  const handleEndGame = () => {
    if (!sessionDbId) return
    const capturedCourts = courts
    const capturedSessionId = sessionDbId

    startTransition(async () => {
      const supabase = createClient()

      // 아직 진행 중인 코트 점수 저장
      for (const court of capturedCourts) {
        if (court.matchDbId && court.teamA.length > 0) {
          await supabase
            .from('matches')
            .update({ team_a_score: court.scoreA, team_b_score: court.scoreB })
            .eq('id', court.matchDbId)
        }
      }

      // 세션 닫기
      await supabase
        .from('sessions')
        .update({ status: 'closed' })
        .eq('id', capturedSessionId)

      setPhase('idle')
      setSessionDbId(null)
      setPlayerMap(new Map())
      setCourts([])
      router.refresh()
    })
  }

  /* ── 게임 전체 삭제 ─────────────────────── */
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
          if (capturedSessionId) {
            const supabase = createClient()
            const { data: matches } = await supabase.from('matches').select('id').eq('session_id', capturedSessionId)
            for (const m of matches ?? []) {
              await supabase.from('match_players').delete().eq('match_id', m.id)
            }
            await supabase.from('matches').delete().eq('session_id', capturedSessionId)
            await supabase.from('attendances').delete().eq('session_id', capturedSessionId)
            await supabase.from('sessions').delete().eq('id', capturedSessionId)
          }

          setPhase('idle')
          setSessionDbId(null)
          setPlayerMap(new Map())
          setCourts([])
          setGameStartedAt(0)
          router.refresh()
        })
      },
    })
  }

  /* ═══════════════════════════════════════
     IDLE 화면
  ═══════════════════════════════════════ */
  if (phase === 'idle') {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
        <div className="max-w-[1088px] mx-auto px-4 pt-6 pb-6">
          {/* 설정 버튼 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-extrabold text-[#111]">게임보드</h1>
              <p className="text-sm text-[#999]">실시간으로 코트를 관리하고 경기를 진행하세요</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#e5e5e5] bg-white text-[#555] hover:border-[#beff00] hover:text-[#111] transition-colors"
            >
              <Settings size={17} />
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* 새 게임 만들기 */}
          <button
            onClick={() => { setError(null); setAssignMode(defaultAssignMode); setPhase('setup') }}
            className="w-full bg-[#0a0a0a] text-white rounded-2xl p-6 flex items-center justify-between hover:bg-[#1a1a1a] active:scale-[0.99] transition-all mb-5"
          >
            <div className="text-left">
              <p className="text-lg font-extrabold mb-1">🏸 새 게임 만들기</p>
              <p className="text-sm text-white/50">참가자를 선택하고 바로 시작</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#beff00] flex items-center justify-center shrink-0">
              <Plus size={20} className="text-[#111]" />
            </div>
          </button>

          {/* 진행 중인 게임 재개 */}
          {inProgressData && (
            <div className="mb-5 bg-[#fff8e1] border border-[#ffe082] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#b8860b]">⚡ 진행 중인 게임 있음</p>
                <p className="text-xs text-[#b8860b]/80 mt-0.5">
                  {new Date(inProgressData.sessionDate).toLocaleDateString('ko-KR', {
                    month: 'long', day: 'numeric', weekday: 'short',
                  })} · {inProgressData.attendeeMemberIds.length}명 참여
                </p>
              </div>
              <button
                onClick={handleResumeGame}
                className="px-4 py-2 bg-[#b8860b] text-white text-sm font-bold rounded-xl hover:bg-[#9a7209] transition-colors shrink-0 ml-3"
              >
                계속하기
              </button>
            </div>
          )}

          {/* 최근 게임 기록 */}
          {recentSessions.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-[#999] mb-3">최근 게임 기록</p>
              <div className="space-y-2">
                {recentSessions.map(({ session, attendeeCount }) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#111]">
                        {new Date(session.session_date).toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </p>
                      <p className="text-xs text-[#999] mt-0.5">{attendeeCount}명 참여</p>
                    </div>
                    <span className="text-xs text-[#ccc]">종료됨</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-14 text-[#ccc]">
              <p className="text-5xl mb-3">🏸</p>
              <p className="text-sm font-semibold">아직 게임 기록이 없어요</p>
              <p className="text-xs mt-1.5">새 게임을 만들어 시작해보세요!</p>
            </div>
          )}

          {/* 설정 패널 */}
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
              <div className="bg-white rounded-t-3xl w-full max-w-lg pb-safe">
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#f0f0f0]">
                  <h3 className="font-bold text-[#111] text-base">게임보드 설정</h3>
                  <button onClick={() => setShowSettings(false)} className="text-[#bbb] hover:text-[#555]">
                    <X size={20} />
                  </button>
                </div>
                <div className="px-5 py-5 space-y-5">
                  {/* 기본 팀 배정 방식 */}
                  <div>
                    <p className="text-xs font-bold text-[#999] mb-2">기본 팀 배정 방식</p>
                    <p className="text-xs text-[#bbb] mb-3">새 게임 시작 시 자동으로 선택돼요</p>
                    <div className="space-y-2">
                      {([
                        { value: 'random', label: '랜덤', desc: '완전 무작위로 팀을 구성해요' },
                        { value: 'skill_balance', label: '실력 균형', desc: '실력 점수 기반 스네이크 분배' },
                        { value: 'game_count', label: '게임수 균등', desc: '게임 적게 한 플레이어 우선 배정' },
                      ] as { value: AssignMode; label: string; desc: string }[]).map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setDefaultAssignMode(opt.value)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                            defaultAssignMode === opt.value
                              ? 'border-[#111] bg-[#f8f8f8]'
                              : 'border-[#e5e5e5] hover:border-[#ccc]'
                          }`}
                        >
                          <div className="text-left">
                            <p className={`text-sm font-semibold ${defaultAssignMode === opt.value ? 'text-[#111]' : 'text-[#555]'}`}>{opt.label}</p>
                            <p className="text-xs text-[#999] mt-0.5">{opt.desc}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            defaultAssignMode === opt.value ? 'border-[#111] bg-[#111]' : 'border-[#ddd]'
                          }`}>
                            {defaultAssignMode === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 코트 정보 */}
                  <div>
                    <p className="text-xs font-bold text-[#999] mb-2">코트 정보</p>
                    <div className="bg-[#f8f8f8] rounded-xl px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-[#555]">등록된 코트 수</span>
                      <span className="text-sm font-bold text-[#111]">{courtCount}면</span>
                    </div>
                    <p className="text-xs text-[#bbb] mt-2">코트 수는 모임 설정에서 변경할 수 있어요</p>
                  </div>

                  {/* 임시 참가자 안내 */}
                  <div>
                    <p className="text-xs font-bold text-[#999] mb-2">임시 참가자</p>
                    <div className="bg-[#f8f8f8] rounded-xl px-4 py-3">
                      <p className="text-sm text-[#555]">게임 설정 화면에서 이름을 입력해</p>
                      <p className="text-sm text-[#555]">클럽 외 인원도 참여시킬 수 있어요</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-6">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full py-3.5 bg-[#0a0a0a] text-white font-bold text-sm rounded-xl hover:bg-[#1a1a1a] transition-colors"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════
     SETUP 화면
  ═══════════════════════════════════════ */
  if (phase === 'setup') {
    const selectedCount = selectedPlayers.size
    const canStart = selectedCount >= 4

    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#e5e5e5]">
          <div className="max-w-[1088px] mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setPhase('idle')}
              className="flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">뒤로</span>
            </button>
            <span className="text-base font-bold text-[#111]">게임 설정</span>
            <div className="w-16" />
          </div>
        </div>

        <div className="max-w-[1088px] mx-auto px-4 py-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* 참가자 설정 방식 */}
          <div>
            <p className="text-xs font-semibold text-[#999] mb-2">참가자 설정</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSourceChange('manual')}
                className={cn(
                  'flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-colors',
                  setupSource === 'manual'
                    ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                    : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
                )}
              >
                직접 선택
              </button>
              <button
                onClick={() => handleSourceChange('session')}
                disabled={recentSessions.length === 0}
                className={cn(
                  'flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-colors disabled:opacity-40',
                  setupSource === 'session'
                    ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                    : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
                )}
              >
                정기모임 불러오기
              </button>
            </div>
          </div>

          {/* 정기모임 선택 드롭다운 */}
          {setupSource === 'session' && recentSessions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#999] mb-2">모임 선택</p>
              <div className="relative">
                <select
                  value={selectedSessionIdx}
                  onChange={(e) => handleSessionSelect(Number(e.target.value))}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] appearance-none focus:outline-none focus:border-[#beff00] transition-colors"
                >
                  {recentSessions.map(({ session, attendeeCount }, idx) => (
                    <option key={session.id} value={idx}>
                      {new Date(session.session_date).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}{' '}
                      ({attendeeCount}명)
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none"
                />
              </div>
            </div>
          )}

          {/* 멤버 선택 그리드 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#999]">참가자 선택</p>
              <p className="text-xs text-[#999]">
                <span className={cn('font-bold', canStart ? 'text-[#111]' : 'text-[#bbb]')}>
                  {selectedCount}
                </span>
                /{members.length}명
              </p>
            </div>

            {members.length === 0 ? (
              <p className="text-sm text-[#bbb] text-center py-6">
                모임에 멤버가 없어요
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {members.map((member) => {
                  const isOn = selectedPlayers.has(member.id)
                  return (
                    <button
                      key={member.id}
                      onClick={() => togglePlayer(member.id)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors',
                        isOn
                          ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                          : 'bg-white border-[#e5e5e5] text-[#111] hover:border-[#beff00]'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                          isOn ? 'bg-[#beff00] border-[#beff00]' : 'border-[#ccc]'
                        )}
                      >
                        {isOn && (
                          <Check size={9} className="text-[#111]" strokeWidth={3} />
                        )}
                      </div>
                      <span className="text-sm font-semibold truncate">
                        {member.user?.name ?? '?'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {!canStart && selectedCount > 0 && (
              <p className="text-xs text-[#aaa] mt-2 text-center">
                최소 4명 이상 선택해주세요
              </p>
            )}
          </div>

          {/* 임시 참가자 추가 */}
          <div>
            <p className="text-xs font-semibold text-[#999] mb-2">임시 참가자 <span className="text-[#bbb] font-normal">(클럽 외 인원)</span></p>
            <div className="flex gap-2 mb-2">
              <input
                value={tempInput}
                onChange={e => setTempInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTempPlayer()}
                placeholder="이름 입력 후 추가"
                maxLength={10}
                className="flex-1 border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
              />
              <button
                onClick={addTempPlayer}
                disabled={!tempInput.trim()}
                className="px-4 py-2.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-xl hover:bg-[#1a1a1a] disabled:opacity-40 transition-colors"
              >
                추가
              </button>
            </div>
            {tempPlayers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tempPlayers.map(p => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer select-none ${
                      selectedPlayers.has(p.id)
                        ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                        : 'bg-white border-[#e5e5e5] text-[#555]'
                    }`}
                    onClick={() => togglePlayer(p.id)}
                  >
                    {p.name}
                    <button
                      onClick={e => { e.stopPropagation(); removeTempPlayer(p.id) }}
                      className="text-current opacity-50 hover:opacity-100 ml-0.5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 팀 배정 방식 */}
          <div>
            <p className="text-xs font-semibold text-[#999] mb-2">팀 배정 방식</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: 'random',        label: '랜덤',      emoji: '🎲', desc: '무작위 배정' },
                  { value: 'skill_balance', label: '실력 균등', emoji: '⚖️', desc: '실력 점수 기반' },
                  { value: 'game_count',    label: '게임수 균등', emoji: '🔢', desc: '최소 게임수 우선' },
                ] as { value: AssignMode; label: string; emoji: string; desc: string }[]
              ).map(({ value, label, emoji, desc }) => (
                <button
                  key={value}
                  onClick={() => setAssignMode(value)}
                  className={cn(
                    'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-colors',
                    assignMode === value
                      ? 'bg-[#beff00] border-[#beff00] text-[#111]'
                      : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#beff00]'
                  )}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-[11px] font-bold leading-none">{label}</span>
                  <span className="text-[10px] text-[#999] leading-tight">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 코트 수 표시 */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#555]">코트 수</span>
            <span className="text-sm font-bold text-[#111]">{courtCount}개</span>
          </div>

          {/* 게임 시작 버튼 */}
          <button
            onClick={handleStartGame}
            disabled={!canStart || isPending}
            className="w-full py-4 bg-[#beff00] text-[#111] font-extrabold text-base rounded-2xl hover:brightness-95 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
                게임 시작 중...
              </span>
            ) : !canStart ? (
              `4명 이상 선택 필요 (현재 ${selectedCount}명)`
            ) : (
              `🏸 ${selectedCount}명으로 게임 시작`
            )}
          </button>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════
     PLAYING 화면
  ═══════════════════════════════════════ */
  const waitingPlayers = Array.from(playerMap.values())
    .filter((p) => p.status === 'waiting')
    .sort((a, b) => a.todayGames - b.todayGames || a.waitingSince - b.waitingSince)

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 상단 고정 헤더 */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]">
        <div className="max-w-[1088px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#beff00]">🏸</span>
            <span className="text-white font-bold text-sm">게임 진행 중</span>
            <span className="text-white/40 text-xs font-mono tabular-nums">
              {formatDuration(elapsed)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteGame}
              disabled={isPending}
              className="text-xs px-3 py-1.5 border border-white/20 text-white/50 rounded-xl hover:border-red-400/40 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              삭제
            </button>
            <button
              onClick={handleEndGame}
              disabled={isPending}
              className="text-xs px-3 py-1.5 bg-[#beff00] text-[#111] font-semibold rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
            >
              게임 마감
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1088px] mx-auto px-4 py-4 space-y-3">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* 코트 카드 */}
        {courts.map((court) => {
          const isEmpty = court.teamA.length === 0
          const canAssign = isEmpty && waitingPlayers.length >= 4
          const courtElapsed =
            court.startedAt > 0 ? Date.now() - court.startedAt : 0

          return (
            <div
              key={court.courtIndex}
              className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden"
            >
              {/* 코트 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#f8f8f8] border-b border-[#e5e5e5]">
                <span className="text-sm font-bold text-[#111]">
                  코트 {court.courtIndex + 1}
                </span>
                {isEmpty ? (
                  canAssign ? (
                    <button
                      onClick={() => handleAssignCourt(court.courtIndex)}
                      disabled={isPending}
                      className="text-xs font-bold px-3 py-1.5 bg-[#beff00] text-[#111] rounded-xl hover:brightness-95 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      다음 경기 배정
                    </button>
                  ) : (
                    <span className="text-xs text-[#bbb]">
                      대기 {waitingPlayers.length}명
                      {waitingPlayers.length < 4 ? ' (4명 필요)' : ''}
                    </span>
                  )
                ) : (
                  <span className="text-[11px] text-[#999] font-mono tabular-nums">
                    {formatDuration(courtElapsed)}
                  </span>
                )}
              </div>

              {/* 코트 내용 */}
              {isEmpty ? (
                <div className="py-8 text-center text-sm text-[#ccc]">
                  비어있음
                </div>
              ) : (
                <div className="p-4">
                  {/* 팀 A */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[10px] font-bold text-blue-500 mb-0.5">팀 A</p>
                      <p className="text-sm font-semibold text-[#111] flex flex-wrap items-center gap-x-1 gap-y-0.5">
                        {court.teamA.map((id, idx) => {
                          const name = playerMap.get(id)?.name ?? '?'
                          const isTemp = id.startsWith('temp-')
                          return (
                            <span key={id} className="inline-flex items-center gap-1">
                              {idx > 0 && <span className="text-[#ccc]">·</span>}
                              {name}
                              {isTemp && (
                                <span className="text-[9px] font-bold text-[#888] bg-[#f0f0f0] rounded px-1 py-0.5 leading-none">
                                  기록 안됨
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleScoreChange(court.courtIndex, 'A', -1)}
                        className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#555] font-bold hover:bg-[#e5e5e5] active:scale-90 transition-all select-none"
                      >
                        −
                      </button>
                      <span className="text-2xl font-extrabold text-[#111] w-9 text-center tabular-nums">
                        {court.scoreA}
                      </span>
                      <button
                        onClick={() => handleScoreChange(court.courtIndex, 'A', 1)}
                        className="w-8 h-8 rounded-full bg-[#beff00] flex items-center justify-center text-[#111] font-bold hover:brightness-95 active:scale-90 transition-all select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* VS 구분선 */}
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-[#f0f0f0]" />
                    <span className="text-[11px] font-extrabold text-[#ccc]">VS</span>
                    <div className="flex-1 h-px bg-[#f0f0f0]" />
                  </div>

                  {/* 팀 B */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[10px] font-bold text-red-400 mb-0.5">팀 B</p>
                      <p className="text-sm font-semibold text-[#111] flex flex-wrap items-center gap-x-1 gap-y-0.5">
                        {court.teamB.map((id, idx) => {
                          const name = playerMap.get(id)?.name ?? '?'
                          const isTemp = id.startsWith('temp-')
                          return (
                            <span key={id} className="inline-flex items-center gap-1">
                              {idx > 0 && <span className="text-[#ccc]">·</span>}
                              {name}
                              {isTemp && (
                                <span className="text-[9px] font-bold text-[#888] bg-[#f0f0f0] rounded px-1 py-0.5 leading-none">
                                  기록 안됨
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleScoreChange(court.courtIndex, 'B', -1)}
                        className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#555] font-bold hover:bg-[#e5e5e5] active:scale-90 transition-all select-none"
                      >
                        −
                      </button>
                      <span className="text-2xl font-extrabold text-[#111] w-9 text-center tabular-nums">
                        {court.scoreB}
                      </span>
                      <button
                        onClick={() => handleScoreChange(court.courtIndex, 'B', 1)}
                        className="w-8 h-8 rounded-full bg-[#beff00] flex items-center justify-center text-[#111] font-bold hover:brightness-95 active:scale-90 transition-all select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 경기 액션 버튼 */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleCancelCourt(court.courtIndex)}
                      disabled={court.isSaving || isPending}
                      className="flex-1 py-2.5 text-sm font-semibold border border-[#e5e5e5] text-[#999] rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-400 active:scale-[0.99] disabled:opacity-50 transition-all"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleEndCourt(court.courtIndex)}
                      disabled={court.isSaving || isPending}
                      className="flex-[2] py-2.5 text-sm font-semibold border border-[#e5e5e5] text-[#555] rounded-xl hover:bg-[#f8f8f8] active:bg-[#f0f0f0] disabled:opacity-50 transition-colors"
                    >
                      {court.isSaving ? '저장 중...' : '완료 →'}
                    </button>
                  </div>

                  {/* 임시 참가자 포함 안내 */}
                  {[...court.teamA, ...court.teamB].some(id => id.startsWith('temp-')) && (
                    <p className="text-[10px] text-[#999] mt-2 text-center">
                      임시 참가자 포함 경기 — 랭킹에 반영되지 않아요
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* 대기열 */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-[#111]">대기 중</span>
            <span className="text-[11px] font-bold text-white bg-[#0a0a0a] px-1.5 py-0.5 rounded-full leading-none">
              {waitingPlayers.length}
            </span>
          </div>

          {waitingPlayers.length === 0 ? (
            <p className="text-sm text-[#ccc] text-center py-3">
              모든 플레이어가 경기 중이에요
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {waitingPlayers.map((p) => (
                <div
                  key={p.memberId}
                  className="flex items-center gap-1.5 bg-[#f8f8f8] border border-[#e5e5e5] rounded-full px-3 py-1.5"
                >
                  <span className="text-xs font-semibold text-[#111]">{p.name}</span>
                  <span className="text-[10px] text-[#aaa] bg-white border border-[#e5e5e5] rounded-full px-1.5 py-0.5">
                    {p.todayGames}경기
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {dialog && (
        <ConfirmDialog
          open
          title={dialog.title}
          description={dialog.description}
          confirmText={dialog.confirmText}
          variant={dialog.variant}
          onConfirm={dialog.onConfirm}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  )
}
