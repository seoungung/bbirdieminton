'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'

export type NoticeType = 'announcement' | 'event' | 'general'

export interface NoticeRow {
  id: string
  club_id: string
  author_member_id: string | null
  title: string
  body: string
  type: NoticeType
  is_pinned: boolean
  created_at: string
  updated_at: string
  author_name?: string | null
}

// ── 목록 조회 ─────────────────────────────────────────────
export async function getNoticesAction(clubId: string): Promise<NoticeRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notices')
    .select(`
      id, club_id, author_member_id, title, body,
      type, is_pinned, created_at, updated_at,
      author:author_member_id (
        user:user_id ( name )
      )
    `)
    .eq('club_id', clubId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    club_id: row.club_id,
    author_member_id: row.author_member_id,
    title: row.title,
    body: row.body,
    type: row.type as NoticeType,
    is_pinned: row.is_pinned,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_name: row.author?.user?.name ?? null,
  }))
}

// ── 공지 작성 ─────────────────────────────────────────────
export async function createNoticeAction(
  clubId: string,
  authorMemberId: string,
  data: {
    title: string
    body: string
    type: NoticeType
    is_pinned: boolean
  }
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진만 공지를 작성할 수 있습니다.' }
  }

  if (!data.title.trim()) return { error: '제목을 입력해주세요.' }
  if (!data.body.trim()) return { error: '내용을 입력해주세요.' }

  const { error } = await supabase.from('notices').insert({
    club_id: clubId,
    author_member_id: authorMemberId,
    title: data.title.trim(),
    body: data.body.trim(),
    type: data.type,
    is_pinned: data.is_pinned,
  })

  if (error) return { error: '공지 등록에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}

// ── 공지 수정 ─────────────────────────────────────────────
export async function updateNoticeAction(
  clubId: string,
  noticeId: string,
  data: {
    title: string
    body: string
    type: NoticeType
    is_pinned: boolean
  }
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진만 공지를 수정할 수 있습니다.' }
  }

  if (!data.title.trim()) return { error: '제목을 입력해주세요.' }
  if (!data.body.trim()) return { error: '내용을 입력해주세요.' }

  const { error } = await supabase
    .from('notices')
    .update({
      title: data.title.trim(),
      body: data.body.trim(),
      type: data.type,
      is_pinned: data.is_pinned,
    })
    .eq('id', noticeId)
    .eq('club_id', clubId)

  if (error) return { error: '공지 수정에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}

// ── 공지 삭제 ─────────────────────────────────────────────
export async function deleteNoticeAction(
  clubId: string,
  noticeId: string
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '권한이 없습니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진만 공지를 삭제할 수 있습니다.' }
  }

  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', noticeId)
    .eq('club_id', clubId)

  if (error) return { error: '공지 삭제에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}

// ── 읽지 않은 알림 수 조회 ────────────────────────────────
export async function getUnreadCountAction(clubId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .is('read_at', null)

  if (error) return 0
  return count ?? 0
}

// ── 알림 읽음 처리 ────────────────────────────────────────
export async function markNotificationsReadAction(clubId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('club_id', clubId)
    .is('read_at', null)
}
