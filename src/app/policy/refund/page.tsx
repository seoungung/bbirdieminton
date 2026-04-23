import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '환불정책',
  description: '버디민턴 디지털 상품(PDF) 환불 정책 안내',
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-[28px] font-extrabold text-[#111] mb-2 tracking-tight">환불정책</h1>
        <p className="text-[14px] text-[#999] mb-10">최종 개정일: 2026년 4월 23일</p>

        <section className="space-y-8 text-[15px] text-[#333] leading-[1.8]">
          <div>
            <h2 className="text-[18px] font-bold text-[#111] mb-3">1. 환불 가능 기준</h2>
            <p className="mb-3">
              본 사이트에서 판매하는 <strong>디지털 다운로드 상품(PDF 가이드북 등)</strong>은
              다음 조건을 <strong>모두 충족</strong>하는 경우 전액 환불해 드립니다.
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>구매일로부터 <strong>7일 이내</strong> 환불 요청</li>
              <li>PDF 파일을 <strong>다운로드하지 않은 상태</strong> (다운로드 이력 서버 로그 확인)</li>
              <li>결제 금액 전액에 대한 환불 (부분 환불 불가)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#111] mb-3">2. 환불 불가 사유</h2>
            <p className="mb-3">다음의 경우 환불이 제한됩니다.</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>구매 후 7일이 경과한 경우</li>
              <li>PDF 파일을 이미 다운로드한 경우 (콘텐츠 성격상 반품 불가)</li>
              <li>단순 변심으로 인한 환불 요청이 반복되는 경우</li>
            </ul>
            <p className="mt-3 text-[13px] text-[#777]">
              * 콘텐츠가 광고/설명과 현저히 다르거나 결제 시스템 오류 등 당사 귀책으로 인한
              문제는 다운로드 여부와 무관하게 전액 환불합니다.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#111] mb-3">3. 환불 요청 방법</h2>
            <ol className="list-decimal pl-6 space-y-1.5">
              <li>
                이메일 <a href="mailto:skyyolle7@gmail.com" className="underline text-[#111] font-semibold">skyyolle7@gmail.com</a>으로
                <strong> 주문번호 + 환불 사유</strong>를 보내주세요.
              </li>
              <li>영업일 기준 1~3일 이내 환불 가능 여부를 회신해 드립니다.</li>
              <li>승인 시 결제 수단(카드 / 계좌이체)으로 환불 처리됩니다.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#111] mb-3">4. 환불 처리 기간</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>신용·체크카드: 승인 취소 후 카드사 정책에 따라 <strong>3~5 영업일</strong> 소요</li>
              <li>계좌이체: 승인 후 <strong>2~3 영업일</strong> 내 입금 계좌로 환불</li>
              <li>가상계좌: 고객 환불 계좌 확인 후 <strong>2~3 영업일</strong> 내 송금</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#111] mb-3">5. 판매자 정보</h2>
            <div className="bg-[#f8f8f8] rounded-xl p-5 text-[14px] leading-[1.8]">
              <p><strong>상호명:</strong> 버디민턴</p>
              <p><strong>대표자:</strong> 양성웅</p>
              <p><strong>사업자등록번호:</strong> 227-11-71746</p>
              <p><strong>사업장 주소:</strong> 서울특별시 관악구 은천로35다길 26-13, 101호</p>
              <p><strong>연락처:</strong> 010-4977-3867</p>
              <p><strong>이메일:</strong> skyyolle7@gmail.com</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
