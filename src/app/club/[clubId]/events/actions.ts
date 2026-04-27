'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'
import type { EventAttendStatus } from '@/types/club'

// ── 타입 ───────────────────────────────────────────────────
export interface EventInput {
  title: string
  event_date: string         // YYYY-MM-DD
  start_time: string | null  // HH:MM (or null)
  end_time: string | null    // HH:MM (or null)
  place: string | null
  fee: string | null
  max_attend: number         // 0 = 무제한
}

export interface EventListRow {
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
  going_count: number
  my_status: EventAttendStatus | null
}

// ── 권한 가드 ──────────────────────────────────────────────
type ManagerGuardOk = { ok: true; clubUserId: string; memberId: string }
type ManagerGuardErr = { ok: false; error: string }

async function assertManager(
  clubId: string
): Promise<ManagerGuardOk | ManagerGuardErr> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { ok: false, error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id, role, removed_at')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  if (!membership || membership.removed_at) {
    return { ok: false, error: '모임 멤버가 아닙니다.' }
  }
  if (!['owner', 'manager'].includes(membership.role)) {
    return { ok: false, error: '운영진만 정기모임을 관리할 수 있습니다.' }
  }
  return { ok: true, clubUserId, memberId: membership.id }
}

async function assertMember(
  clubId: string
): Promise<{ ok: true; memberId: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { ok: false, error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id, removed_at')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()

  if (!membership || membership.removed_at) {
    return { ok: false, error: '모임 멤버가 아닙니다.' }
  }
  return { ok: true, memberId: membership.id }
}

// ── 입력 검증 ─────────────────────────────────────────────
function validateInput(data: EventInput): string | null {
  if (!data.title.trim()) return '제목을 입력해주세요.'
  if (!data.event_date) return '날짜를 선택해주세요.'
  // event_date YYYY-MM-DD 포맷 체크
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.event_date)) return '날짜 형식이 올바르지 않습니다.'
  if (data.start_time && !/^\d{2}:\d{2}(:\d{2})?$/.test(data.start_time))
    return '시작 시간 형식이 올바르지 않습니다.'
  if (data.end_time && !/^\d{2}:\d{2}(:\d{2})?$/.test(data.end_time))
    return '종료 시간 형식이 올바르지 않습니다.'
  if (data.max_attend < 0) return '최대 인원은 0 이상이어야 합니다.'
  if (data.max_attend > 1000) return '최대 인원은 1000명 이하로 설정해주세요.'
  return null
}

// ── 이벤트 생성 ───────────────────────────────────────────
export async function createEventAction(
  clubId: string,
  data: EventInput
): Promise<{ success?: true; error?: string; eventId?: string }> {
  const guard = await assertManager(clubId)
  if (!guard.ok) return { error: guard.error }
  const err = validateInput(data)
  if (err) return { error: err }

  const supabase = await createClient()
  const { data: inserted, error } = await supabase
    .from('club_events')
    .insert({
      club_id: clubId,
      title: data.title.trim(),
      event_date: data.event_date,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      place: data.place?.trim() || null,
      fee: data.fee?.trim() || null,
      max_attend: data.max_attend,
      created_by: guard.memberId,
    })
    .select('id')
    .single()

  if (error || !inserted) return { error: '정기모임 생성에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/events`)
  revalidatePath(`/club/${clubId}`)
  return { success: true, eventId: inserted.id }
}

// ── 이벤트 수정 ───────────────────────────────────────────
export async function updateEventAction(
  clubId: string,
  eventId: string,
  data: EventInput
): Promise<{ success?: true; error?: string }> {
  const guard = await assertManager(clubId)
  if (!guard.ok) return { error: guard.error }
  const err = validateInput(data)
  if (err) return { error: err }

  const supabase = await createClient()
  const { error } = await supabase
    .from('club_events')
    .update({
      title: data.title.trim(),
      event_date: data.event_date,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      place: data.place?.trim() || null,
      fee: data.fee?.trim() || null,
      max_attend: data.max_attend,
    })
    .eq('id', eventId)
    .eq('club_id', clubId)

  if (error) return { error: '정기모임 수정에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/events`)
  revalidatePath(`/club/${clubId}/events/${eventId}`)
  revalidatePath(`/club/${clubId}`)
  return { success: true }
}

// ── 이벤트 삭제 ───────────────────────────────────────────
export async function deleteEventAction(
  clubId: string,
  eventId: string
): Promise<{ success?: true; error?: string }> {
  const guard = await assertManager(clubId)
  if (!guard.ok) return { error: guard.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('club_events')
    .delete()
    .eq('id', eventId)
    .eq('club_id', clubId)

  if (error) return { error: '정기모임 삭제에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/events`)
  revalidatePath(`/club/${clubId}`)
  return { success: true }
}

// ── RSVP 설정 ──────────────────────────────────────────────
/**
 * 본인 RSVP 등록/변경.
 * - status='going' 이고 max_attend > 0 이면 정원 초과 시 거절.
 * - UNIQUE(event_id, member_id) 에 따라 upsert.
 */
export async function setRsvpAction(
  clubId: string,
  eventId: string,
  status: EventAttendStatus
): Promise<{ success?: true; error?: string }> {
  const guard = await assertMember(clubId)
  if (!guard.ok) return { error: guard.error }

  const supabase = await createClient()

  // 이벤트 존재 + 같은 클럽 검증 + max_attend 조회
  const { data: event } = await supabase
    .from('club_events')
    .select('id, club_id, max_attend, event_date')
    .eq('id', eventId)
    .eq('club_id', clubId)
    .maybeSingle()

  if (!event) return { error: '존재하지 않는 정기모임입니다.' }

  // 과거 이벤트 차단 (KST 기준)
  const todayKST = new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
  if (event.event_date < todayKST) {
    return { error: '지난 정기모임은 응답을 변경할 수 없어요.' }
  }

  // 정원 체크: going 으로 바꾸려는 경우만
  if (status === 'going' && event.max_attend > 0) {
    // 본인이 이미 going 인지 확인 (upsert 라 본인 카운트 중복 방지)
    const { data: existing } = await supabase
      .from('club_event_attendances')
      .select('status')
      .eq('event_id', eventId)
      .eq('member_id', guard.memberId)
      .maybeSingle()

    const alreadyGoing = existing?.status === 'going'

    if (!alreadyGoing) {
      const { count } = await supabase
        .from('club_event_attendances')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'going')

      if ((count ?? 0) >= event.max_attend) {
        return { error: '정원이 가득 찼습니다.' }
      }
    }
  }

  const { error } = await supabase
    .from('club_event_attendances')
    .upsert(
      {
        event_id: eventId,
        member_id: guard.memberId,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'event_id,member_id' }
    )

  if (error) return { error: 'RSVP 변경에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/events`)
  revalidatePath(`/club/${clubId}/events/${eventId}`)
  revalidatePath(`/club/${clubId}`)
  return { success: true }
}

// ── 다가오는 이벤트 갯수 (대시보드 위젯) ───────────────────
export async function getUpcomingEventsCountAction(
  clubId: string
): Promise<number> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { count, error } = await supabase
    .from('club_events')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .gte('event_date', today)

  if (error) return 0
  return count ?? 0
}
