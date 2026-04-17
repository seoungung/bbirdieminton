CREATE TABLE IF NOT EXISTS dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  amount INT NOT NULL DEFAULT 0,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, member_id, year, month)
);

ALTER TABLE dues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members can view dues"
  ON dues FOR SELECT
  USING (
    club_id IN (
      SELECT club_id FROM club_members WHERE user_id = (
        SELECT id FROM users WHERE birdieminton_user_id = auth.uid()
      )
    )
  );

-- Phase 6에서 세밀한 RLS로 교체 예정
-- 임시: owner/manager만 write 허용 (USING(true) 오픈 정책 제거)
CREATE POLICY "Club managers can manage dues"
  ON dues FOR ALL
  USING (
    club_id IN (
      SELECT cm.club_id FROM club_members cm
      WHERE cm.user_id = (
        SELECT id FROM users WHERE birdieminton_user_id = auth.uid()
      )
      AND cm.role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    club_id IN (
      SELECT cm.club_id FROM club_members cm
      WHERE cm.user_id = (
        SELECT id FROM users WHERE birdieminton_user_id = auth.uid()
      )
      AND cm.role IN ('owner', 'manager')
    )
  );
