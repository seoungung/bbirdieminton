import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Check,
  Star,
  MessageSquare,
  BarChart3,
  Frown,
  Gamepad2,
  Wallet,
  Trophy,
  Megaphone,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '버디민턴 | 배드민턴 동호회 운영 플랫폼',
  description:
    '배드민턴 동호회 운영의 모든 것. 게임보드, 회비 정산, 랭킹, 공지를 한 곳에서. 카톡과 엑셀의 한계를 넘어서는 단 하나의 앱.',
  openGraph: {
    title: '버디민턴 | 배드민턴 동호회 운영 플랫폼',
    description:
      '배드민턴 동호회 운영의 모든 것. 게임보드, 회비 정산, 랭킹, 공지를 한 곳에서.',
  },
}

/* ─────────────────────────────────────────────
 *  [2] 고통 공감
 * ───────────────────────────────────────────── */
const PAIN_POINTS = [
  {
    Icon: MessageSquare,
    title: '카톡 단체방이 난리',
    desc: '"나 나가요" "저 못 가요" — 출석 취합만 30분. 코트 수 계산은 머릿속으로.',
  },
  {
    Icon: BarChart3,
    title: '회비는 엑셀로',
    desc: '누가 냈는지 안 냈는지 버전 꼬인 엑셀 파일. 독촉은 매번 민망하고.',
  },
  {
    Icon: Frown,
    title: '팀 배정은 눈치 게임',
    desc: '항상 같은 사람끼리, 실력 차이 심한 팀. 불만은 쌓이고 총무만 난처해.',
  },
]

/* ─────────────────────────────────────────────
 *  [3-6] 기능 4개
 * ───────────────────────────────────────────── */
const FEATURES = [
  {
    Icon: Gamepad2,
    eyebrow: '현장 게임보드',
    title: '현장에서 바로,\n자동 팀배정',
    desc: '실력 기반으로 균등하게 팀을 자동 매칭합니다. 총무가 머리 쥐어뜯을 일 없어요. 경기 결과도 원탭으로 기록되고, 랭킹에 즉시 반영됩니다.',
    bullets: ['실력 등급 기반 자동 팀 매칭', '출석·대기열 실시간 관리', '경기 결과 원탭 입력'],
    imageAlt: '게임보드 화면',
  },
  {
    Icon: Wallet,
    eyebrow: '회비 정산',
    title: '매월 1분 만에\n정산 완료',
    desc: '출석 횟수·셔틀콕비·코트비·레슨비까지 자동 계산. 납부 현황은 한눈에 보이고, 독촉 알림은 자동 발송. 카톡에서 "OO님 회비 아직 안 내셨어요" 할 일 없어요.',
    bullets: ['출석 연동 자동 계산', '납부 현황 실시간 확인', '독촉 알림 자동화'],
    imageAlt: '회비 정산 화면',
  },
  {
    Icon: Trophy,
    eyebrow: '랭킹 & 통계',
    title: '내 실력이\n숫자로 보일 때',
    desc: '전적·승률·포인트가 자동 누적됩니다. 시즌별 순위와 개인 성장 곡선까지. 회원들은 동기부여, 운영진은 공정한 팀 배정 근거를 얻습니다.',
    bullets: ['전적·승률·포인트 자동 집계', '시즌별 랭킹 시스템', '개인 성장 곡선'],
    imageAlt: '랭킹 화면',
  },
  {
    Icon: Megaphone,
    eyebrow: '공지 & 일정',
    title: '카톡에 묻히지 않는\n중요한 소식',
    desc: '공지·이벤트·정기모임 일정을 한 곳에서. 읽지 않은 회원은 자동 알림. 카톡 공유 버튼으로 기존 단체방에도 동시 노출됩니다.',
    bullets: ['공지·이벤트·일정 통합', '미확인 회원 자동 알림', '카톡 단체방 공유'],
    imageAlt: '공지사항 화면',
  },
]

