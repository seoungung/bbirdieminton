import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침 | 버디민턴',
  description: '버디민턴 개인정보처리방침입니다.',
  robots: { index: false },
}

const EFFECTIVE_DATE = '2026년 4월 8일'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-[#111]">
      <div className="max-w-2xl mx-auto px-5 py-14">

        {/* 헤더 */}
        <p className="text-xs font-bold text-[#beff00] uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-[1.8rem] font-extrabold mb-2">개인정보처리방침</h1>
        <p className="text-[0.85rem] text-[#999] mb-4">시행일: {EFFECTIVE_DATE}</p>
        <p className="text-[0.9rem] text-[#555] leading-relaxed mb-10 bg-[#f8f8f8] rounded-xl p-4">
          버디민턴(이하 &ldquo;회사&rdquo;)은 「개인정보보호법」, 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>

        <div className="space-y-10 text-[0.95rem] text-[#333] leading-[1.9]">

          <Section title="제1조 (개인정보의 처리 목적)">
            <p className="mb-3">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 다음 목적 이외의 용도로 이용되지 않으며, 목적이 변경되는 경우 별도의 동의를 받을 예정입니다.</p>
            <table className="w-full text-[0.88rem] border-collapse">
              <thead>
                <tr className="bg-[#f8f8f8]">
                  <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold">수집 목적</th>
                  <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold">수집 항목</th>
                  <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold">보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[#e5e5e5] px-3 py-2">뉴스레터 및 맞춤형 정보 발송</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">이메일 주소, 레벨 진단 결과</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">동의 철회 시까지</td>
                </tr>
                <tr className="bg-[#fafafa]">
                  <td className="border border-[#e5e5e5] px-3 py-2">디지털 상품 구매 및 배송</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">이메일 주소, 결제 정보(PG사 처리)</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">전자상거래법에 따라 5년</td>
                </tr>
                <tr>
                  <td className="border border-[#e5e5e5] px-3 py-2">제휴 문의 처리</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">이름, 이메일 주소, 문의 내용</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">문의 처리 완료 후 1년</td>
                </tr>
                <tr className="bg-[#fafafa]">
                  <td className="border border-[#e5e5e5] px-3 py-2">서비스 접속 기록 및 통계 분석</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">IP 주소, 접속 로그, 방문 기록</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">통신비밀보호법에 따라 3개월</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="제2조 (개인정보의 처리 및 보유 기간)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</li>
              <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>전자상거래 계약 및 청약철회 기록: 5년 (전자상거래법)</li>
                  <li>대금 결제 및 재화 공급 기록: 5년 (전자상거래법)</li>
                  <li>소비자 불만 및 분쟁처리 기록: 3년 (전자상거래법)</li>
                  <li>서비스 접속 기록: 3개월 (통신비밀보호법)</li>
                  <li>뉴스레터 이메일: 동의 철회 시까지</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제3조 (개인정보의 제3자 제공)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.</li>
              <li>다만, 아래 경우에는 예외로 합니다.
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>이용자가 사전에 동의한 경우</li>
                  <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제4조 (개인정보 처리 위탁)">
            <p className="mb-3">회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
            <table className="w-full text-[0.88rem] border-collapse">
              <thead>
                <tr className="bg-[#f8f8f8]">
                  <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold">수탁 업체</th>
                  <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold">위탁 업무</th>
                  <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold">보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[#e5e5e5] px-3 py-2">토스페이먼츠(주)</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">결제 처리</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">위탁 계약 종료 시까지</td>
                </tr>
                <tr className="bg-[#fafafa]">
                  <td className="border border-[#e5e5e5] px-3 py-2">Supabase Inc.</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">데이터베이스 및 서버 운영</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">위탁 계약 종료 시까지</td>
                </tr>
                <tr>
                  <td className="border border-[#e5e5e5] px-3 py-2">Vercel Inc.</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">웹사이트 호스팅 및 분석</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">위탁 계약 종료 시까지</td>
                </tr>
                <tr className="bg-[#fafafa]">
                  <td className="border border-[#e5e5e5] px-3 py-2">스티비(주)</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">이메일 발송 서비스</td>
                  <td className="border border-[#e5e5e5] px-3 py-2">동의 철회 시까지</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="제5조 (쿠키의 설치·운영 및 거부)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 서비스 이용 분석 및 최적화를 위해 쿠키(cookie)를 사용합니다.</li>
              <li>쿠키는 웹사이트가 이용자의 브라우저로 전송하는 소량의 정보로, 이용자 PC의 하드디스크에 저장됩니다.</li>
              <li>회사가 사용하는 쿠키의 목적:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>필수 쿠키: 서비스 정상 운영을 위해 반드시 필요 (퀴즈 진행 상태, 로그인 세션)</li>
                  <li>분석 쿠키: 서비스 이용 패턴 분석 및 개선 (Vercel Analytics)</li>
                </ul>
              </li>
              <li>이용자는 쿠키 설치에 대한 선택권을 가집니다. 웹브라우저 설정에서 쿠키를 모두 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수 있습니다. 단, 쿠키 저장을 거부할 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제6조 (정보주체의 권리·의무 및 행사 방법)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>이용자는 회사에 대해 언제든지 다음의 권리를 행사할 수 있습니다.
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제 요구</li>
                  <li>처리 정지 요구</li>
                </ul>
              </li>
              <li>권리 행사는 hello@birdieminton.com으로 이메일을 통해 하실 수 있으며 회사는 지체 없이 조치하겠습니다.</li>
              <li>이용자는 개인정보자기결정권을 행사할 수 있으며, 이에 따른 불이익은 없습니다.</li>
            </ol>
          </Section>

          <Section title="제7조 (개인정보의 안전성 확보 조치)">
            <p className="mb-2">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>개인정보 취급자 최소화</li>
              <li>개인정보의 암호화 (HTTPS 적용, 비밀번호 암호화 저장)</li>
              <li>해킹 등에 대비한 기술적 대책 (Supabase RLS 정책 적용)</li>
              <li>개인정보에 대한 접근 제한</li>
            </ul>
          </Section>

          <Section title="제8조 (개인정보보호책임자)">
            <p className="mb-3">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 관련 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.</p>
            <div className="bg-[#f8f8f8] rounded-xl p-4 text-[0.9rem]">
              <p><span className="font-semibold">성명:</span> 양성웅</p>
              <p><span className="font-semibold">직위:</span> 대표</p>
              <p><span className="font-semibold">이메일:</span> hello@birdieminton.com</p>
            </div>
            <p className="mt-3 text-[0.88rem] text-[#555]">
              개인정보보호에 관한 상담이 필요한 경우 위 이메일로 문의하시거나, 아래 기관에 도움을 요청하실 수 있습니다.
            </p>
            <ul className="list-disc pl-5 mt-2 text-[0.88rem] text-[#555] space-y-1">
              <li>개인정보보호위원회: privacy.go.kr / 국번 없이 182</li>
              <li>개인정보 침해신고센터: privacy.go.kr / 국번 없이 118</li>
              <li>대검찰청 사이버범죄수사단: 02-3480-3573</li>
              <li>경찰청 사이버안전국: 국번 없이 182</li>
            </ul>
          </Section>

          <Section title="제9조 (개인정보처리방침 변경)">
            <p>
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가·삭제 및 정정이 있는 경우에는 변경사항 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </Section>

          <div className="border-t border-[#e5e5e5] pt-8 text-[0.85rem] text-[#999]">
            <p>공고일: {EFFECTIVE_DATE} &nbsp;|&nbsp; 시행일: {EFFECTIVE_DATE}</p>
            <p className="mt-2">문의: hello@birdieminton.com</p>
          </div>

        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[1rem] font-bold text-[#111] mb-3 pb-2 border-b border-[#e5e5e5]">{title}</h2>
      {children}
    </section>
  )
}
