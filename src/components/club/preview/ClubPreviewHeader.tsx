'use client'

import { Heart, MoreHorizontal, Share2, Link as LinkIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BackButton } from '@/components/club/BackButton'

interface Props {
  name: string
}

/**
 * 비멤버 미리보기 페이지의 sticky 상단 헤더.
 * 좌: 뒤로가기 / 중: 클럽명(truncate) / 우: 찜·메뉴
 *
 * 메뉴(...) — 공유하기 / 링크 복사
 * 찜(♡) — 향후 phase 자리 (현재는 시각만)
 *
 * BackButton 은 기본적으로 lg:hidden 이라 데스크톱에서 사라짐.
 * preview 페이지는 AppShell 외부이므로 데스크톱에서도 BackButton 노출 필요 →
 * className 명시적으로 넘겨서 lg:hidden 무력화.
 */
export function ClubPreviewHeader({ name }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  const handleShare = async () => {
    setMenuOpen(false)
    if (typeof window === 'undefined') return
    const url = window.location.href

    // Web Share API 시도 (모바일 위주)
    const shareFn = window.navigator.share?.bind(window.navigator)
    if (shareFn) {
      try {
        await shareFn({ title: name, url })
      } catch {
        // 사용자 취소 또는 미지원 — 무시
      }
      return
    }

    // 데스크톱 폴백 — 링크 복사
    try {
      await window.navigator.clipboard.writeText(url)
      showToast('링크가 복사됐어요')
    } catch {
      showToast('공유에 실패했어요')
    }
  }

  const handleCopyLink = async () => {
    setMenuOpen(false)
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('링크가 복사됐어요')
    } catch {
      showToast('복사에 실패했어요')
    }
  }

  return (
    /**
     * SaaSShell 헤더(top-0 z-30 h-14) 아래에 위치하는 sub-header.
     * → top-14 (SaaSShell header 높이만큼) z-20 으로 stacking 조정.
     */
    <header className="sticky top-14 z-20 bg-white/95 backdrop-blur-sm border-b border-[#f0f0f0] h-14 flex items-center">
      <div className="max-w-[720px] w-full mx-auto px-3 flex items-center gap-2">
        <BackButton
          fallback="/club/home"
          className="flex items-center justify-center w-10 h-10 -ml-1 rounded-full text-[#222] hover:bg-[#f5f5f5] transition-colors"
        />
        <h1 className="flex-1 min-w-0 text-base font-bold text-[#111] truncate">
          {name}
        </h1>
        <button
          type="button"
          aria-label="찜하기"
          aria-disabled
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#999] hover:bg-[#f5f5f5] transition-colors cursor-default"
          tabIndex={-1}
        >
          <Heart size={20} strokeWidth={2} />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="더보기"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen(o => !o)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#555] hover:bg-[#f5f5f5] transition-colors"
          >
            <MoreHorizontal size={20} strokeWidth={2} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute top-full right-0 mt-1.5 w-44 bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden z-50"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleShare}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-[#111] hover:bg-[#f8f8f8] transition-colors"
              >
                <Share2 size={14} strokeWidth={2} className="text-[#555]" />
                공유하기
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-[#111] hover:bg-[#f8f8f8] transition-colors border-t border-[#f5f5f5]"
              >
                <LinkIcon size={14} strokeWidth={2} className="text-[#555]" />
                링크 복사
              </button>
            </div>
          )}
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0a] text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}
    </header>
  )
}
