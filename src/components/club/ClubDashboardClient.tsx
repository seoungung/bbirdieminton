'use client'

import Link from 'next/link'
import {
  ChevronRight, Trophy, Users, Calendar, Gamepad2,
  Wallet, Sparkles, TrendingUp, Clock, Megaphone, ClipboardList,
  Settings as SettingsIcon, FileSpreadsheet,
} from 'lucide-react'
import { ShuttlecockIcon } from '@/components/icons/ShuttlecockIcon'
import { GradeBadge } from '@/components/club/GradeBadge'
import type { MemberViewItem, RegularSessionItem, GameSessionItem } from './clubview/types'
import { LatestBlogWidget } from './dashboard/LatestBlogWidget'

interface Props {
  clubId: string
  clubName: string
  clubDescription: string
  clubLocation: string
  activityPlace: string
  category: string
  leaderName: string
  memberCount: number
  courtCount: number
  members: MemberViewItem[]
  regularSessions: RegularSessionItem[]
  gameSessions: GameSessionItem[]
  isManager?: boolean
}

/**
 * 🖥️ 모임 대시보드 홈 (/club/[clubId])
 *
 * AppShell 사이드바 안에서 렌더링됨.
 * Saramin My Home 스타일 — KPI + 다음 정기모임 + 랭킹 + 바로가기 + 활동 피드.
 */
