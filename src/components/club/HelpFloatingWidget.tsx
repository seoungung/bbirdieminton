'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { HeadphonesIcon, X, HelpCircle, MessageSquare } from 'lucide-react'

/**
 * 우측 하단 floating 고객센터 위젯
 *
 * Closed: 56×56 동그란 버튼 (브랜드 ink 배경 + lime 아이콘)
 * Open:   220×N 패널 위쪽 expand — 자주 묻는 질문 / 문의·피드백
 *
 * 인쇄 시 숨김 (`print:hidden`)
 */
export function HelpFloatingWidget() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 외부 클릭 + ESC 닫기
  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end gap-3"
    >
      {/* 펼친 패널 — 트리거 위쪽 */}
      {open && (
        <div
          role="dialog"
          aria-label="고객센터"
          className="w-[260px] bg-white rounded-2xl border border-[#e5e5e5] shadow-xl overflow-hidden animate-[fadeInUpRight_180ms_ease-out]"
        >
          {/* 헤더 */}
          <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center justify-between bg-[#fafafa]">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-brand-ink)' }}
              >
                <HeadphonesIcon
                  size={13}
                  strokeWidth={2}
                  style={{ color: 'var(--color-brand-lime)' }}
                />
              </div>
              <p className="text-[13px] font-bold text-[#111]">고객센터</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-[#f0f0f0] flex items-center justify-center text-[#555] transition-colors"
              aria-label="고객센터 닫기"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* 본문 */}
          <nav className="py-2">
            <Link
              href="/manual"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8f8f8] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a]">
                <HelpCircle size={14} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#111]">자주 묻는 질문</p>
                <p className="text-[11px] text-[#999] truncate mt-0.5">도움말 센터</p>
              </div>
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8f8f8] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a]">
                <MessageSquare size={14} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#111]">문의·피드백</p>
                <p className="text-[11px] text-[#999] truncate mt-0.5">버그·기능 제안</p>
              </div>
            </Link>
          </nav>
        </div>
      )}

      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? '고객센터 닫기' : '고객센터 열기'}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="w-14 h-14 rounded-full shadow-lg hover:brightness-110 active:brightness-95 transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-2"
        style={{ backgroundColor: 'var(--color-brand-ink)' }}
      >
        {open ? (
          <X
            size={20}
            strokeWidth={2.2}
            style={{ color: 'var(--color-brand-lime)' }}
          />
        ) : (
          <HeadphonesIcon
            size={22}
            strokeWidth={1.9}
            style={{ color: 'var(--color-brand-lime)' }}
          />
        )}
      </button>
    </div>
  )
}
