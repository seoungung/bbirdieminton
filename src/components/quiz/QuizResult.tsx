'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QuizRadarChart } from './QuizRadarChart'
import { QuizSqueeze } from './QuizSqueeze'
import { QUIZ_LEVELS } from '@/data/quiz-levels'
import type { QuizLevel } from '@/types/quiz'
import { cn } from '@/lib/utils'

const VALID_LEVELS: QuizLevel[] = ['beginner', 'novice', 'd_class', 'c_class']

interface QuizResultProps {
  level: string
}

export function QuizResult({ level }: QuizResultProps) {
  const safeLevel = VALID_LEVELS.includes(level as QuizLevel) ? (level as QuizLevel) : 'beginner'
  const data = QUIZ_LEVELS[safeLevel]
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin + '/quiz/result/' + safeLevel
    : '/quiz/result/' + safeLevel

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const lines = data.description.split('\n')

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">

        {/* ① 레벨 배지 + 태그라인 */}
        <div className="text-center py-6">
          <div className="text-6xl mb-4">{data.emoji}</div>
          <div className="inline-flex items-center gap-2 bg-[#beff00]/10 border border-[#beff00]/30 rounded-full px-4 py-1.5 mb-3">
            <span className="text-[#beff00] text-xs font-bold tracking-widest uppercase">내 레벨</span>
            <span className="text-[#beff00] font-extrabold">{data.label}</span>
          </div>
          <p className="text-white/60 text-sm">{data.tagline}</p>
        </div>

        {/* ② 레벨 설명 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="space-y-1.5">
            {lines.map((line, i) => (
              <p key={i} className="text-[14px] text-white/70 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>

        {/* ③ 레이더 차트 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <h3 className="text-[15px] font-bold text-white mb-4">내 능력치 분석</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <QuizRadarChart stats={data.radar} />
            </div>
            <div className="flex-1 w-full space-y-2.5">
              {[
                { label: '파워', value: data.radar.power },
                { label: '컨트롤', value: data.radar.control },
                { label: '지구력', value: data.radar.endurance },
                { label: '기술', value: data.radar.skill },
                { label: '경험', value: data.radar.experience },
                { label: '멘탈', value: data.radar.mental },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="text-white/40 text-xs w-12 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#beff00] rounded-full" style={{ width: value + '%' }} />
                  </div>
                  <span className="text-xs font-medium w-6 text-right text-white/60 tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[13px] text-white/40 mt-4 leading-relaxed">{data.radarComment}</p>
        </div>

        {/* ④ 공유 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 text-sm hover:border-white/30 hover:text-white transition-colors"
          >
            {copied ? '✓ 복사됨' : '🔗 링크 복사'}
          </button>
          <a
            href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent('배드민턴 레벨 테스트 결과: ' + data.label + ' ' + data.emoji + ' ' + data.tagline) + '&url=' + encodeURIComponent(shareUrl)}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 text-sm hover:border-white/30 hover:text-white transition-colors text-center"
          >
            𝕏 공유
          </a>
        </div>

        {/* 스퀴즈 */}
        <QuizSqueeze
          level={safeLevel}
          levelLabel={data.label}
          stibeeTag={data.stibeeTag}
          onUnlock={() => setIsUnlocked(true)}
        />

        {/* ⑤⑥⑦ 잠금 섹션 */}
        <div className={cn(
          'space-y-5 transition-all duration-700',
          isUnlocked ? 'filter-none opacity-100' : 'blur-sm opacity-40 pointer-events-none select-none'
        )}>

          {/* ⑤ 라켓 조건 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h3 className="text-[15px] font-bold text-white mb-4">🎿 내 레벨에 맞는 라켓 조건</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '무게', value: data.racketCondition.weight, desc: data.racketCondition.weightDesc },
                { label: '밸런스', value: data.racketCondition.balance, desc: data.racketCondition.balanceDesc },
                { label: '강성', value: data.racketCondition.flex, desc: data.racketCondition.flexDesc },
                { label: '가격대', value: data.racketCondition.price, desc: data.racketCondition.priceDesc },
              ].map(({ label, value, desc }) => (
                <div key={label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-[14px] font-bold text-white">{value}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-white/50 mt-4 leading-relaxed">{data.racketCondition.comment}</p>
          </div>

          {/* ⑥ 추천 라켓 3종 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h3 className="text-[15px] font-bold text-white mb-4">🏸 추천 라켓 3종</h3>
            <div className="space-y-3">
              {data.recommendedRackets.map((r, i) => (
                <Link
                  key={r.slug}
                  href={'/rackets/' + r.slug}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#beff00]/10 text-[#beff00] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{r.brand} {r.name}</p>
                    <p className="text-[11px] text-white/40">{r.price} · {r.reason}</p>
                  </div>
                  <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                </Link>
              ))}
            </div>
            <p className="text-[13px] text-white/40 mt-4 leading-relaxed">{data.racketComment}</p>
          </div>

          {/* ⑦ 다음 레벨 안내 */}
          <div className="rounded-2xl bg-[#beff00]/5 border border-[#beff00]/20 p-5">
            <h3 className="text-[15px] font-bold text-[#beff00] mb-4">
              🎯 {data.nextLevel.label}가 되려면?
            </h3>
            <ul className="space-y-2">
              {data.nextLevel.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] text-white/70">
                  <span className="text-[#beff00] mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-white/40 mt-4 leading-relaxed">{data.nextLevel.comment}</p>
          </div>

        </div>

        {/* 다시 하기 + 라켓 도감 */}
        <div className="flex gap-2 pt-2">
          <Link
            href="/quiz"
            className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 text-sm text-center hover:border-white/30 hover:text-white transition-colors"
          >
            다시 하기
          </Link>
          <Link
            href="/rackets"
            className="flex-1 py-3 rounded-xl bg-[#beff00] text-black font-bold text-sm text-center hover:brightness-110 transition-all"
          >
            라켓 도감 보기
          </Link>
        </div>

      </div>
    </div>
  )
}
