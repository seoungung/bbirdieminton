'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { QUIZ_QUESTIONS, calcLevel } from '@/lib/quiz/questions'

// 다음 문항 이미지 프리로드
function preloadImage(src: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  document.head.appendChild(link)
}

const PROGRESS_KEY = 'quiz_progress'

export function QuizClient() {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  // 중간 진행 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY)
      if (saved) {
        const { savedAnswers, savedIdx } = JSON.parse(saved) as { savedAnswers: number[]; savedIdx: number }
        if (savedIdx > 0 && savedIdx < QUIZ_QUESTIONS.length) {
          setAnswers(savedAnswers)
          setCurrentIdx(savedIdx)
        }
      }
    } catch {}
  }, [])

  const current = QUIZ_QUESTIONS[currentIdx]
  const total = QUIZ_QUESTIONS.length
  const progress = (currentIdx / total) * 100

  const handleSelect = (score: number, optIdx: number) => {
    if (animating) return
    setSelected(optIdx)
    setAnimating(true)
    // 다음 문항 이미지 즉시 프리로드
    const nextQ = QUIZ_QUESTIONS[currentIdx + 1]
    if (nextQ?.image) preloadImage(nextQ.image)
    setTimeout(() => {
      const newAnswers = [...answers, score]
      if (currentIdx + 1 >= total) {
        const level = calcLevel(newAnswers)
        localStorage.setItem('quiz_scores', JSON.stringify(newAnswers))
        localStorage.removeItem(PROGRESS_KEY)
        router.push(`/quiz/result/${encodeURIComponent(level)}`)
      } else {
        const nextIdx = currentIdx + 1
        setAnswers(newAnswers)
        setCurrentIdx(nextIdx)
        setSelected(null)
        setAnimating(false)
        // 진행 저장
        localStorage.setItem(PROGRESS_KEY, JSON.stringify({ savedAnswers: newAnswers, savedIdx: nextIdx }))
      }
    }, 400)
  }

  const handleBack = () => {
    if (currentIdx === 0) {
      localStorage.removeItem(PROGRESS_KEY)
      router.push('/')
      return
    }
    const prevAnswers = answers.slice(0, -1)
    const prevIdx = currentIdx - 1
    setAnswers(prevAnswers)
    setCurrentIdx(prevIdx)
    setSelected(null)
    // 뒤로 갔을 때도 저장
    if (prevIdx === 0) {
      localStorage.removeItem(PROGRESS_KEY)
    } else {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ savedAnswers: prevAnswers, savedIdx: prevIdx }))
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* 상단 */}
      <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-10 px-4 pt-4 pb-3 border-b border-white/5">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={handleBack} className="p-1.5 rounded-xl hover:bg-white/8 transition-colors text-white/50 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>레벨 테스트</span>
              <span>{currentIdx + 1} / {total}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#beff00] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress + (1 / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 문항 영역 */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="max-w-xl mx-auto w-full">
          {/* 질문 */}
          <div className="mb-8">
            <span className="text-xs font-semibold text-[#beff00] tracking-widest uppercase mb-3 block">
              Q{currentIdx + 1}
            </span>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-white leading-[1.4] tracking-[-0.02em]">
              {current.question}
            </h2>
          </div>

          {/* 문항 이미지 */}
          {current.image && (
            <div className="relative mb-8 rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/8 aspect-[1200/857]">
              <Image
                src={current.image}
                alt={current.question}
                fill
                className="object-cover"
                priority={currentIdx === 0}
              />
            </div>
          )}

          {/* 보기 */}
          <div className="space-y-3">
            {current.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt.score, idx)}
                disabled={animating}
                className={
                  'w-full text-left px-5 py-4 rounded-2xl border text-sm font-medium transition-all duration-200 ' +
                  (selected === idx
                    ? 'bg-[#beff00] border-[#beff00] text-[#0a0a0a] scale-[0.98]'
                    : 'bg-[#1a1a1a] border-white/8 text-white/80 hover:border-white/20 hover:bg-white/5 active:scale-[0.98]')
                }
              >
                <span className={
                  'inline-block w-6 h-6 rounded-lg text-center text-xs font-bold mr-3 leading-6 shrink-0 ' +
                  (selected === idx ? 'bg-[#0a0a0a]/20 text-[#0a0a0a]' : 'bg-white/8 text-white/40')
                }>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
