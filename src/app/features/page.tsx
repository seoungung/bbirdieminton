import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Gamepad2,
  Trophy,
  Megaphone,
  Wallet,
  Users,
  FileSpreadsheet,
} from 'lucide-react'
import type { ComponentType } from 'react'

export const metadata: Metadata = {
  title: '기능 소개 | 버디민턴',
  description:
    '게임보드, 회비 정산, 랭킹, 공지사항까지. 배드민턴 동호회 운영에 필요한 모든 기능을 버디민턴에서.',
}

interface Feature {
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    Icon: Gamepad2,
    title: '게임보드',
    desc: '코트별 팀 자동 배정 · 실시간 경기 진행 · 원터치 결과 입력',
  },
  {
    Icon: Trophy,
    title: '승률 랭킹',
    desc: '경기 결과 자동 집계 · 승률·연승 통계 · 동기부여 UP',
  },
  {
    Icon: Megaphone,
    title: '공지사항',
    desc: '핀 고정 공지 · 이벤트/일반 구분 · 배지 알림',
  },
  {
    Icon: Wallet,
    title: '회비 정산',
    desc: '납부 현황 한눈에 · 셔틀콕비 자동 분배 계산',
  },
  {
    Icon: Users,
    title: '회원 관리',
    desc: '초대코드 가입 · 역할 부여 · 멤버 현황 관리',
  },
  {
    Icon: FileSpreadsheet,
    title: '엑셀 임포트',
    desc: '기존 엑셀 데이터 그대로 이전 · 경기 기록 일괄 업로드',
  },
]

interface Persona {
  role: string
  summary: string
}

const PERSONAS: Persona[] = [
  {
    role: '총무 · 운영진',
    summary:
      '출석 취합·회비 관리를 혼자 다 하셨나요? 이제 앱이 대신합니다.',
  },
  {
    role: '모임장',
    summary:
      '팀 배정 눈치 게임, 신입 온보딩 반복 — 한 번만 설정하면 끝.',
  },
  {
    role: '일반 멤버',
    summary:
      '내 승률과 전적을 확인하고, 모임 공지를 놓치지 마세요.',
  },
]

interface Plan {
  tier: string
  price: string
  sub: string
  features: string[]
  highlighted: boolean
}

const PLANS: Plan[] = [
  {
    tier: 'Free',
    price: '무료',
    sub: '≤ 30명',
    features: ['게임보드 & 자동 팀배정', '승률 랭킹', '공지사항', '기본 회원 관리'],
    highlighted: false,
  },
  {
    tier: 'Pro',
    price: '9,900원',
    sub: '30명 초과',
    features: ['Free 모든 기능', '회비 정산 자동화', '통계 고급 기능', '엑셀 내보내기'],
    highlighted: true,
  },
  {
    tier: 'Team',
    price: '29,900원',
    sub: '100명 초과',
    features: ['Pro 모든 기능', '다중 클럽 관리', '맞춤 통계 대시보드', '우선 고객 지원'],
    highlighted: false,
  },
]

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white text-[#111]">

      {/* ── Section 1: Hero ──────────────────────────── */}
      <section className="bg-[#0a0a0a] py-20 sm:py-28">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
            배드민턴 동호회 운영의 모든 것
          </h1>
          <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
            게임보드부터 회비 정산까지. 총무 혼자 감당하던 모든 운영 업무를 버디민턴가 해결합니다.
          </p>
        </div>
      </section>

      {/* ── Section 2: 핵심 기능 6종 ─────────────────── */}
      <section className="bg-white py-16 sm:py-24 border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111]">핵심 기능</h2>
            <p className="text-sm text-[#555] mt-3 leading-relaxed">
              운영에 필요한 모든 것을 하나의 앱에서
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-[#f0f0f0] rounded-2xl p-6 hover:border-[#e5e5e5] hover:shadow-sm transition-all"
              >
                <div className="bg-[#f8f8f8] rounded-xl w-12 h-12 flex items-center justify-center mb-4 text-[#555]">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-[#111] mb-2">{title}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: 페르소나 ───────────────────────── */}
      <section className="bg-[#f8f8f8] py-16 sm:py-24 border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111]">
              이런 분께 딱입니다
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PERSONAS.map(({ role, summary }) => (
              <div
                key={role}
                className="bg-white border border-[#e5e5e5] rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-[#111] mb-3">{role}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: 요금제 ────────────────────────── */}
      <section className="bg-white py-16 sm:py-24 border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111]">요금제</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PLANS.map(({ tier, price, sub, features, highlighted }) => (
              <div
                key={tier}
                className={
                  highlighted
                    ? 'bg-[#0a0a0a] text-white rounded-2xl p-6 relative'
                    : 'bg-white border border-[#e5e5e5] rounded-2xl p-6'
                }
              >
                {highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-extrabold bg-[#beff00] text-[#0a0a0a] px-3 py-1 rounded-full">
                    추천
                  </span>
                )}
                <p
                  className={`text-[13px] font-bold uppercase tracking-wider mb-2 ${
                    highlighted ? 'text-[#beff00]' : 'text-[#999]'
                  }`}
                >
                  {tier}
                </p>
                <p
                  className={`text-3xl font-extrabold mb-1 ${
                    highlighted ? 'text-white' : 'text-[#111]'
                  }`}
                >
                  {price}
                  {tier !== 'Free' && (
                    <span
                      className={`text-lg font-semibold ${
                        highlighted ? 'text-white/40' : 'text-[#999]'
                      }`}
                    >
                      /월
                    </span>
                  )}
                </p>
                <p
                  className={`text-[13px] mb-6 ${
                    highlighted ? 'text-white/40' : 'text-[#999]'
                  }`}
                >
                  {sub}
                </p>
                <ul className="space-y-2.5">
                  {features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2 text-sm ${
                        highlighted ? 'text-white/70' : 'text-[#555]'
                      }`}
                    >
                      <span
                        className={`font-bold text-[12px] ${
                          highlighted ? 'text-[#beff00]' : 'text-[#111]'
                        }`}
                      >
                        ✓
                      </span>{' '}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: CTA ───────────────────────────── */}
      <section className="bg-[#0a0a0a] py-20 sm:py-28">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            지금 바로 무료로 시작하세요
          </h2>
          <p className="text-white/40 mb-10 text-lg">카카오 1초 가입 · 설치 없이 바로</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#beff00] text-[#0a0a0a] font-extrabold text-[16px] rounded-xl hover:brightness-95 transition-all"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/club/demo-birdies"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white/70 font-semibold text-[16px] rounded-xl hover:border-white/50 hover:text-white transition-all"
            >
              데모 체험하기
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
