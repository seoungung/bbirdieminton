-- ============================================================
-- RPC 함수 모음
-- 1. delete_club_cascade  — 모임 삭제 (단일 트랜잭션)
-- 2. update_dues_amount   — 회비 금액 변경 (기존 납부 보존)
-- 3. start_game_session   — 게임 세션 + 출석 + 매치 + 플레이어 생성 (단일 트랜잭션)
-- ============================================================

-- ── 1. delete_club_cascade ────────────────────────────────
CREATE OR REPLACE FUNCTION delete_club_cascade(p_club_id UUID)
RETURNS void AS $$
BEGIN
  -- match_players → matches → attendances → sessions
  DELETE FROM match_players
  WHERE match_id IN (
    SELECT m.id FROM matches m
    JOIN sessions s ON s.id = m.session_id
    WHERE s.club_id = p_club_id
  );

  DELETE FROM matches
  WHERE session_id IN (SELECT id FROM sessions WHERE club_id = p_club_id);

  DELETE FROM attendances
  WHERE session_id IN (SELECT id FROM sessions WHERE club_id = p_club_id);

  DELETE FROM sessions WHERE club_id = p_club_id;

  -- club_events
  DELETE FROM club_event_attendances
  WHERE event_id IN (SELECT id FROM club_events WHERE club_id = p_club_id);
  DELETE FROM club_events WHERE club_id = p_club_id;

  -- player_stats, dues, club_members
  DELETE FROM player_stats WHERE club_id = p_club_id;
  DELETE FROM dues WHERE club_id = p_club_id;
  DELETE FROM club_members WHERE club_id = p_club_id;

  -- 마지막으로 club 삭제
  DELETE FROM clubs WHERE id = p_club_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ── 2. update_dues_amount ─────────────────────────────────
-- paid=true 기존 row는 보존, 없는 row는 신규 생성
CREATE OR REPLACE FUNCTION update_dues_amount(
  p_club_id   UUID,
  p_amount    INT,
  p_year      INT,
  p_month     INT
) RETURNS void AS $$
DECLARE
  v_member RECORD;
  v_existing_paid BOOLEAN;
BEGIN
  FOR v_member IN
    SELECT id FROM club_members WHERE club_id = p_club_id AND removed_at IS NULL
  LOOP
    SELECT paid INTO v_existing_paid
    FROM dues
    WHERE club_id = p_club_id AND member_id = v_member.id
      AND year = p_year AND month = p_month;

    INSERT INTO dues (club_id, member_id, year, month, amount, paid)
    VALUES (p_club_id, v_member.id, p_year, p_month, p_amount, COALESCE(v_existing_paid, false))
    ON CONFLICT (club_id, member_id, year, month)
    DO UPDATE SET amount = EXCLUDED.amount;
    -- paid는 UPDATE에서 제외 → 기존 paid 상태 보존
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ── 3. start_game_session ─────────────────────────────────
-- 세션 + 출석 + 매치 + 플레이어를 단일 트랜잭션으로 생성
-- p_courts_json: [{ court_number, team_a: [member_id,...], team_b: [member_id,...], excluded_from_ranking }]
-- p_attendees_json: [member_id, ...]
CREATE OR REPLACE FUNCTION start_game_session(
  p_club_id         UUID,
  p_session_date    DATE,
  p_match_mode      TEXT,
  p_notes           TEXT,
  p_created_by      UUID,
  p_attendees_json  JSONB,   -- ["member_id1", "member_id2", ...]
  p_courts_json     JSONB    -- [{ "court_number": 1, "team_a": [...], "team_b": [...], "excluded": false }]
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_match_id   UUID;
  v_court      JSONB;
  v_member_id  TEXT;
BEGIN
  -- 세션 생성
  INSERT INTO sessions (club_id, session_date, status, match_mode, notes, created_by)
  VALUES (p_club_id, p_session_date, 'open', p_match_mode, p_notes, p_created_by)
  RETURNING id INTO v_session_id;

  -- 출석 기록
  FOR v_member_id IN SELECT jsonb_array_elements_text(p_attendees_json)
  LOOP
    INSERT INTO attendances (session_id, member_id, status)
    VALUES (v_session_id, v_member_id::UUID, 'present')
    ON CONFLICT (session_id, member_id) DO NOTHING;
  END LOOP;

  -- 코트별 매치 + 플레이어 생성
  FOR v_court IN SELECT jsonb_array_elements(p_courts_json)
  LOOP
    INSERT INTO matches (session_id, court_number, match_mode, excluded_from_ranking, started_at)
    VALUES (
      v_session_id,
      (v_court->>'court_number')::INT,
      p_match_mode,
      COALESCE((v_court->>'excluded')::BOOLEAN, false),
      now()
    )
    RETURNING id INTO v_match_id;

    -- team_a 플레이어
    FOR v_member_id IN SELECT jsonb_array_elements_text(v_court->'team_a')
    LOOP
      INSERT INTO match_players (match_id, member_id, team)
      VALUES (v_match_id, v_member_id::UUID, 'a')
      ON CONFLICT (match_id, member_id) DO NOTHING;
    END LOOP;

    -- team_b 플레이어
    FOR v_member_id IN SELECT jsonb_array_elements_text(v_court->'team_b')
    LOOP
      INSERT INTO match_players (match_id, member_id, team)
      VALUES (v_match_id, v_member_id::UUID, 'b')
      ON CONFLICT (match_id, member_id) DO NOTHING;
    END LOOP;
  END LOOP;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
