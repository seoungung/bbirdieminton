-- ============================================================
-- push_subscriptions — 브라우저 Web Push 구독 저장 (대기 자동 승격 알림 등)
-- ============================================================
-- /api/push/subscribe POST 가 이 테이블에 upsert.
-- Web Push API: VAPID 키로 서명된 메시지를 endpoint 로 전송.

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- (user, club, endpoint) 단위 unique — 다른 기기/브라우저는 endpoint 가 다름
  UNIQUE (user_id, club_id, endpoint)
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_club_idx ON push_subscriptions (club_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS — 본인 행만 조회/삭제 가능, INSERT 는 subscribe API 가 service_role 미사용 (auth.uid 매칭)
DROP POLICY IF EXISTS push_subscriptions_self_select ON push_subscriptions;
CREATE POLICY push_subscriptions_self_select ON push_subscriptions
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS push_subscriptions_self_insert ON push_subscriptions;
CREATE POLICY push_subscriptions_self_insert ON push_subscriptions
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS push_subscriptions_self_update ON push_subscriptions;
CREATE POLICY push_subscriptions_self_update ON push_subscriptions
  FOR UPDATE USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS push_subscriptions_self_delete ON push_subscriptions;
CREATE POLICY push_subscriptions_self_delete ON push_subscriptions
  FOR DELETE USING (user_id::text = auth.uid()::text);
