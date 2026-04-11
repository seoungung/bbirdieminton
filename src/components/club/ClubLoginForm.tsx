'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import {
  clubLoginWithEmail,
  clubSignupWithEmail,
  clubLoginWithGoogle,
} from '@/app/club/login/actions'

type Mode = 'login' | 'signup'

export function ClubLoginForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [showPw, setShowPw] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setMessage(null)
    startTransition(async () => {
      const action = mode === 'login' ? clubLoginWithEmail : clubSignupWithEmail
      const result = await action(formData)
      if (result && 'error' in result && result.error) {
        setMessage({ type: 'error', text: result.error })
      }
      if (result && 'success' in result && result.success) {
        setMessage({ type: 'success', text: result.success })
      }
    })
  }

  const handleGoogle = () => {
    startTransition(async () => {
      await clubLoginWithGoogle()
    })
  }

  const inputClass =
    'w-full border border-[#e5e5e5] rounded-xl px-4 py-3 pl-10 text-[#111] text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors bg-white'

  return (
    <div className="space-y-4">
      {/* 탭 */}
      <div className="flex bg-[#f0f0f0] rounded-xl p-1">
        {(['login', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m)
              setMessage(null)
            }}
            className={
              'flex-1 py-2 text-sm font-semibold rounded-lg transition-all ' +
              (mode === m
                ? 'bg-[#beff00] text-[#111]'
                : 'text-[#999] hover:text-[#111]')
            }
          >
            {m === 'login' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>

      {/* 구글 로그인 */}
      <button
        onClick={handleGoogle}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2.5 py-3 bg-white text-[#111] font-semibold text-sm rounded-xl border border-[#e5e5e5] hover:bg-[#f8f8f8] transition-all disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google로 {mode === 'login' ? '로그인' : '시작하기'}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#e5e5e5]" />
        <span className="text-xs text-[#bbb]">또는 이메일로</span>
        <div className="flex-1 h-px bg-[#e5e5e5]" />
      </div>

      {/* 이메일/비밀번호 폼 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb]" />
          <input
            type="email"
            name="email"
            placeholder="이메일"
            className={inputClass}
            required
          />
        </div>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb]" />
          <input
            type={showPw ? 'text' : 'password'}
            name="password"
            placeholder={mode === 'login' ? '비밀번호' : '비밀번호 (8자 이상)'}
            minLength={8}
            className={inputClass + ' pr-10'}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#555]"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {message && (
          <p
            className={
              'text-xs px-3 py-2 rounded-lg ' +
              (message.type === 'error'
                ? 'bg-red-50 text-red-500'
                : 'bg-green-50 text-green-600')
            }
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
        >
          {isPending ? '...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>
      </form>
    </div>
  )
}
