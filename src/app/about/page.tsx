import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '버디민턴 소개 | birdieminton',
  description: '배드민턴 입문자를 위한 라켓 정보 플랫폼, 버디민턴을 소개합니다.',
}

const FEATURES = [
  {
    icon: '🏸',
    title: '라켓 도감',
    desc: '브랜드·레벨·플레이 타입별로 라켓을 검색하고 스펙을 비교해보세요. 입문자 눈높이에 맞춘 쉬운 설명으로 정리했어요.',
    href: '/rackets',
    cta: '라켓 둘러보기',
  },
  {
    icon: '📊',
    title: '레벨 테스트',
    desc: '17가지 질문으로 내 배드민턴 레벨을 진단하고, 레벨에 딱 맞는 라켓 추천까지 받아보세요.',
    href: '/quiz',
    cta: '테스트 시작',
  },
  {
    icon: '📖',
    title: '가이드북',
    desc: '라켓 고르는 법부터 첫 체육관 생존 가이드까지. 배린이에게 필요한 정보를 쉽고 빠르게.',
    href: '/guide',
    cta: '준비 중',
  },
]

const LEVELS = [
  { label: '왕초보', desc: '라켓을 처음 잡아보는 분' },
  { label: '초심자', desc: '6개월 미만 입문자' },
  { label: 'D조', desc: '동호회 D급 플레이어' },
  { label: 'C조', desc: '동호회 C급 플레이어' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-[#0a0a0a] pb-24">

      {/* 히어로 */}
      <section className="bg-gradient-to-b from-[#beff00]/15 via-[#beff00]/5 to-white">
        <div className="max-w-[90rem] mx-auto px-4 pt-20 pb-16 text-center">
          <span className="inline-block bg-[#beff00] text-black text-[12px] font-bold uppercase tracking-widest rounded-full px-4 py-1.5 mb-5">
            About Birdieminton
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-5 text-[#0a0a0a]">
            배드민턴,<br />제대로 시작하는 법
          </h1>
          <p className="text-[#6b6b6b] text-[16px] sm:text-lg leading-relaxed max-w-xl mx-auto">
            버디민턴은 배드민턴 입문자(배린이)를 위한 라켓 정보 플랫폼입니다.<br />
            복잡한 스펙을 쉽게 풀어 당신에게 딱 맞는 라켓을 찾아드립니다.
          </p>
        </div>
      </section>

      {/* 구분선 */}
      <div className="max-w-[90rem] mx-auto px-4">
        <div className="border-t border-[#ebebeb]" />
      </div>

      {/* 주요 기능 */}
      <section className="max-w-[90rem] mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-[#0a0a0a]">버디민턴이 제공하는 것</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc, href, cta }) => (
            <div
              key={title}
              className="rounded-2xl bg-[#f7f7f7] border border-[#ebebeb] p-6 flex flex-col hover:border-[#beff00] hover:shadow-sm transition-all"
            >
              <span className="text-3xl mb-4">{icon}</span>
              <h3 className="text-[17px] font-bold mb-2 text-[#0a0a0a]">{title}</h3>
              <p className="text-[#6b6b6b] text-sm leading-relaxed flex-1">{desc}</p>
              <Link
                href={href}
                className="mt-5 text-[13px] font-semibold text-[#0a0a0a] underline underline-offset-4 hover:text-[#6b6b6b] transition-colors"
              >
                {cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 구분선 */}
      <div className="max-w-[90rem] mx-auto px-4">
        <div className="border-t border-[#ebebeb]" />
      </div>

      {/* 타겟 레벨 */}
      <section className="bg-[#f7f7f7] border-t border-[#ebebeb]">
        <div className="max-w-[90rem] mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-3 text-[#0a0a0a]">이런 분들을 위해 만들었어요</h2>
          <p className="text-[#6b6b6b] text-sm text-center mb-10">배드민턴을 막 시작했거나 시작하려는 모든 배린이</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {LEVELS.map(({ label, desc }) => (
              <div
                key={label}
                className="rounded-xl bg-white border border-[#e8e8e8] p-4 text-center hover:border-[#beff00] transition-colors"
              >
                <p className="font-extrabold text-lg mb-1 text-[#0a0a0a]">{label}</p>
                <p className="text-[#6b6b6b] text-xs leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="max-w-[90rem] mx-auto px-4">
        <div className="border-t border-[#ebebeb]" />
      </div>

      {/* CTA */}
      <section className="bg-[#0a0a0a]">
        <div className="max-w-[90rem] mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-white">내 레벨부터 확인해보세요</h2>
          <p className="text-white/40 text-sm mb-8">2분이면 충분해요. 레벨 진단 후 맞춤 라켓을 추천해 드릴게요.</p>
          <Link
            href="/quiz"
            className="inline-block px-8 py-4 bg-[#beff00] text-black font-extrabold text-[15px] rounded-2xl hover:brightness-110 transition-all"
          >
            무료 레벨 테스트 시작하기 →
          </Link>
        </div>
      </section>

    </main>
  )
}
