import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, Building2 } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const admin = createAdminClient()
  const { data: club } = await admin.from('clubs').select('name').eq('id', clubId).maybeSingle()
  return {
    title: club ? `${club.name} | 버디민턴 어드민` : '클럽 관전 | 버디민턴 어드민',
    robots: { index: false, follow: false },
  }
}

interface ClubDetailRow {
  id: string
  name: string
  description: string | null
  location: string | null
  activity_place: string | null
  category: string | null
  court_count: number
  plan: string | null
  max_members: number | null
  invite_code: string | null
  created_at: string
  updated_at: string | null
  owner_id: string
  owner: { id: string; name: string } | { id: string; name: string }[] | null
}

interface MemberRow {
  id: string
  role: string
  skill_score: number
  joined_at: string
  removed_at: string | null
  user: { id: string; name: string } | { id: string; name: string }[] | null
}

interface SessionRow {
  id: string
  session_date: string
  status: string
  match_mode: string | null
  notes: string | null
  created_at: string
  attendances: { count: number }[] | null
  matches: { count: number }[] | null
}

interface DuesRow {
  id: string
  year: number
  month: number
  paid: boolean
}

interface ImportLogRow {
  id: string
  import_type: string
  rows_added: number
  rows_skipped: number
  rows_failed: number
  created_at: string
  imported_by: string | null
  importer: { user: { name: string } | { name: string }[] | null } | { user: { name: string } | { name: string }[] | null }[] | null
}

/**
 * /admin/clubs/[clubId] — 클럽 단일 관전 페이지 (읽기 전용).
 *
 * 6개 섹션:
 *  1) 개요  2) 멤버  3) 세션  4) 회비  5) 임포트 로그
 */
