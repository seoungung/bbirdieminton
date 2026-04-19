'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// TipTap 패키지 (~11개) 코드스플리팅 — 에디터 진입 전까지 번들 제외
const GuideEditor = dynamic(() => import('@/components/guide/GuideEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-64 border border-[#e5e5e5] rounded-xl bg-[#f8f8f8] flex items-center justify-center text-sm text-[#999]">
      에디터 로딩 중...
    </div>
  ),
})
import SeoPanel from '@/components/guide/SeoPanel'
import { createGuide, uploadGuideImage } from '../actions'

function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function NewGuidePage() {
  const router = useRouter()
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [content, setContent] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')
  const [publishMode, setPublishMode] = useState<'draft' | 'scheduled' | 'publish'>('draft')
  const [publishAt, setPublishAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManual) setSlug(generateSlug(value))
  }

  async function handleCoverFile(file: File) {
    setCoverUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadGuideImage(fd)
    setCoverUploading(false)
    if (result.url) {
      setCoverImage(result.url)
      setCoverPreview(result.url)
    } else {
      alert(`커버 이미지 업로드 실패: ${result.error}`)
    }
  }

  async function handleSave() {
    if (!title.trim()) { alert('제목을 입력하세요.'); return }
    if (!slug.trim()) { alert('슬러그를 입력하세요.'); return }
    if (publishMode === 'scheduled' && !publishAt) { alert('예약 발행 날짜를 입력하세요.'); return }
    setSaving(true)
    const result = await createGuide({
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      cover_image: coverImage,
      published: publishMode === 'publish',
      publish_at: publishMode === 'scheduled' ? new Date(publishAt).toISOString() : null,
    })
    setSaving(false)
    if (result.success) router.push('/admin/guide')
    else alert(`저장 실패: ${result.error}`)
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/guide" className="text-[#999999] hover:text-[#111111] transition-colors">
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold text-[#111111]">새 가이드 작성</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 min-w-0 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#555555] mb-1.5">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="가이드 제목을 입력하세요"
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[#111111] text-lg font-bold placeholder:text-[#999999] focus:outline-none focus:border-[#beff00] transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-[#555555] mb-1.5">슬러그 (영문/숫자/하이픈)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlugManual(true); setSlug(e.target.value) }}
              placeholder="url-slug-here"
              className="w-full px-4 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-[#111111] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#beff00] transition-colors font-mono"
            />
            <p className="text-[10px] text-[#999999] mt-1">URL: /guide/{slug || '...'}</p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold text-[#555555] mb-1.5">요약 (메타 설명)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="독자에게 보여줄 한 줄 요약 (50~160자 권장)"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-[#111111] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#beff00] transition-colors resize-none"
            />
            <p className="text-[10px] text-[#999999] mt-1">{excerpt.length}자</p>
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-xs font-bold text-[#555555] mb-1.5">커버 이미지</label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleCoverFile(file)
                e.target.value = ''
              }}
            />
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-[#e5e5e5] aspect-[16/9] bg-[#f8f8f8]">
                <Image src={coverPreview} alt="커버 이미지 미리보기" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => { setCoverImage(''); setCoverPreview('') }}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80 transition-colors"
                >
                  제거
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="w-full h-32 rounded-xl border-2 border-dashed border-[#e5e5e5] bg-[#f8f8f8] text-[#999999] text-sm font-medium hover:border-[#beff00] hover:text-[#111111] transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-1"
              >
                {coverUploading ? (
                  <><span className="animate-spin text-lg">⟳</span>업로드 중...</>
                ) : (
                  <><span className="text-xl">🖼</span>클릭해서 커버 이미지 업로드</>
                )}
              </button>
            )}
          </div>

          {/* Editor */}
          <div>
            <label className="block text-xs font-bold text-[#555555] mb-1.5">내용</label>
            <GuideEditor content={content} onChange={setContent} />
          </div>

          {/* Publish settings */}
          <div className="pt-6 border-t border-[#e5e5e5]">
            <label className="block text-xs font-bold text-[#555555] mb-2">발행 설정</label>
            <div className="flex gap-2 mb-3">
              {(['draft', 'scheduled', 'publish'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPublishMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    publishMode === mode
                      ? 'bg-[#111] text-[#beff00]'
                      : 'bg-[#f0f0f0] text-[#555]'
                  }`}
                >
                  {mode === 'draft' ? '임시저장' : mode === 'scheduled' ? '예약 발행' : '즉시 발행'}
                </button>
              ))}
            </div>
            {publishMode === 'scheduled' && (
              <input
                type="datetime-local"
                value={publishAt}
                onChange={e => setPublishAt(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#f8f8f8] border border-[#e5e5e5] text-sm text-[#111] outline-none focus:border-[#beff00] mb-3"
              />
            )}
            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-[#beff00] text-black font-bold text-sm hover:bg-[#a8e600] transition-colors disabled:opacity-50">
                {saving ? '저장 중...' : publishMode === 'draft' ? '임시저장' : publishMode === 'scheduled' ? '예약 저장' : '발행하기'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 lg:sticky lg:top-6">
          <SeoPanel title={title} slug={slug} excerpt={excerpt} content={content} focusKeyword={focusKeyword} onFocusKeywordChange={setFocusKeyword} />
        </div>
      </div>
    </div>
  )
}
