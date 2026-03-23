import type { Metadata } from 'next'
import { QuizClient } from '@/components/quiz/QuizClient'

export const metadata: Metadata = {
  title: '레벨 테스트 | 버디민턴',
  description: '17문항으로 알아보는 내 배드민턴 레벨 — 왕초보부터 C조까지',
}

export default function QuizPage() {
  return <QuizClient />
}
