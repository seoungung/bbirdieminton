'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ShareButtonProps {
  racketName: string
}

export function ShareButton({ racketName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center gap-2 w-full py-2.5 border border-border text-sm text-muted-foreground rounded-xl hover:text-foreground hover:border-foreground/30 transition-all"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-500" />
          링크 복사됨!
        </>
      ) : (
        <>
          <Copy size={14} />
          링크 공유하기
        </>
      )}
    </button>
  )
}
