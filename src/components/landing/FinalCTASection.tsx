import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Final CTA — 블랙 마침표.
 *
 * Hero에서 시작한 블랙 톤을 페이지 끝에서 다시 한 번 (수미상관).
 * 단일 lime primary CTA만.
 */
export function FinalCTASection() {
  return (
    <section
      aria-labelledby="section-cta"
      className="relative overflow-hidden bg-[#0a0a0a] text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(190,255,0,0.20),transparent_65%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[720px] px-6 py-24 sm:py-32 text-center">
        <p
          id="section-cta"
          className="mb-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60"
        >
          Start here
        </p>

        <h2
          className="mb-10 text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-white sm:text-[40px] sm:leading-[1.12]"
          style={{ wordBreak: 'keep-all' }}
        >
          이번 주말 모임에서,
          <br />
          매칭 30분이 10초가 됩니다.
        </h2>

        <Link
          href="/login?next=%2Fclub%2Fcreate"
          className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand-lime)] px-8 text-[15px] font-extrabold text-[#0a0a0a] shadow-[0_12px_32px_-10px_rgba(219,230,76,0.45)] transition-all hover:bg-[var(--color-brand-lime-dim)] hover:shadow-[0_14px_36px_-8px_rgba(219,230,76,0.55)] focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-lime)]/40 sm:h-[60px] sm:w-auto sm:px-10 sm:text-[16px]"
        >
          1분 안에 직접 만들어보세요
          <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
        </Link>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[13px] text-white/40 sm:text-[14px]">
          <span aria-hidden className="text-[var(--color-brand-lime)]">✓</span>
          가입 X · 카드 X · 1분
        </p>
      </div>
    </section>
  )
}
