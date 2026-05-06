'use client'
import { useCallback, useSyncExternalStore } from 'react'
import { ClubsHero } from './ClubsHero'
import { ClubsCardGrid } from './ClubsCardGrid'
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
 * /clubs 발견 페이지 — Phase 1 단순 구조 (Hero + 그리드 + 사이드바 둘러보기 nav 연동).
 *
 * 사이드바의 "둘러보기" 4개 메뉴 (전체/MY/찜/최근) 와 동작.
 * `tab` query param 으로 어떤 카테고리를 표시할지 결정한다.
 *
 * 찜/최근 본 모임은 `localStorage` (favoriteClubs / recentClubs) 기반.
 *  · SSR 단계: 빈 배열 반환 (서버는 알 수 없음)
 *  · 클라이언트 hydration 후: useSyncExternalStore 로 실제 값 노출
 *  · 다른 탭에서 변경 시 'storage' 이벤트로 자동 갱신
 *
 * Phase 2 큐레이션 (인기/신규/모집중) 컴포넌트는 보존됨:
 *  · `ClubsCurationSection.tsx`
 *  · `ClubsMiniCard.tsx`
 * 클럽 볼륨이 충분히 쌓이면 (~10~15개+) 재활성화 후보.
 */
interface Props {
  /** 전체 모임 (실제 + 데모) */
  clubs: ClubDiscoveryItem[]
  /** 내가 가입한 모임 (비로그인 시 빈 배열) */
  myClubs: ClubDiscoveryItem[]
  /** 표시 탭 — 기본 'all' */
  tab?: ClubsTab
}

export function ClubsDiscoveryClient({ clubs, myClubs, tab = 'all' }: Props) {
  const savedIds = useLocalIds(FAV_KEY)
  const recentIds = useLocalIds(RECENT_KEY)

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
    case 'all':
    default:
      displayClubs = clubs
      title = '전체 모임'
      emptyMessage = '등록된 모임이 아직 없어요'
      break
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
