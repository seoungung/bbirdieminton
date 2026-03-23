import type { Metadata } from 'next'
import { PartnershipForm } from '@/components/partnership/PartnershipForm'

export const metadata: Metadata = {
  title: '제휴 문의 | 버디민턴',
  description: '버디민턴과 함께할 파트너를 찾습니다. 광고, 콘텐츠, 제품 협업 등 다양한 형태의 제휴를 환영합니다.',
}

export default function PartnershipPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">

        {/* 헤더 */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-[#beff00] tracking-widest uppercase mb-3">
            Partnership
          </p>
          <h1 className="text-[36px] sm:text-[48px] font-extrabold text-white leading-[1.15] tracking-[-0.03em] mb-4">
            함께 성장하는<br />파트너십
          </h1>
          <p className="text-[16px] text-white/50 leading-[1.8] max-w-lg">
            버디민턴은 배드민턴 입문자에게 올바른 정보를 전달하는 플랫폼입니다.
            광고, 콘텐츠 협업, 제품 리뷰, 이벤트 제휴 등 다양한 형태의 파트너십을 환영합니다.
          </p>
        </div>

        {/* 협업 유형 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
          {[
            { icon: '🏸', title: '제품 리뷰', desc: '라켓·장비 리뷰 및 도감 등록' },
            { icon: '📣', title: '광고 협업', desc: '배너, 뉴스레터, 콘텐츠 광고' },
            { icon: '🎯', title: '이벤트 제휴', desc: '대회, 클럽, 레슨 파트너십' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-4">
              <span className="text-2xl mb-2 block">{icon}</span>
              <p className="text-sm font-semibold text-white mb-1">{title}</p>
              <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* 문의 폼 */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-6 sm:p-8">
          <h2 className="text-[18px] font-bold text-white mb-6 tracking-[-0.02em]">
            문의 보내기
          </h2>
          <PartnershipForm />
        </div>

      </div>
    </div>
  )
}
