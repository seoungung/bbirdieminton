import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Wrench, LayoutDashboard, Users as UsersIcon, Building2, Upload } from 'lucide-react'
import { assertMaster } from '@/lib/auth/master'

export const dynamic = 'force-dynamic'

/**
 * /admin/** — 시스템 마스터 전용 트리.
 *
 * - 비마스터 / 비로그인 진입 시 notFound() — 페이지 존재 자체를 숨김.
 * - 모든 하위 페이지는 service-role admin client 로 데이터 조회 (RLS 우회).
 * - 읽기 전용. form/POST 핸들러 없음.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const guard = await assertMaster()
  if ('error' in guard) {
    // 비로그인이든 비마스터든 동일하게 404 — 존재 자체를 노출 안 함
    notFound()
  }

  const navItems: Array<{ href: string; label: string; Icon: typeof LayoutDashboard }> = [
    { href: '/admin', label: '대시보드', Icon: LayoutDashboard },
    { href: '/admin/clubs', label: '클럽', Icon: Building2 },
    { href: '/admin/users', label: '사용자', Icon: UsersIcon },
    { href: '/admin/imports', label: '임포트 로그', Icon: Upload },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* 빨간 마스터 배너 */}
      <div className="bg-[#b91c1c] text-white">
        <div className="max-w-[1280px] mx-auto px-4 py-2 flex items-center gap-2 text-[12.5px] font-bold">
          <Wrench size={14} strokeWidth={2.4} />
          <span>마스터 모드 — 읽기 전용</span>
          <span className="ml-auto text-[11px] font-medium opacity-80 hidden sm:inline">
            시스템 어드민 전용 페이지입니다. 모든 데이터 변경은 차단됩니다.
          </span>
        </div>
      </div>

      {/* 네비게이션 바 */}
      <nav className="bg-white border-b border-[#e5e5e5] sticky top-0 z-10">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            <Link
              href="/admin"
              className="flex items-center gap-2 pr-4 py-3 mr-2 border-r border-[#f0f0f0] text-[13px] font-bold text-[#0a0a0a] shrink-0"
            >
              <Wrench size={14} strokeWidth={2.4} className="text-[#b91c1c]" />
              <span>버디민턴 어드민</span>
            </Link>
            {navItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-3 text-[13px] font-medium text-[#555] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors shrink-0"
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </Link>
            ))}
            <div className="ml-auto shrink-0">
              <Link
                href="/clubs"
                className="text-[12px] font-medium text-[#999] hover:text-[#555] transition-colors px-3 py-3"
              >
                ← 일반 화면으로
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
