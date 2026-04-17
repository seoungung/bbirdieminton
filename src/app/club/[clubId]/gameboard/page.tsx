import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { GameBoardClient } from '@/components/club/GameBoardClient'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import type { Metadata } from 'next'
import type { Session } from '@/types/club'

interface GameBoardMetadataProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: GameBoardMetadataProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (demo) return { title: `게임보드 | ${demo.name}`, description: '실시간 경기 배정 및 결과 입력' }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return { title: club ? `게임보드 | ${club.name}` : '게임보드 | 버디민턴', description: '실시간 경기 배정 및 결과 입력' }
}

export default async function GameBoardPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  const { data: club } = await supabase.from('clubs').select('*').eq('id', clubId).single()
  if (!club) notFound()

  // 모임 멤버 전체
  const members = await getClubMembers(supabase, clubId)

  // 플레이어 스탯 (game_count 배정 방식 + 기본 정보용)
  const { data: statsData } = await supabase
    .from('player_stats')
    .select('*')
    .eq('club_id', clubId)

  // 최근 종료된 세션 (정기모임 인원 불러오기용) — 최대 5개
  const { data: closedSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('club_id', clubId)
    .eq('status', 'closed')
    .order('created_at', { ascending: false })
    .limit(5)

  // 각 세션의 출석자 목록도 함께 조회
  const recentSessions = await Promise.all(
    (closedSessions ?? []).map(async (session: Session) => {
      const { data: attendances } = await supabase
        .from('attendances')
        .select('member_id')
        .eq('session_id', session.id)
        .eq('attended', true)
      return {
        session,
        memberIds: (attendances ?? []).map(
          (a: { member_id: string }) => a.member_id
        ),
        attendeeCount: attendances?.length ?? 0,
      }
    })
  )

  // 진행 중인 세션 복원 데이터
  let inProgressData: {
    sessionId: string
    sessionDate: string
    matches: Array<{
      id: string
      court_number: number
      team_a_score: number | null
      team_b_score: number | null
      players: Array<{ member_id: string; team: string }>
    }>
    attendeeMemberIds: string[]
  } | null = null

  const { data: ipSession } = await supabase
    .from('sessions')
    .select('id, session_date')
    .eq('club_id', clubId)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (ipSession) {
    const { data: ipMatches } = await supabase
      .from('matches')
      .select('id, court_number, team_a_score, team_b_score')
      .eq('session_id', ipSession.id)

    const matchIds = (ipMatches ?? []).map((m: { id: string }) => m.id)

    const { data: ipMatchPlayers } = matchIds.length > 0
      ? await supabase
          .from('match_players')
          .select('match_id, member_id, team')
          .in('match_id', matchIds)
      : { data: [] }

    const { data: ipAttendances } = await supabase
      .from('attendances')
      .select('member_id')
      .eq('session_id', ipSession.id)

    inProgressData = {
      sessionId: ipSession.id,
      sessionDate: ipSession.session_date,
      matches: (ipMatches ?? []).map((m: { id: string; court_number: number; team_a_score: number | null; team_b_score: number | null }) => ({
        ...m,
        players: (ipMatchPlayers ?? [])
          .filter((p: { match_id: string }) => p.match_id === m.id)
          .map((p: { member_id: string; team: string }) => ({ member_id: p.member_id, team: p.team })),
      })),
      attendeeMemberIds: (ipAttendances ?? []).map((a: { member_id: string }) => a.member_id),
    }
  }

  return (
    <GameBoardClient
      clubId={clubId}
      courtCount={club.court_count ?? 2}
      members={members}
      stats={statsData ?? []}
      recentSessions={recentSessions}
      membership={{ id: membership.id, role: membership.role }}
      inProgressData={inProgressData}
    />
  )
}
