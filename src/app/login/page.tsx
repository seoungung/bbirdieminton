import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 | 버디민턴',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { next } = await searchParams

  // 이미 로그인된 유저(소셜/이메일)는 홈으로 이동
  if (user && !user.is_anonymous) redirect(next ?? '/')
  // 이미 익명 세션인 유저도 바로 목적지로 이동 (로그인 폼 불필요)
  if (user?.is_anonymous) redirect(next ?? '/club/home')

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-[22px] font-bold text-white tracking-[-0.02em]">버디민턴</h1>
          <p className="text-sm text-white/40 mt-1">배드민턴 관리 플랫폼</p>
        </div>

        {/* 폼 */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-6">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  )
}
