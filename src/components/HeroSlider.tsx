'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

const SLIDES = [
  {
    id: 1,
    badge: '\uBB34\uB8CC',
    badgeColor: 'bg-[#beff00] text-black',
    title: '\uB0B4 \uB808\uBCA8,\n2\uBD84\uB9CC\uC5D0 \uD655\uC778\uD574\uC694',
    desc: '17\uBB38\uD56D \uB808\uBCA8 \uD14C\uC2A4\uD2B8\uB85C \uB531 \uB9DE\uB294 \uB77C\uCF13\uC744\n\uCD94\uCC9C\uBC1B\uC544\uBCF4\uC138\uC694.',
    cta: '\uBB34\uB8CC \uB808\uBCA8 \uD14C\uC2A4\uD2B8 \uC2DC\uC791 \u2192',
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
    badge: '\uB77C\uCF13 \uB3C4\uAC10',
    badgeColor: 'bg-white/10 text-white/70',
    title: '\uBE0C\uB79C\uB4DC\uBCC4 \uB77C\uCF13,\n\uD55C\uB208\uC5D0 \uBE44\uAD50\uD574\uC694',
    desc: '100\uAC1C \uC774\uC0C1\uC758 \uB77C\uCF13\uC744 \uD544\uD130\uB85C \uCC3E\uACE0\n\uC2A4\uD399\uC744 \uB098\uB780\uD788 \uBE44\uAD50\uD574\uBCF4\uC138\uC694.',
    cta: '\uB77C\uCF13 \uB3C4\uAC10 \uBCF4\uAE30 \u2192',
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
    badge: '\uC900\uBE44 \uC911',
    badgeColor: 'bg-white/8 text-white/30',
    title: '\uBC84\uB514\uBBFC\uD134\n\uD65C\uC6A9 \uAC00\uC774\uB4DC',
    desc: '\uBC30\uB4DC\uBBFC\uD134 \uC785\uBB38\uC790\uB97C \uC704\uD55C \uC644\uBCBD\uD55C \uAC00\uC774\uB4DC.\n\uACE7 \uACF5\uAC1C\uB429\uB2C8\uB2E4.',
    cta: '\uACE7 \uACF5\uAC1C\uB429\uB2C8\uB2E4',
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

      <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-8">
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
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 flex items-center justify-between">

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
