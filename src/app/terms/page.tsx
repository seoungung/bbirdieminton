import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관 | 버디민턴',
  description: '버디민턴 서비스 이용약관입니다.',
  robots: { index: false },
}

const EFFECTIVE_DATE = '2026년 4월 8일'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-[#111]">
      <div className="max-w-2xl mx-auto px-5 py-14">

        {/* 헤더 */}
        <p className="text-xs font-bold text-[#beff00] uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-[1.8rem] font-extrabold mb-2">이용약관</h1>
        <p className="text-[0.85rem] text-[#999] mb-10">시행일: {EFFECTIVE_DATE}</p>

        <div className="space-y-10 text-[0.95rem] text-[#333] leading-[1.9]">

          <Section title="제1조 (목적)">
            <p>
              이 약관은 버디민턴(이하 &ldquo;회사&rdquo;)이 운영하는 birdieminton.com(이하 &ldquo;몰&rdquo;)에서 제공하는 인터넷 관련 서비스(이하 &ldquo;서비스&rdquo;)를 이용함에 있어 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (정의)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>&ldquo;몰&rdquo;이란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.</li>
              <li>&ldquo;이용자&rdquo;란 몰에 접속하여 이 약관에 따라 몰이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
              <li>&ldquo;회원&rdquo;이란 몰에 회원등록을 한 자로서, 계속적으로 몰이 제공하는 서비스를 이용할 수 있는 자를 말합니다.</li>
              <li>&ldquo;디지털콘텐츠&rdquo;란 전자적 형태로 제작·처리된 내용물로서 회사가 제공하는 PDF 형태의 가이드북 등을 포함합니다.</li>
            </ol>
          </Section>

          <Section title="제3조 (약관의 효력 및 변경)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>이 약관은 몰 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
              <li>회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 이 약관을 변경할 수 있습니다.</li>
              <li>약관을 개정하는 경우 적용일자 및 개정사유를 명시하여 적용일자 7일 전부터 공지합니다. 이용자에게 불리한 변경의 경우 30일 전부터 공지합니다.</li>
              <li>이용자는 변경된 약관에 동의하지 않을 권리가 있으며, 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제4조 (서비스의 제공 및 변경)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 다음 서비스를 제공합니다.
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>배드민턴 라켓 도감 및 정보 제공 서비스</li>
                  <li>배드민턴 레벨 진단 퀴즈 서비스</li>
                  <li>배드민턴 관련 디지털 콘텐츠(PDF 가이드) 판매 서비스</li>
                  <li>이메일 뉴스레터 서비스</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
              </li>
              <li>회사는 재화 또는 용역의 품절 또는 기술적 사양의 변경 등의 경우 장차 체결되는 계약에 의해 제공할 재화 또는 용역의 내용을 변경할 수 있습니다.</li>
              <li>서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검·보수 등 부득이한 사유가 있는 경우 서비스 제공이 일시 중단될 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제5조 (구매 계약의 성립)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>이용자는 몰 내에서 구매 신청을 하며, 회사는 다음과 같이 구매 신청에 대한 승낙을 합니다.</li>
              <li>회사는 다음 각 호의 사유가 있을 때는 승낙하지 않을 수 있습니다.
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>구매 신청 내용에 허위·기재누락·오기가 있는 경우</li>
                  <li>기타 구매 신청에 승낙하는 것이 회사의 기술상 현저히 지장이 있다고 판단하는 경우</li>
                </ul>
              </li>
              <li>계약 성립 시점은 이용자가 결제를 완료하고 회사가 이를 확인한 때로 합니다.</li>
            </ol>
          </Section>

          <Section title="제6조 (디지털콘텐츠의 제공 및 청약철회)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>디지털콘텐츠(PDF 파일 등)는 결제 완료 후 이메일 또는 다운로드 링크를 통해 즉시 제공됩니다.</li>
              <li>
                <strong>청약철회 제한:</strong> 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항 제5호에 따라, 복제 가능한 디지털콘텐츠의 경우 이용자가 파일을 다운로드하거나 콘텐츠에 접근한 이후에는 청약철회가 제한됩니다. 단, 파일을 다운로드하지 않은 경우 또는 콘텐츠에 접근하지 않은 경우에는 구매일로부터 7일 이내에 청약철회를 요청할 수 있습니다.
              </li>
              <li>청약철회 요청은 hello@birdieminton.com으로 이메일 요청하시기 바랍니다.</li>
              <li>환급은 청약철회가 인정되는 경우 3영업일 이내에 처리됩니다.</li>
            </ol>
          </Section>

          <Section title="제7조 (개인정보보호)">
            <p>
              회사는 이용자의 개인정보를 보호하기 위하여 「개인정보보호법」 등 관련 법령에서 정하는 바를 준수합니다.
              개인정보의 처리에 관한 사항은 별도의 <a href="/privacy" className="text-[#beff00] underline">개인정보처리방침</a>에 따릅니다.
            </p>
          </Section>

          <Section title="제8조 (회사의 의무)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 지속적·안정적으로 재화·서비스를 제공하기 위해 노력합니다.</li>
              <li>회사는 이용자가 안전하게 서비스를 이용할 수 있도록 개인정보보호를 위한 보안 시스템을 구축합니다.</li>
              <li>회사는 서비스 이용과 관련하여 이용자로부터 제기된 의견이나 불만이 정당하다고 인정할 경우 이를 처리합니다. 처리 결과는 이메일 등을 통해 이용자에게 전달합니다.</li>
            </ol>
          </Section>

          <Section title="제9조 (이용자의 의무)">
            <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>회원가입 신청 또는 변경 시 허위 내용 등록</li>
              <li>타인의 정보 도용</li>
              <li>몰에 게시된 정보의 무단 변경</li>
              <li>몰이 정한 정보 이외의 정보(컴퓨터 프로그램 등) 송신 또는 게시</li>
              <li>몰 기타 제3자의 저작권 등 지적재산권 침해</li>
              <li>몰 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>구매한 디지털콘텐츠를 무단 복제·배포·공유하는 행위</li>
            </ul>
          </Section>

          <Section title="제10조 (저작권 및 지적재산권)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>몰이 제공하는 콘텐츠(라켓 도감, 가이드, 퀴즈, PDF 파일 등)에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
              <li>이용자는 몰 이용으로 얻은 정보를 회사의 사전 승낙 없이 복제·송신·출판·배포·방송 등의 방법으로 영리 목적으로 이용하거나 제3자에게 이용하게 해서는 안 됩니다.</li>
            </ol>
          </Section>

          <Section title="제11조 (분쟁 해결)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 이용자로부터 제출되는 불만 사항 및 의견을 최우선적으로 처리합니다. 처리하기 어려울 경우 이용자에게 그 사유와 처리 일정을 즉시 통보합니다.</li>
              <li>회사와 이용자 간 발생한 분쟁은 전자상거래 등에서의 소비자보호에 관한 법률에서 정하는 절차에 따릅니다.</li>
            </ol>
          </Section>

          <Section title="제12조 (재판권 및 준거법)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.</li>
              <li>회사와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.</li>
            </ol>
          </Section>

          <div className="border-t border-[#e5e5e5] pt-8 text-[0.85rem] text-[#999]">
            <p>부칙: 이 약관은 {EFFECTIVE_DATE}부터 시행합니다.</p>
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
