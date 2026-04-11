import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureClubUser } from '@/lib/club/auth'
import { ClubLoginForm } from '@/components/club/ClubLoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 | 버디모아',
  description: '버디모아 — 배드민턴 동호회 관리 서비스',
}

export default async function ClubLoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // 이미 로그인됨 → users 테이블 upsert 후 홈으로
    await ensureClubUser(supabase, user).catch(() => {})
    redirect('/club/home')
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#beff00] rounded-2xl mb-4 text-2xl">
            🏸
          </div>
          <h1 className="text-2xl font-bold text-[#111] tracking-tight">버디모아</h1>
          <p className="text-sm text-[#999] mt-1">배드민턴 동호회 관리 서비스</p>
        </div>

        {/* 폼 */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
          <ClubLoginForm />
        </div>
      </div>
    </div>
  )
}
