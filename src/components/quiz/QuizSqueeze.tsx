'use client'

import { useState, useTransition } from 'react'
import { Mail, ArrowRight } from 'lucide-react'

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
    <div className="relative">
      {/* 블러 미리보기 배경 */}
      <div className="absolute inset-0 backdrop-blur-md bg-[#0a0a0a]/60 rounded-2xl z-0" />

      {/* 폼 카드 */}
      <div className="relative z-10 flex flex-col items-center text-center gap-5 px-6 py-8">
        <div className="w-12 h-12 rounded-2xl bg-[#beff00]/10 border border-[#beff00]/20 flex items-center justify-center">
          <Mail size={22} className="text-[#beff00]" />
        </div>
        <div>
          <p className="text-white font-bold text-lg mb-1">
            내 라켓 조건 + 추천 라켓 보기
          </p>
          <p className="text-white/50 text-sm leading-relaxed">
            이메일 하나로 레벨별 맞춤 라켓 가이드를<br />
            무료로 받아볼 수 있어요.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일 주소 입력"
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#beff00]/50 transition-colors text-center"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#beff00] text-[#0a0a0a] font-bold text-sm rounded-xl hover:brightness-105 transition-all disabled:opacity-60"
          >
            {isPending ? '잠깐만요...' : '결과 전체 보기'}
            {!isPending && <ArrowRight size={15} />}
          </button>
        </form>
        <p className="text-xs text-white/25">스팸 없이 라켓 가이드만 보내드려요</p>
      </div>
    </div>
  )
}
