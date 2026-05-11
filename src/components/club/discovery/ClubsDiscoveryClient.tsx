'use client'
import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { ClubsHero } from './ClubsHero'
import { ClubsCardGrid } from './ClubsCardGrid'
import { isNewClub } from '@/lib/club/isNewClub'
import type { ClubDiscoveryItem } from './types'

export type ClubsTab = 'all' | 'mine' | 'saved' | 'recent'

const FAV_KEY = 'favoriteClubs'
const RECENT_KEY = 'recentClubs'

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

/* localStorage 읽기를 외부 store 로 본 useSyncExternalStore 구독 헬퍼 —
 * setState-in-effect 를 피하면서 SSR 안전하게 hydration 후 값 노출.
 * snapshot 은 동일 key 입력에는 같은 stringified 값을 반환하도록 캐시. */
type Cache = { value: string[]; raw: string | null }
const snapshotCache = new Map<string, Cache>()

function getSnapshot(key: string): string[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(key)
  const cached = snapshotCache.get(key)
  if (cached && cached.raw === raw) return cached.value
  const value = readIds(key)
  snapshotCache.set(key, { value, raw })
  return value
}

function getServerSnapshot(): string[] {
  return []
}

function useLocalIds(key: string): string[] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) {
          // 외부 변경: 캐시 무효화 후 알림
          snapshotCache.delete(key)
          onChange()
        }
      }
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    },
    [key],
  )
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(key),
    getServerSnapshot,
  )
}

/**
 * 전체 모임 정렬:
 *  1) 14일 이내 신규 모임을 상단으로 (NEW 배지와 함께 노출).
 *  2) 그 안에서 createdAt 내림차순.
 *  3) 14일이 지난 모임도 createdAt 내림차순.
 */
function sortByNewThenRecent(clubs: ClubDiscoveryItem[]): ClubDiscoveryItem[] {
  return [...clubs].sort((a, b) => {
    const aNew = isNewClub(a.createdAt) ? 1 : 0
    const bNew = isNewClub(b.createdAt) ? 1 : 0
    if (aNew !== bNew) return bNew - aNew
    const aTime = new Date(a.createdAt).getTime() || 0
    const bTime = new Date(b.createdAt).getTime() || 0
    return bTime - aTime
  })
}

/**
 * /clubs 발견 페이지.
 *
 * 'all' 탭: 14일 이내 신규는 'NEW' 배지 + 상단 정렬, 무한스크롤.
 *
 * 'mine'/'saved'/'recent' 탭: 단일 리스트 (무한스크롤 X).
 *  · 찜/최근은 localStorage(favoriteClubs / recentClubs) 기반.
 *
 * Phase 2 큐레이션 컴포넌트(`ClubsCurationSection`, `ClubsMiniCard`)는 보존됨 — 클럽 볼륨 충분 시 재활성.
 */
interface Props {
  /** 전체 모임 */
  clubs: ClubDiscoveryItem[]
  /** 내가 가입한 모임 (비로그인 시 빈 배열) */
  myClubs: ClubDiscoveryItem[]
  /** 표시 탭 — 기본 'all' */
  tab?: ClubsTab
}

export function ClubsDiscoveryClient({ clubs, myClubs, tab = 'all' }: Props) {
  const savedIds = useLocalIds(FAV_KEY)
  const recentIds = useLocalIds(RECENT_KEY)

  // ── 'all' 탭: NEW 정렬 ──
  const sortedClubs = useMemo(
    () => sortByNewThenRecent(clubs),
    [clubs],
  )

  if (tab === 'all') {
    return (
      <div>
        <ClubsHero />
        <ClubsCardGrid
          clubs={sortedClubs}
          title="전체 모임"
          emptyMessage="등록된 모임이 아직 없어요"
          infiniteScroll
          initialBatch={20}
          loadMore={20}
        />
      </div>
    )
  }

  // ── 그 외 탭: 단일 리스트 ──
  let displayClubs: ClubDiscoveryItem[]
  let title: string
  let emptyMessage: string

  switch (tab) {
    case 'mine':
      displayClubs = myClubs
      title = 'MY 모임'
      emptyMessage = '아직 가입한 모임이 없어요. 둘러보고 가입해보세요!'
      break
    case 'saved':
      displayClubs = clubs.filter((c) => savedIds.includes(c.id))
      title = '찜한 모임'
      emptyMessage = '찜한 모임이 없어요'
      break
    case 'recent':
      displayClubs = clubs.filter((c) => recentIds.includes(c.id))
      title = '최근 본 모임'
      emptyMessage = '최근 본 모임이 없어요'
      break
    default:
      displayClubs = clubs
      title = '모임'
      emptyMessage = '등록된 모임이 아직 없어요'
  }

  return (
    <div>
      <ClubsHero />
      <ClubsCardGrid
        clubs={displayClubs}
        title={title}
        emptyMessage={emptyMessage}
      />
    </div>
  )
}
