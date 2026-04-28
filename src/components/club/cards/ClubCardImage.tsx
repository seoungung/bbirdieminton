'use client'

import Image from 'next/image'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'

interface ClubCardImageProps {
  name: string
  thumbnailUrl?: string | null
  thumbnailColor?: string
  isNew?: boolean
  isDemo?: boolean
}

/**
 * Pinterest 카드 상단 이미지/그라데이션 영역.
 * - thumbnail_url 있음 → Next Image (object-cover, aspect-[4/5])
 * - 없음 → thumbnailColor 기반 그라데이션 + 클럽명 첫 글자 + 셔틀콕 심볼
 */
export function ClubCardImage({
  name,
  thumbnailUrl,
  thumbnailColor = '#f0f0f0',
  isNew = false,
  isDemo = false,
}: ClubCardImageProps) {
  const initial = name.charAt(0).toUpperCase()

  // 배경색에서 파생 그라데이션 — 이미지 없는 카드에 깊이감 부여
  const gradientStyle: React.CSSProperties = {
    background: `linear-gradient(145deg, ${thumbnailColor} 0%, ${thumbnailColor}cc 60%, ${thumbnailColor}88 100%)`,
  }

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
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none"
          style={gradientStyle}
        >
          {/* 클럽 첫 글자 대형 타이포 */}
          <span
            className="text-7xl font-black leading-none tracking-tighter"
            style={{ color: 'rgba(0,0,0,0.18)' }}
            aria-hidden="true"
          >
            {initial}
          </span>
          {/* 셔틀콕 심볼 — 우측 하단 고정 */}
          <ShuttlecockIcon
            size={28}
            strokeWidth={1.2}
            className="absolute bottom-3.5 right-3.5 opacity-20"
            aria-label="셔틀콕"
          />
        </div>
      )}

      {/* 배지 영역 */}
      {isNew && (
        <span className="absolute top-3 left-3 text-[10px] font-extrabold px-2 py-0.5 bg-[#111] text-[#beff00] rounded-md tracking-wider z-10 uppercase">
          NEW
        </span>
      )}
      {isDemo && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 bg-[#beff00] text-[#111] rounded-md tracking-wide z-10">
          체험용
        </span>
      )}
    </div>
  )
}
