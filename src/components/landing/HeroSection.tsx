'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react'

import { GRADE_COLOR, type Grade } from '@/lib/club/grade'

/**
 * Above-the-fold Hero — 블랙 임팩트 + 인터랙티브 미니 게임보드.
 *
 * 톤 / 디자인:
 * - 풀 블랙 배경(#0a0a0a) + 화이트 텍스트 + 라임 액센트.
 * - 헤드라인 2줄 → 인터랙티브 데모 → 단일 lime CTA.
 * - 데모는 mount 직후 8명 풀 → 코트 1 배정 → 코트 2 배정 자동 시퀀스.
 *   사용자는 [다시 보기] 버튼으로 재실행 가능.
 *
 * 의도: 첫 화면에서 게임보드를 직접 "보여주는" 게 가장 강한 후크.
 */

const DEMO_PLAYERS: { name: string; grade: Grade }[] = [
  { name: '민준', grade: 'A' },
  { name: '서연', grade: 'B' },
  { name: '지호', grade: 'C' },
  { name: '유나', grade: 'B' },
  { name: '태양', grade: 'D' },
  { name: '소희', grade: 'C' },
  { name: '준서', grade: 'D' },
  { name: '채원', grade: 'E' },
]

// 균형 잡힌 배정: 합 평균 비슷하게 (A+D vs B+C, B+C vs D+E)
const COURT_1: [number, number, number, number] = [0, 4, 1, 5] // teamA: 민준+태양, teamB: 서연+소희
const COURT_2: [number, number, number, number] = [3, 6, 2, 7] // teamA: 유나+준서, teamB: 지호+채원

// 데모 결과: court 1은 21-18 박빙(A 승), court 2는 21-14 (B 큰 승)
// mu 변동 (실제 Glicko-2 계산이 아니라 시각화용 demo 값)
const COURT_1_SCORE = { a: 21, b: 18 }
const COURT_2_SCORE = { a: 14, b: 21 }
const PLAYER_DELTAS: Record<number, number> = {
  // court 1 — A팀 박빙승 +12, B팀 -10
  0: 12, 4: 12, 1: -10, 5: -10,
  // court 2 — B팀 큰 승 +14, A팀 -12
  3: -12, 6: -12, 2: 14, 7: 14,
}

type DemoStage = 'pool' | 'court1' | 'court2' | 'scored' | 'done'

interface HeroSectionProps {
  /** 로그인 상태이면 보조 CTA로 "내 모임으로 가기" 표시 */
  isLoggedIn?: boolean
}

