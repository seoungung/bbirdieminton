import Link from 'next/link'
import { Users } from 'lucide-react'
import type { ClubWithRole } from '@/types/club'

const ROLE_LABEL: Record<string, string> = {
  owner: '운영자',
  manager: '매니저',
  member: '멤버',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

export function ClubCard({ club }: { club: ClubWithRole }) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 hover:border-[#beff00]/50 transition-colors">
      {/* Top row: name + date + role badge */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-[#111] text-[15px] leading-snug">{club.name}</h3>
        <div className="flex items-center gap-1.5 shrink-0 ml-3 mt-0.5">
          <span className="text-[11px] text-[#bbb]">{formatDate(club.created_at)}</span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              club.myRole === 'owner'
                ? 'bg-[#beff00]/15 text-[#6a8800]'
                : 'bg-[#f0f0f0] text-[#777]'
            }`}
          >
            {ROLE_LABEL[club.myRole] ?? club.myRole}
          </span>
        </div>
      </div>

      {/* Description */}
      {club.description && (
        <p className="text-sm text-[#777] mb-3 line-clamp-1">{club.description}</p>
      )}

      {/* Meta info */}
      <div className="flex items-center gap-3 text-xs text-[#999] mb-4">
        <span className="flex items-center gap-1">
          <Users size={12} />
          {club.memberCount}명
        </span>
        <span className="text-[#e5e5e5]">·</span>
        <span>🏸 코트 {club.court_count}면</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link
          href={`/club/${club.id}`}
          className="flex-1 py-2.5 bg-[#111] text-white font-semibold text-sm rounded-xl text-center hover:bg-[#333] transition-colors"
        >
          입장하기
        </Link>
        <Link
          href={`/club/${club.id}/ranking`}
          className="flex-1 py-2.5 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl text-center hover:brightness-95 transition-all"
        >
          🏆 게임 결과
        </Link>
      </div>
    </div>
  )
}
