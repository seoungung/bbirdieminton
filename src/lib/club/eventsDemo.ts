import type { EventListRow } from '@/app/club/[clubId]/events/actions'
import type { EventAttendStatus } from '@/types/club'
import type { EventDetail, AttendeeRow } from '@/components/club/events/types'
import { DEMO_MEMBERS } from '@/lib/club/demoData'
import { todayKST, parseEventDate } from '@/lib/date'

const fmt = (d: Date) => {
  // KST midnight 절대시각 → KST 벽시계 자체로 이동시킨 뒤 UTC 슬라이스로 YYYY-MM-DD 추출
  const kstWall = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  return kstWall.toISOString().split('T')[0]
}
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000)
// KST 기준 "오늘"을 anchor 삼아 +N / -N 일 후 KST midnight Date 객체 생성
const todayAnchor = (): Date => parseEventDate(todayKST())

/** 데모 정기모임 목록 (다가오는 / 지난) */
export function buildDemoEventsList(clubId: string): {
  upcoming: EventListRow[]
  past: EventListRow[]
} {
  const today = todayAnchor()
  const upcoming: EventListRow[] = [
    {
      id: 'demo-e1',
      club_id: clubId,
      title: '4월 정기 토요민턴',
      event_date: fmt(addDays(today, 2)),
      start_time: '11:00:00',
      end_time: '15:00:00',
      place: '국사봉체육관 A코트',
      fee: '회비 + 입장료 5,000원',
      max_attend: 24,
      created_by: null,
      created_at: new Date().toISOString(),
      going_count: 18,
      my_status: 'going' as EventAttendStatus,
    },
    {
      id: 'demo-e2',
      club_id: clubId,
      title: '4월 마지막 일요민턴',
      event_date: fmt(addDays(today, 3)),
      start_time: '11:00:00',
      end_time: '15:00:00',
      place: '국사봉체육관',
      fee: '국사봉 입장비용',
      max_attend: 24,
      created_by: null,
      created_at: new Date().toISOString(),
      going_count: 15,
      my_status: null,
    },
    {
      id: 'demo-e3',
      club_id: clubId,
      title: '5월 친선전 — 셔틀러스 클럽',
      event_date: fmt(addDays(today, 21)),
      start_time: '14:00:00',
      end_time: '18:00:00',
      place: '서초체육관',
      fee: '무료 (간식 제공)',
      max_attend: 10,
      created_by: null,
      created_at: new Date().toISOString(),
      going_count: 4,
      my_status: null,
    },
  ]
  const past: EventListRow[] = [
    {
      id: 'demo-e4',
      club_id: clubId,
      title: '4월 첫째주 토요민턴',
      event_date: fmt(addDays(today, -19)),
      start_time: '11:00:00',
      end_time: '15:00:00',
      place: '국사봉체육관',
      fee: '국사봉 입장비용',
      max_attend: 24,
      created_by: null,
      created_at: new Date().toISOString(),
      going_count: 22,
      my_status: 'going' as EventAttendStatus,
    },
    {
      id: 'demo-e5',
      club_id: clubId,
      title: '3월 환영회',
      event_date: fmt(addDays(today, -34)),
      start_time: '18:00:00',
      end_time: '21:00:00',
      place: '서울대입구 호프집',
      fee: '1인 25,000원',
      max_attend: 0,
      created_by: null,
      created_at: new Date().toISOString(),
      going_count: 16,
      my_status: 'going' as EventAttendStatus,
    },
  ]
  return { upcoming, past }
}

/** 데모 이벤트 단건 + 참가자 */
export function buildDemoEventDetail(
  clubId: string,
  eventId: string
): { event: EventDetail; attendees: AttendeeRow[]; myStatus: EventAttendStatus | null } | null {
  const today = todayAnchor()
  const detailMap: Record<string, EventDetail> = {
    'demo-e1': {
      id: 'demo-e1',
      club_id: clubId,
      title: '4월 정기 토요민턴',
      event_date: fmt(addDays(today, 2)),
      start_time: '11:00:00',
      end_time: '15:00:00',
      place: '국사봉체육관 A코트',
      fee: '회비 + 입장료 5,000원',
      max_attend: 24,
      created_by: null,
      created_at: new Date().toISOString(),
    },
    'demo-e2': {
      id: 'demo-e2',
      club_id: clubId,
      title: '4월 마지막 일요민턴',
      event_date: fmt(addDays(today, 3)),
      start_time: '11:00:00',
      end_time: '15:00:00',
      place: '국사봉체육관',
      fee: '국사봉 입장비용',
      max_attend: 24,
      created_by: null,
      created_at: new Date().toISOString(),
    },
    'demo-e3': {
      id: 'demo-e3',
      club_id: clubId,
      title: '5월 친선전 — 셔틀러스 클럽',
      event_date: fmt(addDays(today, 21)),
      start_time: '14:00:00',
      end_time: '18:00:00',
      place: '서초체육관',
      fee: '무료 (간식 제공)',
      max_attend: 10,
      created_by: null,
      created_at: new Date().toISOString(),
    },
  }
  const event = detailMap[eventId]
  if (!event) return null

  const goingCount = eventId === 'demo-e1' ? 18 : eventId === 'demo-e2' ? 15 : 4
  const going: AttendeeRow[] = DEMO_MEMBERS.slice(0, goingCount).map((m) => ({
    member_id: m.id,
    status: 'going' as EventAttendStatus,
    name: m.name,
    skill: m.skill,
    updated_at: new Date().toISOString(),
  }))
  const notGoing: AttendeeRow[] = DEMO_MEMBERS.slice(goingCount, goingCount + 3).map((m) => ({
    member_id: m.id,
    status: 'not_going' as EventAttendStatus,
    name: m.name,
    skill: m.skill,
    updated_at: new Date().toISOString(),
  }))
  const myStatus: EventAttendStatus | null = eventId === 'demo-e1' ? 'going' : null
  return { event, attendees: [...going, ...notGoing], myStatus }
}