export function ClubDashboardClient({
  clubId,
  clubName,
  clubLocation,
  activityPlace,
  category,
  leaderName,
  memberCount,
  courtCount,
  members,
  regularSessions,
  gameSessions,
  isManager,
}: Props) {
  /* ── 집계 ── */
  const topRankings = [...members]
    .filter(m => typeof m.skill === 'number')
    .sort((a, b) => (b.skill ?? 0) - (a.skill ?? 0))
    .slice(0, 3)

  const closedSessions = gameSessions.filter(s => s.status === 'closed')
  const recentSessions = gameSessions.slice(0, 3)
  const nextRegularSession = regularSessions[0] ?? null

  return (
    <div className="max-w-[1088px] mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-5 pb-8">
      {/* 1. Hero Welcome */}
      <section className="relative bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-3xl p-6 lg:p-8 overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/symbol_birdieminton-color.png" alt="" width={160} height={160} className="h-40 w-auto" aria-hidden="true" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={12} className="text-[var(--color-brand-lime)]" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-[var(--color-brand-lime)] uppercase tracking-widest">
              오늘의 모임
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">
            {clubName}
          </h1>
          <p className="text-sm text-white/60 mb-4 leading-relaxed">
            {clubLocation && <>{clubLocation} · </>}
            {activityPlace && <>{activityPlace} · </>}
            운영자 {leaderName}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Chip>{category}</Chip>
            <Chip>
              <Users size={10} strokeWidth={2.5} />
              {memberCount}명
            </Chip>
            <Chip>
              <ShuttlecockIcon size={10} strokeWidth={2} />
              코트 {courtCount}면
            </Chip>
          </div>
        </div>
      </section>

      {/* 2. KPI 카드 4개 */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          Icon={Users}
          label="총 회원"
          value={`${memberCount}명`}
          accent="info"
        />
        <KpiCard
          Icon={ShuttlecockIcon}
          label="누적 경기"
          value={`${closedSessions.length}회`}
          delta={closedSessions.length > 0 ? '이번 달' : undefined}
          accent="success"
        />
        <KpiCard
          Icon={Calendar}
          label="정기 모임"
          value={`${regularSessions.length}개`}
          delta={regularSessions.length > 0 ? '운영 중' : undefined}
          accent="success"
        />
        <KpiCard
          Icon={Trophy}
          label="1위"
          value={topRankings[0]?.name ?? '-'}
          delta={topRankings[0] ? `${topRankings[0].skill}점` : ''}
          accent="primary"
        />
      </section>

      {/* 3. 다음 정기모임 + 랭킹 TOP 3 (2단) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {nextRegularSession ? (
          <Link
            href={`/club/${clubId}/events`}
            className="group block bg-white rounded-3xl border border-[#e5e5e5] p-5 hover:border-[var(--color-brand-lime)] hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[var(--color-brand-court)]" strokeWidth={2.5} />
                <span className="text-[11px] font-bold text-[var(--color-brand-court-deep)] uppercase tracking-widest">
                  다음 정기모임
                </span>
              </div>
              <ChevronRight size={16} className="text-[#ccc] group-hover:text-[#111] transition-colors" />
            </div>
            <p className="text-lg font-bold text-[#111] mb-1">{nextRegularSession.title}</p>
            <p className="text-sm text-[#555] mb-3">
              {nextRegularSession.dayOfWeek}요일 · {nextRegularSession.time}
            </p>
            <p className="text-xs text-[#999] mb-4">📍 {nextRegularSession.place}</p>
            <div className="mb-2 flex justify-between text-[11px]">
              <span className="text-[#999]">참여 현황</span>
              <span className="font-bold text-[#111] tabular-nums">
                {nextRegularSession.currentAttend} / {nextRegularSession.maxAttend}명
              </span>
            </div>
            <div className="w-full bg-[#f0f0f0] rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-[var(--color-brand-court)] rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    nextRegularSession.maxAttend > 0
                      ? (nextRegularSession.currentAttend / nextRegularSession.maxAttend) * 100
                      : 0
                  )}%`,
                }}
              />
            </div>
          </Link>
        ) : (
          <Link
            href={`/club/${clubId}/events`}
            className="block group bg-white rounded-3xl border border-dashed border-[#ddd] hover:border-[var(--color-brand-lime)] hover:bg-[#fafafa] p-6 flex flex-col items-center justify-center text-center min-h-[180px] transition-all"
          >
            <Calendar size={32} className="text-[#ccc] group-hover:text-[var(--color-brand-court)]" strokeWidth={1.5} />
            <p className="text-sm text-[#999] mt-2">등록된 정기모임이 없어요</p>
            <p className="text-[11px] text-[#bbb] mt-0.5">새 정기모임 만들기 →</p>
          </Link>
        )}

        <Link
          href={`/club/${clubId}/ranking`}
          className="group block bg-white rounded-3xl border border-[#e5e5e5] p-5 hover:border-[var(--color-brand-lime)] hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Trophy size={13} className="text-[var(--color-brand-elite)]" strokeWidth={2.5} />
              <span className="text-[11px] font-bold text-[var(--color-brand-elite)] uppercase tracking-widest">
                랭킹 TOP 3
              </span>
            </div>
            <ChevronRight size={16} className="text-[#ccc] group-hover:text-[#111] transition-colors" />
          </div>
          {topRankings.length === 0 ? (
            <p className="text-sm text-[#bbb] text-center py-6">아직 경기 기록이 없어요</p>
          ) : (
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
          )}
        </Link>
      </section>

      {/* 4. 바로 시작하기 */}
      <section>
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <Sparkles size={13} className="text-[var(--color-brand-text-muted)]" strokeWidth={2.5} />
          <p className="text-[11px] font-bold text-[var(--color-brand-text-muted)] uppercase tracking-widest">
            바로 시작하기
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ShortcutCard
            href={`/club/${clubId}/gameboard`}
            Icon={Gamepad2}
            label="게임보드"
            desc="대진·점수 관리"
            accent="primary"
            primary
          />
          <ShortcutCard
            href={`/club/${clubId}/settlements`}
            Icon={Wallet}
            label="셔틀콕 정산"
            desc="비용 계산·납부"
            accent="success"
          />
          <ShortcutCard
            href={`/club/${clubId}/members`}
            Icon={Users}
            label="회원 관리"
            desc="급수·역할"
            accent="info"
          />
          <ShortcutCard
            href={`/club/${clubId}/settings`}
            Icon={SettingsIcon}
            label="운영·관리"
            desc="회비·공지"
            accent="info"
          />
        </div>
        {isManager && (
          <div className="mt-2.5 flex justify-end">
            <Link
              href={`/club/${clubId}/import`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555] border border-[#e5e5e5] px-3 py-1.5 rounded-xl hover:bg-[#f8f8f8] transition-colors"
            >
              <FileSpreadsheet size={13} />
              엑셀로 멤버 가져오기
            </Link>
          </div>
        )}
      </section>

      {/* 5. 최신 블로그 */}
      <LatestBlogWidget />

      {/* 7. 최근 경기 기록 */}
      <section className="bg-white rounded-3xl border border-[#e5e5e5] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ClipboardList size={13} className="text-[var(--color-brand-text-muted)]" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-[var(--color-brand-text-muted)] uppercase tracking-widest">
              최근 경기 기록
            </span>
          </div>
          <Link
            href={`/club/${clubId}/gameboard`}
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
              const label = s.status === 'closed' ? '완료' : s.status === 'in_progress' ? '진행 중' : '열림'
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2.5 border-b border-[#f0f0f0] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-court-bg)] border border-[var(--color-brand-court-soft)]/40 flex items-center justify-center">
                      <ShuttlecockIcon size={14} className="text-[var(--color-brand-court)]" strokeWidth={2} />
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
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      s.status === 'closed'
                        ? 'text-[#999] bg-[#f8f8f8] border-[#e5e5e5]'
                        : 'text-[var(--color-brand-court-deep)] bg-[var(--color-brand-court-bg)] border-[var(--color-brand-court-soft)]/40'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 8. 모임 활동 */}
      <section className="bg-white rounded-3xl border border-[#e5e5e5] p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <Megaphone size={13} className="text-[var(--color-brand-text-muted)]" strokeWidth={2.5} />
          <span className="text-[11px] font-bold text-[var(--color-brand-text-muted)] uppercase tracking-widest">
            모임 활동
          </span>
        </div>
        <div className="space-y-2.5">
          <ActivityRow
            Icon={TrendingUp}
            iconTone="success"
            title={`운영자 ${leaderName}님이 모임을 운영 중이에요`}
            time="활성"
          />
          <ActivityRow
            Icon={Users}
            iconTone="info"
            title={`현재 활성 회원 ${memberCount}명`}
            time="오늘"
          />
          {closedSessions.length > 0 && (
            <ActivityRow
              Icon={ShuttlecockIcon}
              iconTone="success"
              title={`누적 경기 ${closedSessions.length}회 진행됨`}
              time="전체 기간"
            />
          )}
        </div>
      </section>
    </div>
  )
}

/* ── Hero Chip ── */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold text-white/80 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
      {children}
    </span>
  )
}

