/**
 * Section 04 — Founder Note (압축 버전).
 *
 * 이전 5섹션 풀 영웅 서사(StorySection×3 + TryAttemptsTimeline)를
 * 단일 섹션 1인칭 raw 톤 카피로 압축. Toss/Notion founder note 톤.
 *
 * 카피는 한 글자도 변경 금지(요청 명세 그대로).
 *
 * 디자인:
 * - 단일 컬럼 max-w-[680px], 가운데 정렬 컨테이너
 * - 작은 prefix label "FOUNDER NOTE / 왜 만들었나"
 * - 본문 1.85 line-height, text-[16px]/sm:text-[17px], word-break: keep-all
 * - v1/v2/v3 인라인 chip — court-deep + mono, 최소 강조
 * - 하단 placeholder 이미지 16:9, lime+court 그라데이션 (사용자 추후 교체)
 */

function VersionChip({ label }: { label: 'v1' | 'v2' | 'v3' }) {
  return (
    <span className="mx-[1px] inline-flex items-baseline rounded-md bg-[#ecfdf5] px-1.5 py-[1px] font-mono text-[13px] font-semibold text-[#059669] ring-1 ring-[#d1fae5] sm:text-[14px]">
      {label}
    </span>
  )
}

export function FounderNoteSection() {
  return (
    <section
      aria-labelledby="founder-note-heading"
      className="border-t border-[#ebebeb] bg-[#fafafa]"
    >
      <div className="mx-auto max-w-[680px] px-6 py-20 sm:py-28">
        {/* 작은 prefix label — 두 단으로 (영문/한글) */}
        <div
          id="founder-note-heading"
          className="mb-10 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#bbb]"
        >
          <span aria-hidden className="font-mono text-[#d4d4d4]">
            04
          </span>
          <span aria-hidden className="h-px w-8 bg-[#e5e5e5]" />
          <span className="text-[#666]">Founder Note · 왜 만들었나</span>
        </div>

        {/* 본문 — 카피 한 글자도 변경 X */}
        <div
          className="space-y-6 text-[16px] leading-[1.85] text-[#333] sm:text-[17px]"
          style={{ wordBreak: 'keep-all' }}
        >
          <p>
            저는 모임장이 아닙니다. 그냥 동호인이에요.
            <br />
            서울 와서 여러 모임 거치며 운영진 옆에서 봤습니다.
          </p>

          <p className="text-[#555]">
            매주 게임 매칭에 30분, 신입은 한두 번 오고 안 오고,
            <br />
            정보가 카톡·엑셀·종이에 흩어진 상태.
          </p>

          <p>
            라켓 가이드부터 시작해서 <VersionChip label="v1" />,
            <br />
            배린이용 진단 PDF로 좁혔다가 <VersionChip label="v2" />,
            <br />
            결국 운영 도구로 도착했어요 <VersionChip label="v3" />,{' '}
            <span className="text-[#888]">지금</span>
            <span className="text-[#333]">.</span>
          </p>

          <p className="font-semibold text-[#111]">
            올여름, 이 도구로 저도 첫 모임을 시작합니다.
            <br />
            {`'버디민턴' 브랜드로.`}
          </p>

          <p className="text-[#555]">
            같이 쾌적하고 쉬운 배드민턴 즐겼으면 좋겠어요.
          </p>
        </div>

        {/* 하단 placeholder 이미지 — 추후 교체용 */}
        <div
          role="img"
          aria-label="첫 모임 mood 이미지 자리"
          className="relative mt-14 overflow-hidden rounded-2xl border border-[#ebebeb] shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:mt-16"
          style={{
            aspectRatio: '16 / 9',
            background:
              'linear-gradient(135deg, rgba(190,255,0,0.32) 0%, #d1fae5 55%, #ecfdf5 100%)',
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
            style={{
              backgroundImage:
                'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22/></svg>")',
            }}
          />
          {process.env.NODE_ENV !== 'production' && (
            <div className="absolute bottom-3 left-3 rounded-full bg-[#0a0a0a]/55 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
              운동 마친 동호회 mood (얼굴 X)
            </div>
          )}
        </div>

        {/* 서명 — 작은 마침표 */}
        <p className="mt-8 text-right text-[12px] font-medium tracking-wider text-[#999]">
          — 버디민턴 만든 사람
        </p>
      </div>
    </section>
  )
}
