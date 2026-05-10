import Link from 'next/link'
import type { Metadata } from 'next'
import { Building2, Users as UsersIcon, Activity, Sparkles, Upload } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: '마스터 대시보드 | 버디민턴 어드민',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * /admin — 시스템 통계 대시보드 (읽기 전용).
 *
 * 모든 데이터 조회는 service-role admin client 사용. RLS 우회.
 * 카드 UI 만 표시 — 클릭 시 각 상세 트리로 이동.
 */
export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoIso = sevenDaysAgo.toISOString()

  const [
    clubsCountRes,
    usersTotalRes,
    usersRealRes,
    usersPlaceholderRes,
    sessionsActiveRes,
    clubsRecentRes,
    usersRecentRes,
    importLogsRes,
  ] = await Promise.all([
    admin.from('clubs').select('id', { count: 'exact', head: true }),
    admin.from('users').select('id', { count: 'exact', head: true }),
    admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_placeholder', false),
    admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_placeholder', true),
    admin
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_progress'),
    admin
      .from('clubs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgoIso),
    admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgoIso),
    admin
      .from('import_logs')
      .select('id, club_id, import_type, rows_added, rows_skipped, rows_failed, created_at, clubs(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalClubs = clubsCountRes.count ?? 0
  const totalUsers = usersTotalRes.count ?? 0
  const realUsers = usersRealRes.count ?? 0
  const placeholderUsers = usersPlaceholderRes.count ?? 0
  const activeSessions = sessionsActiveRes.count ?? 0
  const recentClubs = clubsRecentRes.count ?? 0
  const recentUsers = usersRecentRes.count ?? 0
  const recentImports = (importLogsRes.data ?? []) as Array<{
    id: string
    club_id: string
    import_type: string
    rows_added: number
    rows_skipped: number
    rows_failed: number
    created_at: string
    clubs: { name: string } | { name: string }[] | null
  }>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-[#0a0a0a]">시스템 대시보드</h1>
        <p className="text-[13px] text-[#999] mt-1">
          전체 플랫폼 현황 스냅샷. 모든 수치는 실시간 조회 (캐시 없음).
        </p>
      </header>

      {/* 1차 통계 카드 그리드 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Building2 size={16} strokeWidth={2} />}
          label="전체 클럽"
          value={totalClubs.toLocaleString()}
          href="/admin/clubs"
        />
        <StatCard
          icon={<UsersIcon size={16} strokeWidth={2} />}
          label="전체 사용자"
          value={totalUsers.toLocaleString()}
          href="/admin/users"
          sublabel={`실유저 ${realUsers.toLocaleString()} / 임포트 ${placeholderUsers.toLocaleString()}`}
        />
        <StatCard
          icon={<Activity size={16} strokeWidth={2} />}
          label="진행중 세션"
          value={activeSessions.toLocaleString()}
          sublabel="status = in_progress"
        />
        <StatCard
          icon={<Sparkles size={16} strokeWidth={2} />}
          label="최근 7일 신규"
          value={`+${recentClubs}`}
          sublabel={`클럽 ${recentClubs} / 가입자 ${recentUsers}`}
        />
      </section>

      {/* 최근 임포트 로그 */}
      <section className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload size={14} strokeWidth={2} className="text-[#555]" />
            <h2 className="text-[13.5px] font-bold text-[#0a0a0a]">최근 임포트 로그</h2>
          </div>
          <Link
            href="/admin/imports"
            className="text-[11.5px] font-bold text-[#999] hover:text-[#0a0a0a] uppercase tracking-wide"
          >
            전체보기 →
          </Link>
        </div>

        {recentImports.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#999]">
            기록된 임포트 로그가 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-[#f5f5f5]">
            {recentImports.map((log) => {
              const clubName = Array.isArray(log.clubs)
                ? log.clubs[0]?.name ?? '(삭제된 클럽)'
                : log.clubs?.name ?? '(삭제된 클럽)'
              return (
                <li key={log.id} className="px-5 py-3 flex items-center gap-3 text-[12.5px]">
                  <span className="font-semibold text-[#0a0a0a] truncate max-w-[180px]">
                    {clubName}
                  </span>
                  <span className="text-[11.5px] font-bold uppercase tracking-wide text-[#888] bg-[#f5f5f5] rounded-md px-2 py-0.5">
                    {log.import_type}
                  </span>
                  <span className="text-[#555] tabular-nums">
                    +{log.rows_added}
                    {log.rows_skipped > 0 && (
                      <span className="text-[#999] ml-2">건너뜀 {log.rows_skipped}</span>
                    )}
                    {log.rows_failed > 0 && (
                      <span className="text-[#b91c1c] ml-2">실패 {log.rows_failed}</span>
                    )}
                  </span>
                  <span className="ml-auto text-[11.5px] text-[#999] tabular-nums">
                    {formatRelative(log.created_at)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
  href?: string
}) {
  const inner = (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 hover:border-[#0a0a0a] hover:shadow-sm transition-all h-full">
      <div className="flex items-center gap-1.5 text-[#555]">
        {icon}
        <p className="text-[11.5px] font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-extrabold text-[#0a0a0a] mt-2 tabular-nums">{value}</p>
      {sublabel && <p className="text-[11px] text-[#999] mt-1">{sublabel}</p>}
    </div>
  )
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    )
  }
  return inner
}

function formatRelative(iso: string): string {
  const created = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '방금'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}시간 전`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 30) return `${diffDay}일 전`
  return created.toISOString().slice(0, 10)
}
