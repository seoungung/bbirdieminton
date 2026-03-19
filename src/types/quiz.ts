export type QuizLevel = 'beginner' | 'novice' | 'd_class' | 'c_class'

export interface QuizOption {
  label: string
  text: string
  score: number
}

export interface QuizQuestion {
  id: number
  axis: string
  question: string
  options: QuizOption[]
}

export interface RadarStats {
  power: number
  control: number
  endurance: number
  skill: number
  experience: number
  mental: number
}

export interface RecommendedRacket {
  name: string
  brand: string
  price: string
  reason: string
  slug: string
}

export interface LevelData {
  id: QuizLevel
  label: string
  scoreRange: [number, number]
  emoji: string
  tagline: string
  description: string
  radar: RadarStats
  radarComment: string
  racketCondition: {
    weight: string
    weightDesc: string
    balance: string
    balanceDesc: string
    flex: string
    flexDesc: string
    price: string
    priceDesc: string
    comment: string
  }
  recommendedRackets: RecommendedRacket[]
  racketComment: string
  nextLevel: {
    label: string
    checklist: string[]
    comment: string
  }
  ogColor: string
  stibeeTag: string
}
