'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus2 } from 'lucide-react'
import type { EventAttendStatus } from '@/types/club'
import { EventFormDialog } from './EventFormDialog'
import { EventHero } from './events/EventHero'
import { RsvpToggle } from './events/RsvpToggle'
import { AttendeeList } from './events/AttendeeList'
import { WaitlistList } from './events/WaitlistList'
import type { EventDetail, AttendeeRow, WaitlistEntry } from './events/types'
import { GuestAddModal } from './gameboard/setup/GuestAddModal'
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
import { addPlayersToActiveSessionAction } from '@/app/club/[clubId]/gameboard/actions'


interface Props {
  clubId: string
  event: EventDetail
  attendees: AttendeeRow[]
  myStatus: EventAttendStatus | null
  isManager: boolean
  /** 본인 club_members.id — 대기 명단 본인 강조용 */
  myMemberId?: string | null
  /** 현재 대기 인원 수 */
  waitlistCount: number
  /** 본인 대기 순번 (1, 2, 3 ...). 대기중 아니면 null */
  myWaitlistPosition: number | null
  /** 대기 명단 (position asc, 비공개 모드 시 빈 배열) */
  waitlistEntries?: WaitlistEntry[]
  /**
   * T0-1-5: PRD §3.3 — 출석부에 [+ 게스트 추가] 버튼 상시 노출.
   * 이 이벤트에 연결된 open/in_progress 세션 ID. 없으면 null.
   * isManager 일 때만 버튼 표시.
   */
  activeSessionId?: string | null
}

export function EventDetailClient({
  clubId,
  event,
  attendees,
  myStatus,
  isManager,
  myMemberId,
  waitlistCount,
  myWaitlistPosition,
  waitlistEntries = [],
  activeSessionId = null,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  // T0-1-5: 게스트 추가 모달 상태
  const [guestAddOpen, setGuestAddOpen] = useState(false)
  const [guestError, setGuestError] = useState<string | null>(null)

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

  // T0-1-5: 출석부 게스트 추가 — active session 이 있으면 session_guests 에 추가
  async function handleGuestConfirm(
    guests: Array<{ name: string; gender: 'M' | 'F' | null; grade: import('@/lib/club/grade').Grade | null }>
  ) {
    setGuestError(null)
    if (!activeSessionId) {
      setGuestError('현재 진행 중인 게임보드 세션이 없습니다. 게임보드에서 세션을 시작한 뒤 게스트를 추가해주세요.')
      return
    }
    const result = await addPlayersToActiveSessionAction(clubId, activeSessionId, { guests })
    if (result.error) {
      setGuestError(result.error)
      return
    }
    router.refresh()
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

      {/* T0-1-5: PRD §3.3 — 출석부에 [+ 게스트 추가] 버튼 상시 노출 (운영진만) */}
      {isManager && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setGuestAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#e5e5e5] bg-white text-[#111] text-sm font-semibold rounded-xl hover:border-[var(--color-brand-ink)] transition-colors"
          >
            <UserPlus2 size={15} strokeWidth={2.1} />
            게스트 추가
          </button>
        </div>
      )}
      {guestError && (
        <p className="text-xs text-[var(--color-brand-streak)] bg-[var(--color-brand-streak-bg)] rounded-xl px-3 py-2">
          {guestError}
        </p>
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

      {/* T0-1-5: 게스트 추가 모달 (게임보드 GuestAddModal 재사용) */}
      <GuestAddModal
        open={guestAddOpen}
        onClose={() => { setGuestAddOpen(false); setGuestError(null) }}
        onConfirm={handleGuestConfirm}
      />
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
