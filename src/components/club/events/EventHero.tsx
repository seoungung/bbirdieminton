'use client'

import { CalendarDays, MapPin, Pencil, Wallet } from 'lucide-react'
import { parseEventDate } from '@/lib/date'
import type { EventDetail } from './types'

interface Props {
  event: EventDetail
  goingCount: number
  isPast: boolean
  isFull: boolean
  isMineGoing: boolean
  isManager: boolean
  onEditClick: () => void
}

export function EventHero({
  event,
  goingCount,
  isPast,
  isFull,
  isMineGoing,
  isManager,
  onEditClick,
}: Props) {
  const eventDate = parseEventDate(event.event_date)
  const dateLabel = eventDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Seoul',
  })
  const timeLabel = formatTimeRange(event.start_time, event.end_time)

  return (
    <section className="bg-white rounded-3xl border border-[#e5e5e5] p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          {isPast ? (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#f0f0f0] text-[#999] uppercase tracking-wider">
              종료
            </span>
          ) : isFull ? (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#f0f0f0] text-[#999] uppercase tracking-wider">
              마감
            </span>
          ) : (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase tracking-wider">
              모집중
            </span>
          )}
          {isMineGoing && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase tracking-wider">
              참가
            </span>
          )}
        </div>
        {isManager && !isPast && (
          <button
            onClick={onEditClick}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#555] hover:text-[#111] bg-[#f5f5f5] hover:bg-[#ebebeb] px-2.5 py-1.5 rounded-md transition-colors"
          >
            <Pencil size={12} strokeWidth={2.5} />
            수정·삭제
          </button>
        )}
      </div>
      <h2 className="text-xl lg:text-2xl font-extrabold text-[#111] mb-3 leading-tight">
        {event.title}
      </h2>
      <div className="space-y-1.5 text-sm text-[#555]">
        <div className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} className="text-[#999]" strokeWidth={2.2} />
          <span className="font-medium text-[#111]">{dateLabel}</span>
          {timeLabel && <span className="text-[#999]">· {timeLabel}</span>}
        </div>
        {event.place && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#999] shrink-0" strokeWidth={2.2} />
            <span>{event.place}</span>
          </div>
        )}
        {event.fee && (
          <div className="flex items-center gap-1.5">
            <Wallet size={14} className="text-[#999] shrink-0" strokeWidth={2.2} />
            <span>{event.fee}</span>
          </div>
        )}
      </div>

      {/* 정원 progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[12px] mb-1.5">
          <span className="text-[#999]">참여 현황</span>
          <span className="font-bold text-[#111] tabular-nums">
            {goingCount}명
            {event.max_attend > 0 && (
              <span className="text-[#999] font-normal"> / 정원 {event.max_attend}명</span>
            )}
          </span>
        </div>
        <div className="w-full bg-[#f0f0f0] rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
            style={{
              width: `${
                event.max_attend > 0
                  ? Math.min(100, (goingCount / event.max_attend) * 100)
                  : goingCount > 0
                  ? 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </section>
  )
}

function formatTimeRange(start: string | null, end: string | null) {
  if (!start) return ''
  const fmt = (t: string) => t.slice(0, 5)
  if (!end) return fmt(start)
  return `${fmt(start)}~${fmt(end)}`
}
