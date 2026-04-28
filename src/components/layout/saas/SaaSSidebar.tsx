import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Plus, KeyRound, BookOpen, Newspaper } from 'lucide-react'
import { SaaSClubList, type SaaSClubItem } from './SaaSClubList'

interface Props {
  myClubs: SaaSClubItem[]
  user: { name: string; email: string; avatarUrl: string | null } | null
  onNavigate?: () => void
}

/**
 * SaaSShell 사이드바 (260px, AppShell과 동일 사이즈/스타일)
 *
 * 구성:
 *  ① 로고
 *  ② "내 모임" 섹션 — 본인 가입 클럽 리스트 (또는 빈 상태)
 *  ③ 액션 — "+ 새 모임 만들기" (lime CTA) / "초대코드 입력"
 *  ④ "리소스" 섹션 — 사용설명서 / 블로그
 *  ⑤ 하단 사용자 미니카드
 */
export function SaaSSidebar({ myClubs, user, onNavigate }: Props) {
  const pathname = usePathname() ?? ''

  const resources = [
    { href: '/manual', label: '사용설명서', Icon: BookOpen },
    { href: '/blog', label: '블로그', Icon: Newspaper },
  ]

  const isResourceActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* ① 로고 */}
      <div className="px-4 pt-5 pb-3">
        <Link
          href="/club/home"
          onClick={onNavigate}
          className="inline-flex items-center hover:opacity-80 transition-opacity"
        >
          <Image
            src="/textlogo_height_birdieminton-black.png"
            alt="버디민턴"
            width={120}
            height={28}
            priority
            className="h-6 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {/* ② 내 모임 */}
        <div className="px-3 mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">
            내 모임
          </p>
          {myClubs.length > 0 && (
            <span className="text-[10px] font-bold text-[#bbb] tabular-nums">
              {myClubs.length}
            </span>
          )}
        </div>
        <SaaSClubList clubs={myClubs} onNavigate={onNavigate} />

        {/* ③ 액션 — 새 모임 / 초대코드 */}
        <div className="px-3 mt-3 space-y-1.5">
          <Link
            href="/club/create"
            onClick={onNavigate}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#beff00] text-[#0a0a0a] text-[13px] font-extrabold hover:bg-[#a8e600] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-1"
          >
            <Plus size={14} strokeWidth={2.7} />
            새 모임 만들기
          </Link>
          <Link
            href="/club/join"
            onClick={onNavigate}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-[#111] text-[13px] font-bold hover:bg-[#fafafa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-1"
          >
            <KeyRound size={13} strokeWidth={2.4} className="text-[#555]" />
            초대코드 입력
          </Link>
        </div>

        {/* ④ 리소스 */}
        <div className="mt-7">
          <p className="px-6 mb-2 text-[11px] font-bold text-[#999] uppercase tracking-widest">
            리소스
          </p>
          <div className="px-3 space-y-0.5">
            {resources.map(({ href, label, Icon }) => {
              const active = isResourceActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                    active
                      ? 'bg-[#f5f5f5] text-[#0a0a0a]'
                      : 'text-[#555] hover:bg-[#fafafa] hover:text-[#111]'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] bg-[#0a0a0a] rounded-r-full" />
                  )}
                  <Icon
                    size={15}
                    strokeWidth={active ? 2.2 : 1.9}
                    className={
                      active ? 'text-[#0a0a0a]' : 'text-[#bbb] group-hover:text-[#555]'
                    }
                  />
                  <span className="flex-1 truncate">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ⑤ 하단 사용자 미니카드 */}
      {user && (
        <div className="border-t border-[#f0f0f0] p-3">
          <Link
            href="/my/profile"
            onClick={onNavigate}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#fafafa] transition-colors"
          >
            <UserAvatar url={user.avatarUrl} name={user.name} />
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold text-[#111] truncate">{user.name}</p>
              <p className="text-[11px] text-[#999] truncate mt-0.5">{user.email}</p>
            </div>
          </Link>
        </div>
      )}
    </>
  )
}

function UserAvatar({ url, name }: { url: string | null; name: string }) {
  const safe = url?.startsWith('http://') ? url.replace(/^http:\/\//, 'https://') : url
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  if (safe) {
    return (
      <Image
        src={safe}
        alt={name}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover shrink-0 border border-[#f0f0f0]"
        unoptimized
      />
    )
  }
  return (
    <div
      className="h-8 w-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center shrink-0 font-bold text-[12px]"
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}
