'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'
import type { Grade } from '@/lib/club/grade'

interface GuestInput {
  name: string
  gender: 'M' | 'F' | null
  grade: Grade | null
}

interface AddedGuest {
  id: string
  name: string
  gender: 'M' | 'F' | null
  grade: string | null
}

interface AddPlayersResult {
  addedMemberIds?: string[]
  addedGuests?: AddedGuest[]
  error?: string
}

/**
 * 진행 중(in_progress) 세션에 회원·게스트를 추가.
 *
 * 가입 후 결석으로 빠졌거나, 늦게 도착한 멤버를 매니저+가 출석 처리할 수 있게.
 * 게스트도 즉석에서 추가 가능.
 *
 * 권한: 클럽 소속 owner 또는 manager.
 * 회원 중복 추가는 ON CONFLICT DO NOTHING 으로 무해.
 */
export async function addPlayersToActiveSessionAction(
  clubId: string,
  sessionId: string,
  data: {
    memberIds?: string[]
    guests?: GuestInput[]
  },
): Promise<AddPlayersResult> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  // 권한 — 매니저 이상
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .maybeSingle()
  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진(클럽장·매니저)만 추가할 수 있어요.' }
  }

  // 세션 존재·소속·진행중 검증
  const { data: session, error: sErr } = await supabase
    .from('sessions')
    .select('id, club_id, status')
    .eq('id', sessionId)
    .maybeSingle()
  if (sErr) return { error: '세션 조회 실패: ' + sErr.message }
  if (!session) return { error: '세션을 찾을 수 없어요.' }
  if (session.club_id !== clubId) return { error: '세션이 이 모임 소속이 아닙니다.' }
  if (session.status !== 'in_progress' && session.status !== 'open') {
    return { error: '진행 중인 세션에만 추가할 수 있어요.' }
  }

  const memberIds = (data.memberIds ?? []).filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  )
  const guests = (data.guests ?? []).filter(
    (g) => g && typeof g.name === 'string' && g.name.trim().length > 0,
  )

  if (memberIds.length === 0 && guests.length === 0) {
    return { error: '추가할 회원 또는 게스트를 선택하세요.' }
  }

  // 회원 클럽 소속 검증 — 다른 클럽의 member_id 가 섞이지 않도록
  if (memberIds.length > 0) {
    const { data: validMembers, error: vmErr } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .in('id', memberIds)
    if (vmErr) return { error: '멤버 검증 실패: ' + vmErr.message }
    const validIds = new Set((validMembers ?? []).map((m) => m.id))
    const invalid = memberIds.filter((id) => !validIds.has(id))
    if (invalid.length > 0) {
      return { error: '이 모임에 속하지 않은 회원이 포함되어 있어요.' }
    }
  }

  // 1) 출석 insert
  const addedMemberIds: string[] = []
  if (memberIds.length > 0) {
    const rows = memberIds.map((member_id) => ({
      session_id: sessionId,
      member_id,
      status: 'present' as const,
    }))
    const { error: aErr } = await supabase
      .from('attendances')
      .upsert(rows, { onConflict: 'session_id,member_id', ignoreDuplicates: true })
    if (aErr) return { error: '출석 추가 실패: ' + aErr.message }
    addedMemberIds.push(...memberIds)
  }

  // 2) 게스트 insert
  const addedGuests: AddedGuest[] = []
  if (guests.length > 0) {
    const rows = guests.map((g) => ({
      session_id: sessionId,
      name: g.name.trim().slice(0, 40),
      gender: g.gender,
      grade: g.grade,
    }))
    const { data: inserted, error: gErr } = await supabase
      .from('session_guests')
      .insert(rows)
      .select('id, name, gender, grade')
    if (gErr) return { error: '게스트 추가 실패: ' + gErr.message }
    if (inserted) {
      for (const r of inserted) {
        addedGuests.push({
          id: r.id as string,
          name: r.name as string,
          gender: (r.gender as 'M' | 'F' | null) ?? null,
          grade: (r.grade as string | null) ?? null,
        })
      }
    }
  }

  // 캐시 무효화 — 세션 상세·관리자 페이지
  revalidatePath(`/club/${clubId}/gameboard/${sessionId}`)
  revalidatePath(`/club/${clubId}/gameboard`)

  return { addedMemberIds, addedGuests }
}
