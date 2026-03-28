'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getRackets, type RacketRow } from './actions'
import RacketTableRow from './RacketTableRow'

interface Toast {
  id: number
  msg: string
  ok: boolean
}

const BRANDS = ['전체', 'YONEX', 'VICTOR', 'LI-NING', 'MIZUNO', 'KAWASAKI', 'FLEET', 'RSL', 'APEX', 'MAXBOLT', 'PULSE', 'TRICORE', 'RIDER', 'APACS', 'REDSON', 'JOOBONG', 'TRION']

const TABLE_HEADERS = [
  '브랜드',
  '라켓명',
  '무게',
  '밸런스',
  '강성',
  '레벨',
  '타입',
  '가격대',
  '인기순위',
  '에디터픽',
  '인기여부',
  '상태',
]

export default function AdminRacketsPage() {
  const [rackets, setRackets] = useState<RacketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('전체')
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    getRackets().then(({ data, error: err }) => {
      if (err) setError(err)
      else setRackets(data)
      setLoading(false)
    })
  }, [])

  const addToast = useCallback((msg: string, ok: boolean) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, msg, ok }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rackets.filter((r) => {
      const matchBrand = brand === '전체' || r.brand === brand
      const matchSearch =
        !q || r.name.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q)
      return matchBrand && matchSearch
    })
  }, [rackets, search, brand])

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[#beff00] text-[10px] font-bold uppercase tracking-widest mb-1">
          Admin / Rackets
        </p>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-extrabold text-[#111111]">라켓 데이터 관리</h1>
          {!loading && (
            <span className="text-sm text-[#999999]">총 {rackets.length}개</span>
          )}
        </div>
      </div>

      {/* Search + Brand Filter */}
      <div className="mb-4 flex flex-col gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="라켓명 또는 브랜드 검색..."
          className="h-10 px-4 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111111] placeholder:text-[#999999] outline-none focus:border-[#beff00] transition-colors max-w-sm"
        />

        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrand(b)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                brand === b
                  ? 'bg-[#beff00] text-black'
                  : 'bg-[#f0f0f0] text-[#555555] hover:bg-[#e5e5e5]'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {!loading && search && (
        <p className="text-xs text-[#999] mb-3">
          검색 결과: {filtered.length}개
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-[#e5e5e5] border-t-[#beff00] rounded-full animate-spin" />
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8f8f8]">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#555555] whitespace-nowrap sticky top-0 bg-[#f8f8f8] border-b border-[#e5e5e5]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length}
                    className="px-4 py-12 text-center text-sm text-[#999999]"
                  >
                    라켓 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((racket) => (
                  <RacketTableRow key={racket.id} racket={racket} onToast={addToast} />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all ${
              t.ok
                ? 'bg-[#beff00] text-black'
                : 'bg-red-500 text-white'
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
