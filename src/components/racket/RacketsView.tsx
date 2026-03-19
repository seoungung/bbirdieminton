'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'
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
  return true
}

export function RacketsView({ rackets }: { rackets: Racket[] }) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const currentSort = searchParams.get('sort') ?? 'popular'

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(pathname + '?' + params.toString(), { scroll: false })
  }

  const filtered = useMemo(() => {
    const q       = searchParams.get('q')?.toLowerCase()
    const brands  = searchParams.get('brand')?.split(',').filter(Boolean) ?? []
    const levels  = searchParams.get('level')?.split(',').filter(Boolean) ?? []
    const types   = searchParams.get('type')?.split(',').filter(Boolean)  ?? []
    const weights = searchParams.get('weight')?.split(',').filter(Boolean) ?? []
    const prices  = searchParams.get('price')?.split(',').filter(Boolean)  ?? []
    const sort    = searchParams.get('sort') ?? 'popular'

    let result = rackets.filter(r => {
      // 15만원 이상 라켓 제외
      const pMin = extractPriceMin(r.price_range)
      if (pMin >= 150000) return false

      if (q && !r.name.toLowerCase().includes(q) && !r.brand.toLowerCase().includes(q)) return false
      if (brands.length  && !brands.includes(r.brand))                             return false
      if (levels.length  && !r.level.some(l => levels.includes(l)))                return false
      if (types.length   && !r.type.some(t  => types.includes(t)))                 return false
      if (weights.length && (!r.weight || !weights.some(w => r.weight!.includes(w)))) return false
      if (prices.length) {
        if (!prices.some(p => matchPrice(pMin, p))) return false
      }
      return true
    })

    if (sort === 'popular') result = [...result].sort((a, b) => Number(b.is_popular) - Number(a.is_popular))
    else if (sort === 'newest') result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    else if (sort === 'editor') result = [...result].sort((a, b) => Number(b.editor_pick) - Number(a.editor_pick))

    return result
  }, [rackets, searchParams])

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">라켓 도감</h1>
          <p className="text-sm text-muted-foreground">내게 맞는 라켓을 찾아보세요</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* 검색 + 필터 토글 */}
        <div className="flex gap-2 mb-3">
          <input
            type="search"
            placeholder="라켓 이름, 브랜드 검색..."
            defaultValue={searchParams.get('q') ?? ''}
            onChange={e => {
              const params = new URLSearchParams(searchParams.toString())
              if (e.target.value) params.set('q', e.target.value)
              else params.delete('q')
              window.history.replaceState(null, '', '?' + params.toString())
            }}
            className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-foreground transition-colors"
          />
          <button
            onClick={() => setFilterOpen(p => !p)}
            className={cn(
              'md:hidden flex items-center gap-1.5 h-10 px-3 rounded-lg border text-sm transition-colors',
              filterOpen ? 'border-foreground bg-foreground text-background' : 'border-border'
            )}
          >
            {filterOpen ? <X size={15} /> : <SlidersHorizontal size={15} />}
            필터
          </button>
        </div>

        {/* 정렬 바 */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSort(opt.value)}
              className={cn(
                'shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap',
                currentSort === opt.value
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 모바일 필터 오버레이 */}
        {filterOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setFilterOpen(false)} />
        )}

        <div className="flex gap-8">
          {/* 필터 사이드바 — 데스크톱 + 모바일 드로어 */}
          <div
            className={cn(
              'shrink-0 transition-all duration-200',
              'hidden md:block w-52',
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
            <RacketFilter totalCount={rackets.length} filteredCount={filtered.length} />
          </div>

          {/* 라켓 그리드 */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <span className="text-4xl mb-3">🏸</span>
                <p className="text-sm">조건에 맞는 라켓이 없어요</p>
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
