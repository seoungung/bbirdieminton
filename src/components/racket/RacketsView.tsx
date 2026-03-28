'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useMemo, useRef, useCallback } from 'react'
import { Racket, SORT_OPTIONS } from '@/types/racket'
import { RacketCard } from './RacketCard'
import { RacketFilter } from './RacketFilter'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function extractPriceMin(priceRange: string | null): number {
  if (!priceRange) return 0
  const match = priceRange.match(/([0-9]+)/)
  return match ? parseInt(match[1]) * 10000 : 0
}

function matchPrice(priceMin: number, range: string): boolean {
  if (range === '~5만원')    return priceMin < 50000
  if (range === '5~10만원')  return priceMin >= 50000  && priceMin < 100000
  if (range === '10~15만원') return priceMin >= 100000 && priceMin < 150000
  if (range === '15만원+')   return priceMin >= 150000
  return true
}

export function RacketsView({ rackets }: { rackets: Racket[] }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const currentSort = searchParams.get('sort') ?? 'popular'

  // ── 검색 (debounce 300ms + router.replace) ────────────────
  const handleSearch = useCallback((value: string) => {
    clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set('q', value)
      else params.delete('q')
      router.replace(pathname + '?' + params.toString(), { scroll: false })
    }, 300)
  }, [router, pathname, searchParams])

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(pathname + '?' + params.toString(), { scroll: false })
  }

  // ── 활성 필터 수 (모바일 뱃지용) ─────────────────────────
  const activeFilterCount = useMemo(() =>
    ['brand', 'level', 'type', 'weight', 'price'].reduce(
      (acc, k) => acc + (searchParams.get(k)?.split(',').filter(Boolean).length ?? 0), 0
    ), [searchParams])

  // ── 활성 필터 태그 (상단 표시용) ─────────────────────────
  const activeFilterTags = useMemo(() => {
    const tags: { key: string; value: string }[] = []
    const q = searchParams.get('q')
    if (q) tags.push({ key: 'q', value: `"${q}"` })
    for (const k of ['brand', 'level', 'type', 'weight', 'price']) {
      for (const v of (searchParams.get(k)?.split(',').filter(Boolean) ?? [])) {
        tags.push({ key: k, value: v })
      }
    }
    return tags
  }, [searchParams])

  const removeTag = useCallback((key: string, rawValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'q') {
      params.delete('q')
    } else {
      const current = params.get(key)?.split(',').filter(Boolean) ?? []
      const next = current.filter(v => v !== rawValue)
      if (next.length) params.set(key, next.join(','))
      else params.delete(key)
    }
    router.replace(pathname + '?' + params.toString(), { scroll: false })
  }, [router, pathname, searchParams])

  const clearAll = useCallback(() => {
    const params = new URLSearchParams()
    const sort = searchParams.get('sort')
    if (sort) params.set('sort', sort)
    router.replace(pathname + '?' + params.toString(), { scroll: false })
  }, [router, pathname, searchParams])

  // ── 동적 브랜드 목록 (실제 데이터 기반) ──────────────────
  const availableBrands = useMemo(
    () => [...new Set(rackets.map(r => r.brand))].sort(),
    [rackets]
  )

  // ── 필터링 + 정렬 ─────────────────────────────────────────
  const filtered = useMemo(() => {
    const q       = searchParams.get('q')?.toLowerCase()
    const brands  = searchParams.get('brand')?.split(',').filter(Boolean) ?? []
    const levels  = searchParams.get('level')?.split(',').filter(Boolean) ?? []
    const types   = searchParams.get('type')?.split(',').filter(Boolean)  ?? []
    const weights = searchParams.get('weight')?.split(',').filter(Boolean) ?? []
    const prices  = searchParams.get('price')?.split(',').filter(Boolean)  ?? []
    const sort    = searchParams.get('sort') ?? 'popular'

    let result = rackets.filter(r => {
      const pMin = extractPriceMin(r.price_range)
      if (q       && !r.name.toLowerCase().includes(q) && !r.brand.toLowerCase().includes(q)) return false
      if (brands.length  && !brands.includes(r.brand))                                        return false
      if (levels.length  && !r.level.some(l => levels.includes(l)))                           return false
      if (types.length   && !r.type.some(t  => types.includes(t)))                            return false
      if (weights.length && (!r.weight || !weights.some(w => r.weight!.includes(w))))         return false
      if (prices.length  && !prices.some(p => matchPrice(pMin, p)))                           return false
      return true
    })

    if (sort === 'popular') {
      result = [...result].sort((a, b) => {
        const ra = (a as Racket & { popular_rank?: number }).popular_rank
        const rb = (b as Racket & { popular_rank?: number }).popular_rank
        if (ra != null && rb != null) return ra - rb
        if (ra != null) return -1
        if (rb != null) return 1
        return Number(b.is_popular) - Number(a.is_popular)
      })
    } else if (sort === 'newest') {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sort === 'editor') {
      result = [...result].sort((a, b) => Number(b.editor_pick) - Number(a.editor_pick))
    }

    return result
  }, [rackets, searchParams])

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤딩 */}
      <div className="border-b border-border">
        <div className="max-w-[90rem] mx-auto px-4 py-14 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">라켓 도감</h1>
          <p className="text-base sm:text-lg text-muted-foreground">내게 맞는 라켓을 찾아보세요</p>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-4 py-8">
        {/* 모바일 검색 + 필터 토글 */}
        <div className="flex gap-2 mb-4 md:hidden">
          <input
            type="search"
            placeholder="라켓 이름, 브랜드 검색..."
            defaultValue={searchParams.get('q') ?? ''}
            onChange={e => handleSearch(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-foreground transition-colors"
          />
          <button
            onClick={() => setFilterOpen(p => !p)}
            className={cn(
              'relative flex items-center gap-1.5 h-10 px-3 rounded-lg border text-sm font-medium transition-colors',
              filterOpen
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-foreground'
            )}
          >
            {filterOpen ? <X size={15} /> : <SlidersHorizontal size={15} />}
            필터
            {activeFilterCount > 0 && !filterOpen && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#beff00] text-black text-[10px] font-extrabold rounded-full flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* 모바일 필터 오버레이 */}
        {filterOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setFilterOpen(false)} />
        )}

        <div className="flex gap-8 items-start">
          {/* 좌측 사이드바 — 데스크톱 sticky / 모바일 드로어 */}
          <div
            className={cn(
              'shrink-0 transition-all duration-200',
              'hidden md:block w-56 sticky top-[56px] max-h-[calc(100vh-56px)] overflow-y-auto',
              filterOpen && '!fixed !block right-0 top-0 h-full w-72 bg-background z-50 border-l border-border shadow-xl overflow-y-auto p-4 pt-14'
            )}
          >
            {filterOpen && (
              <button
                onClick={() => setFilterOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            )}

            {/* 데스크톱 검색 */}
            <div className="hidden md:block mb-4">
              <input
                type="search"
                placeholder="라켓 이름, 브랜드 검색..."
                defaultValue={searchParams.get('q') ?? ''}
                onChange={e => handleSearch(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-foreground transition-colors"
              />
            </div>

            <RacketFilter
              totalCount={rackets.length}
              filteredCount={filtered.length}
              availableBrands={availableBrands}
            />
          </div>

          {/* 우측 콘텐츠 */}
          <div className="flex-1 min-w-0">

            {/* 활성 필터 태그 */}
            {activeFilterTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {activeFilterTags.map(tag => (
                  <button
                    key={`${tag.key}-${tag.value}`}
                    onClick={() => removeTag(tag.key, tag.value.replace(/^"|"$/g, ''))}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#beff00]/15 text-[#111] border border-[#beff00]/40 hover:bg-[#beff00]/30 transition-colors"
                  >
                    {tag.value}
                    <X size={10} className="opacity-60" />
                  </button>
                ))}
                {activeFilterTags.length > 1 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-[#999] hover:text-[#111] border border-[#e5e5e5] px-2.5 py-1 rounded-full transition-colors"
                  >
                    전체 초기화
                  </button>
                )}
              </div>
            )}

            {/* 정렬 바 */}
            <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className={cn(
                    'shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap font-medium',
                    currentSort === opt.value
                      ? 'bg-[#beff00] text-black border-[#beff00]'
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* 라켓 그리드 */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <span className="text-4xl mb-3">🏸</span>
                <p className="text-sm">조건에 맞는 라켓이 없어요</p>
                {activeFilterTags.length > 0 && (
                  <button onClick={clearAll} className="mt-3 text-xs text-[#999] underline underline-offset-2 hover:text-[#111]">
                    필터 초기화
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map(r => (
                  <RacketCard key={r.id} racket={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
