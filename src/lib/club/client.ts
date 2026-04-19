import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Club,
  ClubMember,
  ClubMemberWithUser,
  ClubWithRole,
  Session,
  PlayerStats,
  RankingRow,
} from '@/types/club'

// ── 모임 ────────────────────────────────────────

/** 내가 속한 모임 목록 (역할 포함) */
export async function getMyClubs(
  supabase: SupabaseClient,
  clubUserId: string
): Promise<ClubWithRole[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select('role, clubs(id, name, description, court_count, created_at, owner_id, invite_code, max_members, plan, location, activity_place, thumbnail_color, thumbnail_url, category)')
    .eq('user_id', clubUserId)

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...(row.clubs as Club),
    myRole: row.role as ClubWithRole['myRole'],
    memberCount: 0,
  }))
}

/** 초대 코드로 모임 찾기 */
export async function getClubByInviteCode(
  supabase: SupabaseClient,
  inviteCode: string
): Promise<Club | null> {
  const { data } = await supabase
    .from('clubs')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()
  return data
}

// ── 멤버 ────────────────────────────────────────

/** 모임 전체 멤버 (유저 정보 조인) */
export async function getClubMembers(
  supabase: SupabaseClient,
  clubId: string
): Promise<ClubMemberWithUser[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select('id, club_id, user_id, role, joined_at, skill_score, user:users(id, name, profile_img)')
    .eq('club_id', clubId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as ClubMemberWithUser[]
}

/** 내 club_member row */
export async function getMyMembership(
  supabase: SupabaseClient,
  clubId: string,
  clubUserId: string
): Promise<ClubMember | null> {
  const { data } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()
  return data
}

// ── 세션 ────────────────────────────────────────

/** 모임의 세션 목록 (최신순) */
export async function getClubSessions(
  supabase: SupabaseClient,
  clubId: string
): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('club_id', clubId)
    .order('session_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── 랭킹 ────────────────────────────────────────

/** 모임 랭킹 (승점 내림차순) */
export async function getClubRanking(
  supabase: SupabaseClient,
  clubId: string
): Promise<RankingRow[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select('id, club_id, member_id, wins, losses, win_rate, total_games, current_streak, max_streak, member:club_members(id, user_id, role, skill_score, user:users(id, name, profile_img))')
    .eq('club_id', clubId)
    .order('wins', { ascending: false })
    .order('win_rate', { ascending: false })

  if (error) throw error

  return ((data ?? []) as unknown as Omit<RankingRow, 'rank'>[]).map((row, idx) => ({
    ...row,
    rank: idx + 1,
  }))
}

// ── 모임 멤버수 보완 ────────────────────────────

/** clubs 배열에 memberCount 채우기 */
export async function fillMemberCounts(
  supabase: SupabaseClient,
  clubs: ClubWithRole[]
): Promise<ClubWithRole[]> {
  if (clubs.length === 0) return clubs

  const ids = clubs.map((c) => c.id)
  const { data } = await supabase
    .from('club_members')
    .select('club_id')
    .in('club_id', ids)

  const countMap: Record<string, number> = {}
  for (const row of data ?? []) {
    countMap[row.club_id] = (countMap[row.club_id] ?? 0) + 1
  }

  return clubs.map((c) => ({ ...c, memberCount: countMap[c.id] ?? 0 }))
}

/**
 * 여러 club id 배열에 대해 memberCount를 한 번의 쿼리로 채우기.
 * home/page.tsx 에서 myClubs + allClubs 카운트를 한 번에 처리하는 데 사용.
 */
export async function buildMemberCountMap(
  supabase: SupabaseClient,
  clubIds: string[]
): Promise<Record<string, number>> {
  if (clubIds.length === 0) return {}
  const { data } = await supabase
    .from('club_members')
    .select('club_id')
    .in('club_id', clubIds)
  const countMap: Record<string, number> = {}
  for (const row of data ?? []) {
    countMap[row.club_id] = (countMap[row.club_id] ?? 0) + 1
  }
  return countMap
}
