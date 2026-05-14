import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/supabase/server'
import { ClubCreateForm } from '@/components/club/ClubCreateForm'

/**
 * /club/create — 모임 개설 (PRD §3.2)
 *  - 비로그인 → /login 으로 redirect
 *  - 본문은 클라이언트 컴포넌트 ClubCreateForm (3단계 stepper)
 */
export default async function CreateClubPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login?next=/club/create')

  return (
    <main className="min-h-screen bg-beige">
      {/* 상단 헤더 */}
      <header className="border-b border-beige-50 bg-beige/80 backdrop-blur supports-[backdrop-filter]:bg-beige/60">
        <div className="mx-auto max-w-2xl px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-forest transition-colors"
          >
            ← 홈
          </Link>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">
            Create Club
          </div>
          <div className="w-12" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">새 모임 만들기</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            3단계로 모임을 개설합니다. 개설자는 자동으로 운영자가 됩니다.
          </p>
        </div>

        <ClubCreateForm />
      </div>
    </main>
  )
}
