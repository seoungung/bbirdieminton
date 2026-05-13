import { redirect } from 'next/navigation'

/**
 * T0-1-1: `/club/[clubId]/finance` 는 `[관리] · 회비` 탭으로 흡수됨.
 * 외부 진입점·북마크 호환을 위해 server-side redirect 유지.
 */
export default async function FinancePage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  redirect(`/club/${clubId}/settings?tab=finance`)
}
