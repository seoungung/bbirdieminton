import { redirect } from 'next/navigation'

/**
 * T0-1-1: `/club/[clubId]/notices` 는 `[관리] · 공지·가입신청` 탭으로 흡수됨.
 * 외부 진입점·북마크·알림벨 호환을 위해 server-side redirect 유지.
 */
export default async function NoticesPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  redirect(`/club/${clubId}/settings?tab=notices`)
}
