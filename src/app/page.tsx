import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Birdieminton | 배드민턴 동호회 운영 플랫폼',
  description: '출석 체크, 회비 정산, 자동 팀 배정까지. 카톡과 엑셀로 버티던 동호회 운영을 한 번에 해결하세요.',
  openGraph: {
    title: 'Birdieminton | 배드민턴 동호회 운영 플랫폼',
    description: '출석 체크, 회비 정산, 자동 팀 배정까지. 카톡과 엑셀로 버티던 동호회 운영을 한 번에 해결하세요.',
  },
}

const PAIN_POINTS = [
  {
    emoji: '📱',
    title: '카톡 단체방이 난리',
    desc: '"나 나가요" "저 못 가요" — 출석 취합만 30분. 코트 수 계산은 머릿속으로.',
  },
  {
    emoji: '📊',
    title: '회비는 엑셀로',
    desc: '누가 냈는지 안 냈는지 버전 꼬인 엑셀 파일. 독촉은 매번 민망하고.',
  },
  {
    emoji: '😤',
    title: '팀 배정은 눈치 게임',
    desc: '항상 같은 사람끼리, 실력 차이 심한 팀. 불만은 쌓이고 총무만 난처해.',
  },
]

const FEATURES = [
  { icon: '✅', title: '원터치 출석 체크', desc: '버튼 하나로 출석 완료. 월별 출석률 자동 집계.' },
  { icon: '🎯', title: '자동 팀 배정', desc: '실력 등급 기반 균등 매칭. 매번 공정한 경기.' },
  { icon: '💰', title: '회비 정산', desc: '출석 횟수 연동 자동 계산. 납부 현황 한눈에.' },
  { icon: '🏆', title: '경기 기록 & 랭킹', desc: '전적·승률·포인트 자동 누적. 동기부여 UP.' },
  { icon: '👥', title: '회원 관리', desc: '역할·실력·상태 한 곳에서. 신입 초대도 링크 하나로.' },
  { icon: '📅', title: '일정 & 공지', desc: '참석 여부 확인까지. 카톡에 묻힐 걱정 없이.' },
]

