'use server'

import { createClient } from '@/lib/supabase/server'
import { getClubUserId } from '@/lib/club/auth'
import { revalidatePath } from 'next/cache'

export type PostCategory = 'free' | 'question' | 'review' | 'marketplace'

export interface PostRow {
  id: string
  club_id: string
  author_member_id: string | null
  category: PostCategory
  title: string
  body: string
  image_urls: string[]
  is_pinned: boolean
  view_count: number
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  author_name?: string | null
  author_id?: string | null
  is_liked?: boolean
}

export interface CommentRow {
  id: string
  post_id: string
  author_member_id: string | null
  parent_id: string | null
  body: string
  created_at: string
  author_name?: string | null
  author_id?: string | null
  replies?: CommentRow[]
}

// ── 게시글 목록 ────────────────────────────────────────────
export async function getPostsAction(
  clubId: string,
  category?: PostCategory | 'all',
): Promise<PostRow[]> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)

  // 내 멤버 ID 조회 (좋아요 여부 확인용)
  let myMemberId: string | null = null
  if (clubUserId) {
    const { data: m } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', clubUserId)
      .single()
    myMemberId = m?.id ?? null
  }

  let query = supabase
    .from('posts')
    .select(`
      id, club_id, author_member_id, category, title, body,
      image_urls, is_pinned, view_count, like_count, comment_count,
      created_at, updated_at,
      author:author_member_id (
        id,
        user:user_id ( name )
      )
    `)
    .eq('club_id', clubId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) return []

  // 내가 좋아요한 게시글 IDs
  let likedIds = new Set<string>()
  if (myMemberId && data && data.length > 0) {
    const postIds = data.map((r: { id: string }) => r.id)
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('member_id', myMemberId)
      .in('post_id', postIds)
    if (likes) likedIds = new Set(likes.map((l: { post_id: string }) => l.post_id))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    club_id: row.club_id,
    author_member_id: row.author_member_id,
    category: row.category as PostCategory,
    title: row.title,
    body: row.body,
    image_urls: row.image_urls ?? [],
    is_pinned: row.is_pinned,
    view_count: row.view_count,
    like_count: row.like_count,
    comment_count: row.comment_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_name: row.author?.user?.name ?? null,
    author_id: row.author?.id ?? null,
    is_liked: likedIds.has(row.id),
  }))
}

