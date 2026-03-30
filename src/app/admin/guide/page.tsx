'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getGuides, deleteGuide, createGuide } from './actions'

interface Guide {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string
  published: boolean
  created_at: string
  updated_at: string
}

const CONTENT_LIST = [
  { id: 2, title: '배드민턴 체육관 처음 갔을 때 당황했던 것들', type: '바이럴', category: '공감/스토리' },
  { id: 3, title: '배드민턴 그립 잡는 법 — 포핸드 vs 백핸드', type: 'SEO', category: '기초 기술' },
  { id: 4, title: '헤드라이트 vs 헤드헤비 — 왕초보는 뭘 사야 할까?', type: 'SEO', category: '라켓/장비' },
  { id: 5, title: '배드민턴 동호회 처음 나갔을 때 생기는 일', type: '바이럴', category: '공감/스토리' },
  { id: 6, title: '클리어 치는 법 — 왕초보도 코트 끝까지 보내는 방법', type: 'SEO', category: '기초 기술' },
  { id: 7, title: '스매시 소리 나는 법 — "뻥" 소리의 비밀', type: 'SEO', category: '기초 기술' },
  { id: 8, title: '체육관 에티켓 완전 정리 — 이것만 알면 눈치 안 봐요', type: 'SEO', category: '실용 정보' },
  { id: 9, title: '배드민턴 1년 치면 실제로 얼마나 늘어요?', type: '바이럴', category: '공감/스토리' },
  { id: 10, title: '깃털 셔틀콕 vs 나일론 셔틀콕 — 입문자는 뭘 써야 할까?', type: 'SEO', category: '라켓/장비' },
]

type Tab = 'list' | 'custom'

