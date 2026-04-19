/** ClubViewClient 공유 타입 / 상수 / 유틸 */

export type Tab = '홈' | '공지' | '정기모임' | '게임보드' | '운영' | '설정'
export const TABS: Tab[] = ['홈', '공지', '정기모임', '게임보드', '운영', '설정']

export type UserStatus = 'demo' | 'guest' | 'non-member' | 'member'

export interface ClubViewData {
  id: string
  name: string
  description: string | null
  court_count: number
  created_at: string
  memberCount: number
  location: string
  activityPlace: string
  category: string
  leaderName: string
  thumbnailColor: string
}

export interface MemberViewItem {
  id: string
  name: string
  role: string
  skill?: number
  level?: string
}

export interface RegularSessionItem {
  id: string
  title: string
  dayOfWeek: string
  time: string
  place: string
  fee?: string
  nextDate: string
  maxAttend: number
  currentAttend: number
  thumbnailColor: string
  isAttending?: boolean
}

export interface GameSessionItem {
  id: string
  sessionDate: string
  status: 'open' | 'in_progress' | 'closed'
  notes: string | null
}

export const AVATAR_COLORS = [
  '#beff00', '#c8f5ff', '#ffd6e0', '#ffd700',
  '#d4f5d4', '#e8d4ff', '#ffd4b3', '#b3e8ff',
]

export const MEMBERS_PREVIEW = 7

export const THUMB_COLORS = [
  '#beff00', '#c8f5ff', '#ffd6e0', '#ffd700',
  '#d4f5d4', '#e8d4ff', '#ffd4b3', '#b3e8ff',
  '#f0f0f0', '#0a0a0a',
]

// ── 유틸 함수 ──────────────────────────────────

export function calcDDay(nextDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(nextDate)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function isNewClub(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000
}

export function formatShortDate(nextDate: string, dayOfWeek: string) {
  const parts = nextDate.split('-')
  return `${parseInt(parts[1])}.${parseInt(parts[2])}(${dayOfWeek})`
}

export function startTime(time: string) {
  return time.split('~')[0].trim()
}

// ── 공유 핸들러 ────────────────────────────────

export async function shareClubSession(
  s: RegularSessionItem,
  clubId: string,
  onCopied: () => void,
) {
  const url = `${window.location.origin}/club/${clubId}/view`
  const text = `${s.title}\n${formatShortDate(s.nextDate, s.dayOfWeek)} ${startTime(s.time)} · ${s.place}`

  try {
    if (navigator.share) {
      await navigator.share({ title: s.title, text, url })
    } else {
      await navigator.clipboard.writeText(url)
      onCopied()
    }
  } catch {
    // 사용자가 공유 취소 — 무시
  }
}
