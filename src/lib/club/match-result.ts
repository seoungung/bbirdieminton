/**
 * 매치 결과 (winning_team) 중앙 헬퍼 — PRD §3.3 / plan v2 §7.4 T0-2-2.
 *
 * 한 곳에 모은 이유:
 *  1. ranking/actions.ts 의 Glicko 갱신 진입점이 점수 부등호(`newScoreA > newScoreB`)
 *     비교 대신 winning_team semantic mapping 으로 전환되어야 함 (plan v2 §7.4 핵심).
 *  2. PlayingPhase.tsx 의 UI 인코딩/디코딩과 server action 의 Glicko 입력 매핑이
 *     동일한 정의를 공유해야 함 (round-trip 무손실 보장).
 *  3. T0-3-3 마이그(W3) 이후 matches.winning_team 컬럼 직독으로 교체할 때 이 파일만
 *     수정하면 호출자 전체가 정합 유지.
 *
 * W2 호환 매핑 (matches 테이블에 winning_team 컬럼이 아직 없는 상태):
 *  - team_a_score / team_b_score 의 부등호 비교 결과를 MatchResult 로 디코드.
 *  - 3버튼 UI 클릭 시 RESULT_DUMMY_SCORES 로 dummy 점수 페어 인코드 후 DB 저장.
 *  - update_player_stats_for_match RPC 의 기존 분기 (a>b / b>a / a==b) 와 1:1 매핑.
 *
 * W3 (T0-3-3) 이후:
 *  - matches.winning_team 컬럼 도입 후 getResultFromScores fallback 은 회귀 polyfill 로 보존.
 *  - ranking/actions.ts 는 RPC 호출 시 winning_team 직접 전달, applyGlickoForMatch 도
 *    winning_team 인자 받음.
 */

/**
 * 매치 결과 (PRD §3.3 3버튼) — server action / UI / 마이그 모두 동일 타입 공유.
 *  · 'A'    = A팀(좌팀) 승
 *  · 'B'    = B팀(우팀) 승
 *  · 'DRAW' = 무승부
 */
export type MatchResult = 'A' | 'B' | 'DRAW'

/**
 * dummy score → MatchResult 디코더 (W2 호환).
 *
 * 사용처:
 *  - PlayingPhase 의 CourtCard 결과 라벨 표시
 *  - GameBoardClient.handleEndCourt 의 winningTeam 판정 (king-of-court 분기)
 *  - applyGlickoForMatch 의 teamAResult 산출 (이전 ranking/actions.ts:109 부등호 비교)
 *
 * T0-3-3 마이그 이후엔 matches.winning_team 컬럼 직독으로 대체될 수 있으나,
 * 옛 데이터(21:19 같은 실제 점수) 회귀 대응을 위해 fallback 으로 보존.
 */
export function getResultFromScores(scoreA: number, scoreB: number): MatchResult {
  if (scoreA > scoreB) return 'A'
  if (scoreB > scoreA) return 'B'
  return 'DRAW'
}

/**
 * MatchResult → dummy score 페어 인코더.
 *
 * 3버튼 UI 클릭 시 이 값으로 DB matches.team_a_score / team_b_score 에 저장.
 * (W2 호환 — winning_team 컬럼 도입 전까지 점수 컬럼 재활용)
 *
 *  · A    → [1, 0]
 *  · B    → [0, 1]
 *  · DRAW → [0, 0]  (NULL 사용 금지 — GameBoardClient.handleResumeGame 의 in-progress sentinel 충돌)
 */
export const RESULT_DUMMY_SCORES: Record<MatchResult, readonly [number, number]> = {
  A: [1, 0],
  B: [0, 1],
  DRAW: [0, 0],
}

/**
 * MatchResult → Glicko-2 A팀 시점 numeric score.
 *
 * Glicko-2 알고리즘은 0|0.5|1 score 를 받으므로, semantic winning_team 을
 * 알고리즘 입력으로 변환하는 단일 진입점.
 *
 *  · 'A'    → 1   (A팀 승 → A팀 시점 1.0)
 *  · 'B'    → 0   (A팀 패 → A팀 시점 0.0)
 *  · 'DRAW' → 0.5 (무승부 → 양쪽 0.5)
 *
 * 호출자: src/app/club/[clubId]/ranking/actions.ts applyGlickoForMatch.
 * PoC 시뮬(scripts/poc-glicko-winning-team-simulation.mjs) 4.4배 마진 통과로 검증됨.
 */
export function teamAResultFromWinningTeam(result: MatchResult): 0 | 0.5 | 1 {
  if (result === 'A') return 1
  if (result === 'B') return 0
  return 0.5
}

/**
 * (점수 페어, W2 호환) → Glicko-2 A팀 시점 numeric score.
 *
 * `getResultFromScores` + `teamAResultFromWinningTeam` 합성.
 * matches 테이블이 아직 winning_team 컬럼을 갖고 있지 않은 W2 동안의 진입점.
 *
 * T0-3-3 마이그 이후엔 호출자가 직접 teamAResultFromWinningTeam 만 사용하도록 전환.
 */
export function teamAResultFromScores(
  scoreA: number,
  scoreB: number,
): 0 | 0.5 | 1 {
  return teamAResultFromWinningTeam(getResultFromScores(scoreA, scoreB))
}
