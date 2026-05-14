'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LoginButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('카카오 로그인 실패:', error)
      setLoading(false)
    }
    // 성공 시 자동 redirect 됨
  }

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="w-full py-3 px-4 bg-[#FEE500] text-[#000000] font-bold rounded-xl hover:bg-[#FDD835] transition-colors disabled:opacity-50"
    >
      {loading ? '연결 중...' : '🟨 카카오로 시작하기'}
    </button>
  )
}
