'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getGuides, deleteGuide } from './actions'

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

export default function AdminGuidePage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getGuides()
      setGuides(data as Guide[])
      setLoading(false)
    }
    load()
  }, [])

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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-[#111111]">가이드 관리</h1>
        <Link
          href="/admin/guide/new"
          className="px-5 py-2.5 rounded-xl bg-[#beff00] text-black font-bold text-sm hover:bg-[#a8e600] transition-colors"
        >
          새 글 작성
        </Link>
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
    </div>
  )
}
