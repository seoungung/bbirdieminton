import Link from 'next/link'
import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react'

export function CreateClubGuide() {
  return (
    <>
      <section className="mb-10">
        <p className="text-[16px] sm:text-[17px] leading-[1.8] text-[#222] mb-5">
          모임을 만들 총무·운영진을 위한 가장 빠른 시작 가이드입니다.
          카카오톡 가입부터 첫 회원 초대까지 약 5분이면 끝납니다.
        </p>

        <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded-2xl p-5 my-8">
          <p className="flex items-center gap-2 text-[13px] font-bold text-[#059669] mb-2">
            <Lightbulb size={15} strokeWidth={2.5} />
            이 가이드는 이런 분께
          </p>
          <ul className="text-[14px] text-[#222] leading-[1.7] space-y-1 ml-1">
            <li>· 처음 동호회를 만드는 신규 총무</li>
            <li>· 카톡 단체방 운영에 한계를 느낀 기존 총무</li>
            <li>· 엑셀로 회원 관리하다 지친 분</li>
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-3 mt-10">
          시작 전 체크리스트
        </h2>
        <ul className="space-y-2.5 text-[15px] text-[#222] leading-[1.7] my-6">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-[#10b981] mt-0.5 shrink-0" strokeWidth={2.5} />
            <span><strong>카카오톡 계정</strong> — 회원가입에 사용됩니다</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-[#10b981] mt-0.5 shrink-0" strokeWidth={2.5} />
            <span><strong>모임 이름</strong> — 나중에 변경 가능 (예: 관악 셔틀러스)</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-[#10b981] mt-0.5 shrink-0" strokeWidth={2.5} />
            <span><strong>활동 지역·요일</strong> — 회원 모집 시 노출되는 정보</span>
          </li>
        </ul>
      </section>

      {/* STEP 1 */}
      <section className="mb-14">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-3 mt-10">
          1단계 · 카카오로 1초 가입
        </h2>
        <p className="text-[15px] text-[#444] leading-[1.85] mb-5">
          홈에서 <strong>&quot;무료로 시작하기&quot;</strong> 버튼을 누르면 카카오 로그인 화면으로 이동합니다.
          별도의 비밀번호 설정 없이 카카오톡 계정으로 1초 만에 가입이 끝납니다.
          이메일·전화번호는 받지 않습니다.
        </p>

        <div className="my-6 rounded-2xl border border-[#e5e5e5] bg-[#f8f8f8] aspect-[16/9] flex items-center justify-center text-[#bbb] text-sm font-mono">
          [ 스크린샷 — 카카오 로그인 화면 ]
        </div>

        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-4 my-5">
          <p className="flex items-start gap-2 text-[13px] text-[#92400e] leading-relaxed">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>
              <strong>카카오 비즈니스 계정이 아닌 개인 계정</strong>으로 가입하시면
              됩니다. 클럽장 변경은 나중에 회원 중에서 누구든 지정할 수 있습니다.
            </span>
          </p>
        </div>
      </section>

      {/* STEP 2 */}
      <section className="mb-14">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-3 mt-10">
          2단계 · 모임 만들기
        </h2>
        <p className="text-[15px] text-[#444] leading-[1.85] mb-5">
          가입이 완료되면 자동으로 <strong>&quot;첫 모임 만들기&quot;</strong> 화면이 열립니다.
          입력할 항목은 다음 4가지입니다.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 my-6">
          <div className="bg-[#f8f8f8] border border-[#f0f0f0] rounded-2xl p-5">
            <p className="text-[12px] font-bold text-[#999] mb-1.5">모임 이름</p>
            <p className="text-[14px] text-[#222] leading-relaxed">
              지역·운영 형태가 잘 드러나는 이름이 좋습니다. (예: 관악 셔틀러스, 강남 평일 새벽팀)
            </p>
          </div>
          <div className="bg-[#f8f8f8] border border-[#f0f0f0] rounded-2xl p-5">
            <p className="text-[12px] font-bold text-[#999] mb-1.5">활동 지역</p>
            <p className="text-[14px] text-[#222] leading-relaxed">
              시·구 단위로 입력. 정확한 체육관 주소는 회원에게만 공개됩니다.
            </p>
          </div>
          <div className="bg-[#f8f8f8] border border-[#f0f0f0] rounded-2xl p-5">
            <p className="text-[12px] font-bold text-[#999] mb-1.5">정기모임 요일</p>
            <p className="text-[14px] text-[#222] leading-relaxed">
              주 1~3회 추천. 매주 같은 요일·시간으로 설정하면 회원 출석률이 올라갑니다.
            </p>
          </div>
          <div className="bg-[#f8f8f8] border border-[#f0f0f0] rounded-2xl p-5">
            <p className="text-[12px] font-bold text-[#999] mb-1.5">월 회비 (선택)</p>
            <p className="text-[14px] text-[#222] leading-relaxed">
              지금 비워두셔도 됩니다. 나중에 회비 정산 메뉴에서 설정 가능합니다.
            </p>
          </div>
        </div>

        <div className="my-6 rounded-2xl border border-[#e5e5e5] bg-[#f8f8f8] aspect-[16/9] flex items-center justify-center text-[#bbb] text-sm font-mono">
          [ 스크린샷 — 모임 만들기 폼 ]
        </div>
      </section>

      {/* STEP 3 */}
      <section className="mb-14">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-3 mt-10">
          3단계 · 초대코드로 회원 부르기
        </h2>
        <p className="text-[15px] text-[#444] leading-[1.85] mb-5">
          모임이 생성되면 자동으로 <strong>8자리 초대코드</strong>가 발급됩니다.
          이 코드를 카톡 단체방에 공유하면, 회원들이 카카오로 1초 가입 후 자동으로 우리 모임에 합류합니다.
        </p>

        <div className="bg-[#0a0a0a] text-white rounded-2xl p-6 my-6 font-mono text-center">
          <p className="text-[11px] text-white/50 uppercase tracking-widest mb-2">초대 링크 예시</p>
          <p className="text-[15px] sm:text-[16px] break-all">
            birdieminton.com/join/<span className="text-[#beff00]">A1B2C3D4</span>
          </p>
        </div>

        <p className="text-[15px] text-[#444] leading-[1.85] mb-5">
          초대코드는 만료가 없으며, 클럽 설정에서 언제든 새 코드로 교체할 수 있습니다.
          회원이 너무 많이 들어왔다면 일시적으로 비활성화도 가능합니다.
        </p>

        <p className="text-[15px] text-[#444] leading-[1.85]">
          이미 엑셀로 회원 명단을 갖고 계시다면, 초대코드를 공유하지 않고{' '}
          <Link href="/manual/excel-import" className="text-[#0a0a0a] font-semibold underline underline-offset-2 hover:text-[#555]">
            엑셀 일괄 등록
          </Link>
          으로 한 번에 등록하실 수도 있습니다.
        </p>
      </section>

      {/* STEP 4 */}
      <section className="mb-12">
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a0a0a] mb-3 mt-10">
          4단계 · 첫 정기모임 등록
        </h2>
        <p className="text-[15px] text-[#444] leading-[1.85] mb-5">
          회원이 어느 정도 모이면 첫 정기모임을 등록합니다. <strong>일정</strong> 메뉴에서{' '}
          <strong>새 모임 추가</strong>를 누르고 날짜·시간·장소를 입력하면 끝.
          참석 투표가 자동으로 열려서, 모임 전날까지 누가 올지 미리 확인하실 수 있습니다.
        </p>

        <div className="my-6 rounded-2xl border border-[#e5e5e5] bg-[#f8f8f8] aspect-[16/9] flex items-center justify-center text-[#bbb] text-sm font-mono">
          [ 스크린샷 — 정기모임 등록 + 참석 투표 ]
        </div>

        <p className="text-[15px] text-[#444] leading-[1.85]">
          정기모임 당일에는 <strong>게임보드</strong>를 켜고 출석체크를 시작하시면 됩니다.
          출석한 인원으로 자동 팀배정·코트 배정이 즉시 이뤄집니다.
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
            <Link href="/manual/invite-members" className="font-semibold underline underline-offset-2 hover:text-[#555]">
              초대코드로 회원 초대하기
            </Link>{' '}
            — 카톡 공유 메시지 예시 포함
          </li>
          <li>
            →{' '}
            <Link href="/manual/gameboard-basics" className="font-semibold underline underline-offset-2 hover:text-[#555]">
              게임보드 기본 사용법
            </Link>{' '}
            — 첫 정기모임 운영 가이드
          </li>
          <li>
            →{' '}
            <Link href="/manual/fee-settlement" className="font-semibold underline underline-offset-2 hover:text-[#555]">
              월 회비 자동 정산 설정
            </Link>{' '}
            — 두 번째 달부터 도움 됩니다
          </li>
        </ul>
      </section>
    </>
  )
}