export default function AdminGuidePage() {
  const router = useRouter()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('list')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [customType, setCustomType] = useState<'SEO' | '바이럴'>('SEO')
  const [customCategory, setCustomCategory] = useState('')
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const loadGuides = useCallback(async () => {
    setLoading(true)
    const data = await getGuides()
    setGuides(data as Guide[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadGuides()
  }, [loadGuides])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function openModal() {
    setModalOpen(true)
    setTab('list')
    setSelectedId(null)
    setCustomTitle('')
    setCustomType('SEO')
    setCustomCategory('')
  }

  function closeModal() {
    if (generating) return
    setModalOpen(false)
  }

  async function handleGenerate() {
    const password = prompt('어드민 비밀번호를 입력하세요')
    if (!password) return

    let title: string
    let type: string
    let category: string

    if (tab === 'list') {
      const item = CONTENT_LIST.find((c) => c.id === selectedId)
      if (!item) { alert('콘텐츠를 선택해주세요'); return }
      title = item.title
      type = item.type
      category = item.category
    } else {
      if (!customTitle.trim()) { alert('제목을 입력해주세요'); return }
      if (!customCategory.trim()) { alert('카테고리를 입력해주세요'); return }
      title = customTitle.trim()
      type = customType
      category = customCategory.trim()
    }

    setGenerating(true)

    try {
      const res = await fetch('/api/admin/generate-skeleton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, category, password }),
      })
      const json = await res.json()

      if (!res.ok) {
        if (res.status === 401) { alert('비밀번호가 틀렸습니다'); return }
        alert(`생성 실패: ${json.error ?? '알 수 없는 오류'}`)
        return
      }

      // 임시저장
      const result = await createGuide({
        slug: json.slug,
        title: json.title,
        excerpt: json.excerpt,
        content: json.content,
        cover_image: '',
        published: false,
      })

      if (!result.success) {
        alert(`저장 실패: ${result.error}`)
        return
      }

      setModalOpen(false)
      await loadGuides()
      showToast('뼈대가 생성되어 임시저장됐어요. 편집 페이지로 이동합니다.')

      if (result.id) {
        setTimeout(() => router.push(`/admin/guide/${result.id}`), 800)
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 가이드를 삭제하시겠습니까?`)) return
    const result = await deleteGuide(id)
    if (result.success) {
      setGuides((prev) => prev.filter((g) => g.id !== id))
    } else {
      alert(`삭제 실패: ${result.error}`)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#111111] text-white text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-[#111111]">가이드 관리</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={openModal}
            className="px-5 py-2.5 rounded-xl border border-[#e5e5e5] text-[#555555] font-bold text-sm hover:bg-[#f0f0f0] transition-colors"
          >
            뼈대 생성
          </button>
          <Link
            href="/admin/guide/new"
            className="px-5 py-2.5 rounded-xl bg-[#beff00] text-black font-bold text-sm hover:bg-[#a8e600] transition-colors"
          >
            새 글 작성
          </Link>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#e5e5e5] border-t-[#beff00] rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && guides.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#999999] text-sm">아직 작성된 가이드가 없어요</p>
          <Link
            href="/admin/guide/new"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-[#beff00] text-black font-bold text-sm hover:bg-[#a8e600] transition-colors"
          >
            첫 가이드 작성하기
          </Link>
        </div>
      )}

      {/* Guide list */}
      {!loading && guides.length > 0 && (
        <div className="space-y-3">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[#e5e5e5] bg-white hover:border-[#beff00] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-[#111111] truncate">
                    {guide.title}
                  </h3>
                  {guide.published ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                      발행
                    </span>
                  ) : (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f0f0] text-[#999999]">
                      임시저장
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#999999]">
                  {formatDate(guide.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/guide/${guide.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#e5e5e5] text-[#555555] hover:bg-[#f0f0f0] transition-colors"
                >
                  편집
                </Link>
                <button
                  onClick={() => handleDelete(guide.id, guide.title)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skeleton Generation Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#e5e5e5]">
              <h2 className="text-lg font-extrabold text-[#111111]">콘텐츠 뼈대 자동 생성</h2>
              <p className="text-xs text-[#999999] mt-0.5">claude-haiku로 뼈대를 생성하고 임시저장합니다</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#e5e5e5]">
              <button
                onClick={() => setTab('list')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'list' ? 'text-[#111111] border-b-2 border-[#beff00]' : 'text-[#999999] hover:text-[#555555]'}`}
              >
                목록에서 선택
              </button>
              <button
                onClick={() => setTab('custom')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'custom' ? 'text-[#111111] border-b-2 border-[#beff00]' : 'text-[#999999] hover:text-[#555555]'}`}
              >
                직접 입력
              </button>
            </div>

            {/* Tab Content */}
            <div className="px-6 py-4">
              {tab === 'list' ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {CONTENT_LIST.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedId === item.id
                          ? 'border-[#beff00] bg-[#f8ffe0]'
                          : 'border-[#e5e5e5] hover:border-[#d0d0d0] bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#f0f0f0] text-[#999999] text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {item.id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111111] leading-snug">{item.title}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.type === 'SEO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {item.type}
                            </span>
                            <span className="text-[11px] text-[#999999]">{item.category}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#555555] mb-1.5">제목</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="ex) 배드민턴 풋워크 기초 — 왕초보 필수 동작 5가지"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e5e5e5] text-sm text-[#111111] placeholder-[#cccccc] focus:outline-none focus:border-[#beff00] transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-[#555555] mb-1.5">타입</label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value as 'SEO' | '바이럴')}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e5e5e5] text-sm text-[#111111] focus:outline-none focus:border-[#beff00] transition-colors bg-white"
                      >
                        <option value="SEO">SEO (검색 유입)</option>
                        <option value="바이럴">바이럴 (공감/확산)</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-[#555555] mb-1.5">카테고리</label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="ex) 기초 기술"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e5e5e5] text-sm text-[#111111] placeholder-[#cccccc] focus:outline-none focus:border-[#beff00] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                disabled={generating}
                className="px-4 py-2.5 rounded-xl border border-[#e5e5e5] text-sm font-medium text-[#555555] hover:bg-[#f0f0f0] transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || (tab === 'list' && !selectedId)}
                className="px-5 py-2.5 rounded-xl bg-[#beff00] text-black font-bold text-sm hover:bg-[#a8e600] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    생성 중...
                  </>
                ) : (
                  '생성하기'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
