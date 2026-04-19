'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { AlertCircle, Pin, Plus, Trash2, X, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import type { NoticeRow, NoticeType } from '@/app/club/[clubId]/notices/actions'
import {
  getNoticesAction,
  createNoticeAction,
  updateNoticeAction,
  deleteNoticeAction,
  markNotificationsReadAction,
} from '@/app/club/[clubId]/notices/actions'
import type { UserStatus } from './types'

const TYPE_LABEL: Record<NoticeType, string> = {
  announcement: '공지',
  event: '이벤트',
  general: '일반',
}
const TYPE_COLOR: Record<NoticeType, string> = {
  announcement: 'bg-red-50 text-red-500 border-red-100',
  event: 'bg-blue-50 text-blue-500 border-blue-100',
  general: 'bg-[#f8f8f8] text-[#777] border-[#e5e5e5]',
}

function formatRelativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}일 전`
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

interface Props {
  clubId: string
  userStatus: UserStatus
  isManager: boolean
  myMemberId?: string | null
  onUnreadCleared: () => void
}

export function NoticesTab({ clubId, userStatus, isManager, myMemberId, onUnreadCleared }: Props) {
  const [notices, setNotices] = useState<NoticeRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // 공지 작성 폼 상태
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'announcement' as NoticeType,
    is_pinned: false,
  })
  const [formError, setFormError] = useState<string | null>(null)

  // 공지 수정 폼 상태
  const [editForm, setEditForm] = useState({
    title: '',
    body: '',
    type: 'announcement' as NoticeType,
    is_pinned: false,
  })
  const [editError, setEditError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    const rows = await getNoticesAction(clubId)
    setNotices(rows)
    setIsLoading(false)
    if (userStatus === 'member') {
      markNotificationsReadAction(clubId).then(onUnreadCleared)
    }
  }, [clubId, userStatus, onUnreadCleared])

  useEffect(() => { load() }, [load])

  const handleCreate = () => {
    if (!myMemberId) return
    setFormError(null)
    startTransition(async () => {
      const result = await createNoticeAction(clubId, myMemberId, form)
      if (result.error) { setFormError(result.error); return }
      setShowCreate(false)
      setForm({ title: '', body: '', type: 'announcement', is_pinned: false })
      await load()
    })
  }

  const startEdit = (notice: NoticeRow) => {
    setEditingId(notice.id)
    setEditForm({ title: notice.title, body: notice.body, type: notice.type, is_pinned: notice.is_pinned })
    setEditError(null)
  }

  const handleUpdate = (noticeId: string) => {
    setEditError(null)
    startTransition(async () => {
      const result = await updateNoticeAction(clubId, noticeId, editForm)
      if (result.error) { setEditError(result.error); return }
      setEditingId(null)
      await load()
    })
  }

  const handleDelete = (noticeId: string) => {
    startTransition(async () => {
      const result = await deleteNoticeAction(clubId, noticeId)
      if (result.error) { setError(result.error); return }
      setNotices(prev => prev.filter(n => n.id !== noticeId))
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-[#e5e5e5] p-4 animate-pulse">
            <div className="h-4 bg-[#f0f0f0] rounded w-1/4 mb-2" />
            <div className="h-5 bg-[#f0f0f0] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[#f0f0f0] rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* 운영진 — 공지 작성 버튼 */}
      {isManager && !showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#e5e5e5] rounded-2xl text-sm font-semibold text-[#aaa] hover:border-[#beff00] hover:text-[#555] transition-colors"
        >
          <Plus size={16} />
          공지 작성
        </button>
      )}

      {/* 공지 작성 폼 */}
      {isManager && showCreate && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#111]">새 공지 작성</h3>
            <button onClick={() => { setShowCreate(false); setFormError(null) }} className="text-[#bbb] hover:text-[#555]">
              <X size={18} />
            </button>
          </div>
          {formError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 text-xs rounded-xl">
              <AlertCircle size={13} className="shrink-0" />{formError}
            </div>
          )}
          <div className="flex gap-1.5">
            {(['announcement', 'event', 'general'] as NoticeType[]).map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  form.type === t ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white' : 'bg-white border-[#e5e5e5] text-[#777] hover:border-[#beff00]'
                }`}>{TYPE_LABEL[t]}</button>
            ))}
          </div>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="제목" maxLength={80}
            className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors" />
          <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder="내용을 입력하세요" maxLength={1000} rows={4}
            className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors resize-none" />
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))} className="w-4 h-4 accent-[#beff00]" />
            <span className="text-xs font-semibold text-[#555]"><Pin size={12} className="inline mr-1 text-[#999]" />상단 고정</span>
          </label>
          <button onClick={handleCreate} disabled={isPending || !form.title.trim() || !form.body.trim()}
            className="w-full py-3 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 active:scale-[0.99] disabled:opacity-40 transition-all">
            {isPending ? '등록 중...' : '공지 등록'}
          </button>
        </div>
      )}

      {/* 공지 목록 */}
      {notices.length === 0 ? (
        <div className="text-center py-14 text-[#ccc]">
          <p className="text-4xl mb-3">📢</p>
          <p className="text-sm font-semibold">아직 공지가 없어요</p>
          {isManager && <p className="text-xs mt-1.5">운영진은 위 버튼으로 공지를 작성할 수 있어요</p>}
        </div>
      ) : (
        notices.map(notice => {
          const isExpanded = expandedId === notice.id
          const isEditing = editingId === notice.id
          return (
            <div key={notice.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
                notice.is_pinned ? 'border-[#beff00]/60' : 'border-[#e5e5e5]'
              }`}
            >
              {notice.is_pinned && (
                <div className="flex items-center gap-1 px-4 pt-3 pb-0">
                  <Pin size={10} className="text-[#beff00] fill-current" />
                  <span className="text-[10px] font-bold text-[#aaa]">상단 고정</span>
                </div>
              )}

              {/* 헤더 */}
              <button onClick={() => { setExpandedId(isExpanded ? null : notice.id); if (isEditing) setEditingId(null) }}
                className="w-full text-left px-4 py-3.5">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${TYPE_COLOR[notice.type]}`}>
                        {TYPE_LABEL[notice.type]}
                      </span>
                      <span className="text-[10px] text-[#bbb]">{formatRelativeDate(notice.created_at)}</span>
                      {notice.author_name && <span className="text-[10px] text-[#bbb]">· {notice.author_name}</span>}
                    </div>
                    <p className="text-sm font-bold text-[#111] leading-snug line-clamp-2">{notice.title}</p>
                    {!isExpanded && <p className="text-xs text-[#888] mt-0.5 line-clamp-1">{notice.body}</p>}
                  </div>
                  <span className="text-[#ccc] mt-0.5 shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>
              </button>

              {/* 펼쳐진 본문 */}
              {isExpanded && !isEditing && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-[#555] leading-relaxed whitespace-pre-line">{notice.body}</p>
                  {isManager && (
                    <div className="mt-3 flex justify-end gap-3">
                      <button onClick={() => startEdit(notice)} disabled={isPending}
                        className="flex items-center gap-1 text-xs text-[#bbb] hover:text-[#555] transition-colors disabled:opacity-50">
                        <Pencil size={13} />수정
                      </button>
                      <button onClick={() => handleDelete(notice.id)} disabled={isPending}
                        className="flex items-center gap-1 text-xs text-[#ccc] hover:text-red-400 transition-colors disabled:opacity-50">
                        <Trash2 size={13} />삭제
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 인라인 수정 폼 */}
              {isExpanded && isEditing && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#f0f0f0] pt-3">
                  {editError && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 text-xs rounded-xl">
                      <AlertCircle size={13} className="shrink-0" />{editError}
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    {(['announcement', 'event', 'general'] as NoticeType[]).map(t => (
                      <button key={t} onClick={() => setEditForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                          editForm.type === t ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white' : 'bg-white border-[#e5e5e5] text-[#777] hover:border-[#beff00]'
                        }`}>{TYPE_LABEL[t]}</button>
                    ))}
                  </div>
                  <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="제목" maxLength={80}
                    className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors" />
                  <textarea value={editForm.body} onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
                    placeholder="내용" maxLength={1000} rows={4}
                    className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors resize-none" />
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={editForm.is_pinned} onChange={e => setEditForm(f => ({ ...f, is_pinned: e.target.checked }))} className="w-4 h-4 accent-[#beff00]" />
                    <span className="text-xs font-semibold text-[#555]"><Pin size={12} className="inline mr-1 text-[#999]" />상단 고정</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)}
                      className="flex-1 py-2.5 text-sm font-semibold border border-[#e5e5e5] text-[#999] rounded-xl hover:bg-[#f8f8f8] transition-colors">
                      취소
                    </button>
                    <button onClick={() => handleUpdate(notice.id)} disabled={isPending || !editForm.title.trim() || !editForm.body.trim()}
                      className="flex-[2] py-2.5 bg-[#beff00] text-[#111] text-sm font-bold rounded-xl hover:brightness-95 disabled:opacity-40 transition-all">
                      {isPending ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
