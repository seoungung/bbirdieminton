import Link from 'next/link'
import type { Metadata } from 'next'
import { Building2 } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: '전체 클럽 | 버디민턴 어드민',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface ClubRow {
  id: string
  name: string
  description: string | null
  location: string | null
  category: string | null
  thumbnail_color: string | null
  plan: string | null
  created_at: string
  owner_id: string
  owner: { name: string } | { name: string }[] | null
  members: { count: number }[] | null
}

/**
 * /admin/clubs — 전체 클럽 카드 그리드 (읽기 전용).
 *
 * service-role admin client 로 모든 클럽 조회. RLS 우회.
 */
export default async function AdminClubsPage() {
  const admin = createAdminClient()

  const { data: rawClubs } = await admin
    .from('clubs')
    .select(
      `
      id, name, description, location, category, thumbnail_color, plan, created_at, owner_id,
      owner:users!clubs_owner_id_fkey(name),
      members:club_members(count)
      `
    )
    .order('created_at', { ascending: false })

  const clubs = (rawClubs ?? []) as unknown as ClubRow[]

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center gap-2">
          <Building2 size={18} strokeWidth={2} className="text-[#0a0a0a]" />
          <h1 className="text-xl font-bold text-[#0a0a0a]">전체 클럽</h1>
          <span className="text-[12px] font-bold text-[#999] tabular-nums">
            ({clubs.length.toLocaleString()})
          </span>
        </div>
        <p className="text-[13px] text-[#999] mt-1">
          최신 생성순. 클럽 카드를 클릭하면 관전 페이지로 이동합니다.
        </p>
      </header>

      {clubs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-12 text-center text-[13px] text-[#999]">
          등록된 클럽이 없습니다.
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clubs.map((club) => {
            const ownerName = Array.isArray(club.owner)
              ? club.owner[0]?.name ?? '(알 수 없음)'
              : club.owner?.name ?? '(알 수 없음)'
            const memberCount = club.members?.[0]?.count ?? 0
            const thumb = club.thumbnail_color ?? '#f0f0f0'
            const planLabel = club.plan ?? 'free'

            return (
              <li key={club.id}>
                <Link
                  href={`/admin/clubs/${club.id}`}
                  className="block bg-white rounded-2xl border border-[#e5e5e5] p-4 hover:border-[#0a0a0a] hover:shadow-sm transition-all h-full"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-[#0a0a0a] font-extrabold text-[14px]"
                      style={{ backgroundColor: thumb }}
                      aria-hidden="true"
                    >
                      {club.name.trim().charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[14px] text-[#0a0a0a] truncate">
                        {club.name}
                      </p>
                      <p className="text-[11.5px] text-[#999] truncate mt-0.5">
                        {club.location ?? '장소 미설정'}
                        {club.category && ` · ${club.category}`}
                      </p>
                    </div>
                  </div>

                  {club.description && (
                    <p className="mt-3 text-[12px] text-[#555] line-clamp-2">
                      {club.description}
                    </p>
                  )}

                  <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <dt className="text-[#999] font-medium">오너</dt>
                      <dd className="text-[#0a0a0a] font-semibold truncate">{ownerName}</dd>
                    </div>
                    <div>
                      <dt className="text-[#999] font-medium">멤버</dt>
                      <dd className="text-[#0a0a0a] font-semibold tabular-nums">
                        {memberCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#999] font-medium">플랜</dt>
                      <dd className="text-[#0a0a0a] font-semibold uppercase">{planLabel}</dd>
                    </div>
                  </dl>

                  <p className="mt-3 text-[10.5px] text-[#999] tabular-nums">
                    {club.created_at.slice(0, 10)} 생성
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