// ── 게시글 상세 (view_count +1) ────────────────────────────
export async function getPostDetailAction(
  clubId: string,
  postId: string,
): Promise<PostRow | null> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)

  // view_count 증가 (fire-and-forget, raw SQL via rpc)
  supabase
    .rpc('increment_post_view_count', { p_id: postId })
    .then(() => {})

  let myMemberId: string | null = null
  if (clubUserId) {
    const { data: m } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', clubUserId)
      .single()
    myMemberId = m?.id ?? null
  }

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, club_id, author_member_id, category, title, body,
      image_urls, is_pinned, view_count, like_count, comment_count,
      created_at, updated_at,
      author:author_member_id (
        id,
        user:user_id ( name )
      )
    `)
    .eq('id', postId)
    .eq('club_id', clubId)
    .single()

  if (error || !data) return null

  let isLiked = false
  if (myMemberId) {
    const { data: like } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('member_id', myMemberId)
      .maybeSingle()
    isLiked = !!like
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any
  return {
    id: row.id,
    club_id: row.club_id,
    author_member_id: row.author_member_id,
    category: row.category as PostCategory,
    title: row.title,
    body: row.body,
    image_urls: row.image_urls ?? [],
    is_pinned: row.is_pinned,
    view_count: row.view_count,
    like_count: row.like_count,
    comment_count: row.comment_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_name: row.author?.user?.name ?? null,
    author_id: row.author?.id ?? null,
    is_liked: isLiked,
  }
}

// ── 게시글 작성 ────────────────────────────────────────────
export async function createPostAction(
  clubId: string,
  data: {
    category: PostCategory
    title: string
    body: string
    is_pinned?: boolean
  },
): Promise<{ success?: true; postId?: string; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id, role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership) return { error: '모임 멤버만 게시글을 작성할 수 있습니다.' }

  // 고정글은 운영진만
  if (data.is_pinned && !['owner', 'manager'].includes(membership.role)) {
    return { error: '운영진만 게시글을 고정할 수 있습니다.' }
  }

  if (!data.title.trim()) return { error: '제목을 입력해주세요.' }
  if (!data.body.trim()) return { error: '내용을 입력해주세요.' }

  const { data: inserted, error } = await supabase
    .from('posts')
    .insert({
      club_id: clubId,
      author_member_id: membership.id,
      category: data.category,
      title: data.title.trim(),
      body: data.body.trim(),
      is_pinned: data.is_pinned ?? false,
    })
    .select('id')
    .single()

  if (error) return { error: '게시글 등록에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true, postId: inserted.id }
}

// ── 게시글 수정 ────────────────────────────────────────────
export async function updatePostAction(
  clubId: string,
  postId: string,
  data: {
    category: PostCategory
    title: string
    body: string
    is_pinned?: boolean
  },
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id, role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership) return { error: '권한이 없습니다.' }

  const isManager = ['owner', 'manager'].includes(membership.role)

  // 본인 글 or 운영진만 수정 가능
  const { data: post } = await supabase
    .from('posts')
    .select('author_member_id')
    .eq('id', postId)
    .eq('club_id', clubId)
    .single()

  if (!post) return { error: '게시글을 찾을 수 없습니다.' }
  if (post.author_member_id !== membership.id && !isManager) {
    return { error: '본인이 작성한 게시글만 수정할 수 있습니다.' }
  }

  if (!data.title.trim()) return { error: '제목을 입력해주세요.' }
  if (!data.body.trim()) return { error: '내용을 입력해주세요.' }

  const { error } = await supabase
    .from('posts')
    .update({
      category: data.category,
      title: data.title.trim(),
      body: data.body.trim(),
      is_pinned: isManager ? (data.is_pinned ?? false) : undefined,
    })
    .eq('id', postId)
    .eq('club_id', clubId)

  if (error) return { error: '게시글 수정에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}

// ── 게시글 삭제 ────────────────────────────────────────────
export async function deletePostAction(
  clubId: string,
  postId: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id, role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership) return { error: '권한이 없습니다.' }

  const isManager = ['owner', 'manager'].includes(membership.role)

  const { data: post } = await supabase
    .from('posts')
    .select('author_member_id')
    .eq('id', postId)
    .eq('club_id', clubId)
    .single()

  if (!post) return { error: '게시글을 찾을 수 없습니다.' }
  if (post.author_member_id !== membership.id && !isManager) {
    return { error: '본인이 작성한 게시글만 삭제할 수 있습니다.' }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('club_id', clubId)

  if (error) return { error: '게시글 삭제에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}

// ── 좋아요 토글 ────────────────────────────────────────────
export async function toggleLikeAction(
  clubId: string,
  postId: string,
): Promise<{ liked: boolean; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { liked: false, error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership) return { liked: false, error: '모임 멤버만 좋아요를 누를 수 있습니다.' }

  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('member_id', membership.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id)
    return { liked: false }
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, member_id: membership.id })
    return { liked: true }
  }
}

// ── 댓글 목록 ──────────────────────────────────────────────
export async function getCommentsAction(
  clubId: string,
  postId: string,
): Promise<CommentRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      id, post_id, author_member_id, parent_id, body, created_at,
      author:author_member_id (
        id,
        user:user_id ( name )
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all: CommentRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    post_id: row.post_id,
    author_member_id: row.author_member_id,
    parent_id: row.parent_id,
    body: row.body,
    created_at: row.created_at,
    author_name: row.author?.user?.name ?? null,
    author_id: row.author?.id ?? null,
    replies: [],
  }))

  // 2단계 트리 구성 — 루트 댓글 + 대댓글
  const roots: CommentRow[] = []
  const map = new Map<string, CommentRow>()
  all.forEach(c => map.set(c.id, c))
  all.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(c)
    } else {
      roots.push(c)
    }
  })
  return roots
}

// ── 댓글 작성 ──────────────────────────────────────────────
export async function addCommentAction(
  clubId: string,
  postId: string,
  body: string,
  parentId?: string | null,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership) return { error: '모임 멤버만 댓글을 작성할 수 있습니다.' }
  if (!body.trim()) return { error: '댓글 내용을 입력해주세요.' }

  const { error } = await supabase.from('post_comments').insert({
    post_id: postId,
    author_member_id: membership.id,
    parent_id: parentId ?? null,
    body: body.trim(),
  })

  if (error) return { error: '댓글 등록에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}

// ── 댓글 삭제 ──────────────────────────────────────────────
export async function deleteCommentAction(
  clubId: string,
  postId: string,
  commentId: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const clubUserId = await getClubUserId(supabase)
  if (!clubUserId) return { error: '로그인이 필요합니다.' }

  const { data: membership } = await supabase
    .from('club_members')
    .select('id, role')
    .eq('club_id', clubId)
    .eq('user_id', clubUserId)
    .single()

  if (!membership) return { error: '권한이 없습니다.' }

  const isManager = ['owner', 'manager'].includes(membership.role)

  const { data: comment } = await supabase
    .from('post_comments')
    .select('author_member_id')
    .eq('id', commentId)
    .eq('post_id', postId)
    .single()

  if (!comment) return { error: '댓글을 찾을 수 없습니다.' }
  if (comment.author_member_id !== membership.id && !isManager) {
    return { error: '본인이 작성한 댓글만 삭제할 수 있습니다.' }
  }

  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId)
    .eq('post_id', postId)

  if (error) return { error: '댓글 삭제에 실패했습니다.' }

  revalidatePath(`/club/${clubId}/view`)
  return { success: true }
}
