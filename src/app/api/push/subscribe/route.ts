import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'

/**
 * POST /api/push/subscribe
 * Body: { subscription: PushSubscription, clubId: string }
 *
 * 브라우저 PushSubscription 을 push_subscriptions 테이블에 저장합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subscription, clubId } = body as {
      subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
      clubId: string
    }

    if (!subscription?.endpoint || !clubId) {
      return NextResponse.json({ error: 'subscription, clubId 필요' }, { status: 400 })
    }

    const supabase = await createClient()
    const clubUserId = await getClubUserId(supabase)
    if (!clubUserId) {
      return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
    }

    // 해당 클럽 멤버인지 확인
    const { data: membership } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', clubUserId)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: '모임 멤버가 아닙니다' }, { status: 403 })
    }

    // upsert — endpoint 가 같으면 덮어씀
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: clubUserId,
        club_id: clubId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      { onConflict: 'user_id,club_id,endpoint' }
    )

    if (error) {
      console.error('[push/subscribe] upsert error:', error)
      return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[push/subscribe]', e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

/**
 * DELETE /api/push/subscribe
 * Body: { endpoint: string, clubId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint, clubId } = body as { endpoint: string; clubId: string }

    if (!endpoint || !clubId) {
      return NextResponse.json({ error: 'endpoint, clubId 필요' }, { status: 400 })
    }

    const supabase = await createClient()
    const clubUserId = await getClubUserId(supabase)
    if (!clubUserId) {
      return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
    }

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', clubUserId)
      .eq('club_id', clubId)
      .eq('endpoint', endpoint)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[push/unsubscribe]', e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
