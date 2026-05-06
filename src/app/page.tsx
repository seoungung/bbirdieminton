import type { Metadata } from 'next'
import { getAuthUser } from '@/lib/supabase/server'
import { HeroSection } from '@/components/landing/HeroSection'
import { FounderNoteSection } from '@/components/landing/FounderNoteSection'
import { ClubsLiveSection } from '@/components/landing/ClubsLiveSection'
import { ValuesSection } from '@/components/landing/ValuesSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FinalCTASection } from '@/components/landing/FinalCTASection'

export const metadata: Metadata = {
  title: '버디민턴 | 매주의 매칭, 코트 두 개를 10초 안에',
  description:
    '매칭 30분이 10초. 회비 계산은 자동. 운영자 머리가 가벼워집니다. — 동호인이 만든 도구.',
  openGraph: {
    title: '버디민턴 | 매주의 매칭, 코트 두 개를 10초 안에',
    description:
      '매칭 30분이 10초. 회비 계산은 자동. 운영자 머리가 가벼워집니다. — 동호인이 만든 도구.',
  },
}

/**
 * 랜딩 페이지 v3 — 게임보드 메인 후크 + 스토리 인라인 + 라이브 모임 노출.
 *
 *  01 · Hero            — 블랙 + 인터랙티브 미니 게임보드 (자동 시퀀스)
 *  02 · Founder Note    — 압축 1인칭 raw + 블로그 첫 글로 링크
 *  02.5 · Clubs Live    — 운영 중 모임 6개 카드 + 전체 보기 → /clubs
 *  03 · Values          — 핵심 3가치 카드 (실력 매칭 / 회비 / 운영)
 *  04 · FAQ             — 8개 native <details> accordion
 *  05 · Final CTA       — 블랙 (수미상관) + 단일 lime primary
 *
 * 톤 전이: 블랙(Hero) → 라이트(Founder/Live/Values/FAQ) → 블랙(CTA).
 */
export default async function HomePage() {
  const user = await getAuthUser()
  return (
    <>
      <HeroSection isLoggedIn={!!user} />
      <FounderNoteSection />
      <ClubsLiveSection />
      <ValuesSection />
      <FAQSection />
      <FinalCTASection />
    </>
  )
}
