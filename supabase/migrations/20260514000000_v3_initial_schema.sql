-- ============================================================
-- v3 Initial Schema — PRD §4 정합 (백지에서 다시)
-- ============================================================
-- 작성일: 2026-05-14
-- 적용 방식: Supabase Dashboard SQL Editor 에 본 파일 내용 전체 붙여넣고 RUN
-- 선행 조건: public schema 와이프 완료 (DROP SCHEMA public CASCADE 후 재생성)
-- 권한 회복: 이 파일 끝에 GRANT 섹션 포함 (DROP SCHEMA 가 테이블 권한까지 날림)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. users (PRD §4)
--    auth.users.id 와 1:1 매핑. 카카오 로그인 시 trigger 가 자동 생성.
-- ────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  kakao_id      TEXT UNIQUE,
  name          TEXT NOT NULL DEFAULT '',
  profile_img   TEXT,
  bp_score      INTEGER NOT NULL DEFAULT 0,
  grade         TEXT CHECK (grade IS NULL OR grade IN ('S','A','B','C','D','E','F')),
  manner_temp   NUMERIC(4,1) NOT NULL DEFAULT 36.5,
  is_master     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE INDEX users_kakao_id_idx ON users(kakao_id) WHERE kakao_id IS NOT NULL;
CREATE INDEX users_is_master_idx ON users(is_master) WHERE is_master = true;
COMMENT ON TABLE users IS 'PRD §1 User — 앱 가입자. auth.users 와 1:1';
COMMENT ON COLUMN users.bp_score IS 'PRD §3.1 전투력 점수 (BP). 초기 0';
COMMENT ON COLUMN users.grade IS 'PRD §3.1 S~F 등급';
COMMENT ON COLUMN users.manner_temp IS 'PRD §3.5 매너 온도. 초기 36.5';
COMMENT ON COLUMN users.is_master IS '시스템 마스터(슈퍼어드민) 권한 — /admin 진입용';

-- ────────────────────────────────────────────────────────────
-- 2. clubs (PRD §4)
-- ────────────────────────────────────────────────────────────
CREATE TABLE clubs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_url_id   TEXT UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  cover_image_url TEXT,
  logo_image_url  TEXT,
  region          TEXT,
  gym             TEXT,
  plan_type       TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free','basic','pro')),
  admin_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE INDEX clubs_admin_idx ON clubs(admin_id);
COMMENT ON COLUMN clubs.custom_url_id IS 'PRD §3.2 club/{입력ID} 핸들 (유튜브 핸들 방식)';
COMMENT ON COLUMN clubs.plan_type IS 'PRD §5.1 Free 50 / Basic 100 / Pro 무제한';
COMMENT ON COLUMN clubs.admin_id IS '모임 개설자 = owner. 공동관리자는 club_members.role 에서 관리';

-- ────────────────────────────────────────────────────────────
-- 3. club_members (PRD §1 User 의 클럽 소속)
--    PRD 에 명시되지 않은 운영 필수 테이블. 다대다 관계.
-- ────────────────────────────────────────────────────────────
CREATE TABLE club_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','co_admin','member')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at  TIMESTAMPTZ,
  UNIQUE (club_id, user_id)
);
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX club_members_club_idx ON club_members(club_id);
CREATE INDEX club_members_user_idx ON club_members(user_id);
COMMENT ON COLUMN club_members.role IS 'owner = clubs.admin_id 와 동일. co_admin = PRD §5.1 Basic 부터 최대 3명, Pro 무제한';

-- ────────────────────────────────────────────────────────────
-- 4. sessions (PRD §1 Session — 매주 당일 운동 이벤트)
-- ────────────────────────────────────────────────────────────
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id       UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  place         TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','closed')),
  expenses      JSONB NOT NULL DEFAULT '{}',
  created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX sessions_club_idx ON sessions(club_id);
CREATE INDEX sessions_scheduled_at_idx ON sessions(scheduled_at);
COMMENT ON COLUMN sessions.status IS 'PRD §4: 준비(pending) / 진행중(in_progress) / 종료(closed)';
COMMENT ON COLUMN sessions.expenses IS 'PRD §3.4 지출 JSON {court_fee, shuttlecock_cost, ...}';

