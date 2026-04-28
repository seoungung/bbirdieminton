'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Plus, Clock, Heart, Gamepad2 } from 'lucide-react'
import { PinterestClubCard } from '@/components/club/cards/PinterestClubCard'
import { ClubListEmptyState } from '@/components/club/cards/ClubListEmptyState'
import { ClubListModal } from '@/components/club/cards/ClubListModal'
import type { MemberRole } from '@/types/club'

// ── 로컬 타입 (서버에서 넘겨주는 형태) ───────────────────
interface Club {
  id: string
  name: string
  description: string | null
  court_count: number
  created_at: string
  memberCount?: number
  myRole?: MemberRole
  isDemo?: boolean
  location?: string
  leaderName?: string
  thumbnailColor?: string
  thumbnail_url?: string | null
}

interface ClubListClientProps {
  myClubs: Club[]
  allClubs: Club[]
  isGuest?: boolean
}

type TabKey = 'my' | 'all' | 'recent' | 'favorite'
type ModalType = 'create' | 'join' | null

const TAB_LIST: { key: TabKey; label: string }[] = [
  { key: 'all',      label: '전체 모임'    },
  { key: 'my',       label: '내 모임'      },
  { key: 'recent',   label: '최근 본 모임' },
  { key: 'favorite', label: '찜한 모임'    },
]

// ── 마소니 그리드 (인라인 헬퍼) ──────────────────────────
const MASONRY = 'columns-1 sm:columns-2 lg:columns-3 gap-4'

