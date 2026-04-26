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
  features: string[]
  cta: string
  href: string
  highlight: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    description: '소규모 동호회를 위한 기본 플랜',
    monthly: '0',
    yearly: '0',
    unit: '원',
    features: [
      '회원 30명까지',
      '게임보드 & 자동 팀배정',
      '경기 기록 & 랭킹',
      '공지 게시판',
      '기본 회원 관리',
    ],
    cta: '지금 시작하기',
    href: '/login?next=%2Fclub%2Fhome',
    highlight: false,
  },
  {
    name: 'Pro',
    description: '회원 무제한 동호회 운영자에게',
    monthly: '9,900',
    yearly: '7,920',
    unit: '원/월',
    features: [
      'Free 모든 기능',
      '회원 무제한',
      '회비 정산 자동화',
      '셔틀콕비 자동 정산',
      '엑셀 내보내기',
      '카카오 공지 자동 공유',
      '미납자 자동 알림',
    ],
    cta: 'Pro 시작하기',
    href: '/login?next=%2Fclub%2Fhome',
    highlight: true,
    badge: '가장 인기',
  },
  {
    name: 'Team',
    description: '여러 동호회를 운영하는 분께',
    monthly: '29,900',
    yearly: '23,920',
    unit: '원/월',
    features: [
      'Pro 모든 기능',
      '클럽 5개까지 관리',
      '맞춤 통계 대시보드',
      '우선 고객 지원',
      'Webhook 연동 (Zapier)',
      '전용 온보딩',
    ],
    cta: 'Team 시작하기',
    href: '/login?next=%2Fclub%2Fhome',
    highlight: false,
  },
]

const FAQS = [
  {
    q: 'v2.0 베타 기간 동안은 어떻게 되나요?',
    a: '베타 기간 중에는 모든 유저에게 Pro 기능을 무료로 제공합니다. 정식 출시 후에도 Free 플랜은 계속 무료입니다.',
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
    q: '회원이 30명을 넘으면 어떻게 되나요?',
    a: 'Free 플랜에서 30명을 초과하면 신규 회원 가입이 제한됩니다. Pro 플랜으로 업그레이드하시면 무제한으로 받을 수 있습니다.',
  },
]

export function PricingClient() {
  const [cycle, setCycle] = useState<Cycle>('monthly')

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      {/* ── 헤더 ── */}
      <section className="px-8 py-20 sm:py-28 border-b border-white/10">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#beff00] mb-4">
            PRICING
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
            나에게 맞는 플랜을<br />선택하세요
          </h1>
          <p className="text-lg text-white/60 max-w-[560px] mx-auto leading-relaxed mb-10">
            v2.0 베타 기간 동안 모든 기능 무료입니다.<br />
            정식 출시 후에도 Free 플랜은 계속 무료로 제공됩니다.
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
                    ? 'bg-[#beff00] text-[#0a0a0a]'
                    : 'bg-[#beff00]/20 text-[#beff00]'
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
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-extrabold text-[#0a0a0a] bg-[#beff00] px-3 py-1 rounded-full">
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
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        size={15}
                        strokeWidth={2.5}
                        className={`mt-0.5 shrink-0 ${
                          plan.highlight ? 'text-[#10b981]' : 'text-[#beff00]'
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
            href="/login?next=%2Fclub%2Fhome"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#beff00] text-[#0a0a0a] font-extrabold text-[14px] rounded-full hover:bg-[#a8e600] transition-colors"
          >
            무료로 시작하기
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  )
}
