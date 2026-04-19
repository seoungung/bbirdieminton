import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'

export default async function ClubDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const isViewPage = pathname.endsWith('/view')

  if (isViewPage || clubId.startsWith('demo-')) {
    return <div className="min-h-screen bg-[#f8f8f8]">{children}</div>
  }

  // getAuthUser() = React.cache 래핑 — 같은 요청에서 page.tsx가 재호출해도 캐시 반환
  const [user, supabase] = await Promise.all([getAuthUser(), createClient()])
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase, user)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {children}
    </div>
  )
}
