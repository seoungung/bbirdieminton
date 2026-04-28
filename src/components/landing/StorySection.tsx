import { ReactNode } from 'react'

/**
 * 이미지 placeholder — 추후 사용자가 AI 또는 직접 제작 이미지로 교체.
 *
 * - 그라데이션은 v2 토큰 활용. 톤별로 mood 매칭.
 * - 개발 모드에서만 라벨 visible (NEXT_PUBLIC_SHOW_PLACEHOLDER_LABELS 플래그 또는 dev).
 * - 16/9 비율 기본, optional 4/3.
 */
type PlaceholderTone = 'fresh' | 'muted' | 'lime'

const TONE_GRADIENTS: Record<PlaceholderTone, string> = {
  // Section 1 — 시작 (배드민턴 시작의 fresh 톤)
  fresh:
    'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 50%, #fafafa 100%)',
  // Section 2 — 관찰 (시련 톤, amber → muted)
  muted:
    'linear-gradient(135deg, #fef3c7 0%, #fffbeb 45%, #f0f0f0 100%)',
  // Section 4 — 약속 (lime + court 혼합, 미래 톤)
  lime:
    'linear-gradient(135deg, rgba(190,255,0,0.35) 0%, #d1fae5 55%, #ecfdf5 100%)',
}

export function StoryImage({
  tone,
  label,
  ratio = '16/9',
}: {
  tone: PlaceholderTone
  label: string
  ratio?: '16/9' | '4/3'
}) {
  const isDev = process.env.NODE_ENV !== 'production'

  return (
    <div
      role="img"
      aria-label={label}
      className="relative my-10 overflow-hidden rounded-2xl border border-[#ebebeb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      style={{
        aspectRatio: ratio === '4/3' ? '4 / 3' : '16 / 9',
        background: TONE_GRADIENTS[tone],
      }}
    >
      {/* 미세한 노이즈/그레인 느낌의 SVG (CSS-only) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22/></svg>")',
        }}
      />

      {/* 라벨 — dev에서만 보임 */}
      {isDev && (
        <div className="absolute bottom-3 left-3 rounded-full bg-[#0a0a0a]/55 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
          {label}
        </div>
      )}
    </div>
  )
}

/**
 * 본문 한 섹션 — Section 1, 2, 4 공용 wrapper.
 *
 * - max-w-[680px], 가운데 정렬, 한국어 word-break: keep-all
 * - eyebrow로 챕터 인덱스/번호 표시
 * - 본문은 한 줄씩 끊어 읽히도록 children에서 <br /> 또는 <p> 분할
 */
export function StorySection({
  index,
  eyebrow,
  children,
  before,
  after,
}: {
  index: string // "01", "02", "04" 등
  eyebrow: string // "시작", "관찰", "약속"
  children: ReactNode
  before?: ReactNode // 섹션 시작 전 이미지
  after?: ReactNode // 섹션 끝 후 이미지
}) {
  return (
    <section
      className="border-t border-[#ebebeb] bg-white"
      aria-labelledby={`section-${index}`}
    >
      <div className="mx-auto max-w-[680px] px-6 py-16 sm:py-20">
        {/* 챕터 마커 */}
        <div
          id={`section-${index}`}
          className="mb-8 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#999]"
        >
          <span className="font-mono text-[#bbb]">{index}</span>
          <span className="h-px w-8 bg-[#e5e5e5]" />
          <span className="text-[#555]">{eyebrow}</span>
        </div>

        {before}

        <div
          className="story-prose space-y-6 text-[16px] leading-[1.8] text-[#333] sm:text-[17px]"
          style={{ wordBreak: 'keep-all' }}
        >
          {children}
        </div>

        {after}
      </div>
    </section>
  )
}
