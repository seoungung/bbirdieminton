import { redirect } from 'next/navigation'

/**
 * T0-1-1: `/club/[clubId]/join-requests` 는 `[관리] · 공지·가입신청` 탭으로 흡수됨.
 * 가입 신청 섹션은 settings 페이지 내부에서 owner/manager 권한 검사 후 노출됨.
 * 외부 진입점 0건이라 단순 redirect 만 유지.
 */
export default async function JoinRequestsPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  redirect(`/club/${clubId}/settings?tab=notices`)
}
