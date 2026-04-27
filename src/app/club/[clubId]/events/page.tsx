import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership } from '@/lib/club/client'
import { CalendarDays } from 'lucide-react'
import { EventsListClient } from '@/components/club/EventsListClient'
import { BackButton } from '@/components/club/BackButton'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import { buildDemoEventsList } from '@/lib/club/eventsDemo'
import type { Metadata } from 'next'
import type { EventListRow } from '@/app/club/[clubId]/events/actions'
import type { EventAttendStatus } from '@/types/club'

interface PageProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find((c) => c.id === clubId)
  if (demo) {
    return { title: `정기모임 | ${demo.name}`, description: '모임 정기 일정 및 참석' }
  }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return {
    title: club ? `정기모임 | ${club.name}` : '정기모임 | 버디민턴',
    description: '모임 정기 일정 및 참석',
  }
}

function PageHeader({ clubId }: { clubId: string }) {
  return (
    <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
      <div className="max-w-[1088px] mx-auto flex items-center gap-3">
        <BackButton fallback={`/club/${clubId}`} />
        <div>
          <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
            <CalendarDays size={16} strokeWidth={2} />
            정기모임
          </h1>
          <p className="text-xs text-[#999] mt-0.5">다가오는 일정과 참석 현황</p>
        </div>
      </div>
    </header>
  )
}

export default async function EventsListPage({ params }: PageProps) {
  const { clubId } = await params

  /* ── 데모 모임 ── */
  if (clubId.startsWith('demo-')) {
    const { upcoming, past } = buildDemoEventsList(clubId)
    return (
      <div>
        <PageHeader clubId={clubId} />
        <main className="max-w-[1088px] mx-auto px-4 py-5">
          <EventsListClient
            clubId={clubId}
            upcoming={upcoming}
            past={past}
            isManager={false}
            isDemo
          />
        </main>
      </div>
    )
  }

  /* ── 실제 모임 ── */
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/club/home')

  const today = new Date().toISOString().split('T')[0]
  const isManager = ['owner', 'manager'].includes(membership.role)

  const SELECT =
    'id, club_id, title, event_date, start_time, end_time, place, fee, max_attend, created_by, created_at, attendances:club_event_attendances(status, member_id)'

  const [upcomingResult, pastResult] = await Promise.all([
    supabase
      .from('club_events')
      .select(SELECT)
      .eq('club_id', clubId)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(50),
    supabase
      .from('club_events')
      .select(SELECT)
      .eq('club_id', clubId)
      .lt('event_date', today)
      .order('event_date', { ascending: false })
      .limit(30),
  ])

  type EventRowRaw = {
    id: string
    club_id: string
    title: string
    event_date: string
    start_time: string | null
    end_time: string | null
    place: string | null
    fee: string | null
    max_attend: number
    created_by: string | null
    created_at: string
    attendances: { status: string; member_id: string }[] | null
  }

  const reduce = (rows: EventRowRaw[] | null): EventListRow[] =>
    (rows ?? []).map((r) => {
      const goingCount = (r.attendances ?? []).filter((a) => a.status === 'going').length
      const my = (r.attendances ?? []).find((a) => a.member_id === membership.id)
      return {
        id: r.id,
        club_id: r.club_id,
        title: r.title,
        event_date: r.event_date,
        start_time: r.start_time,
        end_time: r.end_time,
        place: r.place,
        fee: r.fee,
        max_attend: r.max_attend,
        created_by: r.created_by,
        created_at: r.created_at,
        going_count: goingCount,
        my_status: (my?.status as EventAttendStatus) ?? null,
      }
    })

  const upcoming = reduce(upcomingResult.data as EventRowRaw[] | null)
  const past = reduce(pastResult.data as EventRowRaw[] | null)

  return (
    <div>
      <PageHeader clubId={clubId} />
      <main className="max-w-[1088px] mx-auto px-4 py-5">
        <EventsListClient
          clubId={clubId}
          upcoming={upcoming}
          past={past}
          isManager={isManager}
        />
      </main>
    </div>
  )
}
