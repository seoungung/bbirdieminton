import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { MANUAL_ENTRIES } from '@/lib/manual/entries'
import { ManualGrid } from '@/components/manual/ManualGrid'

export const metadata: Metadata = {
  title: '사용설명서 | 버디민턴',
  description:
    '버디민턴 SaaS 서비스 사용 가이드. 모임 만들기·게임보드·정산·공지·랭킹·회원관리.',
}

export default function ManualPage() {
  return (
    <main className="bg-white text-[#0a0a0a] min-h-screen">
      {/* 헤더 */}
      <section className="px-8 py-16 sm:py-24 border-b border-[#f0f0f0]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-3">
            MANUAL
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
            사용설명서
          </h1>
          <p className="text-lg text-[#666] max-w-[600px] leading-relaxed">
            버디민턴 사용법을 카테고리별로 안내합니다.
          </p>
        </div>
      </section>

      {/* 카테고리 + 그리드 (클라이언트) */}
      <ManualGrid entries={MANUAL_ENTRIES} />

      {/* 하단 CTA */}
      <section className="bg-[#fafafa] border-t border-[#f0f0f0] px-8 py-16">
        <div className="max-w-[640px] mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-[#111] mb-3">
            바로 사용해 보고 싶으신가요?
          </h2>
          <p className="text-[14px] text-[#666] mb-6">
            로그인 없이 데모 모임을 체험해 볼 수 있습니다.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white font-bold text-[13px] rounded-full hover:bg-[#222] transition-colors"
          >
            체험하기
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  )
}
