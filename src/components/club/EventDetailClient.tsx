'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { EventAttendStatus } from '@/types/club'
import { EventFormDialog } from './EventFormDialog'
import { EventHero } from './events/EventHero'
import { RsvpToggle } from './events/RsvpToggle'
import { AttendeeList } from './events/AttendeeList'
import { WaitlistList } from './events/WaitlistList'
import type { EventDetail, AttendeeRow, WaitlistEntry } from './events/types'
import { todayKST } from '@/lib/date'
import {
  setRsvpAction,
  updateEventAction,
  deleteEventAction,
  joinWaitlistAction,
  cancelWaitlistAction,
  type EventInput,
  type EventListRow,
} from '@/app/club/[clubId]/events/actions'


interface Props {
  clubId: string
  event: EventDetail
  attendees: AttendeeRow[]
  myStatus: EventAttendStatus | null
  isManager: boolean
  isDemo?: boolean
  /** 본인 club_members.id — 대기 명단 본인 강조용 */
  myMemberId?: string | null
  /** 현재 대기 인원 수 */
  waitlistCount: number
  /** 본인 대기 순번 (1, 2, 3 ...). 대기중 아니면 null */
  myWaitlistPosition: number | null
  /** 대기 명단 (position asc, 비공개 모드 시 빈 배열) */
  waitlistEntries?: WaitlistEntry[]
}

export function EventDetailClient({
  clubId,
  event,
  attendees,
  myStatus,
  isManager,
  isDemo,
  myMemberId,
  waitlistCount,
  myWaitlistPosition,
  waitlistEntries = [],
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)

  const going = useMemo(() => attendees.filter((a) => a.status === 'going'), [attendees])
  const notGoing = useMemo(
    () => attendees.filter((a) => a.status === 'not_going'),
    [attendees]
  )

  const isPast = useMemo(() => {
    // KST 기준 문자열 비교 (브라우저 TZ 무관, DB 저장값과 동일 포맷)
    return event.event_date < todayKST()
  }, [event.event_date])

  const isFull = event.max_attend > 0 && going.length >= event.max_attend
  const isMineGoing = myStatus === 'going'

  function handleRsvp(next: EventAttendStatus) {
    if (isDemo) {
      alert('체험 모드에서는 RSVP가 저장되지 않습니다.')
      return
    }
    if (isPast) {
      alert('이미 지난 정기모임은 RSVP를 변경할 수 없습니다.')
      return
    }
    startTransition(async () => {
      const result = await setRsvpAction(clubId, event.id, next)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleJoinWaitlist() {
    if (isDemo) {
      alert('체험 모드에서는 대기 신청이 저장되지 않습니다.')
      return
    }
    if (isPast) {
      alert('이미 지난 정기모임은 대기할 수 없습니다.')
      return
    }
    startTransition(async () => {
      const result = await joinWaitlistAction(clubId, event.id)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleCancelWaitlist() {
    if (isDemo) {
      alert('체험 모드에서는 대기 취소가 저장되지 않습니다.')
      return
    }
    startTransition(async () => {
      const result = await cancelWaitlistAction(clubId, event.id)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleEdit(data: EventInput) {
    if (isDemo) {
      alert('체험 모드에서는 저장되지 않습니다.')
      setEditing(false)
      return
    }
    startTransition(async () => {
      const result = await updateEventAction(clubId, event.id, data)
      if (result.error) {
        alert(result.error)
        return
      }
      setEditing(false)
      router.refresh()
    })
  }

  function handleDelete() {
    if (isDemo) {
      alert('체험 모드에서는 삭제되지 않습니다.')
      setEditing(false)
      return
    }
    if (!window.confirm('정말 삭제하시겠습니까? 참가자 RSVP도 함께 사라집니다.')) return
    startTransition(async () => {
      const result = await deleteEventAction(clubId, event.id)
      if (result.error) {
        alert(result.error)
        return
      }
      router.replace(`/club/${clubId}/events`)
    })
  }

  return (
    <div className="space-y-4">
      <EventHero
        event={event}
        goingCount={going.length}
        isPast={isPast}
        isFull={isFull}
        isMineGoing={isMineGoing}
        isManager={isManager}
        onEditClick={() => setEditing(true)}
      />

      {!isPast && (
        <RsvpToggle
          myStatus={myStatus}
          isFull={isFull}
          isPending={isPending}
          onChange={handleRsvp}
          waitlistCount={waitlistCount}
          myWaitlistPosition={myWaitlistPosition}
          onJoinWaitlist={handleJoinWaitlist}
          onCancelWaitlist={handleCancelWaitlist}
        />
      )}

      <AttendeeList going={going} notGoing={notGoing} />

      {!isPast && (
        <WaitlistList entries={waitlistEntries} myMemberId={myMemberId} />
      )}

      {editing && (
        <EventFormDialog
          mode="edit"
          initial={toEventListRow(event, going.length, myStatus)}
          isPending={isPending}
          onClose={() => setEditing(false)}
          onSubmit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

function toEventListRow(
  event: EventDetail,
  goingCount: number,
  myStatus: EventAttendStatus | null
): EventListRow {
  return {
    id: event.id,
    club_id: event.club_id,
    title: event.title,
    event_date: event.event_date,
    start_time: event.start_time,
    end_time: event.end_time,
    place: event.place,
    fee: event.fee,
    max_attend: event.max_attend,
    created_by: event.created_by,
    created_at: event.created_at,
    going_count: goingCount,
    my_status: myStatus,
  }
}
