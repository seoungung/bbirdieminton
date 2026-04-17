'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Plus, Lock, Heart, Clock } from 'lucide-react'
import type { MemberRole } from '@/types/club'

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

const ROLE_LABEL: Record<MemberRole, string> = {
  owner: '운영자',
  manager: '매니저',
  member: '멤버',
}

const TAB_LIST: { key: TabKey; label: string }[] = [
  { key: 'all',      label: '전체 모임'    },
  { key: 'my',       label: '내 모임'      },
  { key: 'recent',   label: '최근 본 모임' },
  { key: 'favorite', label: '찜한 모임'    },
]

function isNewClub(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000
}

// ── 썸네일 ────────────────────────────────────────
function ClubThumbnail({ club, isNew }: { club: Club; isNew: boolean }) {
  const bg = club.thumbnailColor ?? '#f0f0f0'
  return (
    <div
      className="w-[110px] sm:w-[150px] shrink-0 flex items-center justify-center relative self-stretch overflow-hidden"
      style={club.thumbnail_url ? undefined : { background: bg }}
    >
      {club.thumbnail_url ? (
        <Image
          src={club.thumbnail_url}
          alt={club.name}
          fill
          sizes="(max-width: 640px) 110px, 150px"
          className="object-cover"
        />
      ) : (
        <span className="text-5xl sm:text-6xl select-none">🏸</span>
      )}
      {isNew && (
        <span className="absolute top-2.5 right-2.5 text-[11px] font-extrabold px-2 py-0.5 bg-[#111] text-[#beff00] rounded-md tracking-wide z-10">
          NEW
        </span>
      )}
      {club.isDemo && (
        <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold px-1.5 py-0.5 bg-black/40 text-white rounded-md z-10">
          체험용
        </span>
      )}
    </div>
  )
}

