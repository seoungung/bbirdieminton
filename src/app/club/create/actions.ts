'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { sanitizeClubTags } from '@/lib/club/tags'
import type { ClubFAQ } from '@/types/club'

/** 회비 input 정수 파싱: 빈 값/0 이하 → null */
function parseFeeInt(raw: string | null): number | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.floor(n)
}

/** Phase A 신규 컬럼 일괄 update — clubs 행에 적용 (best-effort).
 *  새 컬럼이 마이그레이션 미적용 환경이면 update 가 실패해도 무시.
 */
async function tryApplyPhaseAColumns(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clubId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const cleaned: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue
    cleaned[k] = v
  }
  if (Object.keys(cleaned).length === 0) return

  const { error } = await supabase.from('clubs').update(cleaned).eq('id', clubId)
  if (error) {
    // 마이그레이션 미적용 → 컬럼 없음. 조용히 무시.
    console.warn('[createClubAction] Phase A 컬럼 update 실패 (무시):', error.message)
  }
}

export async function createClubAction(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const location = (formData.get('location') as string | null)?.trim() || null
  const activityPlace = (formData.get('activity_place') as string | null)?.trim() || null
  const category = (formData.get('category') as string | null) || '동호회'
  const thumbnailColor = (formData.get('thumbnail_color') as string | null) || '#DBE64C'
  const thumbnailUrl = (formData.get('thumbnail_url') as string | null) || null
  const courtCount = Math.min(20, Math.max(1, parseInt((formData.get('court_count') as string | null) ?? '2', 10) || 2))

  // ── Phase A 신규 입력 ────────────────────────────────────
  const tagsRaw = formData.get('tags') as string | null
  let tags: string[] = []
  if (tagsRaw) {
    try {
      const parsed = JSON.parse(tagsRaw)
      tags = sanitizeClubTags(parsed)
    } catch {
      tags = []
    }
  }

  const faqsRaw = formData.get('faqs') as string | null
  let faqs: ClubFAQ[] = []
  if (faqsRaw) {
    try {
      const parsed = JSON.parse(faqsRaw)
      if (Array.isArray(parsed)) {
        faqs = parsed
          .filter(
            (f): f is ClubFAQ =>
              !!f &&
              typeof (f as ClubFAQ).question === 'string' &&
              typeof (f as ClubFAQ).answer === 'string' &&
              (f as ClubFAQ).question.trim().length > 0 &&
              (f as ClubFAQ).answer.trim().length > 0,
          )
          .slice(0, 6)
          .map((f) => ({
            question: f.question.trim().slice(0, 120),
            answer: f.answer.trim().slice(0, 500),
          }))
      }
    } catch {
      faqs = []
    }
  }

  const photoUrlsRaw = formData.get('photo_urls') as string | null
  let photoUrls: string[] = []
  if (photoUrlsRaw) {
    try {
      const parsed = JSON.parse(photoUrlsRaw)
      if (Array.isArray(parsed)) {
        photoUrls = parsed
          .filter((u): u is string => typeof u === 'string' && u.length > 0)
          .slice(0, 6)
      }
    } catch {
      photoUrls = []
    }
  }

  const feeMonthly = parseFeeInt(formData.get('fee_monthly') as string | null)
  const feePerSession = parseFeeInt(formData.get('fee_per_session') as string | null)
  const feeNote = (formData.get('fee_note') as string | null)?.trim() || null
  const ownerBio = (formData.get('owner_bio') as string | null)?.trim() || null
  const scheduleSummary =
    (formData.get('schedule_summary') as string | null)?.trim() || null

  if (!name) return { error: '모임 이름을 입력해주세요.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data, error } = await supabase
    .rpc('create_club', {
      p_name:            name,
      p_description:     description,
      p_location:        location,
      p_activity_place:  activityPlace,
      p_category:        category,
      p_thumbnail_color: thumbnailColor,
      p_thumbnail_url:   thumbnailUrl,
      p_court_count:     courtCount,
    })

  if (error) {
    console.error('create_club RPC error:', error)
    return { error: '모임 생성에 실패했습니다. 다시 시도해주세요.' }
  }

  const result = data as { club_id?: string; error?: string }
  if (result?.error) return { error: result.error }
  if (!result?.club_id) return { error: '모임 생성에 실패했습니다.' }

  /* Phase A 신규 컬럼은 별도 update 로 적용 (best-effort).
     RPC 시그니처를 변경하지 않고 점진적 도입. */
  await tryApplyPhaseAColumns(supabase, result.club_id, {
    tags,
    fee_monthly: feeMonthly,
    fee_per_session: feePerSession,
    fee_note: feeNote,
    owner_bio: ownerBio,
    schedule_summary: scheduleSummary,
    photo_urls: photoUrls,
    faqs: faqs,
  })

  redirect(`/club/${result.club_id}`)
}
