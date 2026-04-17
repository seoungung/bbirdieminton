'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

const SLIDES = [
  {
    id: 1,
    badge: '무료',
    badgeColor: 'bg-[#beff00] text-black',
    title: '라켓 고민,\n2분이면 해결돼요',
    desc: '17문항 레벨 테스트로 내 실력을 진단하고\n딱 맞는 라켓 조건을 알아가세요.',
    cta: '무료 레벨 테스트 시작 →',
    href: '/quiz',
    disabled: false,
    bg: 'bg-[#0a0a0a]',
    titleColor: 'text-white',
    descColor: 'text-white/50',
    accent: 'bg-[#beff00]',
    ctaClass: 'bg-[#beff00] text-black hover:brightness-110',
    pattern: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(190,255,0,0.12) 0%, transparent 70%)',
  },
  {
    id: 2,
    badge: '라켓 도감',
    badgeColor: 'bg-white/10 text-white/70',
    title: '쿠팡 후기 말고,\n기준이 있어야죠',
    desc: '100개+ 라켓을 레벨·무게·스펙으로 비교해요.\n"써봐야 안다"는 말, 여기선 필요 없어요.',
    cta: '라켓 도감 보기 →',
    href: '/rackets',
    disabled: false,
    bg: 'bg-[#111111]',
    titleColor: 'text-white',
    descColor: 'text-white/50',
    accent: 'bg-white',
    ctaClass: 'bg-white text-black hover:bg-white/90',
    pattern: 'radial-gradient(ellipse 70% 50% at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)',
  },
  {
    id: 3,
    badge: '준비 중',
    badgeColor: 'bg-white/8 text-white/30',
    title: '첫 체육관,\n당황하지 마세요',
    desc: '배드민턴화, 깃털콕, 클럽 코트 문화...\n아무도 미리 알려주지 않는 것들을 정리하고 있어요.',
    cta: '곧 공개됩니다',
    href: '#',
    disabled: true,
    bg: 'bg-[#1a1a1a]',
    titleColor: 'text-white/40',
    descColor: 'text-white/25',
    accent: 'bg-white/10',
    ctaClass: 'bg-white/8 text-white/25 cursor-not-allowed',
    pattern: 'none',
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 10000)
    return () => clearInterval(timer)
  }, [paused, next])

  const slide = SLIDES[current]

  return (
    <section
      className={`relative overflow-hidden ${slide.bg} transition-colors duration-700`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* \uBC30\uACBD \uADF8\uB77C\uB370\uC774\uC158 \uD328\uD134 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: slide.pattern }}
      />

      <div className="relative z-10 max-w-[1088px] mx-auto px-4 sm:px-8">
        <div className="min-h-[520px] sm:min-h-[600px] flex flex-col justify-center py-20">

          {/* \uBC30\uC9C0 */}
          <div className="mb-6">
            <span className={`inline-block text-[11px] font-bold uppercase tracking-widest rounded-full px-4 py-1.5 ${slide.badgeColor}`}>
              {slide.badge}
            </span>
          </div>

          {/* \uD0C0\uC774\uD2C0 */}
          <h1 className={`text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-5 whitespace-pre-line transition-colors duration-500 ${slide.titleColor}`}>
            {slide.title}
          </h1>

          {/* \uC124\uBA85 */}
          <p className={`text-[15px] sm:text-[17px] leading-relaxed max-w-md mb-10 whitespace-pre-line transition-colors duration-500 ${slide.descColor}`}>
            {slide.desc}
          </p>

          {/* CTA */}
          {slide.disabled ? (
            <button
              disabled
              className={`inline-flex items-center w-fit px-8 py-4 rounded-2xl font-extrabold text-[15px] transition-all ${slide.ctaClass}`}
            >
              {slide.cta}
            </button>
          ) : (
            <Link
              href={slide.href}
              className={`inline-flex items-center w-fit px-8 py-4 rounded-2xl font-extrabold text-[15px] transition-all ${slide.ctaClass}`}
            >
              {slide.cta}
            </Link>
          )}
        </div>
      </div>

      {/* \uC2AC\uB77C\uC774\uB4DC \uBC88\uD638 + \uB3C4\uD2B8 + \uD654\uC0B4\uD45C */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 flex items-center justify-between">

          {/* \uC9C4\uD589 \uB3C4\uD2B8 */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setPaused(true) }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2 bg-[#beff00]'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`\uC2AC\uB77C\uC774\uB4DC ${i + 1}`}
              />
            ))}
          </div>

          {/* \uC2AC\uB77C\uC774\uB4DC \uCE74\uC6B4\uD130 + \uD654\uC0B4\uD45C */}
          <div className="flex items-center gap-3">
            <span className="text-white/25 text-[12px] font-mono">
              {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
            </span>
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"
              aria-label="\uC774\uC804 \uC2AC\uB77C\uC774\uB4DC"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"
              aria-label="\uB2E4\uC74C \uC2AC\uB77C\uC774\uB4DC"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* \uC790\uB3D9\uC7AC\uC0DD \uC9C4\uD589\uBC14 */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
          <div
            key={current}
            className="h-full bg-[#beff00] origin-left"
            style={{ animation: 'progressBar 10s linear forwards' }}
          />
        </div>
      )}
    </section>
  )
}
