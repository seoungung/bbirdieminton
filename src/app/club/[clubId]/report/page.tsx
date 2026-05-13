import { redirect } from 'next/navigation'

/**
 * T0-1-2: 시즌 리포트는 PRD §2.2 [스탯] 통합 허브의 한 탭으로 흡수됨.
 *
 * 외부 북마크·과거 링크 호환을 위해 `?days=` 쿼리는 유지하면서
 * `/club/[clubId]/stats?tab=report&days=N` 으로 리다이렉트.
 */
export default async function ReportPageRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ clubId: string }>
  searchParams: Promise<{ days?: string | string[] }>
}) {
  const { clubId } = await params
  const { days: rawDays } = await searchParams
  const daysParam = Array.isArray(rawDays) ? rawDays[0] : rawDays

  const target = daysParam
    ? `/club/${clubId}/stats?tab=report&days=${encodeURIComponent(daysParam)}`
    : `/club/${clubId}/stats?tab=report`

  redirect(target)
}
