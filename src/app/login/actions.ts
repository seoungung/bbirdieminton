'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://birdieminton.com'

// 이메일 로그인·구글 로그인 Server Action은 v2 카카오 단일 정책 도입 후 호출처가
// 모두 사라졌으나, Server Action ID로의 외부 호출 가능성과 open redirect를 막기
// 위해 통째로 제거함. (이전 액션: loginWithEmail/signupWithEmail/loginWithGoogle)

export async function loginWithKakao(next?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next ?? '/club/home')}`,
    },
  })
  if (error || !data.url) return { error: '카카오 로그인에 실패했습니다.' }
  redirect(data.url)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * 익명 로그인 직후 클라이언트에서 호출.
 * 서버에서 쿠키 세션을 읽어 users 테이블에 닉네임을 upsert 한다.
 * 클라이언트 측 PostgREST 타이밍 버그를 우회하기 위해 Server Action 사용.
 */
export async function saveGuestName(name: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('users').upsert(
    { birdieminton_user_id: user.id, name },
    { onConflict: 'birdieminton_user_id', ignoreDuplicates: false }
  )
  if (error) return { error: error.message }
  return {}
}
