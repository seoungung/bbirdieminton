'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FormSection } from '@/components/club/createClub/FormSection'
import { CategoryChips, type Category } from '@/components/club/createClub/CategoryChips'
import { ThumbnailUpload } from '@/components/club/createClub/ThumbnailUpload'
import { TagPicker } from '@/components/club/createClub/TagPicker'
import { FeeInputs } from '@/components/club/createClub/FeeInputs'
import { FaqEditor } from '@/components/club/createClub/FaqEditor'
import { updateClubProfileExtrasAction } from '@/app/club/[clubId]/settings/actions'
import type { ClubTag } from '@/lib/club/tags'
import type { Club, ClubFAQ } from '@/types/club'

interface Props {
  club: Club
  isManager: boolean
}

const inputCls =
  'w-full border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#111] ' +
  'placeholder:text-[#bbb] bg-[#fafafa] focus:outline-none focus:border-[#0a0a0a] ' +
  'focus:bg-white transition-colors'

const PRIMARY_BUCKET = 'clubs'
const FALLBACK_BUCKET = 'club-thumbnails'

const CATEGORIES: Category[] = ['동호회', '클럽']

async function uploadWithFallback(
  supabase: ReturnType<typeof createClient>,
  file: File,
  path: string,
): Promise<string | null> {
  const primary = await supabase.storage
    .from(PRIMARY_BUCKET)
    .upload(path, file, { upsert: true })
  if (!primary.error) {
    const { data } = supabase.storage.from(PRIMARY_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }
  const fallback = await supabase.storage
    .from(FALLBACK_BUCKET)
    .upload(path, file, { upsert: true })
  if (fallback.error) return null
  const { data } = supabase.storage.from(FALLBACK_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * 운영자(매니저+) 가 모임 프로필 전체를 편집하는 카드.
 * - 기본 정보(이름·카테고리·지역·장소·소개) + 태그 + 활동 정보(일정·회비) + 운영자 정보 + FAQ
 * - ClubCreateForm 의 섹션 구조와 통일.
 * - SettingsClient 안에서 isManager 일 때만 렌더링.
 */
export function SettingsProfileExtras({ club, isManager }: Props) {
  // ── 기본 정보 ──
  const [name, setName] = useState(club.name)
  const [description, setDescription] = useState(club.description ?? '')
  const [location, setLocation] = useState(club.location ?? '')
  const [activityPlace, setActivityPlace] = useState(club.activity_place ?? '')
  const initialCategory = (
    CATEGORIES.includes((club.category ?? '동호회') as Category)
      ? (club.category ?? '동호회')
      : '동호회'
  ) as Category
  const [category, setCategory] = useState<Category>(initialCategory)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // ── 분위기/활동/운영자/FAQ ──
  const [tags, setTags] = useState<ClubTag[]>(
    (club.tags ?? []).filter((t): t is ClubTag => typeof t === 'string') as ClubTag[],
  )
  const [scheduleSummary, setScheduleSummary] = useState(
    club.schedule_summary ?? '',
  )
  const [feeMonthly, setFeeMonthly] = useState(
    club.fee_monthly == null ? '' : String(club.fee_monthly),
  )
  const [feePerSession, setFeePerSession] = useState(
    club.fee_per_session == null ? '' : String(club.fee_per_session),
  )
  const [feeNote, setFeeNote] = useState(club.fee_note ?? '')
  const [ownerBio, setOwnerBio] = useState(club.owner_bio ?? '')
  const [contactUrl, setContactUrl] = useState(club.contact_url ?? '')
  const [faqs, setFaqs] = useState<ClubFAQ[]>(
    Array.isArray(club.faqs) ? club.faqs : [],
  )

  const [isPending, startTransition] = useTransition()
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isManager) return null

  const handleSave = () => {
    setError(null)
    setSavedFlash(false)

    startTransition(async () => {
      const supabase = createClient()

      // 1) 신규 썸네일 업로드 (선택)
      let nextThumbnailUrl: string | null | undefined = undefined
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() ?? 'jpg'
        const path = `${club.id}/cover/${Date.now()}.${ext}`
        const url = await uploadWithFallback(supabase, imageFile, path)
        if (!url) {
          setError('대표 이미지 업로드에 실패했어요. 다시 시도해주세요.')
          return
        }
        nextThumbnailUrl = url
      }

      const result = await updateClubProfileExtrasAction(club.id, {
        name,
        description,
        location,
        activity_place: activityPlace,
        category,
        ...(nextThumbnailUrl !== undefined ? { thumbnail_url: nextThumbnailUrl } : {}),
        tags,
        fee_monthly: feeMonthly ? Number(feeMonthly) : null,
        fee_per_session: feePerSession ? Number(feePerSession) : null,
        fee_note: feeNote,
        owner_bio: ownerBio,
        schedule_summary: scheduleSummary,
        faqs,
        contact_url: contactUrl,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      setImageFile(null)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2400)
    })
  }

  return (
    <div className="bg-white border border-[#f0f0f0] rounded-3xl p-6 sm:p-8 space-y-8">

      {/* 섹션 1 — 기본 정보 */}
      <FormSection title="기본 정보">
        <ThumbnailUpload
          onFileChange={(file) => setImageFile(file)}
          initialUrl={club.thumbnail_url ?? null}
        />

        <div>
          <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
            모임 이름 <span className="text-[var(--color-brand-streak)]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 관악구 화요일 배드민턴 모임"
            maxLength={30}
            className={inputCls}
          />
        </div>

        <CategoryChips value={category} onChange={setCategory} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">지역</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 관악구"
              maxLength={20}
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">활동 장소</label>
            <input
              type="text"
              value={activityPlace}
              onChange={(e) => setActivityPlace(e.target.value)}
              placeholder="예: 국사봉체육관"
              maxLength={30}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">모임 소개</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="모임을 소개하는 글을 작성해주세요. (선택)"
            rows={4}
            maxLength={500}
            className={`${inputCls} resize-none leading-relaxed`}
          />
        </div>
      </FormSection>

      <div className="border-t border-[#f0f0f0]" />

      {/* 섹션 2 — 모임 분위기 */}
      <FormSection title="모임 분위기">
        <TagPicker value={tags} onChange={setTags} />
      </FormSection>

      <div className="border-t border-[#f0f0f0]" />

      {/* 섹션 3 — 활동 정보 */}
      <FormSection title="활동 정보">
        <div>
          <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
            정기 일정 요약 <span className="text-[#bbb] font-normal">(선택)</span>
          </label>
          <input
            type="text"
            placeholder="예: 매주 화/목 19:00~22:00"
            maxLength={80}
            value={scheduleSummary}
            onChange={(e) => setScheduleSummary(e.target.value)}
            className={inputCls}
          />
        </div>

        <FeeInputs
          feeMonthly={feeMonthly}
          onFeeMonthlyChange={setFeeMonthly}
          feePerSession={feePerSession}
          onFeePerSessionChange={setFeePerSession}
          feeNote={feeNote}
          onFeeNoteChange={setFeeNote}
        />
      </FormSection>

      <div className="border-t border-[#f0f0f0]" />

      {/* 섹션 4 — 운영자 정보 */}
      <FormSection title="운영자 정보">
        <div>
          <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
            운영자 한 줄 소개 <span className="text-[#bbb] font-normal">(선택)</span>
          </label>
          <input
            type="text"
            placeholder="예: 10년차 동호인, 초심자 환영합니다"
            maxLength={120}
            value={ownerBio}
            onChange={(e) => setOwnerBio(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
            공개 연락처 <span className="text-[#bbb] font-normal">(선택)</span>
          </label>
          <input
            type="text"
            placeholder="예: mailto:owner@email.com 또는 https://open.kakao.com/o/..."
            maxLength={200}
            value={contactUrl}
            onChange={(e) => setContactUrl(e.target.value)}
            className={inputCls}
          />
          <p className="mt-1.5 text-[11px] text-[#999] leading-relaxed">
            가입 전 방문자가 운영자에게 직접 연락할 수 있는 링크예요. 입력하지 않으면 메시지 버튼은 노출되지 않아요.
          </p>
        </div>
      </FormSection>

      <div className="border-t border-[#f0f0f0]" />

      {/* 섹션 5 — FAQ */}
      <FormSection title="FAQ">
        <FaqEditor value={faqs} onChange={setFaqs} />
      </FormSection>

      {error && (
        <p className="text-[12px] text-[var(--color-brand-streak)] bg-[var(--color-brand-streak-bg)] px-3 py-2 rounded-xl">
          {error}
        </p>
      )}
      {savedFlash && (
        <p className="text-[12px] text-[var(--color-brand-court-deep)] bg-[var(--color-brand-court-bg)] px-3 py-2 rounded-xl">
          저장되었어요.
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full py-3 bg-[var(--color-brand-lime)] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
      >
        {isPending ? '저장 중…' : '모임 프로필 저장'}
      </button>
    </div>
  )
}
