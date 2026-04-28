'use client'

import { Heart, MoreHorizontal } from 'lucide-react'
import { BackButton } from '@/components/club/BackButton'

interface Props {
  name: string
}

/**
 * 비멤버 미리보기 페이지의 sticky 상단 헤더.
 * 좌: 뒤로가기 / 중: 클럽명(truncate) / 우: 찜·메뉴 (시각만, 향후 phase 자리)
 *
 * BackButton 은 기본적으로 lg:hidden 이라 데스크톱에서 사라짐.
 * preview 페이지는 AppShell 외부이므로 데스크톱에서도 BackButton 노출 필요 →
 * className 명시적으로 넘겨서 lg:hidden 무력화.
 */
export function ClubPreviewHeader({ name }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#f0f0f0] h-14 flex items-center">
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
        <button
          type="button"
          aria-label="더보기"
          aria-disabled
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#999] hover:bg-[#f5f5f5] transition-colors cursor-default"
          tabIndex={-1}
        >
          <MoreHorizontal size={20} strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}
