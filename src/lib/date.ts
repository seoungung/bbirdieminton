/**
 * KST(UTC+9) 기준 오늘 날짜 (YYYY-MM-DD).
 * 서버/클라 어디서 호출해도 일관된 한국 날짜 반환.
 */
export function todayKST(): string {
  const now = new Date()
  // KST = UTC + 9시간
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().split('T')[0]
}

/**
 * DATE 컬럼 (YYYY-MM-DD)를 KST 기준 Date 객체로 파싱.
 * `new Date('2026-04-28')`은 UTC midnight이라 한국에선 04/27 09:00로 해석됨 — 그 사고 방지.
 */
export function parseEventDate(dateStr: string): Date {
  // YYYY-MM-DD 를 KST midnight로 해석 (브라우저/서버 타임존 무관)
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d) - 9 * 60 * 60 * 1000)
}