/* ─────────────────────────────────────────────
 *  [7] 테스티모니얼 — 페르소나 5명
 * ───────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    role: '클럽장',
    name: '김민준',
    age: 40,
    clubSize: 200,
    badge: '10년차',
    quote:
      '클럽 200명 규모인데 총무 3명이서 엑셀 돌려가며 관리했어요. 버디민턴 쓰고부터 운영진 업무 시간이 절반으로 줄었습니다.',
    accent: 'court',
  },
  {
    role: '모임장',
    name: '박지호',
    age: 32,
    clubSize: 30,
    badge: '관악구',
    quote:
      '주말 소모임 30명 규모인데 정기모임·자율모임이 섞여서 일정 관리가 머리 아팠어요. 이제 앱 하나로 다 해결됩니다.',
    accent: 'amber',
  },
  {
    role: '총무',
    name: '이서연',
    age: 28,
    clubSize: 45,
    badge: '3년차',
    quote:
      '매달 회비 독촉이 제일 민망했는데, 자동 알림 덕에 인간관계 안 상해요. 총무 해본 분들은 이 고통 아실 거예요.',
    accent: 'court',
  },
  {
    role: '고정 회원',
    name: '최유나',
    age: 35,
    clubSize: 60,
    badge: '주 2회',
    quote:
      '매주 누구랑 치는지 궁금했는데, 앱에서 팀 배정 미리 보고 연습 준비해요. 게임 전적 쌓이는 재미도 쏠쏠해요.',
    accent: 'court',
  },
  {
    role: '신입 회원',
    name: '정태양',
    age: 26,
    clubSize: 50,
    badge: '3개월차',
    quote:
      '첫 가입인데 레벨 진단으로 저랑 비슷한 실력의 분들이랑 잘 쳐요. 적응 빨랐고 지금도 매주 나가요.',
    accent: 'amber',
  },
]

/* ─────────────────────────────────────────────
 *  [8] 요금제
 * ───────────────────────────────────────────── */
