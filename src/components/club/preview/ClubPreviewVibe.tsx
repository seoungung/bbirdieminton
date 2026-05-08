'use client'

import { CalendarDays, Activity, UserPlus, Sparkles } from 'lucide-react'
import { GRADE_LABEL, type Grade } from '@/lib/club/grade'
import type { ClubPreviewVibe as VibeStats } from '@/types/club'

interface Props {
  stats: VibeStats | null
  /** 정기 일정 텍스트 — 모임 settings 의 schedule_summary */
  scheduleSummary?: string | null
}

/**
 * 모임 분위기 — 4 개 KPI 카드로 한눈에.
 *
 *   ┌──────────────┬──────────────┐
 *   │ 정기 일정    │ 평균 출석    │
 *   ├──────────────┼──────────────┤
 *   │ 최근 가입    │ 급수 분포    │
 *   └──────────────┴──────────────┘
 *
 * 데이터 부족 시 (멤버 0 + 일정 X) 섹션 자체 숨김.
 */
export function ClubPreviewVibe({ stats, scheduleSummary }: Props) {
  const hasMembers = !!stats && stats.total_members > 0
  const hasSchedule = !!scheduleSummary && scheduleSummary.trim().length > 0
  if (!hasMembers && !hasSchedule) return null

  /* 정기 일정 카드 표시값 */
  const scheduleText = hasSchedule ? scheduleSummary!.trim() : '—'

  /* 평균 출석 */
  const attendText =
    stats && stats.avg_attendance_30d > 0
      ? `${stats.avg_attendance_30d.toFixed(1)}명`
      : '—'

  /* 최근 가입 */
  const recentText = stats ? `${stats.recent_join_30d}명` : '0명'

  /* 급수 분포 — 가장 비중 높은 등급 + 비율, 분포 부족 시 "—" */
  const gradeOrder: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F']
  const gradeSegments = (stats ? gradeOrder : []).map((g) => ({
    grade: g,
    count: stats?.grade_distribution?.[g] ?? 0,
  }))
  const gradeTotal = gradeSegments.reduce((s, x) => s + x.count, 0)
  const top = gradeSegments
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)[0]
  const topPct =
    top && gradeTotal > 0 ? Math.round((top.count / gradeTotal) * 100) : 0
  const gradePrimary = top ? `${GRADE_LABEL[top.grade]}` : '—'
  const gradeSecondary = top ? `${topPct}% 비중` : '데이터 부족'

  return (
    <section>
      <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)] mb-3">
        모임 분위기
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <KpiCard
          icon={<CalendarDays size={14} strokeWidth={2.2} />}
          label="정기 일정"
          primary={scheduleText}
          secondary={hasSchedule ? '주간 운영 시간' : '아직 등록되지 않았어요'}
          /* 정기 일정은 텍스트가 길 수 있어 살짝 작게 */
          primaryClassName="text-[15px] sm:text-[16px] leading-snug font-bold line-clamp-2"
        />
        <KpiCard
          icon={<Activity size={14} strokeWidth={2.2} />}
          label="평균 출석"
          primary={attendText}
          secondary="최근 30일 평균"
        />
        <KpiCard
          icon={<UserPlus size={14} strokeWidth={2.2} />}
          label="최근 가입"
          primary={recentText}
          secondary={
            stats && stats.recent_join_30d > 0
              ? '최근 30일 신규'
              : '최근 30일 기준'
          }
        />
        <KpiCard
          icon={<Sparkles size={14} strokeWidth={2.2} />}
          label="급수 분포"
          primary={gradePrimary}
          secondary={gradeSecondary}
        />
      </div>

      {/* 급수 mini-bar — 분포 충분 (3+) 일 때 추가 시각화 */}
      {gradeTotal >= 3 && (
        <div className="mt-3 rounded-2xl border border-[#ebebeb] bg-white p-3.5">
          <p className="text-[11px] font-semibold text-[#999] mb-2">
            급수별 비율
          </p>
          <GradeBar
            segments={gradeSegments
              .filter((s) => s.count > 0)
              .map((s) => ({
                grade: s.grade,
                pct: (s.count / gradeTotal) * 100,
              }))}
          />
        </div>
      )}
    </section>
  )
}

// ── Sub components ───────────────────────────────────────────

function KpiCard({
  icon,
  label,
  primary,
  secondary,
  primaryClassName,
}: {
  icon: React.ReactNode
  label: string
  primary: string
  secondary: string
  primaryClassName?: string
}) {
  const isEmpty = primary === '—'
  return (
    <div className="rounded-2xl border border-[#ebebeb] bg-white px-3.5 py-3 min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#999] mb-1.5">
        <span className="text-[#bbb]">{icon}</span>
        {label}
      </div>
      <p
        className={
          (primaryClassName ??
            'text-[22px] font-extrabold tabular-nums leading-none') +
          ' ' +
          (isEmpty ? 'text-[#bbb]' : 'text-[#111]')
        }
      >
        {primary}
      </p>
      <p className="mt-1.5 text-[11px] text-[#999]">{secondary}</p>
    </div>
  )
}

/* 등급별 색상 — 차트 fill 톤 */
const GRADE_FILL: Record<Grade, string> = {
  S: 'bg-[var(--color-brand-elite)]',
  A: 'bg-[#ef4444]',
  B: 'bg-[#f97316]',
  C: 'bg-[#f59e0b]',
  D: 'bg-[#10b981]',
  E: 'bg-[#0ea5e9]',
  F: 'bg-[#94a3b8]',
}

function GradeBar({ segments }: { segments: Array<{ grade: Grade; pct: number }> }) {
  return (
    <>
      <div className="flex h-5 rounded-md overflow-hidden bg-[#f3f3f3]">
        {segments.map((s) => {
          const showInline = s.pct >= 14
          return (
            <div
              key={s.grade}
              className={`${GRADE_FILL[s.grade]} flex items-center justify-center text-white text-[10px] font-bold tabular-nums`}
              style={{ width: `${s.pct}%` }}
              aria-label={`${GRADE_LABEL[s.grade]} ${Math.round(s.pct)}%`}
              title={`${GRADE_LABEL[s.grade]} ${Math.round(s.pct)}%`}
            >
              {showInline ? `${Math.round(s.pct)}%` : ''}
            </div>
          )
        })}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-semibold text-[#555]">
        {segments.map((s) => (
          <li key={s.grade} className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-sm ${GRADE_FILL[s.grade]}`}
              aria-hidden
            />
            <span className="text-[#111]">{GRADE_LABEL[s.grade]}</span>
            <span className="text-[#999] tabular-nums">{Math.round(s.pct)}%</span>
          </li>
        ))}
      </ul>
    </>
  )
}
