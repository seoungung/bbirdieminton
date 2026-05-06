'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Users, MapPin } from 'lucide-react'

export type ClubsLiveItem = {
  id: string
  name: string
  description: string | null
  location: string | null
  category: string | null
  member_count: number
  thumbnail_color: string | null
  thumbnail_url: string | null
}

/**
 * 라이브 모임 가로 슬라이드 — 좌우 화살표 + 모바일 swipe.
 *
 * 화살표 버튼은 sm: 이상에서만 노출 (모바일은 자연스러운 swipe).
 * 끝에 도달하면 disabled.
 */
export function ClubsLiveCarousel({ clubs }: { clubs: ClubsLiveItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const update = () => {
      setCanLeft(el.scrollLeft > 4)
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const scrollByCard = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const firstCard = el.querySelector('li') as HTMLElement | null
    const cardW = firstCard?.offsetWidth ?? 280
    const gap = 20 // sm:gap-5 = 1.25rem ≈ 20px
    el.scrollBy({
      left: (cardW + gap) * (dir === 'left' ? -1 : 1),
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      {/* 좌측 화살표 */}
      <button
        type="button"
        onClick={() => scrollByCard('left')}
        disabled={!canLeft}
        aria-label="이전 모임"
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full bg-white border border-[#e5e5e5] text-[#0a0a0a] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15)] transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:scale-105 enabled:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.2)]"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>

      {/* 우측 화살표 */}
      <button
        type="button"
        onClick={() => scrollByCard('right')}
        disabled={!canRight}
        aria-label="다음 모임"
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full bg-white border border-[#e5e5e5] text-[#0a0a0a] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15)] transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:scale-105 enabled:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.2)]"
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>

      {/* 슬라이드 컨테이너 */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        <ul
          className="flex gap-4 pb-2 sm:gap-5"
          style={{
            paddingLeft: 'max(1.5rem, calc((100vw - 1100px) / 2 + 1.5rem))',
            paddingRight: 'max(1.5rem, calc((100vw - 1100px) / 2 + 1.5rem))',
          }}
        >
          {clubs.map((club) => (
            <li
              key={club.id}
              className="snap-start shrink-0 w-[280px] sm:w-[320px]"
            >
              <Link
                href={`/clubs/${club.id}`}
                className="group flex h-full flex-col rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden transition-all hover:border-[#0a0a0a]/40 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)]"
              >
                <div
                  className="aspect-[16/9] w-full"
                  style={{
                    background: club.thumbnail_url
                      ? `url(${club.thumbnail_url}) center/cover`
                      : club.thumbnail_color ?? '#f0f0f0',
                  }}
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3
                    className="mb-2 text-[16px] font-extrabold tracking-[-0.01em] text-[#0a0a0a]"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {club.name}
                  </h3>
                  {club.description && (
                    <p
                      className="mb-4 text-[13px] leading-[1.6] text-[#666] line-clamp-2"
                      style={{ wordBreak: 'keep-all' }}
                    >
                      {club.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-3 text-[11px] text-[#999]">
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} strokeWidth={2.5} />
                      {club.member_count}명
                    </span>
                    {club.location && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin size={11} strokeWidth={2.5} />
                        {club.location}
                      </span>
                    )}
                    {club.category && (
                      <span className="ml-auto rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[10px] font-bold text-[#666]">
                        {club.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
