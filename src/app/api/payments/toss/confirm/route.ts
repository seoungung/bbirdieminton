import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const EXPECTED_AMOUNT = 3900

export async function POST(request: Request) {
  try {
    // 인증 게이트 — 로그인 사용자만 결제 확정 가능 (replay/anonymous 차단)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { paymentKey, orderId, amount } = await request.json() as {
      paymentKey: string
      orderId: string
      amount: number
    }

    // 입력 sanity 체크 (orderId/paymentKey 비어있거나 비정상 길이 차단)
    if (
      typeof paymentKey !== 'string' ||
      typeof orderId !== 'string' ||
      paymentKey.length === 0 ||
      paymentKey.length > 200 ||
      orderId.length === 0 ||
      orderId.length > 64
    ) {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD', message: '결제 정보가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 금액 위변조 검증
    if (amount !== EXPECTED_AMOUNT) {
      return NextResponse.json(
        { error: 'INVALID_AMOUNT', message: '결제 금액이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      console.error('[Toss] TOSS_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'SERVER_CONFIG_ERROR', message: '서버 설정 오류입니다.' },
        { status: 500 }
      )
    }

    const encoded = Buffer.from(`${secretKey}:`).toString('base64')
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    const data = await tossRes.json() as { code?: string; message?: string }

    if (!tossRes.ok) {
      console.error('[Toss] confirm failed:', data)
      return NextResponse.json(
        { error: data.code ?? 'CONFIRM_FAILED', message: data.message ?? '결제 확인에 실패했습니다.' },
        { status: tossRes.status }
      )
    }

    // TODO: Supabase에 orders 레코드 저장 + PDF 발송 로직
    // const supabase = await createClient()
    // await supabase.from('orders').insert({ order_id: orderId, payment_key: paymentKey, amount })

    return NextResponse.json({ success: true, paymentKey, orderId, amount })
  } catch (err) {
    console.error('[Toss] confirm route error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '서버 내부 오류입니다.' },
      { status: 500 }
    )
  }
}
