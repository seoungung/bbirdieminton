import Link from 'next/link'
import { Copy, MessageCircle, AlertCircle, Lightbulb } from 'lucide-react'

export function InviteMembersGuide() {
  return (
    <>
      <section className="mb-10">
        <p className="text-[16px] sm:text-[17px] leading-[1.8] text-[#222] mb-5">
          초대코드는 우리 모임으로 들어오는 유일한 입구입니다.
          코드를 카톡으로 공유 → 회원이 카카오로 1초 가입 → 자동으로 우리 모임 회원 목록에 추가되는 흐름입니다.
        </p>

        <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded-2xl p-5 my-8">
          <p className="flex items-center gap-2 text-[13px] font-bold text-[#059669] mb-2">
            <Lightbulb size={15} strokeWidth={2.5} />
            왜 초대코드 방식인가?
          </p>
          <ul className="text-[14px] text-[#222] leading-[1.7] space-y-1 ml-1">
            <li>· <strong>아무나 들어오지 못합니다</strong> — 코드 모르는 사람은 가입 불가</li>
            <li>· <strong>총무가 일일이 승인할 필요 없음</strong> — 코드 가진 사람은 즉시 합류</li>
            <li>· <strong>오프라인 모임 첫 방문자도 그 자리에서 가입 가능</strong></li>
          </ul>
        </div>
      </section>

      {/* STEP 1 */}
      <section className="mb-14">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-3 mt-10">
          1단계 · 초대코드 확인하기
        </h2>
        <p className="text-[15px] text-[#444] leading-[1.85] mb-5">
          좌측 사이드바의 <strong>설정 → 초대코드</strong> 메뉴로 들어가면 우리 모임의 8자리 코드가 표시됩니다.
          모임 생성 시 자동으로 발급되었기 때문에 별도로 만드실 필요 없습니다.
        </p>

        <div className="bg-[#0a0a0a] text-white rounded-2xl p-6 my-6 text-center">
          <p className="text-[11px] text-white/50 uppercase tracking-widest mb-3">초대 링크</p>
          <p className="font-mono text-[15px] sm:text-[17px] mb-4 break-all">
            birdieminton.com/join/<span className="text-[#beff00] font-bold">A1B2C3D4</span>
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors cursor-default"
          >
            <Copy size={12} />
            링크 복사
          </button>
        </div>

        <div className="my-6 rounded-2xl border border-[#e5e5e5] bg-[#f8f8f8] aspect-[16/9] flex items-center justify-center text-[#bbb] text-sm font-mono">
          [ 스크린샷 — 초대코드 페이지 ]
        </div>
      </section>

      {/* STEP 2 */}
      <section className="mb-14">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-3 mt-10">
          2단계 · 카톡 단체방에 공유하기
        </h2>
        <p className="text-[15px] text-[#444] leading-[1.85] mb-5">
          <strong>카카오 공유</strong> 버튼을 누르면 카톡이 열리고, 단체방을 선택해서 바로 보낼 수 있습니다.
          공유되는 메시지에는 모임 이름·활동 정보가 자동으로 포함됩니다.
        </p>

        <div className="bg-[#FEE500] rounded-2xl p-5 sm:p-6 my-6">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center text-[13px] font-extrabold shrink-0">
                버
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#999] mb-0.5">버디민턴 알림</p>
                <p className="text-[14px] font-bold text-[#111] mb-1">
                  관악 셔틀러스 · 모임 초대
                </p>
              </div>
            </div>
            <div className="bg-[#f8f8f8] rounded-lg p-3 text-[13px] text-[#444] leading-relaxed">
              관악 셔틀러스에서 새 회원을 초대합니다.<br />
              매주 화·목 19:30, 봉천체육관.<br /><br />
              아래 링크에서 카카오로 1초 가입하세요.<br />
              <span className="text-[#1d4ed8] underline">birdieminton.com/join/A1B2C3D4</span>
            </div>
          </div>
        </div>

        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-4 my-5">
          <p className="flex items-start gap-2 text-[13px] text-[#92400e] leading-relaxed">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>
              <strong>카카오 단체방에 봇이 추가되어 있지 않아도 됩니다.</strong>
              카카오 공식 공유 API를 사용하기 때문에, 일반 카톡 공유와 같은 방식입니다.
            </span>
          </p>
        </div>
      </section>

      {/* STEP 3 */}
      <section className="mb-14">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-3 mt-10">
          3단계 · 회원이 들어오는 흐름
        </h2>
        <p className="text-[15px] text-[#444] leading-[1.85] mb-6">
          링크를 받은 회원이 보게 될 화면은 이런 흐름입니다.
        </p>

        <ol className="space-y-4 my-6">
          <li className="flex items-start gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[#0a0a0a] text-white font-extrabold text-[13px] flex items-center justify-center mt-0.5">
              1
            </span>
            <div>
              <p className="font-bold text-[15px] text-[#111] mb-1">초대 페이지</p>
              <p className="text-[14px] text-[#555] leading-relaxed">
                모임 이름·지역·요일 정보가 보이는 환영 페이지가 열립니다.
                "이 모임이 맞나?" 한번 확인하는 단계.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[#0a0a0a] text-white font-extrabold text-[13px] flex items-center justify-center mt-0.5">
              2
            </span>
            <div>
              <p className="font-bold text-[15px] text-[#111] mb-1">카카오 1초 가입</p>
              <p className="text-[14px] text-[#555] leading-relaxed">
                카카오 로그인 한 번이면 가입+모임 합류가 동시에 끝납니다.
                이미 버디민턴 계정이 있으면 자동으로 인식됩니다.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[#0a0a0a] text-white font-extrabold text-[13px] flex items-center justify-center mt-0.5">
              3
            </span>
            <div>
              <p className="font-bold text-[15px] text-[#111] mb-1">우리 모임 홈으로 자동 이동</p>
              <p className="text-[14px] text-[#555] leading-relaxed">
                바로 회원 목록·다음 정기모임·공지사항을 볼 수 있는 상태가 됩니다.
                총무는 회원 목록에서 새 회원이 추가된 것을 즉시 확인할 수 있습니다.
              </p>
            </div>
          </li>
        </ol>

        <div className="my-6 rounded-2xl border border-[#e5e5e5] bg-[#f8f8f8] aspect-[16/9] flex items-center justify-center text-[#bbb] text-sm font-mono">
          [ 스크린샷 — 가입 → 모임 홈 자동 이동 ]
        </div>
      </section>

      {/* STEP 4 */}
      <section className="mb-14">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-3 mt-10">
          4단계 · 코드 관리 — 무효화·재발급
        </h2>
        <p className="text-[15px] text-[#444] leading-[1.85] mb-5">
          초대코드는 <strong>만료가 없습니다</strong>. 한 번 발급된 코드는 별도로 끄지 않는 한 계속 유효합니다.
          하지만 다음과 같은 경우 코드를 새로 발급하는 것을 권장합니다.
        </p>

        <div className="bg-[#f8f8f8] border border-[#f0f0f0] rounded-2xl p-5 my-6">
          <ul className="text-[14px] text-[#222] leading-[1.85] space-y-2.5">
            <li className="flex items-start gap-2">
              <MessageCircle size={15} className="text-[#999] mt-1 shrink-0" />
              <span>탈퇴한 회원이 옛날 카톡 기록에서 다시 가입을 시도할 가능성</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle size={15} className="text-[#999] mt-1 shrink-0" />
              <span>지인 외부에 코드가 유출되어 모르는 사람이 들어올 수 있는 경우</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle size={15} className="text-[#999] mt-1 shrink-0" />
              <span>회원이 충분히 모여 더 이상 신규 가입을 받지 않을 때 (코드 비활성화)</span>
            </li>
          </ul>
        </div>

        <p className="text-[15px] text-[#444] leading-[1.85]">
          <strong>설정 → 초대코드</strong>에서 <em>새 코드 발급</em>을 누르면, 기존 코드는 즉시 무효화되고 새 코드 8자리가 발급됩니다.
          기존 회원에게는 영향이 없습니다.
        </p>
      </section>

      {/* 다음 단계 */}
      <section className="mt-14 pt-10 border-t border-[#f0f0f0]">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-5">
          다음으로 읽으면 좋은 가이드
        </h2>
        <ul className="space-y-2 text-[15px] text-[#0a0a0a] leading-[1.8]">
          <li>
            →{' '}
            <Link href="/manual/excel-import" className="font-semibold underline underline-offset-2 hover:text-[#555]">
              기존 엑셀 회원 일괄 임포트
            </Link>{' '}
            — 이미 회원 명단이 있을 때
          </li>
          <li>
            →{' '}
            <Link href="/manual/roles-permissions" className="font-semibold underline underline-offset-2 hover:text-[#555]">
              권한 시스템: 모임장·총무·회원
            </Link>{' '}
            — 새 회원에게 어떤 권한을 줄지
          </li>
          <li>
            →{' '}
            <Link href="/manual/notice-share" className="font-semibold underline underline-offset-2 hover:text-[#555]">
              공지사항 작성과 카톡 공유
            </Link>{' '}
            — 회원 늘어난 후 첫 공지
          </li>
        </ul>
      </section>
    </>
  )
}
