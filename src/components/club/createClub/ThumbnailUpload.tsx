'use client'

import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface ThumbnailUploadProps {
  onFileChange: (file: File | null, previewUrl: string | null) => void
}

export function ThumbnailUpload({ onFileChange }: ThumbnailUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onFileChange(file, url)
  }

  const clear = () => {
    setPreviewUrl(null)
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
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
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
