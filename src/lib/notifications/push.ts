import 'server-only'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

/* VAPID 키 — 환경변수에서 1회 setup. (브라우저용 publicKey 는 NEXT_PUBLIC_ 으로 분리) */
let vapidConfigured = false
function ensureVapid(): boolean {
  if (vapidConfigured) return true
  const subject = process.env.VAPID_SUBJECT
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!subject || !publicKey || !privateKey) {
    console.warn('[push] VAPID env 미설정 — 알림 비활성')
    return false
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
  return true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  /** 알림 그룹화 (e.g. `event-${id}`) — 같은 tag 면 덮어씀 */
  tag?: string
}

/**
 * 단일 user_id 에 등록된 모든 push subscription 으로 알림 발송.
 * 만료/잘못된 endpoint 는 자동 정리 (HTTP 404/410).
 *
 * 한 사람이 여러 기기에서 구독했을 수 있음 (PC + 모바일).
 * 모두 발송 — 중복 알림은 클라이언트 SW 의 tag 로 머지.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  if (!ensureVapid()) return { sent: 0, failed: 0 }

  const supabase = await createClient()
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (error || !subs || subs.length === 0) {
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0
  const expiredIds: string[] = []

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          JSON.stringify(payload),
          { TTL: 60 * 60 }, // 1시간 안에 못 받으면 폐기 (대기 알림은 즉시성 중요)
        )
        sent++
      } catch (e) {
        failed++
        const status = (e as { statusCode?: number })?.statusCode
        if (status === 404 || status === 410) {
          expiredIds.push(s.id)
        } else {
          console.warn('[push] send error', status, (e as Error).message)
        }
      }
    }),
  )

  /* 만료된 subscription 정리 (404/410 = endpoint 무효) */
  if (expiredIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', expiredIds)
  }

  return { sent, failed }
}

/**
 * 여러 user_id 에 같은 payload 를 동시에 발송.
 * 대기 명단에 여러 명이 한 번에 승격되는 케이스는 거의 없지만 (정원 1자리만 빔)
 * 안전하게 배치 지원.
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  if (userIds.length === 0) return { sent: 0, failed: 0 }
  const results = await Promise.all(
    userIds.map((id) => sendPushToUser(id, payload)),
  )
  return results.reduce(
    (acc, r) => ({ sent: acc.sent + r.sent, failed: acc.failed + r.failed }),
    { sent: 0, failed: 0 },
  )
}
