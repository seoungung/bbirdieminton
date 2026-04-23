import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: '블로그 | 버디민턴',
  description: '배드민턴 동호회 운영 팁, 제품 업데이트, 배드민턴 문화 이야기.',
}

export default function BlogPage() {
  return (
    <main className="bg-white text-[#0a0a0a]">
      <section className="py-16 sm:py-24 px-8 border-b border-[#f0f0f0]">
        <div className="max-w-[720px] mx-auto text-center">
          <p className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-4">
            BLOG
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5">
            동호회 이야기,<br />곧 시작됩니다.
          </h1>
          <p className="text-[16px] text-[#666] leading-relaxed">
            배드민턴 동호회 운영의 모든 것을 다루는 공간이 준비 중입니다.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 px-8">
        <div className="max-w-[640px] mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f8f8f8] border border-[#e5e5e5] mb-6">
            <BookOpen size={28} className="text-[#999]" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111] mb-4">
            준비 중입니다
          </h2>
          <p className="text-[15px] text-[#666] leading-relaxed mb-10">
            아래 주제로 콘텐츠가 준비되고 있어요.<br />
            첫 글이 발행되면 이메일로 알려드릴까요?
          </p>

          {/* 예정 주제 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-12">
            {[
              '총무가 꼭 알아야 할 회비 정산 꿀팁',
              '첫 동호회 만들기 가이드',
              '엑셀 지옥에서 탈출하는 법',
              '공정한 팀 배정, 어떻게 할까?',
              '신입 회원 온보딩 체크리스트',
              '카톡방을 깔끔하게 운영하는 법',
            ].map((title) => (
              <div
                key={title}
                className="bg-[#f8f8f8] rounded-2xl border border-[#f0f0f0] px-5 py-4"
              >
                <p className="text-[14px] font-semibold text-[#333]">{title}</p>
                <p className="text-[11px] text-[#999] mt-1">준비 중</p>
              </div>
            ))}
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0a0a0a] hover:gap-2.5 transition-all"
          >
            블로그 오픈 알림 받기 →
          </Link>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="bg-[#0a0a0a] text-white py-16 px-8">
        <div className="max-w-[640px] mx-auto text-center">
          <p className="text-[15px] text-white/60 mb-6">
            기다리는 동안, 서비스를 먼저 체험해보세요.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#beff00] text-[#0a0a0a] font-extrabold text-[13px] rounded-full hover:bg-[#a8e600] transition-colors"
          >
            데모 체험하기
          </Link>
        </div>
      </section>
    </main>
  )
}
