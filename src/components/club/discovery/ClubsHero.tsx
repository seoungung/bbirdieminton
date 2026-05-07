import Link from 'next/link'
import { Search, Plus, KeyRound } from 'lucide-react'

export function ClubsHero() {
  return (
    <section className="bg-[var(--color-brand-ink)] px-4 py-8 md:py-12">
      <div className="max-w-[1088px] mx-auto text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            우리 동네 배드민턴 모임을 둘러보세요
          </h1>
          <p className="text-sm md:text-base text-white/70">
            분위기·실력·운영 스타일을 미리 보고 가입을 결정해요.
          </p>
        </div>

        {/* 검색 input — Phase 1 은 시각만 (Phase 3 에서 동작 추가) */}
        <div className="max-w-[640px] mx-auto">
          <div className="relative flex items-center bg-white border border-white/10 rounded-full pl-5 pr-1.5 py-1.5 focus-within:border-[var(--color-brand-lime)] focus-within:ring-2 focus-within:ring-[var(--color-brand-lime)]/30 transition-colors">
            <Search size={18} className="text-[var(--color-brand-text-muted)] shrink-0" strokeWidth={2.2} />
            <input
              type="search"
              placeholder="지역, 클럽명 검색 (예: 관악구, 버디민턴)"
              className="flex-1 px-3 py-2 bg-transparent outline-none text-sm placeholder:text-[var(--color-brand-text-muted)]"
              disabled
              aria-label="모임 검색"
            />
            <button
              type="button"
              disabled
              className="rounded-full bg-[var(--color-brand-lime)] text-[var(--color-brand-ink)] px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              검색
            </button>
          </div>
          <p className="mt-2 text-xs text-white/55">
            검색·필터는 곧 출시됩니다 — 지금은 아래에서 모든 모임을 둘러보세요.
          </p>
        </div>

        {/* 빠른 액션 */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link
            href="/club/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-lime)] text-[var(--color-brand-ink)] px-4 py-2 text-sm font-bold hover:bg-[var(--color-brand-lime-dim)] transition-colors"
          >
            <Plus size={14} strokeWidth={2.6} />
            모임 만들기
          </Link>
          <Link
            href="/club/join"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 text-white px-4 py-2 text-sm font-bold hover:bg-white/10 transition-colors"
          >
            <KeyRound size={14} strokeWidth={2.4} />
            초대코드
          </Link>
        </div>
      </div>
    </section>
  )
}
