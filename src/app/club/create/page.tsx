import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { ClubCreateForm } from '@/components/club/ClubCreateForm'
import { BackButton } from '@/components/club/BackButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '모임 만들기 | 버디민턴', description: '새로운 배드민턴 동호회 모임을 만들어보세요' }

export default async function ClubCreatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[#f0f0f0] px-4 py-4">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <BackButton fallback="/club/home" className="flex items-center gap-1.5 text-[#888] hover:text-[#111] transition-colors" />
          <div>
            <h1 className="text-base font-bold text-[#111] leading-tight">새 모임 만들기</h1>
            <p className="text-[12px] text-[#999] leading-tight">동호회 정보를 입력해 시작하세요</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-8">
        <ClubCreateForm clubUserId={clubUserId} />
      </main>
    </div>
  )
}
