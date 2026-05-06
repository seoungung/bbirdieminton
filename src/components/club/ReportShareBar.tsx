'use client'

import { useState } from 'react'
import { Link2, Printer, Check, MessageCircle } from 'lucide-react'

import { shareToKakao } from '@/lib/kakao/share'

/**
 * 시즌 리포트 sticky 공유/저장 바.
 * 인쇄 시 자동 숨김 (print:hidden).
 */
export function ReportShareBar({
  clubName,
  days,
}: {
  clubName: string
  days: number
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard 권한 거부 등 — 조용히 무시
    }
  }

  const handleKakao = () => {
    if (typeof window === 'undefined') return
    const ogParams = new URLSearchParams({
      title: `${clubName} 시즌 리포트`,
      subtitle: `최근 ${days}일 활동 요약`,
      tag: '시즌 리포트',
    })
    const ok = shareToKakao({
      url: window.location.href,
      title: `${clubName} · 시즌 리포트`,
      description: `최근 ${days}일 활동 요약 — 등급 분포, 변동 Top 5, 출석 챔피언, 회비 납부`,
      imageUrl: `${window.location.origin}/api/og?${ogParams.toString()}`,
      buttonText: '리포트 보기',
    })
    if (!ok) {
      // SDK 미로드/초기화 실패 → 클립보드 fallback
      handleCopy()
    }
  }

  const handlePrint = () => {
    if (typeof window === 'undefined') return
    window.print()
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 print:hidden">
      <div className="flex items-center gap-2 rounded-full bg-[#0a0a0a] px-2 py-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]">
        <span
          className="px-3 text-[11px] font-bold text-white/70 hidden sm:inline"
          aria-hidden
        >
          {clubName} · {days}일 리포트
        </span>
        <button
          onClick={handleKakao}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#fee500] hover:bg-[#fdd835] transition-colors px-4 py-2 text-[12px] font-extrabold text-[#3a1d1d]"
          aria-label="카카오톡 공유"
        >
          <MessageCircle size={13} strokeWidth={2.5} fill="currentColor" />
          카톡 공유
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors px-4 py-2 text-[12px] font-bold text-white"
          aria-label="링크 복사"
        >
          {copied ? <Check size={13} strokeWidth={2.5} /> : <Link2 size={13} strokeWidth={2.5} />}
          {copied ? '복사됨' : '링크 복사'}
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-lime)] hover:bg-[var(--color-brand-lime-dim)] transition-colors px-4 py-2 text-[12px] font-extrabold text-[#0a0a0a]"
          aria-label="PDF 저장 (인쇄)"
        >
          <Printer size={13} strokeWidth={2.5} />
          PDF로 저장
        </button>
      </div>
    </div>
  )
}
