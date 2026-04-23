import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { Mail, Phone, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: '문의하기 | 버디민턴',
  description:
    '버디민턴 서비스 이용, 결제, 버그 신고, 기능 제안 등 1:1 문의를 남겨주세요.',
}

export default function ContactPage() {
  return (
    <main className="bg-white text-[#0a0a0a]">
      {/* 헤더 */}
      <section className="py-16 sm:py-24 px-8 border-b border-[#f0f0f0]">
        <div className="max-w-[720px] mx-auto text-center">
          <p className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-4">
            CONTACT
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5">
            무엇을 도와드릴까요?
          </h1>
          <p className="text-[16px] text-[#666] leading-relaxed">
            서비스 이용·결제·기능 제안 어떤 내용이든 환영합니다.<br />
            가능한 빠르게 답변드리겠습니다.
          </p>
        </div>
      </section>

      {/* 본문 */}
      <section className="py-16 sm:py-20 px-8">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* 폼 */}
          <div className="bg-[#f8f8f8] rounded-3xl border border-[#f0f0f0] p-8 sm:p-10">
            <h2 className="text-xl font-extrabold text-[#111] mb-6">
              1:1 문의 남기기
            </h2>
            <ContactForm />
          </div>

          {/* 사이드 정보 */}
          <aside className="space-y-5">
            <div className="bg-[#0a0a0a] text-white rounded-3xl p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#beff00] mb-3">
                CONTACT INFO
              </p>
              <h3 className="text-lg font-extrabold mb-5">직접 연락하기</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-[#beff00] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/50 mb-0.5">이메일</p>
                    <a
                      href="mailto:skyyolle7@gmail.com"
                      className="text-[14px] font-semibold hover:text-[#beff00] transition-colors break-all"
                    >
                      skyyolle7@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-[#beff00] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/50 mb-0.5">연락처</p>
                    <a
                      href="tel:01049773867"
                      className="text-[14px] font-semibold hover:text-[#beff00] transition-colors"
                    >
                      010-4977-3867
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-[#beff00] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/50 mb-0.5">답변 시간</p>
                    <p className="text-[14px] font-semibold">
                      영업일 1~3일 이내
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#e5e5e5] p-6">
              <p className="text-[13px] font-bold text-[#111] mb-3">
                ❓ 먼저 FAQ를 확인해보세요
              </p>
              <p className="text-[12px] text-[#666] leading-relaxed mb-4">
                자주 묻는 질문에서 답을 찾으실 수 있을지도 몰라요.
              </p>
              <a
                href="/faq"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0a0a0a] hover:gap-1.5 transition-all"
              >
                FAQ 바로가기 →
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
