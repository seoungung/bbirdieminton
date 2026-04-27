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
