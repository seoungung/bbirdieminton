-- ============================================================
-- 셔틀콕 제출 트래커 시스템 (Phase 1 — DB)
--
-- 한국 클럽·동호회 운영 방식 차용:
-- - 평일 2개 / 주말 3개 출석자별 제출 (클럽 설정 변경 가능)
-- - 부족분은 동호회 여유분 풀에서 이체 (회원이 단가 만큼 동호회에 청구)
-- - 풀 충전·이체 모두 운영진(owner/manager) 권한
-- - 단가는 기존 clubs.shuttle_default_price 재활용 (지정콕 1개당 ~2,500원)
--
-- 적용 방법:
-- 1) 검토 후 supabase/migrations/ 폴더로 이동 (날짜 시퀀스 유지)
-- 2) npx supabase db push
-- 3) 적용 후 clubs.shuttle_default_price 디폴트값을 2500 으로 조정 권장
--    (이미 데이터가 있으면 영향 없음; 신규 클럽만 적용됨)
-- ============================================================

-- ── 1. clubs 컬럼 추가 ─────────────────────────────────────
ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS shuttle_pool_count INT NOT NULL DEFAULT 0;

ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS shuttle_weekday_required INT NOT NULL DEFAULT 2;

ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS shuttle_weekend_required INT NOT NULL DEFAULT 3;

COMMENT ON COLUMN clubs.shuttle_pool_count IS '동호회 여유분 셔틀콕 잔량 (트리거로 자동 갱신)';
COMMENT ON COLUMN clubs.shuttle_weekday_required IS '평일 출석자 1인당 기본 제출 개수';
COMMENT ON COLUMN clubs.shuttle_weekend_required IS '주말 출석자 1인당 기본 제출 개수';

-- ── 2. session_shuttle_submissions 테이블 ──────────────────
-- 출석자별 셔틀콕 제출 현황 (운영진이 입력)
CREATE TABLE IF NOT EXISTS session_shuttle_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  /* 이 회원이 이 세션에서 내야 하는 개수 (보통 2 or 3, 기본값은 클럽 설정에서) */
  required_count INT NOT NULL CHECK (required_count >= 0),
  /* 본인이 가져온 개수 */
  brought_count INT NOT NULL DEFAULT 0 CHECK (brought_count >= 0),
  /* 풀에서 이체받은 개수 */
  paid_from_pool INT NOT NULL DEFAULT 0 CHECK (paid_from_pool >= 0),
  /* 풀 이체 시 회원이 동호회에 내야 할 금액 (paid_from_pool × shuttle_default_price) */
  amount_owed INT NOT NULL DEFAULT 0 CHECK (amount_owed >= 0),
  /* 회원이 동호회에 결제 완료한 시각 (NULL = 미납) */
  amount_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_shuttle_subm_session ON session_shuttle_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_shuttle_subm_club ON session_shuttle_submissions(club_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shuttle_subm_unpaid
  ON session_shuttle_submissions(club_id, member_id)
  WHERE amount_owed > 0 AND amount_paid_at IS NULL;

COMMENT ON TABLE session_shuttle_submissions IS '세션별 출석자 셔틀콕 제출 현황 — 운영진이 입력';

-- ── 3. shuttle_pool_log 테이블 ──────────────────────────────
-- 풀 변동 감사 로그 (충전·이체출고·수동조정 모두 기록)
CREATE TABLE IF NOT EXISTS shuttle_pool_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  /* +면 충전(들어옴), -면 이체출고(나감) */
  delta INT NOT NULL CHECK (delta != 0),
  reason TEXT NOT NULL CHECK (reason IN ('replenish', 'pool_payment', 'manual_adjust')),
  related_submission_id UUID REFERENCES session_shuttle_submissions(id) ON DELETE SET NULL,
  /* 충전 시: 누가 얼마 냈는지 / 이체출고 시: 회원이 동호회에 내야할 금액 */
  amount_paid INT,
  created_by UUID REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pool_log_club ON shuttle_pool_log(club_id, created_at DESC);

COMMENT ON TABLE shuttle_pool_log IS '셔틀콕 여유분 풀 변동 감사 로그';

-- ── 4. 풀 잔량 자동 갱신 트리거 ──────────────────────────────
-- shuttle_pool_log INSERT 시 clubs.shuttle_pool_count 를 delta 만큼 갱신
-- 음수 잔량 방지: GREATEST(0, ...)
CREATE OR REPLACE FUNCTION shuttle_pool_apply_delta()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE clubs
  SET shuttle_pool_count = GREATEST(0, shuttle_pool_count + NEW.delta)
  WHERE id = NEW.club_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_shuttle_pool_apply ON shuttle_pool_log;
CREATE TRIGGER trg_shuttle_pool_apply
  AFTER INSERT ON shuttle_pool_log
  FOR EACH ROW
  EXECUTE FUNCTION shuttle_pool_apply_delta();

-- ── 5. RLS 활성화 ───────────────────────────────────────────
ALTER TABLE session_shuttle_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shuttle_pool_log ENABLE ROW LEVEL SECURITY;

-- session_shuttle_submissions
-- 같은 클럽 멤버는 모두 조회 (본인 미납 확인용 — 운영진이 다 들여다볼 필요는 X지만
-- 본인 row 보는 것까지 막으면 알림이 어려워서 멤버 SELECT 허용)
CREATE POLICY "shuttle_subm: 클럽 멤버 조회" ON session_shuttle_submissions
  FOR SELECT USING (
    is_club_member(club_id, auth_club_user_id())
  );

-- 운영진(owner/manager)만 INSERT/UPDATE/DELETE
CREATE POLICY "shuttle_subm: 운영진 ALL" ON session_shuttle_submissions
  FOR ALL USING (
    is_club_manager(club_id, auth_club_user_id())
  )
  WITH CHECK (
    is_club_manager(club_id, auth_club_user_id())
  );

-- shuttle_pool_log
CREATE POLICY "pool_log: 클럽 멤버 조회" ON shuttle_pool_log
  FOR SELECT USING (
    is_club_member(club_id, auth_club_user_id())
  );

CREATE POLICY "pool_log: 운영진 INSERT" ON shuttle_pool_log
  FOR INSERT WITH CHECK (
    is_club_manager(club_id, auth_club_user_id())
    AND created_by = auth_club_user_id()
  );

-- (의도적으로 UPDATE/DELETE 정책은 만들지 않음 — 감사 로그는 immutable)

-- ── 6. updated_at 트리거 ────────────────────────────────────
CREATE OR REPLACE FUNCTION shuttle_subm_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_shuttle_subm_touch ON session_shuttle_submissions;
CREATE TRIGGER trg_shuttle_subm_touch
  BEFORE UPDATE ON session_shuttle_submissions
  FOR EACH ROW
  EXECUTE FUNCTION shuttle_subm_touch_updated_at();
