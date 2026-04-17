import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { MembersClient } from '@/components/club/MembersClient'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import type { Metadata } from 'next'

interface MembersMetadataProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: MembersMetadataProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (demo) return { title: `멤버 관리 | ${demo.name}`, description: '모임 멤버 목록 및 역할 관리' }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return { title: club ? `멤버 관리 | ${club.name}` : '멤버 관리 | 버디민턴', description: '모임 멤버 목록 및 역할 관리' }
}

export default async function MembersPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  const { data: club } = await supabase.from('clubs').select('*').eq('id', clubId).single()
  if (!club) notFound()

  const members = await getClubMembers(supabase, clubId)
  const isManager = ['owner', 'manager'].includes(membership.role)
  const isOwner = membership.role === 'owner'

  // player_stats 조회
  const { data: statsData } = await supabase
    .from('player_stats')
    .select('*')
    .eq('club_id', clubId)

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-[1088px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-[#111]">👥 회원 관리</h1>
            <p className="text-xs text-[#999] mt-0.5">총 {members.length}명</p>
          </div>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <MembersClient
          clubId={clubId}
          members={members}
          statsData={statsData ?? []}
          isManager={isManager}
          isOwner={isOwner}
          myMemberId={membership.id}
        />
      </main>
    </div>
  )
}
