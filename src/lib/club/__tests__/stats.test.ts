import { describe, it, expect } from 'vitest'

// Pure helper — mirrors the logic inside updatePlayerStatsForMatch (actions.ts)
function computeStatDelta(
  currentWins: number,
  currentLosses: number,
  team: 'A' | 'B',
  prevScoreA: number | null,
  prevScoreB: number | null,
  newScoreA: number,
  newScoreB: number,
): { wins: number; losses: number; games_played: number; win_rate: number } {
  let wins = currentWins
  let losses = currentLosses

  // Reverse old contribution
  if (prevScoreA !== null && prevScoreB !== null) {
    const oldWon  = team === 'A' ? prevScoreA > prevScoreB : prevScoreB > prevScoreA
    const oldLost = team === 'A' ? prevScoreB > prevScoreA : prevScoreA > prevScoreB
    if (oldWon)  wins   = Math.max(0, wins - 1)
    if (oldLost) losses = Math.max(0, losses - 1)
  }

  // Apply new contribution
  const newWon  = team === 'A' ? newScoreA > newScoreB : newScoreB > newScoreA
  const newLost = team === 'A' ? newScoreB > newScoreA : newScoreA > newScoreB
  if (newWon)  wins++
  if (newLost) losses++

  const games_played = wins + losses
  const win_rate = games_played > 0 ? wins / games_played : 0
  return { wins, losses, games_played, win_rate }
}

describe('computeStatDelta', () => {
  it('첫 저장: 팀A 승리 → wins +1', () => {
    const result = computeStatDelta(0, 0, 'A', null, null, 21, 15)
    expect(result).toEqual({ wins: 1, losses: 0, games_played: 1, win_rate: 1 })
  })

  it('재수정: 이전 승리 → 무승부로 변경 → wins -1, losses 유지', () => {
    // currentWins=1 because prev 21>15 (win was already recorded)
    const result = computeStatDelta(1, 0, 'A', 21, 15, 21, 21)
    expect(result).toEqual({ wins: 0, losses: 0, games_played: 0, win_rate: 0 })
  })

  it('팀B 패배 기록', () => {
    // teamB, newScoreA=21 > newScoreB=10 → B lost
    const result = computeStatDelta(2, 1, 'B', null, null, 21, 10)
    expect(result).toEqual({ wins: 2, losses: 2, games_played: 4, win_rate: 0.5 })
  })

  it('재수정: 패배 → 승리로 변경', () => {
    // currentLosses=1 because prev 10<21 (loss was already recorded for A)
    const result = computeStatDelta(0, 1, 'A', 10, 21, 21, 10)
    expect(result).toEqual({ wins: 1, losses: 0, games_played: 1, win_rate: 1 })
  })
})
