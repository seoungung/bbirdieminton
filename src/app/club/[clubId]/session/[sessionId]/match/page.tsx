import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BackButton } from '@/components/club/BackButton'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { MatchAssignClient } from '@/components/club/MatchAssignClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '경기 배정 | 버디모아' }

export default async function MatchAssignPage({
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
  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    redirect(`/club/${clubId}`)
  }

  // 세션 정보
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  if (!session) notFound()

  // 클럽 정보 (court_count)
  const { data: club } = await supabase.from('clubs').select('court_count').eq('id', clubId).single()
  if (!club) notFound()

  // 출석한 멤버만
  const { data: attendances } = await supabase
    .from('attendances')
    .select('member_id')
    .eq('session_id', sessionId)
    .eq('attended', true)

  const attendedIds = new Set((attendances ?? []).map((a) => a.member_id))
  const allMembers = await getClubMembers(supabase, clubId)
  const attendedMembers = allMembers.filter((m) => attendedIds.has(m.id))

  // 기존 경기 목록
  const { data: existingMatches } = await supabase
    .from('matches')
    .select('*, match_players(*)')
    .eq('session_id', sessionId)
    .order('court_number')

  // player_stats (게임수 균등 배정용)
  const { data: stats } = await supabase
    .from('player_stats')
    .select('*')
    .eq('club_id', clubId)

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center justify-between">
          <BackButton fallback={`/club/${clubId}/session/${sessionId}`} label="뒤로" />
          <div className="text-center">
            <h1 className="font-bold text-[#111] text-base">경기 배정</h1>
            <p className="text-xs text-[#999] mt-0.5">
              출석 {attendedMembers.length}명 · 코트 {club.court_count}면 · {session.match_mode}
            </p>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <MatchAssignClient
          sessionId={sessionId}
          clubId={clubId}
          matchMode={session.match_mode}
          courtCount={club.court_count}
          attendedMembers={attendedMembers}
          existingMatches={existingMatches ?? []}
          stats={stats ?? []}
        />
      </main>
    </div>
  )
}