// ── 메인 컴포넌트 ─────────────────────────────────────────
export function ClubListClient({ myClubs, allClubs, isGuest }: ClubListClientProps) {
  const [tab, setTab]               = useState<TabKey>('all')
  const [query, setQuery]           = useState('')
  const [modal, setModal]           = useState<ModalType>(null)
  const [favorites, setFavorites]   = useState<string[]>([])
  const [recentIds, setRecentIds]   = useState<string[]>([])

  useEffect(() => {
    try {
      const fav = localStorage.getItem('favoriteClubs')
      if (fav) setFavorites(JSON.parse(fav) as string[])
      const rec = localStorage.getItem('recentClubs')
      if (rec) setRecentIds(JSON.parse(rec) as string[])
    } catch { /* ignore parse errors */ }
  }, [])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]
      localStorage.setItem('favoriteClubs', JSON.stringify(next))
      return next
    })
  }

  const handleCreateClick = (e: React.MouseEvent) => {
    if (isGuest) { e.preventDefault(); setModal('create') }
  }

  const myClubIds = new Set(myClubs.map(c => c.id))
  const q = query.toLowerCase()

  const sorted = (arr: Club[]) =>
    [...arr].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const filteredMy  = sorted(myClubs).filter(c => c.name.toLowerCase().includes(q))
  const filteredAll = sorted(allClubs).filter(c => c.name.toLowerCase().includes(q))
  const favoriteClubs = sorted([
    ...allClubs,
    ...myClubs.filter(c => !allClubs.find(a => a.id === c.id)),
  ]).filter(c => favorites.includes(c.id) && c.name.toLowerCase().includes(q))

  const recentClubs = recentIds
    .map(id => [...allClubs, ...myClubs].find(c => c.id === id))
    .filter((c): c is Club => !!c && c.name.toLowerCase().includes(q))

  return (
    <div className="max-w-[1088px] mx-auto px-4 py-6">

      {/* ── 모달 ── */}
      {modal && <ClubListModal type={modal} onClose={() => setModal(null)} />}

      {/* ── 게스트 배너 ── */}
      {isGuest && (
        <div className="mb-5 bg-[#0a0a0a] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold text-white inline-flex items-center gap-2">
              <Gamepad2 size={18} strokeWidth={2.2} />
              게스트로 체험 중
            </p>
            <p className="text-sm text-white/50 mt-0.5">체험용 모임을 클릭해서 게임보드를 경험해보세요</p>
          </div>
          <Link
            href="/login?next=%2Fclub%2Fhome"
            className="shrink-0 text-sm font-bold px-4 py-2 bg-[#beff00] text-[#111] rounded-xl hover:brightness-95 transition-all"
          >
            내 모임 만들기 →
          </Link>
        </div>
      )}

      {/* ── 상단 바 ── */}
      <div className="flex items-center justify-between flex-wrap gap-y-3 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111]">내 모임</h1>
          <p className="text-sm text-[#999] mt-0.5">가입한 모임 전체와 새 모임 디스커버리</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/club/join"
            className="inline-flex items-center gap-1.5 border border-[#e5e5e5] text-[#555] font-semibold text-sm px-4 py-2 rounded-xl hover:bg-[#f8f8f8] transition-all"
          >
            초대코드
          </Link>
          <Link
            href="/club/create"
            onClick={handleCreateClick}
            className="inline-flex items-center gap-1.5 bg-[#beff00] text-[#111] font-bold text-sm px-4 py-2 rounded-xl hover:brightness-95 transition-all"
          >
            <Plus size={15} />
            모임 만들기
          </Link>
        </div>
      </div>

      {/* ── 검색 ── */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="모임명을 검색하세요"
          className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111] placeholder-[#bbb] outline-none focus:border-[#ddd] focus:bg-white transition-colors"
        />
      </div>

      {/* ── 탭 ── */}
      <div className="flex border-b border-[#f0f0f0] mb-6 overflow-x-auto scrollbar-none">
        {TAB_LIST.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
              tab === key
                ? 'border-[#111] text-[#111]'
                : 'border-transparent text-[#999] hover:text-[#555]'
            }`}
          >
            {key === 'recent'   && <Clock  size={13} />}
            {key === 'favorite' && <Heart  size={13} />}
            {label}
          </button>
        ))}
      </div>

      {/* ── 탭 콘텐츠 ── */}

      {tab === 'all' && (
        filteredAll.length === 0 ? (
          <p className="text-center text-[#999] text-sm py-16">검색 결과가 없어요</p>
        ) : (
          <div className={MASONRY}>
            {filteredAll.map(club => (
              <PinterestClubCard
                key={club.id}
                mode="all"
                club={club}
                isMember={myClubIds.has(club.id)}
                isFavorited={favorites.includes(club.id)}
                onToggleFavorite={toggleFavorite}
                isLoggedIn={!isGuest}
              />
            ))}
          </div>
        )
      )}

      {tab === 'my' && (
        filteredMy.length === 0 && query === '' ? (
          <ClubListEmptyState
            icon={
              <Image
                src="/symbol_birdieminton-black.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-auto opacity-20"
                aria-hidden="true"
              />
            }
            title="참여한 모임이 없어요"
            desc="새 모임을 만들거나 초대코드로 참여해보세요"
            onCreateClick={handleCreateClick}
            showActions
          />
        ) : filteredMy.length === 0 ? (
          <p className="text-center text-[#999] text-sm py-16">검색 결과가 없어요</p>
        ) : (
          <div className={MASONRY}>
            {filteredMy.map(club => (
              <PinterestClubCard key={club.id} mode="my" club={club} />
            ))}
          </div>
        )
      )}

      {tab === 'recent' && (
        recentClubs.length === 0 ? (
          <ClubListEmptyState
            icon={<Clock size={32} className="text-[#ccc]" />}
            title="최근 본 모임이 없어요"
            desc="모임을 둘러보면 여기에 기록돼요"
          />
        ) : (
          <div className={MASONRY}>
            {recentClubs.map(club => (
              <PinterestClubCard
                key={club.id}
                mode="all"
                club={club}
                isMember={myClubIds.has(club.id)}
                isFavorited={favorites.includes(club.id)}
                onToggleFavorite={toggleFavorite}
                isLoggedIn={!isGuest}
              />
            ))}
          </div>
        )
      )}

      {tab === 'favorite' && (
        favoriteClubs.length === 0 ? (
          <ClubListEmptyState
            icon={<Heart size={32} className="text-[#ccc]" />}
            title="찜한 모임이 없어요"
            desc="모임 카드의 하트를 눌러 찜해보세요"
          />
        ) : (
          <div className={MASONRY}>
            {favoriteClubs.map(club => (
              <PinterestClubCard
                key={club.id}
                mode="all"
                club={club}
                isMember={myClubIds.has(club.id)}
                isFavorited={favorites.includes(club.id)}
                onToggleFavorite={toggleFavorite}
                isLoggedIn={!isGuest}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}
