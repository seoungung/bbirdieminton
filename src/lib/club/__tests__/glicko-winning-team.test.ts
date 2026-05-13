import { describe, it, expect } from 'vitest'

import {
  DEFAULT_RATING,
  applyDoublesMatchUpdate,
  updateRating,
  type Rating,
} from '../glicko2'
import {
  RESULT_DUMMY_SCORES,
  getResultFromScores,
  teamAResultFromScores,
  teamAResultFromWinningTeam,
  type MatchResult,
} from '../match-result'

/* ──────────────────────────────────────────────────────────────────────────
 * plan v2 §7.4 T0-2-2 — Glicko-2 winning_team 재배선 회귀 시뮬레이션.
 *
 *  PoC 보고서(.omc/plans/poc-results-2026-05-11.md §4) 의 시뮬을 단위 테스트로
 *  편입. 변환은 알고리즘 자체가 아닌 데이터 흐름(점수 → winning_team) 의 source
 *  전환이므로, 동일 4명·5경기 시퀀스에서 mu/phi 변화가 PoC 와 동일해야 한다.
 *
 *  통과 기준 (Critic H1, H5 측정 가능):
 *   1) A팀 mu 증가폭 ≥ +80, 5경기 모두 단조증가
 *   2) B팀 mu 감소폭 ≤ -80, 5경기 모두 단조감소
 *   3) 4명 모두 phi 단조감소 (확신도 단조증가)
 *
 *  PoC 마진: +352.49 / -352.49 (4.4배 통과). 이 테스트는 +80 threshold 만 강제하므로
 *  알고리즘 미세 변경 시에도 충분한 여유.
 * ──────────────────────────────────────────────────────────────────────── */

/** match-result.ts 의 teamAResult 매핑이 Glicko-2 score 도메인(0|0.5|1) 과 정합. */
describe('teamAResultFromWinningTeam — MatchResult → Glicko-2 numeric 매핑', () => {
  it("'A' → 1 (A팀 시점 승)", () => {
    expect(teamAResultFromWinningTeam('A')).toBe(1)
  })
  it("'B' → 0 (A팀 시점 패)", () => {
    expect(teamAResultFromWinningTeam('B')).toBe(0)
  })
  it("'DRAW' → 0.5 (무승부)", () => {
    expect(teamAResultFromWinningTeam('DRAW')).toBe(0.5)
  })
})

describe('teamAResultFromScores — (점수 페어, W2 호환) → Glicko-2 numeric', () => {
  it('A 승 dummy [1, 0] → 1', () => {
    expect(teamAResultFromScores(1, 0)).toBe(1)
  })
  it('B 승 dummy [0, 1] → 0', () => {
    expect(teamAResultFromScores(0, 1)).toBe(0)
  })
  it('DRAW dummy [0, 0] → 0.5', () => {
    expect(teamAResultFromScores(0, 0)).toBe(0.5)
  })
  it('옛 21점 경기 호환: (21, 19) → 1', () => {
    expect(teamAResultFromScores(21, 19)).toBe(1)
  })
  it('이전 부등호 비교 결과와 1:1 매핑 (RESULT_DUMMY_SCORES round-trip)', () => {
    const results: MatchResult[] = ['A', 'B', 'DRAW']
    for (const r of results) {
      const [a, b] = RESULT_DUMMY_SCORES[r]
      const viaScores = teamAResultFromScores(a, b)
      const viaWinningTeam = teamAResultFromWinningTeam(getResultFromScores(a, b))
      expect(viaScores).toBe(viaWinningTeam)
    }
  })
})

