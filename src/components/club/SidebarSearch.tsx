'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, Users, Megaphone, Wallet } from 'lucide-react'

interface Props {
  /** 접힘 사이드바 (md~xl)일 때 true: 돋보기 아이콘만 표시 */
  collapsed: boolean
}

/**
 * 사이드바 내장 전역 검색
 *
 * 범위: 회원 + 공지 + 정산 (Phase 1: placeholder, Phase 2: 실제 검색 API)
 *
 * - collapsed: 36×36 돋보기 아이콘 버튼 → 클릭 시 우측 옆에 패널 펼침
 * - expanded:  전체 input 박스 + ⌘K kbd → 포커스 시 아래 드롭다운
 */
export function SidebarSearch({ collapsed }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

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
    <div ref={ref} className="relative">
      {collapsed ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="검색"
          aria-expanded={open}
          aria-haspopup="dialog"
          title="검색"
          className="w-full flex items-center justify-center py-2 rounded-lg text-[#555] hover:bg-[#f5f5f5] hover:text-[#111] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-lime)] focus-visible:ring-offset-1"
        >
          <Search size={18} strokeWidth={1.9} />
        </button>
      ) : (
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="회원·공지·정산 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            className="w-full pl-8 pr-12 py-1.5 text-[12.5px] bg-[#fafafa] border border-[#f0f0f0] rounded-lg focus:outline-none focus:border-[#e5e5e5] focus:bg-white transition-all placeholder:text-[#bbb]"
            aria-label="전역 검색"
          />
          <kbd className="hidden xl:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[9.5px] font-mono text-[#bbb] bg-white border border-[#f0f0f0] px-1 py-0.5 rounded pointer-events-none">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="검색 범위"
          className={`absolute z-50 bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden animate-[fadeInDown_150ms_ease-out] ${
            collapsed
              ? 'left-full top-0 ml-2 w-[280px]'
              : 'left-0 right-0 top-full mt-2'
          }`}
        >
          {collapsed && (
            <div className="px-4 py-2.5 border-b border-[#f0f0f0]">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  autoFocus
                  placeholder="회원·공지·정산 검색..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 text-[12.5px] bg-[#fafafa] border border-[#f0f0f0] rounded-lg focus:outline-none focus:border-[#e5e5e5] focus:bg-white transition-all placeholder:text-[#bbb]"
                />
              </div>
            </div>
          )}

          <div className="px-5 py-3 border-b border-[#f0f0f0]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#999]">
              검색 범위
            </p>
          </div>

          <div className="py-2">
            <SearchScope Icon={Users} label="회원" description="이름·전화번호" />
            <SearchScope Icon={Megaphone} label="공지" description="제목·본문" />
            <SearchScope Icon={Wallet} label="정산" description="회비·셔틀콕비" />
          </div>

          <div className="px-5 py-3 border-t border-[#f0f0f0] bg-[#fafafa]">
            <p className="text-[11px] text-[#999] leading-relaxed">
              전역 검색은 <strong className="text-[#555]">Phase 2</strong>에서 구현됩니다.
              당장은 각 페이지에서 검색해 주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchScope({
  Icon,
  label,
  description,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-2 opacity-60">
      <div className="w-7 h-7 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#555]">
        <Icon size={13} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-semibold text-[#111]">{label}</p>
        <p className="text-[10.5px] text-[#999]">{description}</p>
      </div>
    </div>
  )
}
