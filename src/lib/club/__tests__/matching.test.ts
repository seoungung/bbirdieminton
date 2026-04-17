import { describe, it, expect } from 'vitest'
import { skillBalanceMatch, getActiveCount } from '../matching'
import type { ClubMember } from '@/types/club'

function makeMember(id: string, skill_score: number): ClubMember {
  return {
    id,
    club_id: 'club-1',
    user_id: `user-${id}`,
    role: 'member',
    skill_score,
    joined_at: '2024-01-01T00:00:00Z',
    removed_at: null,
  }
}

describe('skillBalanceMatch', () => {
  it('4명 1코트 → 스네이크 페어링 [rank1,rank4] vs [rank2,rank3]', () => {
    const players = [
      makeMember('p1', 80),
      makeMember('p2', 60),
      makeMember('p3', 40),
      makeMember('p4', 20),
    ]

    const courts = skillBalanceMatch(players, 1)

    expect(courts).toHaveLength(1)
    const court = courts[0]

    const teamAScores = court.teamA.map((m) => m.skill_score).sort((a, b) => b - a)
    const teamBScores = court.teamB.map((m) => m.skill_score).sort((a, b) => b - a)

    expect(teamAScores).toEqual([80, 20])
    expect(teamBScores).toEqual([60, 40])
  })

  it('8명 2코트 → 두 코트 올바른 배정', () => {
    const players = [
      makeMember('p1', 100),
      makeMember('p2', 90),
      makeMember('p3', 80),
      makeMember('p4', 70),
      makeMember('p5', 60),
      makeMember('p6', 50),
      makeMember('p7', 40),
      makeMember('p8', 30),
    ]

    const courts = skillBalanceMatch(players, 2)

    expect(courts).toHaveLength(2)

    // Court 1: rank1=100, rank2=90, rank3=80, rank4=70 → teamA:[100,70], teamB:[90,80]
    const c1TeamAScores = courts[0].teamA.map((m) => m.skill_score).sort((a, b) => b - a)
    const c1TeamBScores = courts[0].teamB.map((m) => m.skill_score).sort((a, b) => b - a)
    expect(c1TeamAScores).toEqual([100, 70])
    expect(c1TeamBScores).toEqual([90, 80])

    // Court 2: rank5=60, rank6=50, rank7=40, rank8=30 → teamA:[60,30], teamB:[50,40]
    const c2TeamAScores = courts[1].teamA.map((m) => m.skill_score).sort((a, b) => b - a)
    const c2TeamBScores = courts[1].teamB.map((m) => m.skill_score).sort((a, b) => b - a)
    expect(c2TeamAScores).toEqual([60, 30])
    expect(c2TeamBScores).toEqual([50, 40])
  })
})

describe('getActiveCount', () => {
  it('코트수별 최대 인원', () => {
    expect(getActiveCount(1)).toBe(4)
    expect(getActiveCount(2)).toBe(8)
    expect(getActiveCount(3)).toBe(12)
  })
})
