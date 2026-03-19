'use client'

import { useState, useEffect } from 'react'
import type { QuizQuestion } from '@/types/quiz'
import { QuizProgress } from './QuizProgress'
import { cn } from '@/lib/utils'

interface QuizQuestionProps {
  question: QuizQuestion
  current: number
  total: number
  onAnswer: (score: number) => void
  onBack: () => void
  canGoBack: boolean
}

export function QuizQuestionCard({ question, current, total, onAnswer, onBack, canGoBack }: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    setSelected(null)
  }, [question.id])

  const handleSelect = (score: number) => {
    if (selected !== null) return
    setSelected(score)
    setTimeout(() => onAnswer(score), 350)
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      <QuizProgress current={current} total={total} axis={question.axis} />

      <div className="min-h-[80px]">
        <p className="text-[19px] sm:text-[21px] font-bold text-white leading-snug">
          {question.question}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => {
          const isSelected = selected === opt.score
          return (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.score)}
              disabled={selected !== null}
              className={cn(
                'flex items-start gap-3 w-full text-left p-4 rounded-2xl border transition-all duration-200',
                isSelected
                  ? 'border-[#beff00] bg-[#beff00]/10 text-white'
                  : selected !== null
                  ? 'border-white/10 text-white/30'
                  : 'border-white/15 text-white hover:border-white/40 hover:bg-white/5 active:scale-[0.98]'
              )}
            >
              <span className={cn(
                'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors',
                isSelected ? 'bg-[#beff00] text-black' : 'bg-white/10 text-white/60'
              )}>
                {opt.label}
              </span>
              <span className="text-[14px] sm:text-[15px] leading-relaxed pt-0.5">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {canGoBack && (
        <button
          onClick={onBack}
          className="text-xs text-white/30 hover:text-white/60 transition-colors self-start"
        >
          ← 이전 문항
        </button>
      )}
    </div>
  )
}
