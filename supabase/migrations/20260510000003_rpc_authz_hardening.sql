-- ============================================================
-- RPC 권한 강화 (2026-05-01)
--
-- 시뮬레이션 점검에서 발견된 P0 이슈:
--   1. upsert_member_rating / seed_member_rating — auth 체크 없이
--      authenticated 누구나 다른 클럽 멤버의 mu/phi/sigma 임의 조작 가능
--   2. delete_club_cascade — auth 체크 없이 누구나 임의 클럽 삭제 가능
--   3. member_ratings SELECT 정책이 클럽 전체 멤버에게 정밀 점수 노출
--      (CLAUDE.md 정책: 정밀 mu/phi는 본인 + 운영진만)
--
-- 모두 SECURITY DEFINER 함수에 owner/manager 검증 + 클럽 일치 검증 추가.
-- 정책은 SELECT를 본인 + 운영진만 허용하도록 좁힘 (UI는 muToGrade로 등급
-- 라벨만 추출해서 표시 → 다른 사람 정밀 점수는 더 이상 노출 X).
-- ============================================================

-- ── 1. seed_member_rating: 같은 클럽 매니저 또는 본인만 ──
CREATE OR REPLACE FUNCTION seed_member_rating(p_club_member_id UUID)
RETURNS member_ratings
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $body$
DECLARE
  v_skill_score INT;
  v_mu          FLOAT;
  v_existing    member_ratings;
  v_result      member_ratings;
  v_club_id     UUID;
  v_user_id     UUID;
  v_caller      UUID;
BEGIN
  v_caller := auth_club_user_id();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'unauthorized: 로그인이 필요합니다.';
  END IF;

  SELECT cm.club_id, cm.user_id, COALESCE(cm.skill_score, 50)
    INTO v_club_id, v_user_id, v_skill_score
    FROM club_members cm
    WHERE cm.id = p_club_member_id;

  IF v_club_id IS NULL THEN
    RAISE EXCEPTION 'not_found: 멤버를 찾을 수 없습니다.';
  END IF;

  -- 본인 또는 같은 클럽 매니저만 시드 가능
  IF NOT (v_user_id = v_caller OR is_club_manager(v_club_id, v_caller)) THEN
    RAISE EXCEPTION 'forbidden: 권한이 없습니다.';
  END IF;

  SELECT * INTO v_existing FROM member_ratings
   WHERE club_member_id = p_club_member_id;
  IF FOUND THEN
    RETURN v_existing;
  END IF;

  v_mu := 1500 + (v_skill_score - 50) * 8;

  INSERT INTO member_ratings (club_member_id, mu, phi, sigma)
  VALUES (p_club_member_id, v_mu, 350, 0.06)
  RETURNING * INTO v_result;

  INSERT INTO member_rating_history (
    club_member_id, match_id, mu, phi, sigma, delta_mu
  ) VALUES (
    p_club_member_id, NULL, v_result.mu, v_result.phi, v_result.sigma, 0
  );

  RETURN v_result;
END;
$body$;

