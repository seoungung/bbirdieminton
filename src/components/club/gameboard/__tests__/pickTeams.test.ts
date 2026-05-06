import { describe, it, expect } from 'vitest'
import { pickTeams, calcTeamBalance, type PlayerEntry } from '../types'

function p(
  memberId: string,
  skill: number,
  opts: { mu?: number; phi?: number } = {},
): PlayerEntry {
  return {
    memberId,
    name: memberId,
    skillScore: skill,
    muScore: opts.mu,
    phiScore: opts.phi,
    todayGames: 0,
    waitingSince: 0,
    status: 'waiting',
  }
}

describe('pickTeams - skill_balance', () => {
  it('mu 내림차순 스네이크: [1,4] vs [2,3]', () => {
    const players = [
      p('a', 50, { mu: 1700 }),
      p('b', 50, { mu: 1500 }),
      p('c', 50, { mu: 1400 }),
      p('d', 50, { mu: 1300 }),
    ]
    const result = pickTeams(players, 'skill_balance')
    expect(result).not.toBeNull()
    const [teamA, teamB] = result!
    expect(teamA.map((p) => p.memberId).sort()).toEqual(['a', 'd'])
    expect(teamB.map((p) => p.memberId).sort()).toEqual(['b', 'c'])
  })

  it('mu 없으면 skillScore × 8 + 1100 으로 정규화 fallback', () => {
    const players = [
      p('a', 90), // mu 1820 환산
      p('b', 65), // mu 1620
      p('c', 50), // mu 1500
      p('d', 30), // mu 1340
    ]
    const result = pickTeams(players, 'skill_balance')
    const [teamA] = result!
    expect(teamA.map((p) => p.memberId).sort()).toEqual(['a', 'd'])
  })
})

describe('pickTeams - newcomer_friendly', () => {
  it('신입 0명: skill_balance와 동일한 결과', () => {
    const players = [
      p('a', 50, { mu: 1700, phi: 100 }),
      p('b', 50, { mu: 1500, phi: 120 }),
      p('c', 50, { mu: 1400, phi: 100 }),
      p('d', 50, { mu: 1300, phi: 150 }),
    ]
    const result = pickTeams(players, 'newcomer_friendly')!
    const teamA = result[0].map((p) => p.memberId).sort()
    expect(teamA).toEqual(['a', 'd'])
  })

  it('신입 1명: 강자 + 신입 한 팀, 중간 2명 한 팀', () => {
    const players = [
      p('a', 50, { mu: 1700, phi: 100 }),  // 강자 베테랑
      p('b', 50, { mu: 1500, phi: 130 }),  // 중간 베테랑
      p('c', 50, { mu: 1400, phi: 150 }),  // 약한 베테랑
      p('d', 50, { mu: 1500, phi: 350 }),  // 신입
    ]
    const result = pickTeams(players, 'newcomer_friendly')!
    const teamA = result[0].map((p) => p.memberId).sort()
    const teamB = result[1].map((p) => p.memberId).sort()
    expect(teamA).toEqual(['a', 'd'])
    expect(teamB).toEqual(['b', 'c'])
  })

  it('phi가 임계값 200 이하면 베테랑 처리', () => {
    const players = [
      p('a', 50, { mu: 1700, phi: 100 }),
      p('b', 50, { mu: 1500, phi: 120 }),
      p('c', 50, { mu: 1400, phi: 199 }),  // 200 이하 = 베테랑
      p('d', 50, { mu: 1500, phi: 201 }),  // 200 초과 = 신입
    ]
    const result = pickTeams(players, 'newcomer_friendly')!
    const teamA = result[0].map((p) => p.memberId).sort()
    expect(teamA).toEqual(['a', 'd']) // 신입 d가 강자 a와 페어
  })

  it('신입 2명: 각 팀에 1명씩 분산', () => {
    const players = [
      p('a', 50, { mu: 1700, phi: 100 }),  // 베테랑1
      p('b', 50, { mu: 1500, phi: 120 }),  // 베테랑2
      p('c', 50, { mu: 1500, phi: 350 }),  // 신입1
      p('d', 50, { mu: 1500, phi: 350 }),  // 신입2
    ]
    const result = pickTeams(players, 'newcomer_friendly')!
    // 신입은 다른 팀에 분산
    const teamAIds = new Set(result[0].map((p) => p.memberId))
    const teamBIds = new Set(result[1].map((p) => p.memberId))
    const newcomerSet = new Set(['c', 'd'])
    const teamANewcomers = [...teamAIds].filter((id) => newcomerSet.has(id)).length
    const teamBNewcomers = [...teamBIds].filter((id) => newcomerSet.has(id)).length
    expect(teamANewcomers).toBe(1)
    expect(teamBNewcomers).toBe(1)
  })
})

describe('calcTeamBalance', () => {
  it('동일 mu 합 → 균형 OK', () => {
    const teamA = [p('a', 50, { mu: 1500 }), p('b', 50, { mu: 1500 })]
    const teamB = [p('c', 50, { mu: 1500 }), p('d', 50, { mu: 1500 })]
    const r = calcTeamBalance(teamA, teamB)
    expect(r.status).toBe('balanced')
    expect(r.delta).toBe(0)
  })

  it('250 초과 차이 → 차이 큼', () => {
    const teamA = [p('a', 50, { mu: 1700 }), p('b', 50, { mu: 1700 })]
    const teamB = [p('c', 50, { mu: 1400 }), p('d', 50, { mu: 1400 })]
    const r = calcTeamBalance(teamA, teamB)
    expect(r.status).toBe('unbalanced')
    expect(r.delta).toBe(600)
  })

  it('100~250 → 약간 차이', () => {
    const teamA = [p('a', 50, { mu: 1600 }), p('b', 50, { mu: 1500 })]
    const teamB = [p('c', 50, { mu: 1500 }), p('d', 50, { mu: 1450 })]
    const r = calcTeamBalance(teamA, teamB)
    expect(r.status).toBe('mild')
    expect(r.delta).toBe(150)
  })
})
