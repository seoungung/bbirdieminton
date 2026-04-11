import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'
import type { ClubWithRole } from '@/types/club'

const ROLE_LABEL: Record<string, string> = {
  owner: '운영자',
  manager: '매니저',
  member: '멤버',
}

export function ClubCard({ club }: { club: ClubWithRole }) {
  return (
    <Link
      href={`/club/${club.id}`}
      className="flex items-center justify-between bg-white border border-[#e5e5e5] rounded-2xl p-4 hover:border-[#beff00] transition-colors active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#beff00]/20 rounded-xl flex items-center justify-center text-xl shrink-0">
          🏸
        </div>
        <div>
          <p className="font-bold text-[#111] text-base leading-snug">{club.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1 text-xs text-[#999]">
              <Users size={11} />
              {club.memberCount}명
            </span>
            <span className="text-[#e5e5e5]">·</span>
            <span className="text-xs text-[#beff00] font-semibold bg-[#beff00]/10 px-1.5 py-0.5 rounded-md">
              {ROLE_LABEL[club.myRole] ?? club.myRole}
            </span>
          </div>
        </div>
      </div>
      <ChevronRight size={18} className="text-[#bbb] shrink-0" />
    </Link>
  )
}
