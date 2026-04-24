'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, Users, Megaphone, Wallet } from 'lucide-react'

interface Props {
  /** 데스크톱 기본 너비. 헤더 좌측에 고정 */
  className?: string
}

/**
 * 전역 검색 바 (클럽 앱)
 *
 * 범위: 회원 + 공지 + 정산
 *
 * Phase 1: placeholder — 포커스 시 안내 드롭다운만 표시.
 * Phase 2: 실제 검색 API 연결.
 */
export function AppSearchBar({ className }: Props) {
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
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb]"
          strokeWidth={2}
        />
        <input
          type="text"
          placeholder="회원·공지·정산 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-full pl-9 pr-16 py-2 text-[13px] bg-[#fafafa] border border-[#f0f0f0] rounded-lg focus:outline-none focus:border-[#e5e5e5] focus:bg-white transition-all placeholder:text-[#bbb]"
        />
        <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] font-mono text-[#bbb] bg-white border border-[#f0f0f0] px-1.5 py-0.5 rounded">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden z-50 animate-[fadeInDown_150ms_ease-out]">
          <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
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
              🔨 전역 검색은 <strong className="text-[#555]">Phase 2</strong>에서 구현됩니다.
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
    <div className="flex items-center gap-3 px-5 py-2.5 opacity-60">
      <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#555]">
        <Icon size={14} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#111]">{label}</p>
        <p className="text-[11px] text-[#999]">{description}</p>
      </div>
    </div>
  )
}
