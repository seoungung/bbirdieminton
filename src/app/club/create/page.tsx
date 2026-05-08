import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { ClubCreateForm } from '@/components/club/ClubCreateForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '모임 만들기 | 버디민턴', description: '새로운 배드민턴 동호회 모임을 만들어보세요' }

export default async function ClubCreatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  return (
    <div>
      {/* ── 다크 헤더 — /clubs Hero 패턴 매칭 ── */}
      <section className="bg-[var(--color-brand-ink)] px-4 py-8 md:py-12">
        <div className="max-w-[1088px] mx-auto text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            동호회 정보를 입력해 시작하세요
          </h1>
          <p className="text-sm md:text-base text-white/70">
            이름·지역·종목만 있으면 바로 모임을 만들 수 있어요.
          </p>
        </div>
      </section>

      {/* ── 폼 본문 ── */}
      <main className="max-w-[1088px] mx-auto px-4 py-8">
        <ClubCreateForm clubUserId={clubUserId} />
      </main>
    </div>
  )
}
