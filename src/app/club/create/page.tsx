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
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-[1088px] mx-auto">
          <h1 className="text-lg font-bold text-[#111]">모임 만들기</h1>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-6">
        <ClubCreateForm clubUserId={clubUserId} />
      </main>
    </div>
  )
}
