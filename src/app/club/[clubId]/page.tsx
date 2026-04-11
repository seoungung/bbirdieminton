import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getClubMembers } from '@/lib/club/client'
import { GameDashboard } from '@/components/club/GameDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '게임 대시보드 | 버디민턴' }

export default async function ClubDashboardPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const { data: club } = await supabase.from('clubs').select('*').eq('id', clubId).single()
  if (!club) notFound()

  // 오늘의 세션 조회
  const today = new Date().toISOString().split('T')[0]
  const { data: todaySession } = await supabase
    .from('sessions')
    .select('*')
    .eq('club_id', clubId)
    .eq('session_date', today)
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const members = await getClubMembers(supabase, clubId)

  // 현재 유저의 membership
  const myMembership = members.find((m) => m.user_id === clubUserId) ?? null

  return (
    <GameDashboard
      club={club}
      members={members}
      todaySession={todaySession ?? null}
      myMembership={myMembership}
    />
  )
}
