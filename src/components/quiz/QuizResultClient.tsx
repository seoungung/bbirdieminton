'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Copy, Check, RotateCcw, ChevronRight } from 'lucide-react'
import { LEVEL_RESULTS } from '@/lib/quiz/results'
import { calcRadar } from '@/lib/quiz/questions'
import { QuizRadarChart } from '@/components/quiz/QuizRadarChart'
import { QuizSqueeze } from '@/components/quiz/QuizSqueeze'
import { createClient } from '@/lib/supabase/client'
import type { QuizLevel } from '@/lib/quiz/questions'

const VALID_LEVELS: QuizLevel[] = ['왕초보', '초심자', 'D조', 'C조']

function parseFirstUrl(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    const match = trimmed.match(/"([^"]+)"/)
    const url = match ? match[1] : null
    return url && (url.startsWith('/') || url.startsWith('http')) ? url : null
  }
  return trimmed.startsWith('/') || trimmed.startsWith('http') ? trimmed : null
}

const BEGINNER_CHECKLIST = [
  {
    icon: '👟',
    title: '배드민턴화',
    desc: '운동화는 안 돼요. 실내 배드민턴화가 따로 있어요. 미끄러지지 않으려면 필수예요.',
  },
  {
    icon: '🪶',
    title: '깃털 셔틀콕',
    desc: '형광 셔틀콕은 대부분 체육관에서 안 받아줘요. 첫날 2~3만원 셔틀콕 비용 각오하세요.',
  },
  {
    icon: '🏢',
    title: '일반 코트 vs 클럽 코트',
    desc: '처음엔 일반 코트로 예약해서 쓰는 게 편해요. 클럽 코트는 소속 회원 전용이에요.',
  },
]

function RacketSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white/4 rounded-xl animate-pulse">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-white/8" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/8 rounded-md w-3/4" />
            <div className="h-2 bg-white/6 rounded-md w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function QuizResultClient({ params }: { params: Promise<{ level: string }> }) {
  const { level: rawLevel } = use(params)
  const level = decodeURIComponent(rawLevel) as QuizLevel
  const result = VALID_LEVELS.includes(level) ? LEVEL_RESULTS[level] : LEVEL_RESULTS['왕초보']

  const [unlocked, setUnlocked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [personalRadar, setPersonalRadar] = useState<number[] | null>(null)
  const [racketsFetching, setRacketsFetching] = useState(true)
  const [recommendedRackets, setRecommendedRackets] = useState<{
    id: string; slug: string; name: string; brand: string;
    price_range: string | null; stat_power: number | null; image_url: string | null;
  }[]>([])

  // 개인화 레이더 + 블러 해제 조건 체크
  useEffect(() => {
    const stored = localStorage.getItem('quiz_scores')
    if (stored) {
      try {
        const scores = JSON.parse(stored) as number[]
        setPersonalRadar(calcRadar(scores))
      } catch {}
    }

    if (localStorage.getItem('quiz_unlocked') === 'true') {
      setUnlocked(true)
      return
    }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUnlocked(true)
    })
  }, [])

  // 추천 라켓 fetch
  useEffect(() => {
    const fetchRackets = async () => {
      setRacketsFetching(true)
      const supabase = createClient()
      const { data: rackets } = await supabase
        .from('rackets')
        .select('id, slug, name, brand, price_range, stat_power, stat_control, stat_speed, image_url')
        .contains('level', [level])
        .neq('status', 'discontinued')
        .order('is_popular', { ascending: false })
        .limit(3)
      setRecommendedRackets(rackets ?? [])
      setRacketsFetching(false)
    }
    fetchRackets()
  }, [level])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const radarData = personalRadar ?? result.radarData

  const lockedContent = (
    <>
      {/* 추천 라켓 */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-base font-bold text-white">추천 라켓</p>
          <Link href={`/rackets?level=${encodeURIComponent(level)}`} className="text-xs text-[#beff00] hover:underline">
            전체 보기 →
          </Link>
        </div>
        <p className="text-sm text-white/70 mb-4">{result.racketPickReason}</p>
        {racketsFetching ? (
          <RacketSkeleton />
        ) : (
          <div className="space-y-3">
            {recommendedRackets.map((racket, i) => {
              const img = parseFirstUrl(racket.image_url)
              return (
                <Link
                  key={racket.id}
                  href={`/rackets/${racket.slug}`}
                  className="flex items-center gap-3 p-3 bg-white/4 hover:bg-white/8 rounded-xl transition-colors group"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-[#111] border border-white/8 overflow-hidden flex items-center justify-center">
                    {img ? (
                      <Image
                        src={img}
                        alt={racket.name ?? ''}
                        width={48}
                        height={48}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-xs font-bold text-[#beff00]">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate group-hover:text-[#beff00] transition-colors">
                      {racket.brand} {racket.name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">{racket.price_range}</p>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 shrink-0" />
                </Link>
              )
            })}
            {recommendedRackets.length === 0 && (
              <Link
                href={`/rackets?level=${encodeURIComponent(level)}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 text-sm text-[#beff00] hover:underline"
              >
                {level} 맞춤 라켓 보러가기 →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 왕초보 전용 — 첫 체육관 체크리스트 */}
      {level === '왕초보' && (
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
          <p className="text-base font-bold text-white mb-1">첫 체육관 체크리스트</p>
          <p className="text-xs text-white/40 mb-4">아무도 미리 알려주지 않는 것들이에요</p>
          <div className="space-y-4">
            {BEGINNER_CHECKLIST.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{item.title}</p>
                  <p className="text-xs text-white/80 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 라켓 조건 */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
        <p className="text-base font-bold text-white mb-4">내 라켓 조건</p>
        <div className="space-y-3">
          {[
            { label: '추천 무게', value: result.racketCondition.weight },
            { label: '밸런스', value: result.racketCondition.balance },
            { label: '강성 (Flex)', value: result.racketCondition.flex },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-sm text-white/40 shrink-0">{label}</span>
              <span className="text-sm text-white font-semibold text-right">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/6">
          <p className="text-xs text-white/75 leading-relaxed">{result.racketCondition.reason}</p>
        </div>
      </div>

      {/* 이번 달 집중 포인트 */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
        <p className="text-base font-bold text-white mb-4">이번 달 이것만 하세요</p>
        <div className="space-y-2.5">
          {result.focusThisMonth.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#beff00] text-[#0a0a0a] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-white/85 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 실수 경보 */}
      <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 sm:p-6 mb-5">
        <p className="text-base font-bold text-white mb-4">⚠️ 이 레벨에서 자주 하는 실수</p>
        <div className="space-y-2.5">
          {result.commonMistakes.map((mistake, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-red-400/60 text-sm shrink-0">•</span>
              <p className="text-sm text-white/85 leading-relaxed">{mistake}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 다음 레벨 */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
        <p className="text-base font-bold text-white mb-3">다음 목표</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="px-3 py-1 bg-white/8 rounded-full text-sm font-bold text-white">{result.nextLevel}</div>
          <span className="text-white/30 text-sm">을 향해</span>
        </div>
        <p className="text-sm text-white/85 leading-relaxed">{result.nextLevelTip}</p>
      </div>

      {/* 능력치 해석 */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6">
        <p className="text-base font-bold text-white mb-4">능력치 해석</p>
        <div className="space-y-3">
          {result.radarInsights.map((insight, i) => {
            const [label, ...rest] = insight.split(': ')
            return (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-bold text-[#beff00] bg-[#beff00]/10 px-2 py-1 rounded-md shrink-0 w-16 text-center">
                  {label}
                </span>
                <p className="text-sm text-white/85 leading-relaxed">{rest.join(': ')}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">

        {/* 레벨 배지 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#beff00]/10 border border-[#beff00]/20 text-[#beff00] text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">
            내 레벨
          </div>
          <div className="text-6xl mb-3">{result.emoji}</div>
          <h1 className="text-[42px] sm:text-[56px] font-extrabold text-white tracking-[-0.04em] mb-2">
            {result.level}
          </h1>
          <p className="text-white/85 text-base leading-relaxed">{result.tagline}</p>
        </div>

        {/* 레벨 설명 */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
          <p className="text-white/85 text-[15px] leading-[1.85]">{result.description}</p>
        </div>

        {/* 레이더 차트 */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-base font-bold text-white">능력치 분석</p>
            {personalRadar && (
              <span className="text-[10px] text-[#beff00]/60 bg-[#beff00]/8 px-2 py-0.5 rounded-full">내 답변 기반</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <QuizRadarChart labels={result.radarLabels} data={radarData} />
            <div className="w-full space-y-2">
              {result.radarLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-white/60 w-16 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#beff00] rounded-full transition-all duration-700"
                      style={{ width: `${radarData[i]}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/30 w-8 text-right">{radarData[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 공감 포인트 */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
          <p className="text-base font-bold text-white mb-4">이런 경험 있죠?</p>
          <div className="space-y-3">
            {result.empathyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-base shrink-0">😅</span>
                <p className="text-sm text-white/85 leading-relaxed">&ldquo;{point}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>

        {/* 공유 버튼 */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all ${
              copied
                ? 'bg-[#beff00] text-[#0a0a0a]'
                : 'bg-[#beff00]/10 border border-[#beff00]/30 text-[#beff00] hover:bg-[#beff00]/20'
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? '복사됨!' : '결과 공유하기'}
          </button>
          <Link
            href="/quiz"
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1a1a1a] border border-white/8 rounded-2xl text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors"
          >
            <RotateCcw size={15} />
          </Link>
        </div>

        {/* 블러 구간 */}
        <div>
          {!unlocked && (
            <div className="bg-[#beff00]/5 border border-[#beff00]/15 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔒</span>
                <p className="text-sm font-bold text-white">딱 이것만 확인하면 라켓 선택 끝</p>
              </div>
              <ul className="space-y-1.5">
                {[
                  '내 레벨에 맞는 추천 라켓 3종',
                  '내 레벨에 맞는 라켓 무게·강성 조건',
                  level === '왕초보' ? '첫 체육관 가기 전 체크리스트' : '다음 레벨 달성 로드맵',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                    <span className="text-[#beff00] text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!unlocked && (
            <>
              <div className="relative" style={{ maxHeight: '280px', overflow: 'hidden' }}>
                <div className="pointer-events-none select-none opacity-60 blur-[2px]">
                  {lockedContent}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
              </div>
              <QuizSqueeze level={level} onUnlock={() => setUnlocked(true)} />
            </>
          )}

          {unlocked && lockedContent}
        </div>

        {/* 언락 후 CTA */}
        {unlocked && (
          <div className="mt-8 space-y-3">
            <Link
              href={`/rackets?level=${encodeURIComponent(level)}`}
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#beff00] text-[#0a0a0a] font-extrabold text-[15px] rounded-2xl hover:bg-[#a8e600] transition-colors"
            >
              {level} 맞춤 라켓 전체 보기 →
            </Link>
            <p className="text-center text-xs text-white/25">
              맞춤 가이드를 이메일로 보내드렸어요. 받은편지함을 확인해보세요.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
