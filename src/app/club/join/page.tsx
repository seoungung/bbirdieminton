import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { ClubJoinForm } from '@/components/club/ClubJoinForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '초대코드 입력 | 버디민턴', description: '초대코드를 입력해 모임에 참여하세요' }

export default async function ClubJoinPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-[1088px] mx-auto">
          <h1 className="text-lg font-bold text-[#111]">초대코드 입력</h1>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <p className="font-bold text-[#111] text-lg">초대코드를 입력해주세요</p>
          <p className="text-sm text-[#999] mt-1">운영자에게 받은 8자리 코드를 입력하세요</p>
        </div>
        <ClubJoinForm clubUserId={clubUserId} />
      </main>
    </div>
  )
}
