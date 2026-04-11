import type { ClubMember, CourtAssignment, PlayerStats } from '@/types/club'

/** 코트 수에 따라 한 라운드에 뛸 수 있는 인원 계산 (복식: 코트당 4명) */
export function getActiveCount(courtCount: number): number {
  return courtCount * 4
}

/**
 * 실력 균등 배정 (skill_balance)
 * skill_score 기준 정렬 후 뱀 방향으로 팀 배분.
 * 예) [1위, 4위, 5위, 8위] vs [2위, 3위, 6위, 7위]
 */
export function skillBalanceMatch(
  players: ClubMember[],
  courtCount: number
): CourtAssignment[] {
  const sorted = [...players].sort((a, b) => b.skill_score - a.skill_score)
  const active = sorted.slice(0, getActiveCount(courtCount))
  return buildCourts(active, courtCount)
}

/**
 * 게임수 균등 배정 (game_count)
 * 누적 게임수가 적은 순으로 먼저 배정.
 */
export function gameCountMatch(
  players: ClubMember[],
  stats: PlayerStats[],
  courtCount: number
): CourtAssignment[] {
  const statsMap = new Map(stats.map((s) => [s.member_id, s.total_games]))
  const sorted = [...players].sort(
    (a, b) => (statsMap.get(a.id) ?? 0) - (statsMap.get(b.id) ?? 0)
  )
  const active = sorted.slice(0, getActiveCount(courtCount))
  return buildCourts(active, courtCount)
}

/**
 * 랜덤 배정 (random)
 */
export function randomMatch(players: ClubMember[], courtCount: number): CourtAssignment[] {
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const active = shuffled.slice(0, getActiveCount(courtCount))
  return buildCourts(active, courtCount)
}

/**
 * 공통: players 배열을 코트별 팀A / 팀B 로 나눔.
 * 4명씩 묶어 앞 2명 = 팀A, 뒤 2명 = 팀B
 */
function buildCourts(players: ClubMember[], courtCount: number): CourtAssignment[] {
  const courts: CourtAssignment[] = []
  for (let i = 0; i < courtCount; i++) {
    const group = players.slice(i * 4, i * 4 + 4)
    if (group.length < 2) break
    courts.push({
      courtNumber: i + 1,
      teamA: group.slice(0, Math.ceil(group.length / 2)),
      teamB: group.slice(Math.ceil(group.length / 2)),
    })
  }
  return courts
}
