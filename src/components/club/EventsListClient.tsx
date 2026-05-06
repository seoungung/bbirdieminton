'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Plus } from 'lucide-react'
import type { EventListRow, EventInput } from '@/app/club/[clubId]/events/actions'
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
} from '@/app/club/[clubId]/events/actions'
import { EventFormDialog } from './EventFormDialog'
import { EventCard } from './events/EventCard'

interface Props {
  clubId: string
  upcoming: EventListRow[]
  past: EventListRow[]
  isManager: boolean
  isDemo?: boolean
}

type Tab = 'upcoming' | 'past'

export function EventsListClient({ clubId, upcoming, past, isManager, isDemo }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('upcoming')
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; initial?: EventListRow } | null>(
    null
  )
  const [isPending, startTransition] = useTransition()

  const list = tab === 'upcoming' ? upcoming : past

  function openCreate() {
    if (isDemo) {
      alert('체험 모드에서는 정기모임을 만들 수 없습니다.')
      return
    }
    setDialog({ mode: 'create' })
  }

  function openEdit(ev: EventListRow) {
    setDialog({ mode: 'edit', initial: ev })
  }

  function handleSubmit(data: EventInput) {
    if (!dialog) return
    if (isDemo) {
      alert('체험 모드에서는 저장되지 않습니다.')
      setDialog(null)
      return
    }
    startTransition(async () => {
      const result =
        dialog.mode === 'create'
          ? await createEventAction(clubId, data)
          : await updateEventAction(clubId, dialog.initial!.id, data)
      if (result.error) {
        alert(result.error)
        return
      }
      setDialog(null)
      router.refresh()
    })
  }

  function handleDelete(eventId: string) {
    if (isDemo) {
      alert('체험 모드에서는 삭제되지 않습니다.')
      setDialog(null)
      return
    }
    if (!window.confirm('정말 삭제하시겠습니까? 참가자 RSVP도 함께 사라집니다.')) return
    startTransition(async () => {
      const result = await deleteEventAction(clubId, eventId)
      if (result.error) {
        alert(result.error)
        return
      }
      setDialog(null)
      router.refresh()
    })
  }

  return (
    <div>
      {/* 헤더: 탭 + 만들기 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex bg-[#f5f5f5] rounded-lg p-0.5">
          <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
            다가오는 ({upcoming.length})
          </TabButton>
          <TabButton active={tab === 'past'} onClick={() => setTab('past')}>
            지난 ({past.length})
          </TabButton>
        </div>
        {isManager && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--color-brand-lime)] text-[#0a0a0a] text-sm font-bold rounded-lg hover:bg-[var(--color-brand-lime-dim)] transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            정기모임 만들기
          </button>
        )}
      </div>

      {/* 카드 리스트 */}
      {list.length === 0 ? (
        <EmptyState
          tab={tab}
          isManager={isManager}
          onCreateClick={openCreate}
        />
      ) : (
        <ul className="space-y-3">
          {list.map((ev) => (
            <li key={ev.id}>
              <EventCard
                clubId={clubId}
                event={ev}
                past={tab === 'past'}
                isManager={isManager}
                onEdit={() => openEdit(ev)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* 모달 */}
      {dialog && (
        <EventFormDialog
          mode={dialog.mode}
          initial={dialog.initial}
          isPending={isPending}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
          onDelete={dialog.mode === 'edit' ? () => handleDelete(dialog.initial!.id) : undefined}
        />
      )}
    </div>
  )
}

/* ── 탭 버튼 ── */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2.5 text-sm font-semibold rounded-md transition-colors ${
        active
          ? 'bg-white text-[#111] shadow-sm'
          : 'text-[#666] hover:text-[#111]'
      }`}
    >
      {children}
    </button>
  )
}

/* ── 빈 상태 ── */
function EmptyState({
  tab,
  isManager,
  onCreateClick,
}: {
  tab: Tab
  isManager: boolean
  onCreateClick: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#ddd] py-16 flex flex-col items-center justify-center text-center">
      <CalendarDays size={32} className="text-[#ccc] mb-3" strokeWidth={1.5} />
      <p className="text-sm text-[#999]">
        {tab === 'upcoming' ? '예정된 정기모임이 없어요' : '지난 정기모임이 없어요'}
      </p>
      {isManager && tab === 'upcoming' && (
        <button
          onClick={onCreateClick}
          className="mt-4 inline-flex items-center gap-1.5 bg-[var(--color-brand-lime)] text-[#111] font-bold text-sm px-5 py-2.5 rounded-xl hover:brightness-95 transition"
        >
          <Plus size={14} strokeWidth={2.5} />
          첫 정기모임 만들기
        </button>
      )}
    </div>
  )
}
