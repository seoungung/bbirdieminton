import Link from 'next/link'
import Image from 'next/image'
import { Compass } from 'lucide-react'

export interface SaaSClubItem {
  id: string
  name: string
  location: string | null
  thumbnailColor: string | null
}

interface Props {
  clubs: SaaSClubItem[]
  /** 접힘 사이드바 (md~xl) 일 때 true: 32×32 아바타만 노출 */
  collapsed?: boolean
  onNavigate?: () => void
}

/**
 * SaaSShell 사이드바 — 내 모임 리스트
 *
 * 펼침: 클럽 색상 썸네일 + 이름 + 활동지역
 * 접힘: 32×32 색상 dot/아바타 (이름 없음, hover 시 tooltip)
 *
 * 빈 상태:
 *  · 펼침: "아직 가입한 모임이 없어요" 카드
 *  · 접힘: 가는 안내 dot (Compass 아이콘)
 *
 * 항목 클릭: `/club/[id]`로 이동 → AppShell로 진입
 */
export function SaaSClubList({ clubs, collapsed = false, onNavigate }: Props) {
  if (clubs.length === 0) {
    if (collapsed) {
      return (
        <div className="px-2">
          <Link
            href="/clubs"
            onClick={onNavigate}
            title="아직 가입한 모임이 없어요 — 모임 둘러보기"
            aria-label="아직 가입한 모임이 없어요 — 모임 둘러보기"
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg border border-dashed border-[#e5e5e5] bg-[#fafafa] text-[#bbb] hover:text-[#555] hover:bg-white transition-colors"
          >
            <Compass size={16} strokeWidth={1.9} aria-hidden="true" />
          </Link>
        </div>
      )
    }
    return (
      <div className="px-3">
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-[#fafafa] px-4 py-5 text-center">
          <Compass
            size={20}
            strokeWidth={1.7}
            className="mx-auto mb-2 text-[#bbb]"
            aria-hidden="true"
          />
          <p className="text-[12.5px] font-semibold text-[#555] leading-snug">
            아직 가입한 모임이 없어요
          </p>
          <p className="text-[11px] text-[#999] mt-1 leading-snug">
            아래에서 새 모임을 만들거나
            <br />
            초대코드로 참여해보세요
          </p>
        </div>
      </div>
    )
  }

  if (collapsed) {
    return (
      <ul
        className="px-2 space-y-1 max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-track]:bg-transparent"
        role="list"
      >
        {clubs.map((club) => (
          <li key={club.id}>
            <Link
              href={`/club/${club.id}`}
              onClick={onNavigate}
              title={club.name}
              aria-label={club.name}
              className="group flex items-center justify-center w-10 h-10 mx-auto rounded-lg hover:bg-[#fafafa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-1"
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: club.thumbnailColor ?? '#DBE64C' }}
                aria-hidden="true"
              >
                <Image
                  src="/symbol_birdieminton-black.png"
                  alt=""
                  width={18}
                  height={18}
                  className="h-[18px] w-auto opacity-70"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul
      className="px-2 space-y-0.5 max-h-[280px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-track]:bg-transparent"
      role="list"
    >
      {clubs.map((club) => (
        <li key={club.id}>
          <Link
            href={`/club/${club.id}`}
            onClick={onNavigate}
            className="group flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#fafafa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-1"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: club.thumbnailColor ?? '#DBE64C' }}
              aria-hidden="true"
            >
              <Image
                src="/symbol_birdieminton-black.png"
                alt=""
                width={18}
                height={18}
                className="h-[18px] w-auto opacity-70"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#111] truncate group-hover:text-[#0a0a0a]">
                {club.name}
              </p>
              {club.location && (
                <p className="text-[11px] text-[#999] truncate mt-0.5">{club.location}</p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
