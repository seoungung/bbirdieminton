import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { getNoticesAction } from '@/app/club/[clubId]/notices/actions'
import { NoticesClient } from '@/components/club/NoticesClient'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import { Megaphone } from 'lucide-react'
import type { Metadata } from 'next'
import type { NoticeRow } from '@/app/club/[clubId]/notices/actions'

interface PageProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find((c) => c.id === clubId)
  if (demo) return { title: `공지사항 | ${demo.name}`, description: '모임 소식 및 알림' }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `공지사항 | ${club.name}` : '공지사항 | 버디민턴',
    description: '모임 소식 및 알림',
  }
}

export default async function NoticesPage({ params }: PageProps) {
  const { clubId } = await params

  // 데모 클럽 처리
  if (clubId.startsWith('demo-')) {
    const DEMO_NOTICES: NoticeRow[] = [
      {
        id: 'demo-n1',
        club_id: clubId,
        author_member_id: null,
        title: '⚠️ 이번 주 모임 장소 변경 안내',
        body: '이번 주 토요일은 체육관 공사로 인해 옆 건물 B동 2층으로 변경됩니다.\n혼란 없도록 미리 공유드립니다. 질문 있으시면 총무에게 연락주세요.',
        type: 'announcement',
        is_pinned: true,
        image_urls: [],
        created_at: '2026-04-20T09:00:00Z',
        updated_at: '2026-04-20T09:00:00Z',
        author_name: '박총무',
      },
      {
        id: 'demo-n2',
        club_id: clubId,
        author_member_id: null,
        title: '5월 정기 시합 참가자 모집 🏸',
        body: '5월 10일(토) 오전 10시, 정기 시합을 개최합니다!\n선착순 16명 마감이니 참가 희망자는 이름 댓글로 달아주세요.',
        type: 'event',
        is_pinned: false,
        image_urls: [],
        created_at: '2026-04-15T10:00:00Z',
        updated_at: '2026-04-15T10:00:00Z',
        author_name: '박총무',
      },
    ]

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
            initialNotices={DEMO_NOTICES}
            isOwner={false}
            myMemberId="demo"
          />
        </main>
      </div>
    )
  }

  // 실제 클럽 처리
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/login')

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
