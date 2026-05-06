'use client'

import { Sparkles, Users2, Activity, UserPlus } from 'lucide-react'
import { GRADE_LABEL, type Grade } from '@/lib/club/grade'
import type { ClubPreviewVibe as VibeStats } from '@/types/club'

interface Props {
  stats: VibeStats | null
}

/**
 * 사회적 증거 — 평균 출석 / 등급 분포 / 성비 / 최근 가입.
 * 데이터 부족 시 (멤버 0명) 섹션 자체 숨김.
 *
 * Phase B 개선:
 * - 등급 분포: 색상 stacked bar 가 두꺼워지고, 충분히 넓은 segment 안에 % 라벨 표시
 * - legend: 등급별 색상 dot + 라벨 + %
 * - 평균 출석: 큰 숫자 + 부제 ("최근 30일 기준")
 */
export function ClubPreviewVibe({ stats }: Props) {
  if (!stats) return null
  if (stats.total_members === 0) return null

  const sumGenderKnown = stats.male_count + stats.female_count
  const showGender = sumGenderKnown >= 3 // 표본 너무 작으면 숨김

  const gradeOrder: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F']
  const gradeTotal = gradeOrder.reduce(
    (sum, g) => sum + (stats.grade_distribution[g] ?? 0),
    0,
  )
  const showGrades = gradeTotal >= 3

  return (
    <section>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#bbb] mb-2.5">
        모임 분위기
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        <StatCell
          icon={<Activity size={14} strokeWidth={2.2} />}
          label="평균 출석"
          primary={
            stats.avg_attendance_30d > 0
              ? `${stats.avg_attendance_30d.toFixed(1)}명`
              : '—'
          }
          secondary="최근 30일 기준"
        />
        <StatCell
          icon={<UserPlus size={14} strokeWidth={2.2} />}
          label="최근 가입"
          primary={stats.recent_join_30d > 0 ? `${stats.recent_join_30d}명` : '0명'}
          secondary={stats.recent_join_30d > 0 ? '최근 30일 신규' : '최근 30일 기준'}
        />
      </div>

      {showGender && (
        <div className="mt-3">
          <GenderBar male={stats.male_count} female={stats.female_count} />
        </div>
      )}

      {showGrades && (
        <div className="mt-3">
          <GradeBar
            distribution={stats.grade_distribution}
            total={gradeTotal}
            order={gradeOrder}
          />
        </div>
      )}
    </section>
  )
}

// ── Sub components ───────────────────────────────────────────

function StatCell({
  icon,
  label,
  primary,
  secondary,
}: {
  icon: React.ReactNode
  label: string
  primary: string
  secondary: string
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
          'text-[22px] font-extrabold tabular-nums leading-none ' +
          (isEmpty ? 'text-[#bbb]' : 'text-[#111]')
        }
      >
        {primary}
      </p>
      <p className="mt-1.5 text-[11px] text-[#999]">{secondary}</p>
    </div>
  )
}

function GenderBar({ male, female }: { male: number; female: number }) {
  const total = male + female
  const malePct = total > 0 ? Math.round((male / total) * 100) : 0
  const femalePct = total > 0 ? 100 - malePct : 0

  return (
    <div className="rounded-2xl border border-[#ebebeb] bg-white px-3.5 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#999]">
          <Users2 size={14} strokeWidth={2.2} className="text-[#bbb]" />
          성비
        </div>
        <p className="text-[11px] font-semibold text-[#999] tabular-nums">
          남 {malePct}% · 여 {femalePct}%
        </p>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-[#f0f0f0]">
        <div
          className="bg-[var(--color-brand-team-a)]"
          style={{ width: `${malePct}%` }}
          aria-label={`남성 ${malePct}%`}
        />
        <div
          className="bg-[var(--color-brand-team-b)]"
          style={{ width: `${femalePct}%` }}
          aria-label={`여성 ${femalePct}%`}
        />
      </div>
    </div>
  )
}

/* 등급별 색상 — 토큰 우선, 보조 색은 hex.
   GRADE_COLOR 의 light bg/text 와는 별개로, 차트 fill 용 deep 톤. */
const GRADE_FILL: Record<Grade, string> = {
  S: 'bg-[var(--color-brand-elite)]',
  A: 'bg-[#ef4444]',
  B: 'bg-[#f97316]',
  C: 'bg-[#f59e0b]',
  D: 'bg-[#10b981]',
  E: 'bg-[#0ea5e9]',
  F: 'bg-[#94a3b8]',
}

function GradeBar({
  distribution,
  total,
  order,
}: {
  distribution: VibeStats['grade_distribution']
  total: number
  order: Grade[]
}) {
  // 0이 아닌 등급만 표시. 비율 계산 후 가장 큰 segment 부터 정렬.
  const segments = order
    .map((g) => {
      const count = distribution[g] ?? 0
      return { grade: g, count, pct: total > 0 ? (count / total) * 100 : 0 }
    })
    .filter((s) => s.count > 0)

  if (segments.length === 0) return null

  return (
    <div className="rounded-2xl border border-[#ebebeb] bg-white px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#999] mb-2">
        <Sparkles size={14} strokeWidth={2.2} className="text-[#bbb]" />
        등급 분포
      </div>

      {/* 두꺼운 stacked bar — segment 폭이 충분하면 안에 % 라벨 노출 */}
      <div className="flex h-5 rounded-md overflow-hidden bg-[#f3f3f3]">
        {segments.map((s) => {
          const pct = s.pct
          const showInline = pct >= 14 // 좁은 segment 는 라벨 생략 (legend 에서 확인)
          return (
            <div
              key={s.grade}
              className={`${GRADE_FILL[s.grade]} flex items-center justify-center text-white text-[10px] font-bold tabular-nums`}
              style={{ width: `${pct}%` }}
              aria-label={`${GRADE_LABEL[s.grade]} ${Math.round(pct)}%`}
              title={`${GRADE_LABEL[s.grade]} ${Math.round(pct)}%`}
            >
              {showInline ? `${Math.round(pct)}%` : ''}
            </div>
          )
        })}
      </div>

      {/* legend — 색상 dot + 라벨 + % */}
      <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-semibold text-[#555]">
        {segments.map((s) => {
          const pct = Math.round(s.pct)
          return (
            <li key={s.grade} className="inline-flex items-center gap-1.5">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-sm ${GRADE_FILL[s.grade]}`}
                aria-hidden
              />
              <span className="text-[#111]">{GRADE_LABEL[s.grade]}</span>
              <span className="text-[#999] tabular-nums">{pct}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
