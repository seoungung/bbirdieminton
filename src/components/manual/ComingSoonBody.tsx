import Link from 'next/link'
import { Construction, Bell } from 'lucide-react'

export function ComingSoonBody() {
  return (
    <div className="text-center py-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mb-6">
        <Construction size={28} strokeWidth={2} />
      </div>

      <h2 className="text-2xl font-extrabold text-[#111] mb-3">
        이 가이드는 아직 준비 중입니다
      </h2>
      <p className="text-[14px] text-[#666] leading-relaxed max-w-[440px] mx-auto mb-8">
        좋은 콘텐츠로 빠르게 채워 드리겠습니다.<br />
        먼저 알림을 원하시면 문의를 남겨 주세요.
      </p>

      <Link
        href="/contact"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white font-bold text-[13px] rounded-full hover:bg-[#222] transition-colors"
      >
        <Bell size={13} />
        가이드 알림 받기
      </Link>
    </div>
  )
}
