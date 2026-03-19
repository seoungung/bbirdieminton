import { create } from 'zustand'
import { getLevel } from '@/data/quiz-levels'

interface QuizState {
  isStarted: boolean
  answers: Record<number, number>
  currentQuestion: number
  start: () => void
  setAnswer: (id: number, score: number) => void
  next: () => void
  back: () => void
  reset: () => void
  totalScore: () => number
  resolvedLevel: () => string
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  isStarted: false,
  answers: {},
  currentQuestion: 1,

  start: () => set({ isStarted: true, answers: {}, currentQuestion: 1 }),

  setAnswer: (id, score) =>
    set((s) => ({ answers: { ...s.answers, [id]: score } })),

  next: () => set((s) => ({ currentQuestion: Math.min(s.currentQuestion + 1, 17) })),

  back: () => set((s) => ({ currentQuestion: Math.max(s.currentQuestion - 1, 1) })),

  reset: () => set({ isStarted: false, answers: {}, currentQuestion: 1 }),

  totalScore: () => Object.values(get().answers).reduce((sum, s) => sum + s, 0),

  resolvedLevel: () => getLevel(get().totalScore()),
}))
