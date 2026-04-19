'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'

export async function createClubEventAction(
  clubId: string,
  memberId: string,          // club_members.id (created_by)
  data: {
    title: string
    event_date: string       // YYYY-MM-DD
    start_time: string       // HH:MM
    end_time?: string
    place: string
    fee?: string
    max_attend: number
  }
) {
  // 데모 모임: DB 쓰기 없이 성공 반환
  if (clubId.startsWith('demo-')) return { success: true }

  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: membership } = await supabase
    .from('club_members').select('role').eq('club_id', clubId).eq('user_id', clubUserId).single()
  if (!membership || !['owner', 'manager'].includes(membership.role))
    return { error: '운영진만 일정을 만들 수 있습니다.' }

  if (!data.title.trim()) return { error: '제목을 입력해주세요.' }
  if (!data.event_date) return { error: '날짜를 입력해주세요.' }
  if (!data.place.trim()) return { error: '장소를 입력해주세요.' }

  const { error } = await supabase.from('club_events').insert({
    club_id: clubId,
    title: data.title.trim(),
    event_date: data.event_date,
    start_time: data.start_time,
    end_time: data.end_time || null,
    place: data.place.trim(),
    fee: data.fee?.trim() || null,
    max_attend: data.max_attend,
    created_by: memberId,
  })

  if (error) return { error: '일정 생성에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}

// ── 참석 토글 ───────────────────────────────────────
export async function toggleEventAttendanceAction(
  eventId: string,
  memberId: string,  // club_members.id
  clubId: string,
  status: 'going' | 'not_going'
) {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  // 본인 멤버십 확인
  const { data: membership } = await supabase
    .from('club_members').select('id').eq('club_id', clubId).eq('user_id', clubUserId).single()
  if (!membership) return { error: '모임 멤버가 아닙니다.' }

  const { error } = await supabase
    .from('club_event_attendances')
    .upsert(
      { event_id: eventId, member_id: memberId, status },
      { onConflict: 'event_id,member_id' }
    )

  if (error) return { error: '참석 처리에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}
