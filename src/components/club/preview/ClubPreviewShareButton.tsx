'use client'

import { Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Props {
  clubName: string
}

/**
 * 공유 버튼 — 우상단 헤더에서 사용.
 * - Web Share API 지원: navigator.share 호출
 * - 미지원 (대부분 데스크톱): 클립보드 복사 + 토스트
 *
 * 모든 처리는 클라이언트 측. 서버 사이드 렌더 시 토스트 미렌더 안전.
 */
export function ClubPreviewShareButton({ clubName }: Props) {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    const title = `${clubName} | 버디민턴`
    const text = `${clubName} — 배드민턴 모임을 둘러보세요`

    /* 모바일/지원 환경 — Web Share API. 사용자 취소는 throw 되지만 무시. */
    const shareFn = window.navigator.share?.bind(window.navigator)
    if (shareFn) {
      try {
        await shareFn({ title, text, url })
        return
      } catch {
        /* 사용자 취소 또는 미지원 — 폴백으로 진행하지 않고 종료 */
        return
      }
    }

    /* 데스크톱 폴백 — 클립보드 복사 */
    try {
      await window.navigator.clipboard.writeText(url)
      setToast('URL을 복사했어요')
    } catch {
      setToast('공유에 실패했어요')
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={`${clubName} 모임 공유하기`}
        onClick={handleShare}
        className="w-10 h-10 flex items-center justify-center rounded-full text-[#555] hover:bg-[#f5f5f5] transition-colors"
      >
        <Share2 size={20} strokeWidth={2} />
      </button>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0a] text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none"
        >
          {toast}
        </div>
      )}
    </>
  )
}
