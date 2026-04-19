'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import {
  Plus, X, Trash2, Heart, MessageCircle, Eye, Pin,
  ChevronLeft, AlertCircle, CornerDownRight, Pencil, Send,
} from 'lucide-react'
import type { PostCategory, PostRow, CommentRow } from '@/app/club/[clubId]/board/actions'
import {
  getPostsAction,
  getPostDetailAction,
  createPostAction,
  updatePostAction,
  deletePostAction,
  toggleLikeAction,
  getCommentsAction,
  addCommentAction,
  deleteCommentAction,
} from '@/app/club/[clubId]/board/actions'
import type { UserStatus } from './types'

// ── 상수 ─────────────────────────────────────────────────────
const CATEGORIES: { key: PostCategory | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'free', label: '자유' },
  { key: 'question', label: '질문' },
  { key: 'review', label: '후기' },
  { key: 'marketplace', label: '장터' },
]

const CAT_COLOR: Record<PostCategory, string> = {
  free: 'bg-blue-50 text-blue-500 border-blue-100',
  question: 'bg-purple-50 text-purple-500 border-purple-100',
  review: 'bg-green-50 text-green-500 border-green-100',
  marketplace: 'bg-amber-50 text-amber-600 border-amber-100',
}
const CAT_LABEL: Record<PostCategory, string> = {
  free: '자유',
  question: '질문',
  review: '후기',
  marketplace: '장터',
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

// ── Props ─────────────────────────────────────────────────────
interface Props {
  clubId: string
  userStatus: UserStatus
  isManager: boolean
  myMemberId?: string | null
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export function BoardTab({ clubId, userStatus, isManager, myMemberId }: Props) {
  const canWrite = userStatus === 'member' || userStatus === 'demo'

  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all')
  const [posts, setPosts] = useState<PostRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 상세 뷰
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // 작성/수정 모달
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<PostRow | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const data = await getPostsAction(clubId, activeCategory)
    setPosts(data)
    setIsLoading(false)
  }, [clubId, activeCategory])

  useEffect(() => { load() }, [load])

  const openDetail = useCallback(async (postId: string) => {
    setDetailLoading(true)
    const post = await getPostDetailAction(clubId, postId)
    setSelectedPost(post)
    setDetailLoading(false)
  }, [clubId])

  const handleLike = useCallback(async (postId: string) => {
    if (!canWrite) return
    const result = await toggleLikeAction(clubId, postId)
    if (result.error) return
    // 낙관적 업데이트
    const updatePost = (p: PostRow) => {
      if (p.id !== postId) return p
      return {
        ...p,
        is_liked: result.liked,
        like_count: p.like_count + (result.liked ? 1 : -1),
      }
    }
    setPosts(prev => prev.map(updatePost))
    if (selectedPost?.id === postId) setSelectedPost(prev => prev ? updatePost(prev) : null)
  }, [clubId, canWrite, selectedPost])

  const handleDelete = useCallback(async (postId: string) => {
    if (!window.confirm('게시글을 삭제할까요?')) return
    const result = await deletePostAction(clubId, postId)
    if (result.error) { setError(result.error); return }
    setPosts(prev => prev.filter(p => p.id !== postId))
    if (selectedPost?.id === postId) setSelectedPost(null)
  }, [clubId, selectedPost])

  // ── 목록 화면 ────────────────────────────────────────────────
  if (detailLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-[#e5e5e5] p-4 animate-pulse">
            <div className="h-4 bg-[#f0f0f0] rounded w-1/4 mb-2" />
            <div className="h-5 bg-[#f0f0f0] rounded w-3/4 mb-3" />
            <div className="h-3 bg-[#f0f0f0] rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  // ── 상세 뷰 ──────────────────────────────────────────────────
  if (selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        clubId={clubId}
        myMemberId={myMemberId}
        isManager={isManager}
        canWrite={canWrite}
        onBack={() => { setSelectedPost(null); load() }}
        onLike={handleLike}
        onDelete={handleDelete}
        onEdit={(post) => { setEditingPost(post); setShowForm(true); setSelectedPost(null) }}
      />
    )
  }

  // ── 작성/수정 모달 ───────────────────────────────────────────
  if (showForm) {
    return (
      <PostForm
        clubId={clubId}
        isManager={isManager}
        editingPost={editingPost}
        defaultCategory={activeCategory === 'all' ? 'free' : activeCategory}
        onClose={() => { setShowForm(false); setEditingPost(null) }}
        onSaved={() => { setShowForm(false); setEditingPost(null); load() }}
      />
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
          <AlertCircle size={14} className="shrink-0" />{error}
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-none px-3.5 py-1.5 text-xs font-bold rounded-full border transition-colors whitespace-nowrap ${
              activeCategory === cat.key
                ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                : 'bg-white border-[#e5e5e5] text-[#777] hover:border-[#beff00]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 글쓰기 버튼 */}
      {canWrite && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#e5e5e5] rounded-2xl text-sm font-semibold text-[#aaa] hover:border-[#beff00] hover:text-[#555] transition-colors"
        >
          <Plus size={16} />
          글 작성하기
        </button>
      )}

      {/* 게시글 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[#e5e5e5] p-4 animate-pulse">
              <div className="h-4 bg-[#f0f0f0] rounded w-1/4 mb-2" />
              <div className="h-5 bg-[#f0f0f0] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#f0f0f0] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-14 text-[#ccc]">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm font-semibold">아직 게시글이 없어요</p>
          {canWrite && <p className="text-xs mt-1.5">첫 번째 글을 작성해보세요!</p>}
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            myMemberId={myMemberId}
            isManager={isManager}
            canWrite={canWrite}
            onOpen={() => openDetail(post.id)}
            onLike={() => handleLike(post.id)}
            onDelete={() => handleDelete(post.id)}
          />
        ))
      )}
    </div>
  )
}

// ── 게시글 카드 ───────────────────────────────────────────────
function PostCard({
  post,
  myMemberId,
  isManager,
  canWrite,
  onOpen,
  onLike,
  onDelete,
}: {
  post: PostRow
  myMemberId?: string | null
  isManager: boolean
  canWrite: boolean
  onOpen: () => void
  onLike: () => void
  onDelete: () => void
}) {
  const canDelete = isManager || post.author_id === myMemberId

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-sm ${
        post.is_pinned ? 'border-[#beff00]/60' : 'border-[#e5e5e5]'
      }`}
      onClick={onOpen}
    >
      {post.is_pinned && (
        <div className="flex items-center gap-1 px-4 pt-3 pb-0">
          <Pin size={10} className="text-[#beff00] fill-current" />
          <span className="text-[10px] font-bold text-[#aaa]">상단 고정</span>
        </div>
      )}
      <div className="px-4 py-3.5">
        {/* 카테고리 + 날짜 */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${CAT_COLOR[post.category]}`}>
            {CAT_LABEL[post.category]}
          </span>
          <span className="text-[10px] text-[#bbb]">{formatRelativeDate(post.created_at)}</span>
          {post.author_name && <span className="text-[10px] text-[#bbb]">· {post.author_name}</span>}
        </div>
        {/* 제목 */}
        <p className="text-sm font-bold text-[#111] leading-snug mb-1 line-clamp-2">{post.title}</p>
        {/* 본문 미리보기 */}
        <p className="text-xs text-[#888] line-clamp-2 leading-relaxed mb-2.5">{post.body}</p>
        {/* 하단 액션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#bbb] text-xs">
            <span className="flex items-center gap-1">
              <Eye size={12} />{post.view_count}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onLike() }}
              className={`flex items-center gap-1 transition-colors ${
                post.is_liked ? 'text-red-400' : 'text-[#bbb] hover:text-red-300'
              } ${!canWrite ? 'pointer-events-none' : ''}`}
            >
              <Heart size={12} className={post.is_liked ? 'fill-current' : ''} />{post.like_count}
            </button>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} />{post.comment_count}
            </span>
          </div>
          {canDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="text-[#ddd] hover:text-red-400 transition-colors p-1"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 게시글 상세 ───────────────────────────────────────────────
function PostDetail({
  post: initialPost,
  clubId,
  myMemberId,
  isManager,
  canWrite,
  onBack,
  onLike,
  onDelete,
  onEdit,
}: {
  post: PostRow
  clubId: string
  myMemberId?: string | null
  isManager: boolean
  canWrite: boolean
  onBack: () => void
  onLike: (postId: string) => void
  onDelete: (postId: string) => void
  onEdit: (post: PostRow) => void
}) {
  const [post, setPost] = useState(initialPost)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [commentText, setCommentText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [commentError, setCommentError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const canDelete = isManager || post.author_id === myMemberId
  const canEdit = post.author_id === myMemberId || isManager

  const loadComments = useCallback(async () => {
    setCommentsLoading(true)
    const data = await getCommentsAction(clubId, post.id)
    setComments(data)
    setCommentsLoading(false)
  }, [clubId, post.id])

  useEffect(() => { loadComments() }, [loadComments])

  const handleLike = () => {
    onLike(post.id)
    setPost(p => ({
      ...p,
      is_liked: !p.is_liked,
      like_count: p.like_count + (p.is_liked ? -1 : 1),
    }))
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) return
    setCommentError(null)
    startTransition(async () => {
      const result = await addCommentAction(clubId, post.id, commentText, replyTo?.id)
      if (result.error) { setCommentError(result.error); return }
      setCommentText('')
      setReplyTo(null)
      setPost(p => ({ ...p, comment_count: p.comment_count + 1 }))
      await loadComments()
    })
  }

  const handleDeleteComment = (commentId: string) => {
    startTransition(async () => {
      const result = await deleteCommentAction(clubId, post.id, commentId)
      if (result.error) return
      setPost(p => ({ ...p, comment_count: Math.max(0, p.comment_count - 1) }))
      await loadComments()
    })
  }

  return (
    <div className="space-y-4">
      {/* 상단 뒤로가기 */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors text-sm"
      >
        <ChevronLeft size={18} />
        게시판으로
      </button>

      {/* 게시글 본문 */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          {/* 메타 */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${CAT_COLOR[post.category]}`}>
              {CAT_LABEL[post.category]}
            </span>
            {post.is_pinned && (
              <span className="flex items-center gap-0.5 text-[10px] text-[#aaa]">
                <Pin size={9} className="text-[#beff00] fill-current" />고정
              </span>
            )}
            <span className="text-[10px] text-[#bbb]">{formatRelativeDate(post.created_at)}</span>
            {post.author_name && <span className="text-[10px] text-[#bbb]">· {post.author_name}</span>}
          </div>
          {/* 제목 */}
          <h2 className="text-base font-extrabold text-[#111] leading-snug mb-3">{post.title}</h2>
          {/* 본문 */}
          <p className="text-sm text-[#444] leading-relaxed whitespace-pre-line">{post.body}</p>
        </div>

        {/* 액션 바 */}
        <div className="border-t border-[#f0f0f0] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[#bbb]">
            <span className="flex items-center gap-1"><Eye size={13} />{post.view_count}</span>
            <button
              onClick={handleLike}
              disabled={!canWrite}
              className={`flex items-center gap-1 transition-colors ${
                post.is_liked ? 'text-red-400' : 'text-[#bbb] hover:text-red-300'
              } disabled:pointer-events-none`}
            >
              <Heart size={13} className={post.is_liked ? 'fill-current' : ''} />{post.like_count}
            </button>
            <span className="flex items-center gap-1"><MessageCircle size={13} />{post.comment_count}</span>
          </div>
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-3">
              {canEdit && (
                <button
                  onClick={() => onEdit(post)}
                  className="flex items-center gap-1 text-xs text-[#bbb] hover:text-[#555] transition-colors"
                >
                  <Pencil size={13} />수정
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => onDelete(post.id)}
                  className="flex items-center gap-1 text-xs text-[#ccc] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />삭제
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 댓글 영역 */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f0f0f0]">
          <span className="text-sm font-bold text-[#111]">댓글 {post.comment_count}</span>
        </div>

        {commentsLoading ? (
          <div className="px-4 py-6 space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#f0f0f0] shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#f0f0f0] rounded w-1/4" />
                  <div className="h-4 bg-[#f0f0f0] rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#ccc] text-xs">
            아직 댓글이 없어요. 첫 댓글을 남겨보세요!
          </div>
        ) : (
          <div className="px-4 py-3 space-y-4">
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                myMemberId={myMemberId}
                isManager={isManager}
                canWrite={canWrite}
                onReply={(id, name) => {
                  setReplyTo({ id, name })
                  inputRef.current?.focus()
                }}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}

        {/* 댓글 입력 */}
        {canWrite && (
          <div className="border-t border-[#f0f0f0] px-4 py-3">
            {replyTo && (
              <div className="flex items-center justify-between mb-2 text-xs text-[#888] bg-[#f8f8f8] rounded-xl px-3 py-1.5">
                <span><CornerDownRight size={11} className="inline mr-1 text-[#bbb]" />@{replyTo.name} 에게 답글</span>
                <button onClick={() => setReplyTo(null)} className="text-[#bbb] hover:text-[#555]">
                  <X size={13} />
                </button>
              </div>
            )}
            {commentError && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 mb-2">
                <AlertCircle size={12} />{commentError}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment()
                  }
                }}
                placeholder="댓글을 입력하세요..."
                rows={1}
                maxLength={500}
                className="flex-1 border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors resize-none"
              />
              <button
                onClick={handleSubmitComment}
                disabled={isPending || !commentText.trim()}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#beff00] text-[#111] disabled:opacity-40 shrink-0 hover:brightness-95 transition-all"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 댓글 아이템 ───────────────────────────────────────────────
function CommentItem({
  comment,
  myMemberId,
  isManager,
  canWrite,
  onReply,
  onDelete,
  isReply = false,
}: {
  comment: CommentRow
  myMemberId?: string | null
  isManager: boolean
  canWrite: boolean
  onReply: (id: string, name: string) => void
  onDelete: (id: string) => void
  isReply?: boolean
}) {
  const canDeleteThis = isManager || comment.author_id === myMemberId

  return (
    <div className={isReply ? 'pl-6 mt-2' : ''}>
      <div className="flex gap-2.5">
        {/* 아바타 */}
        <div className={`rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0 text-[10px] font-bold text-[#888] ${isReply ? 'w-7 h-7' : 'w-8 h-8'}`}>
          {isReply && <CornerDownRight size={10} className="text-[#bbb]" />}
          {!isReply && (comment.author_name?.[0]?.toUpperCase() ?? '?')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-xs font-bold text-[#111]">{comment.author_name ?? '알 수 없음'}</span>
            <span className="text-[10px] text-[#bbb]">{formatRelativeDate(comment.created_at)}</span>
          </div>
          <p className="text-sm text-[#444] leading-relaxed whitespace-pre-line">{comment.body}</p>
          <div className="flex items-center gap-3 mt-1">
            {canWrite && !isReply && (
              <button
                onClick={() => onReply(comment.id, comment.author_name ?? '')}
                className="text-[10px] text-[#bbb] hover:text-[#555] transition-colors"
              >
                답글
              </button>
            )}
            {canDeleteThis && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-[10px] text-[#ccc] hover:text-red-400 transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>
      {/* 대댓글 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-3">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              myMemberId={myMemberId}
              isManager={isManager}
              canWrite={canWrite}
              onReply={onReply}
              onDelete={onDelete}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── 게시글 작성/수정 폼 ───────────────────────────────────────
function PostForm({
  clubId,
  isManager,
  editingPost,
  defaultCategory,
  onClose,
  onSaved,
}: {
  clubId: string
  isManager: boolean
  editingPost: PostRow | null
  defaultCategory: PostCategory
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    category: editingPost?.category ?? defaultCategory,
    title: editingPost?.title ?? '',
    body: editingPost?.body ?? '',
    is_pinned: editingPost?.is_pinned ?? false,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    setFormError(null)
    startTransition(async () => {
      const result = editingPost
        ? await updatePostAction(clubId, editingPost.id, form)
        : await createPostAction(clubId, form)
      if (result.error) { setFormError(result.error); return }
      onSaved()
    })
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-[#555] hover:text-[#111] transition-colors text-sm"
        >
          <ChevronLeft size={18} />
          게시판으로
        </button>
        <h2 className="text-sm font-bold text-[#111]">
          {editingPost ? '게시글 수정' : '새 글 작성'}
        </h2>
        <div className="w-20" />
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 space-y-3">
        {formError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 text-xs rounded-xl">
            <AlertCircle size={13} className="shrink-0" />{formError}
          </div>
        )}

        {/* 카테고리 */}
        <div className="flex gap-1.5">
          {(['free', 'question', 'review', 'marketplace'] as PostCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setForm(f => ({ ...f, category: cat }))}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                form.category === cat
                  ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white'
                  : 'bg-white border-[#e5e5e5] text-[#777] hover:border-[#beff00]'
              }`}
            >
              {CAT_LABEL[cat]}
            </button>
          ))}
        </div>

        {/* 제목 */}
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="제목을 입력해주세요"
          maxLength={80}
          className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
        />

        {/* 본문 */}
        <textarea
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          placeholder="내용을 입력해주세요"
          maxLength={3000}
          rows={8}
          className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors resize-none"
        />

        {/* 고정글 (운영진만) */}
        {isManager && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))}
              className="w-4 h-4 accent-[#beff00]"
            />
            <span className="text-xs font-semibold text-[#555]">
              <Pin size={12} className="inline mr-1 text-[#999]" />상단 고정
            </span>
          </label>
        )}

        {/* 제출 */}
        <button
          onClick={handleSubmit}
          disabled={isPending || !form.title.trim() || !form.body.trim()}
          className="w-full py-3 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 active:scale-[0.99] disabled:opacity-40 transition-all"
        >
          {isPending ? (editingPost ? '수정 중...' : '등록 중...') : (editingPost ? '수정하기' : '등록하기')}
        </button>
      </div>
    </div>
  )
}
