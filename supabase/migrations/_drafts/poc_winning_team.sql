-- ============================================================
-- POC DRAFT — DO NOT APPLY DIRECTLY
-- 위치: supabase/migrations/_drafts/ (underscore 접두 폴더는
-- supabase CLI(db push / db reset) 가 마이그레이션으로 인식하지 않음.
-- 실제 적용은 plan v2 §0.2.1 / T0-3-3 의 정식 마이그레이션 파일
-- (`20260518000003_matches_winning_team.sql`) 으로 옮긴 후에만.
-- ============================================================
-- 목적: PRD §3.3 — 점수 입력 제거 → 결과 3버튼([A승] / [B승] / [무승부])
-- single source of truth. team_a_score / team_b_score 는 향후 deprecated.
-- ============================================================

-- 1) 컬럼 추가 — TEXT NULL, CHECK 로 'A' / 'B' / 'DRAW' 만 허용.
--    NULL 은 "아직 결과 미입력(매치 진행 중)" 상태.
--    plan v2 §4 PoC 사양은 'A'/'B' 만 (NULL 이 무승부) 였으나,
--    DB 레벨에서 의미 명시성을 위해 'DRAW' 를 명시 enum 으로 추가.
--    (RPC 변환 시점에 'DRAW' 를 0.5 score 로 매핑.)
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS winning_team TEXT NULL
  CHECK (winning_team IS NULL OR winning_team IN ('A', 'B', 'DRAW'));

-- 2) 컬럼 주석 — PRD 근거 + deprecation 경고.
COMMENT ON COLUMN matches.winning_team IS
  'PRD §3.3 — [A팀 승] / [B팀 승] / [무승부]. '
  'NULL = 결과 미입력 (in-progress). '
  'team_a_score / team_b_score 는 향후 deprecated (Stage 0 W2 이후).';

-- 3) 인덱스 — ranking 집계 (winning_team 으로 필터) 성능 확보용.
--    Stage 0 W2 의 update_player_stats_for_match RPC 가 winning_team 을
--    where 절로 쓸 가능성 대비.
CREATE INDEX IF NOT EXISTS idx_matches_winning_team
  ON matches (winning_team)
  WHERE winning_team IS NOT NULL;

-- ============================================================
-- 백필 (PoC 단계에서는 실행 안 함, T0-3-3 정식 마이그에서만)
-- ============================================================
-- UPDATE matches
--    SET winning_team = CASE
--          WHEN team_a_score IS NULL OR team_b_score IS NULL THEN NULL
--          WHEN team_a_score >  team_b_score THEN 'A'
--          WHEN team_a_score <  team_b_score THEN 'B'
--          ELSE 'DRAW'
--        END
--  WHERE winning_team IS NULL
--    AND (team_a_score IS NOT NULL OR team_b_score IS NOT NULL);
