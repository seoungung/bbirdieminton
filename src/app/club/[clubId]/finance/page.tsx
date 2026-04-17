import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { FinanceClient } from '@/components/club/FinanceClient'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import type { Metadata } from 'next'

interface FinanceMetadataProps { params: Promise<{ clubId: string }> }

export async function generateMetadata({ params }: FinanceMetadataProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (demo) return { title: `회비 관리 | ${demo.name}`, description: '모임 회비 납부 현황 관리' }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return { title: club ? `회비 관리 | ${club.name}` : '회비 관리 | 버디민턴', description: '모임 회비 납부 현황 관리' }
}

export default async function FinancePage({ params }: { params: Promise<{ clubId: string }> }) {
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

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: duesData } = await supabase
    .from('dues')
    .select('*')
    .eq('club_id', clubId)
    .eq('year', year)
    .eq('month', month)

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-4">
        <div className="max-w-[1088px] mx-auto">
          <h1 className="text-base font-bold text-[#111]">💰 회비 관리</h1>
          <p className="text-xs text-[#999] mt-0.5">{year}년 {month}월</p>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <FinanceClient
          clubId={clubId}
          members={members}
          duesData={duesData ?? []}
          isManager={isManager}
          year={year}
          month={month}
        />
      </main>
    </div>
  )
}
