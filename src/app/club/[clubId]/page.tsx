import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { Plus, CalendarDays, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getClubSessions, getClubMembers } from '@/lib/club/client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '모임 홈 | 버디모아' }

export default async function ClubDashboardPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/club/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/club/login')

  // 모임 정보 조회
  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()

  if (!club) notFound()

  const [sessions, members] = await Promise.all([
    getClubSessions(supabase, clubId),
    getClubMembers(supabase, clubId),
  ])

  const recentSessions = sessions.slice(0, 3)

  return (
    <div>
      {/* 헤더 */}
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-[#111] leading-snug">{club.name}</h1>
            <p className="text-xs text-[#999]">멤버 {members.length}명</p>
          </div>
          <Link
            href={`/club/${clubId}/session/new`}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#111] bg-[#beff00] px-3 py-1.5 rounded-lg hover:brightness-95 transition-all"
          >
            <Plus size={15} />
            세션 시작
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* 초대코드 */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4">
          <p className="text-xs text-[#999] font-medium mb-1">초대코드</p>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-xl tracking-widest text-[#111] uppercase">
              {club.invite_code}
            </span>
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined') {
                  navigator.clipboard.writeText(club.invite_code)
                }
              }}
              className="text-xs text-[#999] border border-[#e5e5e5] px-2.5 py-1 rounded-lg hover:bg-[#f8f8f8] transition-colors"
            >
              복사
            </button>
          </div>
        </div>

        {/* 최근 세션 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#111] text-sm">최근 세션</h2>
            <Link href={`/club/${clubId}/ranking`} className="text-xs text-[#999] hover:text-[#111]">
              랭킹 보기 →
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="bg-white border border-dashed border-[#bbb] rounded-2xl p-8 text-center">
              <CalendarDays size={28} className="text-[#bbb] mx-auto mb-2" />
              <p className="text-sm text-[#999]">아직 세션이 없어요</p>
              <Link
                href={`/club/${clubId}/session/new`}
                className="mt-3 inline-block text-sm font-semibold text-[#111] bg-[#beff00] px-4 py-2 rounded-xl hover:brightness-95 transition-all"
              >
                첫 세션 시작하기
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/club/${clubId}/session/${session.id}`}
                  className="flex items-center justify-between bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 hover:border-[#beff00] transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#111]">
                      {new Date(session.session_date).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </p>
                    <p className="text-xs text-[#999] mt-0.5">
                      {session.status === 'open'
                        ? '진행 예정'
                        : session.status === 'in_progress'
                          ? '진행 중'
                          : '완료'}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-[#bbb]" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
