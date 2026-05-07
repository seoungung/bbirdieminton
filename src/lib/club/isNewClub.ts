/**
 * 모임 생성일이 N일 이내(기본 14일)인지 판정.
 * 신규 모임 NEW 배지 노출 / 상단 정렬 등에 사용.
 */
export function isNewClub(createdAt: string, days = 14): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt).getTime()
  if (!Number.isFinite(created)) return false
  return Date.now() - created < days * 24 * 60 * 60 * 1000
}
