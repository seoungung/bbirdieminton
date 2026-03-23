'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { QUIZ_QUESTIONS, calcLevel } from '@/lib/quiz/questions'

export function QuizClient() {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  const current = QUIZ_QUESTIONS[currentIdx]
  const total = QUIZ_QUESTIONS.length
  const progress = ((currentIdx) / total) * 100

  const handleSelect = (score: number, optIdx: number) => {
    if (animating) return
    setSelected(optIdx)
    setAnimating(true)
    setTimeout(() => {
      const newAnswers = [...answers, score]
      if (currentIdx + 1 >= total) {
        // 완료
        const totalScore = newAnswers.reduce((a, b) => a + b, 0)
        const level = calcLevel(totalScore)
        router.push(`/quiz/result/${encodeURIComponent(level)}`)
      } else {
        setAnswers(newAnswers)
        setCurrentIdx(i => i + 1)
        setSelected(null)
        setAnimating(false)
      }
    }, 400)
  }

  const handleBack = () => {
    if (currentIdx === 0) {
      router.push('/')
      return
    }
    setAnswers(a => a.slice(0, -1))
    setCurrentIdx(i => i - 1)
    setSelected(null)
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
                style={{ width: `${progress + (1/total)*100}%` }}
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