const PLANS = [
  {
    name: 'Free',
    price: '무료',
    priceUnit: '',
    description: '최대 30명 규모 동호회',
    features: [
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
    price: '9,900',
    priceUnit: '원/월',
    description: '회원 무제한',
    features: [
      'Free 모든 기능',
      '회비 정산 자동화',
      '엑셀 내보내기',
      '카카오 공지 공유',
      '회원 무제한',
    ],
    cta: 'Pro 시작하기',
    href: '/login?next=%2Fclub%2Fhome',
    highlight: true,
    badge: '가장 인기',
  },
  {
    name: 'Team',
    price: '29,900',
    priceUnit: '원/월',
    description: '다중 클럽 관리',
    features: [
      'Pro 모든 기능',
      '클럽 5개까지',
      '맞춤 통계 대시보드',
      '우선 고객 지원',
    ],
    cta: 'Team 시작하기',
    href: '/login?next=%2Fclub%2Fhome',
    highlight: false,
  },
]

/* ─────────────────────────────────────────────
 *  [9] FAQ
 * ───────────────────────────────────────────── */
const FAQS = [
  {
    q: '무료 플랜으로 어디까지 쓸 수 있나요?',
    a: '최대 30명까지 가입 가능하며, 게임보드·랭킹·공지 등 핵심 기능을 전부 사용할 수 있습니다. 회비 정산 자동화는 Pro 플랜부터 제공됩니다.',
  },
  {
    q: 'v2.0 베타 기간 동안은 Pro 기능도 무료인가요?',
    a: '네. v2.1 정식 출시 전까지 모든 유저에게 Pro 기능을 무료로 제공합니다. 그 이후에도 Free 플랜은 계속 무료입니다.',
  },
  {
    q: '카카오 계정 말고 다른 로그인 방법이 있나요?',
    a: '현재는 카카오 로그인만 지원합니다. 국내 동호회원 대부분이 카카오톡을 사용하셔서 간편한 로그인을 우선 지원했습니다.',
  },
  {
    q: '기존 엑셀 회원 명단을 가져올 수 있나요?',
    a: '가능합니다. 클럽 설정에서 엑셀 템플릿을 다운로드 받으신 후 회원 정보를 채워서 업로드하시면 일괄 등록됩니다.',
  },
  {
    q: '결제한 Pro 플랜을 언제든 해지할 수 있나요?',
    a: '네. 해지 즉시 다음 결제일부터 과금이 중단됩니다. 이미 결제한 월분까지는 계속 Pro 기능을 사용하실 수 있습니다.',
  },
  {
    q: '환불 정책은 어떻게 되나요?',
    a: '서비스 이용 이력이 없는 경우 결제일로부터 7일 이내 전액 환불 가능합니다. 자세한 내용은 환불정책 페이지를 확인해주세요.',
  },
  {
    q: '여러 동호회를 관리할 수 있나요?',
    a: 'Team 플랜을 구독하시면 최대 5개까지 클럽을 생성·관리하실 수 있습니다. 각 클럽별로 별도 회원 관리, 정산, 통계가 제공됩니다.',
  },
  {
    q: '앱 설치가 필요한가요?',
    a: '별도 설치 없이 웹브라우저에서 바로 사용 가능합니다. 스마트폰에서는 "홈 화면에 추가"하시면 앱처럼 사용할 수 있습니다.',
  },
]

/* ═════════════════════════════════════════════
 *  페이지 컴포넌트
 * ═════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main className="bg-white text-[#0a0a0a]">

      {/* ──────────────────────────────────── */}
      {/* [1] HERO — Light                      */}
      {/* ──────────────────────────────────── */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center px-8 py-20 sm:py-32 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto w-full text-center">
          <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#10b981] bg-[#ecfdf5] border border-[#d1fae5] px-3.5 py-1.5 rounded-full mb-8">
            <Check size={13} strokeWidth={3} /> v2.0 베타 · 모든 기능 무료
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            동호회 운영의<br />
            모든 것을 한 곳에.
          </h1>

          <p className="text-lg sm:text-xl text-[#666] max-w-[600px] mx-auto mb-10 leading-relaxed">
            게임보드, 회비 정산, 랭킹, 공지까지.<br />
            카톡과 엑셀의 한계를 넘어서는 단 하나의 앱.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/login?next=%2Fclub%2Fhome"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0a0a0a] text-white font-bold text-[15px] rounded-full hover:bg-[#222] transition-colors"
            >
              무료로 시작하기
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0a0a0a] border border-[#e5e5e5] font-bold text-[15px] rounded-full hover:border-[#0a0a0a] transition-colors"
            >
              먼저 체험해 보기
            </Link>
          </div>

          {/* 프로덕트 프리뷰 모형 */}
          <div className="relative max-w-[1000px] mx-auto">
            <div className="relative rounded-2xl border border-[#e5e5e5] bg-[#f8f8f8] shadow-2xl overflow-hidden aspect-[16/10]">
              <div className="absolute inset-0 flex items-center justify-center text-[#bbb] text-sm font-mono">
                [ 대시보드 스크린샷 자리 ]
              </div>
              {/* 데코 상단바 */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-white border-b border-[#e5e5e5] flex items-center px-5 gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 text-center text-[11px] text-[#999] font-mono">
                  birdieminton.com/club/home
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── */}
      {/* [2] 고통 공감 — Light                 */}
      {/* ──────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-8 border-t border-[#f0f0f0]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[720px] mx-auto text-center mb-16">
            <p className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-4">
              PROBLEM
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
              이런 경험, 있으시죠?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#f8f8f8] rounded-3xl p-10 border border-[#f0f0f0] hover:border-[#e5e5e5] transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#555] mb-5">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-[15px] text-[#666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── */}
      {/* [3-6] 기능 4개 — Light                */}
      {/* ──────────────────────────────────── */}
      {FEATURES.map((feature, i) => (
        <section
          key={feature.eyebrow}
          className="py-24 sm:py-32 px-8 border-t border-[#f0f0f0]"
        >
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* 카피 */}
            <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
              <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-[#0a0a0a] mb-5">
                <feature.Icon size={14} strokeWidth={2.5} />
                {feature.eyebrow}
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6 whitespace-pre-line">
                {feature.title}
              </h2>
              <p className="text-lg text-[#555] leading-relaxed mb-8">
                {feature.desc}
              </p>
              <ul className="space-y-3.5">
                {feature.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ecfdf5] flex items-center justify-center mt-0.5">
                      <Check size={12} className="text-[#10b981]" strokeWidth={3} />
                    </span>
                    <span className="text-[15px] text-[#333] leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 이미지 자리 */}
            <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
              <div className="relative rounded-2xl border border-[#e5e5e5] bg-[#f8f8f8] shadow-xl overflow-hidden aspect-[4/3]">
                <div className="absolute inset-0 flex items-center justify-center text-[#bbb] text-sm font-mono">
                  [ {feature.imageAlt} ]
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ──────────────────────────────────── */}
      {/* [7] 테스티모니얼 — Light              */}
      {/* ──────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-8 border-t border-[#f0f0f0]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[720px] mx-auto text-center mb-16">
            <p className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-4">
              TESTIMONIALS
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
              이런 분들이<br />
              쓰고 있어요.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {TESTIMONIALS.map((t, idx) => {
              const accentBg = t.accent === 'amber' ? '#fef3c7' : '#ecfdf5'
              const accentText = t.accent === 'amber' ? '#f59e0b' : '#10b981'
              const span = idx === 0 ? 'lg:col-span-2' : ''
              return (
                <div
                  key={t.name}
                  className={`bg-[#f8f8f8] rounded-3xl p-8 border border-[#f0f0f0] flex flex-col ${span}`}
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    ))}
                  </div>
                  <p className="text-[15px] sm:text-[16px] text-[#222] leading-relaxed mb-6 flex-1">
                    “{t.quote}”
                  </p>
                  <div className="flex items-center justify-between pt-5 border-t border-[#ebebeb]">
                    <div>
                      <p className="font-bold text-[14px] text-[#111]">{t.name} · {t.age}</p>
                      <p className="text-[12px] text-[#999] mt-0.5">{t.role} · 회원 {t.clubSize}명</p>
                    </div>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: accentBg, color: accentText }}
                    >
                      {t.badge}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-center text-[12px] text-[#bbb] leading-relaxed">
            * 일부 후기는 실제 사례 반영 전 필러 콘텐츠입니다. 런칭 후 실제 사용자 후기로 업데이트됩니다.
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────── */}
      {/* [8] 요금제 — Dark ⚫                  */}
      {/* ──────────────────────────────────── */}
      <section className="bg-[#0a0a0a] text-white py-24 sm:py-32 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[720px] mx-auto text-center mb-16">
            <p className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-4">
              PRICING
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] mb-5">
              v2.0 베타 기간 동안은<br />
              <span className="text-[#beff00]">모든 기능이 무료입니다.</span>
            </h2>
            <p className="text-[16px] text-white/60">
              정식 출시 후에도 Free 플랜은 계속 무료로 제공됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 flex flex-col ${
                  plan.highlight
                    ? 'bg-white text-[#0a0a0a] scale-[1.02] shadow-2xl'
                    : 'bg-white/[0.04] border border-white/10 text-white'
                }`}
              >
                {plan.badge && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-extrabold text-white px-3 py-1 rounded-full"
                    style={{ background: '#f59e0b' }}
                  >
                    {plan.badge}
                  </span>
                )}
                <p className={`text-[13px] font-bold uppercase tracking-widest mb-3 ${plan.highlight ? 'text-[#0a0a0a]' : 'text-[#999]'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.priceUnit && (
                    <span className={`text-sm font-medium ${plan.highlight ? 'text-[#666]' : 'text-white/50'}`}>
                      {plan.priceUnit}
                    </span>
                  )}
                </div>
                <p className={`text-[13px] mb-8 ${plan.highlight ? 'text-[#666]' : 'text-white/50'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        size={15}
                        strokeWidth={2.5}
                        className={plan.highlight ? 'text-[#10b981] mt-0.5' : 'text-[#beff00] mt-0.5'}
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
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-[13px] text-white/40 mt-10">
            모든 플랜은 신용카드·체크카드·계좌이체 지원 · 언제든 해지 가능
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────── */}
      {/* [9] FAQ — Light                       */}
      {/* ──────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-8 border-t border-[#f0f0f0]">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-4">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
              자주 묻는 질문
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group bg-[#f8f8f8] rounded-2xl border border-[#f0f0f0] overflow-hidden"
              >
                <summary className="cursor-pointer px-6 py-5 flex items-center justify-between gap-4 font-semibold text-[15px] text-[#111] list-none hover:bg-[#f0f0f0] transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-[#999] text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-[14px] text-[#555] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── */}
      {/* [10] 최종 CTA — Dark ⚫               */}
      {/* ──────────────────────────────────── */}
      <section className="bg-[#0a0a0a] text-white py-28 sm:py-36 px-8">
        <div className="max-w-[720px] mx-auto text-center">
          <Image src="/symbol_birdieminton-color.png" alt="버디민턴" width={48} height={48} className="h-12 w-auto mx-auto mb-6" />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
            5분 만에 시작하세요.
          </h2>
          <p className="text-[16px] sm:text-lg text-white/60 mb-10">
            카카오 1초 가입 · 설치 없이 바로 · v2.0은 모든 기능 무료
          </p>
          <Link
            href="/login?next=%2Fclub%2Fhome"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#beff00] text-[#0a0a0a] font-extrabold text-[16px] rounded-full hover:bg-[#a8e600] transition-colors"
          >
            무료로 시작하기
            <ArrowRight size={18} />
          </Link>
          <p className="text-[12px] text-white/30 mt-6">
            로그인 없이 먼저 보고 싶다면? <Link href="/demo" className="underline hover:text-white/60">체험하기</Link>
          </p>
        </div>
      </section>

    </main>
  )
}
