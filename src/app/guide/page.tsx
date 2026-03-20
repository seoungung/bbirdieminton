import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '가이드북 | birdieminton',
  description: '배린이를 위한 배드민턴 가이드북. 준비 중입니다.',
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 pb-24">
      <span className="text-5xl mb-6">📖</span>
      <p className="text-[#beff00] text-[13px] font-bold uppercase tracking-widest mb-3">Coming Soon</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-4">가이드북 준비 중</h1>
      <p className="text-white/40 text-sm text-center leading-relaxed max-w-sm mb-10">
        라켓 고르는 법, 첫 체육관 생존 가이드 등<br />
        배린이에게 꼭 필요한 콘텐츠를 준비하고 있어요.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/rackets"
          className="px-6 py-3 rounded-full border border-white/20 text-[14px] text-white/70 hover:border-white hover:text-white transition-colors text-center"
        >
          라켓 도감 보기
        </Link>
        <Link
          href="/quiz"
          className="px-6 py-3 rounded-full bg-[#beff00] text-black font-bold text-[14px] hover:brightness-110 transition-all text-center"
        >
          레벨 테스트 하기
        </Link>
      </div>
    </main>
  )
}
