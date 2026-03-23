export type QuizLevel = '왕초보' | '초심자' | 'D조' | 'C조'

export interface QuizChoice {
  text: string
  score: number // 1~4
}

export interface QuizQuestion {
  id: number
  question: string
  choices: QuizChoice[]
}

export interface QuizResult {
  level: QuizLevel
  score: number
  label: string
  description: string
  radarStats: {
    power: number
    control: number
    speed: number
    stamina: number
    technique: number
    tactics: number
  }
  racketCondition: {
    weight: string
    balance: string
    flex: string
  }
  nextLevel: string
}
