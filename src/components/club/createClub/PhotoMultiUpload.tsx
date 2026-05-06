'use client'

import { useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface PhotoMultiUploadProps {
  files: File[]
  onChange: (next: File[]) => void
  /** 최대 사진 개수 — 기본 6개 */
  max?: number
}

/**
 * 활동 사진 multi-upload (생성 폼 단계).
 * - 미리보기는 객체 URL 로 노출. 실제 업로드는 부모 onSubmit 시점.
 * - 운영자만 보는 폼 → 권한 가드는 부모 페이지에서.
 */
export function PhotoMultiUpload({
  files,
  onChange,
  max = 6,
}: PhotoMultiUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? [])
    if (list.length === 0) return
    const remaining = Math.max(0, max - files.length)
    const accepted = list.slice(0, remaining)
    onChange([...files, ...accepted])
    // input value 초기화 → 동일 파일 재선택 가능하게
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeAt = (i: number) => {
    onChange(files.filter((_, idx) => idx !== i))
  }

  const reachedMax = files.length >= max

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[12px] font-semibold text-[#666]">
          활동 사진 <span className="text-[#bbb] font-normal">(선택)</span>
        </label>
        <span className="text-[11px] text-[#999] tabular-nums">
          {files.length} / {max}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {files.map((f, i) => {
          const url = URL.createObjectURL(f)
          return (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden bg-[#f0f0f0] border border-[#ebebeb]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`활동 사진 ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="사진 제거"
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <X size={11} className="text-white" strokeWidth={2.5} />
              </button>
            </div>
          )
        })}

        {!reachedMax && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border border-dashed border-[#ddd] bg-[#fafafa] hover:border-[#888] hover:bg-[#f4f4f4] transition-colors flex flex-col items-center justify-center gap-1 group"
          >
            <ImagePlus
              size={20}
              className="text-[#bbb] group-hover:text-[#888] transition-colors"
            />
            <span className="text-[10.5px] text-[#bbb] group-hover:text-[#888] transition-colors">
              추가
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleSelect}
        className="hidden"
      />

      <p className="mt-2 text-[11px] text-[#999] leading-relaxed">
        최대 {max}장 · JPG / PNG / WEBP
      </p>
    </div>
  )
}
