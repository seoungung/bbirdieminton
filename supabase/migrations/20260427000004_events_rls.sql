-- ============================================================
-- 정기모임 (club_events / club_event_attendances) RLS 정책
--
-- 두 테이블은 RLS enabled but 정책 미구축 상태.
-- 향후 20260510000001_rls_policies.sql 가 합쳐진 정책으로 덮어쓸 수 있어,
-- 이 파일은 명시적으로 DROP POLICY IF EXISTS 를 선행해 멱등 보장.
-- ============================================================

-- ── club_events ────────────────────────────────────────────
DROP POLICY IF EXISTS "club_events: 멤버 조회"           ON club_events;
DROP POLICY IF EXISTS "club_events: 매니저 생성"          ON club_events;
DROP POLICY IF EXISTS "club_events: 매니저 수정"          ON club_events;
DROP POLICY IF EXISTS "club_events: 매니저 삭제"          ON club_events;
DROP POLICY IF EXISTS "club_events: 운영진 생성·수정·삭제" ON club_events;

CREATE POLICY "club_events: 멤버 조회" ON club_events
  FOR SELECT USING (is_club_member(club_events.club_id, auth_club_user_id()));

CREATE POLICY "club_events: 매니저 생성" ON club_events
  FOR INSERT WITH CHECK (is_club_manager(club_events.club_id, auth_club_user_id()));

CREATE POLICY "club_events: 매니저 수정" ON club_events
  FOR UPDATE USING (is_club_manager(club_events.club_id, auth_club_user_id()));

CREATE POLICY "club_events: 매니저 삭제" ON club_events
  FOR DELETE USING (is_club_manager(club_events.club_id, auth_club_user_id()));

-- ── club_event_attendances ─────────────────────────────────
DROP POLICY IF EXISTS "club_event_attendances: 같은 클럽 멤버 조회" ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 RSVP 등록"     ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 RSVP 수정"     ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 또는 매니저 삭제" ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 멤버 조회"          ON club_event_attendances;
DROP POLICY IF EXISTS "club_event_attendances: 본인 UPSERT"        ON club_event_attendances;

-- 같은 클럽 멤버 조회
CREATE POLICY "club_event_attendances: 같은 클럽 멤버 조회" ON club_event_attendances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_events e
      WHERE e.id = club_event_attendances.event_id
        AND is_club_member(e.club_id, auth_club_user_id())
    )
  );

-- 본인 RSVP 등록 (member_id 가 본인 club_members row)
CREATE POLICY "club_event_attendances: 본인 RSVP 등록" ON club_event_attendances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = club_event_attendances.member_id
        AND cm.user_id = auth_club_user_id()
        AND cm.removed_at IS NULL
    )
  );

-- 본인 RSVP 수정
CREATE POLICY "club_event_attendances: 본인 RSVP 수정" ON club_event_attendances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = club_event_attendances.member_id
        AND cm.user_id = auth_club_user_id()
        AND cm.removed_at IS NULL
    )
  );

-- 본인 또는 같은 클럽 매니저 삭제
CREATE POLICY "club_event_attendances: 본인 또는 매니저 삭제" ON club_event_attendances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = club_event_attendances.member_id
        AND cm.user_id = auth_club_user_id()
        AND cm.removed_at IS NULL
    )
    OR EXISTS (
      SELECT 1 FROM club_events e
      WHERE e.id = club_event_attendances.event_id
        AND is_club_manager(e.club_id, auth_club_user_id())
    )
  );
