'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'

type Cycle = 'monthly' | 'yearly'

interface Plan {
  name: string
  description: string
  monthly: string
  yearly: string
  unit: string
  /**
   * 가격 옆 셔틀콕 비유 보조 카피.
   * 한국 동호회 4대 지정콕(삼화블랙·강산연 301/501·KBB79) 평균 시세 기준.
   * 1타(12개) ≈ 29,000원 / 1개 ≈ 2,400원
   */
  priceContext?: string
  features: string[]
  cta: string
  href: string
  highlight: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    description: '시작하는 모임·소규모 운영',
    monthly: '0',
    yearly: '0',
    unit: '원',
    features: [
      '멤버 50명까지',
      '게임보드 + 실력 균형 자동 매칭',
      '출석·공지·정기모임 RSVP',
      '회비 수동 관리 · 셔틀콕 풀',
      '개인 시즌 리포트 PDF',
      '백업·복원',
    ],
    cta: '지금 시작하기',
    href: '/login?next=%2Fclubs',
    highlight: false,
  },
  {
    name: 'Pro',
    description: '운영을 자동화하고 싶은 모임',
    monthly: '9,900',
    yearly: '7,920',
    unit: '원/월',
    priceContext: '한 모임 셔틀콕 4개 가격 — 지정콕 1타의 1/3',
    features: [
      'Free 모든 기능 + 멤버 100명',
      '회비 정산 자동화 (출석·셔틀콕·코트비)',
      '카카오 알림톡 월 200건 (미납·공지·이벤트)',
      '운영진 권한 분배 (오너·매니저·총무)',
      '모임 커스터마이징 (로고·배너·색상)',
      '단일 모임 통계 + 멤버 인사이트',
      '시즌 리포트 자동 PDF',
    ],
    cta: 'Pro 시작하기',
    href: '/login?next=%2Fclubs',
    highlight: true,
    badge: '가장 인기',
  },
  {
    name: 'Team',
    description: '큰 모임·체육관·연맹',
    monthly: '29,900',
    yearly: '23,920',
    unit: '원/월',
    priceContext: '지정콕 1타 가격 — 모임 5개 + 고급 분석',
    features: [
      'Pro 모든 기능 + 멤버 무제한',
      '여러 모임 한꺼번에 (최대 5개)',
      '통합 통계 + 모임 간 비교',
      '고급 통계 dashboard',
      '분기·연간 종합 리포트 PDF',
      '데이터 내보내기 (엑셀·CSV)',
      '우선 지원 (카톡 1:1 채널)',
    ],
    cta: 'Team 시작하기',
    href: '/login?next=%2Fclubs',
    highlight: false,
  },
]

const FAQS = [
  {
    q: 'v2.0 베타 기간 동안은 어떻게 되나요?',
    a: '베타 기간(약 1~3개월) 중에는 모든 유저에게 Pro·Team 기능을 무료로 제공합니다. 정식 출시 후에도 Free 플랜은 계속 무료이며, 베타 가입자에게는 Pro 3개월 무료 혜택을 드립니다.',
  },
  {
    q: '이 가격이 정말 합리적인가요?',
    a: '한국 동호회에서 가장 많이 쓰는 지정콕(삼화블랙·강산연 301/501·KBB79) 평균 시세로 1타(12개) 약 29,000원, 1개 약 2,400원입니다. Pro 한 달 9,900원은 셔틀콕 4개 가격으로 지정콕 1타의 1/3 수준이고, Team 29,900원은 정확히 지정콕 1타 가격이에요. 한 모임이 한 게임에 보통 셔틀콕 4~6개를 쓰는데, 그 정도 비용으로 매주의 매칭·회비 정산·알림톡까지 다 자동화됩니다. 운영 자동화로 회비 미수금 한 명만 줄여도 본전이 나와요.',
  },
  {
    q: '실력 매칭은 어떻게 작동하나요?',
    a: '매 경기 결과를 우리 모임 안에서 자동으로 학습해 멤버별 실력 점수를 매겨요. 운영자가 D조·C조 일일이 입력하지 않아도 됩니다. 다른 사람에겐 등급 라벨만 보이고, 본인 카드에서만 정밀한 점수·진행도를 확인할 수 있어요. 신입은 "강한 사람과 한 팀이 되는 매칭 모드"로 이탈을 줄이고, 운영진 매칭 결정에 정치적 부담이 사라집니다.',
  },
  {
    q: '연간 결제는 어떻게 할인되나요?',
    a: '연간 결제 시 20% 할인된 금액으로 청구됩니다. 1년치를 한 번에 결제하시고, 매월 결제 부담을 덜 수 있습니다.',
  },
  {
    q: '플랜을 언제든 변경할 수 있나요?',
    a: '네. 업그레이드는 즉시 적용되고 차액만 청구됩니다. 다운그레이드는 다음 결제 주기부터 적용됩니다.',
  },
  {
    q: '결제는 어떤 방법으로 가능한가요?',
    a: '신용·체크카드, 계좌이체, 가상계좌 결제를 지원합니다. 토스페이먼츠 통합 결제로 안전하게 진행됩니다.',
  },
  {
    q: '환불은 어떻게 되나요?',
    a: '서비스 이용 이력이 없는 경우 결제일로부터 7일 이내 전액 환불 가능합니다. 자세한 내용은 환불정책 페이지를 확인해주세요.',
  },
  {
    q: '회원이 50명을 넘으면 어떻게 되나요?',
    a: 'Free 플랜에서 50명을 초과하면 신규 회원 가입이 제한됩니다. Pro 플랜(100명)이나 Team 플랜(무제한)으로 업그레이드하시면 계속 받을 수 있습니다.',
  },
  {
    q: '카카오 알림톡 200건 한도가 부족하면요?',
    a: 'Pro 플랜은 월 200건의 알림톡(미납·공지·이벤트 알림)을 포함합니다. 100명 규모 클럽에선 충분하지만, 큰 클럽이라 부족할 경우 Team 플랜으로 확장하시거나 별도 패키지로 추가 구매가 가능합니다.',
  },
]