/* ── KPI/Shortcut/Empty/Activity ── */
/* 3색 토큰 매핑: primary (라임 CTA) / success (코트 그린) / info (네이비 elite) */
type AccentTone = 'primary' | 'success' | 'info'

function KpiCard({
  Icon,
  label,
  value,
  delta,
  accent,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  label: string
  value: string
  delta?: string
  accent: AccentTone
}) {
  const accentStyles: Record<AccentTone, { bg: string; text: string }> = {
    primary: { bg: 'bg-[var(--color-brand-lime)]', text: 'text-[#111]' },
    success: { bg: 'bg-[var(--color-brand-court-bg)]', text: 'text-[var(--color-brand-court)]' },
    info: { bg: 'bg-[var(--color-brand-elite-bg)]', text: 'text-[var(--color-brand-elite)]' },
  }
  const c = accentStyles[accent]
  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
      <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <Icon size={16} className={c.text} strokeWidth={2.2} />
      </div>
      <p className="text-lg font-extrabold text-[#111] tabular-nums truncate">{value}</p>
      <p className="text-[11px] text-[#999] mt-0.5">{label}</p>
      {delta && <p className="text-[10px] font-bold mt-1 text-[#999]">{delta}</p>}
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
    primary: { icon: 'text-[#111]', iconBg: 'bg-[var(--color-brand-lime)]' },
    success: { icon: 'text-[var(--color-brand-court)]', iconBg: 'bg-[var(--color-brand-court-bg)]' },
    info: { icon: 'text-[var(--color-brand-elite)]', iconBg: 'bg-[var(--color-brand-elite-bg)]' },
  }
  const c = accentStyles[accent]
  return (
    <Link
      href={href}
      className={`group block rounded-2xl p-4 transition-all ${
        primary
          ? 'bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white hover:brightness-110'
          : 'bg-white border border-[#e5e5e5] hover:border-[var(--color-brand-lime)] hover:shadow-sm'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center mb-2.5`}>
        <Icon size={18} className={c.icon} strokeWidth={2.2} />
      </div>
      <p className={`text-sm font-bold mb-0.5 ${primary ? 'text-white' : 'text-[#111]'}`}>{label}</p>
      <p className={`text-[10px] ${primary ? 'text-white/60' : 'text-[#999]'}`}>{desc}</p>
      <ChevronRight
        size={12}
        className={`mt-2 transition-transform group-hover:translate-x-0.5 ${
          primary ? 'text-[var(--color-brand-lime)]' : 'text-[#bbb]'
        }`}
      />
    </Link>
  )
}

function ActivityRow({
  Icon,
  iconTone,
  title,
  time,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  iconTone: 'success' | 'info' | 'primary'
  title: string
  time: string
}) {
  const tones = {
    success: 'bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court)] border-[var(--color-brand-court-soft)]/40',
    info: 'bg-[var(--color-brand-elite-bg)] text-[var(--color-brand-elite)] border-[var(--color-brand-elite-soft)]/40',
    primary: 'bg-[var(--color-brand-lime)] text-[#111] border-[var(--color-brand-lime-dim)]/40',
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
