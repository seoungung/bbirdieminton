'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import { AlertCircle, Pin, Plus, Trash2, X, ChevronDown, ChevronUp, Pencil, ImagePlus } from 'lucide-react'
import type { NoticeRow, NoticeType } from '@/app/club/[clubId]/notices/actions'
import {
  getNoticesAction,
  createNoticeAction,
  updateNoticeAction,
  deleteNoticeAction,
  markNotificationsReadAction,
} from '@/app/club/[clubId]/notices/actions'
import { createClient } from '@/lib/supabase/client'
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

// ── 데모용 샘플 공지 ────────────────────────────────────────
const DEMO_NOTICES: NoticeRow[] = [
  {
    id: 'demo-n1',
    club_id: 'demo-1',
    author_member_id: 'm1',
    title: '🎉 4월 신규회원 환영 이벤트 안내',
    body: '안녕하세요, 버디민턴 동호회 회원 여러분!\n\n4월 한 달 동안 신규 가입하신 분들을 위해 환영 이벤트를 진행합니다.\n• 첫 달 코트비 무료\n• 기본 셔틀콕 1박스 제공\n• 기존 회원과 매칭된 맞춤 레슨 (1회)\n\n궁금한 점은 운영진에게 편하게 문의해주세요! 😊',
    type: 'event',
    is_pinned: true,
    image_urls: ['https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=70'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author_name: '김민준',
  },
]

export function NoticesTab({ clubId, userStatus, isManager, myMemberId, onUnreadCleared }: Props) {
  const isDemo = clubId.startsWith('demo-')
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
    image_urls: [] as string[],
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadingCreate, setUploadingCreate] = useState(false)
  const createFileRef = useRef<HTMLInputElement>(null)

  // 공지 수정 폼 상태
  const [editForm, setEditForm] = useState({
    title: '',
    body: '',
    type: 'announcement' as NoticeType,
    is_pinned: false,
    image_urls: [] as string[],
  })
  const [editError, setEditError] = useState<string | null>(null)
  const [uploadingEdit, setUploadingEdit] = useState(false)
  const editFileRef = useRef<HTMLInputElement>(null)

  // 이미지 업로드 공통 핸들러
  const uploadImage = async (file: File): Promise<string | null> => {
    if (file.size > 10 * 1024 * 1024) {
      return null
    }
    if (isDemo) {
      return URL.createObjectURL(file)
    }
    if (!myMemberId) return null
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const storagePath = `${clubId}/notices/${myMemberId}/${fileName}`
    const { error: upErr } = await supabase.storage
      .from('club-albums')
      .upload(storagePath, file, { cacheControl: '3600', upsert: false })
    if (upErr) return null
    const { data: urlData } = supabase.storage.from('club-albums').getPublicUrl(storagePath)
    return urlData.publicUrl
  }

  const handleCreateImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (form.image_urls.length >= 4) { setFormError('최대 4장까지 업로드할 수 있어요.'); return }
    setFormError(null)
    setUploadingCreate(true)
    const url = await uploadImage(file)
    if (!url) { setFormError('이미지 업로드에 실패했어요.'); setUploadingCreate(false); return }
    setForm(f => ({ ...f, image_urls: [...f.image_urls, url] }))
    setUploadingCreate(false)
  }

  const handleEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (editForm.image_urls.length >= 4) { setEditError('최대 4장까지 업로드할 수 있어요.'); return }
    setEditError(null)
    setUploadingEdit(true)
    const url = await uploadImage(file)
    if (!url) { setEditError('이미지 업로드에 실패했어요.'); setUploadingEdit(false); return }
    setEditForm(f => ({ ...f, image_urls: [...f.image_urls, url] }))
    setUploadingEdit(false)
  }

  const load = useCallback(async () => {
    setIsLoading(true)
    if (isDemo) {
      setNotices(DEMO_NOTICES)
      setIsLoading(false)
      return
    }
    const rows = await getNoticesAction(clubId)
    setNotices(rows)
    setIsLoading(false)
    if (userStatus === 'member') {
      markNotificationsReadAction(clubId).then(onUnreadCleared)
    }
  }, [clubId, userStatus, onUnreadCleared, isDemo])

  useEffect(() => { load() }, [load])

  const handleCreate = () => {
    setFormError(null)
    // 데모 모드: DB 저장 없이 로컬 상태에 추가
    if (isDemo) {
      const newNotice: NoticeRow = {
        id: `demo-n-${Date.now()}`,
        club_id: clubId,
        author_member_id: 'm1',
        title: form.title.trim(),
        body: form.body.trim(),
        type: form.type,
        is_pinned: form.is_pinned,
        image_urls: form.image_urls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: '나 (체험)',
      }
      setNotices(prev => form.is_pinned ? [newNotice, ...prev] : [...prev, newNotice])
      setShowCreate(false)
      setForm({ title: '', body: '', type: 'announcement', is_pinned: false, image_urls: [] })
      return
    }
    if (!myMemberId) return
    startTransition(async () => {
      const result = await createNoticeAction(clubId, myMemberId, form)
      if (result.error) { setFormError(result.error); return }
      setShowCreate(false)
      setForm({ title: '', body: '', type: 'announcement', is_pinned: false, image_urls: [] })
      await load()
    })
  }

  const startEdit = (notice: NoticeRow) => {
    setEditingId(notice.id)
    setEditForm({ title: notice.title, body: notice.body, type: notice.type, is_pinned: notice.is_pinned, image_urls: notice.image_urls ?? [] })
    setEditError(null)
  }

  const handleUpdate = (noticeId: string) => {
    setEditError(null)
    // 데모 모드: 로컬 상태만 수정
    if (isDemo) {
      setNotices(prev => prev.map(n => n.id === noticeId
        ? { ...n, title: editForm.title.trim(), body: editForm.body.trim(), type: editForm.type, is_pinned: editForm.is_pinned, image_urls: editForm.image_urls, updated_at: new Date().toISOString() }
        : n
      ))
      setEditingId(null)
      return
    }
    startTransition(async () => {
      const result = await updateNoticeAction(clubId, noticeId, editForm)
      if (result.error) { setEditError(result.error); return }
      setEditingId(null)
      await load()
    })
  }

  const handleDelete = (noticeId: string) => {
    if (isDemo) {
      setNotices(prev => prev.filter(n => n.id !== noticeId))
      return
    }
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

          {/* 이미지 업로드 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#555]">
                이미지 <span className="text-[#bbb] font-normal">({form.image_urls.length}/4) · 첫 번째가 썸네일</span>
              </label>
              <button type="button" onClick={() => createFileRef.current?.click()} disabled={uploadingCreate || form.image_urls.length >= 4}
                className="flex items-center gap-1 text-xs font-semibold text-[#555] hover:text-[#111] disabled:opacity-40 transition-colors">
                <ImagePlus size={13} />{uploadingCreate ? '업로드 중...' : '사진 추가'}
              </button>
              <input ref={createFileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleCreateImage} className="hidden" />
            </div>
            {form.image_urls.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {form.image_urls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#f0f0f0] border border-[#e5e5e5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`이미지 ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#beff00] text-[#111]">썸네일</span>
                    )}
                    <button type="button" onClick={() => setForm(f => ({ ...f, image_urls: f.image_urls.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                <div className="flex items-start gap-3">
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
                  {/* 썸네일 (첫 번째 이미지) */}
                  {!isExpanded && notice.image_urls && notice.image_urls.length > 0 && (
                    <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-[#f0f0f0] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={notice.image_urls[0]} alt="" className="w-full h-full object-cover" />
                      {notice.image_urls.length > 1 && (
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold px-1 py-0.5 rounded-full bg-black/60 text-white">+{notice.image_urls.length - 1}</span>
                      )}
                    </div>
                  )}
                  <span className="text-[#ccc] mt-0.5 shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>
              </button>

              {/* 펼쳐진 본문 */}
              {isExpanded && !isEditing && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-[#555] leading-relaxed whitespace-pre-line">{notice.body}</p>
                  {notice.image_urls && notice.image_urls.length > 0 && (
                    <div className={`mt-3 grid gap-2 ${notice.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {notice.image_urls.map((url, i) => (
                        <div key={i} className="rounded-xl overflow-hidden bg-[#f0f0f0]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`첨부 이미지 ${i + 1}`} className="w-full h-auto object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
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

                  {/* 이미지 업로드 (수정) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#555]">
                        이미지 <span className="text-[#bbb] font-normal">({editForm.image_urls.length}/4) · 첫 번째가 썸네일</span>
                      </label>
                      <button type="button" onClick={() => editFileRef.current?.click()} disabled={uploadingEdit || editForm.image_urls.length >= 4}
                        className="flex items-center gap-1 text-xs font-semibold text-[#555] hover:text-[#111] disabled:opacity-40 transition-colors">
                        <ImagePlus size={13} />{uploadingEdit ? '업로드 중...' : '사진 추가'}
                      </button>
                      <input ref={editFileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleEditImage} className="hidden" />
                    </div>
                    {editForm.image_urls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {editForm.image_urls.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#f0f0f0] border border-[#e5e5e5]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`이미지 ${i + 1}`} className="w-full h-full object-cover" />
                            {i === 0 && (
                              <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#beff00] text-[#111]">썸네일</span>
                            )}
                            <button type="button" onClick={() => setEditForm(f => ({ ...f, image_urls: f.image_urls.filter((_, idx) => idx !== i) }))}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
