import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BarChart3, TrendingUp, TrendingDown, AlertCircle, Sparkles, CalendarDays, Wallet } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import {
  getClubMembers,
  getClubMemberRatings,
  getClubRecentRatingDelta,
  getClubAttendanceCounts,
  getWeeklyAttendanceTrend,
  getRecentDuesPayment,
  getMyMembership,
  type WeeklyAttendance,
  type MonthlyDuesPayment,
} from '@/lib/club/client'
import {
  GRADE_COLOR,
  GRADE_LABEL,
  scoreToGrade,
  type Grade,
} from '@/lib/club/grade'
import { muToGrade } from '@/lib/club/glicko2'
import type { ClubMemberWithUser } from '@/types/club'

interface PageProps {
  params: Promise<{ clubId: string }>
}

const GRADES: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F']

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '분석 | 버디민턴',
    description: '클럽 등급 분포, 최근 변동, 신입 적응 모니터링',
  }
}

export default async function StatsPage({ params }: PageProps) {
  const { clubId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

  // ownerOnly — 운영진만 접근 (분석 nav도 ownerOnly)
  if (!['owner', 'manager'].includes(membership.role)) {
    redirect(`/club/${clubId}`)
  }

  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single()
  if (!club) notFound()

  const [members, ratingsMap, recentDelta, attendanceCounts, weeklyTrend, duesPayment] = await Promise.all([
    getClubMembers(supabase, clubId),
    getClubMemberRatings(supabase, clubId),
    getClubRecentRatingDelta(supabase, clubId, 30),
    getClubAttendanceCounts(supabase, clubId),
    getWeeklyAttendanceTrend(supabase, clubId, 4),
    getRecentDuesPayment(supabase, clubId, 3),
  ])

  return (
    <StatsView
      members={members}
      ratingsMap={ratingsMap}
      recentDelta={recentDelta}
      attendanceCounts={attendanceCounts}
      weeklyTrend={weeklyTrend}
      duesPayment={duesPayment}
    />
  )
}

// ── 메인 뷰 (실제 + 데모 공통) ─────────────────────────────
function StatsView({
  members,
  ratingsMap,
  recentDelta,
  attendanceCounts,
  weeklyTrend,
  duesPayment,
}: {
  members: ClubMemberWithUser[]
  ratingsMap: Record<string, { mu: number; phi: number; sigma: number }>
  recentDelta: Record<string, { totalDelta: number; matchCount: number }>
  attendanceCounts: Record<string, number>
  weeklyTrend: WeeklyAttendance[]
  duesPayment: MonthlyDuesPayment[]
}) {
  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <BarChart3 size={16} strokeWidth={2} />분석
            </h1>
            <p className="text-xs text-[#999] mt-0.5">
              우리 모임의 실력 균형 · 최근 흐름 · 신입 적응 한눈에
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-5 space-y-4">
        <GradeDistributionCard members={members} ratingsMap={ratingsMap} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AttendanceTrendCard weeklyTrend={weeklyTrend} />
          <DuesPaymentCard duesPayment={duesPayment} />
        </div>
        <TopInsightsCard
          members={members}
          ratingsMap={ratingsMap}
          recentDelta={recentDelta}
        />
        <NewMemberRiskCard members={members} attendanceCounts={attendanceCounts} />
      </main>
    </div>
  )
}