export default async function AdminClubDetailPage({ params }: PageProps) {
  const { clubId } = await params
  const admin = createAdminClient()

  const { data: clubRaw } = await admin
    .from('clubs')
    .select(
      `
      id, name, description, location, activity_place, category, court_count, plan,
      max_members, invite_code, created_at, updated_at, owner_id,
      owner:users!clubs_owner_id_fkey(id, name)
      `
    )
    .eq('id', clubId)
    .maybeSingle()

  if (!clubRaw) notFound()
  const club = clubRaw as unknown as ClubDetailRow

  // 멤버
  const { data: membersRaw } = await admin
    .from('club_members')
    .select(
      `
      id, role, skill_score, joined_at, removed_at,
      user:users!club_members_user_id_fkey(id, name)
      `
    )
    .eq('club_id', clubId)
    .order('joined_at', { ascending: false })

  const members = (membersRaw ?? []) as unknown as MemberRow[]
  const activeMembers = members.filter((m) => !m.removed_at)
  const removedMembers = members.filter((m) => m.removed_at)

  // 최근 세션 20건
  const { data: sessionsRaw } = await admin
    .from('sessions')
    .select(
      `
      id, session_date, status, match_mode, notes, created_at,
      attendances(count),
      matches(count)
      `
    )
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(20)

  const sessions = (sessionsRaw ?? []) as unknown as SessionRow[]

  // 최근 3개월 회비
  const { months, monthRange } = recentThreeMonths()
  const { data: duesRaw } = await admin
    .from('dues')
    .select('id, year, month, paid')
    .eq('club_id', clubId)
    .gte('year', monthRange.startYear)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const dues = (duesRaw ?? []).filter((d) =>
    months.some((m) => m.year === d.year && m.month === d.month)
  ) as DuesRow[]

  // 임포트 로그
  const { data: importsRaw } = await admin
    .from('import_logs')
    .select(
      `
      id, import_type, rows_added, rows_skipped, rows_failed, created_at, imported_by,
      importer:club_members!import_logs_imported_by_fkey(
        user:users(name)
      )
      `
    )
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(50)

  const imports = (importsRaw ?? []) as unknown as ImportLogRow[]

  const ownerName = Array.isArray(club.owner)
    ? club.owner[0]?.name ?? '(알 수 없음)'
    : club.owner?.name ?? '(알 수 없음)'

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/clubs"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#999] hover:text-[#0a0a0a] mb-2"
        >
          <ArrowLeft size={12} strokeWidth={2.4} />
          전체 클럽
        </Link>
        <div className="flex items-center gap-2">
          <Building2 size={18} strokeWidth={2} className="text-[#0a0a0a]" />
          <h1 className="text-xl font-bold text-[#0a0a0a] truncate">{club.name}</h1>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#888] bg-[#f5f5f5] rounded-md px-2 py-0.5 ml-1">
            {club.plan ?? 'free'}
          </span>
        </div>
        <p className="text-[12px] text-[#999] mt-1 font-mono break-all">{club.id}</p>
      </header>

      {/* ── 1) 개요 ── */}
      <Section title="개요">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
          <DefRow label="이름" value={club.name} />
          <DefRow label="오너" value={ownerName} />
          <DefRow label="카테고리" value={club.category ?? '—'} />
          <DefRow label="장소" value={club.location ?? '—'} />
          <DefRow label="활동지" value={club.activity_place ?? '—'} />
          <DefRow label="코트 수" value={String(club.court_count)} />
          <DefRow label="최대 인원" value={club.max_members ? String(club.max_members) : '—'} />
          <DefRow
            label="초대 코드"
            value={club.invite_code ? <code className="font-mono">{club.invite_code}</code> : '—'}
          />
          <DefRow label="생성일" value={club.created_at.slice(0, 10)} />
          <DefRow
            label="수정일"
            value={club.updated_at ? club.updated_at.slice(0, 10) : '—'}
          />
        </dl>
        {club.description && (
          <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-[#999] mb-1.5">
              소개
            </p>
            <p className="text-[13px] text-[#555] whitespace-pre-wrap">{club.description}</p>
          </div>
        )}
      </Section>

      {/* ── 2) 멤버 ── */}
      <Section
        title={`멤버 (${activeMembers.length}${removedMembers.length > 0 ? ` / 탈퇴 ${removedMembers.length}` : ''})`}
      >
        {members.length === 0 ? (
          <p className="text-[13px] text-[#999]">멤버가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wide text-[#999] text-left">
                  <th className="font-bold pb-2 pr-4">이름</th>
                  <th className="font-bold pb-2 pr-4">역할</th>
                  <th className="font-bold pb-2 pr-4 tabular-nums">스킬</th>
                  <th className="font-bold pb-2 pr-4">가입일</th>
                  <th className="font-bold pb-2">탈퇴</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {members.map((m) => {
                  const userName = Array.isArray(m.user)
                    ? m.user[0]?.name ?? '(알 수 없음)'
                    : m.user?.name ?? '(알 수 없음)'
                  return (
                    <tr key={m.id} className={m.removed_at ? 'opacity-50' : ''}>
                      <td className="py-2 pr-4 font-semibold text-[#0a0a0a] truncate max-w-[180px]">
                        {userName}
                      </td>
                      <td className="py-2 pr-4">
                        <RoleBadge role={m.role} />
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-[#555]">
                        {m.skill_score}
                      </td>
                      <td className="py-2 pr-4 text-[#555] tabular-nums">
                        {m.joined_at.slice(0, 10)}
                      </td>
                      <td className="py-2 text-[#999] tabular-nums">
                        {m.removed_at ? m.removed_at.slice(0, 10) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── 3) 세션 ── */}
      <Section title={`최근 세션 (${sessions.length})`}>
        {sessions.length === 0 ? (
          <p className="text-[13px] text-[#999]">기록된 세션이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-[#f5f5f5]">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]"
              >
                <span className="font-semibold text-[#0a0a0a] tabular-nums">
                  {s.session_date}
                </span>
                <SessionStatusBadge status={s.status} />
                <span className="text-[#555]">
                  참가 {s.attendances?.[0]?.count ?? 0} · 코트 {s.matches?.[0]?.count ?? 0}
                </span>
                {s.match_mode && (
                  <span className="text-[11px] text-[#999] uppercase tracking-wide">
                    {s.match_mode}
                  </span>
                )}
                <span className="ml-auto text-[11px] text-[#999] tabular-nums">
                  {s.created_at.slice(0, 16).replace('T', ' ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── 4) 회비 (최근 3개월 요약) ── */}
      <Section title="회비 (최근 3개월)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {months.map((m) => {
            const slice = dues.filter((d) => d.year === m.year && d.month === m.month)
            const paid = slice.filter((d) => d.paid).length
            const total = slice.length
            const unpaid = total - paid
            const pct = total > 0 ? Math.round((paid / total) * 100) : 0
            return (
              <div
                key={`${m.year}-${m.month}`}
                className="bg-[#fafafa] rounded-xl border border-[#f0f0f0] p-3"
              >
                <p className="text-[11.5px] font-bold uppercase tracking-wide text-[#999]">
                  {m.year}년 {m.month}월
                </p>
                {total === 0 ? (
                  <p className="mt-2 text-[13px] text-[#999]">기록 없음</p>
                ) : (
                  <>
                    <p className="mt-1 text-xl font-extrabold text-[#0a0a0a] tabular-nums">
                      {paid}
                      <span className="text-[12px] font-bold text-[#999] ml-1">/ {total}</span>
                    </p>
                    <p className="text-[11px] text-[#555] mt-0.5">
                      납부율 {pct}% · 미납 {unpaid}
                    </p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      {/* ── 5) 임포트 로그 ── */}
      <Section title={`임포트 로그 (최근 ${imports.length})`}>
        {imports.length === 0 ? (
          <p className="text-[13px] text-[#999]">기록된 임포트가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-[#f5f5f5]">
            {imports.map((log) => {
              const importerWrap = Array.isArray(log.importer) ? log.importer[0] : log.importer
              const importer = importerWrap?.user
                ? Array.isArray(importerWrap.user)
                  ? importerWrap.user[0]?.name ?? '(알 수 없음)'
                  : importerWrap.user.name
                : '(알 수 없음)'
              return (
                <li
                  key={log.id}
                  className="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#888] bg-[#f5f5f5] rounded-md px-2 py-0.5">
                    {log.import_type}
                  </span>
                  <span className="text-[#0a0a0a] font-semibold">{importer}</span>
                  <span className="text-[#555] tabular-nums">
                    +{log.rows_added}
                    {log.rows_skipped > 0 && (
                      <span className="text-[#999] ml-2">건너뜀 {log.rows_skipped}</span>
                    )}
                    {log.rows_failed > 0 && (
                      <span className="text-[#b91c1c] ml-2">실패 {log.rows_failed}</span>
                    )}
                  </span>
                  <span className="ml-auto text-[11px] text-[#999] tabular-nums">
                    {log.created_at.slice(0, 16).replace('T', ' ')}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}

/* ─────────────────── 보조 컴포넌트 ─────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#f0f0f0]">
        <h2 className="text-[13.5px] font-bold text-[#0a0a0a]">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

function DefRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[#999] w-20 shrink-0">
        {label}
      </dt>
      <dd className="text-[13px] text-[#0a0a0a] font-medium min-w-0 flex-1">{value}</dd>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const palette: Record<string, string> = {
    owner: 'bg-[#fde68a] text-[#7c2d12]',
    manager: 'bg-[#dbeafe] text-[#1e3a8a]',
    member: 'bg-[#f5f5f5] text-[#555]',
  }
  const cls = palette[role] ?? palette.member
  const label =
    role === 'owner' ? '오너' : role === 'manager' ? '매니저' : role === 'member' ? '멤버' : role
  return (
    <span
      className={`text-[10.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${cls}`}
    >
      {label}
    </span>
  )
}

function SessionStatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    open: 'bg-[#dbeafe] text-[#1e3a8a]',
    in_progress: 'bg-[#dcfce7] text-[#166534]',
    closed: 'bg-[#f5f5f5] text-[#555]',
  }
  const cls = palette[status] ?? palette.closed
  const label =
    status === 'open'
      ? '대기'
      : status === 'in_progress'
        ? '진행중'
        : status === 'closed'
          ? '종료'
          : status
  return (
    <span
      className={`text-[10.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${cls}`}
    >
      {label}
    </span>
  )
}

/* ─────────────────── 유틸 ─────────────────── */

function recentThreeMonths(): {
  months: Array<{ year: number; month: number }>
  monthRange: { startYear: number }
} {
  const now = new Date()
  const months: Array<{ year: number; month: number }> = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }
  const startYear = Math.min(...months.map((m) => m.year))
  return { months, monthRange: { startYear } }
}
