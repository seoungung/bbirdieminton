'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  photos: string[]
  initialIndex: number
  clubName: string
  onClose: () => void
}

/**
 * 사진 갤러리 풀스크린 라이트박스.
 *
 * - 좌상단 닫기 버튼 (X)
 * - 좌우 가장자리 이전/다음 화살표 (사진 1장이면 숨김)
 * - 우하단 인디케이터 (현재/총)
 * - 키보드: ←/→ 이전·다음, ESC 닫기
 * - 외부(오버레이) 클릭 시 닫힘
 * - 모바일 좌우 swipe — 50px 이상 이동 시 prev/next
 */
export function ClubPreviewPhotoLightbox({
  photos,
  initialIndex,
  clubName,
  onClose,
}: Props) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, photos.length - 1)),
  )
  const touchStartXRef = useRef<number | null>(null)

  const total = photos.length
  const prev = useCallback(() => {
    if (total <= 1) return
    setIndex((i) => (i - 1 + total) % total)
  }, [total])
  const next = useCallback(() => {
    if (total <= 1) return
    setIndex((i) => (i + 1) % total)
  }, [total])

  /* 키보드 핸들러 — 라이트박스가 열린 동안만 등록 */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [prev, next, onClose])

  /* body 스크롤 잠금 */
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  if (total === 0) return null

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

  /* 오버레이 클릭 시 닫힘 — 단, 자식(이미지/버튼) 클릭 전파는 차단 */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const currentSrc = photos[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${clubName} 활동 사진 ${index + 1} / ${total}`}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
    >
      {/* 닫기 버튼 — 좌상단 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-4 left-4 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
      >
        <X size={22} strokeWidth={2} />
      </button>

      {/* 이전 — 좌측 */}
      {total > 1 && (
        <button
          type="button"
          aria-label="이전 사진"
          onClick={prev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
      )}

      {/* 다음 — 우측 */}
      {total > 1 && (
        <button
          type="button"
          aria-label="다음 사진"
          onClick={next}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>
      )}

      {/* 이미지 — Next/Image 가 max-w/max-h 와 호환되도록 wrapper 사용 */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center pointer-events-none"
        aria-hidden={false}
      >
        <Image
          key={currentSrc}
          src={currentSrc}
          alt={`${clubName} 활동 사진 ${index + 1}`}
          width={1600}
          height={1200}
          unoptimized
          className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain pointer-events-auto select-none"
          draggable={false}
          priority
        />
      </div>

      {/* 인디케이터 — 우하단 */}
      {total > 1 && (
        <div className="absolute bottom-5 right-5 px-3 py-1.5 rounded-full bg-black/55 text-white text-[12px] font-semibold tabular-nums tracking-tight">
          {index + 1} / {total}
        </div>
      )}
    </div>
  )
}
