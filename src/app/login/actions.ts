'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }
  redirect('/')
}

export async function signupWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://birdieminton.com'}/auth/callback` },
  })
  if (error) {
    return { error: error.message }
  }
  return { success: '이메일을 확인해주세요. 인증 링크를 보내드렸습니다.' }
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://birdieminton.com'}/auth/callback`,
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
