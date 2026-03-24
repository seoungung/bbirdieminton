import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '라켓 선택 가이드 | 버디민턴',
  description: '배드민턴 라켓을 고를 때 가장 중요한 5가지 포인트. 무게, 밸런스, 샤프트, 프레임, 맥스텐션을 이해하면 내 라켓을 제대로 고를 수 있어요.',
}

const GUIDE_POINTS = [
  {
    number: '01',
    title: '무게',
    subtitle: '숫자가 올라갈수록 가벼워요',
    body: '라켓 무게는 보통 3U~6U로 표기돼요. U 앞 숫자가 클수록 가벼운 라켓이에요. 4U(80~85g)가 가장 많이 출시되고, 입문자에게 가장 보편적인 무게예요. 처음에는 무거운 라켓보다 가벼운 5U~6U로 시작하는 게 팔꿈치 부상을 줄이는 데 도움이 돼요.',
    table: [
      { key: '6U', value: '가장 가벼움 (약 70~74g) — 왕초보, 근력 약한 분' },
      { key: '5U', value: '가벼움 (약 75~79g) — 왕초보~초심자' },
      { key: '4U', value: '보통 (약 80~84g) — 가장 보편적' },
      { key: '3U', value: '약간 무거움 (약 85~89g) — D조~C조' },
      { key: '2U', value: '무거움 (약 90g+) — 상급자' },
    ],
    tip: '처음 시작이라면 5U 이상의 가벼운 라켓을 먼저 써보세요.',
    color: '#beff00',
  },
  {
    number: '02',
    title: '밸런스',
    subtitle: '수비냐 공격이냐, 내 스타일을 먼저 파악하세요',
    body: '밸런스는 라켓의 무게중심 위치예요. 헤드라이트는 손잡이 쪽이 무거운 형태로 수비와 빠른 드라이브에 유리하고, 헤드헤비는 헤드 쪽이 무거워 스매시 등 공격에 파워가 실려요. 이븐밸런스는 둘의 중간으로 올라운드형이에요.',
    table: [
      { key: '헤드라이트', value: '수비·속도에 강함, 공격 파워는 다소 부족' },
      { key: '이븐밸런스', value: '수비·공격 균형, 올라운드 플레이어에게 적합' },
      { key: '헤드헤비', value: '스매시·공격에 강함, 수비 반응은 느릴 수 있음' },
    ],
    tip: '입문자라면 이븐밸런스나 헤드라이트부터 시작하는 걸 추천해요.',
    color: '#beff00',
  },
  {
    number: '03',
    title: '샤프트 (강성)',
    subtitle: '탄성이 실력을 좌우해요',
    body: '샤프트는 라켓의 대 부분을 차지하는 몸통 부분의 굳기예요. 경고(Stiff)는 임팩트가 잘 맞으면 강한 타구가 가능하지만 힘이 필요해요. 유연(Flexible)은 스윙이 가볍고 빠르지만 타이밍 맞추기가 어려울 수 있어요. 입문자에게는 보통(Medium)이 가장 적합해요.',
    table: [
      { key: 'Flexible', value: '스윙 가볍고 빠름, 타이밍 맞추기 어려울 수 있음 — 왕초보·초심자' },
      { key: 'Medium', value: '중간 탄성, 무난한 선택 — 초심자~D조' },
      { key: 'Stiff', value: '강한 임팩트, 힘이 필요 — D조~C조 이상' },
    ],
    tip: '실력이 늘기 전에 너무 딱딱한 라켓을 쓰면 손목·팔꿈치에 무리가 와요.',
    color: '#beff00',
  },
  {
    number: '04',
    title: '프레임',
    subtitle: '바디 두께와 헤드 모양을 확인하세요',
    body: '프레임은 두 가지를 봐야 해요. 첫째, 바디(두께): 와이드바디는 프레임이 굵어 작은 힘으로도 멀리 보내기 좋고, 슬림바디는 얇아서 빠른 스윙과 정밀한 컨트롤에 유리해요. 둘째, 헤드 형태: 아이소메트릭(각진 형태)은 스윗스팟이 넓어 안정적이고, 오벌(계란형)은 파워 집중도가 높아요.',
    table: [
      { key: '와이드바디', value: '프레임 굵음, 탄성 강함, 멀리 날리기 쉬움' },
      { key: '슬림바디', value: '프레임 얇음, 빠른 스윙, 정밀 컨트롤' },
      { key: '아이소메트릭', value: '스윗스팟 넓음, 실수해도 어느정도 날아감' },
      { key: '오벌', value: '파워 집중, 공격적 타구 — 최근 다시 유행' },
    ],
    tip: '입문자에게는 아이소메트릭 + 와이드바디 조합이 가장 관대한 라켓이에요.',
    color: '#beff00',
  },
  {
    number: '05',
    title: '맥스텐션',
    subtitle: '이걸 모르고 사면 라켓 또 사야 해요',
    body: '맥스텐션은 라켓이 버틸 수 있는 최대 스트링 장력이에요. 라켓에 직접 표기되어 있어요. 일반 동호인은 보통 25~27lbs를 사용하고, 상급자는 28~30lbs까지 써요. 맥스텐션이 22lbs인 라켓을 사면 나중에 제대로 된 텐션을 치지 못하고 라켓을 또 사야 하는 상황이 생겨요.',
    table: [
      { key: '여성·학생', value: '24~25lbs 사용 → 최소 28lbs 지원 라켓 필요' },
      { key: '일반 남성', value: '25~26lbs 사용 → 최소 28lbs 지원 라켓 필요' },
      { key: '상급자', value: '27~30lbs 사용 → 28~33lbs 지원 라켓 필요' },
    ],
    tip: '최소 28~30lbs를 지원하는 라켓을 사야 오래 사용할 수 있어요. 라켓 구매 전 꼭 확인하세요!',
    color: '#ff6b6b',
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {/* 헤더 */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold text-[#beff00] tracking-widest uppercase mb-3">Guide</p>
          <h1 className="text-[36px] sm:text-[52px] font-extrabold text-white leading-[1.15] tracking-[-0.03em] mb-4">
            라켓 고를 때<br />가장 중요한 5가지
          </h1>
          <p className="text-[15px] text-white/50 leading-[1.8]">
            무게, 밸런스, 샤프트, 프레임, 맥스텐션 — 이 5가지만 알면<br />
            어떤 라켓이든 직접 고를 수 있어요.
          </p>
        </div>

        {/* 가이드 포인트 */}
        <div className="space-y-6">
          {GUIDE_POINTS.map((point) => (
            <div key={point.number} className="bg-[#1a1a1a] border border-white/8 rounded-2xl overflow-hidden">
              {/* 헤더 */}
              <div className="flex items-start gap-5 p-6 sm:p-8 border-b border-white/6">
                <span className="text-[40px] sm:text-[56px] font-extrabold text-white/8 leading-none tracking-tighter shrink-0 select-none">
                  {point.number}
                </span>
                <div>
                  <h2 className="text-[22px] sm:text-[26px] font-extrabold text-white tracking-[-0.02em] mb-1">
                    {point.title}
                  </h2>
                  <p className="text-sm text-white/40">{point.subtitle}</p>
                </div>
              </div>

              {/* 본문 */}
              <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
                {/* 설명 */}
                <div>
                  <p className="text-[14px] text-white/65 leading-[1.9] mb-5">{point.body}</p>
                  {/* 팁 */}
                  <div
                    className="flex items-start gap-2.5 p-3.5 rounded-xl"
                    style={{ background: point.color === '#ff6b6b' ? 'rgba(255,107,107,0.08)' : 'rgba(190,255,0,0.07)' }}
                  >
                    <span className="text-base shrink-0">💡</span>
                    <p className="text-xs leading-relaxed" style={{ color: point.color }}>
                      {point.tip}
                    </p>
                  </div>
                </div>

                {/* 표 */}
                <div className="bg-white/3 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {point.table.map(({ key, value }) => (
                        <tr key={key} className="border-b border-white/5 last:border-0">
                          <td className="px-3.5 py-2.5 font-bold text-white text-xs whitespace-nowrap align-top w-24">
                            {key}
                          </td>
                          <td className="px-3.5 py-2.5 text-white/50 text-xs leading-relaxed">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 CTA */}
        <div className="mt-14 bg-[#1a1a1a] border border-white/8 rounded-2xl p-8 sm:p-10 text-center">
          <p className="text-xs font-bold text-[#beff00] tracking-widest uppercase mb-3">Next Step</p>
          <h3 className="text-[22px] sm:text-[28px] font-extrabold text-white tracking-[-0.02em] mb-3">
            내 레벨에 맞는 라켓이 궁금하다면?
          </h3>
          <p className="text-white/40 text-sm mb-7">
            레벨 테스트로 내 수준을 진단하고, 딱 맞는 라켓 조건을 확인해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/quiz"
              className="px-8 py-3.5 bg-[#beff00] text-[#0a0a0a] font-bold text-sm rounded-full hover:brightness-105 transition-all"
            >
              레벨 테스트 하기 →
            </Link>
            <Link
              href="/rackets"
              className="px-8 py-3.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm rounded-full transition-colors"
            >
              라켓 도감 보기
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
