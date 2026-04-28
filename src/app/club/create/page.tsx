import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { ClubCreateForm } from '@/components/club/ClubCreateForm'
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
    <div className="max-w-[1088px] mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-base font-bold text-[#111] leading-tight">동호회 정보를 입력해 시작하세요</h2>
        <p className="text-[12.5px] text-[#999] leading-tight mt-1">
          이름·지역·종목만 있으면 바로 모임을 만들 수 있어요.
        </p>
      </div>
      <ClubCreateForm clubUserId={clubUserId} />
    </div>
  )
}
