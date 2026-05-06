import Link from 'next/link'
import type { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: '자주 묻는 질문 | 버디민턴',
  description:
    '서비스 이용·요금제·결제·환불·기능 관련 자주 묻는 질문을 카테고리별로 정리했습니다.',
}

type Category = '서비스' | '요금제' | '기능' | '결제·환불' | '계정'

interface Faq {
  category: Category
  q: string
  a: string
}

const FAQS: Faq[] = [
  // 서비스
  {
    category: '서비스',
    q: '버디민턴은 어떤 서비스인가요?',
    a: '배드민턴 동호회 운영에 필요한 모든 기능을 한 곳에 모은 SaaS 플랫폼입니다. 게임보드·회비 정산·랭킹·공지 등 총무가 직접 카톡과 엑셀로 관리하던 업무를 자동화합니다.',
  },
  {
    category: '서비스',
    q: '누가 사용하는 서비스인가요?',
    a: '배드민턴 동호회의 총무·모임장·클럽장이 주 사용자이며, 일반 회원도 출석·랭킹·공지 확인 목적으로 사용합니다.',
  },
  {
    category: '서비스',
    q: '앱 설치가 필요한가요?',
    a: '별도 설치 없이 웹브라우저에서 바로 사용 가능합니다. 스마트폰에서는 "홈 화면에 추가" 기능으로 앱처럼 사용할 수 있습니다.',
  },
  {
    category: '서비스',
    q: '카카오 계정 말고 다른 로그인 방법이 있나요?',
    a: '현재는 카카오 로그인만 지원합니다. 국내 동호회원 대부분이 카카오톡을 사용하셔서 간편한 로그인을 우선 지원했습니다. 향후 구글·애플 로그인 추가 예정입니다.',
  },

  // 요금제
  {
    category: '요금제',
    q: '무료 플랜으로 어디까지 쓸 수 있나요?',
    a: '최대 50명까지 가입 가능하며, 게임보드·실력 균형 자동 매칭·랭킹·공지·정기모임 RSVP·백업복원까지 핵심 운영 기능을 전부 쓸 수 있어요. 회비 자동 정산과 카카오 알림톡은 Pro 플랜부터, 멀티 클럽·고급 통계는 Team 플랜부터 제공됩니다.',
  },
  {
    category: '요금제',
    q: 'v2.0 베타 기간 동안은 Pro·Team 기능도 무료인가요?',
    a: '네. 베타 기간(약 1~3개월) 동안 모든 유저에게 Pro·Team 기능을 무료로 제공합니다. 정식 출시 후에도 Free 플랜은 계속 무료이며, 베타 가입자에게는 Pro 3개월 무료 혜택을 드립니다.',
  },
  {
    category: '요금제',
    q: 'Team 플랜은 어떤 경우에 필요한가요?',
    a: '한 사람이 여러 클럽을 동시에 운영하거나 (예: 클럽장이 여러 소모임 운영), 분점 형태의 배드민턴 학원/체육관에서 지점별 클럽을 관리할 때 적합합니다. 최대 5개 클럽을 한 계정으로 관리할 수 있습니다.',
  },

  // 기능
  {
    category: '기능',
    q: '기존 엑셀 회원 명단을 가져올 수 있나요?',
    a: '가능합니다. 클럽 설정에서 엑셀 템플릿을 다운로드 받으신 후 회원 정보를 채워서 업로드하시면 일괄 등록됩니다.',
  },
  {
    category: '기능',
    q: '자동 팀 배정은 어떻게 이뤄지나요?',
    a: '회원별 실력 등급(D조·C조 등) 기반으로 균형 잡힌 복식 팀을 자동 매칭합니다. 출석한 회원 풀에서 실력·최근 매칭 이력·대기시간을 고려해 공정한 매칭을 제공합니다.',
  },
  {
    category: '기능',
    q: '카카오톡 단체방으로 공지를 공유할 수 있나요?',
    a: '네. 공지사항 작성 후 "카카오 공유" 버튼을 누르면 카카오톡 단체방으로 바로 공유됩니다. 기존 카톡 단체방을 완전히 대체하지 않고 공존할 수 있습니다.',
  },

  // 결제·환불
  {
    category: '결제·환불',
    q: '결제한 Pro 플랜을 언제든 해지할 수 있나요?',
    a: '네. 해지 즉시 다음 결제일부터 과금이 중단됩니다. 이미 결제한 월분까지는 계속 Pro 기능을 사용하실 수 있습니다.',
  },
  {
    category: '결제·환불',
    q: '환불 정책은 어떻게 되나요?',
    a: (
      '서비스 이용 이력이 없는 경우 결제일로부터 7일 이내 전액 환불 가능합니다. 자세한 내용은 환불정책 페이지를 확인해주세요.'
    ),
  },
  {
    category: '결제·환불',
    q: '결제는 어떤 방법으로 가능한가요?',
    a: '신용·체크카드, 계좌이체, 가상계좌 결제를 지원하며, 토스페이먼츠 통합 결제로 안전하게 진행됩니다.',
  },
  {
    category: '결제·환불',
    q: '세금계산서는 발행되나요?',
    a: '사업자 회원의 경우 영업일 기준 3일 이내 세금계산서를 발행해드립니다. 결제 완료 후 /contact 페이지에서 사업자등록증과 함께 요청해주세요.',
  },

  // 계정
  {
    category: '계정',
    q: '여러 동호회를 관리할 수 있나요?',
    a: 'Team 플랜을 구독하시면 최대 5개까지 클럽을 생성·관리하실 수 있습니다. 각 클럽별로 별도 회원 관리, 정산, 통계가 제공됩니다.',
  },
  {
    category: '계정',
    q: '회원탈퇴는 어떻게 하나요?',
    a: (
      '고객센터(1:1 문의)로 탈퇴 요청 부탁드립니다. 30일 내 개인정보는 완전히 파기되며, 클럽 내 활동 데이터는 익명화 처리됩니다.'
    ),
  },
  {
    category: '계정',
    q: '클럽장이 바뀌면 어떻게 하나요?',
    a: '클럽 설정 > 멤버 관리에서 기존 클럽장이 다른 회원에게 오너 권한을 이관할 수 있습니다. 권한 이관 시 기존 클럽장은 일반 회원으로 전환됩니다.',
  },
]