export function PricingClient() {
  const [cycle, setCycle] = useState<Cycle>('monthly')

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      {/* ── 헤더 ── */}
      <section className="px-8 py-20 sm:py-28 border-b border-white/10">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-brand-lime)] mb-4">
            PRICING
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
            나에게 맞는 플랜을<br />선택하세요
          </h1>
          <p className="text-lg text-white/60 max-w-[560px] mx-auto leading-relaxed mb-10">
            v2.0 베타 기간(1~3개월) 동안 Pro·Team 모든 기능 무료.<br />
            베타 가입자에게는 Pro 3개월 무료 혜택을 드립니다.
          </p>

          {/* 월간/연간 토글 */}
          <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-1">
            <button
              onClick={() => setCycle('monthly')}
              className={`px-5 py-2 rounded-full text-[13px] font-bold transition-colors ${
                cycle === 'monthly'
                  ? 'bg-white text-[#0a0a0a]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setCycle('yearly')}
              className={`px-5 py-2 rounded-full text-[13px] font-bold transition-colors flex items-center gap-1.5 ${
                cycle === 'yearly'
                  ? 'bg-white text-[#0a0a0a]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              연간
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  cycle === 'yearly'
                    ? 'bg-[var(--color-brand-lime)] text-[#0a0a0a]'
                    : 'bg-[var(--color-brand-lime)]/20 text-[var(--color-brand-lime)]'
                }`}
              >
                20% 할인
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 플랜 카드 ── */}
      <section className="px-8 py-20">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {PLANS.map((plan) => {
            const price = cycle === 'monthly' ? plan.monthly : plan.yearly
            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-7 lg:p-8 flex flex-col ${
                  plan.highlight
                    ? 'bg-white text-[#0a0a0a] scale-[1.02] shadow-2xl'
                    : 'bg-white/[0.04] border border-white/10 text-white'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-extrabold text-[#0a0a0a] bg-[var(--color-brand-lime)] px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-6">
                  <p className={`text-[13px] font-bold uppercase tracking-widest mb-2 ${
                    plan.highlight ? 'text-[#0a0a0a]' : 'text-white/60'
                  }`}>
                    {plan.name}
                  </p>
                  <p className={`text-[13px] mb-5 ${
                    plan.highlight ? 'text-[#666]' : 'text-white/50'
                  }`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl lg:text-5xl font-extrabold">{price}</span>
                    <span className={`text-sm font-medium ${
                      plan.highlight ? 'text-[#666]' : 'text-white/50'
                    }`}>
                      {plan.unit}
                    </span>
                  </div>
                  {cycle === 'yearly' && plan.monthly !== '0' && (
                    <p className={`text-[11px] mt-1.5 ${
                      plan.highlight ? 'text-[#999]' : 'text-white/40'
                    }`}>
                      월 {plan.monthly}원의 20% 할인
                    </p>
                  )}
                  {plan.priceContext && (
                    <p
                      className={`text-[11px] mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md ${
                        plan.highlight
                          ? 'bg-[#0a0a0a]/5 text-[#0a0a0a]'
                          : 'bg-[var(--color-brand-lime)]/15 text-[var(--color-brand-lime)]'
                      }`}
                    >
                      🏸 {plan.priceContext}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        size={15}
                        strokeWidth={2.5}
                        className={`mt-0.5 shrink-0 ${
                          plan.highlight ? 'text-[var(--color-brand-court)]' : 'text-[var(--color-brand-lime)]'
                        }`}
                      />
                      <span className="text-[14px]">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`inline-flex items-center justify-center gap-1.5 py-3.5 rounded-full font-bold text-[14px] transition-colors ${
                    plan.highlight
                      ? 'bg-[#0a0a0a] text-white hover:bg-[#333]'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-[12px] text-white/40 mt-10">
          모든 플랜은 신용카드·체크카드·계좌이체 지원 · 언제든 해지 가능
        </p>
      </section>

      {/* ── FAQ ── */}
      <section className="px-8 py-20 border-t border-white/10">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] font-bold uppercase tracking-widest text-white/50 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              자주 묻는 질문
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden"
              >
                <summary className="cursor-pointer px-6 py-5 flex items-center justify-between gap-4 font-semibold text-[15px] text-white list-none hover:bg-white/[0.06] transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-white/50 text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-[14px] text-white/70 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section className="px-8 py-24">
        <div className="max-w-[640px] mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-white/60 text-[15px] mb-8">
            v2.0 베타 기간, 모든 기능 무료입니다.
          </p>
          <Link
            href="/login?next=%2Fclubs"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-brand-lime)] text-[#0a0a0a] font-extrabold text-[14px] rounded-full hover:bg-[var(--color-brand-lime-dim)] transition-colors"
          >
            무료로 시작하기
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  )
}
