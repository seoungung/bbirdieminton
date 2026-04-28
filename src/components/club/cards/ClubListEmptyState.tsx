'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

interface ClubListEmptyStateProps {
  icon: React.ReactNode
  title: string
  desc: string
  onCreateClick?: (e: React.MouseEvent) => void
  showActions?: boolean
}

/**
 * 탭 내 빈 상태 컴포넌트.
 * showActions=true 시 "모임 만들기" + "초대코드 입력" CTA 표시.
 */
export function ClubListEmptyState({
  icon,
  title,
  desc,
  onCreateClick,
  showActions,
}: ClubListEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#f8f8f8] mb-5">
        {icon}
      </div>
      <p className="font-bold text-[#111] text-xl mb-2">{title}</p>
      <p className="text-sm text-[#999] mb-7 max-w-xs leading-relaxed">{desc}</p>
      {showActions && (
        <div className="flex gap-3">
          <Link
            href="/club/create"
            onClick={onCreateClick}
            className="px-5 py-2.5 bg-[#beff00] text-[#111] font-semibold text-sm rounded-xl hover:brightness-95 transition-all inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            모임 만들기
          </Link>
          <Link
            href="/club/join"
            className="px-5 py-2.5 bg-white border border-[#e5e5e5] text-[#111] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-all"
          >
            초대코드 입력
          </Link>
        </div>
      )}
    </div>
  )
}
