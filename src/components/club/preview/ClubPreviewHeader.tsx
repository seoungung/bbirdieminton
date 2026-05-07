'use client'

import { Heart } from 'lucide-react'
import { BackButton } from '@/components/club/BackButton'
import { ClubPreviewShareButton } from './ClubPreviewShareButton'

interface Props {
  name: string
}

/**
 * 비멤버 미리보기 페이지의 sticky 상단 헤더.
 * 좌: 뒤로가기 / 중: 클럽명(truncate) / 우: 찜·공유
 *
 * - 공유 버튼: Web Share API 지원 시 시스템 시트, 미지원 시 클립보드 복사 + 토스트
 * - 찜(♡): 향후 phase 자리 (현재는 시각만)
 *
 * BackButton 은 기본적으로 lg:hidden 이라 데스크톱에서 사라짐.
 * preview 페이지는 AppShell 외부이므로 데스크톱에서도 BackButton 노출 필요 →
 * className 명시적으로 넘겨서 lg:hidden 무력화.
 */
export function ClubPreviewHeader({ name }: Props) {
  return (
    /**
     * SaaSShell 모바일 상단 바(< md, h-14) 아래에 위치하는 sub-header.
     * 데스크톱(md+)에서는 SaaSShell 헤더가 없으므로 top-0,
     * 모바일에서는 top-14 (SaaSShell 모바일 헤더 높이만큼) 으로 stacking 조정.
     */
    <header className="sticky top-14 md:top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#f0f0f0] h-14 flex items-center">
      <div className="max-w-[1088px] w-full mx-auto px-3 flex items-center gap-2">
        <BackButton
          fallback="/clubs"
          className="flex items-center justify-center w-10 h-10 -ml-1 rounded-full text-[#222] hover:bg-[#f5f5f5] transition-colors"
        />
        <h1 className="flex-1 min-w-0 text-base font-bold text-[#111] truncate">
          {name}
        </h1>
        <button
          type="button"
          aria-label="찜하기 (준비 중)"
          aria-disabled
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#999] hover:bg-[#f5f5f5] transition-colors cursor-default"
          tabIndex={-1}
        >
          <Heart size={20} strokeWidth={2} />
        </button>
        <ClubPreviewShareButton clubName={name} />
      </div>
    </header>
  )
}
