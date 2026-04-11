import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ensureClubUser, getClubUserId } from '@/lib/club/auth'
import { getMyClubs, fillMemberCounts } from '@/lib/club/client'
import { ClubCard } from '@/components/club/ClubCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '내 모임 | 버디모아' }

export default async function ClubHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/club/login')

  await ensureClubUser(supabase, user).catch(() => {})
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/club/login')

  const clubs = await getMyClubs(supabase, clubUserId)
  const clubsWithCount = await fillMemberCounts(supabase, clubs)

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* 헤더 */}
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#111]">🏸 버디모아</h1>
          <Link
            href="/club/create"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#111] bg-[#beff00] px-3 py-1.5 rounded-lg hover:brightness-95 transition-all"
          >
            <Plus size={15} />
            모임 만들기
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {clubsWithCount.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🏸</div>
            <p className="font-bold text-[#111] text-lg mb-1">아직 참여한 모임이 없어요</p>
            <p className="text-sm text-[#999] mb-6">새 모임을 만들거나 초대코드로 참여해보세요</p>
            <div className="flex gap-3">
              <Link
                href="/club/create"
                className="px-5 py-2.5 bg-[#beff00] text-[#111] font-semibold text-sm rounded-xl hover:brightness-95 transition-all"
              >
                모임 만들기
              </Link>
              <Link
                href="/club/join"
                className="px-5 py-2.5 bg-white border border-[#e5e5e5] text-[#111] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-all"
              >
                초대코드 입력
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#999] font-medium px-1">
              참여 중인 모임 {clubsWithCount.length}개
            </p>
            {clubsWithCount.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
            <Link
              href="/club/join"
              className="flex items-center justify-center gap-2 w-full py-3.5 border border-dashed border-[#bbb] rounded-2xl text-sm text-[#999] hover:border-[#beff00] hover:text-[#111] transition-colors"
            >
              <Plus size={16} />
              초대코드로 다른 모임 참여
            </Link>
          </>
        )}
      </main>
    </div>
  )
}
