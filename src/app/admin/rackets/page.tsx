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

const WEIGHT_OPTIONS = ['', '6U', '5U', '4U', '3U', '2U']
const BALANCE_OPTIONS = ['', 'head-heavy', 'even', 'head-light']
const FLEX_OPTIONS = ['', 'stiff', 'medium', 'flexible']

const BALANCE_KO: Record<string, string> = {
  'head-heavy': '헤드헤비',
  even: '균형형',
  'head-light': '헤드라이트',
}
const FLEX_KO: Record<string, string> = {
  stiff: '하드',
  medium: '미디엄',
  flexible: '소프트',
}

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

interface NewRacketState {
  name: string
  slug: string
  brand: string
  weight: string
  balance: string
  flex: string
  price_range: string
}

const INITIAL_RACKET: NewRacketState = {
  name: '',
  slug: '',
  brand: 'YONEX',
  weight: '',
  balance: '',
  flex: '',
  price_range: '',
}

export default function AdminRacketsPage() {
  const [rackets, setRackets] = useState<RacketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('전체')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRacket, setNewRacket] = useState<NewRacketState>(INITIAL_RACKET)
  const [addLoading, setAddLoading] = useState(false)
  const [extractUrl, setExtractUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')

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

  const closeModal = useCallback(() => {
    setShowAddModal(false)
    setNewRacket(INITIAL_RACKET)
    setExtractUrl('')
    setExtractError('')
  }, [])

  const handleExtract = useCallback(async () => {
    if (!extractUrl.trim()) return
    setExtracting(true)
    setExtractError('')
    try {
      const password = localStorage.getItem('admin_password')
      const res = await fetch('/api/admin/racket-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: extractUrl.trim(), password: password ?? '' }),
      })
      const data = await res.json() as Record<string, unknown>
      if (!res.ok) {
        setExtractError((data.error as string) ?? '추출에 실패했습니다.')
        return
      }
      setNewRacket((prev) => ({
        ...prev,
        ...(typeof data.name === 'string' && data.name ? { name: data.name } : {}),
        ...(typeof data.slug === 'string' && data.slug ? { slug: data.slug } : {}),
        ...(typeof data.brand === 'string' && data.brand ? { brand: data.brand } : {}),
        ...(typeof data.weight === 'string' && data.weight ? { weight: data.weight } : {}),
        ...(typeof data.balance === 'string' && data.balance ? { balance: data.balance } : {}),
        ...(typeof data.flex === 'string' && data.flex ? { flex: data.flex } : {}),
        ...(typeof data.price_range === 'string' && data.price_range ? { price_range: data.price_range } : {}),
      }))
    } catch {
      setExtractError('네트워크 오류가 발생했습니다.')
    } finally {
      setExtracting(false)
    }
  }, [extractUrl])

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
      ...(newRacket.weight ? { weight: newRacket.weight } : {}),
      ...(newRacket.balance ? { balance: newRacket.balance } : {}),
      ...(newRacket.flex ? { flex: newRacket.flex } : {}),
      ...(newRacket.price_range ? { price_range: newRacket.price_range } : {}),
    })
    setAddLoading(false)
    if (err) {
      addToast(`추가 실패: ${err}`, false)
      return
    }
    if (data) {
      setRackets((prev) => [data, ...prev])
    }
    closeModal()
    addToast('라켓이 추가되었습니다.', true)
  }, [newRacket, addToast, closeModal])

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
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-extrabold text-[#111111] mb-5">새 라켓 추가</h2>

            {/* URL 자동 추출 섹션 */}
            <div className="mb-5 pb-5 border-b border-[#f0f0f0]">
              <p className="text-xs font-bold text-[#555] mb-2">URL로 자동 입력</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={extractUrl}
                  onChange={(e) => setExtractUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleExtract() }}
                  placeholder="쿠팡, 네이버쇼핑, 브랜드 공식몰 URL..."
                  className="flex-1 h-10 px-3 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111] placeholder:text-[#bbb] outline-none focus:border-[#beff00] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={!extractUrl.trim() || extracting}
                  className="h-10 px-4 rounded-xl bg-[#111] text-[#beff00] text-xs font-bold hover:bg-[#222] transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  {extracting ? '추출 중...' : '불러오기'}
                </button>
              </div>
              {extractError && (
                <p className="text-red-500 text-xs mt-1.5">{extractError}</p>
              )}
              <p className="text-[10px] text-[#bbb] mt-1.5">
                무게·밸런스·강성·가격이 자동으로 입력됩니다. 수치(공격력 등)는 직접 입력하세요.
              </p>
            </div>

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
            <div className="mb-4">
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

            {/* Weight */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#555555] mb-1.5">무게</label>
              <select
                value={newRacket.weight}
                onChange={(e) => setNewRacket((prev) => ({ ...prev, weight: e.target.value }))}
                className="h-10 px-4 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111111] outline-none focus:border-[#beff00] transition-colors w-full"
              >
                {WEIGHT_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o || '-'}</option>
                ))}
              </select>
            </div>

            {/* Balance */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#555555] mb-1.5">밸런스</label>
              <select
                value={newRacket.balance}
                onChange={(e) => setNewRacket((prev) => ({ ...prev, balance: e.target.value }))}
                className="h-10 px-4 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111111] outline-none focus:border-[#beff00] transition-colors w-full"
              >
                {BALANCE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o ? BALANCE_KO[o] : '-'}</option>
                ))}
              </select>
            </div>

            {/* Flex */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#555555] mb-1.5">강성</label>
              <select
                value={newRacket.flex}
                onChange={(e) => setNewRacket((prev) => ({ ...prev, flex: e.target.value }))}
                className="h-10 px-4 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111111] outline-none focus:border-[#beff00] transition-colors w-full"
              >
                {FLEX_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o ? FLEX_KO[o] : '-'}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#555555] mb-1.5">가격대</label>
              <input
                type="text"
                value={newRacket.price_range}
                onChange={(e) => setNewRacket((prev) => ({ ...prev, price_range: e.target.value }))}
                placeholder="예: 5만원~10만원"
                className="h-10 px-4 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111111] placeholder:text-[#999999] outline-none focus:border-[#beff00] transition-colors w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={closeModal}
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
