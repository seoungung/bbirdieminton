/**
 * Glicko-2 레이팅 시스템 — TS 래퍼
 *
 * 표면(멤버 리스트·랭킹)에는 D/C/B 등급 라벨만 노출하고,
 * 본인 대시보드(/club/[id]/me)에만 정밀 mu/phi/sigma·다음 등급까지
 * 진행도를 보여주기 위한 모듈.
 *
 * 알고리즘은 npm `glicko2-lite`(rate(mu, rd, vol, opponents, options))를 사용.
 * 매 경기 결과 저장 직후 server action에서 호출 → upsert_member_rating RPC로 저장.
 */

import rate from 'glicko2-lite'

import type { Grade } from './grade'

export type Rating = {
  mu: number
  phi: number
  sigma: number
}

export const DEFAULT_RATING: Rating = {
  mu: 1500,
  phi: 350,
  sigma: 0.06,
}

/**
 * skill_score(0~100) → 초기 mu 시드.
 *
 * 매핑: mu = 1500 + (skill_score − 50) × 8
 *  · 0   → 1100 (왕초보 끝)
 *  · 50  → 1500 (중앙)
 *  · 100 → 1900 (자강조)
 *
 * skill_score를 그대로 등급 컷에 정렬되도록 8배 확장.
 */
export function seedRatingFromSkillScore(
  skillScore: number | null | undefined,
): Rating {
  const score = skillScore ?? 50
  return {
    mu: 1500 + (score - 50) * 8,
    phi: 350,
    sigma: 0.06,
  }
}

/**
 * 한 플레이어 시점의 Glicko-2 갱신.
 *
 * @param player    현재 레이팅
 * @param opponents 같은 경기에서 만난 상대들 (복식이면 상대 팀 2명)
 * @param score     플레이어 시점 결과 — 1(승) | 0(패) | 0.5(무)
 * @param tau       시스템 상수 (기본 0.5, 권장 0.3~1.2)
 */
export function updateRating(
  player: Rating,
  opponents: readonly Rating[],
  score: 0 | 0.5 | 1,
  tau = 0.5,
): Rating {
  const result = rate(
    player.mu,
    player.phi,
    player.sigma,
    opponents.map(
      (o) => [o.mu, o.phi, score] as [number, number, number],
    ),
    { tau },
  )
  return { mu: result.rating, phi: result.rd, sigma: result.vol }
}

/**
 * 복식 한 경기로 4명 모두 갱신.
 *
 * @param teamA       A팀 2명
 * @param teamB       B팀 2명
 * @param teamAResult A팀 시점 결과 — 1(A승) | 0(A패) | 0.5(무)
 */
export function applyDoublesMatchUpdate(
  teamA: readonly [Rating, Rating],
  teamB: readonly [Rating, Rating],
  teamAResult: 0 | 0.5 | 1,
): { teamA: [Rating, Rating]; teamB: [Rating, Rating] } {
  const teamBResult = (1 - teamAResult) as 0 | 0.5 | 1
  return {
    teamA: [
      updateRating(teamA[0], teamB, teamAResult),
      updateRating(teamA[1], teamB, teamAResult),
    ],
    teamB: [
      updateRating(teamB[0], teamA, teamBResult),
      updateRating(teamB[1], teamA, teamBResult),
    ],
  }
}

/**
 * mu(레이팅) → 표면 등급 라벨.
 *
 * 컷 기준은 grade.ts의 scoreToGrade와 정합하도록 mu 8배 스케일에 맞춤:
 *  · S(자강조)  ≥ 1820   (skill ≥ 90)
 *  · A(A조)    ≥ 1740   (skill ≥ 80)
 *  · B(B조)    ≥ 1620   (skill ≥ 65)
 *  · C(C조)    ≥ 1500   (skill ≥ 50)
 *  · D(D조)    ≥ 1380   (skill ≥ 35)
 *  · E(초심)   ≥ 1260   (skill ≥ 20)
 *  · F(왕초보) <  1260
 */
export function muToGrade(mu: number): Grade {
  if (mu >= 1820) return 'S'
  if (mu >= 1740) return 'A'
  if (mu >= 1620) return 'B'
  if (mu >= 1500) return 'C'
  if (mu >= 1380) return 'D'
  if (mu >= 1260) return 'E'
  return 'F'
}

const GRADE_LADDER: Array<{ grade: Grade; min: number }> = [
  { grade: 'F', min: 0 },
  { grade: 'E', min: 1260 },
  { grade: 'D', min: 1380 },
  { grade: 'C', min: 1500 },
  { grade: 'B', min: 1620 },
  { grade: 'A', min: 1740 },
  { grade: 'S', min: 1820 },
]

export type GradeProgress = {
  current: Grade
  next: Grade | null
  /** 현재 등급 구간 내 진행도 0~1 */
  progress: number
  /** 다음 등급까지 남은 mu (없으면 0) */
  toNext: number
}

/**
 * 본인 대시보드용. 다음 등급까지 진행도를 progress bar로 표시할 때.
 */
export function gradeProgress(mu: number): GradeProgress {
  let idx = 0
  for (let i = 0; i < GRADE_LADDER.length; i++) {
    if (mu >= GRADE_LADDER[i].min) idx = i
  }
  const current = GRADE_LADDER[idx]
  const next =
    idx === GRADE_LADDER.length - 1 ? null : GRADE_LADDER[idx + 1]

  if (!next) {
    return { current: current.grade, next: null, progress: 1, toNext: 0 }
  }

  const span = next.min - current.min
  const progress = Math.max(0, Math.min(1, (mu - current.min) / span))
  return {
    current: current.grade,
    next: next.grade,
    progress,
    toNext: Math.max(0, next.min - mu),
  }
}
