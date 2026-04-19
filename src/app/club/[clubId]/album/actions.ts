'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'

export interface AlbumPhotoRow {
  id: string
  club_id: string
  uploader_member_id: string
  storage_path: string
  caption: string | null
  taken_at: string | null
  created_at: string
  public_url: string
  uploader_name?: string | null
  uploader_member_db_id?: string | null
}

// ── 앨범 사진 목록 ─────────────────────────────────────────
export async function getAlbumPhotosAction(clubId: string): Promise<AlbumPhotoRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('album_photos')
    .select(`
      id, club_id, uploader_member_id, storage_path, caption, taken_at, created_at,
      uploader:uploader_member_id (
        id,
        user:user_id ( name )
      )
    `)
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => {
    const { data: urlData } = supabase.storage
      .from('club-albums')
      .getPublicUrl(row.storage_path)
    return {
      id: row.id,
      club_id: row.club_id,
      uploader_member_id: row.uploader_member_id,
      storage_path: row.storage_path,
      caption: row.caption ?? null,
      taken_at: row.taken_at ?? null,
      created_at: row.created_at,
      public_url: urlData.publicUrl,
      uploader_name: row.uploader?.user?.name ?? null,
      uploader_member_db_id: row.uploader?.id ?? null,
    }
  })
}

// ── 사진 메타데이터 저장 (클라이언트 업로드 후 호출) ────────────
export async function recordAlbumPhotoAction(
  clubId: string,
  storagePath: string,
  caption?: string,
  takenAt?: string,
): Promise<{ success?: true; id?: string; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership) return { error: '모임 멤버만 사진을 업로드할 수 있습니다.' }

  const { data, error } = await supabase
    .from('album_photos')
    .insert({
      club_id: clubId,
      uploader_member_id: membership.id,
      storage_path: storagePath,
      caption: caption?.trim() || null,
      taken_at: takenAt || null,
    })
    .select('id')
    .single()

  if (error) return { error: '사진 등록에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true, id: data.id }
}

// ── 사진 삭제 ───────────────────────────────────────────────
export async function deleteAlbumPhotoAction(
  clubId: string,
  photoId: string,
  storagePath: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id, role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership) return { error: '권한이 없습니다.' }

  const isManager = ['owner', 'manager'].includes(membership.role)

  const { data: photo } = await supabase
    .from('album_photos')
    .select('uploader_member_id')
    .eq('id', photoId)
    .eq('club_id', clubId)
    .single()

  if (!photo) return { error: '사진을 찾을 수 없습니다.' }
  if (photo.uploader_member_id !== membership.id && !isManager) {
    return { error: '본인이 업로드한 사진만 삭제할 수 있습니다.' }
  }

  // Storage에서 삭제
  await supabase.storage.from('club-albums').remove([storagePath])

  // DB에서 삭제
  const { error } = await supabase
    .from('album_photos')
    .delete()
    .eq('id', photoId)
    .eq('club_id', clubId)

  if (error) return { error: '사진 삭제에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}
