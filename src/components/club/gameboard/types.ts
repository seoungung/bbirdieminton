import type { MatchMode } from '@/types/club'

/** session_guests 행의 프론트엔드 표현 */
export interface SessionGuest {
  id: string          // session_guests.id (UUID)
  name: string
  gender: 'M' | 'F' | null
  grade: string | null  // 'S'|'A'|'B'|'C'|'D'|'E'|'F'|null
}

export interface GameboardEvent {
  id: string
  title: string
  event_date: string  // YYYY-MM-DD
  place: string | null
  start_time: string | null
  end_time: string | null
  goingMemberIds: string[]
}

export type Phase = 'idle' | 'setup' | 'playing'
export type AssignMode = 'random' | 'skill_balance' | 'freshness' | 'newcomer_friendly' | 'custom'
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
  /**
   * Glicko-2 mu (있으면 실력 균형 매칭의 1순위 키).
   * 경기 1회 이상 뛴 멤버만 값 존재. 임시 참가자/신입 미경기는 undefined.
   */
  muScore?: number
  /**
   * Glicko-2 phi (RD, rating deviation). 클수록 신뢰도 낮음 = 신입 가능성 ↑.
   * 신입 친화 매칭 모드에서 신입 식별 키로 사용. 기본 시드 350.
   */
  phiScore?: number
  rank?: number        // 클럽 내 랭킹 (1 = 최상위, skill_score 기준)
  todayGames: number   // 오늘 세션에서 뛴 경기 수
  waitingSince: number // 대기 시작 시각 (Date.now())
  /**
   * 'waiting' = 대기중 / 'playing' = 코트에서 경기 중 / 'resting' = 휴식중 (자동 매칭에서 제외).
   * 'departed' = 퇴장 — 명시적 퇴장. resting 과 마찬가지로 자동 pickTeams 매칭에서 제외.
   * resting / departed 모두 GameBoardClient.handleTogglePlayerStatus 로 전환.
   */
  status: 'waiting' | 'playing' | 'resting' | 'departed'
  /**
   * 성별 (스키마 미반영 — 옵셔널). 향후 club_members.gender 도입 시 GameBoardClient 빌드 단계에서 채움.
   * 'M' = 파랑 카드 / 'F' = 빨강 카드 / undefined·null = 파랑(디폴트).
   */
  gender?: 'M' | 'F' | null
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
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
}

// freshness/custom/newcomer_friendly 는 DB enum이 없어 가까운 값으로 매핑.
// DB MatchMode = 'random' | 'skill_balance' | 'game_count'
export const ASSIGN_MODE_MAP: Record<AssignMode, MatchMode> = {
  random: 'random',
  skill_balance: 'skill_balance',
  newcomer_friendly: 'skill_balance', // 신입 친화도 mu 기반이라 skill_balance로 저장
  freshness: 'game_count',            // 파트너 중복 방지 — DB에는 game_count 로 저장
  custom: 'random',                    // 직접 배정 — DB에는 random 으로 저장
}

/**
 * 팀 균형도 계산 — Glicko-2 mu 합 차이 (없으면 skill_score 정규화).
 *
 * 임계값(2v2 기준 mu 합):
 *  · ≤ 100  → 균형 OK   (인당 50 이하 차)
 *  · ≤ 250  → 약간 차이 (인당 50~125 차)
 *  · >  250 → 차이 큼   (인당 125 이상 차)
 */
export type BalanceStatus = 'balanced' | 'mild' | 'unbalanced'

export interface TeamBalance {
  status: BalanceStatus
  /** 양팀 합산 mu 차이의 절댓값 */
  delta: number
  /** UI 라벨 */
  label: string
}

