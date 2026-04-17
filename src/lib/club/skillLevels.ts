// ============================================================
// 버디민턴 실력 레벨 정의 — 단일 진실 소스
// MembersClient, 퀴즈 시스템, GameBoardClient 모두 이 파일 참조
// ============================================================

export interface SkillLevel {
  label: string
  min: number   // 이상 (inclusive)
  max: number   // 이하 (inclusive)
  color: string
}

export const SKILL_LEVELS: SkillLevel[] = [
  { label: '왕초보', min: 0,  max: 25,  color: '#d4f5d4' },
  { label: '초심자', min: 26, max: 45,  color: '#c8f5ff' },
  { label: 'D조',   min: 46, max: 65,  color: '#beff00' },
  { label: 'C조',   min: 66, max: 85,  color: '#ffd700' },
  { label: 'B조+',  min: 86, max: 100, color: '#ffd6e0' },
]

/** skill_score → 레벨 라벨 변환 */
export function getSkillLabel(score: number): string {
  return SKILL_LEVELS.find(l => score >= l.min && score <= l.max)?.label ?? '왕초보'
}

/** skill_score → 레벨 색상 변환 */
export function getSkillColor(score: number): string {
  return SKILL_LEVELS.find(l => score >= l.min && score <= l.max)?.color ?? '#f0f0f0'
}
