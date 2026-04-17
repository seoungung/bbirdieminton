'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createClubAction } from '@/app/club/create/actions'

export function ClubCreateForm({ clubUserId: _ }: { clubUserId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<'동호회' | '클럽'>('동호회')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    setPreviewUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('category', category)
    setError(null)

    startTransition(async () => {
      let thumbnailUrl = ''

      /* 이미지 파일이 있으면 Supabase Storage에 업로드 */
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

        const { data } = supabase.storage
          .from('club-thumbnails')
          .getPublicUrl(path)
        thumbnailUrl = data.publicUrl
      }

      fd.set('thumbnail_url', thumbnailUrl)
      const result = await createClubAction(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">

        {/* 썸네일 업로드 */}
        <div>
          <label className="block text-sm font-semibold text-[#111] mb-2 text-center">
            모임 썸네일
          </label>

          {previewUrl ? (
            /* 미리보기 */
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#f0f0f0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="썸네일 미리보기"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            /* 업로드 버튼 */
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] hover:border-[#beff00] hover:bg-[#f8ffe8] transition-colors flex flex-col items-center justify-center gap-2 group"
            >
              <ImagePlus size={28} className="text-[#ccc] group-hover:text-[#aad000] transition-colors" />
              <span className="text-sm text-[#999] group-hover:text-[#777] transition-colors">
                이미지 첨부 (선택)
              </span>
              <span className="text-xs text-[#bbb]">JPG, PNG, WEBP · 최대 5MB</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* 모임 이름 */}
        <div>
          <label className="block text-sm font-semibold text-[#111] mb-1.5">
            모임 이름 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="예: 관악구 화요일 배드민턴 모임"
            maxLength={30}
            className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] bg-white transition-colors"
            required
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-semibold text-[#111] mb-1.5">카테고리</label>
          <div className="flex gap-2">
            {(['동호회', '클럽'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                  category === cat
                    ? 'bg-[#111] text-white border-[#111]'
                    : 'bg-white text-[#555] border-[#e5e5e5] hover:border-[#999]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 코트 수 */}
        <div>
          <label className="block text-sm font-semibold text-[#111] mb-1.5">코트 수</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              name="court_count"
              min={1}
              max={20}
              defaultValue={2}
              className="w-24 border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#beff00] bg-white transition-colors text-center"
            />
            <span className="text-sm text-[#999]">면 (1~20)</span>
          </div>
        </div>

        {/* 지역 + 활동 장소 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#111] mb-1.5">지역</label>
            <input
              type="text"
              name="location"
              placeholder="예: 관악구"
              maxLength={20}
              className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111] mb-1.5">활동 장소</label>
            <input
              type="text"
              name="activity_place"
              placeholder="예: 국사봉체육관"
              maxLength={30}
              className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] bg-white transition-colors"
            />
          </div>
        </div>

        {/* 모임 소개 */}
        <div>
          <label className="block text-sm font-semibold text-[#111] mb-1.5">모임 소개</label>
          <textarea
            name="description"
            placeholder="모임을 소개하는 글을 작성해주세요. (선택)"
            rows={4}
            maxLength={500}
            className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] bg-white transition-colors resize-none leading-relaxed"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3.5 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
          >
            {isPending ? '생성 중...' : '모임 만들기'}
          </button>
        </div>
      </form>
    </div>
  )
}
