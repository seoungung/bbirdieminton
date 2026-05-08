import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { ClubCreateForm } from '@/components/club/ClubCreateForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '모임 만들기 | 버디민턴', description: '새로운 배드민턴 동호회 모임을 만들어보세요' }

interface PageProps {
  /* `?demo=1` 로 진입 시 폼은 정상 열리지만 submit 은 차단 — UI 미리보기용 */
  searchParams: Promise<{ demo?: string }>
}

export default async function ClubCreatePage({ searchParams }: PageProps) {
  const params = await searchParams
  const isDemoPreview = params.demo === '1'

  /* 데모 미리보기 모드 — 로그인 검사 우회 (UI 미리보기만 가능, submit 차단됨) */
  let clubUserId = 'demo-preview'
  if (!isDemoPreview) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const realClubUserId = await getClubUserId(supabase)
    if (!realClubUserId) redirect('/login')
    clubUserId = realClubUserId
  }

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

      {/* ── 데모 미리보기 배너 ── */}
      {isDemoPreview && (
        <div className="bg-[var(--color-brand-lime)] px-4 py-2.5 border-b border-[#0a0a0a]/10">
          <div className="max-w-[1088px] mx-auto flex items-center gap-2 text-[12.5px] text-[#0a0a0a]">
            <span className="inline-flex items-center rounded-full bg-[#0a0a0a] text-[var(--color-brand-lime)] px-2 py-0.5 text-[10px] font-bold tracking-wide shrink-0">
              미리보기
            </span>
            <span>
              <strong>체험 모드</strong>입니다. 폼은 그대로 사용해보실 수 있지만,
              <strong> 실제로 모임은 생성되지 않아요.</strong>
            </span>
          </div>
        </div>
      )}

      {/* ── 폼 본문 ── */}
      <main className="max-w-[1088px] mx-auto px-4 py-8">
        <ClubCreateForm clubUserId={clubUserId} isDemoPreview={isDemoPreview} />
      </main>
    </div>
  )
}
