import { describe, it, expect } from 'vitest'

import {
  DEFAULT_RATING,
  applyDoublesMatchUpdate,
  gradeProgress,
  muToGrade,
  seedRatingFromSkillScore,
  updateRating,
  type Rating,
} from '../glicko2'

describe('seedRatingFromSkillScore', () => {
  it('skill_score 50 → mu 1500 (중앙)', () => {
    expect(seedRatingFromSkillScore(50)).toEqual({
      mu: 1500,
      phi: 350,
      sigma: 0.06,
    })
  })

  it('skill_score 0/100 → mu 1100/1900 (양 끝)', () => {
    expect(seedRatingFromSkillScore(0).mu).toBe(1100)
    expect(seedRatingFromSkillScore(100).mu).toBe(1900)
  })

  it('null/undefined → 1500 (기본값)', () => {
    expect(seedRatingFromSkillScore(null).mu).toBe(1500)
    expect(seedRatingFromSkillScore(undefined).mu).toBe(1500)
  })
})

describe('updateRating (단일 플레이어 갱신)', () => {
  it('기본 1500 vs 강한 상대 2000(70) 패배 → mu 하락 + RD 감소', () => {
    const next = updateRating(
      DEFAULT_RATING,
      [{ mu: 2000, phi: 70, sigma: 0.06 }],
      0,
    )
    // 표준 Glicko-2 예시(논문)와 일치하는 영역에서 동작
    expect(next.mu).toBeLessThan(1500)
    expect(next.phi).toBeLessThan(350)
    expect(next.sigma).toBeCloseTo(0.06, 2)
  })

  it('약한 상대 이기면 mu 상승 폭은 작음(점수 차에 따른 보정)', () => {
    const stronger: Rating = { mu: 1700, phi: 100, sigma: 0.06 }
    const weaker: Rating = { mu: 1300, phi: 100, sigma: 0.06 }
    const winnerNext = updateRating(stronger, [weaker], 1)
    expect(winnerNext.mu).toBeGreaterThan(1700)
    expect(winnerNext.mu - 1700).toBeLessThan(50) // 큰 폭 상승은 X
  })

  it('동률(0.5) 경기는 양쪽 mu 모두 보정', () => {
    const a: Rating = { mu: 1500, phi: 200, sigma: 0.06 }
    const b: Rating = { mu: 1700, phi: 200, sigma: 0.06 }
    const aNext = updateRating(a, [b], 0.5)
    const bNext = updateRating(b, [a], 0.5)
    expect(aNext.mu).toBeGreaterThan(a.mu) // 약자 무승부 → 상승
    expect(bNext.mu).toBeLessThan(b.mu) // 강자 무승부 → 하락
  })
})

describe('applyDoublesMatchUpdate (복식 4명 갱신)', () => {
  const baseline: Rating = { mu: 1500, phi: 200, sigma: 0.06 }

  it('A팀 승 → A팀 mu 상승, B팀 mu 하락', () => {
    const result = applyDoublesMatchUpdate([baseline, baseline], [baseline, baseline], 1)
    expect(result.teamA[0].mu).toBeGreaterThan(1500)
    expect(result.teamA[1].mu).toBeGreaterThan(1500)
    expect(result.teamB[0].mu).toBeLessThan(1500)
    expect(result.teamB[1].mu).toBeLessThan(1500)
  })

  it('동점 무승부 → 기본 동일 mu에서는 변동 없음에 가까움', () => {
    const result = applyDoublesMatchUpdate([baseline, baseline], [baseline, baseline], 0.5)
    expect(result.teamA[0].mu).toBeCloseTo(1500, 0)
    expect(result.teamB[0].mu).toBeCloseTo(1500, 0)
  })
})

describe('muToGrade (mu → 등급 라벨)', () => {
  it('등급 컷이 skill_score grade.ts와 정합', () => {
    expect(muToGrade(2000)).toBe('S') // skill ≥ 90
    expect(muToGrade(1820)).toBe('S')
    expect(muToGrade(1819)).toBe('A')
    expect(muToGrade(1740)).toBe('A') // skill ≥ 80
    expect(muToGrade(1620)).toBe('B') // skill ≥ 65
    expect(muToGrade(1500)).toBe('C') // skill 50 (중앙)
    expect(muToGrade(1380)).toBe('D') // skill ≥ 35
    expect(muToGrade(1260)).toBe('E') // skill ≥ 20
    expect(muToGrade(1259)).toBe('F')
    expect(muToGrade(1100)).toBe('F') // skill 0
  })
})

describe('gradeProgress (다음 등급까지 %)', () => {
  it('C 중간 1560 → next B, progress 50%', () => {
    const p = gradeProgress(1560)
    expect(p.current).toBe('C')
    expect(p.next).toBe('B')
    expect(p.progress).toBeCloseTo(0.5, 1) // (1560-1500)/(1620-1500) = 0.5
    expect(p.toNext).toBe(60)
  })

  it('S 도달 시 next는 null, progress 1.0', () => {
    const p = gradeProgress(2100)
    expect(p.current).toBe('S')
    expect(p.next).toBeNull()
    expect(p.progress).toBe(1)
    expect(p.toNext).toBe(0)
  })

  it('F 시작 1100 → next E, 진행도 부분', () => {
    const p = gradeProgress(1100)
    expect(p.current).toBe('F')
    expect(p.next).toBe('E')
    expect(p.progress).toBeGreaterThan(0)
    expect(p.progress).toBeLessThan(1)
  })
})
