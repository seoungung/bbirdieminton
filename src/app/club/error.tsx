'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function ClubError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div role="alert" className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-5">
      <div className="text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <p className="text-xl font-extrabold text-[#111] mb-2">문제가 발생했어요</p>
        <p className="text-sm text-[#999] mb-6">{error.message || '잠시 후 다시 시도해주세요'}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-5 py-2.5 bg-[#beff00] text-[#111] font-bold rounded-xl text-sm hover:brightness-95">다시 시도</button>
          <Link href="/club/home" className="px-5 py-2.5 bg-[#f0f0f0] text-[#555] font-semibold rounded-xl text-sm hover:bg-[#e5e5e5]">홈으로</Link>
        </div>
      </div>
    </div>
  )
}
