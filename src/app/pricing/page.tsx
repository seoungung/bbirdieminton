import Link from 'next/link'
import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: '요금제 | 버디모아',
  description: '배드민턴 동호회 운영 플랫폼 버디모아의 요금제를 확인하세요. 기본 무료, 언제든 업그레이드.',
}

interface Plan {
  name: string
  price: string
  priceUnit: string
  description: string
  target: string
  features: string[]
  cta: {
    text: string
    href: string
    variant: 'lime' | 'white'
  }
  highlighted?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '0',
    priceUnit: '원/월',
    description: '핵심 기능 전부',
    target: '30명 이하',
    features: [
      '게임보드',
      '승률 랭킹',
      '공지사항',
      '회비 현황',
      '회원 관리 (≤30명)',
      '엑셀 임포트',
      '데모 체험',
    ],
    cta: {
      text: '지금 무료로 시작',
      href: '/login',
      variant: 'lime',
    },
  },
  {
    name: 'Pro',
    price: '9,900',
    priceUnit: '원/월',
    description: '고급 통계, 우선지원',
    target: '30명 ~ 100명',
    features: [
      'Free의 모든 기능',
      '회원 100명까지',
      '고급 경기 통계',
      '정산 자동화',
      '우선 고객 지원',
    ],
    cta: {
      text: '14일 무료 체험',
      href: '/login',
      variant: 'lime',
    },
    highlighted: true,
  },
  {
    name: 'Team',
    price: '29,900',
    priceUnit: '원/월',
    description: '다중 클럽, 전담 온보딩',
    target: '100명 이상',
    features: [
      'Pro의 모든 기능',
      '회원 무제한',
      '다중 클럽 관리',
      '전담 온보딩',
      '커스텀 초대 링크',
    ],
    cta: {
      text: '문의하기',
      href: 'mailto:skyyolle7@gmail.com',
      variant: 'white',
    },
  },
]

interface FAQ {
  question: string
  answer: string
}

const FAQS: FAQ[] = [
  {
    question: 'v2.0 무료 기간이 얼마나 되나요?',
    answer:
      '정식 출시(v2.0) 이후 무료 플랜은 30명 이하 모임에 무기한 제공됩니다.',
  },
  {
    question: '업그레이드는 언제 해야 하나요?',
    answer:
      '멤버 수가 30명을 초과하거나, 고급 통계가 필요할 때 Pro로 업그레이드하세요.',
  },
  {
    question: '결제는 어떻게 하나요?',
    answer:
      '토스페이먼츠를 통해 카드·카카오페이·네이버페이 등 모든 결제 수단을 지원합니다.',
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-[#111]">
      {/* ── Section 1: Hero ──────────────────────────── */}
      <section className="bg-[#0a0a0a] py-16 sm:py-24">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
            모임 규모에 맞게 선택하세요
          </h1>
          <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
            v2.0은 전원 무료입니다. 필요할 때 업그레이드하면 됩니다.
          </p>
        </div>
      </section>

      {/* ── Section 2: 요금제 카드 ───────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlighted
                    ? 'bg-[#0a0a0a] text-white rounded-2xl p-8 relative ring-2 ring-[#beff00]'
                    : 'bg-white border border-[#e5e5e5] rounded-2xl p-8'
                }
              >
                {plan.highlighted && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-extrabold bg-[#beff00] text-[#0a0a0a] px-4 py-1.5 rounded-full">
                    현재 추천
                  </span>
                )}

                <p
                  className={`text-[13px] font-bold uppercase tracking-wider mb-2 ${
                    plan.highlighted ? 'text-[#beff00]' : 'text-[#999]'
                  }`}
                >
                  {plan.name}
                </p>

                <p
                  className={`text-4xl font-extrabold mb-1 ${
                    plan.highlighted ? 'text-white' : 'text-[#111]'
                  }`}
                >
                  {plan.price}
                  {plan.price !== '0' && (
                    <span
                      className={`text-lg font-semibold ${
                        plan.highlighted ? 'text-white/40' : 'text-[#999]'
                      }`}
                    >
                      {plan.priceUnit}
                    </span>
                  )}
                </p>

                <p
                  className={`text-sm mb-2 ${
                    plan.highlighted ? 'text-white/60' : 'text-[#555]'
                  }`}
                >
                  {plan.description}
                </p>

                <p
                  className={`text-[13px] mb-8 ${
                    plan.highlighted ? 'text-white/40' : 'text-[#999]'
                  }`}
                >
                  {plan.target}
                </p>

                <Link
                  href={plan.cta.href}
                  className={
                    plan.cta.variant === 'lime'
                      ? 'block w-full text-center px-6 py-3 bg-[#beff00] text-[#0a0a0a] font-extrabold text-sm rounded-xl hover:brightness-95 transition-all mb-8'
                      : 'block w-full text-center px-6 py-3 bg-white text-[#0a0a0a] font-extrabold text-sm border border-[#e5e5e5] rounded-xl hover:border-[#999] hover:bg-[#f8f8f8] transition-all mb-8'
                  }
                >
                  {plan.cta.text}
                </Link>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className={`flex items-start gap-3 text-sm ${
                        plan.highlighted ? 'text-white/70' : 'text-[#555]'
                      }`}
                    >
                      <CheckCircle2
                        size={18}
                        className={`flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? 'text-[#beff00]' : 'text-[#beff00]'
                        }`}
                        strokeWidth={2}
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: FAQ ───────────────────────────── */}
      <section className="bg-[#f8f8f8] py-16 sm:py-24 border-y border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111] mb-3">
              자주 묻는 질문
            </h2>
            <p className="text-[#555] text-sm">궁금한 점이 있으신가요?</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {FAQS.map(({ question, answer }) => (
              <div
                key={question}
                className="bg-white rounded-xl p-6 border border-[#e5e5e5]"
              >
                <h3 className="text-lg font-bold text-[#111] mb-3">{question}</h3>
                <p className="text-[#555] text-sm leading-relaxed">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: CTA ───────────────────────────── */}
      <section className="bg-[#0a0a0a] py-16 sm:py-24">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            30명까지 무료. 지금 바로 시작하세요.
          </h2>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#beff00] text-[#0a0a0a] font-extrabold text-base rounded-xl hover:brightness-95 transition-all"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>
    </main>
  )
}
