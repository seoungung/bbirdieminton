'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  getRacketsWithImages,
  uploadRacketImage,
  deleteRacketImage,
  type RacketImageRow,
} from './actions'

const SLOT_COUNT = 5

function parseImageUrls(raw: string | null): string[] {
  if (!raw) return Array(SLOT_COUNT).fill('')
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    const matches = [...trimmed.slice(1, -1).matchAll(/"([^"]*)"/g)]
    const arr = matches.map((m) => m[1])
    while (arr.length < SLOT_COUNT) arr.push('')
    return arr.slice(0, SLOT_COUNT)
  }
  return Array(SLOT_COUNT).fill('')
}

// ─── 이미지 슬롯 컴포넌트 ────────────────────────────────────────────────────

interface SlotProps {
  slug: string
  index: number
  url: string
  loading: boolean
  onUpload: (slug: string, index: number, file: File) => void
  onDelete: (slug: string, index: number) => void
}

function ImageSlot({ slug, index, url, loading, onUpload, onDelete }: SlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onUpload(slug, index, file)
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = ''
  }

  const hasImage = url.trim() !== ''

  return (
    <div className="relative flex-shrink-0">
      {/* 히든 파일 입력 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {loading ? (
        // 로딩 스피너
        <div
          className="w-[60px] h-[60px] rounded-lg border border-[#e5e5e5] bg-[#f8f8f8] flex items-center justify-center"
          aria-label="업로드 중"
        >
          <svg
            className="w-5 h-5 text-[#999] animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      ) : hasImage ? (
        // 이미지 미리보기
        <div className="relative w-[60px] h-[60px] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`${slug} 이미지 ${index + 1}`}
            className="w-full h-full object-cover rounded-lg border border-[#e5e5e5] cursor-pointer"
            onClick={() => inputRef.current?.click()}
          />
          {/* 삭제 버튼 */}
          <button
            type="button"
            aria-label="이미지 삭제"
            onClick={() => onDelete(slug, index)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#111] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
          >
            ×
          </button>
        </div>
      ) : (
        // 빈 슬롯 — 업로드 트리거
        <button
          type="button"
          aria-label={`슬롯 ${index + 1} 이미지 추가`}
          onClick={() => inputRef.current?.click()}
          className="w-[60px] h-[60px] rounded-lg border-2 border-dashed border-[#e5e5e5] bg-[#f8f8f8] flex items-center justify-center text-[#ccc] hover:border-[#beff00] hover:text-[#beff00] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      {/* 슬롯 번호 */}
      <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-[#ccc]">
        {index + 1}
      </span>
    </div>
  )
}

// ─── 라켓 카드 컴포넌트 ──────────────────────────────────────────────────────

interface RacketRowProps {
  racket: RacketImageRow
  loadingSlots: Record<string, boolean>
  autoSearching: boolean
  onUpload: (slug: string, index: number, file: File) => void
  onDelete: (slug: string, index: number) => void
  onAutoSearch: (racket: RacketImageRow) => void
}

function RacketRow({ racket, loadingSlots, autoSearching, onUpload, onDelete, onAutoSearch }: RacketRowProps) {
  const urls = parseImageUrls(racket.image_url)
  const filledCount = urls.filter((u) => u.trim() !== '').length

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 px-5 bg-white border border-[#e5e5e5] rounded-xl hover:border-[#d0d0d0] transition-colors">
      {/* 라켓 정보 */}
      <div className="sm:w-52 shrink-0">
        <p className="text-xs font-bold text-[#beff00] uppercase tracking-wider">{racket.brand}</p>
        <p className="text-sm font-bold text-[#111] leading-snug mt-0.5">{racket.name}</p>
        <p className="text-xs text-[#999] mt-1">
          {filledCount}/{SLOT_COUNT} 이미지
        </p>
        {filledCount === 0 && (
          <button
            type="button"
            onClick={() => onAutoSearch(racket)}
            disabled={autoSearching}
            className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f0f0f0] text-[#555] hover:bg-[#e5e5e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {autoSearching ? (
              <>
                <svg
                  className="w-3 h-3 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                검색 중...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                자동 검색
              </>
            )}
          </button>
        )}
      </div>

      {/* 이미지 슬롯 */}
      <div className="flex items-center gap-3 pb-5 sm:pb-0">
        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const key = `${racket.slug}-${i}`
          return (
            <ImageSlot
              key={key}
              slug={racket.slug}
              index={i}
              url={urls[i]}
              loading={loadingSlots[key] ?? false}
              onUpload={onUpload}
              onDelete={onDelete}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function AdminImagesPage() {
  const [rackets, setRackets] = useState<RacketImageRow[]>([])
  const [query, setQuery] = useState('')
  const [onlyNoImage, setOnlyNoImage] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState<Record<string, boolean>>({})
  const [autoSearchingIds, setAutoSearchingIds] = useState<Set<string>>(new Set())
  const [bulkSearchProgress, setBulkSearchProgress] = useState<{ current: number; total: number } | null>(null)
  const [isBulkSearching, setIsBulkSearching] = useState(false)
  const bulkAbortRef = useRef(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()

  // 초기 데이터 로드
  useEffect(() => {
    startTransition(async () => {
      const data = await getRacketsWithImages()
      setRackets(data)
    })
  }, [])

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  function setSlotLoading(slug: string, index: number, loading: boolean) {
    setLoadingSlots((prev) => ({
      ...prev,
      [`${slug}-${index}`]: loading,
    }))
  }

  function refreshRacket(slug: string, index: number, newUrl: string) {
    setRackets((prev) =>
      prev.map((r) => {
        if (r.slug !== slug) return r
        const urls = parseImageUrls(r.image_url)
        urls[index] = newUrl
        // PostgreSQL 배열 형식으로 재구성
        const escaped = urls.map((u) => `"${u.replace(/"/g, '\\"')}"`)
        return { ...r, image_url: `{${escaped.join(',')}}` }
      }),
    )
  }

  function refreshRacketBySlot(id: string, slot: number, newUrl: string) {
    setRackets((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const urls = parseImageUrls(r.image_url)
        urls[slot] = newUrl
        const escaped = urls.map((u) => `"${u.replace(/"/g, '\\"')}"`)
        return { ...r, image_url: `{${escaped.join(',')}}` }
      }),
    )
  }

  function clearRacketSlot(slug: string, index: number) {
    setRackets((prev) =>
      prev.map((r) => {
        if (r.slug !== slug) return r
        const urls = parseImageUrls(r.image_url)
        urls[index] = ''
        const escaped = urls.map((u) => `"${u.replace(/"/g, '\\"')}"`)
        return { ...r, image_url: `{${escaped.join(',')}}` }
      }),
    )
  }

  async function handleUpload(slug: string, index: number, file: File) {
    setSlotLoading(slug, index, true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('slug', slug)
    fd.append('index', String(index))

    const result = await uploadRacketImage(fd)
    setSlotLoading(slug, index, false)

    if (result.success && result.url) {
      refreshRacket(slug, index, result.url)
      showToast('이미지가 업로드되었습니다.', true)
    } else {
      showToast(result.error ?? '업로드에 실패했습니다.', false)
    }
  }

  async function handleDelete(slug: string, index: number) {
    setSlotLoading(slug, index, true)
    const result = await deleteRacketImage(slug, index)
    setSlotLoading(slug, index, false)

    if (result.success) {
      clearRacketSlot(slug, index)
      showToast('이미지가 삭제되었습니다.', true)
    } else {
      showToast(result.error ?? '삭제에 실패했습니다.', false)
    }
  }

  async function handleAutoSearch(racket: RacketImageRow) {
    setAutoSearchingIds((prev) => new Set(prev).add(racket.id))
    try {
      const res = await fetch('/api/admin/racket-image-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          racketId: racket.id,
          racketName: racket.name,
          brand: racket.brand,
          password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? prompt('관리자 비밀번호를 입력하세요') ?? '',
        }),
      })
      const json = await res.json()
      if (res.ok && json.url) {
        refreshRacketBySlot(racket.id, json.slot, json.url)
        showToast('이미지를 자동으로 찾았습니다.', true)
      } else {
        showToast(json.error ?? '자동 검색에 실패했습니다.', false)
      }
    } catch {
      showToast('자동 검색 중 오류가 발생했습니다.', false)
    } finally {
      setAutoSearchingIds((prev) => {
        const next = new Set(prev)
        next.delete(racket.id)
        return next
      })
    }
  }

  async function handleBulkAutoSearch() {
    const noImageRackets = rackets.filter((r) => {
      const urls = parseImageUrls(r.image_url)
      return urls.every((u) => u.trim() === '')
    })
    if (noImageRackets.length === 0) {
      showToast('이미지 없는 라켓이 없습니다.', true)
      return
    }

    const password = prompt('관리자 비밀번호를 입력하세요') ?? ''
    if (!password) return

    bulkAbortRef.current = false
    setIsBulkSearching(true)
    setBulkSearchProgress({ current: 0, total: noImageRackets.length })

    for (let i = 0; i < noImageRackets.length; i++) {
      if (bulkAbortRef.current) break

      const racket = noImageRackets[i]
      setBulkSearchProgress({ current: i + 1, total: noImageRackets.length })
      setAutoSearchingIds((prev) => new Set(prev).add(racket.id))

      try {
        const res = await fetch('/api/admin/racket-image-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            racketId: racket.id,
            racketName: racket.name,
            brand: racket.brand,
            password,
          }),
        })
        const json = await res.json()
        if (res.ok && json.url) {
          refreshRacketBySlot(racket.id, json.slot, json.url)
        }
      } catch {
        // 개별 실패는 무시하고 계속 진행
      } finally {
        setAutoSearchingIds((prev) => {
          const next = new Set(prev)
          next.delete(racket.id)
          return next
        })
      }

      // 요청 간격 (rate limit 방지)
      if (i < noImageRackets.length - 1 && !bulkAbortRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    setIsBulkSearching(false)
    setBulkSearchProgress(null)
    showToast('전체 자동 검색이 완료되었습니다.', true)
  }

  function handleBulkStop() {
    bulkAbortRef.current = true
    setIsBulkSearching(false)
    setBulkSearchProgress(null)
    showToast('자동 검색이 중지되었습니다.', false)
  }

  const noImageCount = rackets.filter((r) => {
    const urls = parseImageUrls(r.image_url)
    return urls.every((u) => u.trim() === '')
  }).length

  const filtered = rackets.filter((r) => {
    const q = query.trim().toLowerCase()
    const matchesQuery = !q || r.name.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q)
    if (!matchesQuery) return false
    if (onlyNoImage) {
      const urls = parseImageUrls(r.image_url)
      const hasImage = urls.some((u) => u.trim() !== '')
      if (hasImage) return false
    }
    return true
  })

  return (
    <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[#111111] mb-6">라켓 이미지 관리</h1>
        {/* 검색바 + 토글 + 전체 자동 검색 */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="라켓 이름 또는 브랜드로 검색"
            className="w-full sm:w-80 h-10 px-4 rounded-xl border border-[#e5e5e5] bg-white text-sm text-[#111] placeholder:text-[#ccc] outline-none focus:border-[#beff00] transition-colors"
          />
          {/* 이미지 없는 항목만 보기 토글 */}
          <button
            type="button"
            onClick={() => setOnlyNoImage((v) => !v)}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap ${
              onlyNoImage
                ? 'bg-[#111] text-[#beff00] border-[#111]'
                : 'bg-white text-[#555] border-[#e5e5e5] hover:border-[#beff00]'
            }`}
          >
            {/* 토글 스위치 시각화 */}
            <span
              className={`relative inline-flex w-8 h-4 rounded-full transition-colors ${
                onlyNoImage ? 'bg-[#beff00]' : 'bg-[#ddd]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                  onlyNoImage ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </span>
            이미지 없는 항목만 보기
            {noImageCount > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                onlyNoImage ? 'bg-[#beff00]/20 text-[#beff00]' : 'bg-[#f0f0f0] text-[#999]'
              }`}>
                {noImageCount}
              </span>
            )}
          </button>

          {/* 전체 자동 검색 버튼 */}
          {noImageCount > 0 && (
            isBulkSearching ? (
              <button
                type="button"
                onClick={handleBulkStop}
                className="flex items-center gap-2 h-10 px-4 rounded-xl border border-red-300 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors whitespace-nowrap"
              >
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {bulkSearchProgress
                  ? `${bulkSearchProgress.current}/${bulkSearchProgress.total} 검색 중... (중지)`
                  : '중지'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBulkAutoSearch}
                className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[#e5e5e5] bg-white text-[#555] text-sm font-medium hover:border-[#beff00] hover:text-[#111] transition-colors whitespace-nowrap"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                전체 자동 검색
              </button>
            )
          )}
        </div>

        {/* 로딩 상태 */}
        {isPending && rackets.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <svg
              className="w-8 h-8 text-[#ccc] animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}

        {/* 라켓 목록 */}
        {rackets.length > 0 && (
          <>
            <p className="text-xs text-[#999] mb-3">
              {filtered.length}개 라켓
              {(query || onlyNoImage) && ` (전체 ${rackets.length}개 중)`}
            </p>
            <div className="flex flex-col gap-3">
              {filtered.map((racket) => (
                <RacketRow
                  key={racket.id}
                  racket={racket}
                  loadingSlots={loadingSlots}
                  autoSearching={autoSearchingIds.has(racket.id)}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onAutoSearch={handleAutoSearch}
                />
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-[#999]">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </>
        )}
      {/* 토스트 알림 */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
            toast.ok
              ? 'bg-[#111] text-[#beff00]'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}
