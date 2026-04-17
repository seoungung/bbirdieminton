// ============================================================
// 버디민턴 클럽 도메인 — 입력값 검증 상수 + 유틸리티
// Phase 2: 모든 편집 action에서 공유
// ============================================================

export const CLUB_VALIDATION = {
  name:          { min: 2, max: 30 },
  description:   { max: 500 },
  location:      { max: 20 },
  activityPlace: { max: 50 },
  courtCount:    { min: 1, max: 20 },
} as const

export function validateClubName(name: string): string | null {
  const t = name.trim()
  if (t.length < CLUB_VALIDATION.name.min)
    return `모임 이름은 ${CLUB_VALIDATION.name.min}자 이상 입력해주세요`
  if (t.length > CLUB_VALIDATION.name.max)
    return `모임 이름은 ${CLUB_VALIDATION.name.max}자 이하로 입력해주세요`
  return null
}

export function validateClubDescription(desc: string): string | null {
  if (desc.trim().length > CLUB_VALIDATION.description.max)
    return `소개는 ${CLUB_VALIDATION.description.max}자 이하로 입력해주세요`
  return null
}

export function validateCourtCount(count: number): string | null {
  if (count < CLUB_VALIDATION.courtCount.min || count > CLUB_VALIDATION.courtCount.max)
    return `코트 수는 ${CLUB_VALIDATION.courtCount.min}~${CLUB_VALIDATION.courtCount.max} 사이로 입력해주세요`
  return null
}
