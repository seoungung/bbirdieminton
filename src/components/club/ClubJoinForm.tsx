'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinClubAction } from '@/app/club/join/actions'

export function ClubJoinForm({ clubUserId: _ }: { clubUserId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set('invite_code', code)

    startTransition(async () => {
      const result = await joinClubAction(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="XXXXXXXX"
        maxLength={8}
        className="w-full border border-[#e5e5e5] rounded-xl px-4 py-4 text-center text-2xl font-mono font-bold tracking-widest text-[#111] placeholder:text-[#ddd] focus:outline-none focus:border-[#beff00] bg-white transition-colors uppercase"
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl text-center">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm rounded-xl hover:bg-[#f8f8f8] transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending || code.length !== 8}
          className="flex-1 py-3.5 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
        >
          {isPending ? '확인 중...' : '참여하기'}
        </button>
      </div>
    </form>
  )
}
