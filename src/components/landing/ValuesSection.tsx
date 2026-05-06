import { Scale, Wallet, Megaphone } from 'lucide-react'

/**
 * 핵심 3가치 — Founder Note 후, FAQ 직전.
 *
 * 블랙 배경 + 화이트 텍스트 + 라임 액센트 (Hero·Final CTA와 톤 통일).
 * 구성: 3 카드. 각 카드 = 차별화 가치 1개 + 짧은 카피 + 한 줄 결과.
 */

const VALUES = [
  {
    Icon: Scale,
    badge: '매주의 매칭',
    title: '실력 균형 자동 매칭',
    body: '경기 결과를 모임 안에서 학습해 멤버별 실력 점수가 자연스럽게 자리잡아요. 코트마다 균형 잡힌 팀이 알아서 짜이니 매주 매칭에 머리 안 써도 됩니다. 신입은 강한 사람과 한 팀이 되는 모드로 첫 경기부터 잘 정착해요.',
    metric: '매칭 시간 30분 → 10초',
  },
  {
    Icon: Wallet,
    badge: '월말 정산',
    title: '회비 자동 정산 + 알림톡',
    body: '출석·셔틀콕·코트비를 자동 계산하고 미납자에게 알림톡으로 부드럽게 독촉. 엑셀·카톡 단톡 정산은 이제 그만.',
    metric: '월 결산 1분 컷',
  },
  {
    Icon: Megaphone,
    badge: '운영진 분담',
    title: '운영 자동화 한 곳에',
    body: '공지·정기모임 RSVP·출석·랭킹·백업까지 한 도구에서. 운영진이 카톡 단체방 8개를 띄우고 살 필요가 없어요.',
    metric: '도구 8개 → 1개',
  },
]

export function ValuesSection() {
  return (
    <section
      aria-labelledby="values-heading"
      className="relative overflow-hidden bg-[#0a0a0a] text-white"
    >
      {/* 배경 — 라임 라디얼 글로우 (Hero와 톤 매칭) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(190,255,0,0.14),transparent_65%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1100px] px-6 py-20 sm:py-28">
        <div className="mb-12 max-w-[640px] sm:mb-16">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Why Birdieminton
          </p>
          <h2
            id="values-heading"
            className="text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-white sm:text-[40px] sm:leading-[1.12]"
            style={{ wordBreak: 'keep-all' }}
          >
            모임장과 운영진의 매주를 위한 도구.
            <span className="text-white/50">
              {' '}대회용 도구가 아닙니다.
            </span>
          </h2>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {VALUES.map((v) => (
            <li
              key={v.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/25"
            >
              <div className="mb-5 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-lime)] text-[#0a0a0a]">
                  <v.Icon size={17} strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                  {v.badge}
                </span>
              </div>
              <h3
                className="mb-3 text-[18px] font-extrabold tracking-[-0.01em] text-white"
                style={{ wordBreak: 'keep-all' }}
              >
                {v.title}
              </h3>
              <p
                className="mb-5 text-[14px] leading-[1.7] text-white/70"
                style={{ wordBreak: 'keep-all' }}
              >
                {v.body}
              </p>
              <p className="border-t border-white/10 pt-4 text-[12px] font-bold text-[var(--color-brand-lime)]">
                → {v.metric}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
