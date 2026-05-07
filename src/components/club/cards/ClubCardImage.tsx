'use client'

import Image from 'next/image'
import { ClubThumbnailFallback } from './ClubThumbnailFallback'

interface ClubCardImageProps {
  name: string
  thumbnailUrl?: string | null
  /** @deprecated 더 이상 사용하지 않음. 단일 브랜드 톤으로 통일. */
  thumbnailColor?: string
  isNew?: boolean
  isDemo?: boolean
}

/**
 * Pinterest 카드 상단 이미지/플레이스홀더 영역.
 * - thumbnail_url 있음 → Next Image (object-cover, aspect-[4/5])
 * - 없음 → 브랜드 메인 컬러 + 검정 심볼 50% 투명도
 */
export function ClubCardImage({
  name,
  thumbnailUrl,
  isNew = false,
  isDemo = false,
}: ClubCardImageProps) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-2xl">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <ClubThumbnailFallback logoSize={88} />
      )}

      {/* 배지 영역 */}
      {isNew && (
        <span className="absolute top-3 left-3 text-[10px] font-extrabold px-2 py-0.5 bg-[#111] text-[var(--color-brand-lime)] rounded-md tracking-wider z-10 uppercase">
          NEW
        </span>
      )}
      {isDemo && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 bg-[var(--color-brand-lime)] text-[#111] rounded-md tracking-wide z-10">
          체험용
        </span>
      )}
    </div>
  )
}
