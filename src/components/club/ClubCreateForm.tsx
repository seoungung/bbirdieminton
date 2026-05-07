'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createClubAction } from '@/app/club/create/actions'
import { FormSection } from '@/components/club/createClub/FormSection'
import { CategoryChips, type Category } from '@/components/club/createClub/CategoryChips'
import { ThumbnailUpload } from '@/components/club/createClub/ThumbnailUpload'
import { TagPicker } from '@/components/club/createClub/TagPicker'
import { FeeInputs } from '@/components/club/createClub/FeeInputs'
import { FaqEditor } from '@/components/club/createClub/FaqEditor'
import type { ClubTag } from '@/lib/club/tags'
import type { ClubFAQ } from '@/types/club'

const inputCls =
  'w-full border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#111] ' +
  'placeholder:text-[#bbb] bg-[#fafafa] focus:outline-none focus:border-[#0a0a0a] ' +
  'focus:bg-white transition-colors'

/** 스토리지 버킷 — 신규 'clubs' 버킷이 적용된 환경이면 그쪽,
 *  미적용이면 기존 'club-thumbnails' 으로 fallback. */
const PRIMARY_BUCKET = 'clubs'
const FALLBACK_BUCKET = 'club-thumbnails'

async function uploadWithFallback(
  supabase: ReturnType<typeof createClient>,
  file: File,
  path: string,
): Promise<string | null> {
  // 1차: clubs 버킷 시도
  const primary = await supabase.storage
    .from(PRIMARY_BUCKET)
    .upload(path, file, { upsert: true })

  if (!primary.error) {
    const { data } = supabase.storage.from(PRIMARY_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  // 2차: club-thumbnails 버킷 fallback
  const fallback = await supabase.storage
    .from(FALLBACK_BUCKET)
    .upload(path, file, { upsert: true })
  if (fallback.error) return null
  const { data } = supabase.storage.from(FALLBACK_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export function ClubCreateForm({ clubUserId: _ }: { clubUserId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<Category>('동호회')
  const [imageFile, setImageFile] = useState<File | null>(null)

  // ── Phase A state ──────────────────────────────────────────
  const [tags, setTags] = useState<ClubTag[]>([])
  const [feeMonthly, setFeeMonthly] = useState('')
  const [feePerSession, setFeePerSession] = useState('')
  const [feeNote, setFeeNote] = useState('')
  const [scheduleSummary, setScheduleSummary] = useState('')
  const [ownerBio, setOwnerBio] = useState('')
  const [faqs, setFaqs] = useState<ClubFAQ[]>([])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('category', category)
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      let thumbnailUrl = ''

      // 1) 대표 썸네일 업로드 (선택)
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() ?? 'jpg'
        const path = `cover/${Date.now()}.${ext}`
        const url = await uploadWithFallback(supabase, imageFile, path)
        if (!url) {
          setError('대표 이미지 업로드에 실패했어요. 다시 시도해주세요.')
          return
        }
        thumbnailUrl = url
      }

      // 2) FormData 보강
      fd.set('thumbnail_url', thumbnailUrl)
      fd.set('tags', JSON.stringify(tags))
      fd.set('fee_monthly', feeMonthly)
      fd.set('fee_per_session', feePerSession)
      fd.set('fee_note', feeNote)
      fd.set('owner_bio', ownerBio)
      fd.set('schedule_summary', scheduleSummary)
      fd.set('faqs', JSON.stringify(faqs))

      const result = await createClubAction(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <div className="bg-white border border-[#f0f0f0] rounded-3xl p-6 sm:p-8 space-y-8">

          {/* 섹션 1 — 기본 정보 */}
          <FormSection title="기본 정보">
            {/* 대표 썸네일 — 모임 이름 위 */}
            <ThumbnailUpload onFileChange={(file) => setImageFile(file)} />

            <div>
              <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
                모임 이름 <span className="text-[var(--color-brand-streak)]">*</span>
              </label>
              <input
                type="text" name="name"
                placeholder="예: 관악구 화요일 배드민턴 모임"
                maxLength={30} required className={inputCls}
              />
            </div>

            <CategoryChips value={category} onChange={setCategory} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">지역</label>
                <input
                  type="text" name="location"
                  placeholder="예: 관악구" maxLength={20} className={inputCls}
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">활동 장소</label>
                <input
                  type="text" name="activity_place"
                  placeholder="예: 국사봉체육관" maxLength={30} className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">모임 소개</label>
              <textarea
                name="description"
                placeholder="모임을 소개하는 글을 작성해주세요. (선택)"
                rows={4} maxLength={500}
                className={`${inputCls} resize-none leading-relaxed`}
              />
            </div>
          </FormSection>

          <div className="border-t border-[#f0f0f0]" />

          {/* 섹션 2 — 모임 분위기 (태그) */}
          <FormSection title="모임 분위기">
            <TagPicker value={tags} onChange={setTags} />
          </FormSection>

          <div className="border-t border-[#f0f0f0]" />

          {/* 섹션 3 — 활동 정보 (일정 / 회비 / 코트수) */}
          <FormSection title="활동 정보">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div>
                <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">최대 코트 수</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number" name="court_count" min={1} max={20} defaultValue={5}
                    className="w-24 border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#111] bg-[#fafafa] focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-colors text-center"
                  />
                  <span className="text-[12px] text-[#999]">면 (1~20)</span>
                </div>
              </div>
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
          </FormSection>

          <div className="border-t border-[#f0f0f0]" />

          {/* 섹션 5 — FAQ */}
          <FormSection title="FAQ">
            <FaqEditor value={faqs} onChange={setFaqs} />
          </FormSection>
        </div>

        {error && (
          <p className="text-sm text-[var(--color-brand-streak)] bg-[var(--color-brand-streak-bg)] px-3 py-2 rounded-xl mt-4">{error}</p>
        )}

        <div className="mt-5 space-y-2">
          <button
            type="submit" disabled={isPending}
            className="w-full py-3 bg-[var(--color-brand-lime)] text-[#111] font-bold text-base rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
          >
            {isPending ? '생성 중...' : '모임 만들기'}
          </button>
          <button
            type="button" onClick={() => router.back()}
            className="w-full py-2.5 text-[#999] text-sm font-medium hover:text-[#555] transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
