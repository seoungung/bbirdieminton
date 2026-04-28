import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Above-the-fold Hero.
 *
 * 한국어 raw 1인칭 톤. 영문 마케팅 카피 톤이 아니라
 * 짧은 시 한 편처럼 한 줄씩 끊어 읽히도록 leading 조정.
 *
 * - 헤드라인: 3줄 큰 글씨 (최종 줄에 미세한 lime 언더라인)
 * - 부제: italic, em-dash로 시작하는 인용 톤
 * - 단일 primary CTA — lime, 모바일은 풀 width
 * - 안심 신호: 작게, 회색
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-[#ebebeb] bg-[#fafafa]"
    >
      {/* 배경 — 종이 텍스처 느낌의 옅은 그라데이션 (한쪽 코너) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(190,255,0,0.18),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.10),transparent_70%)] blur-2xl"
      />

      <div className="relative mx-auto flex max-w-[680px] flex-col px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* 작은 마커 — 시작점을 표시 */}
        <div className="mb-10 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#777]">
          <span
            aria-hidden
            className="inline-block h-[6px] w-[6px] rounded-full bg-[#beff00] ring-2 ring-[#beff00]/30"
          />
          <span>버디민턴 · 동호인이 만든 운영 도구</span>
        </div>

        {/* 헤드라인 */}
        <h1
          id="hero-heading"
          className="text-[32px] font-extrabold leading-[1.18] tracking-[-0.02em] text-[#0a0a0a] sm:text-[52px] sm:leading-[1.12]"
          style={{ wordBreak: 'keep-all' }}
        >
          <span className="block">인원, 매칭, 운영까지</span>
          <span className="block">혼자 책임지지 마세요.</span>
          <span className="relative inline-block">
            도구가 따로 있습니다.
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1 h-[10px] -z-10 bg-[#beff00]/45 sm:-bottom-1.5 sm:h-[14px]"
            />
          </span>
        </h1>

        {/* 부제 — italic, 인용 느낌 */}
        <p
          className="mt-8 text-[15px] italic leading-[1.7] text-[#666] sm:text-[17px]"
          style={{ wordBreak: 'keep-all' }}
        >
          — 동호인이 만들고, 만든 사람이 첫 사용자입니다.
        </p>

        {/* CTA — 단일 lime */}
        <div className="mt-12">
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

          {/* 안심 신호 */}
          <p className="mt-5 flex items-center gap-1.5 text-[13px] text-[#888] sm:text-[14px]">
            <span aria-hidden className="text-[#10b981]">✓</span>
            가입 X · 카드 X · 30초
          </p>
        </div>
      </div>

      {/* 하단 미세한 스크롤 힌트 — 스토리로 이어진다는 신호 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto hidden max-w-[680px] px-6 sm:block"
      >
        <div className="flex justify-center pb-6">
          <div className="h-8 w-px bg-gradient-to-b from-transparent to-[#d4d4d4]" />
        </div>
      </div>
    </section>
  )
}
