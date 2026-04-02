import type { Metadata } from 'next'
import { QuizResultClient } from '@/components/quiz/QuizResultClient'

type Props = { params: Promise<{ level: string }> }

const LEVEL_META: Record<string, { title: string; description: string }> = {
  '왕초보': {
    title: '왕초보 레벨 진단 결과',
    description: '아직 셔틀이 어디로 갈지 모르죠. 저도 그랬어요. 지금 딱 맞는 라켓을 찾아드릴게요.',
  },
  '초심자': {
    title: '초심자 레벨 진단 결과',
    description: '기본기가 잡히고 있어요. 백핸드만 빼고요. 다음 단계가 보이기 시작할 때예요.',
  },
  'D조': {
    title: 'D조 레벨 진단 결과',
    description: '라켓이 뭔가 안 맞는 느낌. 저도 지금 여기 있어요. 스펙부터 다시 맞춰봐요.',
  },
  'C조': {
    title: 'C조 레벨 진단 결과',
    description: '오랜만에 온 동호인이 "많이 늘었다"고 말해줄 레벨이에요. 라켓도 그에 맞게요.',
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level: rawLevel } = await params
  const level = decodeURIComponent(rawLevel)
  const meta = LEVEL_META[level] ?? {
    title: `${level} 레벨 진단 결과`,
    description: '내 배드민턴 레벨과 맞춤 라켓을 확인해보세요.',
  }

  const ogImageUrl = `/api/og?name=${encodeURIComponent('나는 배드민턴 ' + level)}` +
    `&level=${encodeURIComponent(level)}&type=${encodeURIComponent('레벨 진단 결과')}`

  return {
    title: `${meta.title} | Birdieminton`,
    description: meta.description,
    openGraph: {
      title: `나는 배드민턴 ${level}이에요 — Birdieminton`,
      description: meta.description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${level} 레벨 진단 결과` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `나는 배드민턴 ${level}이에요`,
      description: meta.description,
      images: [ogImageUrl],
    },
  }
}

export default function QuizResultPage({ params }: Props) {
  return <QuizResultClient params={params} />
}
