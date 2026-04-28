import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Section 5 — CTA 재등장.
 *
 * 톤이 "운영자 모집"에서 "함께 즐기자"로 바뀌었으므로
 * secondary CTA는 두지 않는다. 단일 primary CTA만.
 *
 * 마지막 섹션이므로 세로 여백 좀 더 후하게.
 */
export function FinalCTASection() {
  return (
    <section
      aria-labelledby="section-05"
      className="relative overflow-hidden border-t border-[#ebebeb] bg-white"
    >
      {/* 미세한 lime glow — 마지막 마침표 느낌 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(190,255,0,0.18),transparent_65%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[680px] px-6 py-20 sm:py-28">
        {/* 챕터 마커 */}
        <div
          id="section-05"
          className="mb-10 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#999]"
        >
          <span className="font-mono text-[#bbb]">05</span>
          <span className="h-px w-8 bg-[#e5e5e5]" />
          <span className="text-[#555]">시작</span>
        </div>

        {/* CTA — 단일 primary (보조 CTA 없음, 추가 카피 없음) */}
        <Link
          href="/demo"
          className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#beff00] px-8 text-[15px] font-extrabold text-[#0a0a0a] shadow-[0_8px_24px_-12px_rgba(190,255,0,0.6)] transition-all hover:bg-[#a8e600] hover:shadow-[0_10px_28px_-10px_rgba(190,255,0,0.7)] focus:outline-none focus:ring-4 focus:ring-[#beff00]/40 sm:h-[60px] sm:w-auto sm:px-10 sm:text-[16px]"
        >
          30초로 둘러보기
          <ArrowRight
            size={18}
            strokeWidth={2.5}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>

        {/* 안심 신호 반복 */}
        <p className="mt-5 flex items-center gap-1.5 text-[13px] text-[#888] sm:text-[14px]">
          <span aria-hidden className="text-[#10b981]">✓</span>
          가입 X · 카드 X · 30초
        </p>
      </div>
    </section>
  )
}