export function HeroSection({ isLoggedIn }: HeroSectionProps = {}) {
  const [stage, setStage] = useState<DemoStage>('pool')
  const [tick, setTick] = useState(0) // restart trigger

  useEffect(() => {
    setStage('pool')
    const t1 = setTimeout(() => setStage('court1'), 1100)
    const t2 = setTimeout(() => setStage('court2'), 2300)
    const t3 = setTimeout(() => setStage('scored'), 3500)
    const t4 = setTimeout(() => setStage('done'), 4500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [tick])

  const placedIndices = new Set<number>()
  const courtsVisible = stage !== 'pool'
  const court2Visible = stage === 'court2' || stage === 'scored' || stage === 'done'
  const scoresVisible = stage === 'scored' || stage === 'done'
  const deltasVisible = stage === 'done'
  if (courtsVisible) COURT_1.forEach((i) => placedIndices.add(i))
  if (court2Visible) COURT_2.forEach((i) => placedIndices.add(i))

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-[#0a0a0a] text-white"
    >
      {/* 배경 — 라임 라디얼 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(219,230,76,0.18),transparent_65%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.10),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1100px] px-6 pt-20 pb-20 sm:pt-28 sm:pb-28">
        {/* 마커 */}
        <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
          <span
            aria-hidden
            className="inline-block h-[6px] w-[6px] rounded-full bg-[var(--color-brand-lime)] ring-2 ring-[var(--color-brand-lime)]/30"
          />
          <span>버디민턴 · 동호인이 만든 운영 도구</span>
        </div>

        {/* 헤드라인 */}
        <h1
          id="hero-heading"
          className="max-w-[820px] text-[34px] font-extrabold leading-[1.15] tracking-[-0.02em] text-white sm:text-[56px] sm:leading-[1.08]"
          style={{ wordBreak: 'keep-all' }}
        >
          <span className="block">매주의 매칭, 코트 두 개를</span>
          <span className="relative inline-block">
            10초 안에 짭니다.
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1 h-[10px] -z-10 bg-[var(--color-brand-lime)]/30 sm:-bottom-1.5 sm:h-[14px]"
            />
          </span>
        </h1>

        <p
          className="mt-7 max-w-[640px] text-[15px] italic leading-[1.7] text-white/60 sm:text-[17px]"
          style={{ wordBreak: 'keep-all' }}
        >
          — 동호인이 만들고, 만든 사람이 첫 사용자입니다.
        </p>

        {/* 인터랙티브 미니 게임보드 */}
        <div className="mt-10 sm:mt-14">
          <MiniGameboard
            stage={stage}
            placedIndices={placedIndices}
            scoresVisible={scoresVisible}
            deltasVisible={deltasVisible}
            court2Visible={court2Visible}
            onRestart={() => setTick((t) => t + 1)}
          />
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-start gap-4 sm:mt-12 sm:flex-row sm:items-center">
          <Link
            href="/login?next=%2Fclub%2Fcreate"
            className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand-lime)] px-8 text-[15px] font-extrabold text-[#0a0a0a] shadow-[0_12px_28px_-10px_rgba(219,230,76,0.45)] transition-all hover:bg-[var(--color-brand-lime-dim)] hover:shadow-[0_14px_32px_-8px_rgba(219,230,76,0.55)] focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-lime)]/40 sm:h-[60px] sm:w-auto sm:px-10 sm:text-[16px]"
          >
            1분 안에 직접 만들어보세요
            <ArrowRight
              size={18}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          {isLoggedIn ? (
            <Link
              href="/clubs"
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 px-5 py-3 text-[13px] font-bold text-white/80 transition-colors hover:border-white/40 hover:text-white sm:text-[14px]"
            >
              내 모임으로 가기
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          ) : (
            <p className="flex items-center gap-1.5 text-[13px] text-white/50 sm:text-[14px]">
              <span aria-hidden className="text-[var(--color-brand-lime)]">✓</span>
              가입 X · 카드 X · 1분
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

// ── 인터랙티브 미니 게임보드 ────────────────────────────────
function MiniGameboard({
  stage,
  placedIndices,
  scoresVisible,
  deltasVisible,
  court2Visible,
  onRestart,
}: {
  stage: DemoStage
  placedIndices: Set<number>
  scoresVisible: boolean
  deltasVisible: boolean
  court2Visible: boolean
  onRestart: () => void
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-6">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-brand-lime)]">
          <Sparkles size={12} strokeWidth={2.5} />
          자동 매칭 데모
        </div>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          <RotateCcw size={11} strokeWidth={2.5} />
          다시 보기
        </button>
      </div>

      {/* 참가자 풀 */}
      <div className="mb-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
          참가자 8명
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_PLAYERS.map((p, i) => {
            const placed = placedIndices.has(i)
            const color = GRADE_COLOR[p.grade]
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12px] font-bold text-white transition-all duration-500"
                style={{
                  opacity: placed ? 0.25 : 1,
                  filter: placed ? 'grayscale(0.6)' : 'none',
                }}
              >
                <span
                  className={`inline-flex h-4 w-4 items-center justify-center rounded text-[9px] font-extrabold ${color.bg} ${color.text}`}
                >
                  {p.grade}
                </span>
                {p.name}
              </span>
            )
          })}
        </div>
      </div>

      {/* 코트 2개 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CourtCard
          title="코트 1"
          visible={stage !== 'pool'}
          teamAIndices={[COURT_1[0], COURT_1[1]]}
          teamBIndices={[COURT_1[2], COURT_1[3]]}
          score={scoresVisible ? COURT_1_SCORE : null}
          showDeltas={deltasVisible}
        />
        <CourtCard
          title="코트 2"
          visible={court2Visible}
          teamAIndices={[COURT_2[0], COURT_2[1]]}
          teamBIndices={[COURT_2[2], COURT_2[3]]}
          score={scoresVisible ? COURT_2_SCORE : null}
          showDeltas={deltasVisible}
        />
      </div>

      {/* 하단 라벨 */}
      <p className="mt-4 text-center text-[11px] text-white/40">
        {stage === 'pool' && '실력 균형으로 두 코트를 자동 배정 중...'}
        {(stage === 'court1' || stage === 'court2') && '두 코트 자동 배정 중...'}
        {stage === 'scored' && '경기 결과 입력 중...'}
        {stage === 'done' && '경기할수록 더 정확해지는 실력 점수. 직접 매번 안 매겨도 돼요.'}
      </p>
    </div>
  )
}

function CourtCard({
  title,
  visible,
  teamAIndices,
  teamBIndices,
  score,
  showDeltas,
}: {
  title: string
  visible: boolean
  teamAIndices: [number, number]
  teamBIndices: [number, number]
  score: { a: number; b: number } | null
  showDeltas: boolean
}) {
  const teamA = teamAIndices.map((i) => ({ idx: i, ...DEMO_PLAYERS[i] }))
  const teamB = teamBIndices.map((i) => ({ idx: i, ...DEMO_PLAYERS[i] }))
  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#0a0a0a]/60 p-4 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0.15,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
          {title}
        </p>
        {score && (
          <p className="text-[11px] font-extrabold tabular-nums text-white">
            <span className={score.a > score.b ? 'text-[var(--color-brand-lime)]' : 'text-white/60'}>
              {score.a}
            </span>
            <span className="mx-1 text-white/30">:</span>
            <span className={score.b > score.a ? 'text-[var(--color-brand-lime)]' : 'text-white/60'}>
              {score.b}
            </span>
          </p>
        )}
      </div>
      <TeamRow color="blue" team={teamA} label="팀 A" showDeltas={showDeltas} />
      <div className="my-2 flex items-center gap-2 text-[9px] font-extrabold tracking-widest text-white/30">
        <div className="h-px flex-1 bg-white/10" />
        <span>VS</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <TeamRow color="red" team={teamB} label="팀 B" showDeltas={showDeltas} />
    </div>
  )
}

function TeamRow({
  color,
  team,
  label,
  showDeltas,
}: {
  color: 'blue' | 'red'
  team: { idx: number; name: string; grade: Grade }[]
  label: string
  showDeltas: boolean
}) {
  const tone = color === 'blue' ? 'text-blue-400' : 'text-red-400'
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-8 shrink-0 text-[9px] font-extrabold ${tone}`}>{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {team.map((p) => {
          const c = GRADE_COLOR[p.grade]
          const delta = PLAYER_DELTAS[p.idx]
          const isUp = delta > 0
          return (
            <span
              key={p.idx}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-white"
            >
              <span
                className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded text-[8px] font-extrabold ${c.bg} ${c.text}`}
              >
                {p.grade}
              </span>
              {p.name}
              {showDeltas && delta != null && (
                <span
                  className={`ml-0.5 text-[10px] font-extrabold tabular-nums ${
                    isUp ? 'text-[var(--color-brand-lime)]' : 'text-red-400'
                  }`}
                >
                  {isUp ? '▲+' : '▼'}{Math.abs(delta)}
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
