'use client'

import { useTransition } from 'react'
import { loginWithKakao } from '@/app/login/actions'

interface KakaoLoginButtonProps {
  next?: string
}

export function KakaoLoginButton({ next }: KakaoLoginButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleLogin = () => {
    startTransition(async () => {
      await loginWithKakao(next)
    })
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-bold text-[15px] bg-[#FEE500] text-[#191919] hover:bg-[#F7DC00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {/* 카카오 말풍선 SVG 아이콘 */}
      <svg width="20" height="19" viewBox="0 0 20 19" fill="none" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 0C4.477 0 0 3.582 0 8c0 2.898 1.753 5.437 4.399 6.898-.165.618-.636 2.24-.73 2.588-.114.431.157.426.332.31.137-.092 2.178-1.479 3.061-2.08.3.042.607.064.938.064 5.523 0 10-3.582 10-8S15.523 0 10 0z"
          fill="#191919"
        />
      </svg>
      {isPending ? '로그인 중...' : '카카오로 시작하기'}
    </button>
  )
}
