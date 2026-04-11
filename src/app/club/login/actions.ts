'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureClubUser } from '@/lib/club/auth'
import { redirect } from 'next/navigation'

export async function clubLoginWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }

  try {
    await ensureClubUser(supabase, data.user)
  } catch {
    // users 테이블 upsert 실패해도 로그인 자체는 허용
  }
  redirect('/club/home')
}

export async function clubSignupWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://birdieminton.com'}/auth/callback?next=/club/home`,
    },
  })
  if (error) return { error: error.message }
  return { success: '이메일을 확인해주세요. 인증 링크를 보내드렸습니다.' }
}

export async function clubLoginWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://birdieminton.com'}/auth/callback?next=/club/home`,
    },
  })
  if (error || !data.url) return { error: '구글 로그인에 실패했습니다.' }
  redirect(data.url)
}
