'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { QUIZ_QUESTIONS, calcLevel } from '@/data/quizQuestions'

export function QuizClient() {
  const router = useRouter()
  const [current, setCurrent] = useState(0) // 0-indexed
  const [scores, setScores] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  const question = QUIZ_QUESTIONS[current]
  const total = QUIZ_QUESTIONS.length
  const progress = ((current) / total) * 100

  const handleSelect = (score: number) => {
    if (animating) return
    setSelected(score)
    setAnimating(true)

    setTimeout(() => {
      const newScores = [...scores, score]
      setScores(newScores)
      setSelected(null)
      setAnimating(false)

      if (current + 1 >= total) {
        const totalScore = newScores.reduce((a, b) => a + b, 0)
        const level = calcLevel(totalScore)
        router.push('/quiz/result/' + encodeURIComponent(level) + '?score=' + totalScore)
      } else {
        setCurrent(prev => prev + 1)
      }
    }, 350)
  }

  const handleBack = () => {
    if (current === 0) {
      router.push('/')
      return
    }
    setScores(prev => prev.slice(0, -1))
    setCurrent(prev => prev - 1)
    setSelected(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* 헤더 */}
      <div className="max-w-xl mx-auto w-full px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs text-white/40 font-medium tracking-wide">
            {current + 1} / {total}
          </span>
        </div>

        {/* 프로그레스 바 */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-[#beff00] rounded-full transition-all duration-500 ease-out"
            style={{ width: progress + '%' }}
          />
        </div>

        {/* 질문 */}
        <div className="mb-8">
          <p className="text-xs text-[#beff00] font-semibold tracking-widest uppercase mb-3">
            Q{current + 1}
          </p>
          <h2 className="text-[22px] sm:text-[26px] font-bold text-white leading-[1.4] tracking-[-0.02em]">
            {question.question}
          </h2>
        </div>

        {/* 선택지 */}
        <div className="space-y-3">
          {question.choices.map((choice, idx) => {
            const isSelected = selected === choice.score
            return (
              <button
                key={idx}
                onClick={() => handleSelect(choice.score)}
                disabled={animating}
                className={
                  'w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 text-[15px] font-medium leading-relaxed ' +
                  (isSelected
                    ? 'bg-[#beff00] border-[#beff00] text-[#0a0a0a]'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20')
                }
              >
                <span className={
                  'mr-3 text-xs font-bold ' +
                  (isSelected ? 'text-[#0a0a0a]/50' : 'text-white/30')
                }>
                  {String.fromCharCode(65 + idx)}
                </span>
                {choice.text}
              </button>
            )
          })}
        </div>
      </div>

      {/* 하단 여백 */}
      <div className="flex-1" />
      <div className="pb-6 max-w-xl mx-auto w-full px-4">
        <p className="text-center text-xs text-white/20">
          선택하면 자동으로 다음 질문으로 넘어가요
        </p>
      </div>
    </div>
  )
}
