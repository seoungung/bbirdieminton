import { Check } from 'lucide-react'
import {
  type Feature,
  TONE_GRADIENT,
  TONE_EYEBROW,
} from './features-data'

/**
 * FeatureBlock — 단일 feature alternating block.
 *
 *  - i % 2 === 0 → 카피 좌, 이미지 우
 *  - i % 2 === 1 → 카피 우, 이미지 좌 (lg+에서만, 모바일은 자연 stack)
 *  - 섹션 배경 white ↔ #fafafa alternation
 */
export function FeatureBlock({
  feature,
  index,
}: {
  feature: Feature
  index: number
}) {
  const reversed = index % 2 === 1
  const sectionBg = index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'

  return (
    <section
      aria-labelledby={`feature-${index}`}
      className={`border-t border-[#ebebeb] ${sectionBg}`}
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:gap-16">
        {/* 카피 */}
        <div className={reversed ? 'lg:order-2' : ''}>
          <div
            className={`mb-5 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] ${TONE_EYEBROW[feature.tone]}`}
          >
            <feature.Icon size={14} strokeWidth={2.5} aria-hidden />
            <span>{feature.eyebrow}</span>
          </div>

          <h2
            id={`feature-${index}`}
            className="mb-6 whitespace-pre-line text-[28px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0a0a0a] sm:text-[40px] sm:leading-[1.08]"
            style={{ wordBreak: 'keep-all' }}
          >
            {feature.title}
          </h2>

          <p
            className="mb-8 text-[15px] leading-[1.75] text-[#555] sm:text-[16px]"
            style={{ wordBreak: 'keep-all' }}
          >
            {feature.desc}
          </p>

          <ul className="space-y-3">
            {feature.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-[3px] inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] ring-1 ring-[#d1fae5]">
                  <Check
                    size={12}
                    strokeWidth={3}
                    className="text-[#059669]"
                    aria-hidden
                  />
                </span>
                <span
                  className="text-[14px] leading-[1.6] text-[#333] sm:text-[15px]"
                  style={{ wordBreak: 'keep-all' }}
                >
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 이미지 placeholder */}
        <div className={reversed ? 'lg:order-1' : ''}>
          <div
            role="img"
            aria-label={feature.imageAlt}
            className="relative overflow-hidden rounded-2xl border border-[#ebebeb] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]"
            style={{
              aspectRatio: '4 / 3',
              background: TONE_GRADIENT[feature.tone],
            }}
          >
            {/* 미세한 noise 그레인 */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22/></svg>")',
              }}
            />
            {/* dev 라벨 (production에선 숨김) */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="absolute bottom-3 left-3 rounded-full bg-[#0a0a0a]/55 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
                {feature.imageAlt}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
