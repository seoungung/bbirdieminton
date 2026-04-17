import { redirect } from 'next/navigation'

export default async function ClubHubPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  // 과거 허브 URL — 공개 뷰로 통일
  redirect(`/club/${clubId}/view`)
}
