'use client'

import { useState } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'

interface QuizResultClientProps {
  level: string
  score: number
}

export function ShareSection({ level, score }: QuizResultClientProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API not available
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-sm text-white/60 hover:text-white hover:border-white/30 transition-all"
      >
        {copied ? <Check size={14} className="text-[#beff00]" /> : <Copy size={14} />}
        {copied ? '복사됨!' : '링크 복사'}
      </button>
      <button
        onClick={() => {
          const text = `내 배드민턴 레벨은 "${level}"! 너는? \u2192 birdieminton.com/quiz`
          if (navigator.share) {
            navigator.share({ title: '버디민턴 레벨 테스트', text, url: window.location.href })
          }
        }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-sm text-white/60 hover:text-white hover:border-white/30 transition-all"
      >
        <Share2 size={14} />
        공유
      </button>
    </div>
  )
}
