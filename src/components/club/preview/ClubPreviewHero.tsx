'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ClubThumbnailFallback } from '@/components/club/cards/ClubThumbnailFallback'

interface Props {
  name: string
  thumbnailUrl: string | null
  /** @deprecated 더 이상 사용하지 않음. 기본 썸네일은 브랜드 톤으로 통일. */
  thumbnailColor?: string
  category: string | null
  location: string | null
  memberCount: number
  /** 추가 활동 사진 URL — thumbnail 다음에 합쳐서 carousel 로 표시 */
  photoUrls?: string[]
}

/**
 * 풀 width 배너 + 하단 메타/제목.
 * - thumbnailUrl + photoUrls 합쳐 2장+ 면 carousel 활성화
 * - 1장만 있으면 단순 표시 (carousel UI 미노출)
 * - 5/3 비율 (모바일) / 16/9 (데스크톱), 280px 높이 캡
 * - 데스크톱: 호버 시 좌우 화살표 / 모바일: touch swipe
 * - 인디케이터 dots 하단 가운데
 * - autoplay X (사용자 컨트롤 우선)
 * - 키보드 ←/→: 이미지 영역 포커스 시 동작
 */
export function ClubPreviewHero({
  name,
  thumbnailUrl,
  category,
  location,
  memberCount,
  photoUrls,
}: Props) {
  const meta = [location, category].filter(Boolean).join(' · ')

  /* 썸네일 + 활동 사진 — 중복 제거 후 합치기 */
  const slides = useMemo(() => {
    const arr: string[] = []
    if (thumbnailUrl) arr.push(thumbnailUrl)
    if (photoUrls) {
      for (const url of photoUrls) {
        if (typeof url === 'string' && url.length > 0 && !arr.includes(url)) {
          arr.push(url)
        }
      }
    }
    return arr
  }, [thumbnailUrl, photoUrls])

  const total = slides.length
  const hasCarousel = total >= 2

  const [index, setIndex] = useState(0)
  const touchStartXRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const prev = useCallback(() => {
    if (!hasCarousel) return
    setIndex((i) => (i - 1 + total) % total)
  }, [hasCarousel, total])
  const next = useCallback(() => {
    if (!hasCarousel) return
    setIndex((i) => (i + 1) % total)
  }, [hasCarousel, total])

  /* 키보드 — 영역 포커스 상태에서 ←/→ */
  useEffect(() => {
    if (!hasCarousel) return
    const node = containerRef.current
    if (!node) return
    const handleKey = (e: KeyboardEvent) => {
      if (!node.contains(document.activeElement)) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [hasCarousel, prev, next])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartXRef.current
    if (start == null) return
    const end = e.changedTouches[0].clientX
    const dx = end - start
    if (Math.abs(dx) > 50) {
      if (dx > 0) prev()
      else next()
    }
    touchStartXRef.current = null
  }

  return (
    <section className="max-w-[1088px] mx-auto">
      {/* 배너 — 모바일 5/3, 데스크톱 16/9, 280px 높이 캡 */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[5/3] sm:aspect-[16/9] max-h-[280px] overflow-hidden bg-[#f0f0f0] group"
        onTouchStart={hasCarousel ? handleTouchStart : undefined}
        onTouchEnd={hasCarousel ? handleTouchEnd : undefined}
        role={hasCarousel ? 'region' : undefined}
        aria-roledescription={hasCarousel ? 'carousel' : undefined}
        aria-label={hasCarousel ? `${name} 사진 ${index + 1} / ${total}` : undefined}
        tabIndex={hasCarousel ? 0 : -1}
      >
        {total > 0 ? (
          slides.map((src, i) => (
            <div
              key={src + i}
              aria-hidden={i !== index}
              className={
                'absolute inset-0 transition-opacity duration-300 ' +
                (i === index ? 'opacity-100' : 'opacity-0 pointer-events-none')
              }
            >
              <Image
                src={src}
                alt={
                  i === 0
                    ? name
                    : `${name} 활동 사진 ${i}`
                }
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
              />
            </div>
          ))
        ) : (
          <ClubThumbnailFallback logoSize={120} />
        )}

        {/* 가독성 오버레이 — 이미지 있을 때만 (캐러셀 모든 슬라이드 공통) */}
        {total > 0 && (
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 100%)',
            }}
          />
        )}

        {/* 화살표 — 데스크톱 호버 시 표시 (md+). 모바일에선 swipe 위주 */}
        {hasCarousel && (
          <>
            <button
              type="button"
              aria-label="이전 사진"
              onClick={prev}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              aria-label="다음 사진"
              onClick={next}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} strokeWidth={2.2} />
            </button>
          </>
        )}

        {/* 인디케이터 dots — 모바일/데스크톱 공통, 하단 가운데 */}
        {hasCarousel && (
          <div
            role="tablist"
            aria-label="사진 페이지"
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${i + 1}번째 사진 보기`}
                onClick={() => setIndex(i)}
                className={
                  'w-1.5 h-1.5 rounded-full transition-all ' +
                  (i === index ? 'bg-white w-4' : 'bg-white/55 hover:bg-white/80')
                }
              />
            ))}
          </div>
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
