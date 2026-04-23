import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Gamepad2, Wallet, Trophy, Check } from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'

export const metadata: Metadata = {
  title: 'Birdieminton | 배드민턴 동호회 운영 플랫폼',
  description:
    '게임보드, 회비 정산, 랭킹, 공지까지. 카톡과 엑셀의 한계를 넘어서는 단 하나의 앱.',
  openGraph: {
    title: 'Birdieminton | 배드민턴 동호회 운영 플랫폼',
    description:
      '게임보드, 회비 정산, 랭킹, 공지까지. 카톡과 엑셀의 한계를 넘어서는 단 하나의 앱.',
  },
}

const CORE_FEATURES = [
  {
    Icon: Gamepad2,
    title: '게임보드',
    desc: '실력 기반 자동 팀 배정 · 현장에서 원탭 진행',
  },
  {
    Icon: Wallet,
    title: '회비 정산',
    desc: '출석 연동 자동 계산 · 독촉 알림 자동화',
  },
  {
    Icon: Trophy,
    title: '랭킹 & 통계',
    desc: '전적·승률 자동 누적 · 시즌 랭킹까지',
  },
]

export default function HomePage() {
  return (
    <main className="bg-white text-[#0a0a0a]">

      {/* ──────────────────────────────────── */}
      {/* [1] HERO (full-screen, center)        */}
      {/* ──────────────────────────────────── */}
      <section className="min-h-[92vh] flex flex-col items-center justify-center px-8 py-20">
        <div className="max-w-[1100px] mx-auto w-full text-center">

          <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#10b981] bg-[#ecfdf5] border border-[#d1fae5] px-3.5 py-1.5 rounded-full mb-10">
            <Check size={13} strokeWidth={3} /> v2.0 베타 · 모든 기능 무료
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[88px] font-extrabold tracking-[-0.03em] leading-[0.95] mb-8">
            동호회 운영,<br />
            <span className="text-[#666]">카톡에서 벗어나세요.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#666] max-w-[560px] mx-auto mb-12 leading-relaxed">
            배드민턴 동호회를 위한 단 하나의 앱.<br />
            게임보드, 회비 정산, 랭킹을 한 곳에서.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/login?next=%2Fclub%2Fhome"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0a0a0a] text-white font-bold text-[15px] rounded-full hover:bg-[#222] transition-colors"
            >
              무료로 시작하기
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-[#0a0a0a] font-bold text-[15px] rounded-full hover:bg-[#f0f0f0] transition-colors"
            >
              자세히 보기
            </Link>
          </div>

          <p className="text-[13px] text-[#999] mt-8">
            카카오 1초 가입 · 설치 없이 바로
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────── */}
      {/* [2] CORE 3 FEATURES                   */}
      {/* ──────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-8 border-t border-[#f0f0f0]">
        <div className="max-w-[1200px] mx-auto">

          <div className="max-w-[720px] mx-auto text-center mb-16">
            <p className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-4">
              CORE
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
              총무의 모든 고민을<br />
              앱 하나로.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {CORE_FEATURES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#f8f8f8] rounded-3xl p-10 border border-[#f0f0f0] hover:border-[#e5e5e5] hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#0a0a0a] mb-5">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-2.5">{title}</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/product"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0a0a0a] hover:gap-2.5 transition-all"
            >
              전체 기능 보기
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── */}
      {/* [3] FINAL CTA — Dark ⚫               */}
      {/* ──────────────────────────────────── */}
      <section className="bg-[#0a0a0a] text-white py-28 sm:py-36 px-8">
        <div className="max-w-[720px] mx-auto text-center">
          <ShuttlecockIcon size={40} className="text-[#beff00] mx-auto mb-6" strokeWidth={1.5} />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
            지금 바로 시작하세요.
          </h2>
          <p className="text-[16px] sm:text-lg text-white/60 mb-10">
            v2.0 베타 기간, 모든 기능이 무료입니다.
          </p>
          <Link
            href="/login?next=%2Fclub%2Fhome"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#beff00] text-[#0a0a0a] font-extrabold text-[16px] rounded-full hover:bg-[#a8e600] transition-colors"
          >
            무료로 시작하기
            <ArrowRight size={18} />
          </Link>
          <p className="text-[12px] text-white/30 mt-6">
            로그인 없이 먼저 보고 싶다면?{' '}
            <Link href="/demo" className="underline hover:text-white/60">데모 체험하기</Link>
          </p>
        </div>
      </section>

    </main>
  )
}
