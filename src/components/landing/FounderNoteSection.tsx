import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Founder Note (압축 v3) — 게임보드 데모 직후 자연 연결.
 *
 * 톤: 1인칭 raw 유지. 5단락 → 3단락으로 압축.
 * 끝에 블로그 첫 글로 "전체 이야기 보기" CTA.
 */

function VersionChip({ label }: { label: 'v1' | 'v2' | 'v3' }) {
  return (
    <span className="mx-[1px] inline-flex items-baseline rounded-md bg-[var(--color-brand-court-bg)] px-1.5 py-[1px] font-mono text-[13px] font-semibold text-[var(--color-brand-court)] ring-1 ring-[var(--color-brand-court-soft)] sm:text-[14px]">
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
      <div className="mx-auto max-w-[680px] px-6 py-20 sm:py-24">
        <p
          id="founder-note-heading"
          className="mb-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#666]"
        >
          Founder Note · 왜 만들었나
        </p>

        <div
          className="space-y-6 text-[16px] leading-[1.85] text-[#333] sm:text-[17px]"
          style={{ wordBreak: 'keep-all' }}
        >
          <p>
            저는 모임장이 아닙니다. 그냥 동호인이에요.
            <br />
            서울 와서 여러 모임 거치며 운영진 옆에서 봤습니다.
            매주 게임 매칭에 30분, 신입은 한두 번 오고 안 오고,
            정보는 카톡·엑셀·종이에 흩어진 상태.
          </p>

          <p>
            라켓 가이드부터 시작해서 <VersionChip label="v1" />,
            배린이용 진단 PDF로 좁혔다가 <VersionChip label="v2" />,
            결국 운영 도구로 도착했어요 <VersionChip label="v3" />,{' '}
            <span className="text-[#888]">지금</span>.
          </p>

          <p className="font-semibold text-[#111]">
            올여름, 이 도구로 저도 첫 모임을 시작합니다.
            같이 쾌적하고 쉬운 배드민턴 즐겼으면 좋겠어요.
          </p>
        </div>

        <p className="mt-6 text-right text-[12px] font-medium tracking-wider text-[#999]">
          — 버디민턴 만든 사람
        </p>

        {/* 블로그 첫 글로 연결 */}
        <Link
          href="/blog/beyond-tournament-tools"
          className="group mt-10 inline-flex items-center gap-1.5 rounded-full border border-[#0a0a0a]/15 bg-white px-5 py-2.5 text-[13px] font-bold text-[#0a0a0a] transition-colors hover:border-[#0a0a0a]/40"
        >
          전체 이야기 보기 — 대회 도구로는 부족했던 이유
          <ArrowRight
            size={14}
            strokeWidth={2.5}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  )
}
