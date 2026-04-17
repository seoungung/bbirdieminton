import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '버디민턴 소개',
  description: '서울로 이사 오면서 배드민턴을 시작했어요. 라켓 뭘 사야 할지, 체육관은 어떻게 가야 할지 아무도 알려주지 않았어요. 그래서 만들었습니다.',
  openGraph: {
    title: '버디민턴 소개 | birdieminton',
    description: '배린이의 막막함에서 시작된 플랫폼. 버디민턴이 만들어진 이유.',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-[#111]">

      {/* ── 히어로 ── */}
      <section className="max-w-[1088px] mx-auto px-5 pt-16 pb-12">
        <p className="text-xs font-bold text-[#beff00] uppercase tracking-widest mb-4">
          About Birdieminton
        </p>
        <h1 className="text-[2rem] sm:text-[2.6rem] font-extrabold text-[#111] leading-[1.2] mb-6">
          아무도 알려주지 않아서,<br />
          직접 만들었어요.
        </h1>
        <p className="text-[1.05rem] text-[#555] leading-relaxed">
          배드민턴을 시작할 때 가장 많이 받는 질문이 있어요.<br />
          <span className="text-[#111] font-semibold">&ldquo;라켓 쿠팡에서 샀는데 괜찮은 건가요?&rdquo;</span>
        </p>
      </section>

      {/* ── 구분선 ── */}
      <div className="max-w-[1088px] mx-auto px-5">
        <hr className="border-[#e5e5e5]" />
      </div>

      {/* ── 브랜드 스토리 ── */}
      <section className="max-w-[1088px] mx-auto px-5 py-12 space-y-7 text-[0.97rem] text-[#333] leading-[1.95]">

        <p>
          서울로 이사 오면서 아는 사람이 한 명도 없었어요.<br />
          친구도 사귀고 운동도 할 겸 러닝 모임에 참여했고, 겨울이 되자 모임장이 말했죠.
        </p>

        <blockquote className="border-l-4 border-[#beff00] pl-5 text-[#555] italic">
          &ldquo;실내 운동 해볼래요? 배드민턴 어때요?&rdquo;
        </blockquote>

        <p>그렇게 시작했어요.</p>

        <p>
          첫 라켓은 쿠팡에서 후기 좋은 걸로 그냥 샀어요. 기준 같은 건 없었죠.<br />
          두 번째 라켓은 본격적으로 해보겠다고 인터넷 서치도 해보고, 구력 있는 분한테 조언도 구했어요.
        </p>

        <p>
          서치 정보는 이미 잘 치는 동호인들 기준이었고, 라켓 스펙은 이해하기 어려웠어요.<br />
          조언은 결국{' '}
          <span className="text-[#111] font-semibold">&ldquo;써봐야 안다&rdquo;</span>는 말이 전부였죠.
        </p>

        <p>결국 당근에서 적당히 저렴한 걸 샀어요. 그게 지금도 쓰고 있는 라켓이에요.</p>

        {/* 첫 체육관 에피소드 카드 */}
        <div className="bg-[#f8f8f8] rounded-2xl p-6 space-y-4">
          <p className="text-xs font-bold text-[#999] uppercase tracking-wider">첫 체육관, 독산</p>
          <p>
            데스크에서 첫 마디가 &ldquo;배드민턴화 있으시죠?&rdquo;였어요.
          </p>
          <p className="text-[#777] italic text-[0.93rem]">
            배드민턴화? 그냥 신발 신고 왔는데.
          </p>
          <p>
            나무 바닥이라 일반화는 안 된다고, 실내화가 필요하다고. 셔틀콕은요?
            형광 셔틀콕을 보여줬더니 &ldquo;그건 안 되고, 깃털콕만 됩니다.{' '}
            <span className="text-[#111] font-semibold">25,000원이에요.</span>&rdquo;
          </p>
          <p>
            설명해주신 건 감사했어요. 근데 배드민턴 한 번 치는 데 신발 대여료에 셔틀콕 비용까지.
            생각지도 못한 비용이었어요.
          </p>
          <p>빈 코트를 찾아 들어갔더니 클럽 사람이 왔어요.</p>
          <blockquote className="border-l-2 border-[#e5e5e5] pl-4 text-[#777] text-[0.93rem]">
            &ldquo;여기 클럽 코트예요. 일반인은 저쪽 코트로 가세요.&rdquo;
          </blockquote>
          <p className="text-[#555]">눈치 보였어요.</p>
        </div>

        <p>
          게임을 배우면서 더 혼란스러웠어요.<br />
          21점인지 25점인지, 서브 규칙은 뭔지.<br />
          가르쳐주는 동호인마다 조금씩 달랐거든요.
        </p>

        <p>
          레슨을 시작하고 6개월쯤 됐을 때였어요.<br />
          달에 한 번 나오는 동호인 분이 경기 끝나고 말씀하셨어요.
        </p>

        <blockquote className="border-l-4 border-[#beff00] pl-5 text-[#111] font-bold text-[1.05rem]">
          &ldquo;많이 늘었다.&rdquo;
        </blockquote>

        <p>그 한마디가 제일 크게 느껴졌어요.</p>

        <p>
          D조가 되면서 새로운 고민이 생겼어요.<br />
          다른 동호인들 라켓을 만져보고, 한 게임 빌려서 쳐보면서 느꼈어요.<br />
          지금 내 라켓이 나랑 안 맞는다는 것을.<br />
          내 근력에 비해 무겁고 딱딱한 것 같은데, 어디서 어떻게 찾아야 할지 모르겠는 거예요.
        </p>

        <p>
          그러면서 생각했어요. 나만의 문제가 아니라는 걸.<br />
          동호회에서 항상 나오는 질문이 있었거든요.
        </p>

        <blockquote className="border-l-4 border-[#beff00] pl-5 text-[#555] italic">
          &ldquo;라켓 쿠팡에서 샀는데 괜찮은 건가요?&rdquo;
        </blockquote>

        <p>
          배린이도 묻고, D조도 묻고, 레슨 시작하려는 분도 묻고.<br />
          배드민턴을 시작할 때, 레슨 코치를 찾을 때, 내 레벨에 맞는 라켓을 찾을 때.<br />
          이걸 한눈에 볼 수 있는 곳이 있었다면 조금 더 쉽지 않았을까.
        </p>

        <p className="text-[#111] font-bold text-[1.05rem]">
          그래서 Birdieminton을 만들었어요.
        </p>
      </section>

      {/* ── 우리가 해결하는 것 ── */}
      <section className="bg-[#f8f8f8] border-t border-[#e5e5e5] py-14">
        <div className="max-w-[1088px] mx-auto px-5">
          <p className="text-xs font-bold text-[#999] uppercase tracking-wider mb-8">
            Birdieminton이 해결하는 것
          </p>
          <div className="space-y-4">
            {[
              {
                num: '01',
                title: '기준 없이 라켓 고르는 문제',
                desc: '쿠팡 후기나 "써봐야 안다"는 말 대신, 내 레벨에 맞는 스펙 기준을 제시해요.',
              },
              {
                num: '02',
                title: '체육관 처음 갔을 때의 당황함',
                desc: '배드민턴화, 깃털콕, 클럽 코트 문화. 아무도 미리 알려주지 않는 것들을 정리했어요.',
              },
              {
                num: '03',
                title: '레슨 코치·동호회 찾기의 막막함',
                desc: '배드민턴 시작의 모든 여정을 한곳에서 볼 수 있도록 만들어가고 있어요.',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex gap-5 items-start bg-white rounded-2xl p-5 border border-[#e5e5e5]">
                <span className="text-[#beff00] font-extrabold text-[1.1rem] shrink-0 mt-0.5 w-7">{num}</span>
                <div>
                  <p className="font-bold text-[#111] mb-1 text-[0.95rem]">{title}</p>
                  <p className="text-[0.88rem] text-[#555] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 지금의 버디민턴 ── */}
      <section className="max-w-[1088px] mx-auto px-5 py-14">
        <p className="text-xs font-bold text-[#999] uppercase tracking-wider mb-6">
          지금의 Birdieminton
        </p>
        <p className="text-[0.97rem] text-[#333] leading-[1.95] mb-4">
          저도 아직 내 라켓을 찾는 중이에요.<br />
          그래서 더 잘 알아요. 그 막막함을.
        </p>
        <p className="text-[0.97rem] text-[#333] leading-[1.95]">
          Birdieminton은 과거의 저를 위한 플랫폼이에요.<br />
          그리고 지금 여러분을 위한 플랫폼이기도 해요.
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#111] py-14">
        <div className="max-w-[1088px] mx-auto px-5 text-center">
          <p className="text-white font-extrabold text-[1.3rem] mb-2">
            내 레벨부터 확인해보세요.
          </p>
          <p className="text-white/50 text-[0.9rem] mb-8">
            2분이면 내 레벨과 딱 맞는 라켓 조건을 알 수 있어요.
          </p>
          <Link
            href="/quiz"
            className="inline-block bg-[#beff00] text-[#111] font-bold text-[0.95rem] px-8 py-3.5 rounded-full hover:bg-[#a8e600] transition-colors"
          >
            레벨 테스트 시작하기 →
          </Link>
        </div>
      </section>

    </main>
  )
}
