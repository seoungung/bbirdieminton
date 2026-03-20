'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useQuizStore } from '@/stores/quiz-store'
import { QUIZ_QUESTIONS } from '@/data/quiz-questions'
import { QuizStart } from '@/components/quiz/QuizStart'
import { QuizQuestionCard } from '@/components/quiz/QuizQuestion'

export default function QuizPage() {
  const router = useRouter()
  const { isStarted, currentQuestion, answers, start, setAnswer, setGender, next, back, reset } = useQuizStore()

  const question = QUIZ_QUESTIONS[currentQuestion - 1]

  const handleAnswer = useCallback((score: number) => {
    setAnswer(question.id, score)
    if (currentQuestion === QUIZ_QUESTIONS.length) {
      const total = Object.values({ ...answers, [question.id]: score }).reduce((s, v) => s + v, 0)
      const level = total <= 27 ? 'beginner' : total <= 38 ? 'novice' : total <= 52 ? 'd_class' : 'c_class'
      router.push('/quiz/result/' + level)
    } else {
      next()
    }
  }, [question, currentQuestion, answers, setAnswer, next, router])

  const handleBack = useCallback(() => {
    back()
  }, [back])

  const handleStart = useCallback(() => {
    reset()
    start()
  }, [reset, start])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      {!isStarted ? (
        <QuizStart onStart={handleStart} onGenderSelect={setGender} />
      ) : (
        <QuizQuestionCard
          question={question}
          current={currentQuestion}
          total={QUIZ_QUESTIONS.length}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canGoBack={currentQuestion > 1}
        />
      )}
    </div>
  )
}
