'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getRackets, createRacket, type RacketRow } from './actions'
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
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRacket, setNewRacket] = useState({ name: '', slug: '', brand: 'YONEX' })
  const [addLoading, setAddLoading] = useState(false)

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

  const toSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9가-힣\-]/g, '')

  const handleAddRacket = useCallback(async () => {
    if (!newRacket.name.trim() || !newRacket.slug.trim()) {
      addToast('라켓명과 슬러그를 입력하세요.', false)
      return
    }
    setAddLoading(true)
    const { data, error: err } = await createRacket({
      name: newRacket.name.trim(),
      slug: newRacket.slug.trim(),
      brand: newRacket.brand,
    })
    setAddLoading(false)
    if (err) {
      addToast(`추가 실패: ${err}`, false)
      return
    }
    if (data) {
      setRackets((prev) => [data, ...prev])
    }
    setShowAddModal(false)
    setNewRacket({ name: '', slug: '', brand: 'YONEX' })
    addToast('라켓이 추가되었습니다.', true)
  }, [newRacket, addToast])

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
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-extrabold text-[#111111]">라켓 데이터 관리</h1>
          {!loading && (
            <span className="text-sm text-[#999999]">총 {rackets.length}개</span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="ml-auto px-4 py-2 rounded-xl bg-[#beff00] text-black font-bold text-sm hover:bg-[#a8e600] transition-colors"
          >
            + 새 라켓 추가
          </button>
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

      {/* Add Racket Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false) }}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h2 className="text-lg font-extrabold text-[#111111] mb-5">새 라켓 추가</h2>

            {/* Brand */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#555555] mb-1.5">브랜드</label>
              <select
                value={newRacket.brand}
                onChange={(e) => setNewRacket((prev) => ({ ...prev, brand: e.target.value }))}
                className="h-10 px-4 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111111] outline-none focus:border-[#beff00] transition-colors w-full"
              >
                {BRANDS.filter((b) => b !== '전체').map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Racket Name */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#555555] mb-1.5">라켓명</label>
              <input
                type="text"
                value={newRacket.name}
                onChange={(e) => {
                  const name = e.target.value
                  setNewRacket((prev) => ({
                    ...prev,
                    name,
                    slug: toSlug(`${prev.brand}-${name}`),
                  }))
                }}
                placeholder="예: NANOFLARE 100"
                className="h-10 px-4 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111111] placeholder:text-[#999999] outline-none focus:border-[#beff00] transition-colors w-full"
              />
            </div>

            {/* Slug */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#555555] mb-1.5">
                슬러그 <span className="text-[#999] font-normal">(URL 식별자)</span>
              </label>
              <input
                type="text"
                value={newRacket.slug}
                onChange={(e) => setNewRacket((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="예: yonex-nanoflare-100"
                className="h-10 px-4 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111111] placeholder:text-[#999999] outline-none focus:border-[#beff00] transition-colors w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddModal(false); setNewRacket({ name: '', slug: '', brand: 'YONEX' }) }}
                className="flex-1 h-10 rounded-xl border border-[#e5e5e5] text-sm font-semibold text-[#555555] hover:bg-[#f8f8f8] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddRacket}
                disabled={addLoading}
                className="flex-1 h-10 rounded-xl bg-[#beff00] text-black font-bold text-sm hover:bg-[#a8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addLoading ? '추가 중...' : '추가하기'}
              </button>
            </div>
          </div>
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
