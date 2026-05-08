'use client'

import Image from 'next/image'
import { CalendarDays, Heart, Share2, CalendarPlus, UserCircle2 } from 'lucide-react'
import { parseEventDate, todayKST } from '@/lib/date'
import type { ClubPreviewEvent, ClubPreviewParticipant } from '@/types/club'

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

  const participants = event.participants ?? []
  const visibleAvatars = participants.slice(0, 8)
  const remainingSlots = Math.max(0, event.going_count - visibleAvatars.length)

  /* 좌측 컨텐츠 (모바일 전체 폭, md+ flex-1) — badge/title/meta/avatars/actions */
  const leftContent = (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* badge 줄 */}
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <DayBadge label={label} tone={tone} />
        {isFull && (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#f0f0f0] text-[#999] uppercase tracking-wider">
            마감
          </span>
        )}
      </div>

      {/* 제목 */}
      <p className="font-bold text-[16px] sm:text-[17px] text-[#111] leading-snug break-keep">
        {event.title}
      </p>

      {/* 메타 */}
      <dl className="mt-2.5 space-y-1 text-[12.5px] text-[#666]">
        <KeyValue label="일시">
          <span className="text-[#333]">{dateLine}</span>
          {timeLine && <span className="text-[#999]"> · {timeLine}</span>}
        </KeyValue>
        {event.place && (
          <KeyValue label="위치">
            <span className="truncate">{event.place}</span>
          </KeyValue>
        )}
        {event.fee && (
          <KeyValue label="비용">
            <span className="truncate">{event.fee}</span>
          </KeyValue>
        )}
        <KeyValue label="참석">
          <span className="text-[#333] font-semibold tabular-nums">
            {attendLabel}
          </span>
        </KeyValue>
      </dl>

      {/* 참석자 아바타 줄 — 최대 8명 + 남은 인원 placeholder */}
      <div className="mt-4 flex items-center gap-1.5 sm:gap-2">
        {visibleAvatars.map((p) => (
          <ParticipantAvatar key={p.id} participant={p} />
        ))}
        {Array.from({ length: Math.min(remainingSlots, 8 - visibleAvatars.length) }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#bbb]"
            aria-hidden
          >
            <UserCircle2 size={20} strokeWidth={1.6} />
          </div>
        ))}
        {remainingSlots > 8 - visibleAvatars.length && (
          <span className="text-[11px] font-semibold text-[#999] tabular-nums ml-1">
            +{remainingSlots - (8 - visibleAvatars.length)}
          </span>
        )}
      </div>

      {/* 액션 버튼 줄 — 가입 전이라 모두 비활성 */}
      <div className="mt-3 flex items-center gap-1.5 sm:gap-2">
        <ActionIconButton ariaLabel="찜">
          <Heart size={18} strokeWidth={2} />
        </ActionIconButton>
        <ActionIconButton ariaLabel="공유">
          <Share2 size={18} strokeWidth={2} />
        </ActionIconButton>
        <ActionIconButton ariaLabel="캘린더 추가">
          <CalendarPlus size={18} strokeWidth={2} />
        </ActionIconButton>
        <button
          type="button"
          disabled
          className={
            'flex-1 h-11 rounded-xl font-extrabold text-[14px] transition-all disabled:cursor-not-allowed ' +
            (isFull
              ? 'bg-[#f0f0f0] text-[#999]'
              : 'bg-[var(--color-brand-court)] text-white opacity-70')
          }
          title="가입 후 참석할 수 있어요"
        >
          {isFull ? '마감' : '참석'}
        </button>
      </div>
    </div>
  )

  /* 우측 썸네일 — md+ 에서만 노출. 모바일은 표시 안 함. */
  const rightThumbnail = (
    <div
      className="hidden md:flex shrink-0 md:w-[280px] lg:w-[340px] aspect-[16/10] rounded-xl items-center justify-center bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court-deep)] overflow-hidden"
      aria-hidden
    >
      <CalendarDays size={56} strokeWidth={1.4} />
    </div>
  )

  return (
    <li className="relative bg-white border border-[#ebebeb] rounded-2xl p-4 sm:p-5 hover:border-[#d8d8d8] transition-colors">
      {/* md+ 에서 좌(텍스트) + 우(썸네일) 가로 배치, 모바일에서 단일 컬럼 */}
      <div className="flex flex-col md:flex-row md:items-stretch md:gap-5">
        {leftContent}
        {rightThumbnail}
      </div>
    </li>
  )
}

function ParticipantAvatar({ participant }: { participant: ClubPreviewParticipant }) {
  const initial = participant.name.charAt(0)
  return (
    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-[#e5e5e5] flex items-center justify-center text-[12px] font-bold text-[#666]">
      {participant.profile_img ? (
        <Image
          src={participant.profile_img}
          alt={participant.name}
          fill
          sizes="40px"
          className="object-cover"
        />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </div>
  )
}

function ActionIconButton({
  children,
  ariaLabel,
}: {
  children: React.ReactNode
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      disabled
      aria-label={ariaLabel}
      title="가입 후 이용할 수 있어요"
      className="w-11 h-11 rounded-xl border border-[#ebebeb] bg-white text-[#999] flex items-center justify-center hover:bg-[#fafafa] disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}

function KeyValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <dt className="text-[#bbb] text-[12px] shrink-0 w-[36px]">{label}</dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </div>
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

