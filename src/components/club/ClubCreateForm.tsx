'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createClubAction } from '@/app/club/create/actions'
import { FormSection } from '@/components/club/createClub/FormSection'
import { CategoryChips, type Category } from '@/components/club/createClub/CategoryChips'
import { ColorSwatchPicker, type SwatchColor } from '@/components/club/createClub/ColorSwatchPicker'
import { ThumbnailUpload } from '@/components/club/createClub/ThumbnailUpload'

const inputCls =
  'w-full border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#111] ' +
  'placeholder:text-[#bbb] bg-[#fafafa] focus:outline-none focus:border-[#0a0a0a] ' +
  'focus:bg-white transition-colors'

export function ClubCreateForm({ clubUserId: _ }: { clubUserId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<Category>('동호회')
  const [thumbColor, setThumbColor] = useState<SwatchColor>('#10b981')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('category', category)
    setError(null)

    startTransition(async () => {
      let thumbnailUrl = ''

      if (imageFile) {
        const supabase = createClient()
        const ext = imageFile.name.split('.').pop() ?? 'jpg'
        const path = `${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('club-thumbnails')
          .upload(path, imageFile, { upsert: true })

        if (uploadErr) {
          setError('이미지 업로드에 실패했어요. 다시 시도해주세요.')
          return
        }

        const { data } = supabase.storage.from('club-thumbnails').getPublicUrl(path)
        thumbnailUrl = data.publicUrl
      }

      fd.set('thumbnail_url', thumbnailUrl)
      const result = await createClubAction(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="bg-white border border-[#f0f0f0] rounded-3xl p-6 sm:p-8 space-y-8">

          {/* 섹션 1 — 기본 정보 */}
          <FormSection title="기본 정보">
            <div>
              <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
                모임 이름 <span className="text-red-400">*</span>
              </label>
              <input
                type="text" name="name"
                placeholder="예: 관악구 화요일 배드민턴 모임"
                maxLength={30} required className={inputCls}
              />
            </div>

            <CategoryChips value={category} onChange={setCategory} />

            <div className="grid grid-cols-2 gap-3">
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

          {/* 섹션 2 — 운영 설정 */}
          <FormSection title="운영 설정">
            <div>
              <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">최대 코트 수</label>
              <div className="flex items-center gap-3">
                <input
                  type="number" name="court_count" min={1} max={20} defaultValue={5}
                  className="w-24 border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#111] bg-[#fafafa] focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-colors text-center"
                />
                <span className="text-[12px] text-[#999]">면 (1~20)</span>
              </div>
              <p className="text-[11px] text-[#999] mt-1.5 leading-relaxed">
                운영 가능한 최대 코트 수예요. 게임 시작 시 1~최대값 사이로 조정할 수 있어요.
              </p>
            </div>

            <ColorSwatchPicker
              value={thumbColor}
              onChange={setThumbColor}
              inputName="thumbnail_color"
            />

            <ThumbnailUpload
              onFileChange={(file) => setImageFile(file)}
            />
          </FormSection>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl mt-4">{error}</p>
        )}

        <div className="mt-5 space-y-2">
          <button
            type="submit" disabled={isPending}
            className="w-full py-3 bg-[#beff00] text-[#111] font-bold text-base rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
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
