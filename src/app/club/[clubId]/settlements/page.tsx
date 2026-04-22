import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ clubId: string }>
}

export default async function SettlementsRedirectPage({ params }: Props) {
  const { clubId } = await params
  redirect(`/club/${clubId}/finance`)
}
