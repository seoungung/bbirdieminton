import { redirect } from 'next/navigation'
import { Gamepad2 } from 'lucide-react'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { DEMO_CLUBS } from '@/lib/club/demoData'
import { GameboardListClient, type SessionItem } from '@/components/club/gameboard/list/GameboardListClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find(c => c.id === clubId)
  if (demo) return { title: `게임보드 | ${demo.name}`, description: '게임보드 목록' }
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  return { title: club ? `게임보드 | ${club.name}` : '게임보드 | 버디민턴', description: '게임보드 목록' }
}

export default async function GameboardListPage({ params }: PageProps) {
  const { clubId } = await params

  // ── 데모 모드 ──────────────────────────────────────────────
  if (clubId.startsWith('demo-')) {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const demoGrouped = {
      in_progress: [
        {
          id: 'demo-session-1',
          session_date: today,
          status: 'in_progress' as const,
          court_count: 3,
          notes: null,
          created_at: new Date().toISOString(),
          event_id: null,
          event: { id: 'demo-event-1', title: '[데모] 저녁 게임', event_date: today, place: null },
          attendance_count: 12,
        },
      ],
      closed: [
        {
          id: 'demo-session-2',
          session_date: yesterday,
          status: 'closed' as const,
          court_count: 3,
          notes: null,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          event_id: null,
          event: { id: 'demo-event-2', title: '[데모] 저녁 게임', event_date: yesterday, place: null },
          attendance_count: 14,
        },
      ],
    }

    const demoClub = DEMO_CLUBS.find(c => c.id === clubId)
    const clubName = demoClub?.name ?? '체험 모임'

    return <GameboardListPageShell clubId={clubId} clubName={clubName} grouped={demoGrouped} />
  }

  // ── 실서비스 ───────────────────────────────────────────────
  const supabase = await createClient()
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase, user)
  if (!clubUserId) redirect('/login')

  // 클럽 이름 가져오기
  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single()

  if (!club) redirect('/clubs')

  // 세션 목록 조회 (최신 100개)
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id, session_date, status, court_count, notes, created_at, event_id,
      event:club_events(id, title, event_date, place)
    `)
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(100)

  const rawSessions = sessions ?? []

  // 출석 수 집계 (attendances + session_guests 합산)
  const sessionIds = rawSessions.map(s => s.id)
  const [attendanceResult, guestCountResult] = await (sessionIds.length > 0
    ? Promise.all([
        supabase.from('attendances').select('session_id').in('session_id', sessionIds),
        supabase.from('session_guests').select('session_id').in('session_id', sessionIds),
      ])
    : Promise.all([
        Promise.resolve({ data: [] as { session_id: string }[] }),
        Promise.resolve({ data: [] as { session_id: string }[] }),
      ]))

  // JS에서 session_id별 카운트 (회원 + 게스트)
  const countMap: Record<string, number> = {}
  for (const row of (attendanceResult.data ?? [])) {
    countMap[row.session_id] = (countMap[row.session_id] ?? 0) + 1
  }
  for (const row of (guestCountResult.data ?? [])) {
    countMap[row.session_id] = (countMap[row.session_id] ?? 0) + 1
  }

  const enriched: SessionItem[] = rawSessions.map(s => {
    // Supabase returns event as array from joins — normalise to single or null
    const eventRaw = s.event
    const event = Array.isArray(eventRaw)
      ? (eventRaw[0] ?? null)
      : (eventRaw ?? null)

    return {
      id: s.id,
      session_date: s.session_date,
      status: s.status as SessionItem['status'],
      court_count: s.court_count,
      notes: s.notes ?? null,
      created_at: s.created_at,
      event_id: s.event_id ?? null,
      event: event
        ? { id: event.id, title: event.title, event_date: event.event_date, place: event.place ?? null }
        : null,
      attendance_count: countMap[s.id] ?? 0,
    }
  })

  // 'open' 세션은 A안에서 노출하지 않음 (DB에 잔존할 수 있으나 목록에서 숨김)
  const grouped = {
    in_progress: enriched.filter(s => s.status === 'in_progress'),
    closed: enriched.filter(s => s.status === 'closed').slice(0, 20),
  }

  return <GameboardListPageShell clubId={clubId} clubName={club.name} grouped={grouped} />
}

/* ── 공통 렌더 ── */
function GameboardListPageShell({
  clubId,
  grouped,
}: {
  clubId: string
  /** @deprecated 헤더 표준화 후 사용 안 함 — 호출부 호환을 위해 옵셔널로 유지 */
  clubName?: string
  grouped: {
    in_progress: SessionItem[]
    closed: SessionItem[]
  }
}) {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 헤더 — 정기모임 패턴 통일 (semantic <header>, h1+subtitle) */}
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1280px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <Gamepad2 size={16} strokeWidth={2} />
              게임보드
            </h1>
            <p className="text-xs text-[#999] mt-0.5">오늘의 경기 진행 및 결과 입력</p>
          </div>
        </div>
      </header>

      {/* 목록 영역 */}
      <GameboardListClient clubId={clubId} grouped={grouped} />
    </div>
  )
}
