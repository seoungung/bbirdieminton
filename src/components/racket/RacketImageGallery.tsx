'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface RacketImageGalleryProps {
  imageUrl: string | null
  imageUrls: string[] | null
  name: string
}

/**
 * PostgreSQL 배열 리터럴 {"url1","url2"} 또는 일반 URL / string[] 에서 URL 배열 추출
 */
function isValidSrc(s: string): boolean {
  return s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://')
}

function parseUrls(raw: string | string[] | null | undefined): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(isValidSrc)
  const trimmed = raw.trim()
  // JSON 배열 형식: ["url1","url2",...]
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.filter((s: unknown) => typeof s === 'string' && isValidSrc(s))
    } catch { /* fallthrough */ }
  }
  // PostgreSQL 배열 리터럴: {"url1","url2"}
  if (trimmed.startsWith('{')) {
    return [...trimmed.slice(1, -1).matchAll(/"([^"]+)"/g)]
      .map((m) => m[1])
      .filter(isValidSrc)
  }
  return isValidSrc(trimmed) ? [trimmed] : []
}

export function RacketImageGallery({ imageUrl, imageUrls, name }: RacketImageGalleryProps) {
  const fromImageUrl = parseUrls(imageUrl)
  const fromImageUrls = parseUrls(imageUrls)
  const allImages = [
    ...fromImageUrl,
    ...fromImageUrls.filter((u) => !fromImageUrl.includes(u)),
  ]

  const [selectedIdx, setSelectedIdx] = useState(0)

  if (allImages.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
        <span className="text-6xl">🏸</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden">
        <Image
          src={allImages[selectedIdx]}
          alt={`${name} 이미지 ${selectedIdx + 1}`}
          fill
          className="object-contain p-6 transition-opacity duration-200"
          priority
          sizes="(max-width: 768px) 100vw, 40vw"
        />
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={cn(
                'relative shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 bg-muted transition-all',
                i === selectedIdx
                  ? 'border-foreground'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
              aria-label={`이미지 ${i + 1} 선택`}
            >
              <Image
                src={img}
                alt={`${name} 썸네일 ${i + 1}`}
                fill
                className="object-contain p-1.5"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
