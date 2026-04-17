-- ============================================================
-- Birdieminton Core Schema
-- 의존성 순서: users → clubs → club_members → sessions/events/player_stats → matches → match_players/attendances
-- ============================================================

-- ── 1. users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  birdieminton_user_id  UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- RLS 정책은 Phase 6에서 전면 도입. 현재는 테이블만 생성.

-- ── 2. clubs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name              TEXT NOT NULL,
  description       TEXT,
  location          TEXT,
  activity_place    TEXT,
  category          TEXT DEFAULT '동호회',
  court_count       INT NOT NULL DEFAULT 2 CHECK (court_count BETWEEN 1 AND 20),
  thumbnail_color   TEXT NOT NULL DEFAULT '#f0f0f0',
  thumbnail_url     TEXT,
  invite_code       TEXT UNIQUE,             -- trigger로 자동 생성
  plan              TEXT DEFAULT 'free',
  max_members       INT DEFAULT 100,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- ── 3. club_members ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS club_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member')),
  skill_score INT NOT NULL DEFAULT 0 CHECK (skill_score BETWEEN 0 AND 100),
  joined_at   TIMESTAMPTZ DEFAULT now(),
  removed_at  TIMESTAMPTZ,                  -- 강퇴 시각 (Q3: 기록 유지)
  UNIQUE (club_id, user_id)
);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- ── 4. club_events (정기모임 — 일회성) ───────────────────
CREATE TABLE IF NOT EXISTS club_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  event_date  DATE NOT NULL,
  start_time  TIME,
  end_time    TIME,
  place       TEXT,
  fee         TEXT,
  max_attend  INT DEFAULT 0,
  created_by  UUID REFERENCES club_members(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE club_events ENABLE ROW LEVEL SECURITY;

-- ── 5. club_event_attendances ─────────────────────────────
CREATE TABLE IF NOT EXISTS club_event_attendances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES club_events(id) ON DELETE CASCADE,
  member_id   UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'not_going' CHECK (status IN ('going', 'not_going')),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, member_id)
);

ALTER TABLE club_event_attendances ENABLE ROW LEVEL SECURITY;

-- ── 6. sessions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id       UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  session_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  match_mode    TEXT DEFAULT 'random' CHECK (match_mode IN ('random', 'skill_balance', 'game_count')),
  notes         TEXT,
  created_by    UUID REFERENCES club_members(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- ── 7. matches ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  court_number          INT NOT NULL DEFAULT 1,
  team_a_score          INT,
  team_b_score          INT,
  match_mode            TEXT,
  excluded_from_ranking BOOLEAN NOT NULL DEFAULT false,  -- 임시 참가자 포함 경기
  started_at            TIMESTAMPTZ,
  ended_at              TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- ── 8. match_players ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_players (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  member_id   UUID REFERENCES club_members(id) ON DELETE SET NULL,  -- NULL = 임시 참가자 (Q3)
  team        TEXT NOT NULL CHECK (team IN ('a', 'b')),
  UNIQUE (match_id, member_id)
);

ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- ── 9. attendances ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id   UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent')),
  UNIQUE (session_id, member_id)
);

ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- ── 10. player_stats ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_stats (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  member_id    UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  wins         INT NOT NULL DEFAULT 0,
  losses       INT NOT NULL DEFAULT 0,
  games_played INT NOT NULL DEFAULT 0,
  win_rate     FLOAT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (club_id, member_id)
);

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
