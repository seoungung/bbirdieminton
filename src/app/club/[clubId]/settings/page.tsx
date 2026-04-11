import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { SettingsClient } from '@/components/club/SettingsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '게임보드 설정 | 버디민턴' }

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()
  if (!club) notFound()

  const members = await getClubMembers(supabase, clubId)
  const isOwner = membership.role === 'owner'
  const isManager = ['owner', 'manager'].includes(membership.role)

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-base font-bold text-[#111]">설정</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        <SettingsClient
          club={club}
          members={members}
          myMemberId={membership.id}
          isOwner={isOwner}
          isManager={isManager}
        />
      </main>
    </div>
  )
}
