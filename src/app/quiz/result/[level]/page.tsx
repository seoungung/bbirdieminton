import type { Metadata } from 'next'
import { QUIZ_LEVELS } from '@/data/quiz-levels'
import { QuizResult } from '@/components/quiz/QuizResult'

interface Props { params: Promise<{ level: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level } = await params
  const data = QUIZ_LEVELS[level]
  if (!data) return {}
  return {
    title: '내 레벨: ' + data.label + ' ' + data.emoji + ' | Birdieminton 배린이 자가진단',
    description: data.tagline + ' — 레벨별 맞춤 라켓 추천까지.',
    openGraph: {
      title: data.label + ' ' + data.emoji,
      description: data.tagline,
    },
  }
}

export default async function ResultPage({ params }: Props) {
  const { level } = await params
  return <QuizResult level={level} />
}
