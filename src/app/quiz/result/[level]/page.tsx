'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { Copy, Check, RotateCcw } from 'lucide-react'
import { LEVEL_RESULTS } from '@/lib/quiz/results'
import { QuizRadarChart } from '@/components/quiz/QuizRadarChart'
import { QuizSqueeze } from '@/components/quiz/QuizSqueeze'
import { createClient } from '@/lib/supabase/client'
import type { QuizLevel } from '@/lib/quiz/questions'

const VALID_LEVELS: QuizLevel[] = ['왕초보', '초심자', 'D조', 'C조']

export default function QuizResultPage({ params }: { params: Promise<{ level: string }> }) {
  const { level: rawLevel } = use(params)
  const level = decodeURIComponent(rawLevel) as QuizLevel
  const result = VALID_LEVELS.includes(level) ? LEVEL_RESULTS[level] : LEVEL_RESULTS['왕초보']

  const [unlocked, setUnlocked] = useState(false)
  const [copied, setCopied] = useState(false)

  // 블러 해제 조건 체크
  useEffect(() => {
    // 1. localStorage 확인
    if (localStorage.getItem('quiz_unlocked') === 'true') {
      setUnlocked(true)
      return
    }
    // 2. 로그인 확인
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUnlocked(true)
    })
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 블러 구간 내부 콘텐츠 (공통으로 사용)
  const lockedContent = (
    <>
      {/* 라켓 조건 */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">내 라켓 조건</p>
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
          <p className="text-xs text-white/40 leading-relaxed">{result.racketCondition.reason}</p>
        </div>
      </div>

      {/* 추천 라켓 */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">추천 라켓 보러가기</p>
        <Link
          href={`/rackets?level=${encodeURIComponent(level)}`}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#beff00] text-[#0a0a0a] font-bold text-sm rounded-xl hover:brightness-105 transition-all"
        >
          {level} 맞춤 라켓 보기
        </Link>
      </div>

      {/* 다음 레벨 */}
      <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">다음 목표</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="px-3 py-1 bg-white/8 rounded-full text-sm font-bold text-white">{result.nextLevel}</div>
          <span className="text-white/30 text-sm">을 향해</span>
        </div>
        <p className="text-sm text-white/60 leading-relaxed">{result.nextLevelTip}</p>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">

        {/* -- 공개 영역 -- */}

        {/* 레벨 배지 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#beff00]/10 border border-[#beff00]/20 text-[#beff00] text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">
            내 레벨
          </div>
          <div className="text-6xl mb-3">{result.emoji}</div>
          <h1 className="text-[42px] sm:text-[56px] font-extrabold text-white tracking-[-0.04em] mb-2">
            {result.level}
          </h1>
          <p className="text-white/60 text-base leading-relaxed">{result.tagline}</p>
        </div>

        {/* 레벨 설명 */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
          <p className="text-white/70 text-[15px] leading-[1.85]">{result.description}</p>
        </div>

        {/* 레이더 차트 */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 sm:p-6 mb-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">능력치 분석</p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <QuizRadarChart labels={result.radarLabels} data={result.radarData} />
            <div className="w-full space-y-2">
              {result.radarLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-12 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#beff00] rounded-full transition-all duration-700"
                      style={{ width: `${result.radarData[i]}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/30 w-8 text-right">{result.radarData[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 공유 버튼 */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] border border-white/8 rounded-2xl text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors"
          >
            {copied ? <Check size={15} className="text-[#beff00]" /> : <Copy size={15} />}
            {copied ? '복사됨!' : '링크 복사'}
          </button>
          <Link
            href="/quiz"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] border border-white/8 rounded-2xl text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors"
          >
            <RotateCcw size={15} />
            다시 테스트
          </Link>
        </div>

        {/* -- 블러 구간 -- */}
        <div>
          {/* 훅 배너 */}
          {!unlocked && (
            <div className="bg-[#beff00]/5 border border-[#beff00]/15 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔒</span>
                <p className="text-sm font-bold text-white">딱 이것만 확인하면 라켓 선택 끝</p>
              </div>
              <ul className="space-y-1.5">
                {['내 레벨에 맞는 라켓 무게·강성 조건', '지금 바로 살 수 있는 추천 라켓 3종', '다음 레벨 달성 로드맵'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                    <span className="text-[#beff00] text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 블러 상태: 콘텐츠 미리보기 + 그라데이션 */}
          {!unlocked && (
            <>
              <div className="relative" style={{ maxHeight: '280px', overflow: 'hidden' }}>
                <div className="pointer-events-none select-none opacity-60 blur-[2px]">
                  {lockedContent}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
              </div>

              {/* 스퀴즈 폼 */}
              <QuizSqueeze level={level} onUnlock={() => setUnlocked(true)} />
            </>
          )}

          {/* 언락 후: 전체 콘텐츠 표시 */}
          {unlocked && lockedContent}
        </div>

        {/* 블러 해제 후 CTA */}
        {unlocked && (
          <div className="mt-6 text-center">
            <p className="text-xs text-white/25">이메일로 맞춤 라켓 가이드를 보내드릴게요</p>
          </div>
        )}

      </div>
    </div>
  )
}
