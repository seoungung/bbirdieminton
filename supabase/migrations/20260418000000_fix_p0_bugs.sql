-- ============================================================
-- P0 Bug Fixes (2026-04-18)
-- 1. match_players.team → uppercase 'A'/'B' CHECK 제약
-- 2. player_stats draws 컬럼 추가
-- 3. start_game_session RPC → uppercase team
-- 4. update_player_stats_for_match → 원자적 RPC (race condition 해결)
-- ============================================================

-- ── P0-1: match_players.team CHECK (대소문자 통일: 'A'/'B') ──
ALTER TABLE match_players
  ADD CONSTRAINT match_players_team_check CHECK (team IN ('A', 'B'));

-- ── P0-3: player_stats draws 컬럼 추가 ───────────────────────
ALTER TABLE player_stats
  ADD COLUMN IF NOT EXISTS draws INT NOT NULL DEFAULT 0;

-- ── P0-1: start_game_session RPC — team 값 'A'/'B' 대문자로 수정 ──
CREATE OR REPLACE FUNCTION start_game_session(
  p_club_id         UUID,
  p_session_date    DATE,
  p_match_mode      TEXT,
  p_notes           TEXT,
  p_created_by      UUID,
  p_attendees_json  JSONB,
  p_courts_json     JSONB
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_match_id   UUID;
  v_court      JSONB;
  v_member_id  TEXT;
BEGIN
  INSERT INTO sessions (club_id, session_date, status, match_mode, notes, created_by)
  VALUES (p_club_id, p_session_date, 'open', p_match_mode, p_notes, p_created_by)
  RETURNING id INTO v_session_id;

  FOR v_member_id IN SELECT jsonb_array_elements_text(p_attendees_json)
  LOOP
    INSERT INTO attendances (session_id, member_id, status)
    VALUES (v_session_id, v_member_id::UUID, 'present')
    ON CONFLICT (session_id, member_id) DO NOTHING;
  END LOOP;

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

    FOR v_member_id IN SELECT jsonb_array_elements_text(v_court->'team_a')
    LOOP
      INSERT INTO match_players (match_id, member_id, team)
      VALUES (v_match_id, v_member_id::UUID, 'A')
      ON CONFLICT (match_id, member_id) DO NOTHING;
    END LOOP;

    FOR v_member_id IN SELECT jsonb_array_elements_text(v_court->'team_b')
    LOOP
      INSERT INTO match_players (match_id, member_id, team)
      VALUES (v_match_id, v_member_id::UUID, 'B')
      ON CONFLICT (match_id, member_id) DO NOTHING;
    END LOOP;
  END LOOP;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ── P0-2 + P0-3: update_player_stats_for_match — 원자적 RPC ──
CREATE OR REPLACE FUNCTION update_player_stats_for_match(
  p_match_id    UUID,
  p_club_id     UUID,
  p_prev_score_a INT,
  p_prev_score_b INT,
  p_new_score_a  INT,
  p_new_score_b  INT
)
RETURNS void AS $$
DECLARE
  v_excluded BOOLEAN;
  v_player   RECORD;
  v_wins     INT;
  v_losses   INT;
  v_draws    INT;
BEGIN
  SELECT excluded_from_ranking INTO v_excluded
  FROM matches WHERE id = p_match_id;
  IF NOT FOUND OR v_excluded THEN RETURN; END IF;

  FOR v_player IN
    SELECT member_id, team FROM match_players WHERE match_id = p_match_id
  LOOP
    SELECT wins, losses, draws
    INTO v_wins, v_losses, v_draws
    FROM player_stats
    WHERE club_id = p_club_id AND member_id = v_player.member_id
    FOR UPDATE;

    IF NOT FOUND THEN
      v_wins := 0; v_losses := 0; v_draws := 0;
    END IF;

    IF p_prev_score_a IS NOT NULL AND p_prev_score_b IS NOT NULL THEN
      IF v_player.team = 'A' THEN
        IF p_prev_score_a > p_prev_score_b THEN v_wins   := GREATEST(0, v_wins   - 1);
        ELSIF p_prev_score_b > p_prev_score_a THEN v_losses := GREATEST(0, v_losses - 1);
        ELSE v_draws := GREATEST(0, v_draws - 1); END IF;
      ELSE
        IF p_prev_score_b > p_prev_score_a THEN v_wins   := GREATEST(0, v_wins   - 1);
        ELSIF p_prev_score_a > p_prev_score_b THEN v_losses := GREATEST(0, v_losses - 1);
        ELSE v_draws := GREATEST(0, v_draws - 1); END IF;
      END IF;
    END IF;

    IF v_player.team = 'A' THEN
      IF p_new_score_a > p_new_score_b    THEN v_wins   := v_wins   + 1;
      ELSIF p_new_score_b > p_new_score_a THEN v_losses := v_losses + 1;
      ELSE v_draws := v_draws + 1; END IF;
    ELSE
      IF p_new_score_b > p_new_score_a    THEN v_wins   := v_wins   + 1;
      ELSIF p_new_score_a > p_new_score_b THEN v_losses := v_losses + 1;
      ELSE v_draws := v_draws + 1; END IF;
    END IF;

    INSERT INTO player_stats (
      club_id, member_id, wins, losses, draws, games_played, win_rate, updated_at
    ) VALUES (
      p_club_id,
      v_player.member_id,
      v_wins,
      v_losses,
      v_draws,
      v_wins + v_losses + v_draws,
      CASE WHEN v_wins + v_losses + v_draws > 0
           THEN v_wins::FLOAT / (v_wins + v_losses + v_draws)
           ELSE 0 END,
      now()
    )
    ON CONFLICT (club_id, member_id) DO UPDATE SET
      wins         = EXCLUDED.wins,
      losses       = EXCLUDED.losses,
      draws        = EXCLUDED.draws,
      games_played = EXCLUDED.games_played,
      win_rate     = EXCLUDED.win_rate,
      updated_at   = EXCLUDED.updated_at;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
