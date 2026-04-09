import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '사업자정보확인 | 버디민턴',
  description: '버디민턴 사업자 정보를 확인하세요.',
  robots: { index: false },
}

export default function BusinessPage() {
  return (
    <main className="min-h-screen bg-white text-[#111]">
      <div className="max-w-2xl mx-auto px-5 py-14">

        {/* 헤더 */}
        <p className="text-xs font-bold text-[#beff00] uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-[1.8rem] font-extrabold mb-2">사업자 정보 확인</h1>
        <p className="text-[0.85rem] text-[#999] mb-10">
          전자상거래 등에서의 소비자보호에 관한 법률에 따라 사업자 정보를 공개합니다.
        </p>

        {/* 사업자 정보 카드 */}
        <div className="border border-[#e5e5e5] rounded-2xl overflow-hidden mb-10">
          {[
            { label: '상호', value: '버디민턴' },
            { label: '대표자', value: '양성웅' },
            { label: '사업자등록번호', value: '227-11-71746' },
            { label: '통신판매업신고번호', value: '신고 진행 중' },
            { label: '사업장 소재지', value: '서울특별시 관악구 은천로35다길 26-13, 101호' },
            { label: '과세유형', value: '간이과세자' },
            { label: '업태 / 종목', value: '도매 및 소매업 / 전자상거래 소매업' },
            { label: '이메일', value: 'hello@birdieminton.com' },
            { label: '개업일', value: '2026년 4월 8일' },
          ].map(({ label, value }, i) => (
            <div
              key={label}
              className={`flex items-start gap-4 px-5 py-4 text-[0.9rem] ${
                i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'
              } ${i > 0 ? 'border-t border-[#e5e5e5]' : ''}`}
            >
              <span className="w-32 shrink-0 text-[#999] font-medium">{label}</span>
              <span className="text-[#111]">{value}</span>
            </div>
          ))}
        </div>

        {/* 소비자 피해보상 안내 */}
        <div className="bg-[#f8f8f8] rounded-2xl p-6 mb-10">
          <h2 className="font-bold text-[#111] mb-3 text-[0.95rem]">소비자 피해 보상 안내</h2>
          <div className="text-[0.88rem] text-[#555] leading-[1.85] space-y-2">
            <p>
              버디민턴에서 구매하신 디지털 콘텐츠(PDF 파일)는 전자상거래 등에서의 소비자보호에 관한 법률 제17조에 따라 청약철회 규정이 적용됩니다.
            </p>
            <p>
              <strong className="text-[#111]">청약철회 가능 조건:</strong> 파일 다운로드 또는 콘텐츠에 접근하지 않은 경우, 구매일로부터 7일 이내
            </p>
            <p>
              <strong className="text-[#111]">청약철회 제한 조건:</strong> 파일 다운로드 이후 또는 콘텐츠 접근 이후 (전자상거래법 제17조 제2항 제5호)
            </p>
            <p>
              피해 상담 및 분쟁 조정은 한국소비자원(국번 없이 1372) 또는 공정거래위원회 전자거래분쟁조정위원회(www.ecmc.or.kr)를 이용하실 수 있습니다.
            </p>
          </div>
        </div>

        {/* 구매안전서비스 */}
        <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-10">
          <h2 className="font-bold text-[#111] mb-3 text-[0.95rem]">구매안전서비스</h2>
          <p className="text-[0.88rem] text-[#555] leading-[1.85]">
            버디민턴은 결제 안전을 위해 토스페이먼츠의 구매안전서비스를 이용합니다.
            구매안전서비스는 소비자의 결제 금액을 제3자(PG사)가 보호하는 서비스입니다.
          </p>
          <p className="text-[0.85rem] text-[#bbb] mt-3">※ 통신판매업신고 완료 후 에스크로 확인증이 게시됩니다.</p>
        </div>

        {/* 문의 */}
        <div className="text-[0.88rem] text-[#999] space-y-1">
          <p>고객 문의: <a href="mailto:hello@birdieminton.com" className="text-[#555] underline">hello@birdieminton.com</a></p>
          <p>운영 시간: 평일 10:00 ~ 18:00 (주말·공휴일 제외, 이메일 접수 24시간)</p>
        </div>

      </div>
    </main>
  )
}
