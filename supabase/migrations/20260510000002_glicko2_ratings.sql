-- ============================================================
-- Glicko-2 Rating System (작성 2026-04-30, 의존성 순서로 timestamp 5/10)
-- 의존: 20260510000000_rls_helpers.sql (is_club_member / is_club_manager / auth_club_user_id)
--
-- 도입 배경: skill_score(수동, 0~100, INT)는 운영자가 직접 입력하는 메모성
-- 값으로 유지하되, 매 경기마다 자동 조정되는 정밀 레이팅(Glicko-2)을
-- 별도 layer로 도입한다. 표면(멤버 리스트·랭킹)에는 D/C/B 등급 라벨만,
-- 본인 대시보드(/club/[id]/me)에는 정밀 mu/phi 노출.
--
-- 결정사항:
-- · 신규 테이블 분리(member_ratings + member_rating_history) — history 시계열 유지
-- · 계산은 TS 측(npm glicko2-lite)에서 수행, RPC는 저장만 담당
-- · skill_score는 신입 등록 시 초기 mu 시드값으로만 사용
-- · matches.excluded_from_ranking = true 경기는 Glicko-2도 제외 (TS 측 처리)
-- · 기존 경기 backfill 안 함 (마이그레이션 후부터만, RD 큰 상태로 빠르게 안정화)
--
-- 기본값:
-- · mu = 1500 (Glicko 표준 시작점)
-- · phi = 350 (RD, 불확실 큰 상태)
-- · sigma = 0.06 (volatility, Glicko-2 표준)
-- ============================================================

-- ── 1. 현재 레이팅 테이블 ─────────────────────────────────
CREATE TABLE IF NOT EXISTS member_ratings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_member_id  UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  mu              FLOAT NOT NULL DEFAULT 1500,
  phi             FLOAT NOT NULL DEFAULT 350,
  sigma           FLOAT NOT NULL DEFAULT 0.06,
  games_played    INT NOT NULL DEFAULT 0,
  last_match_id   UUID REFERENCES matches(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (club_member_id)
);

CREATE INDEX IF NOT EXISTS idx_member_ratings_member
  ON member_ratings (club_member_id);

-- ── 2. 레이팅 변동 이력 테이블 ────────────────────────────
CREATE TABLE IF NOT EXISTS member_rating_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_member_id  UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  match_id        UUID REFERENCES matches(id) ON DELETE CASCADE,
  mu              FLOAT NOT NULL,
  phi             FLOAT NOT NULL,
  sigma           FLOAT NOT NULL,
  delta_mu        FLOAT NOT NULL DEFAULT 0,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rating_history_member_time
  ON member_rating_history (club_member_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_rating_history_match
  ON member_rating_history (match_id);

-- ── 3. RLS 정책 ───────────────────────────────────────────
ALTER TABLE member_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_rating_history ENABLE ROW LEVEL SECURITY;

-- member_ratings: 같은 클럽 멤버면 read, 운영자만 write
DROP POLICY IF EXISTS "member_ratings_select" ON member_ratings;
CREATE POLICY "member_ratings_select" ON member_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_ratings.club_member_id
        AND is_club_member(cm.club_id, auth_club_user_id())
    )
  );

DROP POLICY IF EXISTS "member_ratings_insert" ON member_ratings;
CREATE POLICY "member_ratings_insert" ON member_ratings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_ratings.club_member_id
        AND is_club_manager(cm.club_id, auth_club_user_id())
    )
  );

DROP POLICY IF EXISTS "member_ratings_update" ON member_ratings;
CREATE POLICY "member_ratings_update" ON member_ratings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_ratings.club_member_id
        AND is_club_manager(cm.club_id, auth_club_user_id())
    )
  );

-- member_rating_history: 같은 클럽 멤버면 read, 운영자만 insert (수정 X)
DROP POLICY IF EXISTS "member_rating_history_select" ON member_rating_history;
CREATE POLICY "member_rating_history_select" ON member_rating_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_rating_history.club_member_id
        AND is_club_member(cm.club_id, auth_club_user_id())
    )
  );

DROP POLICY IF EXISTS "member_rating_history_insert" ON member_rating_history;
CREATE POLICY "member_rating_history_insert" ON member_rating_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.id = member_rating_history.club_member_id
        AND is_club_manager(cm.club_id, auth_club_user_id())
    )
  );

-- ── 4. 시드 RPC: skill_score → 초기 mu ────────────────────
-- 신입 등록 직후 호출. 이미 존재하면 그대로 반환(idempotent).
-- skill_score 매핑: 0~100 → mu 1100~1900 (선형, 1500 중앙)
CREATE OR REPLACE FUNCTION seed_member_rating(
  p_club_member_id UUID
)
RETURNS member_ratings
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_skill_score INT;
  v_mu          FLOAT;
  v_existing    member_ratings;
  v_result      member_ratings;
