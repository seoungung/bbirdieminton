import { redirect, notFound } from 'next/navigation'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { GameBoardClient } from '@/components/club/GameBoardClient'
import { DEMO_CLUBS, DEMO_MEMBERS } from '@/lib/club/demoData'
import type { Metadata } from 'next'
import type { ClubMemberWithUser, MemberRole } from '@/types/club'

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

  // ── 데모 모임: 인증 없이 목 데이터로 GameBoardClient 렌더 ──
  if (clubId.startsWith('demo-')) {
    const demoClub = DEMO_CLUBS.find(c => c.id === clubId)
    const courtCount = demoClub?.court_count ?? 3

    const demoMembers: ClubMemberWithUser[] = DEMO_MEMBERS.map(m => ({
      id: m.id,
      club_id: clubId,
      user_id: m.id,
      role: m.role as MemberRole,
      skill_score: m.skill,
      joined_at: '2026-01-01T00:00:00Z',
      removed_at: null,
      user: {
        id: m.id,
        birdieminton_user_id: m.id,
        name: m.name,
        phone: null,
        profile_img: null,
        created_at: '2026-01-01T00:00:00Z',
      },
    }))

    return (
      <GameBoardClient
        clubId={clubId}
        courtCount={courtCount}
        members={demoMembers}
        stats={[]}
        recentSessions={[]}
        membership={{ id: 'demo-owner', role: 'owner' }}
        inProgressData={null}
        isDemo
      />
    )
  }

  const supabase = await createClient()

  // ── Phase 1: 독립 쿼리 병렬 실행 ─────────────────────────
  // getAuthUser() 는 React.cache — layout에서 이미 호출됐다면 캐시 반환 (추가 네트워크 없음)
  const [
    user,
    clubResult,
    membersResult,
    statsResult,
    closedSessionsResult,
    ipSessionResult,
  ] = await Promise.all([
    getAuthUser(),
    supabase.from('clubs').select('id, court_count').eq('id', clubId).single(),
    getClubMembers(supabase, clubId),
    supabase
      .from('player_stats')
      .select('id, club_id, member_id, wins, losses, draws, win_rate, total_games, games_played, current_streak, max_streak, updated_at')
      .eq('club_id', clubId),
    supabase
      .from('sessions')
      .select('id, session_date, status, notes, match_mode, club_id, created_by, created_at')
      .eq('club_id', clubId)
      .eq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('sessions')
      .select('id, session_date')
      .eq('club_id', clubId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!user) redirect('/login')

  const club = clubResult.data
  if (!club) notFound()

  // ── Phase 2: user 결과에 의존하는 쿼리 ───────────────────
  const clubUserId = await getClubUserId(supabase, user)
  if (!clubUserId) redirect('/login')

  // ── Phase 3: clubUserId에 의존하는 멤버십 + 세션 데이터 병렬 ──
  const ipSession = ipSessionResult.data
  const closedSessions = closedSessionsResult.data ?? []

  const [membershipResult, closedSessionAttendances, ipMatchesResult] = await Promise.all([
    getMyMembership(supabase, clubId, clubUserId),
    // 종료된 세션 출석자 일괄 조회 (Promise.all 내부 중첩)
    Promise.all(
      closedSessions.map(async (session) => {
        const { data: attendances } = await supabase
          .from('attendances')
          .select('member_id')
          .eq('session_id', session.id)
          .eq('attended', true)
        return {
          session,
          memberIds: (attendances ?? []).map((a: { member_id: string }) => a.member_id),
          attendeeCount: attendances?.length ?? 0,
        }
      })
    ),
    // 진행 중 세션 매치 조회 (있을 때만)
    ipSession
      ? supabase
          .from('matches')
          .select('id, court_number, team_a_score, team_b_score')
          .eq('session_id', ipSession.id)
      : Promise.resolve({ data: [] as { id: string; court_number: number; team_a_score: number | null; team_b_score: number | null }[] }),
  ])

  if (!membershipResult) redirect('/club/home')

  // ── Phase 4: 매치 플레이어 + 출석자 조회 (ipSession 있을 때) ──
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

  if (ipSession && ipMatchesResult.data) {
    const ipMatches = ipMatchesResult.data
    const matchIds = ipMatches.map(m => m.id)

    const [ipMatchPlayersResult, ipAttendancesResult] = await Promise.all([
      matchIds.length > 0
        ? supabase
            .from('match_players')
            .select('match_id, member_id, team')
            .in('match_id', matchIds)
        : Promise.resolve({ data: [] as { match_id: string; member_id: string; team: string }[] }),
      supabase
        .from('attendances')
        .select('member_id')
        .eq('session_id', ipSession.id),
    ])

    inProgressData = {
      sessionId: ipSession.id,
      sessionDate: ipSession.session_date,
      matches: ipMatches.map(m => ({
        ...m,
        players: (ipMatchPlayersResult.data ?? [])
          .filter(p => p.match_id === m.id)
          .map(p => ({ member_id: p.member_id, team: p.team })),
      })),
      attendeeMemberIds: (ipAttendancesResult.data ?? []).map(a => a.member_id),
    }
  }

  return (
    <GameBoardClient
      clubId={clubId}
      courtCount={club.court_count ?? 2}
      members={membersResult}
      stats={statsResult.data ?? []}
      recentSessions={closedSessionAttendances}
      membership={{ id: membershipResult.id, role: membershipResult.role }}
      inProgressData={inProgressData}
    />
  )
}
