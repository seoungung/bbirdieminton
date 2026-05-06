'use client'

import { MapPin, CalendarClock, Coins, Users } from 'lucide-react'

interface Props {
  location: string | null
  activityPlace: string | null
  scheduleSummary: string | null
  feeMonthly: number | null
  feePerSession: number | null
  feeNote: string | null
  memberCount: number
}

/**
 * 가입 결정에 직결되는 4-grid 미니 KPI.
 * - 위치 / 일정 / 회비 / 멤버 수 — 한눈에.
 * - 빈 값은 "—" 또는 "협의" 로 처리해 빈 칸이 되지 않게.
 */
export function ClubPreviewKpiGrid({
  location,
  activityPlace,
  scheduleSummary,
  feeMonthly,
  feePerSession,
  feeNote,
  memberCount,
}: Props) {
  const locationValue =
    [location, activityPlace].filter(Boolean).join(' · ') || '미설정'
  const scheduleValue = scheduleSummary?.trim() || '미설정'
  const feeValue = formatFee({ feeMonthly, feePerSession, feeNote })

  return (
    <section aria-label="모임 핵심 정보" className="grid grid-cols-2 gap-2.5">
      <KpiCell
        icon={<MapPin size={14} strokeWidth={2.2} />}
        label="활동 지역"
        value={locationValue}
      />
      <KpiCell
        icon={<CalendarClock size={14} strokeWidth={2.2} />}
        label="정기 일정"
        value={scheduleValue}
      />
      <KpiCell
        icon={<Coins size={14} strokeWidth={2.2} />}
        label="회비"
        value={feeValue}
      />
      <KpiCell
        icon={<Users size={14} strokeWidth={2.2} />}
        label="멤버"
        value={memberCount > 0 ? `${memberCount}명` : '—'}
      />
    </section>
  )
}

function KpiCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  const isEmpty = value === '미설정' || value === '—'
  return (
    <div className="rounded-2xl border border-[#ebebeb] bg-white px-3.5 py-3 min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#999] mb-1.5">
        <span className="text-[#bbb]">{icon}</span>
        {label}
      </div>
      <p
        className={
          'text-[13px] font-bold tabular-nums break-keep ' +
          (isEmpty ? 'text-[#bbb]' : 'text-[#111]')
        }
      >
        {value}
      </p>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────

function formatFee({
  feeMonthly,
  feePerSession,
  feeNote,
}: {
  feeMonthly: number | null
  feePerSession: number | null
  feeNote: string | null
}): string {
  const hasMonthly = typeof feeMonthly === 'number' && feeMonthly > 0
  const hasPerSession = typeof feePerSession === 'number' && feePerSession > 0

  if (hasMonthly && hasPerSession) {
    return `월 ${won(feeMonthly!)} · 회 ${won(feePerSession!)}`
  }
  if (hasMonthly) return `월 ${won(feeMonthly!)}`
  if (hasPerSession) return `회당 ${won(feePerSession!)}`
  if (feeNote && feeNote.trim()) return feeNote.trim()
  return '협의'
}

function won(amount: number): string {
  if (amount >= 10000 && amount % 10000 === 0) {
    return `${(amount / 10000).toFixed(0)}만원`
  }
  return `${amount.toLocaleString('ko-KR')}원`
}