BEGIN
  -- 이미 존재 → 그대로 반환
  SELECT * INTO v_existing FROM member_ratings
   WHERE club_member_id = p_club_member_id;
  IF FOUND THEN
    RETURN v_existing;
  END IF;

  -- club_members.skill_score 조회 (없으면 50 = 중간)
  SELECT COALESCE(skill_score, 50) INTO v_skill_score
    FROM club_members WHERE id = p_club_member_id;

  v_mu := 1500 + (v_skill_score - 50) * 8;

  INSERT INTO member_ratings (club_member_id, mu, phi, sigma)
  VALUES (p_club_member_id, v_mu, 350, 0.06)
  RETURNING * INTO v_result;

  -- 초기 시드도 history에 한 줄 박아서 그래프 시작점 확보
  INSERT INTO member_rating_history (
    club_member_id, match_id, mu, phi, sigma, delta_mu
  ) VALUES (
    p_club_member_id, NULL, v_result.mu, v_result.phi, v_result.sigma, 0
  );

  RETURN v_result;
END;
$$;

-- ── 5. 결과 저장 RPC: TS Glicko-2 계산 후 호출 ────────────
-- 한 경기당 4명(복식) 각각 1번씩 호출. 현재값 UPSERT + history insert.
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
AS $$
DECLARE
  v_prev_mu FLOAT;
  v_delta   FLOAT;
BEGIN
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
$$;

-- ── 6. 매치 prepare RPC: 4명(혹은 N명) 레이팅 한 번에 fetch + 누락은 seed ──
-- TS 측 Glicko-2 계산을 위해 한 경기의 모든 멤버 레이팅을 한 호출로 가져온다.
-- 레이팅 row가 없는 멤버는 즉시 seed(skill_score 기반).
-- 임시 참가자(member_id IS NULL)나 excluded_from_ranking 경기는 skip=true 반환.
CREATE OR REPLACE FUNCTION glicko2_prepare_match(p_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_excluded     BOOLEAN;
  v_has_null     BOOLEAN;
  v_team_a       JSONB;
  v_team_b       JSONB;
  v_member_id    UUID;
  v_team         TEXT;
BEGIN
  -- 1. 경기 자체가 ranking 제외면 즉시 종료
  SELECT excluded_from_ranking INTO v_excluded
    FROM matches WHERE id = p_match_id;
  IF v_excluded IS NULL THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'match_not_found');
  END IF;
  IF v_excluded THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'excluded_from_ranking');
  END IF;

  -- 2. 임시 참가자(member_id NULL) 한 명이라도 있으면 skip
  SELECT EXISTS (
    SELECT 1 FROM match_players
    WHERE match_id = p_match_id AND member_id IS NULL
  ) INTO v_has_null;
  IF v_has_null THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'has_temp_player');
  END IF;

  -- 3. 누락 레이팅 일괄 seed (loop)
  FOR v_member_id, v_team IN
    SELECT mp.member_id, mp.team
      FROM match_players mp
      WHERE mp.match_id = p_match_id
  LOOP
    PERFORM seed_member_rating(v_member_id);
  END LOOP;

  -- 4. team별 레이팅 + member_id 묶어서 반환
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'member_id', mp.member_id,
      'mu',        mr.mu,
      'phi',       mr.phi,
      'sigma',     mr.sigma
    )
  ), '[]'::jsonb) INTO v_team_a
    FROM match_players mp
    JOIN member_ratings mr ON mr.club_member_id = mp.member_id
    WHERE mp.match_id = p_match_id AND mp.team = 'A';

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'member_id', mp.member_id,
      'mu',        mr.mu,
      'phi',       mr.phi,
      'sigma',     mr.sigma
    )
  ), '[]'::jsonb) INTO v_team_b
    FROM match_players mp
    JOIN member_ratings mr ON mr.club_member_id = mp.member_id
    WHERE mp.match_id = p_match_id AND mp.team = 'B';

  IF jsonb_array_length(v_team_a) = 0 OR jsonb_array_length(v_team_b) = 0 THEN
    RETURN jsonb_build_object('skip', true, 'reason', 'empty_team');
  END IF;

  RETURN jsonb_build_object(
    'skip',   false,
    'team_a', v_team_a,
    'team_b', v_team_b
  );
END;
$$;

GRANT EXECUTE ON FUNCTION seed_member_rating(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_member_rating(UUID, UUID, FLOAT, FLOAT, FLOAT) TO authenticated;
GRANT EXECUTE ON FUNCTION glicko2_prepare_match(UUID) TO authenticated;
