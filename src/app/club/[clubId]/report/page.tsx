import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FileBarChart, Calendar, Users, TrendingUp, TrendingDown, Trophy } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import {
  getClubMembers,
  getClubMemberRatings,
  getClubRecentRatingDelta,
  getClubActivitySummary,
  getAttendanceChampions,
  getRecentDuesPayment,
  getMyMembership,
  type ClubActivitySummary,
  type AttendanceChampion,
  type MonthlyDuesPayment,
} from '@/lib/club/client'
import { GRADE_COLOR, GRADE_LABEL, scoreToGrade, type Grade } from '@/lib/club/grade'
import { muToGrade } from '@/lib/club/glicko2'
import type { ClubMemberWithUser } from '@/types/club'
import { ReportShareBar } from '@/components/club/ReportShareBar'

interface PageProps {
  params: Promise<{ clubId: string }>
  searchParams: Promise<{ days?: string }>
}

const GRADES: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F']
const VALID_RANGES = [30, 90, 365] as const
type DaysRange = (typeof VALID_RANGES)[number]

function parseDays(input: string | undefined): DaysRange {
  const n = Number(input)
  return (VALID_RANGES as readonly number[]).includes(n) ? (n as DaysRange) : 90
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '시즌 리포트 | 버디민턴',
    description: '모임 활동 요약 — 등급 분포, 변동 Top 5, 출석 챔피언, 회비 납부',
  }
}

export default async function ReportPage({ params, searchParams }: PageProps) {
  const { clubId } = await params
  const { days: daysParam } = await searchParams
  const days = parseDays(daysParam)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')
  if (!['owner', 'manager'].includes(membership.role)) {
    redirect(`/club/${clubId}`)
  }

  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single()
  if (!club) notFound()

  const monthsForDues = days <= 30 ? 1 : days <= 90 ? 3 : 12

  const [members, ratingsMap, recentDelta, activity, champions, duesPayment] =
    await Promise.all([
      getClubMembers(supabase, clubId),
      getClubMemberRatings(supabase, clubId),
      getClubRecentRatingDelta(supabase, clubId, days),
      getClubActivitySummary(supabase, clubId, days),
      getAttendanceChampions(supabase, clubId, days, 5),
      getRecentDuesPayment(supabase, clubId, monthsForDues),
    ])

  return (
    <ReportView
      clubId={clubId}
      clubName={club.name}
      days={days}
      members={members}
      ratingsMap={ratingsMap}
      recentDelta={recentDelta}
      activity={activity}
      champions={champions}
      duesPayment={duesPayment}
    />
  )
}

// ── 메인 뷰 ────────────────────────────────────────────────
function ReportView({
  clubId,
  clubName,
  days,
  members,
  ratingsMap,
  recentDelta,
  activity,
  champions,
  duesPayment,
}: {
  clubId: string
  clubName: string
  days: DaysRange
  members: ClubMemberWithUser[]
  ratingsMap: Record<string, { mu: number; phi: number; sigma: number }>
  recentDelta: Record<string, { totalDelta: number; matchCount: number }>
  activity: ClubActivitySummary
  champions: AttendanceChampion[]
  duesPayment: MonthlyDuesPayment[]
}) {
  const memberMap = new Map(members.map((m) => [m.id, m]))
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* 인쇄 시 숨길 헤더 */}
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3 print:hidden">
        <div className="max-w-[1088px] mx-auto flex items-center justify-between gap-3">
          <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
            <FileBarChart size={16} strokeWidth={2} />
            시즌 리포트
          </h1>
          <RangeSelector clubId={clubId} active={days} />
        </div>
      </header>

      {/* 인쇄 시 노출되는 본문 */}
      <main className="max-w-[1088px] mx-auto px-4 py-6 sm:py-8 pb-28 space-y-5 print:py-0 print:pb-0">
        {/* 리포트 표지 */}
        <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6 sm:p-8">
          <p className="text-[11px] font-bold tracking-widest text-[var(--color-brand-lime)] bg-[#0a0a0a] inline-block px-2.5 py-1 rounded">
            버디민턴 · 시즌 리포트
          </p>
          <h2
            className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] leading-[1.2] tracking-[-0.01em]"
            style={{ wordBreak: 'keep-all' }}
          >
            {clubName} 시즌 리포트
          </h2>
          <p className="mt-2 text-sm text-[#666]">
            최근 {days}일 활동 요약 · 발행 {today}
          </p>
        </section>

        {/* 1. 활동 요약 */}
        <SummarySection activity={activity} />

        {/* 2. 등급 분포 */}
        <GradeDistribution members={members} ratingsMap={ratingsMap} />

        {/* 3. Top 5 변동 */}
        <TopMovers
          members={members}
          ratingsMap={ratingsMap}
          recentDelta={recentDelta}
          memberMap={memberMap}
          days={days}
        />

        {/* 4. 출석 Top 5 */}
        <AttendanceChampions champions={champions} memberMap={memberMap} />

        {/* 5. 회비 납부 (월별) */}
        <DuesBreakdown duesPayment={duesPayment} />

        {/* 6. 푸터 */}
        <p className="text-center text-[11px] text-[#999] py-4">
          버디민턴 — 동호인이 만든 운영 도구 · birdieminton.com
        </p>
      </main>

      {/* 공유/저장 바 (sticky bottom, 인쇄 시 숨김) */}
      <ReportShareBar clubName={clubName} days={days} />
    </div>
  )
}

