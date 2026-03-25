'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GuideEditor from '@/components/guide/GuideEditor'
import { createGuide } from '../actions'

function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function NewGuidePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManual) {
      setSlug(generateSlug(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true)
    setSlug(value)
  }

  async function handleSave(published: boolean) {
    if (!title.trim()) {
      alert('제목을 입력하세요.')
      return
    }
    if (!slug.trim()) {
      alert('슬러그를 입력하세요.')
      return
    }
    setSaving(true)
    const result = await createGuide({
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      cover_image: coverImage.trim(),
      published,
    })
    setSaving(false)
    if (result.success) {
      router.push('/admin/guide')
    } else {
      alert(`저장 실패: ${result.error}`)
    }
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/guide"
          className="text-[#999999] hover:text-[#111111] transition-colors"
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold text-[#111111]">새 가이드 작성</h1>
      </div>

      <div className="space-y-5">
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
          <label className="block text-xs font-bold text-[#555555] mb-1.5">슬러그</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="url-slug"
            className="w-full px-4 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-[#111111] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#beff00] transition-colors font-mono"
          />
          <p className="text-[10px] text-[#999999] mt-1">
            URL: /guide/{slug || '...'}
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold text-[#555555] mb-1.5">요약</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="독자에게 보여줄 한 줄 요약"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-[#111111] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#beff00] transition-colors resize-none"
          />
        </div>

        {/* Cover image URL */}
        <div>
          <label className="block text-xs font-bold text-[#555555] mb-1.5">커버 이미지 URL</label>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-[#111111] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#beff00] transition-colors"
          />
        </div>

        {/* Editor */}
        <div>
          <label className="block text-xs font-bold text-[#555555] mb-1.5">내용</label>
          <GuideEditor content={content} onChange={setContent} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#e5e5e5]">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl border border-[#e5e5e5] text-[#555555] font-bold text-sm hover:bg-[#f0f0f0] transition-colors disabled:opacity-50"
        >
          임시저장
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#beff00] text-black font-bold text-sm hover:bg-[#a8e600] transition-colors disabled:opacity-50"
        >
          발행하기
        </button>
      </div>
    </div>
  )
}
