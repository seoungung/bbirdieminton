import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '배린이 라켓 완전정복 가이드 | 버디민턴',
  description: '왕초보부터 D조까지, 내 레벨에 딱 맞는 라켓 고르는 법. 버디민턴의 첫 번째 디지털 가이드.',
  robots: { index: true },
}

export default function ShopPage() {
  return (
    <main className="bg-white text-[#111111]">

      {/* 1. Hero Section */}
      <section className="py-20 px-5">
        <div className="max-w-[1088px] mx-auto text-center">
          <span className="inline-block bg-[#beff00] text-black text-xs font-bold px-3 py-1 rounded-full mb-6">
            디지털 가이드북
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
            배린이 라켓 완전정복 가이드
          </h1>
          <p className="text-[#555555] text-base sm:text-lg mb-8 leading-relaxed">
            왕초보부터 D조까지 — 내 레벨에 딱 맞는 라켓,<br className="hidden sm:block" />
            처음부터 제대로 고르는 법
          </p>
          <div className="flex items-baseline justify-center gap-3 mb-6">
            <span className="text-[#999999] line-through text-lg">29,900원</span>
            <span className="text-[#beff00] font-extrabold text-3xl sm:text-4xl" style={{ color: '#000000' }}>
              <span className="bg-[#beff00] px-2 py-0.5 rounded-lg">19,900원</span>
            </span>
          </div>
          <a
            href="#purchase"
            className="block w-full sm:inline-block sm:w-auto bg-[#beff00] text-black font-bold text-base px-10 py-4 rounded-2xl hover:bg-[#a8e600] transition-colors mb-3"
          >
            지금 구매하기 →
          </a>
          <p className="text-[#999999] text-sm mt-3">PDF 즉시 다운로드 · 환불 정책 안내</p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* 2. "이런 분께 딱입니다" Section */}
      <section className="py-16 px-5">
        <div className="max-w-[1088px] mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">
            이런 분께 딱입니다
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                emoji: '🏸',
                text: '라켓을 쿠팡에서 골랐는데 맞는 건지 모르겠는 분',
              },
              {
                emoji: '🤔',
                text: '체육관에서 추천받은 라켓이 내 실력에 맞는지 궁금한 분',
              },
              {
                emoji: '📈',
                text: '배드민턴 시작한 지 6개월 — 이제 라켓 업그레이드하고 싶은 분',
              },
              {
                emoji: '🎯',
                text: 'D조 진입을 목표로 장비부터 제대로 갖추고 싶은 분',
              },
            ].map((item) => (
              <div
                key={item.emoji}
                className="border border-[#e5e5e5] rounded-2xl p-5 bg-white flex flex-row items-start gap-4"
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <p className="text-[#111111] text-sm sm:text-base leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* 3. 구성 Section */}
      <section className="py-16 px-5 bg-[#f8f8f8]">
        <div className="max-w-[1088px] mx-auto">
          <p className="text-center text-xs font-bold tracking-widest text-[#beff00] uppercase mb-3"
             style={{ color: '#000000', background: 'none' }}>
            <span className="bg-[#beff00] px-2 py-0.5 rounded text-black">GUIDE CONTENTS</span>
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10 mt-3">
            총 4개 챕터 구성
          </h2>
          <div className="flex flex-col gap-5">
            {[
              {
                number: 'Chapter 1',
                title: '왕초보 라켓 가이드',
                bullets: [
                  '왕초보가 저지르는 라켓 실수 TOP 3',
                  '무게·밸런스·강성 완전 해설 (어렵지 않게)',
                  '예산별 추천 라켓 (1만~5만원 / 5만~10만원)',
                  '지금 당장 살 수 있는 라켓 5종 상세 비교',
                ],
              },
              {
                number: 'Chapter 2',
                title: '초심자 라켓 가이드',
                bullets: [
                  '6개월 차, 라켓 업그레이드 타이밍 진단법',
                  '초심자에게 딱 맞는 스펙 기준 3가지',
                  '추천 라켓 5종 비교 (5만~15만원대)',
                  '스트링 장력 입문 가이드',
                ],
              },
              {
                number: 'Chapter 3',
                title: 'D조 라켓 가이드',
                bullets: [
                  'D조 진입 시 라켓 선택 기준이 바뀌는 이유',
                  '공격형 vs 수비형 vs 올라운드 포지션별 선택법',
                  'D조 추천 라켓 6종 비교',
                  '스트링 + 그립 세팅 완전 가이드',
                ],
              },
              {
                number: 'Chapter 4',
                title: '배린이 공통 지식',
                bullets: [
                  '브랜드별 라켓 성격 완전 비교 (요넥스/빅터/리닝)',
                  '구매 전 반드시 확인할 체크리스트 10가지',
                  '첫 체육관 생존 가이드 (에티켓 + 필수 준비물)',
                  '자주 묻는 질문 모음 (FAQ)',
                ],
              },
            ].map((chapter) => (
              <div
                key={chapter.number}
                className="border border-[#e5e5e5] rounded-2xl p-6 bg-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#beff00] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {chapter.number}
                  </span>
                  <h3 className="font-bold text-base sm:text-lg">{chapter.title}</h3>
                </div>
                <ul className="flex flex-col gap-2">
                  {chapter.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-[#555555] text-sm">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#beff00] flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* 4. 스펙 섹션 */}
      <section className="py-16 px-5">
        <div className="max-w-[1088px] mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">상품 정보</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '형식', value: 'PDF\n즉시 다운로드' },
              { label: '분량', value: '약 60페이지' },
              { label: '업데이트', value: '구매자\n무료 업데이트' },
              { label: '언어', value: '한국어' },
            ].map((spec) => (
              <div
                key={spec.label}
                className="border border-[#e5e5e5] rounded-2xl p-5 text-center bg-white"
              >
                <p className="text-[#999999] text-xs mb-2">{spec.label}</p>
                <p className="font-bold text-sm whitespace-pre-line leading-snug">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* 5. 구매 섹션 */}
      <section id="purchase" className="py-20 px-5">
        <div className="max-w-[1088px] mx-auto">
          <div className="bg-[#f8f8f8] rounded-3xl p-8 sm:p-12 text-center">
            <div className="flex items-baseline justify-center gap-3 mb-2">
              <span className="text-[#999999] line-through text-lg">29,900원</span>
              <span className="font-extrabold text-3xl sm:text-4xl">19,900원</span>
            </div>
            <p className="text-[#999999] text-sm mb-8">얼리버드 특가 · 한정 기간</p>
            <a
              href="#"
              className="block w-full bg-[#beff00] text-black font-bold text-base sm:text-lg px-8 py-4 rounded-2xl hover:bg-[#a8e600] transition-colors mb-3"
            >
              19,900원으로 시작하기 →
            </a>
            <p className="text-[#999999] text-xs mb-6">
              결제 즉시 PDF 다운로드 링크가 이메일로 발송됩니다
            </p>
            <Link
              href="/quiz"
              className="inline-block border border-[#e5e5e5] text-[#555555] text-sm font-medium px-6 py-3 rounded-2xl hover:border-[#111111] hover:text-[#111111] transition-colors"
            >
              퀴즈로 내 레벨 먼저 확인하기
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* 6. FAQ Section */}
      <section className="py-16 px-5">
        <div className="max-w-[1088px] mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">자주 묻는 질문</h2>
          <div className="flex flex-col gap-3">
            {[
              {
                q: '어떤 형식인가요?',
                a: 'PDF 파일로 제공됩니다. 결제 완료 후 이메일로 다운로드 링크가 즉시 발송됩니다.',
              },
              {
                q: '환불이 가능한가요?',
                a: '파일 다운로드 이전이라면 구매일로부터 7일 이내 환불 가능합니다. 다운로드 이후에는 디지털 상품 특성상 환불이 제한됩니다.',
              },
              {
                q: '어떤 레벨에게 맞나요?',
                a: '배드민턴을 막 시작했거나 6개월 미만의 배린이, D조 진입을 목표로 하는 분께 최적화되어 있습니다.',
              },
              {
                q: '업데이트는 어떻게 받나요?',
                a: '구매자는 향후 콘텐츠 업데이트 시 무료로 새 버전을 받으실 수 있습니다.',
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="border border-[#e5e5e5] rounded-2xl overflow-hidden group"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-sm sm:text-base list-none select-none hover:bg-[#f8f8f8] transition-colors">
                  {faq.q}
                  <span className="ml-4 text-[#999999] flex-shrink-0 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">+</span>
                </summary>
                <div className="px-6 pb-5 pt-1 text-[#555555] text-sm leading-relaxed border-t border-[#e5e5e5]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e5e5e5]" />

      {/* 7. Footer CTA Strip */}
      <section className="py-16 px-5 bg-[#f8f8f8]">
        <div className="max-w-[1088px] mx-auto text-center">
          <p className="text-[#555555] text-base mb-5">아직 내 레벨을 모른다면?</p>
          <Link
            href="/quiz"
            className="inline-block border-2 border-[#111111] text-[#111111] font-bold text-sm px-8 py-3 rounded-2xl hover:bg-[#111111] hover:text-white transition-colors"
          >
            레벨 진단하러 가기 →
          </Link>
        </div>
      </section>

    </main>
  )
}
