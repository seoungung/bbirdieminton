-- ============================================================
-- Triggers
-- 1. clubs.invite_code 자동 생성
-- 2. clubs.updated_at 자동 갱신
-- 3. matches.updated_at 자동 갱신
-- ============================================================

-- ── invite_code 생성 함수 ──────────────────────────────────
-- NanoID 스타일 8자 (A-Z0-9), UNIQUE 충돌 시 최대 5회 재시도
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
DECLARE
  chars  TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- 혼동 문자 제외 (I, O, 0, 1)
  code   TEXT;
  attempt INT := 0;
BEGIN
  -- 이미 코드가 지정된 경우 그대로 사용
  IF NEW.invite_code IS NOT NULL THEN
    RETURN NEW;
  END IF;

  LOOP
    attempt := attempt + 1;
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
    END LOOP;

    -- 중복 체크
    IF NOT EXISTS (SELECT 1 FROM clubs WHERE invite_code = code) THEN
      NEW.invite_code := code;
      RETURN NEW;
    END IF;

    IF attempt >= 5 THEN
      RAISE EXCEPTION 'invite_code 생성 실패: 5회 시도 초과. 잠시 후 다시 시도해주세요.';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- clubs INSERT 시 invite_code 자동 생성
DROP TRIGGER IF EXISTS trg_clubs_invite_code ON clubs;
CREATE TRIGGER trg_clubs_invite_code
  BEFORE INSERT ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION generate_invite_code();

-- ── updated_at 자동 갱신 함수 ─────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- clubs.updated_at
DROP TRIGGER IF EXISTS trg_clubs_updated_at ON clubs;
CREATE TRIGGER trg_clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- matches.updated_at
DROP TRIGGER IF EXISTS trg_matches_updated_at ON matches;
CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
