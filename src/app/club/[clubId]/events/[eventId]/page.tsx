import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { CalendarDays } from 'lucide-react'
import { EventDetailClient } from '@/components/club/EventDetailClient'
import type { Metadata } from 'next'
import type { EventAttendStatus } from '@/types/club'
import type { EventDetail, AttendeeRow, WaitlistEntry } from '@/components/club/events/types'

interface PageProps {
  params: Promise<{ clubId: string; eventId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `정기모임 | ${club.name}` : '정기모임 | 버디민턴',
    description: '정기모임 상세',
  }
}

function PageHeader({ clubId }: { clubId: string }) {
  return (
    <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
      <div className="max-w-[1088px] mx-auto flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
            <CalendarDays size={16} strokeWidth={2} />
            정기모임 상세
          </h1>
          <p className="text-xs text-[#999] mt-0.5">참석자 및 일정 상세</p>
        </div>
      </div>
    </header>
  )
}

export default async function EventDetailPage({ params }: PageProps) {
  const { clubId, eventId } = await params

  /* ── 실제 ── */
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

  const { data: ev } = await supabase
    .from('club_events')
    .select(
      'id, club_id, title, event_date, start_time, end_time, place, fee, max_attend, created_by, created_at'
    )
    .eq('id', eventId)
    .eq('club_id', clubId)
    .maybeSingle()

  if (!ev) notFound()

  const { data: attRows } = await supabase
    .from('club_event_attendances')
    .select(
      'status, member_id, updated_at, member:club_members(id, skill_score, user:users(name))'
    )
    .eq('event_id', eventId)

  type AttRowRaw = {
    status: string
    member_id: string
    updated_at: string
    member: {
      id: string
      skill_score: number
      user: { name: string } | null
    } | null
  }

  const attendees: AttendeeRow[] = ((attRows as AttRowRaw[] | null) ?? []).map((row) => ({
    member_id: row.member_id,
    status: row.status as EventAttendStatus,
    name: row.member?.user?.name ?? '이름없음',
    skill: row.member?.skill_score ?? 0,
    updated_at: row.updated_at,
  }))

  const isManager = ['owner', 'manager'].includes(membership.role)
  const myStatus =
    attendees.find((a) => a.member_id === membership.id)?.status ?? null

  /* 대기 명단 + 이름 — RLS 로 클럽 멤버만 SELECT 가능 */
  const { data: waitlistRaw } = await supabase
    .from('event_waitlist')
    .select(`
      member_id,
      position,
      joined_at,
      member:club_members(user:users(name), skill_score)
    `)
    .eq('event_id', eventId)
    .eq('status', 'waiting')
    .order('position', { ascending: true })

  type WaitlistRaw = {
    member_id: string
    position: number
    joined_at: string
    member: {
      user: { name: string } | null
      skill_score: number | null
    } | null
  }
  const waitlistEntries: WaitlistEntry[] = ((waitlistRaw as WaitlistRaw[] | null) ?? []).map(
    (r) => ({
      member_id: r.member_id,
      name: r.member?.user?.name ?? '이름없음',
      position: r.position,
      joined_at: r.joined_at,
      skill: r.member?.skill_score ?? 0,
    }),
  )

  const waitlistCount = waitlistEntries.length
  const myWaitlistPosition =
    waitlistEntries.find((r) => r.member_id === membership.id)?.position ?? null

  const detail: EventDetail = {
    id: ev.id,
    club_id: ev.club_id,
    title: ev.title,
    event_date: ev.event_date,
    start_time: ev.start_time,
    end_time: ev.end_time,
    place: ev.place,
    fee: ev.fee,
    max_attend: ev.max_attend,
    created_by: ev.created_by,
    created_at: ev.created_at,
  }

  return (
    <div>
      <PageHeader clubId={clubId} />
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <EventDetailClient
          clubId={clubId}
          event={detail}
          attendees={attendees}
          myStatus={myStatus}
          isManager={isManager}
          myMemberId={membership.id}
          waitlistCount={waitlistCount}
          myWaitlistPosition={myWaitlistPosition}
          waitlistEntries={waitlistEntries}
        />
      </main>
    </div>
  )
}
