import type { Metadata } from 'next'
import { HeroSection } from '@/components/landing/HeroSection'
import { PainPointsSection } from '@/components/landing/PainPointsSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { FounderNoteSection } from '@/components/landing/FounderNoteSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FinalCTASection } from '@/components/landing/FinalCTASection'

export const metadata: Metadata = {
  title: '버디민턴 | 동호인이 만든 배드민턴 운영 도구',
  description:
    '인원, 매칭, 운영까지 — 혼자 책임지지 마세요. 게임보드, 회비 정산, 랭킹, 공지를 한 곳에서. 동호인이 만들고, 만든 사람이 첫 사용자입니다.',
  openGraph: {
    title: '버디민턴 | 동호인이 만든 배드민턴 운영 도구',
    description:
      '인원, 매칭, 운영까지 — 혼자 책임지지 마세요. 게임보드, 회비 정산, 랭킹, 공지를 한 곳에서.',
  },
}

/**
 * 랜딩 페이지 — 신 Hero + product 섹션 블렌드.
 *
 *  01 · Hero            — 헤드라인 3줄 + 단일 lime CTA (above the fold)
 *  02 · Pain Points     — 카톡/엑셀/팀배정, 공감 트리거 카드 3개
 *  03 · Features        — 게임보드/회비/랭킹/공지, alternating layout
 *  04 · Founder Note    — 압축된 1인칭 raw 톤 (이전 5섹션 영웅 서사를 1섹션으로)
 *  05 · Testimonials    — 페르소나 5명 (런칭 후 실제 후기로 교체)
 *  06 · FAQ             — 8개, native <details> accordion
 *  07 · Final CTA       — lime 단일 primary
 *
 * 톤 교차: SaaS 마케팅 매끄러움(Pain/Features/Testimonials/FAQ)과
 *         founder의 raw 1인칭(Hero, Founder Note)이 자연스럽게 alternation.
 *
 * 마케팅 헤더/푸터는 MarketingShell이 감싼다.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PainPointsSection />
      <FeaturesSection />
      <FounderNoteSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
    </>
  )
}