export function calcTeamBalance(
  teamA: PlayerEntry[],
  teamB: PlayerEntry[],
): TeamBalance {
  const keyOf = (p: PlayerEntry) => p.muScore ?? p.skillScore * 8 + 1100
  const sumA = teamA.reduce((s, p) => s + keyOf(p), 0)
  const sumB = teamB.reduce((s, p) => s + keyOf(p), 0)
  const delta = Math.abs(sumA - sumB)
  if (delta <= 100) return { status: 'balanced', delta, label: '균형 OK' }
  if (delta <= 250) return { status: 'mild', delta, label: '약간 차이' }
  return { status: 'unbalanced', delta, label: '차이 큼' }
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
 * - skill_balance:      [1위,4위] vs [2위,3위] (스네이크 분배). 키는 muScore(Glicko-2) 우선,
 *                       없으면 skillScore(운영자 입력)로 fallback.
 * - freshness:          게임수/대기시간 우선순위 + 파트너 중복 최소화
 * - newcomer_friendly:  Glicko-2 phi(RD)가 큰 멤버를 신입으로 보고, 강한 베테랑과 짝지어
 *                       4명 매칭에서 1팀: [강자, 신입] vs [중간1, 중간2] 형태로 배정.
 *                       신입이 너무 약한 팀에 묶여 짓밟히는 경험을 회피.
 * - random:             Fisher-Yates 무작위
 * - custom:             직접 배정 모드 — 이 함수는 호출되지 않음 (GameBoardClient 에서 별도 처리)
 */

/** phi(RD)가 이 값보다 크면 신입으로 간주 (Glicko-2 시드 350, 5~10판 후 ~150~200으로 수렴) */
const NEWCOMER_PHI_THRESHOLD = 200

export function pickTeams(
  waiting: PlayerEntry[],
  mode: AssignMode,
  partnerHistory?: PartnerHistory
): [PlayerEntry[], PlayerEntry[]] | null {
  if (waiting.length < 4) return null

  if (mode === 'freshness') {
    return smartPickTeams(waiting, partnerHistory ?? new Map())
  }

  let sorted: PlayerEntry[]
  if (mode === 'random' || mode === 'custom') {
    // custom 이 여기까지 왔다면 랜덤으로 폴백
    sorted = fisherYatesShuffle(waiting)
  } else {
    // skill_balance / newcomer_friendly — Glicko-2 muScore 우선, 없으면 skillScore로 fallback.
    // muScore는 1100~1900 영역, skillScore는 0~100 영역이라 단위 차이가 큼:
    // 비교를 같은 범위로 정규화하기 위해 fallback 시 skillScore × 8 + 1100 으로 환산.
    const keyOf = (p: PlayerEntry) =>
      p.muScore ?? p.skillScore * 8 + 1100
    sorted = [...waiting].sort((a, b) => keyOf(b) - keyOf(a))
  }

  const top4 = sorted.slice(0, 4)
  if (mode === 'skill_balance') {
    // 스네이크: [1등,4등] vs [2등,3등]
    return [[top4[0], top4[3]], [top4[1], top4[2]]]
  }
  if (mode === 'newcomer_friendly') {
    return pickNewcomerFriendly(top4)
  }
  return [[top4[0], top4[1]], [top4[2], top4[3]]]
}

/**
 * top4 (mu 내림차순)에서 신입(phi 큰 사람) 식별 → 가장 강한 베테랑과 페어링.
 *
 * 신입 0명: skill_balance 스네이크 ([1,4] vs [2,3])
 * 신입 1명: [강자(0번), 신입] vs [나머지 2명]
 *           예) top4 = [A:1700, B:1500, C:1450, 신입D:1500/phi 350]
 *               → [A, D] vs [B, C]
 * 신입 2명+: 신입끼리 다른 팀에 분산 + 각 팀에 베테랑 1명씩
 *           예) [강자, 신입1] vs [중간, 신입2]
 */
function pickNewcomerFriendly(
  top4: PlayerEntry[],
): [PlayerEntry[], PlayerEntry[]] {
  const isNewcomer = (p: PlayerEntry) =>
    (p.phiScore ?? 350) > NEWCOMER_PHI_THRESHOLD
  const newcomers = top4.filter(isNewcomer)
  const veterans = top4.filter((p) => !isNewcomer(p))

  if (newcomers.length === 0) {
    return [[top4[0], top4[3]], [top4[1], top4[2]]]
  }

  if (newcomers.length === 1) {
    const newcomer = newcomers[0]
    const [strong, mid1, mid2] = veterans  // 이미 mu 내림차순
    return [[strong, newcomer], [mid1, mid2]]
  }

  // 신입 2명+ — 각 팀에 신입 1명씩 분산. 강한 베테랑과 약한 베테랑/신입을 짝.
  // 신입이 4명 모두면 그냥 스네이크.
  if (newcomers.length === 4) {
    return [[top4[0], top4[3]], [top4[1], top4[2]]]
  }
  if (newcomers.length === 2 && veterans.length === 2) {
    return [[veterans[0], newcomers[1]], [veterans[1], newcomers[0]]]
  }
  // 신입 3명, 베테랑 1명 — 베테랑을 강한 신입과 페어
  if (newcomers.length === 3 && veterans.length === 1) {
    return [[veterans[0], newcomers[2]], [newcomers[0], newcomers[1]]]
  }
  // fallback
  return [[top4[0], top4[3]], [top4[1], top4[2]]]
}
