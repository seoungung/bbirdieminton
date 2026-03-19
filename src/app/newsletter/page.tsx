'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check, Rss } from 'lucide-react'

const BENEFITS = [
  '신규 라켓 출시 소식 — 가장 빠르게',
  '에디터 추천 라켓 및 사용 후기',
  '시즌별 라켓 할인·이벤트 정보',
  '배린이를 위한 배드민턴 팁',
]

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      } else {
        setStatus('error')
        setMsg(data.error ?? '오류가 발생했어요.')
      }
    } catch {
      setStatus('error')
      setMsg('네트워크 오류가 발생했어요. 다시 시도해 주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link
          href="/rackets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> 라켓 도감으로
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl mb-4">
            <Rss size={24} className="text-[#BEFF00]" />
          </div>
          <h1 className="text-[26px] font-bold mb-2 tracking-[-0.025em]">
            버드민턴 뉴스레터
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            배드민턴 라켓 정보를 가장 먼저 받아보세요.<br />
            무료로 구독할 수 있어요.
          </p>
        </div>

        {/* 혜택 */}
        <div className="rounded-2xl border border-border p-5 mb-6">
          <h2 className="text-[14px] font-semibold mb-3 text-muted-foreground tracking-wide uppercase">구독하면 받을 수 있는 것들</h2>
          <ul className="space-y-2.5">
            {BENEFITS.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px]">
                <Check size={15} className="text-[#BEFF00] shrink-0 mt-0.5 bg-black rounded-full p-[2px]" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {status === 'success' ? (
          <div className="rounded-2xl bg-black text-white p-6 text-center">
            <div className="text-3xl mb-3">🏸</div>
            <h2 className="font-bold text-lg mb-2">구독 완료!</h2>
            <p className="text-white/70 text-sm">
              곧 첫 번째 뉴스레터를 보내드릴게요.<br />
              스팸함도 한번 확인해 주세요!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
              required
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full h-12 bg-black text-white font-bold text-sm rounded-xl hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Mail size={16} />
              {status === 'loading' ? '구독 중...' : '무료 구독하기'}
            </button>
            {status === 'error' && (
              <p className="text-xs text-red-500 text-center">{msg}</p>
            )}
            <p className="text-xs text-muted-foreground text-center">
              언제든지 구독을 취소할 수 있어요. 스팸 없음.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
