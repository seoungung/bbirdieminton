'use client'

import { useState } from 'react'

interface EmailSqueezeFormProps {
  level: string
  onUnlock: () => void
}

export function EmailSqueezeForm({ level, onUnlock }: EmailSqueezeFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요')
      return
    }
    setLoading(true)
    setError('')
    try {
      // TODO: Stibee API 연동
      await new Promise(resolve => setTimeout(resolve, 800)) // mock
      setDone(true)
      setTimeout(() => onUnlock(), 300)
    } catch {
      setError('잠시 후 다시 시도해주세요')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-12 h-12 rounded-full bg-[#beff00]/20 flex items-center justify-center">
          <span className="text-2xl">&#127881;</span>
        </div>
        <p className="text-white font-semibold">결과를 공개합니다!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-white/60 text-center leading-relaxed">
        이메일로 <span className="text-[#beff00] font-semibold">{level} 맞춤 라켓 가이드</span>를<br />
        무료로 받아보세요
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일 주소 입력"
          className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#beff00]/50 transition-colors"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-[#beff00] text-[#0a0a0a] font-bold text-sm rounded-xl hover:brightness-105 transition-all disabled:opacity-50 shrink-0"
        >
          {loading ? '...' : '확인'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      <p className="text-xs text-white/30 text-center">
        스팸 없음. 언제든 수신 거부 가능.
      </p>
    </form>
  )
}
