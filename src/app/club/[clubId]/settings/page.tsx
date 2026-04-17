import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { SettingsClient } from '@/components/club/SettingsClient'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import type { Metadata } from 'next'

interface SettingsMetadataProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: SettingsMetadataProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (demo) return { title: `게임보드 설정 | ${demo.name}`, description: '게임보드 설정 및 모임 관리' }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return { title: club ? `게임보드 설정 | ${club.name}` : '게임보드 설정 | 버디민턴', description: '게임보드 설정 및 모임 관리' }
}

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
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto">
          <h1 className="text-base font-bold text-[#111]">설정</h1>
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-5">
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
