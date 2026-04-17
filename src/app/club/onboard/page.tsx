import { redirect } from 'next/navigation'

// /club/onboard → /login 으로 통합됨
export default function OnboardPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  const next = searchParams.next
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login')
}
