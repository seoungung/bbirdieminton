'use client'

import Image from 'next/image'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'

interface Props {
  name: string
  thumbnailUrl: string | null
  thumbnailColor: string
  category: string | null
  location: string | null
  memberCount: number
}

/**
 * 풀 width 배너 + 하단 메타/제목.
 * - 5/3 비율 (소모임 / 네이버카페 패턴)
 * - 이미지 있으면 cover, 없으면 색상 그라데이션 + 첫 글자 타이포 + 셔틀콕
 * - 배너 자체에 살짝 다크 그라데이션 오버레이 → 카테고리 pill 가독성 확보
 */
export function ClubPreviewHero({
  name,
  thumbnailUrl,
  thumbnailColor,
  category,
  location,
  memberCount,
}: Props) {
  const initial = name.charAt(0).toUpperCase()
  const meta = [location, category].filter(Boolean).join(' · ')

  return (
    <section className="max-w-[720px] mx-auto">
      {/* 배너 — 모바일 5/3, 데스크톱 16/9, 280px 높이 캡 */}
      <div className="relative w-full aspect-[5/3] sm:aspect-[16/9] max-h-[280px] overflow-hidden bg-[#f0f0f0]">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center select-none"
            style={{
              background: `linear-gradient(150deg, ${thumbnailColor} 0%, ${thumbnailColor}dd 50%, ${thumbnailColor}99 100%)`,
            }}
            aria-hidden
          >
            <span
              className="text-[120px] sm:text-[140px] font-black leading-none tracking-tighter"
              style={{ color: 'rgba(0,0,0,0.15)' }}
            >
              {initial}
            </span>
            <ShuttlecockIcon
              size={48}
              strokeWidth={1}
              className="absolute bottom-5 right-5 opacity-15"
              aria-label="셔틀콕"
            />
          </div>
        )}
        {/* 가독성 오버레이 — 이미지 있을 때만 */}
        {thumbnailUrl && (
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 100%)',
            }}
          />
        )}
      </div>

      {/* 제목·메타 */}
      <div className="px-4 pt-5 pb-1">
        {meta && (
          <p className="text-[12px] font-medium text-[#999] tracking-tight">
            {meta}
            {memberCount > 0 && (
              <>
                <span className="mx-1.5 text-[#d0d0d0]">·</span>
                <span className="text-[#666]">멤버 {memberCount}</span>
              </>
            )}
          </p>
        )}
        <h2 className="mt-2 text-[24px] sm:text-[26px] font-extrabold text-[#111] leading-tight tracking-tight break-keep">
          {name}
        </h2>
      </div>
    </section>
  )
}