const CATEGORIES: Category[] = ['서비스', '요금제', '기능', '결제·환불', '계정']

export default function FaqPage() {
  return (
    <main className="bg-white text-[#0a0a0a]">
      {/* 헤더 */}
      <section className="py-16 sm:py-24 px-8 border-b border-[#f0f0f0]">
        <div className="max-w-[720px] mx-auto text-center">
          <p className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-4">
            FAQ
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5">
            자주 묻는 질문
          </h1>
          <p className="text-[16px] text-[#666] leading-relaxed">
            원하시는 답을 찾지 못하셨다면{' '}
            <Link href="/contact" className="font-semibold text-[#0a0a0a] underline hover:text-[#555]">
              1:1 문의
            </Link>
            를 남겨주세요.
          </p>
        </div>
      </section>

      {/* 카테고리별 FAQ */}
      <section className="py-16 sm:py-20 px-8">
        <div className="max-w-[800px] mx-auto space-y-16">
          {CATEGORIES.map((cat) => {
            const items = FAQS.filter((f) => f.category === cat)
            if (items.length === 0) return null
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle size={16} className="text-[#0a0a0a]" strokeWidth={2.5} />
                  <h2 className="text-xl font-extrabold tracking-tight">{cat}</h2>
                  <span className="text-[12px] text-[#999]">({items.length}문항)</span>
                </div>
                <div className="space-y-3">
                  {items.map((faq) => (
                    <details
                      key={faq.q}
                      className="group bg-[#f8f8f8] rounded-2xl border border-[#f0f0f0] overflow-hidden"
                    >
                      <summary className="cursor-pointer px-6 py-5 flex items-center justify-between gap-4 font-semibold text-[15px] text-[#111] list-none hover:bg-[#f0f0f0] transition-colors">
                        <span>{faq.q}</span>
                        <span className="text-[#999] text-lg group-open:rotate-45 transition-transform">
                          +
                        </span>
                      </summary>
                      <div className="px-6 pb-5 text-[14px] text-[#555] leading-relaxed">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="bg-[#0a0a0a] text-white py-20 px-8">
        <div className="max-w-[640px] mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
            답을 못 찾으셨나요?
          </h2>
          <p className="text-[15px] text-white/60 mb-8">
            1:1 문의를 남겨주시면 영업일 1~3일 이내에 답변드리겠습니다.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-brand-lime)] text-[#0a0a0a] font-extrabold text-[14px] rounded-full hover:bg-[var(--color-brand-lime-dim)] transition-colors"
          >
            문의하기 →
          </Link>
        </div>
      </section>
    </main>
  )
}
