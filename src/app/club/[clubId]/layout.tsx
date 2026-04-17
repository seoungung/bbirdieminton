import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {children}
    </div>
  )
}