describe('Glicko-2 회귀 — A팀 5연승 시뮬 (winning_team 매핑 = 점수 부등호 비교)', () => {
  /** PoC 시나리오: 4명 가상 플레이어, 모두 DEFAULT_RATING (mu=1500, phi=350, sigma=0.06). */
  function runFiveMatchSimulation(): {
    history: Array<{
      A1: Rating
      A2: Rating
      B1: Rating
      B2: Rating
    }>
  } {
    const initial = {
      A1: { ...DEFAULT_RATING },
      A2: { ...DEFAULT_RATING },
      B1: { ...DEFAULT_RATING },
      B2: { ...DEFAULT_RATING },
    }

    const history: Array<typeof initial> = [
      {
        A1: { ...initial.A1 },
        A2: { ...initial.A2 },
        B1: { ...initial.B1 },
        B2: { ...initial.B2 },
      },
    ]

    let state = initial
    /* 5경기 모두 winning_team='A' → A팀 5연승 */
    for (let i = 0; i < 5; i++) {
      const teamAResult = teamAResultFromWinningTeam('A')
      const updated = applyDoublesMatchUpdate(
        [state.A1, state.A2],
        [state.B1, state.B2],
        teamAResult,
      )
      state = {
        A1: updated.teamA[0],
        A2: updated.teamA[1],
        B1: updated.teamB[0],
        B2: updated.teamB[1],
      }
      history.push(state)
    }

    return { history }
  }

  it('A팀 mu 증가폭 ≥ +80 (PoC 기준, 5경기 후)', () => {
    const { history } = runFiveMatchSimulation()
    const start = history[0]
    const end = history[history.length - 1]

    const deltaA1 = end.A1.mu - start.A1.mu
    const deltaA2 = end.A2.mu - start.A2.mu

    expect(deltaA1).toBeGreaterThanOrEqual(80)
    expect(deltaA2).toBeGreaterThanOrEqual(80)
  })

  it('B팀 mu 감소폭 ≤ -80 (PoC 기준, 5경기 후)', () => {
    const { history } = runFiveMatchSimulation()
    const start = history[0]
    const end = history[history.length - 1]

    const deltaB1 = end.B1.mu - start.B1.mu
    const deltaB2 = end.B2.mu - start.B2.mu

    expect(deltaB1).toBeLessThanOrEqual(-80)
    expect(deltaB2).toBeLessThanOrEqual(-80)
  })

  it('A팀 mu 단조증가 (5경기 모두)', () => {
    const { history } = runFiveMatchSimulation()
    for (let i = 1; i < history.length; i++) {
      expect(history[i].A1.mu).toBeGreaterThan(history[i - 1].A1.mu)
      expect(history[i].A2.mu).toBeGreaterThan(history[i - 1].A2.mu)
    }
  })

  it('B팀 mu 단조감소 (5경기 모두)', () => {
    const { history } = runFiveMatchSimulation()
    for (let i = 1; i < history.length; i++) {
      expect(history[i].B1.mu).toBeLessThan(history[i - 1].B1.mu)
      expect(history[i].B2.mu).toBeLessThan(history[i - 1].B2.mu)
    }
  })

  it('4명 모두 phi 단조감소 — 확신도 단조증가', () => {
    const { history } = runFiveMatchSimulation()
    for (let i = 1; i < history.length; i++) {
      expect(history[i].A1.phi).toBeLessThan(history[i - 1].A1.phi)
      expect(history[i].A2.phi).toBeLessThan(history[i - 1].A2.phi)
      expect(history[i].B1.phi).toBeLessThan(history[i - 1].B1.phi)
      expect(history[i].B2.phi).toBeLessThan(history[i - 1].B2.phi)
    }
  })
})

describe('Glicko-2 회귀 — winning_team 매핑 == 점수 부등호 매핑 (동치성 보장)', () => {
  /** 핵심 invariant: 점수 부등호 비교(`newScoreA > newScoreB ? 1 : ...`) 와
   *  winning_team semantic mapping(`teamAResultFromWinningTeam`) 이 동일 매치에서
   *  같은 Glicko numeric 을 산출 → updateRating 결과도 bitwise 동일. */
  const teamA: Rating = { mu: 1500, phi: 200, sigma: 0.06 }
  const teamB: Rating = { mu: 1600, phi: 200, sigma: 0.06 }

  const cases: Array<{ result: MatchResult; legacyScores: [number, number] }> = [
    { result: 'A', legacyScores: [21, 19] },
    { result: 'B', legacyScores: [19, 21] },
    { result: 'DRAW', legacyScores: [21, 21] },
  ]

  for (const c of cases) {
    it(`${c.result}: 옛 점수 [${c.legacyScores.join(', ')}] 와 winning_team 매핑 동치`, () => {
      const legacyTeamA: 0 | 0.5 | 1 =
        c.legacyScores[0] > c.legacyScores[1]
          ? 1
          : c.legacyScores[0] < c.legacyScores[1]
            ? 0
            : 0.5
      const newTeamA = teamAResultFromWinningTeam(c.result)
      expect(newTeamA).toBe(legacyTeamA)

      /* updateRating bitwise 동치 — A 시점 한 명 갱신 결과가 동일 */
      const fromLegacy = updateRating(teamA, [teamB], legacyTeamA)
      const fromNew = updateRating(teamA, [teamB], newTeamA)
      expect(fromNew.mu).toBe(fromLegacy.mu)
      expect(fromNew.phi).toBe(fromLegacy.phi)
      expect(fromNew.sigma).toBe(fromLegacy.sigma)
    })
  }
})
