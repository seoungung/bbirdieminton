'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft, ChevronRight, Trophy, Users, Calendar, Gamepad2,
  Wallet, Settings as SettingsIcon, Sparkles, TrendingUp, Clock,
  Megaphone, Share2, ClipboardList,
} from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { GradeBadge } from '@/components/club/GradeBadge'
import type { ClubViewData, MemberViewItem, RegularSessionItem, GameSessionItem } from './clubview/types'

interface Props {
  club: ClubViewData
  members: MemberViewItem[]
  regularSessions: RegularSessionItem[]
  gameSessions: GameSessionItem[]
  clubId: string
  isAuthenticated: boolean
}

/**
 * 🏸 데모 대시보드
 *
 * Saramin My Home 스타일 — 탭 대신 한 화면에 위젯을 정렬해
 * 모임 현황 + 주요 기능 진입점을 동시에 보여줍니다.
 */
export function DemoDashboardClient({
  club,
  members,
  regularSessions,
  gameSessions,
  clubId,
  isAuthenticated,
}: Props) {
  const [toast, setToast] = useState('')

  /* ── 집계 ── */
  const topRankings = [...members]
    .sort((a, b) => (b.skill ?? 0) - (a.skill ?? 0))
    .slice(0, 3)

  const closedSessions = gameSessions.filter(s => s.status === 'closed')
  const recentSessions = closedSessions.slice(0, 3)
  const nextRegularSession = regularSessions[0] ?? null

  /* ── 공유 핸들러 ── */
  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${club.name} - 버디민턴 체험`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setToast('링크가 복사됐어요')
        setTimeout(() => setToast(''), 2000)
      }
    } catch {
      /* 사용자 취소 */
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-28">
      {/* ── 상단 바 ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto flex items-center justify-between px-5 h-14">
          <button
            onClick={() => (window.location.href = '/club/home')}
            className="text-[#555] hover:text-[#111] transition-colors"
            aria-label="뒤로"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full tracking-wider">
              DEMO
            </span>
            <span className="text-base font-bold text-[#111] truncate max-w-[200px]">{club.name}</span>
          </div>
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#f8f8f8] transition-colors"
            aria-label="공유"
          >
            <Share2 size={17} className="text-[#555]" />
          </button>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <main className="max-w-[1088px] mx-auto px-5 py-6 space-y-4">
        {/* 1. Hero Welcome */}
        <section
          className="relative bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-3xl p-6 overflow-hidden"
        >
          {/* 장식 셔틀콕 */}
          <div className="absolute -right-4 -bottom-4 opacity-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/symbol_birdieminton-color.png" alt="" width={140} height={140} className="h-36 w-auto" aria-hidden="true" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="text-[#beff00]" strokeWidth={2.5} />
              <span className="text-[10px] font-extrabold text-[#beff00] uppercase tracking-wider">
                오늘의 모임
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1 leading-tight">
              안녕하세요, 체험자님 👋
            </h1>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              {club.location} · {club.activityPlace} · 운영자 {club.leaderName}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-white/80 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
                {club.category}
              </span>
              <span className="text-[11px] font-semibold text-white/80 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                <Users size={10} strokeWidth={2.5} />
                {club.memberCount}명
              </span>
              <span className="text-[11px] font-semibold text-white/80 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                <ShuttlecockIcon size={10} strokeWidth={2} />
                코트 {club.court_count}면
              </span>
            </div>
          </div>
        </section>

        {/* 2. KPI 카드 4개 */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            Icon={Users}
            label="총 멤버"
            value={`${club.memberCount}명`}
            delta="+2명"
            deltaTone="up"
            accent="blue"
          />
          <KpiCard
            Icon={ShuttlecockIcon}
            label="누적 경기"
            value={`${closedSessions.length}회`}
            delta="이번 달"
            accent="emerald"
          />
          <KpiCard
            Icon={Calendar}
            label="정기 모임"
            value={`${regularSessions.length}개`}
            delta="매주 운영"
            accent="amber"
          />
          <KpiCard
            Icon={Trophy}
            label="1위"
            value={topRankings[0]?.name ?? '-'}
            delta={topRankings[0] ? `${topRankings[0].skill}점` : ''}
            accent="violet"
          />
        </section>

        {/* 3. 다음 정기모임 + 랭킹 TOP 3 (2단) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* 다음 정기모임 */}
          {nextRegularSession ? (
            <Link
              href={`/club/${clubId}?tab=${encodeURIComponent('정기모임')}`}
              className="group block bg-white rounded-3xl border border-[#e5e5e5] p-5 hover:border-[#beff00] hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-emerald-600" strokeWidth={2.5} />
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                    다음 정기모임
                  </span>
                </div>
                <ChevronRight size={16} className="text-[#ccc] group-hover:text-[#111] transition-colors" />
              </div>
              <p className="text-lg font-extrabold text-[#111] mb-1">{nextRegularSession.title}</p>
              <p className="text-sm text-[#555] mb-3">
                {nextRegularSession.dayOfWeek}요일 · {nextRegularSession.time}
              </p>
              <p className="text-xs text-[#999] mb-4">📍 {nextRegularSession.place}</p>

              {/* 참여 프로그레스 */}
              <div className="mb-2 flex justify-between text-[11px]">
                <span className="text-[#999]">참여 현황</span>
                <span className="font-bold text-[#111] tabular-nums">
                  {nextRegularSession.currentAttend} / {nextRegularSession.maxAttend}명
                </span>
              </div>
              <div className="w-full bg-[#f0f0f0] rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (nextRegularSession.currentAttend / nextRegularSession.maxAttend) * 100)}%`,
                  }}
                />
              </div>
            </Link>
          ) : (
            <EmptyCard
              icon={<Calendar size={32} className="text-[#ccc]" strokeWidth={1.5} />}
              label="등록된 정기모임이 없어요"
            />
          )}

          {/* 랭킹 TOP 3 */}
          <Link
            href={`/club/${clubId}/ranking`}
            className="group block bg-white rounded-3xl border border-[#e5e5e5] p-5 hover:border-[#beff00] hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Trophy size={13} className="text-amber-500" strokeWidth={2.5} />
                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                  랭킹 TOP 3
                </span>
              </div>
              <ChevronRight size={16} className="text-[#ccc] group-hover:text-[#111] transition-colors" />
            </div>
            <div className="space-y-2.5">
              {topRankings.map((m, idx) => (
                <div key={m.id} className="flex items-center gap-2.5">
                  <span className="text-base shrink-0 w-5 text-center" aria-label={`${idx + 1}위`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                  <GradeBadge score={m.skill ?? 0} size="xs" />
                  <span className="text-sm font-semibold text-[#111] flex-1 truncate">{m.name}</span>
                  <span className="text-[11px] font-bold text-[#999] tabular-nums">{m.skill}점</span>
                </div>
              ))}
            </div>
          </Link>
        </section>

        {/* 4. 바로 시작하기 (Quick Shortcuts) */}
        <section>
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Sparkles size={13} className="text-[#555]" strokeWidth={2.5} />
            <p className="text-xs font-extrabold text-[#555] uppercase tracking-wider">
              바로 시작하기
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <ShortcutCard
              href={`/club/${clubId}/gameboard`}
              Icon={Gamepad2}
              label="게임보드"
              desc="대진·점수 관리"
              accent="lime"
              primary
            />
            <ShortcutCard
              href={`/club/${clubId}/settlements`}
              Icon={Wallet}
              label="셔틀콕 정산"
              desc="비용 계산·납부"
              accent="emerald"
            />
            <ShortcutCard
              href={`/club/${clubId}/members`}
              Icon={Users}
              label="멤버 관리"
              desc="급수·역할"
              accent="blue"
            />
            <ShortcutCard
              href={`/club/${clubId}?tab=${encodeURIComponent('운영&관리')}`}
              Icon={SettingsIcon}
              label="운영·관리"
              desc="회비·공지"
              accent="violet"
            />
          </div>
        </section>

        {/* 5. 최근 경기 기록 */}
        <section className="bg-white rounded-3xl border border-[#e5e5e5] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <ClipboardList size={13} className="text-[#555]" strokeWidth={2.5} />
              <span className="text-xs font-extrabold text-[#555] uppercase tracking-wider">
                최근 경기 기록
              </span>
            </div>
            <Link
              href={`/club/${clubId}?tab=${encodeURIComponent('게임보드')}`}
              className="text-[11px] font-bold text-[#555] hover:text-[#111] transition-colors inline-flex items-center gap-0.5"
            >
              더 보기 <ChevronRight size={11} />
            </Link>
          </div>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-[#bbb] text-center py-4">아직 경기 기록이 없어요</p>
          ) : (
            <div className="space-y-1">
              {recentSessions.map(s => {
                const d = new Date(s.sessionDate)
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-2.5 border-b border-[#f0f0f0] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <ShuttlecockIcon size={14} className="text-emerald-600" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111]">
                          {d.toLocaleDateString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </p>
                        {s.notes && (
                          <p className="text-[11px] text-[#999] mt-0.5 line-clamp-1">{s.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#999] bg-[#f8f8f8] border border-[#e5e5e5] px-2 py-0.5 rounded-full">
                      완료
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 6. 모임 활동 */}
        <section className="bg-white rounded-3xl border border-[#e5e5e5] p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Megaphone size={13} className="text-[#555]" strokeWidth={2.5} />
            <span className="text-xs font-extrabold text-[#555] uppercase tracking-wider">
              모임 활동
            </span>
          </div>
          <div className="space-y-2.5">
            <ActivityRow
              Icon={TrendingUp}
              iconTone="emerald"
              title={`운영자 ${club.leaderName}님이 모임을 만들었어요`}
              time="2일 전"
            />
            <ActivityRow
              Icon={Users}
              iconTone="blue"
              title={`신규 멤버 가입 +2명`}
              time="1일 전"
            />
            <ActivityRow
              Icon={ShuttlecockIcon}
              iconTone="amber"
              title={`지난 세션 10명 참여`}
              time="어제"
            />
          </div>
        </section>

        {/* 7. 전체 탭 뷰로 전환 안내 */}
        <Link
          href={`/club/${clubId}`}
          className="block bg-white rounded-3xl border border-dashed border-[#bbb] p-5 text-center hover:border-[#111] hover:bg-[#f8f8f8] transition-all group"
        >
          <p className="text-sm font-bold text-[#111] mb-1">
            더 자세한 모임 정보가 궁금하다면?
          </p>
          <p className="text-xs text-[#999] mb-3">공지, 게시판, 앨범, 출석 현황까지 탭으로 둘러보기</p>
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#111] group-hover:text-[#beff00] transition-colors">
            전체 모임 페이지 열기
            <ChevronRight size={12} />
          </span>
        </Link>
      </main>

      {/* ── 데모 체험 하단 바 ── */}
      {isAuthenticated && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-[#e5e5e5] shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          <div className="max-w-[1088px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Gamepad2 size={16} className="text-[#555] shrink-0" strokeWidth={2} />
              <span className="text-sm font-semibold text-[#555] truncate">체험 중입니다</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.open('https://forms.gle/demo', '_blank')}
                className="text-xs font-semibold text-[#555] border border-[#e5e5e5] px-3 py-2 rounded-xl hover:bg-[#f8f8f8] transition-colors whitespace-nowrap"
              >
                설문 참여하기
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-bold text-[#111] bg-[#beff00] px-3 py-2 rounded-xl hover:brightness-95 transition-all whitespace-nowrap"
              >
                <Share2 size={12} strokeWidth={2.5} />
                공유하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0a] text-white text-sm px-4 py-2.5 rounded-full shadow-lg animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  )
}

/* ── 하위 컴포넌트들 ──────────────────────────────── */

type AccentTone = 'lime' | 'emerald' | 'blue' | 'amber' | 'violet'

function KpiCard({
  Icon,
  label,
  value,
  delta,
  deltaTone,
  accent,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  label: string
  value: string
  delta?: string
  deltaTone?: 'up' | 'down'
  accent: AccentTone
}) {
  const accentStyles: Record<AccentTone, { bg: string; text: string }> = {
    lime: { bg: 'bg-lime-100', text: 'text-lime-700' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-700' },
  }
  const c = accentStyles[accent]
  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
      <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <Icon size={16} className={c.text} strokeWidth={2.2} />
      </div>
      <p className="text-lg font-extrabold text-[#111] tabular-nums truncate">{value}</p>
      <p className="text-[11px] text-[#999] mt-0.5">{label}</p>
      {delta && (
        <p
          className={`text-[10px] font-bold mt-1 inline-flex items-center gap-0.5 ${
            deltaTone === 'up' ? 'text-emerald-600' : 'text-[#999]'
          }`}
        >
          {deltaTone === 'up' && <TrendingUp size={9} strokeWidth={3} />}
          {delta}
        </p>
      )}
    </div>
  )
}

function ShortcutCard({
  href,
  Icon,
  label,
  desc,
  accent,
  primary,
}: {
  href: string
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  label: string
  desc: string
  accent: AccentTone
  primary?: boolean
}) {
  const accentStyles: Record<AccentTone, { icon: string; iconBg: string }> = {
    lime: { icon: 'text-[#111]', iconBg: 'bg-[#beff00]' },
    emerald: { icon: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    blue: { icon: 'text-blue-700', iconBg: 'bg-blue-100' },
    amber: { icon: 'text-amber-700', iconBg: 'bg-amber-100' },
    violet: { icon: 'text-violet-700', iconBg: 'bg-violet-100' },
  }
  const c = accentStyles[accent]
  return (
    <Link
      href={href}
      className={`group block rounded-2xl p-4 transition-all ${
        primary
          ? 'bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white hover:brightness-110'
          : 'bg-white border border-[#e5e5e5] hover:border-[#beff00] hover:shadow-sm'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center mb-2.5`}>
        <Icon size={18} className={c.icon} strokeWidth={2.2} />
      </div>
      <p className={`text-sm font-extrabold mb-0.5 ${primary ? 'text-white' : 'text-[#111]'}`}>
        {label}
      </p>
      <p className={`text-[10px] ${primary ? 'text-white/60' : 'text-[#999]'}`}>{desc}</p>
      <ChevronRight
        size={12}
        className={`mt-2 transition-transform group-hover:translate-x-0.5 ${
          primary ? 'text-[#beff00]' : 'text-[#bbb]'
        }`}
      />
    </Link>
  )
}

function EmptyCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bg-white rounded-3xl border border-dashed border-[#ddd] p-6 flex flex-col items-center justify-center text-center min-h-[180px]">
      {icon}
      <p className="text-sm text-[#999] mt-2">{label}</p>
    </div>
  )
}

function ActivityRow({
  Icon,
  iconTone,
  title,
  time,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  iconTone: 'emerald' | 'blue' | 'amber'
  title: string
  time: string
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  }
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${tones[iconTone]}`}>
        <Icon size={13} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111] truncate">{title}</p>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-[#999] shrink-0">
        <Clock size={10} />
        {time}
      </div>
    </div>
  )
}
