'use client'

import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface ThumbnailUploadProps {
  onFileChange: (file: File | null, previewUrl: string | null) => void
  /** 편집 모드 — 이미 업로드된 썸네일 URL. 새 파일을 올리지 않으면 이 값이 미리보기. */
  initialUrl?: string | null
}

export function ThumbnailUpload({ onFileChange, initialUrl }: ThumbnailUploadProps) {
  // 새로 선택한 파일의 blob URL — 신규 업로드 중에만 값이 있음
  const [newFileUrl, setNewFileUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // 화면에 표시할 미리보기: 신규 파일 우선, 없으면 기존 URL
  const previewUrl = newFileUrl ?? initialUrl ?? null
  const isNewFile = newFileUrl !== null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    const url = URL.createObjectURL(file)
    setNewFileUrl(url)
    onFileChange(file, url)
  }

  // 신규 파일만 취소 — 기존 썸네일은 유지 (제거하려면 DB에서 직접)
  const clearNewFile = () => {
    setNewFileUrl(null)
    if (fileRef.current) fileRef.current.value = ''
    onFileChange(null, null)
  }

  return (
    <div>
      <label className="text-[12px] font-semibold text-[#666] mb-1.5 block">
        썸네일 이미지 <span className="text-[#bbb] font-normal">(선택)</span>
      </label>

      {previewUrl ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#f0f0f0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="썸네일 미리보기" className="w-full h-full object-cover" />
          {/* 클릭 → 새 이미지로 교체 */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center text-white opacity-0 hover:opacity-100"
            aria-label="이미지 교체"
          >
            <span className="text-[12px] font-semibold bg-black/60 px-3 py-1.5 rounded-full">
              이미지 교체
            </span>
          </button>
          {/* 신규 파일일 때만 X 노출 (취소 → 기존 썸네일 복원) */}
          {isNewFile && (
            <button
              type="button"
              onClick={clearNewFile}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
              aria-label="새 이미지 취소"
            >
              <X size={14} className="text-white" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-video rounded-2xl border border-dashed border-[#e5e5e5] bg-[#fafafa] hover:border-[#aaa] hover:bg-[#f4f4f4] transition-colors flex flex-col items-center justify-center gap-2 group"
        >
          <ImagePlus size={24} className="text-[#ccc] group-hover:text-[#888] transition-colors" />
          <span className="text-[12px] text-[#bbb] group-hover:text-[#888] transition-colors">이미지 첨부</span>
          <span className="text-[11px] text-[#ccc]">JPG, PNG, WEBP · 최대 5MB</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
