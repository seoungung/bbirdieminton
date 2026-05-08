'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'
import { todayKST } from '@/lib/date'
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
 * - 정원/과거이벤트/멤버십/직렬화는 set_rsvp RPC 가 모두 처리.
 * - clubId 인자는 revalidatePath 용으로만 유지.
 */
export async function setRsvpAction(
  clubId: string,
  eventId: string,
  status: EventAttendStatus
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('set_rsvp', {
    p_event_id: eventId,
    p_status: status,
  })
  if (error) return { error: 'RSVP 처리 중 오류가 발생했어요.' }
  const result = data as { ok?: boolean; error?: string } | null
  if (result?.error) return { error: result.error }

  /* going → not_going 전환 시: trigger 가 첫 대기자를 자동 승격시킬 수 있음.
   * 최근 5초 내 promoted 된 row 를 찾아 본인에게 push 알림 발송.
   * (push 실패는 RSVP 응답 자체에 영향 X) */
  if (status === 'not_going') {
    void notifyRecentlyPromoted(clubId, eventId).catch((e) => {
      console.warn('[waitlist] push notify error', e)
    })
  }

  revalidatePath(`/club/${clubId}/events`)
  revalidatePath(`/club/${clubId}/events/${eventId}`)
  revalidatePath(`/club/${clubId}`)
  return { success: true }
}

/* ── 대기 자동 승격자에게 push 알림 ── */
async function notifyRecentlyPromoted(
  clubId: string,
  eventId: string,
): Promise<void> {
  const { sendPushToUsers } = await import('@/lib/notifications/push')
  const { sendKakaoNoti } = await import('@/lib/notifications/kakao')

  const supabase = await createClient()

  /* 최근 5초 내 승격된 대기자 + user_id + 이벤트 컨텍스트 */
  const fiveSecondsAgo = new Date(Date.now() - 5_000).toISOString()
  const { data: promoted } = await supabase
    .from('event_waitlist')
    .select(`
      member_id,
      promoted_at,
      member:club_members(user_id)
    `)
    .eq('event_id', eventId)
    .eq('status', 'promoted')
    .gte('promoted_at', fiveSecondsAgo)

  if (!promoted || promoted.length === 0) return

  /* 이벤트 + 클럽 정보 한 번 가져옴 (알림 본문 구성용) */
  const { data: ev } = await supabase
    .from('club_events')
    .select('title, event_date, club:clubs(name)')
    .eq('id', eventId)
    .maybeSingle()

  type PromotedRow = {
    member_id: string
    member: { user_id: string }[] | { user_id: string } | null
  }
  const rows = (promoted as unknown as PromotedRow[]) ?? []

  const userIds = rows
    .map((r) => {
      const m = Array.isArray(r.member) ? r.member[0] : r.member
      return m?.user_id
    })
    .filter((id): id is string => !!id)

  type EvRow = {
    title: string
    event_date: string
    club: { name: string | null }[] | { name: string | null } | null
  }
  const evRow = (ev as unknown as EvRow | null) ?? null
  const evClub = evRow ? (Array.isArray(evRow.club) ? evRow.club[0] : evRow.club) : null
  const clubName = evClub?.name ?? '모임'
  const eventTitle = evRow?.title ?? '정기모임'

  /* 1) Web Push 알림 — 즉시 발송 (브라우저 SW 가 처리) */
  if (userIds.length > 0) {
    await sendPushToUsers(userIds, {
      title: `🎉 ${eventTitle} 참석 확정`,
      body: `대기 중이던 ${clubName} 정모에 자리가 났어요. 참석으로 자동 승격됐어요.`,
      url: `/club/${clubId}/events/${eventId}`,
      tag: `event-${eventId}-promoted`,
    })
  }

  /* 2) 카카오 알림톡 — 현재 STUB.
   *    실 발송하려면: users 테이블에 phone 컬럼 추가 + Kakao 비즈 연동.
   *    placeholder 호출은 콘솔 로그만 남김. */
  for (const _r of rows) {
    await sendKakaoNoti({
      to: '',  // TODO: users.phone 컬럼 추가 시 채움
      templateCode: 'WAITLIST_PROMOTED',
      variables: {
        clubName,
        eventTitle,
        eventDate: evRow?.event_date ?? '',
      },
    })
  }
}

// ── 대기 신청 (만석 시) ──────────────────────────────────
/**
 * 만석 정모에 대기 등록.
 * RPC join_event_waitlist 가 정원/멤버십/race 검증 모두 처리.
 * 정원 여유 있으면 바로 참석하라고 안내 메시지 반환.
 */
export async function joinWaitlistAction(
  clubId: string,
  eventId: string
): Promise<{ success?: true; position?: number; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('join_event_waitlist', {
    p_event_id: eventId,
  })
  if (error) return { error: '대기 신청 중 오류가 발생했어요.' }
  const result = data as { ok?: boolean; position?: number; error?: string } | null
  if (result?.error) return { error: result.error }

  revalidatePath(`/club/${clubId}/events`)
  revalidatePath(`/club/${clubId}/events/${eventId}`)
  return {
    success: true,
    position: typeof result?.position === 'number' ? result.position : undefined,
  }
}

// ── 대기 취소 ──────────────────────────────────────────────
export async function cancelWaitlistAction(
  clubId: string,
  eventId: string
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('cancel_waitlist_entry', {
    p_event_id: eventId,
  })
  if (error) return { error: '대기 취소 중 오류가 발생했어요.' }
  const result = data as { ok?: boolean; error?: string } | null
  if (result?.error) return { error: result.error }

  revalidatePath(`/club/${clubId}/events`)
  revalidatePath(`/club/${clubId}/events/${eventId}`)
  return { success: true }
}

// ── 다가오는 이벤트 갯수 (대시보드 위젯) ───────────────────
export async function getUpcomingEventsCountAction(
  clubId: string
): Promise<number> {
  const supabase = await createClient()
  const today = todayKST()

  const { count, error } = await supabase
    .from('club_events')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .gte('event_date', today)

  if (error) return 0
  return count ?? 0
}
