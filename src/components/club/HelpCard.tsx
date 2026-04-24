import Link from 'next/link'
import { HelpCircle, MessageSquare } from 'lucide-react'

/**
 * 사이드바 하단 도움말·피드백 카드
 */
export function HelpCard() {
  return (
    <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl overflow-hidden">
      <Link
        href="/faq"
        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f5f5f5] transition-colors border-b border-[#f0f0f0]"
      >
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#555]">
          <HelpCircle size={13} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[#111] truncate">자주 묻는 질문</p>
          <p className="text-[10px] text-[#999] truncate">도움말 센터</p>
        </div>
      </Link>
      <Link
        href="/contact"
        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f5f5f5] transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#555]">
          <MessageSquare size={13} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[#111] truncate">문의·피드백</p>
          <p className="text-[10px] text-[#999] truncate">버그·기능 제안</p>
        </div>
      </Link>
    </div>
  )
}
