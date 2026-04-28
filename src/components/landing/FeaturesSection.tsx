import { FeatureBlock } from './FeatureBlock'
import { FEATURES } from './features-data'

/**
 * Section 03 — Features.
 *
 * 이전 페이지의 FEATURES 4개 복원. 데이터는 features-data.ts,
 * 단일 alternating block 렌더는 FeatureBlock.tsx 분리.
 *
 * 톤 alternation: lime(emphasis 1회) → court → amber → neutral
 * Lime은 첫 feature(게임보드)에만 — 전체 lime 사용량 5~10% 룰 준수.
 */
export function FeaturesSection() {
  return (
    <>
      {/* 섹션 헤더 */}
      <section
        aria-labelledby="features-heading"
        className="border-t border-[#ebebeb] bg-white"
      >
        <div className="mx-auto max-w-[720px] px-6 pt-20 pb-4 text-center sm:pt-28">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
            FEATURES
          </p>
          <h2
            id="features-heading"
            className="text-[28px] font-extrabold leading-[1.18] tracking-[-0.01em] text-[#0a0a0a] sm:text-[44px] sm:leading-[1.12]"
            style={{ wordBreak: 'keep-all' }}
          >
            운영의 모든 것을 한 도구에.
          </h2>
        </div>
      </section>

      {FEATURES.map((feature, i) => (
        <FeatureBlock key={feature.eyebrow} feature={feature} index={i} />
      ))}
    </>
  )
}
