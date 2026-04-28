import { MessageSquare, BarChart3, Frown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Section 02 — Pain Points.
 *
 * 이전 페이지(commit 5566539)의 PAIN_POINTS 자산 복원.
 * 텍스트는 한 글자도 변경 금지.
 *
 * 톤: 짧고 직설적, 공감 트리거. SaaS 마케팅으로 전환되기 직전의
 * "현실 체크" 역할. 카드 3개 grid (lg+) / 1열 (모바일).
 */
type Pain = {
  Icon: LucideIcon
  title: string
  desc: string
}

const PAIN_POINTS: Pain[] = [
  {
    Icon: MessageSquare,
    title: '카톡 단체방이 난리',
    desc: '"나 나가요" "저 못 가요" — 출석 취합만 30분. 코트 수 계산은 머릿속으로.',
  },
  {
    Icon: BarChart3,
    title: '회비는 엑셀로',
    desc: '누가 냈는지 안 냈는지 버전 꼬인 엑셀 파일. 독촉은 매번 민망하고.',
  },
  {
    Icon: Frown,
    title: '팀 배정은 눈치 게임',
    desc: '항상 같은 사람끼리, 실력 차이 심한 팀. 불만은 쌓이고 총무만 난처해.',
  },
]

export function PainPointsSection() {
  return (
    <section
      aria-labelledby="pain-points-heading"
      className="border-t border-[#ebebeb] bg-white"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
        <div className="mx-auto mb-14 max-w-[720px] text-center sm:mb-16">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
            PROBLEM
          </p>
          <h2
            id="pain-points-heading"
            className="text-[28px] font-extrabold leading-[1.18] tracking-[-0.01em] text-[#0a0a0a] sm:text-[44px] sm:leading-[1.12]"
            style={{ wordBreak: 'keep-all' }}
          >
            이런 적, 있으셨나요?
          </h2>
          <p
            className="mt-5 text-[14px] leading-[1.7] text-[#888] sm:text-[15px]"
            style={{ wordBreak: 'keep-all' }}
          >
            총무 · 모임장이라면 한 번쯤 거쳐온 그 장면들.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {PAIN_POINTS.map(({ Icon, title, desc }) => (
            <li
              key={title}
              className="rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-7 transition-colors hover:border-[#e5e5e5] sm:p-8"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#555] ring-1 ring-[#ebebeb]">
                <Icon size={20} strokeWidth={1.6} aria-hidden />
              </div>
              <h3
                className="mb-2.5 text-[17px] font-bold tracking-[-0.005em] text-[#111] sm:text-[18px]"
                style={{ wordBreak: 'keep-all' }}
              >
                {title}
              </h3>
              <p
                className="text-[14px] leading-[1.7] text-[#666] sm:text-[15px]"
                style={{ wordBreak: 'keep-all' }}
              >
                {desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
