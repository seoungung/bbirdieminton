/**
 * 서버 사이드 Web Push 발송 유틸리티
 *
 * 사용 방법:
 *   import { sendClubPush } from '@/lib/club/push'
 *   await sendClubPush(supabaseAdminClient, clubId, { title: '알림', body: '내용', url: '/club/...' })
 */

import webpush from 'web-push'
import type { SupabaseClient } from '@supabase/supabase-js'

// VAPID 설정 — 최초 import 시 한 번만 초기화
let vapidConfigured = false
function ensureVapid() {
  if (vapidConfigured) return
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:admin@birdieminton.com'

  if (!publicKey || !privateKey) {
    console.warn('[push] VAPID 키가 설정되지 않았습니다. .env.local 확인')
    return
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * 특정 클럽의 모든 구독자에게 푸시 알림 발송
 */
export async function sendClubPush(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any>,
  clubId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  ensureVapid()
  if (!vapidConfigured) return { sent: 0, failed: 0 }

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('club_id', clubId)

  if (!subs || subs.length === 0) return { sent: 0, failed: 0 }

  let sent = 0
  let failed = 0
  const expiredIds: string[] = []

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
          { TTL: 86400 } // 24시간 TTL
        )
        sent++
      } catch (err: unknown) {
        failed++
        // HTTP 410 Gone = 만료된 구독 → 삭제 예약
        if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
          expiredIds.push(sub.id)
        }
      }
    })
  )

  // 만료된 구독 정리
  if (expiredIds.length > 0) {
    await admin.from('push_subscriptions').delete().in('id', expiredIds)
  }

  return { sent, failed }
}

/**
 * 특정 유저(단일)에게 푸시 알림 발송
 */
export async function sendUserPush(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any>,
  userId: string,
  clubId: string,
  payload: PushPayload
): Promise<void> {
  ensureVapid()
  if (!vapidConfigured) return

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)
    .eq('club_id', clubId)

  if (!subs || subs.length === 0) return

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
        { TTL: 86400 }
      )
    )
  )
}
