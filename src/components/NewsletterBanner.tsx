'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Check } from 'lucide-react'

export function NewsletterBanner() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMsg('구독이 완료됐어요! 새 라켓 소식을 메일로 보내드릴게요 🏸')
      } else {
        setStatus('error')
        setMsg(data.error ?? '오류가 발생했어요.')
      }
    } catch {
      setStatus('error')
      setMsg('네트워크 오류가 발생했어요.')
    }
  }

  return (
    <div className="rounded-2xl bg-black text-white p-6">
      <div className="flex items-start gap-3 mb-4">
        <Mail size={20} className="text-[#BEFF00] shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-[16px] mb-0.5">새 라켓 정보 먼저 받아보세요</h3>
          <p className="text-[13px] text-white/60">
            신제품 출시, 가격 변동, 에디터 추천을 뉴스레터로 받아보세요. 무료예요.
          </p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
          <Check size={16} className="text-[#BEFF00] shrink-0" />
          <p className="text-sm">{msg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일 주소 입력"
            required
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:border-[#BEFF00] transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="shrink-0 bg-[#BEFF00] text-black font-bold text-sm px-4 py-2.5 rounded-xl hover:brightness-110 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {status === 'loading' ? '...' : (
              <>구독 <ArrowRight size={14} /></>
            )}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-2">{msg}</p>
      )}
    </div>
  )
}
