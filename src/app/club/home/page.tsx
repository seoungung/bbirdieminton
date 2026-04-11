import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ensureClubUser, getClubUserId } from '@/lib/club/auth'
import { getMyClubs, fillMemberCounts } from '@/lib/club/client'
import { ClubCard } from '@/components/club/ClubCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '게임보드 | 버디민턴' }

export default async function ClubHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await ensureClubUser(supabase, user).catch(() => {})
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const clubs = await getMyClubs(supabase, clubUserId)
  const clubsWithCount = await fillMemberCounts(supabase, clubs)

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* ── Hero ── */}
      <div className="bg-[#0a0a0a] py-10 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <p className="text-[#beff00] text-[10px] font-bold tracking-[0.2em] mb-3 uppercase">
            Birdieminton
          </p>
          <h1 className="text-[32px] font-extrabold text-white mb-2 tracking-tight">
            🎮 게임보드
          </h1>
          <p className="text-sm text-white/50 mb-7">
            함께하는 배드민턴, 더 스마트하게
          </p>
          <Link
            href="/club/create"
            className="inline-flex items-center gap-2 bg-[#beff00] text-[#111] font-bold px-5 py-3 rounded-xl hover:brightness-95 transition-all text-sm"
          >
            <Plus size={15} />
            게임보드 만들기
          </Link>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {[
              '✅ 출석 · 코트 배정',
              '⚡ 실력 균등 매칭',
              '🏆 자동 랭킹',
            ].map((label) => (
              <span
                key={label}
                className="bg-white/8 border border-white/10 text-white/55 text-xs px-3.5 py-1.5 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="bg-white border-b border-[#e5e5e5] py-3 px-4">
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            placeholder="게임보드 이름으로 검색..."
            className="flex-1 bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
          />
          <button className="bg-[#111] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#333] transition-colors">
            검색
          </button>
        </div>
      </div>

      {/* ── Club list ── */}
      <main className="max-w-lg mx-auto px-4 py-5 space-y-3">
        {clubsWithCount.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🏸</div>
            <p className="font-bold text-[#111] text-lg mb-1">
              참여한 게임보드가 없어요
            </p>
            <p className="text-sm text-[#999] mb-6">
              새 게임보드를 만들거나 초대코드로 참여해보세요
            </p>
            <div className="flex gap-3">
              <Link
                href="/club/create"
                className="px-5 py-2.5 bg-[#beff00] text-[#111] font-semibold text-sm rounded-xl hover:brightness-95 transition-all"
              >
                게임보드 만들기
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
              참여 중인 게임보드 {clubsWithCount.length}개
            </p>
            {clubsWithCount.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
            <Link
              href="/club/join"
              className="flex items-center justify-center gap-2 w-full py-3.5 border border-dashed border-[#bbb] rounded-2xl text-sm text-[#999] hover:border-[#beff00] hover:text-[#111] transition-colors"
            >
              <Plus size={16} />
              초대코드로 다른 게임보드 참여
            </Link>
          </>
        )}
      </main>
    </div>
  )
}
