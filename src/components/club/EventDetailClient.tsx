'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { EventAttendStatus } from '@/types/club'
import { EventFormDialog } from './EventFormDialog'
import { EventHero } from './events/EventHero'
import { RsvpToggle } from './events/RsvpToggle'
import { AttendeeList } from './events/AttendeeList'
import type { EventDetail, AttendeeRow } from './events/types'
import {
  setRsvpAction,
  updateEventAction,
  deleteEventAction,
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
}

export function EventDetailClient({
  clubId,
  event,
  attendees,
  myStatus,
  isManager,
  isDemo,
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventD = new Date(event.event_date + 'T00:00:00')
    return eventD < today
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
        />
      )}

      <AttendeeList going={going} notGoing={notGoing} />

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
