/**
 * POST /api/cron/dues-reminder
 *
 * Vercel Cron 또는 외부 스케줄러가 매일 자정 KST(15:00 UTC)에 호출.
 *
 * 실행 일정:
 *   - 매월 1일  (D+0) — 이번 달 회비 납부 안내
 *   - 매월 4일  (D+3) — 첫 번째 독촉
 *   - 매월 8일  (D+7) — 두 번째 독촉
 *   - 매월 15일 (D+14) — 최종 독촉
 *
 * 동작:
 *   1. 현재 월에 dues.paid = false 인 멤버를 클럽별로 조회
 *   2. 각 멤버에게 Web Push 발송
 *   3. 각 멤버에게 이메일 발송 (Resend)
 *   4. 클럽 운영진에게 미납 요약 알림
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendClubPush } from '@/lib/club/push'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// 회비 독촉 발송일 (매월 n일)
const REMINDER_DAYS = new Set([1, 4, 8, 15])

// KST = UTC + 9
function getTodayKST(): { day: number; year: number; month: number } {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return {
    day: kst.getUTCDate(),
    year: kst.getUTCFullYear(),
    month: kst.getUTCMonth() + 1, // 1-indexed
  }
}

function reminderLabel(day: number): string {
  if (day === 1) return '이번 달 회비 납부 안내'
  if (day === 4) return '회비 납부 안내 (D+3)'
  if (day === 8) return '회비 납부 안내 (D+7)'
  if (day === 15) return '회비 납부 마감 안내 (D+14)'
  return '회비 납부 안내'
}

export async function POST(req: Request) {
  // ── 인증 ────────────────────────────────────────────
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { day, year, month } = getTodayKST()

  // 오늘이 발송일이 아니면 스킵
  if (!REMINDER_DAYS.has(day)) {
    return NextResponse.json({ skipped: true, reason: `day ${day} is not a reminder day` })
  }

  const label = reminderLabel(day)
  const admin = createAdminClient()

  // ── 이번 달 미납 회비 조회 ──────────────────────────
  // dues 테이블에서 paid=false 인 행 + 클럽명 + 멤버 이메일/이름 조인
  const { data: unpaidRows, error: unpaidErr } = await admin
    .from('dues')
    .select(`
      id,
      club_id,
      member_id,
      amount,
      club:clubs!inner(id, name),
      member:club_members!inner(
        id,
        user:users!inner(id, name, email)
      )
    `)
    .eq('year', year)
    .eq('month', month)
    .eq('paid', false)

  if (unpaidErr) {
    console.error('[dues-reminder] query error:', unpaidErr)
    return NextResponse.json({ error: unpaidErr.message }, { status: 500 })
  }

  if (!unpaidRows || unpaidRows.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: '미납 회비 없음' })
  }

  // ── 클럽별 그룹핑 ────────────────────────────────────
  type ClubGroup = {
    clubId: string
    clubName: string
    members: Array<{ userId: string; name: string; email: string | null; amount: number }>
  }

  const clubMap = new Map<string, ClubGroup>()

  for (const row of unpaidRows as unknown as Array<{
    club_id: string
    member_id: string
    amount: number
    club: { id: string; name: string }
    member: { id: string; user: { id: string; name: string; email: string | null } }
  }>) {
    const cid = row.club_id
    if (!clubMap.has(cid)) {
      clubMap.set(cid, { clubId: cid, clubName: row.club.name, members: [] })
    }
    clubMap.get(cid)!.members.push({
      userId: row.member.user.id,
      name: row.member.user.name,
      email: row.member.user.email,
      amount: row.amount,
    })
  }

  let totalPushSent = 0
  let totalEmailSent = 0

  // ── 클럽별 알림 발송 ─────────────────────────────────
  for (const group of clubMap.values()) {
    const { clubId, clubName, members } = group

    // 1) 클럽 전체 Push (push_subscriptions 에 club_id로 매핑된 미납자만)
    //    미납자 user_id 목록으로 필터
    const unpaidUserIds = members.map(m => m.userId)

    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth, user_id')
      .eq('club_id', clubId)
      .in('user_id', unpaidUserIds)

    if (subs && subs.length > 0) {
      const expiredIds: string[] = []
      const webpush = (await import('web-push')).default

      // VAPID 설정 (lazy)
      try {
        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT ?? 'mailto:admin@birdieminton.com',
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
          process.env.VAPID_PRIVATE_KEY ?? ''
        )
      } catch {
        // 이미 설정된 경우 무시
      }

      await Promise.allSettled(
        subs.map(async (sub) => {
          const member = members.find(m => m.userId === sub.user_id)
          const amountText = member?.amount ? ` (${member.amount.toLocaleString()}원)` : ''
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              JSON.stringify({
                title: `📢 ${clubName} 회비 안내`,
                body: `${month}월 회비${amountText} 납부를 부탁드려요`,
                url: `/club/${clubId}/view`,
                tag: `dues-${clubId}-${year}-${month}`,
              }),
              { TTL: 86400 }
            )
            totalPushSent++
          } catch (err: unknown) {
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
    }

    // 2) 이메일 발송 (email 주소가 있는 미납자)
    const emailTargets = members.filter(m => m.email && m.email.includes('@'))

    await Promise.allSettled(
      emailTargets.map(async (member) => {
        const amountText = member.amount ? `<strong>${member.amount.toLocaleString()}원</strong>` : '회비'
        try {
          await resend.emails.send({
            from: 'birdieminton <noreply@birdieminton.com>',
            to: member.email!,
            subject: `[${clubName}] ${month}월 회비 납부 안내`,
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
                <h2 style="color:#111;margin-bottom:8px;">${label}</h2>
                <p style="color:#555;line-height:1.6;">
                  안녕하세요, <strong>${member.name}</strong>님!<br/>
                  <strong>${clubName}</strong>의 ${year}년 ${month}월 회비 ${amountText} 납부를 부탁드립니다.
                </p>
                <a href="https://birdieminton.com/club/${clubId}/view"
                   style="display:inline-block;margin-top:16px;padding:12px 24px;background:#beff00;color:#111;font-weight:bold;border-radius:12px;text-decoration:none;">
                  모임 바로가기
                </a>
                <p style="margin-top:24px;font-size:12px;color:#999;">
                  이 메일은 버디민턴 클럽 알림 서비스에서 발송됩니다.
                </p>
              </div>
            `,
          })
          totalEmailSent++
        } catch (err) {
          console.error('[dues-reminder] email error:', member.email, err)
        }
      })
    )

    // 3) 운영진에게 미납 현황 요약 Push
    if (members.length > 0) {
      await sendClubPush(admin, clubId, {
        title: `📊 ${clubName} 회비 현황`,
        body: `${month}월 미납 ${members.length}명 · 독촉 알림을 발송했어요`,
        url: `/club/${clubId}/finance`,
        tag: `dues-summary-${clubId}-${year}-${month}`,
      })
    }
  }

  return NextResponse.json({
    ok: true,
    day,
    label,
    clubs: clubMap.size,
    totalUnpaid: unpaidRows.length,
    totalPushSent,
    totalEmailSent,
  })
}
