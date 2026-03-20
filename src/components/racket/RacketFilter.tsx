'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { BRANDS, LEVELS, PLAY_TYPES, WEIGHTS, PRICE_RANGES } from '@/types/racket'
import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-sm px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap font-medium',
        active
          ? 'bg-[#beff00] text-black border-[#beff00]'
          : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

interface RacketFilterProps {
  totalCount: number
  filteredCount: number
}

export function RacketFilter({ totalCount, filteredCount }: RacketFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getParam = useCallback(
    (key: string) => searchParams.get(key)?.split(',').filter(Boolean) ?? [],
    [searchParams]
  )

  const updateParam = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      if (values.length) {
        params.set(key, values.join(','))
      } else {
        params.delete(key)
      }
      router.push(pathname + "?" + params.toString(), { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const toggle = useCallback(
    (key: string, value: string) => {
      const current = getParam(key)
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      updateParam(key, next)
    },
    [getParam, updateParam]
  )

  const hasFilters =
    ['brand', 'level', 'type', 'weight', 'price'].some((k) => searchParams.has(k)) ||
    searchParams.has('q')

  const clearAll = () => {
    const params = new URLSearchParams()
    const sort = searchParams.get('sort')
    if (sort) params.set('sort', sort)
    router.push(pathname + "?" + params.toString(), { scroll: false })
  }

  const brands = getParam('brand')
  const levels = getParam('level')
  const types = getParam('type')
  const weights = getParam('weight')
  const prices = getParam('price')

  return (
    <aside className="space-y-5">
      {/* 결과 수 + 초기화 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredCount}</span> / {totalCount}개
        </p>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 브랜드 */}
      <FilterSection title="브랜드">
        {BRANDS.map((b) => (
          <FilterChip
            key={b}
            label={b}
            active={brands.includes(b)}
            onClick={() => toggle('brand', b)}
          />
        ))}
      </FilterSection>

      {/* 레벨 */}
      <FilterSection title="레벨">
        {LEVELS.map((l) => (
          <FilterChip
            key={l}
            label={l}
            active={levels.includes(l)}
            onClick={() => toggle('level', l)}
          />
        ))}
      </FilterSection>

      {/* 플레이 타입 */}
      <FilterSection title="플레이 타입">
        {PLAY_TYPES.map((t) => (
          <FilterChip
            key={t}
            label={t}
            active={types.includes(t)}
            onClick={() => toggle('type', t)}
          />
        ))}
      </FilterSection>

      {/* 무게 */}
      <FilterSection title="무게">
        {WEIGHTS.map((w) => (
          <FilterChip
            key={w}
            label={w}
            active={weights.includes(w)}
            onClick={() => toggle('weight', w)}
          />
        ))}
      </FilterSection>

      {/* 가격대 */}
      <FilterSection title="가격대">
        {PRICE_RANGES.map((p) => (
          <FilterChip
            key={p}
            label={p}
            active={prices.includes(p)}
            onClick={() => toggle('price', p)}
          />
        ))}
      </FilterSection>
    </aside>
  )
}
