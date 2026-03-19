import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: '유효한 이메일을 입력해 주세요.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('subscribers').insert({ email: email.toLowerCase().trim() })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '이미 구독 중인 이메일이에요.' }, { status: 409 })
      }
      return NextResponse.json({ error: '구독 중 오류가 발생했어요.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했어요.' }, { status: 500 })
  }
}
