import type { Metadata } from 'next'
import { HeroSection } from '@/components/landing/HeroSection'
import { StorySection, StoryImage } from '@/components/landing/StorySection'
import { TryAttemptsTimeline } from '@/components/landing/TryAttemptsTimeline'
import { FinalCTASection } from '@/components/landing/FinalCTASection'

export const metadata: Metadata = {
  title: '버디민턴 | 동호인이 만든 배드민턴 운영 도구',
  description:
    '인원, 매칭, 운영까지 — 혼자 책임지지 마세요. 동호인이 만들고, 만든 사람이 첫 사용자입니다.',
  openGraph: {
    title: '버디민턴 | 동호인이 만든 배드민턴 운영 도구',
    description:
      '인원, 매칭, 운영까지 — 혼자 책임지지 마세요. 동호인이 만들고, 만든 사람이 첫 사용자입니다.',
  },
}

/**
 * 랜딩 페이지 — Hero + 영웅 서사 5섹션.
 *
 *  Hero        — 헤드라인 3줄 + 단일 lime CTA (above the fold)
 *  Section 01  — 시작 (배드민턴을 처음 만난 이야기)
 *  Section 02  — 관찰 (운영진 옆에서 본 매주의 짐)
 *  Section 03  — 시도들 (v1·v2·v3 타임라인)
 *  Section 04  — 약속 (eat-your-own-dogfood)
 *  Section 05  — CTA 재등장
 *
 * 마케팅 헤더/푸터는 MarketingShell이 감싼다.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* 01 — 시작 */}
      <StorySection
        index="01"
        eyebrow="시작"
        after={<StoryImage tone="fresh" label="체육관 / 라켓 사진 자리" />}
      >
        <p>
          서울 이사 와서 친구 사귀려고
          <br />
          운동 모임을 다녔어요.
        </p>
        <p>
          러닝하다가, 어느 겨울에
          <br />
          모임장 권유로 배드민턴 시작.
          <br />
          그게 처음이었습니다.
        </p>
      </StorySection>

      {/* 02 — 관찰 */}
      <StorySection index="02" eyebrow="관찰">
        <p>
          여러 모임 거치면서
          <br />
          운영진 옆에서 봤습니다.
        </p>
        <p>
          매주 게임 매칭에 30분 쓰는 모임장,
          <br />
          신입이 한두 번 오고 안 오는 모임,
          <br />
          정보가 카톡·엑셀·종이에 흩어진 모임.
        </p>
        <p className="font-semibold text-[#111]">
          한 명이 너무 많은 걸 떠안고 있었어요.
        </p>

        {/* 시련 톤 placeholder — section 2 분위기 */}
        <StoryImage
          tone="muted"
          label="카톡·엑셀·종이가 흩어진 운영 mock"
          ratio="4/3"
        />
      </StorySection>

      {/* 03 — 시도들 (타임라인) */}
      <TryAttemptsTimeline />

      {/* 04 — 약속 */}
      <StorySection
        index="04"
        eyebrow="약속"
        after={
          <StoryImage tone="lime" label="운동 마친 동호회 mood (얼굴 X)" />
        }
      >
        <p>
          올여름, 이 도구로 저도 첫 모임을 시작합니다.
          <br />
          {`'버디민턴' 브랜드로.`}
        </p>
        <p>
          매주 게임 매칭이 자동으로,
          <br />
          신입이 첫날 매칭에 들어가고,
          <br />
          운영 정보가 한 곳에 모이는 모임.
        </p>
        <p>
          같이 쾌적하고 쉬운 배드민턴을
          <br />
          즐겼으면 좋겠어요.
        </p>
      </StorySection>

      {/* 05 — CTA 재등장 */}
      <FinalCTASection />
    </>
  )
}
