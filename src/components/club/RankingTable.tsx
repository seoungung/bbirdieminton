import { BarChart3, Medal, Crown } from 'lucide-react'
import { GradeBadge } from '@/components/club/GradeBadge'
import type { RankingRow } from '@/types/club'

const PODIUM_STYLES: Array<{
  icon: string
  cardBg: string
  cardBorder: string
  medalColor: string
}> = [
  { icon: '🥇', cardBg: 'bg-gradient-to-br from-amber-50 to-yellow-100/50', cardBorder: 'border-amber-300', medalColor: 'text-amber-500' },
  { icon: '🥈', cardBg: 'bg-gradient-to-br from-slate-50 to-slate-100',    cardBorder: 'border-slate-300', medalColor: 'text-slate-400'  },
  { icon: '🥉', cardBg: 'bg-gradient-to-br from-orange-50 to-amber-50',    cardBorder: 'border-orange-200', medalColor: 'text-orange-500' },
]

export function RankingTable({
  ranking,
  currentUserId,
}: {
  ranking: RankingRow[]
  currentUserId: string
}) {
  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e5e5] text-center py-20">
        <BarChart3 size={44} className="text-[#ccc] mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-bold text-[#111]">아직 경기 기록이 없어요</p>
        <p className="text-sm text-[#999] mt-1">경기 결과를 입력하면 랭킹이 쌓여요</p>
      </div>
    )
  }

  return (
    <div className="space-y-2" role="table" aria-label="모임 랭킹">
      {ranking.map((row) => {
        const isMe = row.member.user_id === currentUserId
        const podium = row.rank <= 3 ? PODIUM_STYLES[row.rank - 1] : null
        const winRate =
          row.games_played > 0
            ? ((row.wins / row.games_played) * 100).toFixed(1)
            : '0.0'

        return (
          <div
            key={row.id}
            role="row"
            aria-current={isMe ? 'true' : undefined}
            className={
              'flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-colors ' +
              (isMe
                ? 'border-[#beff00] bg-[#beff00]/5'
                : podium
                ? `${podium.cardBg} ${podium.cardBorder}`
                : 'bg-white border-[#e5e5e5]')
            }
          >
            {/* 순위 */}
            <div className={`w-8 flex flex-col items-center justify-center shrink-0`}>
              {podium ? (
                <>
                  <Medal
                    size={22}
                    fill="currentColor"
                    strokeWidth={1.5}
                    className={podium.medalColor}
                  />
                  <span className={`text-[9px] font-extrabold -mt-0.5 ${podium.medalColor}`}>
                    {row.rank}
                  </span>
                </>
              ) : (
                <span className="font-extrabold text-base text-[#999] tabular-nums">{row.rank}</span>
              )}
            </div>

            {/* 아바타 */}
            <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#555] shrink-0 overflow-hidden">
              {row.member.user.profile_img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.member.user.profile_img}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                row.member.user.name.slice(0, 1)
              )}
            </div>

            {/* 이름 + 급수 + 전적 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <GradeBadge score={row.member.skill_score} size="sm" />
                <p className="text-sm font-bold text-[#111] truncate">
                  {row.member.user.name}
                </p>
                {isMe && (
                  <span className="text-[10px] font-bold text-[#111] bg-[#beff00] px-1.5 py-0.5 rounded-md shrink-0">
                    나
                  </span>
                )}
                {row.rank === 1 && !isMe && (
                  <Crown size={12} className="text-amber-500 shrink-0" strokeWidth={2.5} />
                )}
              </div>
              <p className="text-xs text-[#999] tabular-nums">
                {row.games_played}전 {row.wins}승 {row.losses}패{row.draws > 0 ? ` ${row.draws}무` : ''}
              </p>
            </div>

            {/* 승률 원형 표시 */}
            <div className="text-right shrink-0">
              <p className="text-xl font-black text-[#111] tabular-nums leading-none">
                {winRate}
                <span className="text-[10px] font-semibold text-[#999] ml-0.5">%</span>
              </p>
              <p className="text-[10px] text-[#999] mt-1">승률</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
