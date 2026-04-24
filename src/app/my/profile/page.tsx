import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/my/ProfileForm'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: '내 프로필 | 버디민턴',
  description: '프로필 정보를 관리합니다.',
  robots: { index: false },
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) redirect('/login?next=%2Fmy%2Fprofile')

  const { data: profile } = await supabase
    .from('users')
    .select('name, profile_img')
    .eq('birdieminton_user_id', user.id)
    .single()

  const displayName =
    profile?.name ??
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    '이름없음'

  const avatarUrl =
    (profile?.profile_img as string | null) ??
    (user.user_metadata?.avatar_url as string | undefined) ??
    null

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f8f8f8]">
      <div className="max-w-[560px] mx-auto px-4 py-10 sm:py-16">
        <header className="mb-10">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-2">
            MY ACCOUNT
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111]">내 프로필</h1>
        </header>

        {/* 프로필 카드 */}
        <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6 mb-5">
          <div className="flex items-center gap-4 pb-5 mb-5 border-b border-[#f0f0f0]">
            <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden flex-shrink-0 text-white font-extrabold text-xl">
              {avatarUrl ? (
                <Image
                  src={avatarUrl.startsWith('http://') ? avatarUrl.replace(/^http:\/\//, 'https://') : avatarUrl}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <span>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[17px] text-[#111] truncate">{displayName}</p>
              <p className="text-[13px] text-[#999] truncate flex items-center gap-1 mt-0.5">
                <Mail size={12} />
                {user.email ?? '이메일 없음'}
              </p>
            </div>
          </div>

          <ProfileForm initialName={displayName} />
        </section>

        {/* 빠른 링크 */}
        <section className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden mb-5">
          <Link
            href="/club/home"
            className="block px-6 py-4 text-[14px] font-semibold text-[#111] hover:bg-[#f8f8f8] transition-colors border-b border-[#f0f0f0]"
          >
            내 모임 목록 →
          </Link>
          <Link
            href="/contact"
            className="block px-6 py-4 text-[14px] font-semibold text-[#111] hover:bg-[#f8f8f8] transition-colors"
          >
            문의하기 →
          </Link>
        </section>

        {/* 로그아웃 */}
        <section>
          <LogoutButton />
        </section>

        <p className="text-[12px] text-[#bbb] text-center mt-8 leading-relaxed">
          회원탈퇴는 고객센터로 문의해주세요.<br />
          <Link href="/contact" className="underline hover:text-[#999]">문의하기</Link>
        </p>
      </div>
    </main>
  )
}
