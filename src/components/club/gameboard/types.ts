import type { Session, MatchMode } from '@/types/club'

export type Phase = 'idle' | 'setup' | 'playing'
export type SetupSource = 'manual' | 'session'
export type AssignMode = 'random' | 'skill_balance' | 'game_count' | 'smart'
export type GameMode = 'normal' | 'king_of_court'

/** 킹 오브 코트: 플레이어별 연속 승리 수 */
export type KingStreaks = Map<string, number>

/** 파트너 중복 방지를 위한 세션 내 파트너 기록 */
export type PartnerHistory = Map<string, Set<string>>

/** 게임 진행 중 플레이어 상태 */
export interface PlayerEntry {
  memberId: string
  name: string
  skillScore: number
  todayGames: number   // 오늘 세션에서 뛴 경기 수
  waitingSince: number // 대기 시작 시각 (Date.now())
  status: 'waiting' | 'playing'
}

/** 코트 상태 */
export interface CourtEntry {
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

export interface DialogState {
  title: string
  description: string
  confirmText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
}

// 'smart' 모드는 DB에서 'game_count' 로 저장 (순수 프론트 기능)
export const ASSIGN_MODE_MAP: Record<AssignMode, MatchMode> = {
  random: 'random',
  skill_balance: 'skill_balance',
  game_count: 'game_count',
  smart: 'game_count',
}

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** Fisher-Yates 셔플 (Math.random() sort 편향 제거) */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 두 팀의 파트너 중복 횟수를 계산합니다.
 * 같은 팀으로 이미 뛴 적 있는 쌍의 수를 반환합니다.
 */
function countPartnerConflicts(
  teamA: PlayerEntry[],
  teamB: PlayerEntry[],
  history: PartnerHistory
): number {
  let conflicts = 0
  for (const team of [teamA, teamB]) {
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        if (history.get(team[i].memberId)?.has(team[j].memberId)) conflicts++
      }
    }
  }
  return conflicts
}

/**
 * 스마트 배정: 대기 우선순위(게임수 적은 순 → 대기시간 긴 순) + 파트너 중복 최소화.
 * 4명 중 가능한 3가지 팀 구성을 시도해 파트너 충돌이 가장 적은 조합을 선택합니다.
 */
function smartPickTeams(
  waiting: PlayerEntry[],
  partnerHistory: PartnerHistory
): [PlayerEntry[], PlayerEntry[]] | null {
  if (waiting.length < 4) return null

  // 1. 대기 우선순위 정렬
  const sorted = [...waiting].sort(
    (a, b) => a.todayGames - b.todayGames || a.waitingSince - b.waitingSince
  )
  const top4 = sorted.slice(0, 4)

  // 2. 가능한 3가지 팀 구성 시도
  const pairings: [number, number, number, number][] = [
    [0, 1, 2, 3],  // [top4[0],top4[1]] vs [top4[2],top4[3]]
    [0, 2, 1, 3],  // [top4[0],top4[2]] vs [top4[1],top4[3]]
    [0, 3, 1, 2],  // [top4[0],top4[3]] vs [top4[1],top4[2]]
  ]

  let best: [PlayerEntry[], PlayerEntry[]] = [[top4[0], top4[1]], [top4[2], top4[3]]]
  let minConflicts = Infinity

  for (const [a0, a1, b0, b1] of pairings) {
    const teamA = [top4[a0], top4[a1]]
    const teamB = [top4[b0], top4[b1]]
    const conflicts = countPartnerConflicts(teamA, teamB, partnerHistory)
    if (conflicts < minConflicts) {
      minConflicts = conflicts
      best = [teamA, teamB]
    }
    if (conflicts === 0) break // 충돌 없음 — 더 탐색 불필요
  }

  return best
}

/**
 * 경기 종료 후 파트너 기록을 갱신합니다.
 * 같은 팀이었던 두 선수를 서로의 파트너 이력에 추가합니다.
 */
export function updatePartnerHistory(
  history: PartnerHistory,
  teamA: string[],
  teamB: string[]
): PartnerHistory {
  const next = new Map(history)

  for (const team of [teamA, teamB]) {
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        const a = team[i], b = team[j]
        if (!next.has(a)) next.set(a, new Set())
        if (!next.has(b)) next.set(b, new Set())
        next.get(a)!.add(b)
        next.get(b)!.add(a)
      }
    }
  }

  return next
}

/**
 * 대기 중인 플레이어 4명을 선발해 팀 A / B 로 나눕니다.
 *
 * - skill_balance: [1위,4위] vs [2위,3위] (스네이크 분배)
 * - game_count:    게임수 적은 순 → 대기시간 긴 순
 * - random:        Fisher-Yates 무작위
 * - smart:         game_count 우선순위 + 파트너 중복 최소화 (partnerHistory 필요)
 */
export function pickTeams(
  waiting: PlayerEntry[],
  mode: AssignMode,
  partnerHistory?: PartnerHistory
): [PlayerEntry[], PlayerEntry[]] | null {
  if (waiting.length < 4) return null

  if (mode === 'smart') {
    return smartPickTeams(waiting, partnerHistory ?? new Map())
  }

  let sorted: PlayerEntry[]
  if (mode === 'random') {
    sorted = fisherYatesShuffle(waiting)
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
