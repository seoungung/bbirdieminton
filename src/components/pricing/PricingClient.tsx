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
  /** 정기결제·서비스 제공기간 안내 (가맹 심사 필수 표기) */
  billingNote?: string
  features: string[]
  cta: string
  href: string
  highlight: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    description: '시작하는 모임 · 소규모 운영',
    monthly: '0',
    yearly: '0',
    unit: '원',
    features: [
      '누적 가입 멤버 최대 50명',
      '모임장 1명 (공동 관리자 불가)',
      '게임보드 + 실력 균형 자동 매칭',
      '출석 · 공지 · 정기 일정 참석 확인',
      '회비 수동 관리 · 셔틀콕 풀',
      '개인 시즌 리포트 PDF',
      '백업 · 복원',
    ],
    cta: '지금 시작하기',
    href: '/login?next=%2Fclubs',
    highlight: false,
  },
  {
    name: 'Basic',
    description: '운영 자동화가 필요한 모임',
    monthly: '9,900',
    yearly: '7,920',
    unit: '원/월',
    priceContext: '한 모임 셔틀콕 4개 가격 — 지정콕 1타의 1/3',
    billingNote: '정기결제(자동결제) · 서비스 제공기간 1개월 · 매월 자동 갱신',
    features: [
      'Free 모든 기능 + 누적 멤버 최대 100명',
      '공동 관리자 최대 3명 지정',
      '핵심 기능: 회비 미납자에게 자동 알림톡',
      '핵심 기능: 정기 일정 빈자리 대기열 자동 충원',
      '회비 정산 자동화 (출석 · 셔틀콕 · 코트비)',
      '모임 커스터마이징 (로고 · 배너 · 색상)',
      '단일 모임 통계 + 멤버 인사이트',
    ],
    cta: 'Basic 시작하기',
    href: '/login?next=%2Fclubs',
    highlight: true,
    badge: '가장 인기',
  },
  {
    name: 'Pro',
    description: '큰 모임 · 체육관 · 연맹',
    monthly: '29,900',
    yearly: '23,920',
    unit: '원/월',
    priceContext: '지정콕 1타 가격 — 무제한 멤버 + 고급 리포트',
    billingNote: '정기결제(자동결제) · 서비스 제공기간 1개월 · 매월 자동 갱신',
    features: [
      'Basic 모든 기능 + 누적 멤버 무제한',
      '공동 관리자 무제한 지정',
      '핵심 기능: 정산 · 출석 · 재무 데이터 Excel 추출',
      '핵심 기능: 연말 · 총회용 PDF 보고서 자동 생성',
      '고급 통계 화면',
      '분기 · 연간 종합 리포트 PDF',
      '우선 지원 (카톡 1:1 채널)',
    ],
    cta: 'Pro 시작하기',
    href: '/login?next=%2Fclubs',
    highlight: false,
  },
]

