'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Megaphone, Pin, Trash2, Pencil, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { NoticeRow, NoticeType } from '@/app/club/[clubId]/notices/actions'
import {
  createNoticeAction,
  updateNoticeAction,
  deleteNoticeAction,
} from '@/app/club/[clubId]/notices/actions'

interface Props {
  clubId: string
  initialNotices: NoticeRow[]
  isOwner: boolean
  myMemberId: string
}

type FilterTab = 'all' | NoticeType

const TYPE_LABEL: Record<NoticeType, string> = {
  announcement: '공지알림',
  event: '이벤트',
  general: '일반',
}

const TYPE_BADGE: Record<NoticeType, string> = {
  announcement: 'bg-red-50 text-red-600',
  event: 'bg-blue-50 text-blue-600',
  general: 'bg-[#f8f8f8] text-[#555]',
}

interface ModalState {
  mode: 'create' | 'edit'
  id?: string
  title: string
  body: string
  type: NoticeType
  is_pinned: boolean
}

export function NoticesClient({ clubId, initialNotices, isOwner, myMemberId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered =
    activeTab === 'all'
      ? initialNotices
      : initialNotices.filter((n) => n.type === activeTab)

  const pinned = filtered.filter((n) => n.is_pinned)
  const rest = filtered.filter((n) => !n.is_pinned)
  const sorted = [...pinned, ...rest]

  function openCreate() {
    setError(null)
    setModal({ mode: 'create', title: '', body: '', type: 'announcement', is_pinned: false })
  }

  function openEdit(notice: NoticeRow) {
    setError(null)
    setModal({
      mode: 'edit',
      id: notice.id,
      title: notice.title,
      body: notice.body,
      type: notice.type,
      is_pinned: notice.is_pinned,
    })
  }

  function handleSave() {
    if (!modal) return
    setError(null)
    startTransition(async () => {
      const result =
        modal.mode === 'create'
          ? await createNoticeAction(clubId, myMemberId, {
              title: modal.title,
              body: modal.body,
              type: modal.type,
              is_pinned: modal.is_pinned,
            })
          : await updateNoticeAction(clubId, modal.id!, {
              title: modal.title,
              body: modal.body,
              type: modal.type,
              is_pinned: modal.is_pinned,
            })
      if (result.error) {
        setError(result.error)
        return
      }
      setModal(null)
      router.refresh()
    })
  }

  function handleDelete(noticeId: string) {
    if (!window.confirm('이 공지를 삭제하시겠습니까?')) return
    startTransition(async () => {
      const result = await deleteNoticeAction(clubId, noticeId)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'announcement', label: '공지' },
    { key: 'event', label: '이벤트' },
    { key: 'general', label: '일반' },
  ]

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* 헤더 탭 + 작성 버튼 */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#0a0a0a] text-white'
                  : 'text-[#555] hover:bg-[#f8f8f8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {isOwner && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#222] transition-colors"
          >
            <Megaphone size={14} />
            공지 작성
          </button>
        )}
      </div>

      {/* 목록 */}
      <div className="mt-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-[#999]">
            <Megaphone size={32} strokeWidth={1.5} />
            <p className="text-sm">아직 등록된 공지가 없습니다</p>
          </div>
        ) : (
          sorted.map((notice) => {
            const isExpanded = expandedId === notice.id
            const dateStr = new Date(notice.created_at).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            })
            return (
              <div
                key={notice.id}
                className={`border-b border-[#f0f0f0] last:border-b-0 ${
                  notice.is_pinned ? 'border-l-4 border-l-[#beff00]' : ''
                }`}
              >
                <button
                  className="w-full text-left px-4 py-4 flex items-start justify-between gap-3 hover:bg-[#fafafa] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : notice.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGE[notice.type]}`}
                      >
                        {TYPE_LABEL[notice.type]}
                      </span>
                      {notice.is_pinned && (
                        <Pin size={12} className="text-[#beff00] fill-[#beff00]" />
                      )}
                    </div>
                    <p className="font-semibold text-sm text-[#111] truncate">{notice.title}</p>
                    <p className="text-xs text-[#999] mt-0.5">
                      {notice.author_name ?? '운영진'} · {dateStr}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isOwner && (
                      <>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(notice)
                          }}
                          className="p-1.5 rounded hover:bg-[#f0f0f0] text-[#999] hover:text-[#555] transition-colors"
                        >
                          <Pencil size={14} />
                        </span>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notice.id)
                          }}
                          className="p-1.5 rounded hover:bg-red-50 text-[#999] hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </span>
                      </>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-[#999]" />
                    ) : (
                      <ChevronDown size={16} className="text-[#999]" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 text-sm text-[#555] whitespace-pre-wrap leading-relaxed border-t border-[#f0f0f0] pt-3">
                    {notice.body}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 모달 */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
              <h2 className="font-bold text-[#111]">
                {modal.mode === 'create' ? '공지 작성' : '공지 수정'}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 rounded-lg hover:bg-[#f0f0f0] text-[#999]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#555] mb-1">타입</label>
                  <select
                    value={modal.type}
                    onChange={(e) =>
                      setModal({ ...modal, type: e.target.value as NoticeType })
                    }
                    className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#0a0a0a]"
                  >
                    <option value="announcement">공지알림</option>
                    <option value="event">이벤트</option>
                    <option value="general">일반</option>
                  </select>
                </div>
                <div className="flex items-end pb-2 gap-2">
                  <input
                    id="is_pinned"
                    type="checkbox"
                    checked={modal.is_pinned}
                    onChange={(e) => setModal({ ...modal, is_pinned: e.target.checked })}
                    className="w-4 h-4 accent-[#beff00]"
                  />
                  <label htmlFor="is_pinned" className="text-sm text-[#555]">
                    상단 고정
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#555] mb-1">제목</label>
                <input
                  type="text"
                  value={modal.title}
                  onChange={(e) => setModal({ ...modal, title: e.target.value })}
                  placeholder="공지 제목을 입력하세요"
                  className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] placeholder:text-[#999] focus:outline-none focus:border-[#0a0a0a]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#555] mb-1">내용</label>
                <textarea
                  rows={4}
                  value={modal.body}
                  onChange={(e) => setModal({ ...modal, body: e.target.value })}
                  placeholder="공지 내용을 입력하세요"
                  className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#111] placeholder:text-[#999] focus:outline-none focus:border-[#0a0a0a] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 px-5 pb-5">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-medium text-[#555] hover:bg-[#f8f8f8] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-medium hover:bg-[#222] disabled:opacity-50 transition-colors"
              >
                {isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
