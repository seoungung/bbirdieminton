'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  function handleKakao() {
    window.open(
      `https://story.kakao.com/share?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,width=600,height=400',
    )
  }

  function handleTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,width=600,height=400',
    )
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-[#e5e5e5]">
      <p className="text-sm font-bold text-[#555555] mb-3">이 글이 도움됐다면 공유해보세요</p>
      <div className="flex gap-3 flex-wrap">
        {/* 카카오톡 */}
        <button
          onClick={handleKakao}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FEE500] text-black font-bold text-sm hover:bg-[#F0D800] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.72 2 11.28c0 2.88 1.56 5.44 3.96 7.04L4.8 21.6l4.56-2.4c.84.24 1.72.36 2.64.36 5.52 0 10-3.72 10-8.28C22 6.72 17.52 3 12 3z" />
          </svg>
          카카오톡
        </button>

        {/* X (트위터) */}
        <button
          onClick={handleTwitter}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white font-bold text-sm hover:bg-[#333333] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </button>

        {/* 링크 복사 */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f0f0f0] text-[#111111] font-bold text-sm hover:bg-[#e5e5e5] transition-colors"
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {copied ? '복사됨!' : '링크 복사'}
        </button>
      </div>
    </div>
  )
}
