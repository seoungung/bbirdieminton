// =============================================
// 버디모아 (birdieminton.com/club) 타입 정의
// =============================================

export type ClubPlan = 'free' | 'pro' | 'club_plus'
export type MemberRole = 'owner' | 'manager' | 'member'
export type SessionStatus = 'open' | 'in_progress' | 'closed'
export type MatchMode = 'game_count' | 'skill_balance' | 'random'  // 'custom' 제거 (UI 미구현)
export type TeamSide = 'A' | 'B'

// ── DB 기본 타입 ──────────────────────────────

export interface ClubUser {
  id: string
  birdieminton_user_id: string
  name: string
  phone: string | null
  profile_img: string | null
  created_at: string
}

export interface Club {
  id: string
  owner_id: string | null
  name: string
  description: string | null
  location: string | null
  activity_place: string | null
  category: string | null
  thumbnail_color: string
  thumbnail_url: string | null
  invite_code: string
  max_members: number
  court_count: number
  plan: ClubPlan
  created_at: string
  updated_at: string
}

export interface ClubMember {
  id: string
  club_id: string
  user_id: string
  role: MemberRole
  skill_score: number
  joined_at: string
  removed_at: string | null  // 강퇴 시각 (null = 활성 멤버)
}

export interface Session {
  id: string
  club_id: string
  created_by: string | null
  session_date: string
  match_mode: MatchMode
  status: SessionStatus
  notes: string | null
  created_at: string
}

export interface Attendance {
  id: string
  session_id: string
  member_id: string
  attended: boolean
}

export interface Match {
  id: string
  session_id: string
  court_number: number
  team_a_score: number | null
  team_b_score: number | null
  match_mode: MatchMode | null
  excluded_from_ranking: boolean
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface MatchPlayer {
  id: string
  match_id: string
  member_id: string
  team: TeamSide
}

export interface PlayerStats {
  id: string
  club_id: string
  member_id: string
  wins: number
  losses: number
  games_played: number
  win_rate: number
  updated_at: string
}

/** 정기모임 (일회성 이벤트) */
export interface ClubEvent {
  id: string
  club_id: string
  title: string
  event_date: string
  start_time: string | null
  end_time: string | null
  place: string | null
  fee: string | null
  max_attend: number
  created_by: string | null
  created_at: string
}

export type EventAttendStatus = 'going' | 'not_going'

export interface ClubEventAttendance {
  id: string
  event_id: string
  member_id: string
  status: EventAttendStatus
  updated_at: string
}

// ── 복합/뷰 타입 ───────────────────────────────

/** 내가 속한 모임 + 내 역할 */
export interface ClubWithRole extends Club {
  myRole: MemberRole
  memberCount: number
}

/** 멤버 + 유저 정보 조인 */
export interface ClubMemberWithUser extends ClubMember {
  user: ClubUser
}

/** 세션 + 출석 수 요약 */
export interface SessionSummary extends Session {
  attendedCount: number
  totalMembers: number
}

/** 경기 + 선수 목록 */
export interface MatchWithPlayers extends Match {
  players: (MatchPlayer & { member: ClubMemberWithUser })[]
}

/** 랭킹 행 */
export interface RankingRow extends PlayerStats {
  member: ClubMemberWithUser
  rank: number
}

/** 경기 배정용 팀 */
export interface CourtAssignment {
  courtNumber: number
  teamA: ClubMember[]
  teamB: ClubMember[]
}
