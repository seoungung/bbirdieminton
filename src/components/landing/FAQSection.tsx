import { Plus } from 'lucide-react'

/**
 * Section 06 — FAQ.
 *
 * 이전 페이지의 FAQS 8개 복원. q/a 한 글자도 변경 X.
 *
 * native <details>/<summary> 사용 — JS 없이 동작, 접근성 기본 보장.
 * [open] 상태에서 + 아이콘이 45도 회전하여 ×처럼 보이게.
 */

type FAQ = { q: string; a: string }

const FAQS: FAQ[] = [
  {
    q: '무료 플랜으로 어디까지 쓸 수 있나요?',
    a: '최대 50명까지 가입 가능하며, 게임보드·실력 균형 자동 매칭·랭킹·공지·정기모임 RSVP·백업복원까지 핵심 운영 기능을 전부 쓸 수 있어요. 회비 자동 정산과 카카오 알림톡은 Pro 플랜부터 제공됩니다.',
  },
  {
    q: 'v2.0 베타 기간 동안은 Pro·Team 기능도 무료인가요?',
    a: '네. 베타 기간(약 1~3개월) 동안 모든 유저에게 Pro·Team 기능을 무료로 제공합니다. 정식 출시 후에도 Free 플랜은 계속 무료이며, 베타 가입자에게는 Pro 3개월 무료 혜택을 드립니다.',
  },
  {
    q: '카카오 계정 말고 다른 로그인 방법이 있나요?',
    a: '현재는 카카오 로그인만 지원합니다. 국내 동호회원 대부분이 카카오톡을 사용하셔서 간편한 로그인을 우선 지원했습니다.',
  },
  {
    q: '기존 엑셀 회원 명단을 가져올 수 있나요?',
    a: '가능합니다. 클럽 설정에서 엑셀 템플릿을 다운로드 받으신 후 회원 정보를 채워서 업로드하시면 일괄 등록됩니다.',
  },
  {
    q: '결제한 Pro 플랜을 언제든 해지할 수 있나요?',
    a: '네. 해지 즉시 다음 결제일부터 과금이 중단됩니다. 이미 결제한 월분까지는 계속 Pro 기능을 사용하실 수 있습니다.',
  },
  {
    q: '환불 정책은 어떻게 되나요?',
    a: '서비스 이용 이력이 없는 경우 결제일로부터 7일 이내 전액 환불 가능합니다. 자세한 내용은 환불정책 페이지를 확인해주세요.',
  },
  {
    q: '여러 동호회를 관리할 수 있나요?',
    a: 'Team 플랜을 구독하시면 최대 5개까지 클럽을 생성·관리하실 수 있습니다. 각 클럽별로 별도 회원 관리, 정산, 통계가 제공됩니다.',
  },
  {
    q: '앱 설치가 필요한가요?',
    a: '별도 설치 없이 웹브라우저에서 바로 사용 가능합니다. 스마트폰에서는 "홈 화면에 추가"하시면 앱처럼 사용할 수 있습니다.',
  },
]

export function FAQSection() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="border-t border-[#ebebeb] bg-[#fafafa]"
    >
      <div className="mx-auto max-w-[800px] px-6 py-20 sm:py-28">
        <div className="mb-12 sm:mb-14">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="text-[28px] font-extrabold leading-[1.18] tracking-[-0.01em] text-[#0a0a0a] sm:text-[44px] sm:leading-[1.12]"
            style={{ wordBreak: 'keep-all' }}
          >
            자주 묻는 질문.
          </h2>
        </div>

        <ul className="space-y-2.5">
          {FAQS.map((faq) => (
            <li key={faq.q}>
              <details className="group overflow-hidden rounded-2xl border border-[#ebebeb] bg-white transition-colors open:border-[#d4d4d4]">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-[14px] font-semibold text-[#111] transition-colors hover:bg-[#fafafa] [&::-webkit-details-marker]:hidden sm:px-6 sm:text-[15px]"
                  style={{ wordBreak: 'keep-all' }}
                >
                  <span>{faq.q}</span>
                  <span
                    aria-hidden
                    className="flex-shrink-0 text-[#999] transition-transform duration-200 group-open:rotate-45"
                  >
                    <Plus size={18} strokeWidth={2} />
                  </span>
                </summary>
                <div
                  className="border-t border-[#f0f0f0] bg-[#fafafa] px-5 py-5 text-[13px] leading-[1.75] text-[#555] sm:px-6 sm:text-[14px]"
                  style={{ wordBreak: 'keep-all' }}
                >
                  {faq.a}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
