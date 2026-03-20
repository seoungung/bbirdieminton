'use client'

import { useState } from 'react'
import { useQuizStore } from '@/stores/quiz-store'

interface QuizSqueezeProps {
  level: string
  levelLabel: string
  stibeeTag: string
  onUnlock: () => void
}

export function QuizSqueeze({ level, levelLabel, stibeeTag, onUnlock }: QuizSqueezeProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const gender = useQuizStore((s) => s.gender)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { setError('올바른 이메일을 입력해 주세요.'); return }
    setLoading(true)
    setError('')
    try {
      await fetch('/api/quiz-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, level, stibeeTag, gender }),
      })
      onUnlock()
    } catch {
      setError('오류가 발생했어요. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-[#0a0a0a] border border-[#beff00]/30 p-6 my-6">
      <p className="text-[#beff00] text-xs font-bold uppercase tracking-widest mb-2">무료 공개</p>
      <h3 className="text-[17px] font-bold text-white mb-1">
        🎯 {levelLabel}에게 딱 맞는 라켓이 있어요
      </h3>
      <p className="text-white/50 text-sm mb-3 leading-relaxed">
        이메일 하나로 아래 3가지를 무료로 받아보세요
      </p>
      <ul className="text-left text-sm text-white/70 mb-5 space-y-1.5">
        <li className="flex items-start gap-2">
          <span className="text-[#beff00] mt-0.5">✓</span>
          <span>내 레벨에 딱 맞는 <strong className="text-white">추천 라켓 3종</strong> (무게·밸런스·강성 분석 포함)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#beff00] mt-0.5">✓</span>
          <span>배린이가 흔히 하는 <strong className="text-white">라켓 구매 실수 Top 5</strong></span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#beff00] mt-0.5">✓</span>
          <span>다음 레벨까지 <strong className="text-white">업그레이드 로드맵</strong></span>
        </li>
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소 입력"
          required
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 text-sm outline-none focus:border-[#beff00]/60 transition-colors"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#beff00] text-black font-extrabold text-sm rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? '처리 중...' : '지금 무료로 확인하기'}
        </button>
      </form>

      <p className="text-center text-white/25 text-xs mt-3">
        ✓ 스팸 없음 &nbsp; ✓ 언제든 구독 취소 가능
      </p>
    </div>
  )
}
