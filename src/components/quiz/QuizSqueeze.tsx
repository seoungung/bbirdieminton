'use client'

import { useState, useTransition } from 'react'
import { ArrowRight } from 'lucide-react'
import { subscribeAndSendWelcome } from '@/app/quiz/actions'

interface Props {
  level: string
  onUnlock: () => void
}

export function QuizSqueeze({ level, onUnlock }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('올바른 이메일을 입력해주세요.')
      return
    }
    setError('')
    startTransition(async () => {
      await subscribeAndSendWelcome(email, level)
      localStorage.setItem('quiz_unlocked', 'true')
      onUnlock()
    })
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 mt-2 shadow-sm">
      {/* 소셜 프루프 */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        <div className="flex -space-x-1.5">
          {['#beff00', '#60a5fa', '#f472b6'].map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white"
              style={{ background: color }}
            />
          ))}
        </div>
        <span className="text-xs text-[#999999]">
          이미 <span className="text-[#111111] font-semibold">2,400+</span>명이 확인했어요
        </span>
      </div>

      <p className="text-center text-base font-bold text-[#111111] mb-1">이메일 하나로 전체 공개</p>
      <p className="text-center text-xs text-[#999999] mb-5">
        스팸 없이 <span className="text-[#111111] font-medium">맞춤 라켓 가이드</span>만 보내드려요
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-[#111111] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#beff00] transition-colors"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#beff00] text-[#111111] font-bold text-sm rounded-xl hover:bg-[#a8e600] transition-all disabled:opacity-60"
        >
          {isPending ? '잠깐만요...' : (
            <>지금 바로 확인하기 <ArrowRight size={15} /></>
          )}
        </button>
      </form>
    </div>
  )
}
