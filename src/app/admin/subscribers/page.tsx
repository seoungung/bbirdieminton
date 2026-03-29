'use client'

import { useEffect, useState, useCallback } from 'react'
import { deleteSubscriber } from './actions'

interface Subscriber {
  id: string
  email: string
  level_tag: string
  gender: string
  created_at: string
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: '왕초보',
  novice: '초심자',
  d_class: 'D조',
  c_class: 'C조',
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-blue-50 text-blue-600',
  novice: 'bg-green-50 text-green-600',
  d_class: 'bg-yellow-50 text-yellow-700',
  c_class: 'bg-orange-50 text-orange-600',
}

const GENDER_LABELS: Record<string, string> = {
  male: '남성',
  female: '여성',
  other: '기타',
}

const LEVEL_FILTER_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'beginner', label: '왕초보' },
  { value: 'novice', label: '초심자' },
  { value: 'd_class', label: 'D조' },
  { value: 'c_class', label: 'C조' },
]

function formatDate(iso: string) {
  return iso?.slice(0, 16).replace('T', ' ') ?? '-'
}

function exportCsv(subscribers: Subscriber[]) {
  const header = 'email,level,gender,created_at'
  const rows = subscribers.map(s =>
    `${s.email},${LEVEL_LABELS[s.level_tag] ?? s.level_tag},${GENDER_LABELS[s.gender] ?? s.gender},${s.created_at}`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    setError('')
    const password = localStorage.getItem('admin_password') ?? ''
    const res = await fetch('/api/admin/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) {
      setError('구독자 목록을 불러오지 못했습니다.')
      setLoading(false)
      return
    }
    const json = await res.json()
    setSubscribers(json.subscribers ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const filtered = subscribers.filter(s => {
    const matchSearch = search === '' || s.email.toLowerCase().includes(search.toLowerCase())
    const matchLevel = levelFilter === '' || s.level_tag === levelFilter
    return matchSearch && matchLevel
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const result = await deleteSubscriber(deleteTarget.id)
    setDeleteLoading(false)
    if (result.success) {
      setSubscribers(prev => prev.filter(s => s.id !== deleteTarget.id))
      setDeleteTarget(null)
    } else {
      alert('삭제 중 오류가 발생했습니다: ' + result.error)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#111111]">구독자 목록</h1>
        <button
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#beff00] text-black font-bold text-sm rounded-xl hover:bg-[#a8e600] transition-colors disabled:opacity-40"
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          CSV 내보내기
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이메일 검색..."
          className="flex-1 h-10 px-4 rounded-xl bg-white border border-[#e5e5e5] text-[#111111] placeholder:text-[#999999] text-sm outline-none focus:border-[#beff00] transition-colors"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {LEVEL_FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setLevelFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                levelFilter === opt.value
                  ? 'bg-[#beff00] text-black'
                  : 'bg-white border border-[#e5e5e5] text-[#555555] hover:border-[#beff00]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-[#999999] mb-4">
        총 <span className="font-bold text-[#111111]">{filtered.length}</span>명
        {subscribers.length !== filtered.length && (
          <span> (전체 {subscribers.length}명 중)</span>
        )}
      </p>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#e5e5e5] border-t-[#beff00] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={fetchSubscribers}
            className="mt-3 text-sm text-[#555555] underline"
          >
            다시 시도
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[#999999] text-sm">아직 구독자가 없어요.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
                  <th className="text-left px-4 py-3 font-semibold text-[#555555]">이메일</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#555555]">레벨</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#555555]">성별</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#555555]">가입일</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-[#f8f8f8] transition-colors">
                    <td className="px-4 py-3 text-[#111111] font-medium">{s.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${
                          LEVEL_COLORS[s.level_tag] ?? 'bg-[#f0f0f0] text-[#555555]'
                        }`}
                      >
                        {LEVEL_LABELS[s.level_tag] ?? s.level_tag ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#555555]">
                      {GENDER_LABELS[s.gender] ?? s.gender ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-[#999999] tabular-nums">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="text-[#999999] hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleteLoading && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl border border-[#e5e5e5] p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-extrabold text-[#111111] mb-2">구독자 삭제</h2>
            <p className="text-sm text-[#555555] mb-1">
              아래 구독자를 삭제하시겠습니까?
            </p>
            <p className="text-sm font-bold text-[#111111] mb-5 break-all">
              {deleteTarget.email}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 h-11 rounded-xl border border-[#e5e5e5] text-[#555555] text-sm font-medium hover:bg-[#f0f0f0] transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