const FAQS = [
  {
    q: '오픈 베타 기간 동안은 어떻게 되나요?',
    a: '베타 기간(약 1~3개월) 중에는 모든 유저에게 Basic · Pro 기능을 무료로 제공합니다. 정식 출시 후에도 Free 플랜은 계속 무료이며, 베타 가입자에게는 Basic 3개월 무료 혜택을 드립니다. 베타 종료 후 유료 플랜으로 자동 전환되는 경우, 전자상거래법에 따라 회사는 전환 30일 전 사전 통보 및 동의 절차를 거칩니다.',
  },
  {
    q: '정기결제는 어떻게 진행되나요?',
    a: 'Basic · Pro 플랜은 매월 정기결제(자동결제)로 진행됩니다. 최초 결제일을 기준으로 매월 동일한 날짜에 등록된 카드로 자동 청구되며, 서비스 제공기간은 1개월입니다. 결제 정보는 토스페이먼츠를 통해 안전하게 처리됩니다.',
  },
  {
    q: '구독은 어떻게 해지하나요?',
    a: '언제든 마이페이지의 결제 관리 메뉴에서 해지하거나, 이메일(hello@birdieminton.com)로 신청하실 수 있습니다. 해지 시 다음 결제는 청구되지 않으며, 이미 결제된 기간이 끝날 때까지는 유료 기능을 그대로 이용하실 수 있습니다.',
  },
  {
    q: '환불은 어떻게 되나요?',
    a: '서비스 이용 이력이 없는 경우 결제일로부터 7일 이내 전액 환불 가능합니다. 자세한 내용은 환불정책 페이지를 확인해주세요.',
  },
  {
    q: '이 가격이 정말 합리적인가요?',
    a: '한국 동호회에서 가장 많이 쓰는 지정콕(삼화블랙 · 강산연 301/501 · KBB79) 평균 시세로 1타(12개) 약 29,000원, 1개 약 2,400원입니다. Basic 한 달 9,900원은 셔틀콕 4개 가격으로 지정콕 1타의 1/3 수준이고, Pro 29,900원은 정확히 지정콕 1타 가격이에요. 한 모임이 한 게임에 보통 셔틀콕 4~6개를 쓰는데, 그 정도 비용으로 매주의 매칭 · 회비 정산 · 알림톡까지 다 자동화됩니다. 운영 자동화로 회비 미수금 한 명만 줄여도 본전이 나와요.',
  },
  {
    q: '실력 매칭은 어떻게 작동하나요?',
    a: '매 경기 결과를 우리 모임 안에서 자동으로 학습해 멤버별 실력 점수를 매겨요. 운영자가 D조 · C조 일일이 입력하지 않아도 됩니다. 다른 사람에겐 등급 라벨만 보이고, 본인 카드에서만 정밀한 점수 · 진행도를 확인할 수 있어요. 신입은 "강한 사람과 한 팀이 되는 매칭 모드"로 이탈을 줄이고, 운영진 매칭 결정에 정치적 부담이 사라집니다.',
  },
  {
    q: '연간 결제는 어떻게 할인되나요?',
    a: '연간 결제 시 20% 할인된 금액으로 청구됩니다. 1년치를 한 번에 결제하시고, 매월 결제 부담을 덜 수 있습니다. 서비스 제공기간은 12개월입니다.',
  },
  {
    q: '플랜을 언제든 변경할 수 있나요?',
    a: '네. 상위 플랜으로 변경하면 즉시 적용되고 남은 기간 차액만 청구됩니다. 하위 플랜으로 변경하면 다음 결제 주기부터 적용되며, 하위 플랜으로 바꾸셔도 기존 데이터는 그대로 유지됩니다. 단, 멤버 수 한도를 초과한 상태에서는 신규 정기 일정 개설이 제한됩니다.',
  },
  {
    q: '결제는 어떤 방법으로 가능한가요?',
    a: '신용 · 체크카드 정기결제(자동결제)를 지원합니다. 토스페이먼츠 통합 결제로 안전하게 진행되며, 카드 정보는 토스페이먼츠에 안전하게 보관됩니다.',
  },
  {
    q: '가격이 인상되면 어떻게 되나요?',
    a: '전자상거래법에 따라 가격 인상이 발생하는 경우, 회사는 변경 적용 30일 전 이메일 · 앱 내 알림 등으로 회원에게 통보하고 회원 동의를 받습니다. 동의하지 않으시면 기존 가격으로 다음 결제 주기까지 이용 가능합니다.',
  },
  {
    q: '결제가 실패하면 어떻게 되나요?',
    a: '결제가 실패하면 최대 10일 동안 다시 시도하고 회원께 안내드립니다. 10일이 지나도 결제가 완료되지 않으면 자동으로 Free 플랜으로 변경되며, 기존 데이터는 그대로 유지됩니다. 카드 정보를 새로 등록하시면 언제든 다시 유료 플랜으로 돌아오실 수 있습니다.',
  },
  {
    q: 'Free 플랜에서 50명을 초과하면 어떻게 되나요?',
    a: 'Free 플랜에서 누적 가입 멤버가 50명을 초과하면 신규 가입 신청이 자동으로 차단되며 업그레이드 안내 팝업이 노출됩니다. Basic(100명)이나 Pro(무제한) 플랜으로 업그레이드하시면 즉시 추가 회원을 받을 수 있습니다.',
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
            오픈 베타 기간(1~3개월) 동안 Basic · Pro 모든 기능 무료.<br />
            베타 가입자에게는 Basic 3개월 무료 혜택을 드립니다.
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
                  {plan.billingNote && (
                    <p
                      className={`text-[11px] mt-2 leading-relaxed ${
                        plan.highlight ? 'text-[#888]' : 'text-white/45'
                      }`}
                    >
                      {plan.billingNote}
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

        {/* 가맹 심사 필수 안내 (정기결제 · 해지 · 사전 통보 정책) */}
        <div className="max-w-[760px] mx-auto mt-12 text-center space-y-2">
          <p className="text-[12px] text-white/60 leading-relaxed">
            모든 유료 플랜은 <strong className="text-white/80">정기결제(자동결제)</strong>이며, 서비스 제공기간은 월간 1개월 / 연간 12개월입니다.
            <br />
            언제든 마이페이지 또는 이메일(
            <a href="mailto:hello@birdieminton.com" className="underline hover:text-white">hello@birdieminton.com</a>
            )로 해지 가능하며, 해지 후에도 이미 결제된 기간 종료 시점까지 유료 기능을 이용하실 수 있습니다.
          </p>
          <p className="text-[11px] text-white/40 leading-relaxed">
            가격 인상은 적용 30일 전 사전 통보 후 회원 동의를 거쳐 진행됩니다.
            무료에서 유료 플랜으로 자동 전환되는 경우 전환 7일 전 사전 통보됩니다.
            결제 관련 자세한 내용은 <Link href="/policy/refund" className="underline hover:text-white">환불정책</Link>과 <Link href="/terms" className="underline hover:text-white">이용약관</Link>을 참고해주세요.
          </p>
          <p className="text-[12px] text-white/40 pt-2">
            신용 · 체크카드 정기결제 지원 (토스페이먼츠) · 언제든 해지 가능
          </p>
        </div>

        {/* 누적 인원 정책 한 줄 명시 */}
        <p className="text-center text-[12px] text-white/45 mt-4 max-w-[760px] mx-auto leading-relaxed">
          멤버 수 한도 초과 시 신규 가입 신청이 자동 차단되며, 하위 플랜으로 변경하셔도 기존 데이터는 유지되지만 한도 초과 상태에서는 새로운 정기 일정 개설이 제한됩니다.
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
            오픈 베타 기간, 모든 기능 무료입니다.
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
