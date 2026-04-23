import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpen, CheckCircle2, Star, ShoppingCart } from 'lucide-react'

export const metadata: Metadata = {
  title: '배린이 라켓 완전정복 가이드 | 버디민턴',
  description: '왕초보부터 C조까지, 레벨별 라켓 선택 완벽 가이드. 3,900원에 평생 소장.',
}

const PRODUCT = {
  name: '배린이 라켓 완전정복 가이드',
  subtitle: '왕초보부터 C조까지, 레벨별 라켓 선택의 모든 것',
  priceCurrent: 3900,
  priceOriginal: 9900,
  format: 'PDF',
  pages: '약 30~40페이지',
  deliveryType: '구매 즉시 이메일로 다운로드 링크 발송',
}

const CHAPTERS = [
  { label: 'Chapter 1', title: '왕초보 (6U~5U · 헤드라이트 · Flexible)', desc: '처음 시작하는 분을 위한 최적 라켓 조건과 입문 추천 3종' },
  { label: 'Chapter 2', title: '초심자 (4U · 이븐 밸런스 · Medium)',    desc: '6개월 미만 수강생이 다음 단계로 넘어갈 때 고르는 법' },
  { label: 'Chapter 3', title: 'D조 (3U~4U · Medium~Stiff)',            desc: '동호회 D급에서 실전 위력을 내려면 어떤 스펙을 봐야 하는가' },
  { label: 'Chapter 4', title: '공통 가이드',                           desc: '브랜드 비교표 / 구매 체크리스트 / 첫 체육관 생존 가이드' },
]

const INCLUDES = [
  '레벨별 최적 스펙 기준 (무게·밸런스·강성)',
  '브랜드별 입문 라켓 비교표 (YONEX / VICTOR / LI-NING)',
  '가격대별 성능 분석 (1만~15만원)',
  '온라인·오프라인 구매 체크리스트',
  '체육관 에티켓 & 초보 생존 가이드',
]

const REVIEWS = [
  { name: '김*진', text: '"라켓 검색만 며칠 했는데, 이 가이드 한 권으로 결정 끝. 돈 아까운 줄 몰랐어요."' },
  { name: '이*아', text: '"초보라서 뭐부터 봐야 할지 몰랐는데, 체크리스트 그대로 따라 샀더니 만족도 최상!"' },
]

export default function StarterGuidePage() {
  return (
    <div className="bg-[#f8f8f8] min-h-screen">
      {/* 브레드크럼 */}
      <nav className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 py-3 text-[12px] text-[#777]">
          <Link href="/" className="hover:text-[#111]">홈</Link>
          <span className="mx-1.5 text-[#ccc]">/</span>
          <Link href="/shop" className="hover:text-[#111]">디지털 상품</Link>
          <span className="mx-1.5 text-[#ccc]">/</span>
          <span className="text-[#111] font-medium">{PRODUCT.name}</span>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="bg-[#0a0a0a] py-14 sm:py-20">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#beff00] bg-[#beff00]/10 px-3 py-1.5 rounded-full mb-5">
            <BookOpen size={13} /> PDF 가이드
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            {PRODUCT.name.split(' ').map((word, i) => (
              <span key={i}>
                {word === '완전정복' ? <span className="text-[#beff00]">{word}</span> : word}
                {i < PRODUCT.name.split(' ').length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          <p className="text-white/50 text-base sm:text-lg mb-7">{PRODUCT.subtitle}</p>
          <div className="inline-flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-white">{PRODUCT.priceCurrent.toLocaleString()}</span>
            <span className="text-xl text-white/60 font-semibold">원</span>
            <span className="ml-2 text-sm text-white/40 line-through">{PRODUCT.priceOriginal.toLocaleString()}원</span>
          </div>
          <p className="text-[11px] text-white/30 mt-1">얼리버드 특가 · 한정 기간</p>
        </div>
      </section>

      {/* 본문 2단 */}
      <section className="max-w-[1088px] mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* 좌: 상품 설명 */}
        <div className="space-y-6">
          {/* 기본 스펙 */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-extrabold text-[#111] mb-4">상품 정보</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
              <div>
                <dt className="text-[#999] mb-1">형식</dt>
                <dd className="font-semibold text-[#111]">{PRODUCT.format}</dd>
              </div>
              <div>
                <dt className="text-[#999] mb-1">분량</dt>
                <dd className="font-semibold text-[#111]">{PRODUCT.pages}</dd>
              </div>
              <div>
                <dt className="text-[#999] mb-1">수령 방법</dt>
                <dd className="font-semibold text-[#111]">이메일 링크 즉시 발송</dd>
              </div>
            </dl>
          </div>

          {/* 목차 */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-extrabold text-[#111] mb-5">목차</h2>
            <div className="space-y-4">
              {CHAPTERS.map((ch) => (
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
            {INCLUDES.map((item) => (
              <div key={item} className="flex items-start gap-2.5 mb-3">
                <CheckCircle2 size={16} className="text-[#10b981] shrink-0 mt-0.5" strokeWidth={2.5} />
                <p className="text-sm text-[#555]">{item}</p>
              </div>
            ))}
          </div>

          {/* 후기 */}
          <div className="space-y-3">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-[#555] italic">{r.text}</p>
                <p className="text-xs text-[#999] mt-2 font-medium">{r.name}</p>
              </div>
            ))}
          </div>

          {/* 환불/수령 안내 */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 text-[13px] leading-relaxed">
            <h2 className="text-[15px] font-extrabold text-[#111] mb-3">수령 및 환불 안내</h2>
            <p className="text-[#555] mb-1.5">• 결제 완료 즉시 입력하신 이메일로 PDF 다운로드 링크가 발송됩니다.</p>
            <p className="text-[#555] mb-1.5">• 다운로드 링크 유효기간: 24시간 (만료 시 재발급 가능)</p>
            <p className="text-[#555]">
              • 환불: 구매 후 7일 이내, PDF를 다운로드하지 않은 경우에 한해 전액 환불. 자세한 내용은{' '}
              <Link href="/policy/refund" className="text-[#111] underline font-semibold">환불정책</Link>을 확인해주세요.
            </p>
          </div>
        </div>

        {/* 우: 주문 CTA (sticky) */}
        <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
            <p className="text-sm font-bold text-[#111] mb-1">{PRODUCT.name}</p>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-extrabold text-[#111]">{PRODUCT.priceCurrent.toLocaleString()}원</span>
              <span className="text-sm text-[#999] line-through ml-1">{PRODUCT.priceOriginal.toLocaleString()}원</span>
            </div>
            <div className="text-xs text-[#999] space-y-1 mb-5">
              <p>✔ 즉시 다운로드 (PDF)</p>
              <p>✔ 평생 소장</p>
              <p>✔ 모바일 / PC 호환</p>
              <p>✔ 회원가입 없이 구매 가능</p>
            </div>

            <Link
              href="/shop/starter-guide/order"
              className="w-full inline-flex items-center justify-center gap-2 py-4 bg-[#beff00] text-[#0a0a0a] font-extrabold text-base rounded-xl hover:bg-[#a8e600] transition-colors"
            >
              <ShoppingCart size={18} strokeWidth={2.5} />
              주문하기
            </Link>

            <p className="text-[11px] text-[#bbb] text-center mt-3">
              결제는 토스페이먼츠로 안전하게 진행됩니다
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
