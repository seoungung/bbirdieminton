import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Sparkles,
  CalendarDays,
  Wallet,
  Trophy,
  FileBarChart,
  Calendar,
  Users,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import {
  getClubMembers,
  getClubMemberRatings,
  getClubRecentRatingDelta,
  getClubAttendanceCounts,
  getWeeklyAttendanceTrend,
  getRecentDuesPayment,
  getClubRanking,
  getClubActivitySummary,
  getAttendanceChampions,
  getMyMembership,
  type WeeklyAttendance,
  type MonthlyDuesPayment,
  type ClubActivitySummary,
  type AttendanceChampion,
} from '@/lib/club/client'
import {
  GRADE_COLOR,
  GRADE_LABEL,
  scoreToGrade,
  type Grade,
} from '@/lib/club/grade'
import { muToGrade } from '@/lib/club/glicko2'
import type { ClubMemberWithUser } from '@/types/club'
import { RankingTable } from '@/components/club/RankingTable'
import { RankingGuideBanner } from '@/components/club/RankingGuideBanner'
import { ReportShareBar } from '@/components/club/ReportShareBar'
import { StatsTabsNav, type StatsTabKey } from '@/components/club/stats/StatsTabsNav'

interface PageProps {
  params: Promise<{ clubId: string }>
  searchParams: Promise<{ tab?: string | string[]; days?: string | string[] }>
}

const GRADES: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F']
const VALID_RANGES = [30, 90, 365] as const
type DaysRange = (typeof VALID_RANGES)[number]

function parseDays(input: string | string[] | undefined): DaysRange {
  const v = Array.isArray(input) ? input[0] : input
  const n = Number(v)
  return (VALID_RANGES as readonly number[]).includes(n) ? (n as DaysRange) : 90
}

function normalizeTab(raw: string | string[] | undefined): StatsTabKey {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v === 'ranking' || v === 'report') return v
  return 'analytics'
}

const TAB_META: Record<StatsTabKey, { title: string; subtitle: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }> = {
  analytics: {
    title: '분석',
    subtitle: '우리 모임의 실력 균형 · 최근 흐름 · 신입 적응 한눈에',
    Icon: BarChart3,
  },
  ranking: {
    title: '랭킹',
    subtitle: '승률 기준 · 최다 승 우선',
    Icon: Trophy,
  },
  report: {
    title: '시즌 리포트',
    subtitle: '등급 분포 · 변동 Top 5 · 출석 챔피언 · 회비 납부',
    Icon: FileBarChart,
  },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `스탯 | ${club.name}` : '스탯 | 버디민턴',
    description: '클럽 등급 분포·랭킹·시즌 리포트를 한 곳에서',
  }
}

/**
 * PRD §2.2 [스탯] 통합 허브.
 *
 * 상단 탭 3분할 (T0-1-2):
 *   1) [분석]        — owner/manager 만 (등급 분포·Top mover·신입 케어 등 운영 지표)
 *   2) [랭킹]        — 멤버십 필수 (전체 회원 노출, /ranking 라우트와 양쪽 미러링)
 *   3) [시즌 리포트] — owner/manager 만 (인쇄/PDF 가능한 시즌 요약)
 *
 * 권한 분기 (R-2a 완화):
 *   - 페이지 진입 자체는 멤버십만 검사 — [랭킹] 탭이 회원에게 의미 있음.
 *   - [분석] / [시즌 리포트] 는 server-side 에서 isManager 분기 → 회원이 직접 URL 로
 *     접근해도 [랭킹] 으로 fallback.
 *   - proOnly 정책은 페이지·탭 단위가 아니라 사이드바 라벨 한정 (실 enforcement 없음).
 *
 * 데이터 fetch 는 활성 탭 기준 lazy (R-2b 완화).
 */
