import type { EventAttendStatus } from '@/types/club'

export interface EventDetail {
  id: string
  club_id: string
  title: string
  event_date: string
  start_time: string | null
  end_time: string | null
  place: string | null
  fee: string | null
  max_attend: number
  created_by: string | null
  created_at: string
}

export interface AttendeeRow {
  member_id: string
  status: EventAttendStatus
  name: string
  skill: number
  updated_at: string
}

/** 대기 명단 행 — position asc 정렬된 active waiting 항목 */
export interface WaitlistEntry {
  member_id: string
  name: string
  position: number
  /** ISO timestamp — 신청 순서 표시용 */
  joined_at: string
  skill: number
}
