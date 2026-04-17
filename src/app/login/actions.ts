'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://birdieminton.com'

export async function loginWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }
  redirect(next)
}

export async function signupWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  })
  if (error) {
    return { error: error.message }
  }
  return { success: '이메일을 확인해주세요. 인증 링크를 보내드렸습니다.' }
}

export async function loginWithGoogle(next?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next ?? '/')}`,
    },
  })
  if (error || !data.url) return { error: '구글 로그인에 실패했습니다.' }
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
