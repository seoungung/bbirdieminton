import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Trophy, TrendingUp, TrendingDown, Activity } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { getMyMembership, getMemberRatingDetail } from '@/lib/club/client'
import { GRADE_COLOR, GRADE_LABEL, scoreToGrade } from '@/lib/club/grade'
import { gradeProgress, muToGrade } from '@/lib/club/glicko2'
import { DEMO_CLUBS } from '@/lib/club/demoData'

interface PageProps {
  params: Promise<{ clubId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clubId } = await params
  const demo = DEMO_CLUBS.find((c) => c.id === clubId)
  const name = demo?.name
  return {
    title: name ? `내 카드 | ${name}` : '내 카드 | 버디민턴',
    description: '내 등급, 내 점수, 최근 경기 변동',
  }
}

export default async function MyCardPage({ params }: PageProps) {
  const { clubId } = await params

  // 데모 클럽: 가짜 데이터로 시각화
  if (clubId.startsWith('demo-')) {
    return <DemoMyCard />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) redirect('/login')

  const membership = await getMyMembership(supabase, clubId, clubUserId)
  if (!membership) redirect('/clubs')

  const detail = await getMemberRatingDetail(supabase, membership.id)

  const mu = detail.current?.mu ?? null
  const phi = detail.current?.phi ?? null
  const gamesPlayed = detail.current?.games_played ?? 0
  const updatedAt = detail.current?.updated_at ?? null

  const skillScore = membership.skill_score ?? 50
  const grade = mu != null ? muToGrade(mu) : scoreToGrade(skillScore)
  const progress = mu != null ? gradeProgress(mu) : null

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
              <Trophy size={16} strokeWidth={2} />내 카드
            </h1>
            <p className="text-xs text-[#999] mt-0.5">
              나만 보이는 페이지 · 매 경기마다 자동 갱신
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-[1088px] mx-auto px-4 py-5 space-y-4">
        {/* 등급 카드 */}
        <GradeCard grade={grade} mu={mu} phi={phi} progress={progress} />

        {/* 통계 카드 */}
        <StatsCard
          gamesPlayed={gamesPlayed}
          updatedAt={updatedAt}
          mu={mu}
          skillScore={skillScore}
        />

        {/* 최근 변동 history */}
        <HistoryCard history={detail.history} />
      </main>
    </div>
  )
}

