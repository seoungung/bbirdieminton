import type { Metadata } from 'next'
import { QuizClient } from '@/components/quiz/QuizClient'

export const metadata: Metadata = {
  title: '레벨 테스트 | 버디민턴',
  description: '17문항으로 내 배드민턴 레벨을 진단하세요. 왕초보부터 C조까지 맞춤 라켓을 추천해드려요.',
}

export default function QuizPage() {
  return <QuizClient />
}
