'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TagPicker } from '@/components/club/createClub/TagPicker'
import { FeeInputs } from '@/components/club/createClub/FeeInputs'
import { FaqEditor } from '@/components/club/createClub/FaqEditor'
import { PhotoMultiUpload } from '@/components/club/createClub/PhotoMultiUpload'
import { updateClubProfileExtrasAction } from '@/app/club/[clubId]/settings/actions'
import type { ClubTag } from '@/lib/club/tags'
import type { Club, ClubFAQ } from '@/types/club'
import { X } from 'lucide-react'

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
 * 운영자(매니저+) 가 모임 프로필의 Phase A 신규 정보를 편집하는 카드.
 * - 태그 / 회비 / 일정 / 운영자 소개 / 활동 사진 / FAQ
 * - SettingsClient 안에서 isManager 일 때만 렌더링.
 */
export function SettingsProfileExtras({ club, isManager }: Props) {
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

  // 사진: 기존 URL + 신규 파일 분리 관리.
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(
    Array.isArray(club.photo_urls) ? club.photo_urls : [],
  )
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])

  const [faqs, setFaqs] = useState<ClubFAQ[]>(
    Array.isArray(club.faqs) ? club.faqs : [],
  )

  const [isPending, startTransition] = useTransition()
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isManager) return null

  const totalPhotos = existingPhotoUrls.length + newPhotoFiles.length
  const remainingSlots = Math.max(0, 6 - existingPhotoUrls.length)

  const handleSave = () => {
    setError(null)
    setSavedFlash(false)

    startTransition(async () => {
      const supabase = createClient()

      // 1) 신규 파일 업로드
      const newUrls: string[] = []
      for (let i = 0; i < newPhotoFiles.length; i++) {
        const f = newPhotoFiles[i]
        const ext = f.name.split('.').pop() ?? 'jpg'
        const path = `${club.id}/gallery/${Date.now()}-${i}.${ext}`
        const url = await uploadWithFallback(supabase, f, path)
        if (url) newUrls.push(url)
      }

      const finalPhotoUrls = [...existingPhotoUrls, ...newUrls].slice(0, 6)

      const result = await updateClubProfileExtrasAction(club.id, {
        tags,
        fee_monthly: feeMonthly ? Number(feeMonthly) : null,
        fee_per_session: feePerSession ? Number(feePerSession) : null,
        fee_note: feeNote,
        owner_bio: ownerBio,
        schedule_summary: scheduleSummary,
        photo_urls: finalPhotoUrls,
        faqs,
        contact_url: contactUrl,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      // 업로드 성공 → 신규 파일 비우고 기존 URL 동기화
      setExistingPhotoUrls(finalPhotoUrls)
      setNewPhotoFiles([])
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2400)
    })
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 space-y-5">
      <p className="text-xs font-bold text-[#999]">모임 프로필 (가입 전 페이지)</p>

      {/* 태그 */}
      <TagPicker value={tags} onChange={setTags} />

      {/* 정기 일정 */}
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

      {/* 회비 */}
      <FeeInputs
        feeMonthly={feeMonthly}
        onFeeMonthlyChange={setFeeMonthly}
        feePerSession={feePerSession}
        onFeePerSessionChange={setFeePerSession}
        feeNote={feeNote}
        onFeeNoteChange={setFeeNote}
      />

      {/* 운영자 한 줄 소개 */}
      <div>
        <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
          운영자 한 줄 소개
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

      {/* 공개 연락처 — 가입 전 미리보기 페이지의 "메시지 보내기" 버튼이 이 값으로 활성화 */}
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

      {/* 활동 사진 — 기존 + 신규 */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[12px] font-semibold text-[#666]">
            활동 사진 <span className="text-[#bbb] font-normal">(최대 6장)</span>
          </label>
          <span className="text-[11px] text-[#999] tabular-nums">
            {totalPhotos} / 6
          </span>
        </div>

        {existingPhotoUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {existingPhotoUrls.map((url, i) => (
              <div
                key={url + i}
                className="relative aspect-square rounded-xl overflow-hidden bg-[#f0f0f0] border border-[#ebebeb]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`기존 활동 사진 ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setExistingPhotoUrls((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                  aria-label="사진 제거"
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                >
                  <X size={11} className="text-white" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        <PhotoMultiUpload
          files={newPhotoFiles}
          onChange={setNewPhotoFiles}
          max={Math.max(1, remainingSlots)}
        />
      </div>

      {/* FAQ */}
      <FaqEditor value={faqs} onChange={setFaqs} />

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
        {isPending ? '저장 중…' : '프로필 정보 저장'}
      </button>
    </div>
  )
}
