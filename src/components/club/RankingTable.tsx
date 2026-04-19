import type { RankingRow } from '@/types/club'

const RANK_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

export function RankingTable({
  ranking,
  currentUserId,
}: {
  ranking: RankingRow[]
  currentUserId: string
}) {
  if (ranking.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-bold text-[#111]">아직 경기 기록이 없어요</p>
        <p className="text-sm text-[#999] mt-1">경기 결과를 입력하면 랭킹이 쌓여요</p>
      </div>
    )
  }

  return (
    <div className="space-y-2" role="table" aria-label="모임 랭킹">
      {ranking.map((row) => {
        const isMe = row.member.user_id === currentUserId
        const rankColor = RANK_COLORS[row.rank - 1] ?? 'text-[#999]'
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
                : 'bg-white border-[#e5e5e5]')
            }
          >
            {/* 순위 */}
            <div className={`w-7 text-center font-black text-lg shrink-0 ${rankColor}`}>
              {row.rank <= 3 ? ['🥇', '🥈', '🥉'][row.rank - 1] : row.rank}
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

            {/* 이름 + 전적 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-[#111] truncate">
                  {row.member.user.name}
                </p>
                {isMe && (
                  <span className="text-[10px] font-bold text-[#beff00] bg-[#beff00]/15 px-1.5 py-0.5 rounded-md shrink-0">
                    나
                  </span>
                )}
              </div>
              <p className="text-xs text-[#999]">
                {row.games_played}전 {row.wins}승 {row.losses}패{row.draws > 0 ? ` ${row.draws}무` : ''} · {winRate}%
              </p>
            </div>

            {/* 승점 */}
            <div className="text-right shrink-0">
              <p className="text-lg font-black text-[#111]">{winRate}<span className="text-xs font-normal">%</span></p>
              <p className="text-[10px] text-[#999]">승률</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