export default async function StatsPage({ params, searchParams }: PageProps) {
  const { clubId } = await params
  const { tab: rawTab, days: rawDays } = await searchParams
  const requestedTab = normalizeTab(rawTab)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

  const isManager = ['owner', 'manager'].includes(membership.role)

  /* 탭 권한 분기 — 회원이 [분석]/[시즌 리포트] 에 직접 URL 진입한 경우 [랭킹] 으로 fallback. */
  const activeTab: StatsTabKey =
    (requestedTab === 'analytics' || requestedTab === 'report') && !isManager
      ? 'ranking'
      : requestedTab

  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single()
  if (!club) notFound()

  const lockedTabs: StatsTabKey[] = isManager ? [] : ['analytics', 'report']
  const meta = TAB_META[activeTab]
  const days = parseDays(rawDays)

  return (
    <div className={activeTab === 'report' ? 'bg-[#fafafa] min-h-screen' : undefined}>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3 print:hidden">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <meta.Icon size={16} strokeWidth={2} />
              {meta.title}
            </h1>
            <p className="text-xs text-[#999] mt-0.5">{meta.subtitle}</p>
          </div>
        </div>
      </header>

      <main
        className={`max-w-[1088px] mx-auto px-4 py-5 ${
          activeTab === 'report' ? 'sm:py-8 pb-28 print:py-0 print:pb-0' : 'space-y-4'
        } print:max-w-none print:px-0`}
      >
        <div className="print:hidden">
          <StatsTabsNav
            clubId={clubId}
            activeTab={activeTab}
            lockedTabs={lockedTabs}
            extraQuery={
              activeTab === 'report'
                ? { report: `days=${days}` }
                : undefined
            }
          />
        </div>

        {activeTab === 'analytics' && (
          <AnalyticsTab clubId={clubId} />
        )}

        {activeTab === 'ranking' && (
          <RankingTab clubId={clubId} clubUserId={clubUserId} />
        )}

        {activeTab === 'report' && (
          <ReportTab clubId={clubId} clubName={club.name} days={days} />
        )}
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// [분석] 탭 — 기존 stats 콘텐츠
// ─────────────────────────────────────────────────────────

async function AnalyticsTab({ clubId }: { clubId: string }) {
  const supabase = await createClient()
  const [members, ratingsMap, recentDelta, attendanceCounts, weeklyTrend, duesPayment] =
    await Promise.all([
      getClubMembers(supabase, clubId),
      getClubMemberRatings(supabase, clubId),
      getClubRecentRatingDelta(supabase, clubId, 30),
      getClubAttendanceCounts(supabase, clubId),
      getWeeklyAttendanceTrend(supabase, clubId, 4),
      getRecentDuesPayment(supabase, clubId, 3),
    ])

  return (
    <div className="space-y-4">
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

// ─────────────────────────────────────────────────────────
// [랭킹] 탭 — /ranking 라우트와 양쪽 미러링
// ─────────────────────────────────────────────────────────

async function RankingTab({
  clubId,
  clubUserId,
}: {
  clubId: string
  clubUserId: string
}) {
  const supabase = await createClient()
  const [ranking, ratingsMap] = await Promise.all([
    getClubRanking(supabase, clubId),
    getClubMemberRatings(supabase, clubId),
  ])

  return (
    <div className="space-y-4">
      <RankingGuideBanner />
      <RankingTable ranking={ranking} currentUserId={clubUserId} ratingsMap={ratingsMap} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// [시즌 리포트] 탭 — /report 라우트 흡수
// ─────────────────────────────────────────────────────────

async function ReportTab({
  clubId,
  clubName,
  days,
}: {
  clubId: string
  clubName: string
  days: DaysRange
}) {
  const supabase = await createClient()
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
      clubName={clubName}
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
    <div className="space-y-5">
      {/* 인쇄 시 숨길 기간 선택 바 */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] px-4 py-3 flex items-center justify-between gap-3 print:hidden">
        <p className="text-[12px] text-[#666]">
          최근 <span className="font-bold text-[#111] tabular-nums">{days}일</span> 활동 요약
        </p>
        <RangeSelector clubId={clubId} active={days} />
      </div>

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

      <SummarySection activity={activity} />
      <GradeDistribution members={members} ratingsMap={ratingsMap} />
      <TopMovers
        members={members}
        ratingsMap={ratingsMap}
        recentDelta={recentDelta}
        memberMap={memberMap}
        days={days}
      />
      <AttendanceChampions champions={champions} memberMap={memberMap} />
      <DuesBreakdown duesPayment={duesPayment} />

      <p className="text-center text-[11px] text-[#999] py-4">
        버디민턴 — 동호인이 만든 운영 도구 · birdieminton.com
      </p>

      <ReportShareBar clubName={clubName} days={days} />
    </div>
  )
}

// ── 기간 선택 — stats 통합 탭 시그니처 (`?tab=report&days=N`) ─────────
function RangeSelector({ clubId, active }: { clubId: string; active: DaysRange }) {
  return (
    <div className="inline-flex bg-[#f0f0f0] rounded-full p-0.5">
      {VALID_RANGES.map((d) => (
        <a
          key={d}
          href={`/club/${clubId}/stats?tab=report&days=${d}`}
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
