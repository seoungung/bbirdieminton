'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/supabase/server'
import { clubCreateSchema, type ClubCreateInput } from '@/lib/club/schema'
import { CUSTOM_URL_REGEX } from '@/lib/club/constants'

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

/**
 * 클럽 생성 (PRD §3.2)
 *  - 인증 사용자만 호출 가능
 *  - custom_url_id 중복 검사
 *  - clubs INSERT + club_members(owner) INSERT
 *  - plan_type 은 항상 'free' (PRD §5.1: 누적 멤버 최대 50명)
 *  - 태그 저장은 Step 7+ (별도 테이블) — 현재는 description tail 등에 저장하지 않고 보류
 */
export async function createClubAction(
  input: ClubCreateInput
): Promise<ActionResult<{ clubId: string; customUrlId: string }>> {
  // 1. 인증
  const user = await getAuthUser()
  if (!user) return { ok: false, error: '로그인이 필요합니다' }

  // 2. 입력 검증
  const parsed = clubCreateSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first?.message ?? '입력값을 확인해 주세요' }
  }
  const v = parsed.data

  const admin = createAdminClient()

  // 3. custom_url_id 중복 검사
  {
    const { data: existing, error: lookupErr } = await admin
      .from('clubs')
      .select('id')
      .eq('custom_url_id', v.customUrlId)
      .maybeSingle()
    if (lookupErr) {
      return { ok: false, error: `URL ID 검사 실패: ${lookupErr.message}` }
    }
    if (existing) {
      return { ok: false, error: '이미 사용 중인 URL ID 입니다' }
    }
  }

  // 4. clubs INSERT
  //    프리셋 컬러는 `preset:{key}` 텍스트로 cover_image_url / logo_image_url 에 저장.
  //    Stage E (Storage 연결) 에서 실제 업로드 URL 로 대체.
  const coverImageUrl = `preset:${v.coverPreset}`
  const logoImageUrl = `preset:${v.logoPreset}`
  const region = v.regionDetail && v.regionDetail.length > 0
    ? `${v.region} ${v.regionDetail}`
    : v.region

  const { data: club, error: insertErr } = await admin
    .from('clubs')
    .insert({
      custom_url_id: v.customUrlId,
      name: v.name,
      description: v.description && v.description.length > 0 ? v.description : null,
      cover_image_url: coverImageUrl,
      logo_image_url: logoImageUrl,
      region,
      gym: v.gym && v.gym.length > 0 ? v.gym : null,
      admin_id: user.id,
      plan_type: 'free',
    })
    .select('id, custom_url_id')
    .single()

  if (insertErr || !club) {
    return {
      ok: false,
      error: `클럽 생성 실패: ${insertErr?.message ?? 'unknown'}`,
    }
  }

  // 5. owner 멤버십 자동 등록
  const { error: memberErr } = await admin.from('club_members').insert({
    club_id: club.id,
    user_id: user.id,
    role: 'owner',
  })
  if (memberErr) {
    // 롤백: clubs 행 삭제 (멤버 없는 고아 클럽 방지)
    await admin.from('clubs').delete().eq('id', club.id)
    return {
      ok: false,
      error: `운영자 멤버십 등록 실패: ${memberErr.message}`,
    }
  }

  // 6. 태그 — Step 7+ club_tags 테이블 또는 clubs 컬럼 추가 후 처리. 현재는 무시.
  void v.tags

  return {
    ok: true,
    data: { clubId: club.id, customUrlId: club.custom_url_id },
  }
}

/**
 * custom_url_id 사용 가능 여부 검사 (실시간 체크용).
 * 호출 빈도가 높을 수 있어 가볍게 구현.
 */
export async function checkCustomUrlAvailable(
  urlId: string
): Promise<{ available: boolean; reason?: string }> {
  const trimmed = urlId.trim().toLowerCase()
  if (!CUSTOM_URL_REGEX.test(trimmed)) {
    return { available: false, reason: '형식 불일치' }
  }
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('clubs')
    .select('id')
    .eq('custom_url_id', trimmed)
    .maybeSingle()
  if (error) return { available: false, reason: error.message }
  return { available: !data }
}
