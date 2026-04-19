'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  /** 브라우저 히스토리가 없거나 외부에서 직접 접근 시 이동할 경로 */
  fallback: string
  /** 버튼 레이블 (기본값: 없음, 아이콘만) */
  label?: string
  className?: string
}

/**
 * 스마트 뒤로가기 버튼
 *
 * - 이전 페이지가 같은 도메인이면 → router.back() (실제 히스토리 이동)
 * - 직접 URL 입력 or 외부에서 진입이면 → fallback 경로로 이동
 */
export function BackButton({ fallback, label, className }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    const isFromSameOrigin =
      typeof document !== 'undefined' &&
      document.referrer &&
      document.referrer.startsWith(window.location.origin)

    if (isFromSameOrigin) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={
        className ??
        'flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors'
      }
      aria-label="뒤로 가기"
    >
      <ArrowLeft size={18} />
      {label && <span className="text-sm">{label}</span>}
    </button>
  )
}
