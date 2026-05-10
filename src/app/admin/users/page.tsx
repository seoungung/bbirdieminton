import Link from 'next/link'
import type { Metadata } from 'next'
import { Users as UsersIcon, Search } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: '사용자 검색 | 버디민턴 어드민',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams?: Promise<{ q?: string }>
}

interface UserRow {
  id: string
  name: string
  phone: string | null
  is_placeholder: boolean | null
  birdieminton_user_id: string | null
  created_at: string
  memberships: { count: number }[] | null
}

/**
 * /admin/users — 사용자 검색 (이름 / 전화번호 부분 매칭).
 *
 * 검색어 없으면 최근 가입자 50명. 결과는 GET 폼 (form action="" method="get").
 * 폼 자체는 form 이지만 read-only 검색 — 데이터 변경 액션 없음.
 */
export default async function AdminUsersPage({ searchParams }: PageProps) {
  const resolved = (await searchParams) ?? {}
  const q = (resolved.q ?? '').trim()

  const admin = createAdminClient()

  let query = admin
    .from('users')
    .select(
      `
      id, name, phone, is_placeholder, birdieminton_user_id, created_at,
      memberships:club_members(count)
      `
    )
    .order('created_at', { ascending: false })
    .limit(50)

  if (q) {
    // ILIKE 부분 매칭 — 이름 또는 전화번호. 콤마는 .or() 안에서 escape 불필요 (단순 텍스트만 입력 가정)
    const safe = q.replace(/[%,()]/g, '')
    query = query.or(`name.ilike.%${safe}%,phone.ilike.%${safe}%`)
  }

  const { data: usersRaw } = await query
  const users = (usersRaw ?? []) as UserRow[]

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center gap-2">
          <UsersIcon size={18} strokeWidth={2} className="text-[#0a0a0a]" />
          <h1 className="text-xl font-bold text-[#0a0a0a]">사용자 검색</h1>
        </div>
        <p className="text-[13px] text-[#999] mt-1">
          이름 또는 전화번호 부분 매칭. 빈 검색어로 진입 시 최근 가입자 50명.
        </p>
      </header>

      {/* 검색 폼 — GET, 데이터 변경 없음 */}
      <form
        method="get"
        action="/admin/users"
        className="bg-white rounded-2xl border border-[#e5e5e5] p-3 flex items-center gap-2"
      >
        <Search size={15} strokeWidth={2.2} className="text-[#999] ml-2 shrink-0" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="이름 또는 전화번호"
          className="flex-1 min-w-0 px-2 py-1.5 text-[13px] bg-transparent outline-none text-[#0a0a0a] placeholder:text-[#bbb]"
          autoComplete="off"
        />
        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg bg-[#0a0a0a] text-white text-[12px] font-bold hover:bg-[#222] transition-colors"
        >
          검색
        </button>
      </form>

      {/* 결과 테이블 */}
      <section className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#f0f0f0] flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-[#0a0a0a]">
            결과 <span className="text-[#999] tabular-nums ml-1">({users.length})</span>
          </h2>
          {q && (
            <span className="text-[11px] text-[#999]">
              검색어: <code className="font-mono text-[#0a0a0a]">{q}</code>
            </span>
          )}
        </div>

        {users.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#999]">
            결과가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wide text-[#999] text-left bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="font-bold px-5 py-2">이름</th>
                  <th className="font-bold px-5 py-2">전화번호</th>
                  <th className="font-bold px-5 py-2">유형</th>
                  <th className="font-bold px-5 py-2 tabular-nums">가입 클럽</th>
                  <th className="font-bold px-5 py-2 tabular-nums">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {users.map((u) => {
                  const isReal = !u.is_placeholder && u.birdieminton_user_id
                  return (
                    <tr key={u.id}>
                      <td className="px-5 py-2.5 font-semibold text-[#0a0a0a] truncate max-w-[200px]">
                        {u.name || '(이름 없음)'}
                      </td>
                      <td className="px-5 py-2.5 text-[#555] tabular-nums">
                        {u.phone ?? '—'}
                      </td>
                      <td className="px-5 py-2.5">
                        {isReal ? (
                          <span className="text-[10.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-[#dcfce7] text-[#166534]">
                            실유저
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#854d0e]">
                            임포트
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 tabular-nums text-[#555]">
                        {u.memberships?.[0]?.count ?? 0}
                      </td>
                      <td className="px-5 py-2.5 text-[#999] tabular-nums">
                        {u.created_at.slice(0, 10)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-[11px] text-[#999]">
        검색은 최근 가입자 기준 최대 50명까지 표시됩니다. 더 정밀한 조회가 필요하면{' '}
        <Link
          href="/admin/clubs"
          className="text-[#0a0a0a] font-semibold hover:underline"
        >
          클럽 → 멤버 탭
        </Link>{' '}
        에서 확인하세요.
      </p>
    </div>
  )
}
