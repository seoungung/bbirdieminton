import { describe, it, expect } from 'vitest'
import {
  getResultFromScores,
  RESULT_DUMMY_SCORES,
  type MatchResult,
} from '../PlayingPhase'

/* ── PRD §3.3 / T0-2-1 — 3버튼 결과 입력 인코딩 ──────────────────────────
 * 게임보드 점수 위젯을 [A승]/[B승]/[무승부] 3버튼으로 교체하면서,
 * winning_team 컬럼이 운영 DB 에 없는 W2 기간 동안 score 페어(team_a_score,
 * team_b_score)를 dummy 값으로 인코딩해 호환성을 유지한다.
 *
 * 이 테스트는 다음 두 가지 invariant 를 검증한다:
 *  1) RESULT_DUMMY_SCORES[result] 인코딩이 getResultFromScores 로 round-trip
 *  2) 인코딩이 GameBoardClient.handleEndCourt 의 king-of-court 분기
 *     (winningTeam 판정 + isDraw 분기) 와 1:1 매핑됨
 *
 * T0-3-3 마이그(W3) 후 matches.winning_team 컬럼 직독으로 교체될 때
 * 본 테스트는 polyfill 검증용 회귀 테스트로 보존된다.
 */
describe('getResultFromScores - dummy score → MatchResult 디코딩', () => {
  it('A 승: (1, 0) → "A"', () => {
    expect(getResultFromScores(1, 0)).toBe('A')
  })

  it('B 승: (0, 1) → "B"', () => {
    expect(getResultFromScores(0, 1)).toBe('B')
  })

  it('무승부: (0, 0) → "DRAW"', () => {
    expect(getResultFromScores(0, 0)).toBe('DRAW')
  })

  it('동점 케이스 (양수): (21, 21) → "DRAW" (혹시 모를 옛 데이터)', () => {
    // T0-3-3 이전에 작성된 옛 매치가 21점 게임 무승부일 수도 있다.
    expect(getResultFromScores(21, 21)).toBe('DRAW')
  })

  it('A 승 (옛 점수): (21, 19) → "A" (T0-3-3 마이그 이전 데이터)', () => {
    expect(getResultFromScores(21, 19)).toBe('A')
  })

  it('B 승 (옛 점수): (19, 21) → "B"', () => {
    expect(getResultFromScores(19, 21)).toBe('B')
  })
})

describe('RESULT_DUMMY_SCORES - MatchResult → dummy score 인코딩', () => {
  it("'A' → [1, 0]", () => {
    expect(RESULT_DUMMY_SCORES.A).toEqual([1, 0])
  })

  it("'B' → [0, 1]", () => {
    expect(RESULT_DUMMY_SCORES.B).toEqual([0, 1])
  })

  it("'DRAW' → [0, 0]", () => {
    expect(RESULT_DUMMY_SCORES.DRAW).toEqual([0, 0])
  })

  it('인코딩 → 디코딩 round-trip 무손실', () => {
    const results: MatchResult[] = ['A', 'B', 'DRAW']
    for (const r of results) {
      const [a, b] = RESULT_DUMMY_SCORES[r]
      expect(getResultFromScores(a, b)).toBe(r)
    }
  })
})

describe('GameBoardClient.handleEndCourt 분기 매핑 (winning_team 시뮬)', () => {
  /* GameBoardClient.tsx 의 winningTeam 판정 로직을 그대로 옮긴 헬퍼.
   * RPC update_player_stats_for_match 와 applyGlickoForMatch 가 동일한
   * 부등호 비교를 사용하므로 score 변환 → winning_team 매핑이 1:1 임을 보장. */
  function deriveWinningTeam(scoreA: number, scoreB: number): 'A' | 'B' | 'DRAW' {
    return scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'DRAW'
  }

  it("A 승 dummy → winningTeam === 'A' (king 모드 winner 유지)", () => {
    const [a, b] = RESULT_DUMMY_SCORES.A
    expect(deriveWinningTeam(a, b)).toBe('A')
  })

  it("B 승 dummy → winningTeam === 'B' (king 모드 winner 유지)", () => {
    const [a, b] = RESULT_DUMMY_SCORES.B
    expect(deriveWinningTeam(a, b)).toBe('B')
  })

  it("DRAW dummy → winningTeam === 'DRAW' (king 모드 normal 폴백)", () => {
    const [a, b] = RESULT_DUMMY_SCORES.DRAW
    expect(deriveWinningTeam(a, b)).toBe('DRAW')
  })

  it('DRAW 인코딩은 team_a_score IS NULL sentinel 과 충돌하지 않음', () => {
    /* GameBoardClient.handleResumeGame 은 team_a_score === null 을 "in-progress"
     * sentinel 로 사용한다. DRAW 를 (null, null) 로 인코딩하면 재개 흐름이
     * 깨지므로 (0, 0) 으로 인코딩한다. */
    const [a, b] = RESULT_DUMMY_SCORES.DRAW
    expect(a).not.toBeNull()
    expect(b).not.toBeNull()
    expect(a).toBe(0)
    expect(b).toBe(0)
  })
})