-- ── 2. upsert_member_rating: 매치 참여자만 갱신 가능 ──
-- 매치에 실제 참여한 멤버에 대해서만, 같은 클럽 매니저가 호출해야 함
CREATE OR REPLACE FUNCTION upsert_member_rating(
  p_club_member_id UUID,
  p_match_id       UUID,
  p_mu             FLOAT,
  p_phi            FLOAT,
  p_sigma          FLOAT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $body$
DECLARE
  v_prev_mu  FLOAT;
  v_delta    FLOAT;
  v_club_id  UUID;
  v_caller   UUID;
  v_in_match BOOLEAN;
BEGIN
  v_caller := auth_club_user_id();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'unauthorized: 로그인이 필요합니다.';
  END IF;

  -- 1) 멤버의 클럽 확인
  SELECT cm.club_id INTO v_club_id
    FROM club_members cm WHERE cm.id = p_club_member_id;
  IF v_club_id IS NULL THEN
    RAISE EXCEPTION 'not_found: 멤버를 찾을 수 없습니다.';
  END IF;

  -- 2) 호출자가 같은 클럽 매니저인지 (혹은 매치에 참여한 본인)
  IF NOT is_club_manager(v_club_id, v_caller) THEN
    -- 매니저가 아니면 본인 갱신만 허용
    IF NOT EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = p_club_member_id AND cm.user_id = v_caller
    ) THEN
      RAISE EXCEPTION 'forbidden: 권한이 없습니다.';
    END IF;
  END IF;

  -- 3) p_match_id가 같은 클럽 매치인지, 그리고 그 멤버가 실제 참여했는지
  SELECT EXISTS (
    SELECT 1 FROM matches m
    JOIN sessions s ON s.id = m.session_id
    JOIN match_players mp ON mp.match_id = m.id
    WHERE m.id = p_match_id
      AND s.club_id = v_club_id
      AND mp.member_id = p_club_member_id
  ) INTO v_in_match;
  IF NOT v_in_match THEN
    RAISE EXCEPTION 'invalid_match: 매치 참여자만 갱신 가능합니다.';
  END IF;

  SELECT mu INTO v_prev_mu FROM member_ratings
   WHERE club_member_id = p_club_member_id;
  v_delta := COALESCE(p_mu - v_prev_mu, 0);

  INSERT INTO member_ratings (
    club_member_id, mu, phi, sigma, games_played, last_match_id, updated_at
  ) VALUES (
    p_club_member_id, p_mu, p_phi, p_sigma, 1, p_match_id, NOW()
  )
  ON CONFLICT (club_member_id) DO UPDATE SET
    mu            = EXCLUDED.mu,
    phi           = EXCLUDED.phi,
    sigma         = EXCLUDED.sigma,
    games_played  = member_ratings.games_played + 1,
    last_match_id = EXCLUDED.last_match_id,
    updated_at    = NOW();

  INSERT INTO member_rating_history (
    club_member_id, match_id, mu, phi, sigma, delta_mu
  ) VALUES (
    p_club_member_id, p_match_id, p_mu, p_phi, p_sigma, v_delta
  );
END;
$body$;

-- ── 3. delete_club_cascade: owner만 자기 클럽 삭제 가능 ──
CREATE OR REPLACE FUNCTION delete_club_cascade(p_club_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $body$
DECLARE
  v_caller UUID;
BEGIN
  v_caller := auth_club_user_id();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'unauthorized: 로그인이 필요합니다.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM clubs c
    WHERE c.id = p_club_id AND c.owner_id = v_caller
  ) THEN
    RAISE EXCEPTION 'forbidden: 모임 오너만 삭제할 수 있습니다.';
  END IF;

  -- ON DELETE CASCADE 가 sessions/matches/match_players/attendances/
  -- player_stats/club_members/club_events/dues/notices/etc 다 처리
  DELETE FROM clubs WHERE id = p_club_id;
END;
$body$;

-- ── 4. member_ratings SELECT 정책 좁히기 ──
-- 정밀 mu/phi/sigma는 본인 + 운영진만 직접 조회 가능.
-- 다른 멤버 등급 라벨(D/C/B)은 클라이언트에서 UI로만 muToGrade를 호출하므로
-- 그 라벨용 fetch는 별도 RPC/뷰가 필요한데, 현재는 모든 멤버가 정밀값을
-- 그대로 볼 수 있어 product 정책과 어긋남.
--
-- 해결: getClubMemberRatings는 공통 fetch 헬퍼라 그대로 두되, 정책을
-- "본인 또는 같은 클럽 운영진" 으로 좁히고 일반 멤버에게는 빈 객체가
-- 반환되도록 함. 일반 멤버 UI(/members /ranking)는 자동으로 skill_score
-- fallback으로 동작.
DROP POLICY IF EXISTS "member_ratings_select" ON member_ratings;
CREATE POLICY "member_ratings_select" ON member_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_ratings.club_member_id
        AND (
          cm.user_id = auth_club_user_id()
          OR is_club_manager(cm.club_id, auth_club_user_id())
        )
    )
  );

DROP POLICY IF EXISTS "member_rating_history_select" ON member_rating_history;
CREATE POLICY "member_rating_history_select" ON member_rating_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_rating_history.club_member_id
        AND (
          cm.user_id = auth_club_user_id()
          OR is_club_manager(cm.club_id, auth_club_user_id())
        )
    )
  );

-- ── GRANT 정리 (REVOKE PUBLIC, GRANT authenticated) ──
REVOKE ALL ON FUNCTION seed_member_rating(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION upsert_member_rating(UUID, UUID, FLOAT, FLOAT, FLOAT) FROM PUBLIC;
REVOKE ALL ON FUNCTION delete_club_cascade(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION seed_member_rating(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_member_rating(UUID, UUID, FLOAT, FLOAT, FLOAT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_club_cascade(UUID) TO authenticated;
