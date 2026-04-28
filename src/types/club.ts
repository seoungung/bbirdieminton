// =============================================
// 버디민턴 클럽 (birdieminton.com/club) 타입 정의
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
  /** 셔틀콕 1개당 기본 가격 (원) — 풀 이체 시 회원 청구 단가로도 사용 (지정콕 ~2,500원) */
  shuttle_default_price: number
  /** 입금 계좌 안내 문구 (예: "신한 110-xxx-xxx (홍길동)") */
  settlement_account: string | null
  /** 동호회 여유분 셔틀콕 잔량 — 트리거로 자동 갱신 */
  shuttle_pool_count: number
  /** 평일 출석자 1인당 기본 제출 개수 (기본 2) */
  shuttle_weekday_required: number
  /** 주말 출석자 1인당 기본 제출 개수 (기본 3) */
  shuttle_weekend_required: number
  /** 게임 종료 점수 (21 정식 대회 / 25 일반 클럽) — 디폴트 25 */
  match_point_target: 21 | 25
  created_at: string
  updated_at: string
}

// ── 셔틀콕비 정산 ───────────────────────────────

/** 세션별 정산 기록 */
export interface SessionSettlement {
  id: string
  session_id: string
  club_id: string
  shuttle_count: number
  shuttle_unit_price: number
  extra_cost: number
  attendee_count: number
  per_person_amount: number
  memo: string | null
  created_at: string
}

/** 정산별 멤버 납부 상태 */
export interface SettlementMember {
  id: string
  settlement_id: string
  member_id: string
  amount: number
  paid: boolean
  paid_at: string | null
}

/** 정산 + 멤버 납부 상태 조합 (리스트 화면용) */
export interface SettlementWithMembers extends SessionSettlement {
  members: Array<SettlementMember & { memberName: string }>
  paidCount: number
}

// ── 셔틀콕 제출 트래커 (v2 신규) ────────────────────────────

/**
 * 세션별 출석자 셔틀콕 제출 현황 (운영진 입력 전용)
 *
 * 운영 흐름:
 * 1) 운영진이 출석자별로 본인이 가져온 개수(brought_count) 입력
 * 2) 부족분은 풀에서 이체(paid_from_pool) — amount_owed 자동 계산
 * 3) 회원이 동호회에 결제 완료 시 amount_paid_at 시각 기록
 */
export interface ShuttleSubmission {
  id: string
  club_id: string
  session_id: string
  member_id: string
  required_count: number
  brought_count: number
  paid_from_pool: number
  amount_owed: number
  amount_paid_at: string | null
  created_at: string
  updated_at: string
}

/** 풀 변동 사유 */
export type ShuttlePoolReason = 'replenish' | 'pool_payment' | 'manual_adjust'

/** 셔틀콕 풀 변동 감사 로그 (immutable) */
export interface ShuttlePoolLog {
  id: string
  club_id: string
  delta: number
  reason: ShuttlePoolReason
  related_submission_id: string | null
  amount_paid: number | null
  created_by: string | null
  note: string | null
  created_at: string
}

/** 출석자 + 제출 현황 결합 (운영진 입력 화면용) */
export interface SubmissionWithMember extends ShuttleSubmission {
  memberName: string
  memberRole: MemberRole
  skillScore: number
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
  draws: number
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

export type NoticeType = 'announcement' | 'event' | 'general'
export type NotificationType = 'new_notice' | 'attendance_reminder' | 'game_result' | 'system'

export interface Notice {
  id: string
  club_id: string
  author_member_id: string | null
  title: string
  body: string
  type: NoticeType
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  club_id: string
  member_id: string
  notice_id: string | null
  type: NotificationType
  message: string
  read_at: string | null
  created_at: string
}

// ── 비멤버 미리보기 (get_club_preview RPC) ─────────────────

/** preview 페이지 정기모임 카드 */
export interface ClubPreviewEvent {
  id: string
  title: string
  /** YYYY-MM-DD (KST) */
  event_date: string
  /** HH:MM:SS or null */
  start_time: string | null
  /** HH:MM:SS or null */
  end_time: string | null
  place: string | null
  fee: string | null
  /** 0 = 무제한 */
  max_attend: number
  going_count: number
}

/** preview 페이지 멤버 미리보기 */
export interface ClubPreviewMember {
  id: string
  name: string
  profile_img: string | null
  role: MemberRole
  /** ISO timestamp */
  joined_at: string
}

/** get_club_preview RPC 반환 JSON */
export interface ClubPreview {
  id: string
  name: string
  description: string | null
  location: string | null
  activity_place: string | null
  category: string | null
  court_count: number | null
  thumbnail_color: string | null
  thumbnail_url: string | null
  created_at: string
  owner_name: string | null
  member_count: number
  upcoming_events: ClubPreviewEvent[]
  recent_members: ClubPreviewMember[]
}
