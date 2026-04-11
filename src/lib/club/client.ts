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
    .select('role, clubs(*)')
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
    .select('*, user:users(*)')
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
    .select('*, member:club_members(*, user:users(*))')
    .eq('club_id', clubId)
    .order('points', { ascending: false })
    .order('wins', { ascending: false })

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
