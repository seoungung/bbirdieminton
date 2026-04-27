import { Info } from 'lucide-react'

/**
 * 랭킹 페이지 상단 가이드 배너
 *
 * 회원이 처음 보면 "내 실력은 뭘 기준?" 헷갈리기 쉬운 부분 정리:
 * - 랭킹: 자동 누적 — 우리 모임 안 경기 승률
 * - 급수(F~S): 수동 — 운영진이 매겨준 실력 점수 (skill_score 0~100)
 * - 5전 미만은 표본 부족 → "수습" 섹션으로 별도 표시
 */
export function RankingGuideBanner() {
  return (
    <details className="group bg-[#f8f8f8] border border-[#f0f0f0] rounded-2xl overflow-hidden">
      <summary className="cursor-pointer flex items-center gap-2 px-4 py-3 text-[12px] font-semibold text-[#555] hover:bg-[#f0f0f0] list-none transition-colors">
        <Info size={13} className="text-[#999]" strokeWidth={2.2} />
        <span className="flex-1">랭킹은 어떻게 매겨지나요?</span>
        <span className="text-[#999] text-base group-open:rotate-45 transition-transform">+</span>
      </summary>
      <div className="px-4 pb-4 pt-1 space-y-3 text-[12px] text-[#555] leading-relaxed">
        <div>
          <p className="font-bold text-[#111] mb-0.5">📊 공식 랭킹 (이 페이지)</p>
          <p>
            우리 모임에서 뛴 경기의 <strong className="text-[#111]">승률</strong> 기준입니다.
            게임보드에서 점수가 입력될 때마다 자동 누적됩니다. 5전 이상이어야 공식 랭킹에 진입해요.
          </p>
        </div>
        <div>
          <p className="font-bold text-[#111] mb-0.5">🎖️ 급수 뱃지 (F · E · D · C · B · A · S)</p>
          <p>
            운영진이 매겨준 <strong className="text-[#111]">실력 점수(0~100)</strong>를 7단계로 환산한 값입니다.
            한국 배드민턴 동호회의 일반적인 급수 체계(왕초보~자강조)와 같아요. 회원 페이지에서 운영진이 직접 조정합니다.
          </p>
        </div>
        <div>
          <p className="font-bold text-[#111] mb-0.5">⚠️ 둘은 다른 의미</p>
          <p>
            급수는 <strong>객관적 실력 추정치</strong>, 랭킹은 <strong>이번 시즌 우리 모임 안 활약도</strong>입니다.
            급수 높은 사람이 항상 랭킹 1위는 아니에요 — 자주 출석하고 잘 친 분이 1위가 됩니다.
          </p>
        </div>
      </div>
    </details>
  )
}