// ── 등급 카드 (큰 라벨 + 진행도) ─────────────────────────
function GradeCard({
  grade,
  mu,
  phi,
  progress,
}: {
  grade: keyof typeof GRADE_LABEL
  mu: number | null
  phi: number | null
  progress: ReturnType<typeof gradeProgress> | null
}) {
  const color = GRADE_COLOR[grade]
  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <div className="flex items-start gap-4">
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold shrink-0 ${color.bg} ${color.text} border ${color.border}`}
        >
          {grade}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] mb-1">
            현재 등급
          </p>
          <p className="text-xl font-extrabold text-[#111]">
            {GRADE_LABEL[grade]}
          </p>
          {mu != null ? (
            <p
              className="text-xs text-[#555] mt-1.5 tabular-nums"
              title={`경기를 더 뛸수록 점수 오차가 줄어들어요 (현재 오차 범위 ±${Math.round(phi ?? 0)})`}
            >
              내 점수 {Math.round(mu)}
              <span className="text-[#999] ml-2">±{Math.round(phi ?? 0)}</span>
            </p>
          ) : (
            <p className="text-xs text-[#999] mt-1.5">
              아직 경기 기록이 없어요. 경기를 뛰면 점수가 쌓여요.
            </p>
          )}
        </div>
      </div>

      {progress && progress.next ? (
        <div className="mt-5">
          <div className="flex items-baseline justify-between mb-1.5">
            <p className="text-[11px] text-[#666]">
              다음 등급 <span className="font-bold text-[#111]">{progress.next}조</span>까지
            </p>
            <p className="text-[11px] font-bold text-[#111] tabular-nums">
              {Math.round(progress.toNext)}점 남음
            </p>
          </div>
          <div className="h-2 rounded-full bg-[#f0f0f0] overflow-hidden">
            <div
              className="h-full bg-[var(--color-brand-lime)] transition-[width]"
              style={{ width: `${(progress.progress * 100).toFixed(1)}%` }}
            />
          </div>
        </div>
      ) : progress?.next === null ? (
        <p
          className="text-[11px] text-[var(--color-brand-elite)] bg-[var(--color-brand-elite-bg)] border border-[var(--color-brand-elite-soft)]/60 rounded-lg px-3 py-2 mt-5"
          style={{ wordBreak: 'keep-all' }}
        >
          🏅 최고 등급(자강조)에 진입하셨어요. 유지가 진정한 실력이에요.
        </p>
      ) : null}
    </section>
  )
}

// ── 통계 카드 ────────────────────────────────────────────
function StatsCard({
  gamesPlayed,
  updatedAt,
  mu,
  skillScore,
}: {
  gamesPlayed: number
  updatedAt: string | null
  mu: number | null
  skillScore: number
}) {
  const updated = updatedAt
    ? new Date(updatedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Stat label="누적 경기" value={`${gamesPlayed}전`} />
      <Stat
        label="운영자 메모"
        value={`${skillScore}점`}
        hint="수동 등록값 (시드)"
      />
      <Stat
        label="마지막 갱신"
        value={updated ?? '—'}
        hint={mu != null ? '경기 후 자동' : '아직 없음'}
      />
    </section>
  )
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-1">
        {label}
      </p>
      <p className="text-base font-extrabold text-[#111] tabular-nums truncate">
        {value}
      </p>
      {hint && <p className="text-[10px] text-[#999] mt-0.5">{hint}</p>}
    </div>
  )
}

// ── 최근 변동 history ─────────────────────────────────────
function HistoryCard({
  history,
}: {
  history: Array<{
    mu: number
    delta_mu: number
    recorded_at: string
    match_id: string | null
  }>
}) {
  if (history.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-[#e5e5e5] p-8 text-center">
        <Activity size={32} className="text-[#ccc] mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-sm font-bold text-[#111]">변동 기록 없음</p>
        <p className="text-xs text-[#999] mt-1">
          경기 결과가 입력되면 점수 변동이 여기에 쌓여요.
        </p>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#f0f0f0]">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#999]">
          최근 변동
        </p>
        <p className="text-sm font-bold text-[#111] mt-0.5">
          최근 {history.length}경기 점수 흐름
        </p>
      </div>
      <ul className="divide-y divide-[#f0f0f0]">
        {history.map((h, i) => {
          const date = new Date(h.recorded_at).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
          })
          const isUp = h.delta_mu > 0
          const isDown = h.delta_mu < 0
          const isSeed = h.match_id === null
          return (
            <li
              key={`${h.recorded_at}-${i}`}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="w-12 text-[11px] text-[#999] tabular-nums">{date}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111] tabular-nums">
                  {Math.round(h.mu)}
                </p>
                <p className="text-[10px] text-[#999]">
                  {isSeed ? '초기 시드' : '경기 후'}
                </p>
              </div>
              <div
                className={`flex items-center gap-0.5 text-xs font-bold tabular-nums ${
                  isUp
                    ? 'text-[var(--color-brand-court)]'
                    : isDown
                    ? 'text-[var(--color-brand-team-b)]'
                    : 'text-[#999]'
                }`}
              >
                {isUp ? (
                  <TrendingUp size={14} strokeWidth={2.5} />
                ) : isDown ? (
                  <TrendingDown size={14} strokeWidth={2.5} />
                ) : null}
                {isUp ? '+' : ''}
                {Math.round(h.delta_mu)}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ── 데모 ──────────────────────────────────────────────────
function DemoMyCard() {
  const demoMu = 1654
  const demoGrade = muToGrade(demoMu)
  const progress = gradeProgress(demoMu)
  const today = new Date()
  const demoHistory = Array.from({ length: 8 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - i * 3)
    const delta = [12, -5, 18, -8, 9, -3, 15, -10][i]
    const mu = demoMu - [12, -5, 18, -8, 9, -3, 15, -10].slice(0, i + 1).reduce((a, b) => a + b, 0)
    return {
      mu,
      delta_mu: delta,
      recorded_at: d.toISOString(),
      match_id: 'demo',
    }
  })

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3">
        <div className="max-w-[1088px] mx-auto">
          <h1 className="text-base font-bold text-[#111] inline-flex items-center gap-1.5">
            <Trophy size={16} strokeWidth={2} />내 카드
          </h1>
          <p className="text-xs text-[#999] mt-0.5">
            체험 데이터 · 실제 모임에서는 본인 경기 기반으로 표시
          </p>
        </div>
      </header>
      <main className="max-w-[1088px] mx-auto px-4 py-5 space-y-4">
        <GradeCard grade={demoGrade} mu={demoMu} phi={92} progress={progress} />
        <StatsCard gamesPlayed={28} updatedAt={today.toISOString()} mu={demoMu} skillScore={62} />
        <HistoryCard history={demoHistory} />
      </main>
    </div>
  )
}
