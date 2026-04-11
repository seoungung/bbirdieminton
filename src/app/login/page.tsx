import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 | 버디민턴',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  const { next } = await searchParams

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6">
            <Image src="/textlogo_width_birdieminton-white.png" alt="birdieminton" width={150} height={32} className="object-contain h-8 w-auto" unoptimized />
          </Link>
          <h1 className="text-[22px] font-bold text-white tracking-[-0.02em]">시작하기</h1>
          <p className="text-sm text-white/40 mt-1">배드민턴 라켓 도감 · 레벨 테스트</p>
        </div>

        {/* 폼 */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-6">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  )
}