// ── 기간 선택 ────────────────────────────────────────────
function RangeSelector({ clubId, active }: { clubId: string; active: DaysRange }) {
  return (
    <div className="inline-flex bg-[#f0f0f0] rounded-full p-0.5">
      {VALID_RANGES.map((d) => (
        <a
          key={d}
          href={`/club/${clubId}/report?days=${d}`}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold tabular-nums transition-colors ${
            active === d
              ? 'bg-[#0a0a0a] text-white'
              : 'text-[#666] hover:text-[#111]'
          }`}
        >
          {d === 365 ? '1년' : `${d}일`}
        </a>
      ))}
    </div>
  )
}

// ── 1. 활동 요약 ──────────────────────────────────────────
function SummarySection({ activity }: { activity: ClubActivitySummary }) {
  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <SectionTitle index="01" title="활동 요약" Icon={Calendar} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <Stat label="세션" value={`${activity.sessions}회`} />
        <Stat label="총 경기" value={`${activity.matches}경기`} />
        <Stat label="활성 멤버" value={`${activity.activeMembers}명`} />
        <Stat
          label="회당 평균 출석"
          value={`${activity.avgAttendancePerSession.toFixed(1)}명`}
        />
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#fafafa] rounded-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#999]">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-[#0a0a0a] tabular-nums">{value}</p>
    </div>
  )
}

// ── 2. 등급 분포 ──────────────────────────────────────────
function effectiveGrade(
  member: { skill_score: number; id: string },
  ratingsMap: Record<string, { mu: number }>,
): Grade {
  const mu = ratingsMap[member.id]?.mu
  return mu != null ? muToGrade(mu) : scoreToGrade(member.skill_score)
}

function GradeDistribution({
  members,
  ratingsMap,
}: {
  members: ClubMemberWithUser[]
  ratingsMap: Record<string, { mu: number }>
}) {
  const counts: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
  for (const m of members) counts[effectiveGrade(m, ratingsMap)] += 1
  const total = members.length
  const max = Math.max(...Object.values(counts), 1)

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <SectionTitle index="02" title="실력 등급 분포" Icon={Users} />
      <p className="text-[12px] text-[#666] mt-1 mb-4">현재 멤버 {total}명의 등급 구성</p>
      {total === 0 ? (
        <p className="text-sm text-[#999] text-center py-6">멤버가 없어요.</p>
      ) : (
        <div className="space-y-2">
          {GRADES.map((g) => {
            const count = counts[g]
            const pct = (count / total) * 100
            const w = (count / max) * 100
            const color = GRADE_COLOR[g]
            return (
              <div key={g} className="flex items-center gap-3">
                <div
                  className={`w-9 h-7 rounded-md flex items-center justify-center text-xs font-extrabold shrink-0 ${color.bg} ${color.text}`}
                >
                  {g}
                </div>
                <span className="w-14 text-[10px] text-[#666] shrink-0">
                  {GRADE_LABEL[g]}
                </span>
                <div className="flex-1 h-7 bg-[#f0f0f0] rounded-md overflow-hidden">
                  <div
                    className={`h-full ${color.bg}`}
                    style={{ width: `${w}%` }}
                  />
                </div>
                <span className="w-16 text-right text-sm font-extrabold text-[#111] tabular-nums shrink-0">
                  {count}명
                  <span className="text-[10px] text-[#999] ml-1 font-medium">
                    {pct.toFixed(0)}%
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ── 3. Top 5 변동 ─────────────────────────────────────────
function TopMovers({
  members,
  ratingsMap,
  recentDelta,
  memberMap,
  days,
}: {
  members: ClubMemberWithUser[]
  ratingsMap: Record<string, { mu: number }>
  recentDelta: Record<string, { totalDelta: number; matchCount: number }>
  memberMap: Map<string, ClubMemberWithUser>
  days: number
}) {
  const candidates = members
    .map((m) => {
      const d = recentDelta[m.id]
      if (!d || d.matchCount === 0) return null
      return { member: m, totalDelta: d.totalDelta, matchCount: d.matchCount }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => Math.abs(b.totalDelta) - Math.abs(a.totalDelta))
    .slice(0, 5)

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <SectionTitle index="03" title="실력 변동 Top 5" Icon={TrendingUp} />
      <p className="text-[12px] text-[#666] mt-1 mb-4">
        최근 {days}일 동안 점수가 가장 많이 움직인 멤버
      </p>
      {candidates.length === 0 ? (
        <p className="text-sm text-[#999] text-center py-6">
          기간 내 경기 기록이 없어요.
        </p>
      ) : (
        <ul className="divide-y divide-[#f0f0f0]">
          {candidates.map((c, i) => {
            const grade = effectiveGrade(c.member, ratingsMap)
            const color = GRADE_COLOR[grade]
            const isUp = c.totalDelta > 0
            const memberFromMap = memberMap.get(c.member.id)
            const name = memberFromMap?.user?.name ?? '이름없음'
            return (
              <li
                key={c.member.id}
                className="flex items-center gap-3 py-3"
              >
                <span className="w-6 text-center text-[12px] font-extrabold text-[#999] tabular-nums">
                  {i + 1}
                </span>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${color.bg} ${color.text}`}
                >
                  {grade}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111] truncate">{name}</p>
                  <p className="text-[11px] text-[#999] tabular-nums">{c.matchCount}경기</p>
                </div>
                <div
                  className={`flex items-center gap-0.5 text-sm font-bold tabular-nums shrink-0 ${
                    isUp ? 'text-[var(--color-brand-court)]' : 'text-[var(--color-brand-team-b)]'
                  }`}
                >
                  {isUp ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />}
                  {isUp ? '+' : ''}
                  {Math.round(c.totalDelta)}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

// ── 4. 출석 챔피언 ────────────────────────────────────────
function AttendanceChampions({
  champions,
  memberMap,
}: {
  champions: AttendanceChampion[]
  memberMap: Map<string, ClubMemberWithUser>
}) {
  const max = Math.max(...champions.map((c) => c.attendances), 1)
  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <SectionTitle index="04" title="출석 챔피언 Top 5" Icon={Trophy} />
      <p className="text-[12px] text-[#666] mt-1 mb-4">
        모임에 가장 자주 나온 멤버 — 운영의 든든한 기둥들
      </p>
      {champions.length === 0 ? (
        <p className="text-sm text-[#999] text-center py-6">출석 기록이 없어요.</p>
      ) : (
        <ul className="space-y-2">
          {champions.map((c, i) => {
            const member = memberMap.get(c.memberId)
            const name = member?.user?.name ?? '이름없음'
            const w = (c.attendances / max) * 100
            return (
              <li key={c.memberId} className="flex items-center gap-3">
                <span className="w-6 text-center text-[12px] font-extrabold text-[#999] tabular-nums">
                  {i + 1}
                </span>
                <span className="w-20 text-sm font-bold text-[#111] truncate shrink-0">
                  {name}
                </span>
                <div className="flex-1 h-6 bg-[#f0f0f0] rounded-md overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-brand-lime)]"
                    style={{ width: `${w}%` }}
                  />
                </div>
                <span className="w-16 text-right text-sm font-extrabold text-[#111] tabular-nums shrink-0">
                  {c.attendances}회
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

// ── 5. 회비 납부 ──────────────────────────────────────────
function DuesBreakdown({ duesPayment }: { duesPayment: MonthlyDuesPayment[] }) {
  const total = duesPayment.reduce((s, m) => s + m.totalDue, 0)
  const paid = duesPayment.reduce((s, m) => s + m.paidCount, 0)
  const overall = total > 0 ? paid / total : 0

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <SectionTitle index="05" title="회비 납부" Icon={Calendar} />
      <p className="text-[12px] text-[#666] mt-1 mb-4">
        월별 납부율 — 운영진의 부드러운 독촉 데이터
      </p>
      {total === 0 ? (
        <p className="text-sm text-[#999] text-center py-6">회비 항목이 없어요.</p>
      ) : (
        <>
          <div className="space-y-2.5">
            {duesPayment.map((m) => {
              const pct = m.paidRate * 100
              const color =
                m.paidRate >= 0.9 ? 'bg-[var(--color-brand-court)]' : m.paidRate >= 0.7 ? 'bg-amber-400' : 'bg-red-400'
              return (
                <div key={`${m.year}-${m.month}`} className="flex items-center gap-3">
                  <span className="w-12 text-[11px] font-bold text-[#555] tabular-nums">
                    {m.year}.{String(m.month).padStart(2, '0')}
                  </span>
                  <div className="flex-1 h-5 bg-[#f0f0f0] rounded-md overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <span className="w-20 text-right text-[11px] font-bold text-[#111] tabular-nums shrink-0">
                    {pct.toFixed(0)}%
                    <span className="text-[#999] ml-1 font-medium">
                      {m.paidCount}/{m.totalDue}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-[#666] mt-4 pt-3 border-t border-[#f0f0f0]">
            전체 평균
            <span className="font-bold text-[#111] ml-1 tabular-nums">
              {(overall * 100).toFixed(0)}%
            </span>
          </p>
        </>
      )}
    </section>
  )
}

function SectionTitle({
  index,
  title,
  Icon,
}: {
  index: string
  title: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-extrabold text-[#999] font-mono tabular-nums">{index}</span>
      <span aria-hidden className="h-px w-6 bg-[#e5e5e5]" />
      <Icon size={14} strokeWidth={2.5} className="text-[#0a0a0a]" />
      <h3 className="text-base font-extrabold text-[#0a0a0a] tracking-[-0.01em]">{title}</h3>
    </div>
  )
}