const TARGETS = [
  {
    role: '총무 · 인사',
    emoji: '📋',
    pains: ['출석 취합 30분', '회비 독촉 민망함', '엑셀 버전 꼬임'],
  },
  {
    role: '모임장 · 운영진',
    emoji: '🎖️',
    pains: ['팀 배정 눈치 게임', '공지 못 보는 회원', '신입 온보딩 반복'],
  },
  {
    role: '코치',
    emoji: '🏸',
    pains: ['레슨비 수납 추적', '스케줄 조율 복잡', '회원 성장 기록 없음'],
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const demoHref = user ? '/club/home' : '/login?next=%2Fclub%2Fhome'

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] overflow-hidden">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 py-20 sm:py-28 text-center">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#beff00] bg-[#beff00]/10 px-3 py-1.5 rounded-full mb-6">
            🏸 배드민턴 동호회 운영 플랫폼
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            동호회 운영,<br />
            <span className="text-[#beff00]">카톡으로 하고 계세요?</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/50 leading-relaxed mb-10 max-w-2xl mx-auto">
            출석 체크, 회비 정산, 자동 팀 배정까지.<br />
            매주 반복되는 번거로운 운영을 한 번에 해결하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={demoHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#beff00] text-[#0a0a0a] font-extrabold text-[16px] rounded-xl hover:brightness-95 transition-all"
            >
              🏸 데모 직접 체험하기
            </Link>
            <Link
              href="/survey"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white/70 font-semibold text-[16px] rounded-xl hover:border-white/50 hover:text-white transition-all"
            >
              설문 참여하기
            </Link>
          </div>
          <p className="text-sm text-white/25 mt-5">닉네임만으로 바로 시작 · 베타 무료</p>
        </div>
      </section>

      {/* ── 고통 포인트 ───────────────────────────────── */}
      <section className="bg-[#f7f7f7] border-y border-[#ebebeb]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
              혹시 이런 상황, 겪고 계신가요?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PAIN_POINTS.map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-[#ebebeb]">
                <div className="text-3xl mb-4">{emoji}</div>
                <h3 className="text-[17px] font-bold text-[#0a0a0a] mb-2">{title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 솔루션 2가지 축 ───────────────────────────── */}
      <section className="bg-white border-b border-[#ebebeb]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#beff00] bg-[#beff00]/10 px-3 py-1 rounded-full">
              핵심 기능
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] mt-4">
              두 가지가 유기적으로 연결됩니다
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 현장 게임보드 */}
            <div className="bg-[#0a0a0a] rounded-2xl p-8 text-white">
              <div className="text-3xl mb-4">🏸</div>
              <h3 className="text-xl font-extrabold mb-3">현장 게임보드</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                코트 현장에서 폰으로. 출석 체크부터 팀 배정, 경기 결과까지 실시간으로.
              </p>
              <ul className="space-y-2.5">
                {['출석 체크 & 대기열 관리', '실력 기반 자동 팀 배정', '경기 결과 입력 & 전적'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                    <span className="text-[#beff00] font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* 클럽 운영 관리 */}
            <div className="bg-[#f7f7f7] rounded-2xl p-8 border border-[#ebebeb]">
              <div className="text-3xl mb-4">⚙️</div>
              <h3 className="text-xl font-extrabold mb-3">클럽 운영 관리</h3>
              <p className="text-[#666] text-sm mb-6 leading-relaxed">
                총무·모임장을 위한 운영 도구. 회원 DB, 회비 정산, 통계까지 한 곳에서.
              </p>
              <ul className="space-y-2.5">
                {['회원 관리 (역할·실력·상태)', '회비 납부 현황 & 정산', '출석 통계 & 랭킹'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[#444]">
                    <span className="text-[#0a0a0a] font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* 연결 포인트 */}
          <div className="mt-6 bg-[#beff00]/8 border border-[#beff00]/20 rounded-2xl px-6 py-5 text-center">
            <p className="text-sm font-semibold text-[#0a0a0a]">
              현장 출석 → 자동 회비 계산 &nbsp;·&nbsp; 경기 결과 → 자동 랭킹 업데이트 &nbsp;·&nbsp; 회원 등급 → 팀 배정에 반영
            </p>
          </div>
        </div>
      </section>

      {/* ── 6가지 기능 그리드 ─────────────────────────── */}
      <section className="bg-[#f7f7f7] border-b border-[#ebebeb]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-[#ebebeb] hover:border-[#beff00] hover:shadow-sm transition-all">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1.5">{title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 타겟 페르소나 ─────────────────────────────── */}
      <section className="bg-white border-b border-[#ebebeb]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
              이런 분들을 위해 만들었어요
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TARGETS.map(({ role, emoji, pains }) => (
              <div key={role} className="rounded-2xl border border-[#ebebeb] p-6">
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="text-[17px] font-bold text-[#0a0a0a] mb-4">{role}</h3>
                <ul className="space-y-2">
                  {pains.map(pain => (
                    <li key={pain} className="flex items-start gap-2 text-sm text-[#666]">
                      <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 최하단 CTA ────────────────────────────────── */}
      <section className="bg-[#0a0a0a]">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-8 py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            지금 바로 체험해보세요
          </h2>
          <p className="text-white/40 mb-10 text-lg">
            로그인 없이 · 설치 없이 · 무료로
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={demoHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#beff00] text-[#0a0a0a] font-extrabold text-[16px] rounded-xl hover:brightness-95 transition-all"
            >
              🏸 데모 체험하기
            </Link>
            <Link
              href="/survey"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white/60 font-semibold text-[16px] rounded-xl hover:border-white/40 hover:text-white transition-all"
            >
              설문으로 의견 남기기
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
