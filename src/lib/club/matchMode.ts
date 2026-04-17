/**
 * 팀 배정 방식 상수 및 레이블
 */

export const MATCH_MODE_LABELS = {
  random:        '랜덤',
  skill_balance: '실력 균등',
  game_count:    '게임수 균등',
} as const

export type MatchModeKey = keyof typeof MATCH_MODE_LABELS

export const MATCH_MODE_LIST = (Object.keys(MATCH_MODE_LABELS) as MatchModeKey[]).map(
  (key) => ({ value: key, label: MATCH_MODE_LABELS[key] })
)
