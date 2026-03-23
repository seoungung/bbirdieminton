'use client'

import { useState, useTransition } from 'react'
import { ArrowRight } from 'lucide-react'

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
      try {
        // Supabase에 이메일 + 레벨 저장
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        await supabase.from('subscribers').upsert(
          { email, level, source: 'quiz' },
          { onConflict: 'email' }
        )
      } catch {
        // 저장 실패해도 unlock은 진행
      }
      // localStorage에 unlock 저장
      localStorage.setItem('quiz_unlocked', 'true')
      onUnlock()
    })
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mt-2">
      {/* 소셜 프루프 */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        <div className="flex -space-x-1.5">
          {['#beff00', '#60a5fa', '#f472b6'].map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-[#1a1a1a]"
              style={{ background: color }}
            />
          ))}
        </div>
        <span className="text-xs text-white/40">
          이미 <span className="text-white/70 font-semibold">2,400+</span>명이 확인했어요
        </span>
      </div>

      <p className="text-center text-base font-bold text-white mb-1">이메일 하나로 전체 공개</p>
      <p className="text-center text-xs text-white/40 mb-5">스팸 없이 라켓 가이드만 보내드려요</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#beff00]/50 transition-colors"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#beff00] text-[#0a0a0a] font-bold text-sm rounded-xl hover:brightness-105 transition-all disabled:opacity-60"
        >
          {isPending ? '잠깐만요...' : '지금 바로 확인하기 →'}
          {!isPending && <ArrowRight size={15} />}
        </button>
      </form>
    </div>
  )
}
