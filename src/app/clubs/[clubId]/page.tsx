import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import {
  getMyJoinRequestAction,
  type JoinRequestStatus,
} from '@/app/club/[clubId]/join-requests/actions'
import { ClubPreviewClient } from '@/components/club/preview/ClubPreviewClient'
import type { ClubPreview } from '@/types/club'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  if (clubId.startsWith('demo-')) {
    return { title: '체험 모임 | 버디민턴', description: '체험용 모임 미리보기' }
  }
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_club_preview', { p_club_id: clubId })
  const preview = (data as ClubPreview | null) ?? null
  if (!preview) return { title: '모임 | 버디민턴', description: '모임 미리보기' }
  return {
    title: `${preview.name} | 버디민턴`,
    description: preview.description ?? `${preview.name} 모임 미리보기`,
  }
}

export default async function ClubPreviewPage({ params }: PageProps) {
  const { clubId } = await params

  /* 데모 클럽: preview 가 아니라 그대로 데모 대시보드로 진입 */
  if (clubId.startsWith('demo-')) {
    redirect(`/club/${clubId}`)
  }

  const supabase = await createClient()

  /* RLS 우회 RPC 로 공개 정보 조회 — 비로그인도 호출 가능 */
  const { data: previewRaw } = await supabase.rpc('get_club_preview', {
    p_club_id: clubId,
  })
  const preview = (previewRaw as ClubPreview | null) ?? null
  if (!preview) notFound()

  /* 인증 상태 확인 (옵셔널) */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isLoggedIn = false
  let isMember = false
  let myStatus: JoinRequestStatus | null = null

  if (user) {
    isLoggedIn = true
    const clubUserId = await getClubUserId(supabase, user)

    if (clubUserId) {
      /* 이미 멤버인지 확인 */
      const membership = await getMyMembership(supabase, clubId, clubUserId)
      isMember = !!membership

      /* 신청 상태 조회 (멤버 아닐 때만 의미 있음) */
      if (!isMember) {
        const myReq = await getMyJoinRequestAction(clubId)
        myStatus = myReq?.status ?? null
      }
    }
  }

  return (
    <ClubPreviewClient
      clubId={clubId}
      name={preview.name}
      description={preview.description}
      location={preview.location}
      activityPlace={preview.activity_place}
      category={preview.category}
      courtCount={preview.court_count}
      thumbnailColor={preview.thumbnail_color ?? '#f0f0f0'}
      thumbnailUrl={preview.thumbnail_url}
      ownerName={preview.owner_name}
      memberCount={preview.member_count}
      upcomingEvents={preview.upcoming_events ?? []}
      recentMembers={preview.recent_members ?? []}
      isLoggedIn={isLoggedIn}
      isMember={isMember}
      myJoinStatus={myStatus}
    />
  )
}
