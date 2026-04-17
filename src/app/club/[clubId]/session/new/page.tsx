import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { SessionCreateForm } from '@/components/club/SessionCreateForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '세션 만들기 | 버디모아' }

export default async function SessionNewPage({
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

  // owner 또는 manager만 세션 생성 가능
  if (!['owner', 'manager'].includes(membership.role)) {
    redirect(`/club/${clubId}`)
  }

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center justify-between">
          <Link
            href={`/club/${clubId}`}
            className="flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">뒤로</span>
          </Link>
          <div className="text-center">
            <h1 className="font-bold text-[#111] text-base">세션 만들기</h1>
            <p className="text-xs text-[#999] mt-0.5">오늘의 운동 세션을 시작해요</p>
          </div>
          <div className="w-16" />
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-6">
        <SessionCreateForm clubId={clubId} memberId={membership.id} />
      </main>
    </div>
  )
}
