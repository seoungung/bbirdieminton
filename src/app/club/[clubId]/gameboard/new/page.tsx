import { redirect, notFound } from 'next/navigation'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers, getClubMemberRatings } from '@/lib/club/client'
import { GameBoardClient } from '@/components/club/GameBoardClient'
import type { Metadata } from 'next'
import type { GameboardEvent } from '@/components/club/gameboard/types'

interface GameBoardMetadataProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: GameBoardMetadataProps): Promise<Metadata> {
  const { clubId } = await params
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

  // 이벤트 날짜 범위 계산
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)
  const thirtyDaysAhead = new Date(today)
  thirtyDaysAhead.setDate(today.getDate() + 30)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
  const thirtyDaysAheadStr = thirtyDaysAhead.toISOString().split('T')[0]

  // ── Phase 1: 독립 쿼리 병렬 실행 ─────────────────────────
  // getAuthUser() 는 React.cache — layout에서 이미 호출됐다면 캐시 반환 (추가 네트워크 없음)
  const [
    user,
    clubResult,
    membersResult,
    statsResult,
    ipSessionResult,
    ratingsMap,
    eventsResult,
  ] = await Promise.all([
    getAuthUser(),
    supabase.from('clubs').select('id, name, court_count, shuttle_default_price, settlement_account, match_point_target').eq('id', clubId).single(),
    getClubMembers(supabase, clubId),
    supabase
      .from('player_stats')
      .select('id, club_id, member_id, wins, losses, draws, games_played, win_rate, updated_at')
      .eq('club_id', clubId),
    supabase
      .from('sessions')
      .select('id, session_date')
      .eq('club_id', clubId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    getClubMemberRatings(supabase, clubId),
    supabase
      .from('club_events')
      .select('id, title, event_date, place, start_time, end_time')
      .eq('club_id', clubId)
      .gte('event_date', sevenDaysAgoStr)
      .lte('event_date', thirtyDaysAheadStr)
      .order('event_date', { ascending: true }),
  ])

  if (!user) redirect('/login')

  const club = clubResult.data
  if (!club) notFound()

  // ── RSVP 일괄 조회 (eventsResult 의존) ───────────────────
  const rawEvents = eventsResult.data ?? []
  const eventIds = rawEvents.map(e => e.id)
  const { data: rsvpRows } = eventIds.length > 0
    ? await supabase
        .from('club_event_attendances')
        .select('event_id, member_id')
        .in('event_id', eventIds)
        .eq('status', 'going')
    : { data: [] as Array<{ event_id: string; member_id: string }> }

  // event_id → goingMemberIds 그루핑
  const rsvpMap = new Map<string, string[]>()
  for (const row of rsvpRows ?? []) {
    const arr = rsvpMap.get(row.event_id) ?? []
    arr.push(row.member_id)
    rsvpMap.set(row.event_id, arr)
  }

  const events: GameboardEvent[] = rawEvents.map(e => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date,
    place: e.place,
    start_time: e.start_time,
    end_time: e.end_time,
    goingMemberIds: rsvpMap.get(e.id) ?? [],
  }))

  // ── Phase 2: user 결과에 의존하는 쿼리 ───────────────────
  const clubUserId = await getClubUserId(supabase, user)
  if (!clubUserId) redirect('/login')

  // ── Phase 3: clubUserId에 의존하는 멤버십 + 진행 중 세션 매치 병렬 ──
  const ipSession = ipSessionResult.data

  const [membershipResult, ipMatchesResult] = await Promise.all([
    getMyMembership(supabase, clubId, clubUserId),
    // 진행 중 세션 매치 조회 (있을 때만)
    ipSession
      ? supabase
          .from('matches')
          .select('id, court_number, team_a_score, team_b_score')
          .eq('session_id', ipSession.id)
      : Promise.resolve({ data: [] as { id: string; court_number: number; team_a_score: number | null; team_b_score: number | null }[] }),
  ])

  if (!membershipResult) redirect('/clubs')

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
      clubName={club.name}
      shuttleDefaultPrice={club.shuttle_default_price ?? 2500}
      settlementAccount={club.settlement_account ?? null}
      courtCount={club.court_count ?? 2}
      members={membersResult}
      stats={statsResult.data ?? []}
      ratingsMap={ratingsMap}
      membership={{ id: membershipResult.id, role: membershipResult.role }}
      matchPointTarget={(club.match_point_target ?? 25) as 21 | 25}
      inProgressData={inProgressData}
      events={events}
    />
  )
}
