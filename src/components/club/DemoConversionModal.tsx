'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, Sparkles, ArrowRight } from 'lucide-react'

const VIEW_COUNT_KEY = 'birdieminton.demo.pageViews'
const SHOWN_COUNT_KEY = 'birdieminton.demo.conversionShown'
const LAST_SHOWN_AT_KEY = 'birdieminton.demo.conversionShownAt'

/** 전환 모달 트리거 조건 */
const TRIGGER_PAGE_VIEWS = 4 // 4개 페이지 이상 방문 시
const MAX_SHOW_COUNT = 3 // 최대 3번까지만 표시
const COOL_DOWN_HOURS = 6 // 다시 표시하려면 6시간 경과 필요

/**
 * 체험 중 전환 유도 모달
 *
 * 조건: 4개 이상 페이지 방문 + 최대 3번 표시 + 6시간 쿨다운
 */
export function DemoConversionModal() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 페이지 방문 카운트 업데이트
    const visited = safeGet(VIEW_COUNT_KEY)
    const paths: string[] = visited ? JSON.parse(visited) : []
    if (!paths.includes(pathname)) {
      paths.push(pathname)
      safeSet(VIEW_COUNT_KEY, JSON.stringify(paths))
    }

    // 표시 횟수 · 쿨다운 체크
    const shownCount = parseInt(safeGet(SHOWN_COUNT_KEY) ?? '0', 10)
    if (shownCount >= MAX_SHOW_COUNT) return

    const lastShownAt = safeGet(LAST_SHOWN_AT_KEY)
    if (lastShownAt) {
      const hoursSince = (Date.now() - parseInt(lastShownAt, 10)) / (1000 * 60 * 60)
      if (hoursSince < COOL_DOWN_HOURS) return
    }

    // 4개 이상 페이지 방문 시 트리거
    if (paths.length >= TRIGGER_PAGE_VIEWS) {
      // 2초 후 표시 (방금 방문한 페이지 보여주고)
      const timer = setTimeout(() => {
        setOpen(true)
        safeSet(SHOWN_COUNT_KEY, String(shownCount + 1))
        safeSet(LAST_SHOWN_AT_KEY, String(Date.now()))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-[fadeInDown_200ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conversion-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-3xl max-w-[480px] w-full overflow-hidden shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-[#f5f5f5] flex items-center justify-center text-[#555] transition-colors z-10"
          aria-label="닫기"
        >
          <X size={16} />
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a] to-[#1a1a1a] text-white px-8 pt-10 pb-8 text-center relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[#beff00] animate-pulse">
            <Sparkles size={20} strokeWidth={2} />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#beff00] flex items-center justify-center mx-auto mb-4">
            <Image src="/symbol_birdieminton-black.png" alt="버디민턴" width={32} height={32} className="h-8 w-auto" />
          </div>
          <h2 id="conversion-title" className="text-2xl font-extrabold tracking-tight mb-2">
            꽤 둘러보셨네요!
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            이제 진짜 내 모임을 만들어볼까요?<br />
            5분이면 충분해요.
          </p>
        </div>

        {/* 혜택 */}
        <div className="p-6 pb-4 space-y-3">
          {[
            { emoji: '⚡', text: '카카오 1초 가입 · 설치 없이 바로' },
            { emoji: '🎁', text: 'v2.0 베타 기간 동안 모든 기능 무료' },
            { emoji: '💬', text: '기존 회원 초대 링크 한 번에 생성' },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3 px-1">
              <span className="text-lg flex-shrink-0">{item.emoji}</span>
              <p className="text-[14px] text-[#333] leading-relaxed pt-0.5">{item.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-2.5">
          <Link
            href="/login?next=%2Fclub%2Fcreate"
            onClick={() => setOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#0a0a0a] text-white font-extrabold text-[15px] rounded-2xl hover:bg-[#222] transition-all group"
          >
            지금 바로 시작하기
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={() => setOpen(false)}
            className="w-full py-3 text-[13px] font-semibold text-[#999] hover:text-[#555] transition-colors"
          >
            계속 체험하기
          </button>
        </div>
      </div>
    </div>
  )
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // 무시
  }
}