-- ────────────────────────────────────────────────────────────
-- 5. guests (PRD §1 Guest — 앱 미가입 오프라인 유저)
-- ────────────────────────────────────────────────────────────
CREATE TABLE guests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  gender      TEXT CHECK (gender IS NULL OR gender IN ('male','female')),
  grade       TEXT CHECK (grade IS NULL OR grade IN ('S','A','B','C','D','E','F')),
  invited_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE INDEX guests_session_idx ON guests(session_id);
COMMENT ON TABLE guests IS 'PRD §1: 운영자가 수동 타이핑으로 추가. Session 에 귀속';
COMMENT ON COLUMN guests.invited_by IS 'PRD §3.4 정산 합산 청구용 — 초대한 회원';

-- ────────────────────────────────────────────────────────────
-- 6. matches (PRD §4 Gameboard / Match)
-- ────────────────────────────────────────────────────────────
CREATE TABLE matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  court_number  INTEGER NOT NULL CHECK (court_number >= 1),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','ended')),
  winning_team  TEXT CHECK (winning_team IS NULL OR winning_team IN ('A','B','DRAW')),
  started_at    TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE INDEX matches_session_idx ON matches(session_id);
COMMENT ON COLUMN matches.winning_team IS 'PRD §3.3: A팀 승리 / B팀 승리 / 무승부(DRAW) / NULL=미완료. 점수 카운팅 UI 제거됨';

-- ────────────────────────────────────────────────────────────
-- 7. match_players (PRD §4 "Player Union/Interface — User or Guest 4명 혼합")
-- ────────────────────────────────────────────────────────────
CREATE TABLE match_players (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id  UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team      TEXT NOT NULL CHECK (team IN ('A','B')),
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_id  UUID REFERENCES guests(id) ON DELETE CASCADE,
  position  SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 4),
  -- User or Guest 정확히 하나
  CHECK ((user_id IS NOT NULL) <> (guest_id IS NOT NULL)),
  UNIQUE (match_id, position)
);
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
CREATE INDEX match_players_match_idx ON match_players(match_id);
CREATE INDEX match_players_user_idx ON match_players(user_id) WHERE user_id IS NOT NULL;
COMMENT ON COLUMN match_players.position IS '1-2 = A팀 / 3-4 = B팀. team 컬럼과 정합';

-- ────────────────────────────────────────────────────────────
-- 8. updated_at 자동 갱신 trigger (공통)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────
-- 9. auth.users → public.users 자동 동기화
--    새 카카오 가입 시 public.users 행 자동 생성
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_auth_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, kakao_id, name, profile_img)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'preferred_username',
      ''
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ────────────────────────────────────────────────────────────
-- 10. 기존 auth.users 들 backfill (와이프 전부터 있던 카카오 계정)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.users (id, kakao_id, name, profile_img)
SELECT
  id,
  raw_user_meta_data->>'provider_id',
  COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'preferred_username',
    ''
  ),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 11. 마스터 권한 부여 (사용자 본인)
-- ────────────────────────────────────────────────────────────
UPDATE public.users SET is_master = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'yung3867@daum.net');

-- ────────────────────────────────────────────────────────────
-- 12. 권한 회복 (DROP SCHEMA 가 테이블 권한까지 날린 잔재)
-- ────────────────────────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 미래 테이블에도 자동 적용
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- NOTE: RLS 가 모든 테이블에 enabled. 정책은 0개 → service_role 만 RLS 우회 통과.
-- anon/authenticated 는 RLS 정책 작성 후 접근 가능. Step 7+ 에 정책 추가.

-- ────────────────────────────────────────────────────────────
-- 13. 검증 쿼리 (참고용, 마이그 후 직접 실행)
-- ────────────────────────────────────────────────────────────
-- SELECT id, name, kakao_id, is_master FROM public.users;  -- 본인 행 + is_master=true 확인
-- SELECT count(*) FROM public.users;                        -- auth.users 와 동일
