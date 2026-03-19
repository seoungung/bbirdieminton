-- 뉴스레터 구독자 테이블
CREATE TABLE IF NOT EXISTS subscribers (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 익명 사용자도 구독(INSERT) 가능
CREATE POLICY "allow_insert" ON subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 관리자만 조회 가능
CREATE POLICY "allow_select_authenticated" ON subscribers
  FOR SELECT TO authenticated
  USING (true);
