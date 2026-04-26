import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 | 버디민턴',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { next, error } = await searchParams

  // 이미 로그인된 유저는 대상 경로로 이동
  if (user && !user.is_anonymous) redirect(next ?? '/club/home')

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-16 bg-[#f8f8f8]">
      <div className="w-full max-w-sm">

        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <Image
              src="/symbol_birdieminton-color.png"
              alt="버디민턴"
              width={48}
              height={48}
              priority
              className="h-12 w-auto object-contain"
            />
          </div>
          <h1 className="text-[22px] font-extrabold text-[#111] tracking-tight">버디민턴</h1>
          <p className="text-sm text-[#999] mt-1">배드민턴 동호회 관리 플랫폼</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
          <p className="text-center text-[15px] font-semibold text-[#111] mb-5">
            카카오 계정으로 시작하세요
          </p>

          <KakaoLoginButton next={next} />

          {error && (
            <p className="mt-4 text-center text-[13px] text-red-500">
              로그인에 실패했습니다. 다시 시도해주세요.
            </p>
          )}

          <p className="mt-5 text-center text-[12px] text-[#bbb] leading-relaxed">
            로그인 시 <a href="/terms" className="underline hover:text-[#999]">이용약관</a>과{' '}
            <a href="/privacy" className="underline hover:text-[#999]">개인정보처리방침</a>에 동의합니다.
          </p>
        </div>

        {/* 데모 체험 링크 */}
        <p className="text-center mt-5 text-[13px] text-[#999]">
          로그인 없이 체험하고 싶다면?{' '}
          <a href="/club/demo-1" className="text-[#555] font-semibold hover:text-[#111] transition-colors">
            체험하기
          </a>
        </p>

      </div>
    </div>
  )
}
