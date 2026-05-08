'use client'

import { CalendarDays, MapPin, Users, Coins } from 'lucide-react'
import { parseEventDate, todayKST } from '@/lib/date'
import type { ClubPreviewEvent } from '@/types/club'

interface Props {
  events: ClubPreviewEvent[]
}

/**
 * 다가오는 정기모임 카드 리스트 (최대 3개).
 * 비멤버 미리보기 — 카드는 클릭 불가, 가입 후 진입 가능 안내.
 */
export function ClubPreviewEvents({ events }: Props) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)]">
          정모 일정 <span className="text-[#999] font-semibold tabular-nums">{events.length}</span>
        </h2>
        {events.length > 0 && (
          <span className="text-[11px] font-medium text-[#999]">
            가입 후 참여 가능
          </span>
        )}
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ebebeb] bg-[#fafafa] px-4 py-8 text-center">
          <p className="text-[13px] text-[#999]">예정된 정기모임이 없어요.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {events.map((ev) => (
            <EventRow key={ev.id} event={ev} />
          ))}
        </ul>
      )}
    </section>
  )
}

// ── Row ───────────────────────────────────────────────────────

function EventRow({ event }: { event: ClubPreviewEvent }) {
  const eventDate = parseEventDate(event.event_date)
  const { label, tone } = getDayLabel(event.event_date)
  const dateLine = formatDateLine(eventDate)
  const timeLine = formatTimeRange(event.start_time, event.end_time)
  const isFull =
    event.max_attend > 0 && event.going_count >= event.max_attend
  const attendLabel =
    event.max_attend > 0
      ? `${event.going_count}/${event.max_attend}명`
      : `${event.going_count}명 참석`

  return (
    <li className="relative bg-white border border-[#ebebeb] rounded-2xl p-4 hover:border-[#d8d8d8] transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <DayBadge label={label} tone={tone} />
            {isFull && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#f0f0f0] text-[#999] uppercase tracking-wider">
                마감
              </span>
            )}
          </div>
          <p className="font-bold text-[15px] text-[#111] leading-snug break-keep">
            {event.title}
          </p>

          <dl className="mt-2 space-y-1 text-[12.5px] text-[#666]">
            <Row icon={<CalendarDays size={12} strokeWidth={2.2} />}>
              <span className="text-[#333]">{dateLine}</span>
              {timeLine && (
                <span className="text-[#999]"> · {timeLine}</span>
              )}
            </Row>
            {event.place && (
              <Row icon={<MapPin size={12} strokeWidth={2.2} />}>
                <span className="truncate">{event.place}</span>
              </Row>
            )}
            <Row icon={<Users size={12} strokeWidth={2.5} />}>
              <span className="text-[#333] font-semibold tabular-nums">
                {attendLabel}
              </span>
            </Row>
            {event.fee && (
              <Row icon={<Coins size={12} strokeWidth={2.2} />}>
                <span className="truncate">{event.fee}</span>
              </Row>
            )}
          </dl>
        </div>

        {/* 우측 미니 썸네일 (정보성 데코) */}
        <div
          className="hidden sm:flex shrink-0 w-14 h-14 rounded-xl items-center justify-center bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court-deep)]"
          aria-hidden
        >
          <CalendarDays size={22} strokeWidth={1.8} />
        </div>
      </div>
    </li>
  )
}

// ── 작은 헬퍼들 ──────────────────────────────────────────────

function DayBadge({
  label,
  tone,
}: {
  label: string
  tone: 'today' | 'soon' | 'later'
}) {
  const cls =
    tone === 'today'
      ? 'bg-[var(--color-brand-court-soft)] text-[var(--color-brand-court-deep)]'
      : tone === 'soon'
      ? 'bg-[var(--color-brand-streak-soft)] text-[#92400e]'
      : 'bg-[#f5f5f5] text-[#555]'
  return (
    <span
      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider tabular-nums ${cls}`}
    >
      {label}
    </span>
  )
}

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[#bbb] shrink-0">{icon}</span>
      <span className="min-w-0 truncate">{children}</span>
    </div>
  )
}

function getDayLabel(eventDateStr: string): {
  label: string
  tone: 'today' | 'soon' | 'later'
} {
  const today = todayKST()
  if (eventDateStr === today) return { label: '오늘', tone: 'today' }

  const t = parseEventDate(today).getTime()
  const e = parseEventDate(eventDateStr).getTime()
  const diffDays = Math.round((e - t) / (24 * 60 * 60 * 1000))

  if (diffDays === 1) return { label: '내일', tone: 'soon' }
  if (diffDays > 1 && diffDays <= 6)
    return { label: `D-${diffDays}`, tone: 'soon' }
  if (diffDays > 0) return { label: `D-${diffDays}`, tone: 'later' }
  return { label: `D-${diffDays}`, tone: 'later' }
}

function formatDateLine(d: Date): string {
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Seoul',
  })
}

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return ''
  const fmt = (t: string) => t.slice(0, 5)
  if (!end) return fmt(start)
  return `${fmt(start)}~${fmt(end)}`
}

