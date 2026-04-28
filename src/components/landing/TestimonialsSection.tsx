import { Star } from 'lucide-react'

/**
 * Section 05 — Testimonials.
 *
 * 이전 페이지의 TESTIMONIALS 5명 페르소나 복원. quote/이름/나이/뱃지/role
 * 한 글자도 변경 X.
 *
 * NOTE: 이 5명은 가공된 페르소나입니다. 실제 사용자 후기 확보 시 교체 필요.
 *       하단 disclaimer로 명시.
 *
 * 디자인:
 * - 1열 (모바일) / 2열 (태블릿) / 3열 (lg+)
 * - 첫 카드 lg에서 col-span-2 (rhythm + 첫 인용 강조)
 * - left-border 색은 accent에 따라 court / amber
 * - 5점 별 (amber)
 */

type Accent = 'court' | 'amber'

type Testimonial = {
  role: string
  name: string
  age: number
  clubSize: number
  badge: string
  quote: string
  accent: Accent
}

const TESTIMONIALS: Testimonial[] = [
  {
    role: '클럽장',
    name: '김민준',
    age: 40,
    clubSize: 200,
    badge: '10년차',
    quote:
      '클럽 200명 규모인데 총무 3명이서 엑셀 돌려가며 관리했어요. 버디민턴 쓰고부터 운영진 업무 시간이 절반으로 줄었습니다.',
    accent: 'court',
  },
  {
    role: '모임장',
    name: '박지호',
    age: 32,
    clubSize: 30,
    badge: '관악구',
    quote:
      '주말 소모임 30명 규모인데 정기모임·자율모임이 섞여서 일정 관리가 머리 아팠어요. 이제 앱 하나로 다 해결됩니다.',
    accent: 'amber',
  },
  {
    role: '총무',
    name: '이서연',
    age: 28,
    clubSize: 45,
    badge: '3년차',
    quote:
      '매달 회비 독촉이 제일 민망했는데, 자동 알림 덕에 인간관계 안 상해요. 총무 해본 분들은 이 고통 아실 거예요.',
    accent: 'court',
  },
  {
    role: '고정 회원',
    name: '최유나',
    age: 35,
    clubSize: 60,
    badge: '주 2회',
    quote:
      '매주 누구랑 치는지 궁금했는데, 앱에서 팀 배정 미리 보고 연습 준비해요. 게임 전적 쌓이는 재미도 쏠쏠해요.',
    accent: 'court',
  },
  {
    role: '신입 회원',
    name: '정태양',
    age: 26,
    clubSize: 50,
    badge: '3개월차',
    quote:
      '첫 가입인데 레벨 진단으로 저랑 비슷한 실력의 분들이랑 잘 쳐요. 적응 빨랐고 지금도 매주 나가요.',
    accent: 'amber',
  },
]

const ACCENT_BORDER: Record<Accent, string> = {
  court: 'border-l-[#10b981]',
  amber: 'border-l-[#f59e0b]',
}

const ACCENT_BADGE: Record<Accent, { bg: string; text: string }> = {
  court: { bg: '#ecfdf5', text: '#059669' },
  amber: { bg: '#fef3c7', text: '#d97706' },
}

export function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-t border-[#ebebeb] bg-white"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
        <div className="mx-auto mb-14 max-w-[720px] text-center sm:mb-16">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
            TESTIMONIALS
          </p>
          <h2
            id="testimonials-heading"
            className="text-[28px] font-extrabold leading-[1.18] tracking-[-0.01em] text-[#0a0a0a] sm:text-[44px] sm:leading-[1.12]"
            style={{ wordBreak: 'keep-all' }}
          >
            이미 쓰고 계신 분들의 이야기.
          </h2>
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => {
            const accentBadge = ACCENT_BADGE[t.accent]
            const span = idx === 0 ? 'lg:col-span-2' : ''
            return (
              <li
                key={t.name}
                className={`flex flex-col rounded-2xl border border-[#f0f0f0] border-l-4 bg-[#fafafa] p-7 sm:p-8 ${ACCENT_BORDER[t.accent]} ${span}`}
              >
                {/* 별점 */}
                <div className="mb-4 flex gap-0.5" aria-label="5점 만점 후기">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      strokeWidth={0}
                      className="text-[#f59e0b]"
                      fill="#f59e0b"
                      aria-hidden
                    />
                  ))}
                </div>

                <p
                  className="mb-6 flex-1 text-[15px] leading-[1.75] text-[#222] sm:text-[16px]"
                  style={{ wordBreak: 'keep-all' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center justify-between gap-3 border-t border-[#ebebeb] pt-5">
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#111]">
                      {t.name} · {t.age}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#999]">
                      {t.role} · 회원 {t.clubSize}명
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{
                      background: accentBadge.bg,
                      color: accentBadge.text,
                    }}
                  >
                    {t.badge}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="mt-10 text-center text-[12px] leading-[1.7] text-[#bbb]">
          * 일부 후기는 실제 사례 반영 전 페르소나 콘텐츠입니다. 런칭 후 실제
          사용자 후기로 업데이트됩니다.
        </p>
      </div>
    </section>
  )
}
