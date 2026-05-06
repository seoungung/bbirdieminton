'use client'

import { CalendarClock, MapPin } from 'lucide-react'

interface Props {
  scheduleSummary: string | null
  activityPlace: string | null
}

/**
 * 정기 일정 요약 카드.
 * Phase A — schedule_summary 자유 텍스트만 노출 (recurring 파싱은 Phase B).
 * 둘 다 비어 있으면 섹션 숨김.
 */
export function ClubPreviewSchedule({
  scheduleSummary,
  activityPlace,
}: Props) {
  const summary = scheduleSummary?.trim()
  if (!summary) return null

  return (
    <section>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#bbb] mb-2.5">
        정기 일정
      </p>
      <div className="rounded-2xl border border-[#ebebeb] bg-[var(--color-brand-bg-sub)] px-4 py-3.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-white border border-[#ebebeb] flex items-center justify-center text-[var(--color-brand-court-deep)]">
            <CalendarClock size={14} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#111] leading-snug whitespace-pre-wrap break-keep">
              {summary}
            </p>
            {activityPlace && (
              <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-[#666]">
                <MapPin size={11} strokeWidth={2.2} className="text-[#bbb]" />
                {activityPlace}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
