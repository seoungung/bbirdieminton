import { redirect } from 'next/navigation'

// /club/onboard → /login 으로 통합됨
export default async function OnboardPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login')
}
