'use client'

import { useState, useTransition } from 'react'
import { joinByInviteCode } from './actions'

interface JoinClientProps {
  code: string
}

export function JoinClient({ code }: JoinClientProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleJoin = () => {
    setError(null)
    startTransition(async () => {
      const result = await joinByInviteCode(code)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleJoin}
        disabled={isPending}
        className="w-full py-3.5 px-6 bg-[#0a0a0a] text-white font-bold text-[15px] rounded-xl hover:bg-[#1a1a1a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? '참여 중...' : '모임 참여하기'}
      </button>
      {error && (
        <p className="text-center text-[13px] text-red-500">{error}</p>
      )}
    </div>
  )
}
