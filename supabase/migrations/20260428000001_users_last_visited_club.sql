-- 사용자의 마지막 방문 클럽. 로그인 후 자동 redirect용.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_visited_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL;
