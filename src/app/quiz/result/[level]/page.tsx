import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react'
import { RacketRadarChart } from '@/components/racket/RacketRadarChart'
import { RacketCard } from '@/components/racket/RacketCard'
import { ShareSection } from '@/components/quiz/QuizResultClient'
import { BlurSection } from '@/components/quiz/BlurSection'
import { createClient } from '@/lib/supabase/server'
import { LEVEL_RESULTS } from '@/data/quizQuestions'
import type { Metadata } from 'next'
import type { Racket } from '@/types/racket'

type QuizLevel = '왕초보' | '초심자' | 'D조' | 'C조'

interface Props {
  params: Promise<{ level: string }>
  searchParams: Promise<{ score?: string }>
}

const LEVEL_COLORS: Record<QuizLevel, string> = {
  '왕초보': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  '초심자': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  'D조':   'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  'C조':   'bg-red-500/20 text-red-300 border border-red-500/30',
}

const LEVEL_EMOJIS: Record<QuizLevel, string> = {
  '왕초보': '\uD83C\uDF31',
  '초심자': '\uD83C\uDFC3',
  'D조': '\u26A1',
  'C조': '\uD83D\uDD25',
}

async function getRecommendedRackets(level: QuizLevel): Promise<Racket[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('rackets')
      .select('*')
      .contains('level', [level])
      .order('editor_pick', { ascending: false })
      .order('is_popular', { ascending: false })
      .limit(3)
    return (data ?? []) as Racket[]
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level } = await params
  const decodedLevel = decodeURIComponent(level) as QuizLevel
  if (!LEVEL_RESULTS[decodedLevel]) return {}
  const result = LEVEL_RESULTS[decodedLevel]
  return {
    title: `내 레벨은 "${decodedLevel}" | 버디민턴 레벨 테스트`,
    description: result.label,
    openGraph: {
      title: `내 배드민턴 레벨은 "${decodedLevel}"`,
      description: result.label,
    },
  }
}

export default async function QuizResultPage({ params, searchParams }: Props) {
  const { level } = await params
  const { score: scoreStr } = await searchParams
  const decodedLevel = decodeURIComponent(level) as QuizLevel
  const result = LEVEL_RESULTS[decodedLevel]
  if (!result) notFound()

  const score = scoreStr ? parseInt(scoreStr, 10) : null
  const rackets = await getRecommendedRackets(decodedLevel)

  const { power, control, speed, stamina, technique, tactics } = result.radarStats

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* 뒤로가기 */}
        <Link
          href="/quiz"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <ArrowLeft size={12} />
          다시 테스트하기
        </Link>

        {/* 레벨 배지 + 한 줄 정의 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className={
              'text-sm font-bold px-4 py-2 rounded-full ' +
              LEVEL_COLORS[decodedLevel]
            }>
              {LEVEL_EMOJIS[decodedLevel]} {decodedLevel}
            </span>
            {score !== null && (
              <span className="text-xs text-white/30 font-medium">
                {score}점 / 68점
              </span>
            )}
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-white leading-[1.3] tracking-[-0.02em]">
            {result.label}
          </h1>
        </div>

        {/* 레벨 설명 */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-6">
          <p className="text-[15px] text-white/70 leading-[1.8]">
            {result.description}
          </p>
        </div>

        {/* 레이더 차트 */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white/80 mb-4">내 플레이 스타일</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <RacketRadarChart
                power={power}
                control={control}
                speed={speed}
                durability={stamina}
                repulsion={technique}
                maneuver={tactics}
              />
            </div>
            <div className="flex-1 w-full space-y-2.5">
              {[
                { label: '파워', value: power },
                { label: '컨트롤', value: control },
                { label: '스피드', value: speed },
                { label: '체력', value: stamina },
                { label: '기술', value: technique },
                { label: '전술', value: tactics },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="text-white/40 text-xs w-12 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#beff00] rounded-full" style={{ width: value + '%' }} />
                  </div>
                  <span className="text-xs font-medium w-6 text-right tabular-nums text-white/60">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 공유 버튼 */}
        <div className="flex justify-center mb-8">
          <ShareSection level={decodedLevel} score={score ?? 0} />
        </div>

        {/* 블러 섹션 */}
        <BlurSection level={decodedLevel}>
          <div className="space-y-6">
            {/* 라켓 조건 */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4">
                {decodedLevel}에게 맞는 라켓 조건
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '무게', value: result.racketCondition.weight },
                  { label: '밸런스', value: result.racketCondition.balance },
                  { label: '강성', value: result.racketCondition.flex },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-white/40 mb-1">{label}</p>
                    <p className="text-xs font-semibold text-white leading-tight">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/50 leading-relaxed">
                {result.tip}
              </p>
            </div>

            {/* 추천 라켓 3종 */}
            {rackets.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/80 mb-3">
                  {decodedLevel} 추천 라켓
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {rackets.map(r => (
                    <RacketCard key={r.id} racket={r} />
                  ))}
                </div>
                <Link
                  href={'/rackets?level=' + encodeURIComponent(decodedLevel)}
                  className="mt-3 flex items-center justify-center gap-1 text-xs text-[#beff00] hover:brightness-90 transition-all"
                >
                  {decodedLevel} 라켓 전체 보기
                  <ChevronRight size={12} />
                </Link>
              </div>
            )}

            {/* 다음 레벨 안내 */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-2">
                다음 목표: {result.nextLevel}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">
                꾸준한 연습과 올바른 장비 선택이 레벨업을 앞당겨 줘요. 버디민턴이 응원합니다!
              </p>
            </div>
          </div>
        </BlurSection>

        {/* 다시 테스트 버튼 */}
        <div className="mt-8 text-center">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <RotateCcw size={14} />
            다시 테스트하기
          </Link>
        </div>

      </div>
    </div>
  )
}
