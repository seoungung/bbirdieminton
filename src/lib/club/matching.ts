import type { ClubMember, CourtAssignment, PlayerStats } from '@/types/club'

/** 코트 수에 따라 한 라운드에 뛸 수 있는 인원 계산 (복식: 코트당 4명) */
export function getActiveCount(courtCount: number): number {
  return courtCount * 4
}

/**
 * Fisher-Yates 셔플 (통계적으로 균등한 무작위 순열)
 * Array.sort(() => Math.random() - 0.5) 는 편향이 있어 사용 금지.
 */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 실력 균등 배정 (skill_balance)
 * skill_score 기준 정렬 후 스네이크 방향으로 팀 배분.
 * 예) [1위, 4위] vs [2위, 3위] (팀별 실력 균등)
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
  const statsMap = new Map(stats.map((s) => [s.member_id, s.games_played]))
  const sorted = [...players].sort(
    (a, b) => (statsMap.get(a.id) ?? 0) - (statsMap.get(b.id) ?? 0)
  )
  const active = sorted.slice(0, getActiveCount(courtCount))
  return buildCourts(active, courtCount)
}

/**
 * 랜덤 배정 (random)
 * Fisher-Yates 알고리즘으로 통계적 편향 없이 셔플.
 */
export function randomMatch(players: ClubMember[], courtCount: number): CourtAssignment[] {
  const shuffled = fisherYatesShuffle(players)
  const active = shuffled.slice(0, getActiveCount(courtCount))
  return buildCourts(active, courtCount)
}

/**
 * 공통: players 배열을 코트별 팀A / 팀B 로 나눔.
 * 4명 그룹은 스네이크: [1위, 4위] vs [2위, 3위]
 */
function buildCourts(players: ClubMember[], courtCount: number): CourtAssignment[] {
  const courts: CourtAssignment[] = []
  for (let i = 0; i < courtCount; i++) {
    const group = players.slice(i * 4, i * 4 + 4)
    if (group.length < 2) break
    if (group.length === 4) {
      // 스네이크: [1위, 4위] vs [2위, 3위]
      courts.push({
        courtNumber: i + 1,
        teamA: [group[0], group[3]],
        teamB: [group[1], group[2]],
      })
    } else {
      courts.push({
        courtNumber: i + 1,
        teamA: group.slice(0, Math.ceil(group.length / 2)),
        teamB: group.slice(Math.ceil(group.length / 2)),
      })
    }
  }
  return courts
}