// ── 전체 모임 카드 ────────────────────────────────
function AllClubCard({
  club,
  isMember,
  isFavorite,
  onToggleFavorite,
}: {
  club: Club
  isMember: boolean
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}) {
  const isNew = isNewClub(club.created_at)
  const href = `/club/${club.id}/view`

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden hover:border-[#beff00]/70 transition-colors">
      <div className="flex min-h-[130px]">
        <ClubThumbnail club={club} isNew={isNew} />

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0 p-4 flex flex-col gap-2.5">
          {/* 헤더 row */}
          <div className="flex items-start justify-between gap-2">
            <p className="font-extrabold text-[#111] text-lg leading-tight">{club.name}</p>
            <button
              onClick={() => onToggleFavorite(club.id)}
              className="shrink-0 mt-0.5 transition-colors"
              aria-label="찜하기"
            >
              <Heart
                size={18}
                className={isFavorite ? 'fill-red-400 text-red-400' : 'text-[#ccc] hover:text-red-300'}
              />
            </button>
          </div>

          {/* 설명 */}
          {club.description && (
            <p className="text-sm text-[#666] leading-snug line-clamp-2">{club.description}</p>
          )}

          {/* 메타 정보 */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="text-sm text-[#888]">👥 {club.memberCount ?? 0}명</span>
            {club.location  && <span className="text-sm text-[#888]">📍 {club.location}</span>}
            {club.leaderName && <span className="text-sm text-[#888]">👑 {club.leaderName}</span>}
          </div>

          {/* 버튼 */}
          <div className="mt-auto pt-1">
            {club.isDemo ? (
              <Link
                href={href}
                className="inline-flex items-center justify-center bg-[#beff00] text-[#111] font-bold text-sm py-2 px-5 rounded-xl hover:brightness-95 transition-all"
              >
                모임 보기
              </Link>
            ) : isMember ? (
              <Link
                href={href}
                className="inline-flex items-center justify-center bg-[#beff00] text-[#111] font-bold text-sm py-2 px-5 rounded-xl hover:brightness-95 transition-all"
              >
                모임 보기
              </Link>
            ) : (
              <Link
                href={href}
                className="inline-flex items-center justify-center border border-[#ddd] text-[#111] font-semibold text-sm py-2 px-5 rounded-xl hover:bg-[#f8f8f8] transition-all"
              >
                모임 보기
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 내 모임 카드 ──────────────────────────────────
function MyClubCard({ club }: { club: Club }) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden hover:border-[#beff00]/70 transition-colors">
      <div className="flex min-h-[120px]">
        <ClubThumbnail club={club} isNew={isNewClub(club.created_at)} />
        <div className="flex-1 min-w-0 p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <p className="font-extrabold text-[#111] text-lg leading-tight truncate">{club.name}</p>
            {club.myRole && (
              <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f0f0f0] text-[#555]">
                {ROLE_LABEL[club.myRole]}
              </span>
            )}
          </div>
          {club.description && (
            <p className="text-sm text-[#666] line-clamp-2 leading-snug">{club.description}</p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="text-sm text-[#888]">👥 {club.memberCount ?? 0}명</span>
            <span className="text-sm text-[#888]">🏸 코트 {club.court_count}면</span>
          </div>
          <div className="mt-auto pt-1">
            <Link
              href={`/club/${club.id}/view`}
              className="inline-flex items-center justify-center bg-[#beff00] text-[#111] font-bold text-sm py-2 px-5 rounded-xl hover:brightness-95 transition-all"
            >
              입장하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 빈 상태 ──────────────────────────────────────
function EmptyState({
  icon,
  title,
  desc,
  onCreateClick,
  onJoinClick,
  showActions,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  onCreateClick?: (e: React.MouseEvent) => void
  onJoinClick?: (e: React.MouseEvent) => void
  showActions?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="font-bold text-[#111] text-xl mb-2">{title}</p>
      <p className="text-base text-[#999] mb-7">{desc}</p>
      {showActions && (
        <div className="flex gap-3">
          <Link
            href="/club/create"
            onClick={onCreateClick}
            className="px-5 py-2.5 bg-[#beff00] text-[#111] font-semibold text-base rounded-xl hover:brightness-95 transition-all"
          >
            모임 만들기
          </Link>
          <Link
            href="/club/join"
            onClick={onJoinClick}
            className="px-5 py-2.5 bg-white border border-[#e5e5e5] text-[#111] font-semibold text-base rounded-xl hover:bg-[#f8f8f8] transition-all"
          >
            초대코드 입력
          </Link>
        </div>
      )}
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────
export function ClubListClient({ myClubs, allClubs, isGuest }: ClubListClientProps) {
  const [tab, setTab]         = useState<TabKey>('all')
  const [query, setQuery]     = useState('')
  const [modal, setModal]     = useState<ModalType>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentIds, setRecentIds] = useState<string[]>([])

  // localStorage 동기화
  useEffect(() => {
    const fav = localStorage.getItem('favoriteClubs')
    if (fav) setFavorites(JSON.parse(fav))
    const rec = localStorage.getItem('recentClubs')
    if (rec) setRecentIds(JSON.parse(rec))
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
  const handleJoinClick = (e: React.MouseEvent) => {
    if (isGuest) { e.preventDefault(); setModal('join') }
  }

  const myClubIds = new Set(myClubs.map(c => c.id))

  // 최신순 정렬
  const sorted = (arr: Club[]) =>
    [...arr].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const q = query.toLowerCase()
  const filteredMy  = sorted(myClubs).filter(c => c.name.toLowerCase().includes(q))
  const filteredAll = sorted(allClubs).filter(c => c.name.toLowerCase().includes(q))
  const favoriteClubs = sorted(allClubs.concat(myClubs.filter(c => !allClubs.find(a => a.id === c.id))))
    .filter(c => favorites.includes(c.id) && c.name.toLowerCase().includes(q))
  const recentClubs = recentIds
    .map(id => allClubs.concat(myClubs).find(c => c.id === id))
    .filter((c): c is Club => !!c && c.name.toLowerCase().includes(q))

  return (
    <div className="max-w-[1088px] mx-auto px-4 py-6">

      {/* 모달 */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {modal === 'create' ? (
              <>
                <div className="flex items-center justify-center w-14 h-14 bg-[#f0f0f0] rounded-2xl mx-auto mb-5">
                  <Lock size={26} className="text-[#555]" />
                </div>
                <h2 className="text-xl font-extrabold text-[#111] text-center mb-2">모임을 만들 수 없어요</h2>
                <p className="text-base text-[#777] text-center leading-relaxed mb-7">
                  데모 모드라 모임을 생성하기 위해서는<br />
                  로그인 후 가능합니다.<br />
                  불편을 드려 죄송합니다.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login?next=%2Fclub%2Fhome"
                    className="w-full flex items-center justify-center bg-[#beff00] text-[#111] font-bold py-3.5 rounded-2xl hover:brightness-95 transition-all text-base"
                  >
                    로그인하고 모임 만들기
                  </Link>
                  <button
                    onClick={() => setModal(null)}
                    className="w-full py-3 text-base text-[#999] hover:text-[#555] transition-colors"
                  >
                    계속 둘러보기
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-14 h-14 bg-[#f0f0f0] rounded-2xl mx-auto mb-5">
                  <Lock size={26} className="text-[#555]" />
                </div>
                <h2 className="text-xl font-extrabold text-[#111] text-center mb-2">사용할 수 없는 기능이에요</h2>
                <p className="text-base text-[#777] text-center leading-relaxed mb-7">
                  아직 이 기능을 사용할 수 없습니다.
                </p>
                <button
                  onClick={() => setModal(null)}
                  className="w-full py-3.5 bg-[#f0f0f0] text-[#555] font-bold rounded-2xl hover:bg-[#e5e5e5] transition-colors text-base"
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 게스트 배너 */}
      {isGuest && (
        <div className="mb-5 bg-[#0a0a0a] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold text-white">🎮 게스트로 체험 중</p>
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

      {/* 상단 바 */}
      <div className="flex items-center justify-between flex-wrap gap-y-3 mb-5">
        <h1 className="text-2xl font-extrabold text-[#111]">모임 리스트</h1>
        <div className="flex gap-2">
          <Link
            href="/club/join"
            onClick={handleJoinClick}
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

      {/* 검색 */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="모임명을 검색하세요"
          className="w-full bg-white border border-[#e5e5e5] rounded-xl pl-10 pr-4 py-3 text-base text-[#111] placeholder-[#999] outline-none focus:border-[#beff00] transition-colors"
        />
      </div>

      {/* 탭 */}
      <div className="flex border-b border-[#e5e5e5] mb-5 overflow-x-auto scrollbar-none">
        {TAB_LIST.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-3 text-base font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
              tab === key
                ? 'border-[#111] text-[#111]'
                : 'border-transparent text-[#999] hover:text-[#555]'
            }`}
          >
            {key === 'recent'   && <Clock  size={14} />}
            {key === 'favorite' && <Heart  size={14} />}
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}

      {/* 내 모임 */}
      {tab === 'my' && (
        filteredMy.length === 0 && query === '' ? (
          <EmptyState
            icon="🏸"
            title="참여한 모임이 없어요"
            desc="새 모임을 만들거나 초대코드로 참여해보세요"
            onCreateClick={handleCreateClick}
            onJoinClick={handleJoinClick}
            showActions
          />
        ) : filteredMy.length === 0 ? (
          <p className="text-center text-[#999] text-base py-16">검색 결과가 없어요</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMy.map(club => <MyClubCard key={club.id} club={club} />)}
          </div>
        )
      )}

      {/* 전체 모임 */}
      {tab === 'all' && (
        filteredAll.length === 0 ? (
          <p className="text-center text-[#999] text-base py-16">검색 결과가 없어요</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredAll.map(club => (
              <AllClubCard
                key={club.id}
                club={club}
                isMember={myClubIds.has(club.id)}
                isFavorite={favorites.includes(club.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )
      )}

      {/* 최근 본 모임 */}
      {tab === 'recent' && (
        recentClubs.length === 0 ? (
          <EmptyState
            icon={<Clock size={40} className="text-[#ccc]" />}
            title="최근 본 모임이 없어요"
            desc="모임을 둘러보면 여기에 기록돼요"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {recentClubs.map(club => (
              <AllClubCard
                key={club.id}
                club={club}
                isMember={myClubIds.has(club.id)}
                isFavorite={favorites.includes(club.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )
      )}

      {/* 찜한 모임 */}
      {tab === 'favorite' && (
        favoriteClubs.length === 0 ? (
          <EmptyState
            icon={<Heart size={40} className="text-[#ccc]" />}
            title="찜한 모임이 없어요"
            desc="모임 카드의 하트를 눌러 찜해보세요"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {favoriteClubs.map(club => (
              <AllClubCard
                key={club.id}
                club={club}
                isMember={myClubIds.has(club.id)}
                isFavorite={favorites.includes(club.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}
