'use client'

import Link from 'next/link'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import type { EventListRow } from '@/app/club/[clubId]/events/actions'

interface Props {
  clubId: string
  event: EventListRow
  past: boolean
  isManager: boolean
  onEdit: () => void
}

export function EventCard({ clubId, event, past, isManager, onEdit }: Props) {
  const isFull = event.max_attend > 0 && event.going_count >= event.max_attend
  const isMine = event.my_status === 'going'

  const eventDate = new Date(event.event_date + 'T00:00:00')
  const dayLabel = eventDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  const timeLabel = formatTimeRange(event.start_time, event.end_time)

  return (
    <div
      className={`relative bg-white rounded-2xl border p-4 transition-all ${
        past
          ? 'border-[#ebebeb] opacity-75'
          : isMine
          ? 'border-emerald-300 shadow-sm'
          : 'border-[#e5e5e5] hover:border-[#beff00] hover:shadow-sm'
      }`}
    >
      <Link href={`/club/${clubId}/events/${event.id}`} className="block">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {!past && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isFull
                      ? 'bg-[#f0f0f0] text-[#999]'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isFull ? '마감' : '모집중'}
                </span>
              )}
              {isMine && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase tracking-wider">
                  참가
                </span>
              )}
            </div>
            <p className="font-extrabold text-[15px] text-[#111] truncate">{event.title}</p>
          </div>
        </div>

        <div className="space-y-1 text-[13px] text-[#555]">
          <div className="inline-flex items-center gap-1.5">
            <CalendarDays size={12} className="text-[#999]" strokeWidth={2.2} />
            <span>{dayLabel}</span>
            {timeLabel && <span className="text-[#999]">· {timeLabel}</span>}
          </div>
          {event.place && (
            <div className="inline-flex items-center gap-1.5 ml-3">
              <MapPin size={12} className="text-[#999]" strokeWidth={2.2} />
              <span className="truncate">{event.place}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0f0f0]">
          <div className="inline-flex items-center gap-1 text-[12px] font-semibold">
            <Users size={12} className="text-emerald-600" strokeWidth={2.5} />
            <span className="text-[#111] tabular-nums">{event.going_count}명</span>
            {event.max_attend > 0 && (
              <span className="text-[#999] tabular-nums">/ 정원 {event.max_attend}</span>
            )}
          </div>
          {event.fee && (
            <span className="text-[11px] text-[#999] truncate max-w-[40%]">{event.fee}</span>
          )}
        </div>
      </Link>

      {isManager && !past && (
        <button
          onClick={onEdit}
          className="absolute top-3 right-3 text-[11px] font-bold text-[#555] hover:text-[#111] bg-[#f5f5f5] hover:bg-[#ebebeb] px-2 py-1 rounded-md transition-colors"
        >
          수정
        </button>
      )}
    </div>
  )
}

function formatTimeRange(start: string | null, end: string | null) {
  if (!start) return ''
  const fmt = (t: string) => t.slice(0, 5)
  if (!end) return fmt(start)
  return `${fmt(start)}~${fmt(end)}`
}
