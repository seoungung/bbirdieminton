import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { ChevronRight, User, Bookmark, Trophy, Settings } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '마이페이지 | 버디민턴',
}

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '배린이'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-xl mx-auto px-4 py-10">

        {/* 프로필 헤더 */}
        <div className="flex items-center gap-4 mb-8 p-5 bg-[#1a1a1a] border border-white/8 rounded-2xl">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#beff00]/20 border border-[#beff00]/30 flex items-center justify-center">
              <User size={24} className="text-[#beff00]" />
            </div>
          )}
          <div>
            <p className="font-bold text-white text-lg">{displayName}</p>
            <p className="text-sm text-white/40">{user.email}</p>
          </div>
        </div>

        {/* 메뉴 목록 */}
        <div className="space-y-2 mb-8">
          {[
            { icon: Trophy, label: '레벨 테스트 결과', href: '/quiz', desc: '내 배드민턴 레벨 확인하기' },
            { icon: Bookmark, label: '관심 라켓', href: '/rackets', desc: '준비 중이에요' },
            { icon: Settings, label: '계정 설정', href: '#', desc: '준비 중이에요' },
          ].map(({ icon: Icon, label, href, desc }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-white/8 rounded-2xl hover:border-white/15 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-white/50 group-hover:text-white/80 transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
            </Link>
          ))}
        </div>

        {/* 로그아웃 */}
        <LogoutButton />
      </div>
    </div>
  )
}
