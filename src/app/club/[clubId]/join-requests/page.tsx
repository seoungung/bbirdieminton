import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { UserPlus } from 'lucide-react'
import { JoinRequestsClient } from './JoinRequestsClient'
import { BackButton } from '@/components/club/BackButton'
import { getJoinRequestsAction } from './actions'
import type { Metadata } from 'next'

interface Props { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `가입 신청 관리 | ${club.name}` : '가입 신청 관리 | 버디민턴',
    description: '모임 가입 신청 승인/거절',
  }
}

export default async function JoinRequestsPage({ params }: Props) {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  if (!['owner', 'manager'].includes(membership.role)) {
    redirect(`/club/${clubId}/view`)
  }

  const requests = await getJoinRequestsAction(clubId)

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <BackButton fallback={`/club/${clubId}/manage`} />
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <UserPlus size={16} strokeWidth={2} />
              가입 신청 관리
            </h1>
            <p className="text-xs text-[#999] mt-0.5">대기 중 {requests.length}건</p>
          </div>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <JoinRequestsClient clubId={clubId} initialRequests={requests} />
      </main>
    </div>
  )
}
