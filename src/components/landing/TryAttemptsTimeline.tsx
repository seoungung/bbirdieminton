/**
 * Section 3 — 시도들. 세로 타임라인.
 *
 * - 좌측 세로선 + 각 단계 점.
 * - v1, v2 점은 회색 outlined. v3는 lime 채움 + 외곽 ring (현재/활성 신호).
 * - 라벨 v1/v2/v3는 큰 글씨로 (timeline 시각 강조).
 * - 모바일에서도 세로 타임라인 그대로 (수평 X).
 * - 본문은 indent + 가벼운 카드 분위기 (배경 #f8f8f8 inset).
 */

type Attempt = {
  version: 'v1' | 'v2' | 'v3'
  title: string
  body: string[]
  active?: boolean
}

const ATTEMPTS: Attempt[] = [
  {
    version: 'v1',
    title: '라켓 도감',
    body: [
      '배린이 시절 가장 어려웠던 게 라켓 고르는 일이라',
      '거기서부터 정리했어요. 혼자 쓰기 좋은 정도였지,',
      '다른 사람한테 도움이 되진 못했습니다.',
    ],
  },
  {
    version: 'v2',
    title: '실력 진단 + 맞춤 PDF',
    body: [
      '배린이용으로 한 번 더 좁혀봤어요.',
      '진단 프로그램 만들고 실력에 맞는 라켓·경험 PDF 제공.',
      '뾰족했지만 결국 라켓 한 자루 정해주는 게 끝이었어요.',
    ],
  },
  {
    version: 'v3',
    title: '지금의 이 서비스',
    active: true,
    body: [
      '프로그램 만들면서 동호인·클럽·모임이 매주 겪는',
      '운영 문제를 더 가까이서 봤습니다.',
      '라켓 한 자루보다 매주의 운영이 더 큰 짐이라',
      '지금의 이 서비스를 만들었어요.',
      '',
      '보잘것없는 개발 실력이지만,',
      '도움이 될 수 있는 걸로 만들고 싶었습니다.',
    ],
  },
]

export function TryAttemptsTimeline() {
  return (
    <section
      aria-labelledby="section-03"
      className="border-t border-[#ebebeb] bg-[#fafafa]"
    >
      <div className="mx-auto max-w-[680px] px-6 py-16 sm:py-20">
        {/* 챕터 마커 */}
        <div
          id="section-03"
          className="mb-12 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#999]"
        >
          <span className="font-mono text-[#bbb]">03</span>
          <span className="h-px w-8 bg-[#e5e5e5]" />
          <span className="text-[#555]">시도들</span>
        </div>

        {/* 타임라인 */}
        <ol className="relative" style={{ wordBreak: 'keep-all' }}>
          {/* 세로선 — 좌측 28px (점 가운데 기준) */}
          <span
            aria-hidden
            className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-[#e5e5e5] via-[#e5e5e5] to-[#d1fae5]"
          />

          {ATTEMPTS.map((attempt, i) => {
            const isLast = i === ATTEMPTS.length - 1
            return (
              <li
                key={attempt.version}
                className={`relative pl-12 ${isLast ? '' : 'pb-12 sm:pb-14'}`}
              >
                {/* 점 */}
                <span
                  aria-hidden
                  className={
                    attempt.active
                      ? 'absolute left-0 top-1.5 flex h-[22px] w-[22px] items-center justify-center'
                      : 'absolute left-[3px] top-2.5 h-4 w-4 rounded-full border-2 border-[#d4d4d4] bg-white'
                  }
                >
                  {attempt.active && (
                    <>
                      {/* lime ring + 채움 */}
                      <span className="absolute inset-0 rounded-full bg-[#beff00]/30 animate-pulse" />
                      <span className="relative h-3 w-3 rounded-full bg-[#beff00] ring-2 ring-white" />
                    </>
                  )}
                </span>

                {/* 라벨 + 제목 */}
                <div className="mb-3 flex items-baseline gap-3">
                  <span
                    className={`font-mono text-[22px] font-extrabold tracking-tight sm:text-[26px] ${
                      attempt.active ? 'text-[#0a0a0a]' : 'text-[#bbb]'
                    }`}
                  >
                    {attempt.version}
                  </span>
                  <span
                    className={`text-[15px] font-bold sm:text-[16px] ${
                      attempt.active ? 'text-[#0a0a0a]' : 'text-[#666]'
                    }`}
                  >
                    {attempt.title}
                  </span>
                  {attempt.active && (
                    <span className="rounded-full bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#beff00]">
                      now
                    </span>
                  )}
                </div>

                {/* 본문 — active는 카드, 비active는 plain */}
                <div
                  className={
                    attempt.active
                      ? 'rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6'
                      : ''
                  }
                >
                  <div
                    className={`text-[15px] leading-[1.8] sm:text-[16px] ${
                      attempt.active ? 'text-[#222]' : 'text-[#666]'
                    }`}
                  >
                    {attempt.body.map((line, idx) =>
                      line === '' ? (
                        <div
                          key={idx}
                          className="h-3"
                          aria-hidden
                        />
                      ) : (
                        <p key={idx} className="m-0">
                          {line}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
