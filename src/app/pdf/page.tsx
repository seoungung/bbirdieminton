import type { Metadata } from 'next'
import { BookOpen, CheckCircle2, Star } from 'lucide-react'
import { PdfPaymentClient } from '@/components/payment/PdfPaymentClient'

export const metadata: Metadata = {
  title: '배린이 라켓 완전정복 가이드 | 버디민턴',
  description: '왕초보부터 C조까지, 레벨별 라켓 선택 완벽 가이드. 3,900원에 평생 소장.',
}

const CHAPTERS = [
  { label: 'Chapter 1', title: '왕초보 (6U~5U · 헤드라이트 · Flexible)', desc: '처음 시작하는 분을 위한 최적 라켓 조건과 입문 추천 3종' },
  { label: 'Chapter 2', title: '초심자 (4U · 이븐 밸런스 · Medium)',    desc: '6개월 미만 수강생이 다음 단계로 넘어갈 때 고르는 법' },
  { label: 'Chapter 3', title: 'D조 (3U~4U · Medium~Stiff)',            desc: '동호회 D급에서 실전 위력을 내려면 어떤 스펙을 봐야 하는가' },
  { label: 'Chapter 4', title: '공통 가이드',                           desc: '브랜드 비교표 / 구매 체크리스트 / 첫 체육관 생존 가이드' },
]

const REVIEWS = [
  { name: '김*진', text: '"총무 일 그만하고 싶었는데 버디모아 쓰고부터 진짜 편해졌어요. PDF도 너무 도움됐습니다."' },
  { name: '이*아', text: '"라켓 고르다가 매번 포기했는데 이 가이드 보고 바로 구매 결정했어요. 강추!"' },
]

export default function PdfPage() {
  return (
    <div className="bg-[#f8f8f8] min-h-screen">
      {/* 히어로 */}
      <section className="bg-[#0a0a0a] py-16 sm:py-24">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#beff00] bg-[#beff00]/10 px-3 py-1.5 rounded-full mb-6">
            <BookOpen size={13} /> PDF 가이드
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            배린이 라켓<br />
            <span className="text-[#beff00]">완전정복 가이드</span>
          </h1>
          <p className="text-white/50 text-lg mb-8">
            왕초보부터 C조까지, 레벨별 라켓 선택의 모든 것
          </p>
          <div className="inline-flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-white">3,900</span>
            <span className="text-xl text-white/60 font-semibold">원</span>
            <span className="ml-2 text-sm text-white/40 line-through">9,900원</span>
          </div>
          <p className="text-[11px] text-white/30 mt-1">얼리버드 특가 · 한정 기간</p>
        </div>
      </section>

      {/* 콘텐츠 + 결제 */}
      <section className="max-w-[1088px] mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* 좌: 상품 설명 */}
        <div className="space-y-8">
          {/* 목차 */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-extrabold text-[#111] mb-5">목차</h2>
            <div className="space-y-4">
              {CHAPTERS.map(ch => (
                <div key={ch.label} className="flex gap-4">
                  <span className="text-xs font-bold text-[#beff00] bg-[#0a0a0a] px-2 py-1 rounded shrink-0 h-fit">{ch.label}</span>
                  <div>
                    <p className="font-semibold text-sm text-[#111]">{ch.title}</p>
                    <p className="text-xs text-[#999] mt-0.5">{ch.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 포함 내용 */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-extrabold text-[#111] mb-5">이 가이드에 포함된 것</h2>
            {[
              '레벨별 최적 스펙 기준 (무게·밸런스·강성)',
              '브랜드별 입문 라켓 비교표 (YONEX / VICTOR / LI-NING)',
              '가격대별 성능 분석 (1만~15만원)',
              '온라인·오프라인 구매 체크리스트',
              '체육관 에티켓 & 초보 생존 가이드',
            ].map(item => (
              <div key={item} className="flex items-start gap-2.5 mb-3">
                <CheckCircle2 size={16} className="text-[#10b981] shrink-0 mt-0.5" strokeWidth={2.5} />
                <p className="text-sm text-[#555]">{item}</p>
              </div>
            ))}
          </div>

          {/* 후기 */}
          <div className="space-y-3">
            {REVIEWS.map(r => (
              <div key={r.name} className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-[#555] italic">{r.text}</p>
                <p className="text-xs text-[#999] mt-2 font-medium">{r.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 우: 결제 위젯 (sticky) */}
        <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
            <p className="text-sm font-bold text-[#111] mb-1">배린이 라켓 완전정복 가이드 PDF</p>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-extrabold text-[#111]">3,900원</span>
              <span className="text-sm text-[#999] line-through ml-1">9,900원</span>
            </div>
            <div className="text-xs text-[#999] space-y-1">
              <p>✔ 즉시 다운로드 (PDF)</p>
              <p>✔ 평생 소장</p>
              <p>✔ 모바일 / PC 호환</p>
            </div>
          </div>
          <PdfPaymentClient />
        </div>
      </section>
    </div>
  )
}
