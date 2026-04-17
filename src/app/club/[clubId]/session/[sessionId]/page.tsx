import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getClubMembers } from '@/lib/club/client'
import { AttendanceClient } from '@/components/club/AttendanceClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '출석 체크 | 버디모아' }

export default async function SessionAttendancePage({
  params,
}: {
  params: Promise<{ clubId: string; sessionId: string }>
}) {
  const { clubId, sessionId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  // 세션 정보
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  if (!session) notFound()

  // 멤버 목록
  const members = await getClubMembers(supabase, clubId)

  // 현재 출석 현황
  const { data: attendances } = await supabase
    .from('attendances')
    .select('*')
    .eq('session_id', sessionId)

  const isManager = ['owner', 'manager'].includes(membership.role)

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
            <h1 className="font-bold text-[#111] text-base">
              {new Date(session.session_date).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </h1>
            <p className="text-xs text-[#999] mt-0.5">출석 체크</p>
          </div>
          {isManager && session.status === 'open' ? (
            <Link
              href={`/club/${clubId}/session/${sessionId}/match`}
              className="text-sm font-semibold text-[#111] bg-[#beff00] px-3 py-1.5 rounded-xl hover:brightness-95 transition-all"
            >
              경기 배정 →
            </Link>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <AttendanceClient
          sessionId={sessionId}
          members={members}
          initialAttendances={attendances ?? []}
          isManager={isManager}
        />
      </main>
    </div>
  )
}
