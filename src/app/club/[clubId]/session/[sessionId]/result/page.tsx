import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { ResultInputClient } from '@/components/club/ResultInputClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '경기 결과 | 버디모아' }

export default async function ResultPage({
  params,
}: {
  params: Promise<{ clubId: string; sessionId: string }>
}) {
  const { clubId, sessionId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  const isManager = ['owner', 'manager'].includes(membership.role)

  // 세션 정보
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  if (!session) notFound()

  // 경기 목록 + 선수 정보
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      match_players(
        *,
        member:club_members(*, user:users(*))
      )
    `)
    .eq('session_id', sessionId)
    .order('court_number')

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-[1088px] mx-auto">
          <h1 className="text-base font-bold text-[#111]">경기 결과</h1>
          <p className="text-xs text-[#999] mt-0.5">코트별 점수를 입력하세요</p>
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <ResultInputClient
          sessionId={sessionId}
          clubId={clubId}
          matches={matches ?? []}
          isManager={isManager}
        />
      </main>
    </div>
  )
}
