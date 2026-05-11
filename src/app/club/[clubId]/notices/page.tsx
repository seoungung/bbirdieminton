import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { getNoticesAction } from '@/app/club/[clubId]/notices/actions'
import { NoticesClient } from '@/components/club/NoticesClient'
import { Megaphone } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `공지사항 | ${club.name}` : '공지사항 | 버디민턴',
    description: '모임 소식 및 알림',
  }
}

export default async function NoticesPage({ params }: PageProps) {
  const { clubId } = await params

  // 실제 클럽 처리
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  // 비멤버는 클럽 홈으로 (다른 페이지들과 일관성 — /login으로 떨어뜨리지 않음)
  if (!membership) redirect('/clubs')

  const notices = await getNoticesAction(clubId)

  const isOwner = membership.role === 'owner'
  const myMemberId = membership.id

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <Megaphone size={16} strokeWidth={2} />
              공지사항
            </h1>
            <p className="text-xs text-[#999] mt-0.5">모임 소식 및 알림</p>
          </div>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <NoticesClient
          clubId={clubId}
          initialNotices={notices}
          isOwner={isOwner}
          myMemberId={myMemberId}
        />
      </main>
    </div>
  )
}