// ── 출석 트렌드 카드 ──────────────────────────────────────
function AttendanceTrendCard({ weeklyTrend }: { weeklyTrend: WeeklyAttendance[] }) {
  const maxAvg = Math.max(...weeklyTrend.map((w) => w.avgPerSession), 1)
  const totalSessions = weeklyTrend.reduce((s, w) => s + w.sessions, 0)
  const totalAttendees = weeklyTrend.reduce((s, w) => s + w.attendees, 0)
  const overallAvg = totalSessions > 0 ? totalAttendees / totalSessions : 0

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] inline-flex items-center gap-1.5">
            <CalendarDays size={11} strokeWidth={2.5} />
            출석
          </p>
          <h2 className="text-base font-extrabold text-[#111] mt-0.5">
            출석 트렌드
          </h2>
        </div>
        <p className="text-[11px] text-[#999]">최근 4주</p>
      </div>

      {totalSessions === 0 ? (
        <p className="text-sm text-[#999] text-center py-8">
          최근 4주 동안 진행된 세션이 없어요.
        </p>
      ) : (
        <>
          <div className="flex items-end gap-2 h-24 mb-2">
            {weeklyTrend.map((w) => {
              const heightPct = (w.avgPerSession / maxAvg) * 100
              const date = new Date(w.weekStart)
              const label = `${date.getMonth() + 1}/${date.getDate()}`
              return (
                <div key={w.weekStart} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-[var(--color-brand-lime)] rounded-t-md transition-all"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                      title={`세션 ${w.sessions}회 · 출석 ${w.attendees}명 · 회당 ${w.avgPerSession.toFixed(1)}명`}
                    />
                  </div>
                  <span className="text-[10px] text-[#999] tabular-nums">{label}</span>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-[#666] mt-3 pt-3 border-t border-[#f0f0f0]">
            세션 {totalSessions}회 · 출석 {totalAttendees}명 ·
            <span className="font-bold text-[#111] ml-1">회당 평균 {overallAvg.toFixed(1)}명</span>
          </p>
        </>
      )}
    </section>
  )
}

// ── 회비 납부율 카드 ──────────────────────────────────────
function DuesPaymentCard({ duesPayment }: { duesPayment: MonthlyDuesPayment[] }) {
  const totalDue = duesPayment.reduce((s, m) => s + m.totalDue, 0)
  const totalPaid = duesPayment.reduce((s, m) => s + m.paidCount, 0)
  const overallRate = totalDue > 0 ? totalPaid / totalDue : 0

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] inline-flex items-center gap-1.5">
            <Wallet size={11} strokeWidth={2.5} />
            회비
          </p>
          <h2 className="text-base font-extrabold text-[#111] mt-0.5">
            회비 납부율
          </h2>
        </div>
        <p className="text-[11px] text-[#999]">최근 3개월</p>
      </div>

      {totalDue === 0 ? (
        <p className="text-sm text-[#999] text-center py-8">
          최근 3개월 회비 항목이 없어요.
        </p>
      ) : (
        <>
          <div className="space-y-2.5 mb-3">
            {duesPayment.map((m) => {
              const pct = m.paidRate * 100
              const color =
                m.paidRate >= 0.9
                  ? 'bg-[var(--color-brand-court)]'
                  : m.paidRate >= 0.7
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              return (
                <div key={`${m.year}-${m.month}`} className="flex items-center gap-3">
                  <span className="w-12 text-[11px] font-bold text-[#555] tabular-nums">
                    {m.year}.{String(m.month).padStart(2, '0')}
                  </span>
                  <div className="flex-1 h-5 bg-[#f0f0f0] rounded-md overflow-hidden">
                    <div
                      className={`h-full ${color} transition-all`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-[11px] font-bold text-[#111] tabular-nums shrink-0">
                    {pct.toFixed(0)}%
                    <span className="text-[#999] ml-1 font-medium">
                      {m.paidCount}/{m.totalDue}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-[#666] pt-3 border-t border-[#f0f0f0]">
            전체 평균
            <span className="font-bold text-[#111] ml-1 tabular-nums">
              {(overallRate * 100).toFixed(0)}%
            </span>
            <span className="text-[#999] ml-1">
              ({totalPaid}/{totalDue})
            </span>
          </p>
        </>
      )}
    </section>
  )
}

// ── ① 등급 분포 카드 ──────────────────────────────────────
function effectiveGrade(
  member: { skill_score: number; id: string },
  ratingsMap: Record<string, { mu: number }>,
): Grade {
  const mu = ratingsMap[member.id]?.mu
  return mu != null ? muToGrade(mu) : scoreToGrade(member.skill_score)
}

function GradeDistributionCard({
  members,
  ratingsMap,
}: {
  members: ClubMemberWithUser[]
  ratingsMap: Record<string, { mu: number }>
}) {
  const counts: Record<Grade, number> = {
    S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
  }
  for (const m of members) {
    counts[effectiveGrade(m, ratingsMap)] += 1
  }
  const total = members.length
  const max = Math.max(...Object.values(counts), 1)
  const ratedCount = members.filter((m) => ratingsMap[m.id] != null).length

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#999]">
            등급 분포
          </p>
          <h2 className="text-base font-extrabold text-[#111] mt-0.5">
            우리 모임 실력 분포
          </h2>
        </div>
        <p className="text-[11px] text-[#999]">
          총 {total}명 · 자동 갱신 {ratedCount}명
        </p>
      </div>

      {total === 0 ? (
        <p className="text-sm text-[#999] text-center py-6">아직 멤버가 없어요.</p>
      ) : (
        <div className="space-y-2">
          {GRADES.map((g) => {
            const count = counts[g]
            const pct = total > 0 ? (count / total) * 100 : 0
            const barWidth = (count / max) * 100
            const color = GRADE_COLOR[g]
            return (
              <div key={g} className="flex items-center gap-3">
                <div
                  className={`w-9 h-7 rounded-md flex items-center justify-center text-xs font-extrabold shrink-0 ${color.bg} ${color.text}`}
                >
                  {g}
                </div>
                <div className="flex-1 h-7 bg-[#f0f0f0] rounded-md overflow-hidden">
                  <div
                    className={`h-full ${color.bg} transition-[width]`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="w-20 text-right shrink-0">
                  <span className="text-sm font-extrabold text-[#111] tabular-nums">
                    {count}명
                  </span>
                  <span className="text-[10px] text-[#999] ml-1 tabular-nums">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-[10px] text-[#999] mt-4 leading-relaxed">
        경기 기록이 쌓인 멤버는 자동 갱신된 등급으로, 아직 경기 없는 멤버는
        운영자가 입력한 등급으로 표시돼요.
      </p>
    </section>
  )
}

// ── ② Top 5 인사이트 카드 ─────────────────────────────────
function TopInsightsCard({
  members,
  ratingsMap,
  recentDelta,
}: {
  members: ClubMemberWithUser[]
  ratingsMap: Record<string, { mu: number }>
  recentDelta: Record<string, { totalDelta: number; matchCount: number }>
}) {
  // 최근 30일 내 매치 1회 이상 + |totalDelta| 큰 순으로 5명
  const candidates = members
    .map((m) => {
      const d = recentDelta[m.id]
      if (!d || d.matchCount === 0) return null
      return {
        member: m,
        totalDelta: d.totalDelta,
        matchCount: d.matchCount,
        currentMu: ratingsMap[m.id]?.mu ?? null,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => Math.abs(b.totalDelta) - Math.abs(a.totalDelta))
    .slice(0, 5)

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#999]">
            화제의 멤버
          </p>
          <h2 className="text-base font-extrabold text-[#111] mt-0.5">
            최근 30일 점수 변동 Top 5
          </h2>
        </div>
        <Sparkles size={16} className="text-[var(--color-brand-lime)]" strokeWidth={2.5} />
      </div>

      {candidates.length === 0 ? (
        <p className="text-sm text-[#999] text-center py-12 px-4">
          아직 변동이 쌓이지 않았어요. 경기 결과가 입력되면 여기에 hot/cold mover가
          나타납니다.
        </p>
      ) : (
        <ul className="divide-y divide-[#f0f0f0]">
          {candidates.map((c) => {
            const grade = effectiveGrade(c.member, ratingsMap)
            const color = GRADE_COLOR[grade]
            const isUp = c.totalDelta > 0
            return (
              <li
                key={c.member.id}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${color.bg} ${color.text}`}
                >
                  {grade}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111] truncate">
                    {c.member.user?.name ?? '이름없음'}
                  </p>
                  <p className="text-[11px] text-[#999] tabular-nums">
                    {c.matchCount}경기
                    {c.currentMu != null && ` · 현재 ${Math.round(c.currentMu)}`}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-0.5 text-sm font-bold tabular-nums shrink-0 ${
                    isUp ? 'text-[var(--color-brand-court)]' : 'text-[var(--color-brand-team-b)]'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp size={15} strokeWidth={2.5} />
                  ) : (
                    <TrendingDown size={15} strokeWidth={2.5} />
                  )}
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

// ── ③ 신입 적응 모니터링 카드 ─────────────────────────────
function NewMemberRiskCard({
  members,
  attendanceCounts,
}: {
  members: ClubMemberWithUser[]
  attendanceCounts: Record<string, number>
}) {
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  // 최근 30일 내 가입 + 출석 ≤ 1회
  const atRisk = members
    .filter((m) => {
      if (m.removed_at) return false
      const joined = new Date(m.joined_at).getTime()
      if (joined < thirtyDaysAgo) return false
      const att = attendanceCounts[m.id] ?? 0
      return att <= 1
    })
    .map((m) => ({
      member: m,
      attendance: attendanceCounts[m.id] ?? 0,
      daysSinceJoin: Math.floor(
        (now - new Date(m.joined_at).getTime()) / (24 * 60 * 60 * 1000),
      ),
    }))
    .sort((a, b) => b.daysSinceJoin - a.daysSinceJoin)

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#999]">
            신입 케어
          </p>
          <h2 className="text-base font-extrabold text-[#111] mt-0.5">
            연락 한 번 필요한 신입
          </h2>
        </div>
        <p className="text-[11px] text-[#999]">최근 30일 가입 · 출석 ≤1회</p>
      </div>

      {atRisk.length === 0 ? (
        <div className="text-center py-10 px-4">
          <Sparkles size={28} className="text-[var(--color-brand-lime)] mx-auto mb-2" strokeWidth={2} />
          <p className="text-sm font-bold text-[#111]">
            모든 신입이 잘 정착하고 있어요
          </p>
          <p className="text-xs text-[#999] mt-1">
            이탈 리스크 0명 · 운영 잘 되고 있습니다.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#f0f0f0]">
          {atRisk.map((r) => (
            <li
              key={r.member.id}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                <AlertCircle size={18} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111] truncate">
                  {r.member.user?.name ?? '이름없음'}
                </p>
                <p className="text-[11px] text-[#999] tabular-nums">
                  가입 {r.daysSinceJoin}일 전 · 출석{' '}
                  <span
                    className={
                      r.attendance === 0 ? 'text-[var(--color-brand-team-b)] font-bold' : 'text-[#555]'
                    }
                  >
                    {r.attendance}회
                  </span>
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                연락 권장
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

