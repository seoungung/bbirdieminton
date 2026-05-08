import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import {
  getMyJoinRequestAction,
  type JoinRequestStatus,
} from '@/app/club/[clubId]/join-requests/actions'
import { ClubPreviewClient } from '@/components/club/preview/ClubPreviewClient'
import { DEMO_CLUBS, DEMO_MEMBERS } from '@/lib/club/demoData'
import type {
  ClubPreview,
  ClubPreviewVibe,
  ClubFAQ,
} from '@/types/club'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params

  if (clubId.startsWith('demo-')) {
    const title = '체험 모임 | 모임 둘러보기 | 버디민턴'
    const description =
      '버디민턴 체험용 모임 — 분위기·일정·회비를 미리 둘러보세요.'
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: '버디민턴',
        locale: 'ko_KR',
        url: `https://birdieminton.com/clubs/${clubId}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    }
  }

  const supabase = await createClient()
  const { data } = await supabase.rpc('get_club_preview', { p_club_id: clubId })
  const preview = (data as ClubPreview | null) ?? null

  if (!preview) {
    const title = '모임 | 버디민턴'
    const description = '모임 미리보기'
    return {
      title,
      description,
      openGraph: { title, description, type: 'website', siteName: '버디민턴', locale: 'ko_KR' },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  /* description: 클럽 소개 첫 100자, 없으면 default */
  const rawDesc = preview.description?.trim()
  const description = rawDesc
    ? rawDesc.length > 100
      ? rawDesc.slice(0, 100) + '…'
      : rawDesc
    : `${preview.name} 배드민턴 동호회 — 분위기·일정·회비를 확인해보세요.`

  const title = `${preview.name} | 모임 둘러보기 | 버디민턴`
  const url = `https://birdieminton.com/clubs/${clubId}`
  const image = preview.thumbnail_url ?? undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: '버디민턴',
      locale: 'ko_KR',
      url,
      ...(image ? { images: [{ url: image, alt: preview.name }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function ClubPreviewPage({ params }: PageProps) {
  const { clubId } = await params

  /* 데모 클럽: DEMO_CLUBS 데이터로 프리뷰 렌더링 (Supabase RPC 우회).
   * 하단 CTA 는 isMember=true 로 두어 "모임 들어가기" → /club/demo-id 흐름.
   * recentMembers / vibe 는 DEMO_MEMBERS 로 합성해 멤버 그리드·분위기 카드 살아 보이게. */
  if (clubId.startsWith('demo-')) {
    const demo = DEMO_CLUBS.find((d) => d.id === clubId)
    if (!demo) notFound()

    /* 데모 멤버를 ClubPreviewMember 형식으로 변환 — joined_at 은 최근일수록 가까운 시점 */
    const recentDemoMembers = DEMO_MEMBERS.map((m, idx) => ({
      id: m.id,
      name: m.name,
      profile_img: null as string | null,
      role:
        m.role === 'owner'
          ? ('owner' as const)
          : m.role === 'manager'
          ? ('manager' as const)
          : ('member' as const),
      /* 첫 멤버는 60일 전 가입(오너), 이후 점점 최근으로 — 마지막 3명 정도가 NEW(7일 이내) */
      joined_at: new Date(
        Date.now() - (DEMO_MEMBERS.length - idx) * 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    }))

    /* 데모 vibe — 4 KPI 카드 노출용 */
    const demoVibe = {
      total_members: DEMO_MEMBERS.length,
      male_count: DEMO_MEMBERS.filter((m) => m.gender === 'M').length,
      female_count: DEMO_MEMBERS.filter((m) => m.gender === 'F').length,
      recent_join_30d: 5,
      avg_attendance_30d: 12.4,
      grade_distribution: DEMO_MEMBERS.reduce(
        (acc, m) => {
          /* skill_score → 등급 매핑은 별도 헬퍼가 있지만, level 컬럼을 단순 매핑 */
          const lvl = m.level
          let g: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F'
          if (lvl === 'B조' || lvl === 'A조') g = 'B'
          else if (lvl === 'C조') g = 'C'
          else if (lvl === 'D조') g = 'D'
          else if (lvl === '초심자') g = 'E'
          else if (lvl === '왕초보') g = 'F'
          acc[g] = (acc[g] ?? 0) + 1
          return acc
        },
        {} as Record<'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F', number>,
      ),
    }

    return (
      <ClubPreviewClient
        clubId={demo.id}
        name={demo.name}
        description={demo.description}
        location={demo.location}
        activityPlace={demo.activityPlace}
        category={demo.category}
        courtCount={demo.court_count}
        thumbnailColor={demo.thumbnailColor}
        thumbnailUrl={null}
        ownerName={demo.leaderName}
        ownerProfileImg={null}
        memberCount={demo.memberCount}
        upcomingEvents={[]}
        recentMembers={recentDemoMembers}
        isLoggedIn
        isMember
        myJoinStatus={null}
        tags={['초보환영', '여성친화', '주말활발']}
        feeMonthly={null}
        feePerSession={null}
        feeNote={null}
        ownerBio="10년차 동호인, 초심자 환영합니다"
        photoUrls={[]}
        scheduleSummary="매주 토/일 11:00~15:00"
        faqs={[]}
        vibe={demoVibe}
        contactUrl={null}
      />
    )
  }

  const supabase = await createClient()

  /* RLS 우회 RPC 로 공개 정보 조회 — 비로그인도 호출 가능.
     vibe RPC 는 옵셔널 — 마이그레이션 미적용 환경에서는 null 처리. */
  const [previewRes, vibeRes] = await Promise.all([
    supabase.rpc('get_club_preview', { p_club_id: clubId }),
    supabase
      .rpc('get_club_preview_vibe', { p_club_id: clubId })
      .then(
        (r) => r,
        () => ({ data: null, error: { message: 'rpc_missing' } }),
      ),
  ])

  const preview = (previewRes.data as ClubPreview | null) ?? null
  if (!preview) notFound()

  const vibe: ClubPreviewVibe | null =
    vibeRes && 'data' in vibeRes && vibeRes.data
      ? (vibeRes.data as ClubPreviewVibe)
      : null

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

  /* Phase A 신규 컬럼 — RPC 미갱신 환경에서도 안전하게 fallback */
  const tags = Array.isArray(preview.tags) ? preview.tags : []
  const photoUrls = Array.isArray(preview.photo_urls) ? preview.photo_urls : []
  const faqsRaw = Array.isArray(preview.faqs) ? preview.faqs : []
  const faqs: ClubFAQ[] = faqsRaw
    .filter(
      (f): f is ClubFAQ =>
        !!f &&
        typeof (f as ClubFAQ).question === 'string' &&
        typeof (f as ClubFAQ).answer === 'string',
    )
    .map((f) => ({ question: f.question, answer: f.answer }))

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
      ownerProfileImg={preview.owner_profile_img ?? null}
      memberCount={preview.member_count}
      upcomingEvents={preview.upcoming_events ?? []}
      recentMembers={preview.recent_members ?? []}
      isLoggedIn={isLoggedIn}
      isMember={isMember}
      myJoinStatus={myStatus}
      tags={tags}
      feeMonthly={preview.fee_monthly ?? null}
      feePerSession={preview.fee_per_session ?? null}
      feeNote={preview.fee_note ?? null}
      ownerBio={preview.owner_bio ?? null}
      photoUrls={photoUrls}
      scheduleSummary={preview.schedule_summary ?? null}
      faqs={faqs}
      vibe={vibe}
      contactUrl={preview.contact_url ?? null}
    />
  )
}
