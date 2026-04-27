-- ============================================================
-- RLS Policies — 모든 클럽 테이블
-- Helper functions: auth_club_user_id, is_club_member,
--   is_club_manager, is_session_member, is_event_member, share_club_with
-- ============================================================

-- ── users ──────────────────────────────────────────────────
-- 본인 row 또는 같은 클럽 멤버의 row 조회 (이름 표시용)
CREATE POLICY "users: 본인 또는 공동 클럽 멤버 조회" ON users
  FOR SELECT USING (
    birdieminton_user_id = auth.uid()
    OR share_club_with(users.id)
  );

-- 본인만 생성 (ensureClubUser upsert용)
CREATE POLICY "users: 본인 생성" ON users
  FOR INSERT WITH CHECK (birdieminton_user_id = auth.uid());

-- 본인만 수정
CREATE POLICY "users: 본인 수정" ON users
  FOR UPDATE USING (birdieminton_user_id = auth.uid());

-- ── clubs ──────────────────────────────────────────────────
-- 소속 클럽만 조회
CREATE POLICY "clubs: 멤버 조회" ON clubs
  FOR SELECT USING (
    is_club_member(clubs.id, auth_club_user_id())
  );

-- owner만 수정
CREATE POLICY "clubs: owner 수정" ON clubs
  FOR UPDATE USING (
    owner_id = auth_club_user_id()
  );

-- INSERT/DELETE: create_club RPC / delete_club_cascade RPC (SECURITY DEFINER) 사용

-- ── club_members ───────────────────────────────────────────
CREATE POLICY "club_members: 같은 클럽 멤버 조회" ON club_members
  FOR SELECT USING (
    is_club_member(club_members.club_id, auth_club_user_id())
  );

-- 운영진이 역할/스킬 수정 (강퇴: removed_at 설정 포함)
CREATE POLICY "club_members: 운영진 수정" ON club_members
  FOR UPDATE USING (
    is_club_manager(club_members.club_id, auth_club_user_id())
  );

-- INSERT: join_club_by_invite_code RPC / create_club RPC (SECURITY DEFINER) 사용

-- ── club_events / club_event_attendances ──────────────────
-- 정기모임 RLS 는 20260427000004_events_rls.sql 에서 더 세분화된 정책으로 관리.
-- 여기서는 멱등 보장을 위해 호환 정책을 (재)생성하지 않고 위임.
-- 만약 이 파일이 먼저 적용된 환경(이전 배포)에서는 20260427000004 이 DROP IF EXISTS
-- 로 덮어쓰므로 안전.

-- ── sessions ───────────────────────────────────────────────
CREATE POLICY "sessions: 멤버 조회" ON sessions
  FOR SELECT USING (
    is_club_member(sessions.club_id, auth_club_user_id())
  );

-- 멤버 누구나 세션 생성/수정 (게임보드, 대회 진행)
CREATE POLICY "sessions: 멤버 생성·수정·삭제" ON sessions
  FOR ALL USING (
    is_club_member(sessions.club_id, auth_club_user_id())
  );

-- ── matches ────────────────────────────────────────────────
CREATE POLICY "matches: 멤버 조회" ON matches
  FOR SELECT USING (
    is_session_member(matches.session_id)
  );

CREATE POLICY "matches: 멤버 생성·수정·삭제" ON matches
  FOR ALL USING (
    is_session_member(matches.session_id)
  );

-- ── match_players ──────────────────────────────────────────
CREATE POLICY "match_players: 멤버 전체 CRUD" ON match_players
  FOR ALL USING (
    is_session_member(
      (SELECT session_id FROM matches WHERE id = match_players.match_id)
    )
  );

-- ── attendances ────────────────────────────────────────────
CREATE POLICY "attendances: 멤버 조회" ON attendances
  FOR SELECT USING (
    is_session_member(attendances.session_id)
  );

CREATE POLICY "attendances: 멤버 생성·수정·삭제" ON attendances
  FOR ALL USING (
    is_session_member(attendances.session_id)
  );

-- ── player_stats ───────────────────────────────────────────
CREATE POLICY "player_stats: 멤버 조회" ON player_stats
  FOR SELECT USING (
    is_club_member(player_stats.club_id, auth_club_user_id())
  );

-- updatePlayerStatsForMatch 서버 액션에서 호출 (클럽 멤버면 누구나)
CREATE POLICY "player_stats: 멤버 생성·수정" ON player_stats
  FOR ALL USING (
    is_club_member(player_stats.club_id, auth_club_user_id())
  );
