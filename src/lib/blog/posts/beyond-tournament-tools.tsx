export function BeyondTournamentToolsBody() {
  return (
    <div className="space-y-6">
      <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0a0a0a] mt-10 mb-4">
        들어가며
      </h2>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        서울 이사 와서 친구 사귀려고 운동 모임을 다녔어요. 러닝하다가 어느 겨울에 권유로
        배드민턴을 시작했고, 그러다 여러 동호회를 거치게 됐습니다.
      </p>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        운영진 옆에서 본 게 많았어요. 매주 게임 매칭에 30분 쓰는 모임장, 신입이 한두 번 오고
        안 오는 모임, 정보가 카톡·엑셀·종이에 흩어진 풍경.
      </p>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        그러면서 동호회 운영 도구에 대한 이야기도 듣게 됐습니다. 여러 모임에서 위꾹라이브 같은
        대회 운영 도구를 쓰는 걸 들었어요. 큰 대회를 자동화로 굴리는 게 가능한 시대가 됐다는
        게 인상 깊었습니다.
      </p>

      <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0a0a0a] mt-10 mb-4">
        대회 운영 도구가 잘하는 것
      </h2>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        대회용 도구들은 토너먼트 운영의 종결자입니다. 대진표 자동 생성, 태블릿 심판 앱,
        실시간 스코어링, 카톡 자동 알림, 라이브 중계까지. 100명 넘는 토너먼트도 하루에
        끝납니다. 손으로 대진표 그리고 마이크로 호명하던 시절을 생각하면, 정말 다른 세상.
      </p>

      <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0a0a0a] mt-10 mb-4">
        그런데 일상 운영이 빠져있다
      </h2>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        문제는 대회가 1년에 한두 번이라는 거예요. 나머지 50주는 어떻게 굴러갈까요?
      </p>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        대부분의 대회 운영 도구는 매뉴얼이 "대회 개설 → 참가자 → 진행현황 → 대진표 → 순위"
        흐름으로 짜여 있습니다. "일상 운영", "회비", "정기모임", "출석", "매주 매칭" 같은
        단어가 거의 없어요.
      </p>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        결국 대회 끝나면 다시 카톡 단체방 + 엑셀로 돌아갑니다. 매주 매칭은 손으로, 출석은
        카톡 답글로, 회비는 엑셀 버전 꼬여가며. 도구 하나로 해결될 줄 알았던 운영은 결국
        "대회용 도구 + 카톡 + 엑셀" 세 개 사이에 흩어지고, 그 사이를 모임장이 머리로
        연결합니다.
      </p>

      <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0a0a0a] mt-10 mb-4">
        일상 운영의 진짜 burden
      </h2>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        여러 동호회 옆에서 보면서 운영자들이 매주 마주하는 것들이 보였어요.
      </p>
      <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-[16px] leading-[1.8] text-[#333]">
        <li>
          <strong className="font-semibold">매주 게임 매칭 30분</strong> — 코트 4개에 16명,
          실력 차 어떻게 맞추지
        </li>
        <li>
          <strong className="font-semibold">신입이 한두 번 오고 안 옴</strong> — 첫날 어색한데
          운영자가 직접 챙겨줘야 적응
        </li>
        <li>
          <strong className="font-semibold">회비 정산이 매번 민망</strong> — "누구 안 냈더라"
          알려주는 카톡이 늘 어려움
        </li>
        <li>
          <strong className="font-semibold">회원이 모든 결정을 모임장에게 의존</strong> — 권한
          위임이 안 되는 구조
        </li>
        <li>
          <strong className="font-semibold">정보가 흩어진 상태</strong> — 출석은 카톡, 회비는
          엑셀, 매칭은 종이
        </li>
      </ul>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        이게 1년에 한두 번 있는 대회보다 훨씬 큰 짐입니다. 그런데 도구가 없어서 운영자 한
        명의 머리에 다 들어가 있어요.
      </p>

      <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0a0a0a] mt-10 mb-4">
        우리에게 필요했던 도구
      </h2>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        여러 운영자분께 "이거 도구로 풀면 어때요?" 물어봤어요. 다들 "있으면 좋지"였고, 직접
        만들기 시작했습니다.
      </p>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        라켓 가이드부터 시작해서 (v1), 배린이용 진단 PDF로 좁혔다가 (v2), 결국 운영 도구로
        도착했습니다 (v3, 지금). 라켓 한 자루보다 매주의 운영이 더 큰 짐이라는 걸 만들면서
        깨달았어요.
      </p>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        지금 만든 게 Birdieminton입니다. 매주의 운영을 위한 도구예요. 게임 매칭, 출석, 회비,
        정기모임 RSVP, 랭킹, 공지를 한 곳에서.
      </p>

      <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0a0a0a] mt-10 mb-4">
        정리
      </h2>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        대회 운영 도구와 일상 운영 도구는 다른 시장입니다.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px] sm:text-[15px]">
          <thead>
            <tr>
              <th className="bg-[#f8f8f8] border border-[#e5e5e5] px-4 py-3 text-left font-bold text-[#111]">
                도구
              </th>
              <th className="bg-[#f8f8f8] border border-[#e5e5e5] px-4 py-3 text-left font-bold text-[#111]">
                쓰는 때
              </th>
              <th className="bg-[#f8f8f8] border border-[#e5e5e5] px-4 py-3 text-left font-bold text-[#111]">
                해결하는 것
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#e5e5e5] px-4 py-3 text-[#333] font-semibold">
                대회 운영 도구
              </td>
              <td className="border border-[#e5e5e5] px-4 py-3 text-[#333]">
                1년에 1~2번 큰 대회
              </td>
              <td className="border border-[#e5e5e5] px-4 py-3 text-[#333]">
                대진표·심판·중계·알림 자동화
              </td>
            </tr>
            <tr>
              <td className="border border-[#e5e5e5] px-4 py-3 text-[#333] font-semibold">
                Birdieminton
              </td>
              <td className="border border-[#e5e5e5] px-4 py-3 text-[#333]">
                매주 일상 운영
              </td>
              <td className="border border-[#e5e5e5] px-4 py-3 text-[#333]">
                매칭·출석·회비·랭킹·공지 자동화
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        같이 쓰시는 클럽도 자연스럽습니다. 시장이 분리되어 있을 뿐 둘 다 운영의 부담을
        자동화하는 도구라는 점은 같으니까요.
      </p>
      <p
        className="text-[15px] sm:text-[16px] leading-[1.8] text-[#333]"
        style={{ wordBreak: 'keep-all' }}
      >
        올여름, 저도 이 도구로 첫 모임을 시작합니다. '버디민턴' 브랜드로. 같이 쾌적하고 쉬운
        배드민턴 즐기실 분 찾아오세요.
      </p>
    </div>
  )
}
