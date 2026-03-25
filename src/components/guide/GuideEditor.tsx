'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExt from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import ImageExt from '@tiptap/extension-image'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Youtube } from '@tiptap/extension-youtube'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { useCallback, useRef } from 'react'
import { uploadGuideImage } from '@/app/admin/guide/actions'
import './guide-editor.css'

interface GuideEditorProps {
  content: string
  onChange: (html: string) => void
}

function Divider() {
  return <span className="w-px h-5 bg-[#e5e5e5] mx-0.5 self-center shrink-0" />
}

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-[#beff00] text-black' : 'text-[#555555] hover:bg-[#f0f0f0]'
      }`}
    >
      {children}
    </button>
  )
}

export default function GuideEditor({ content, onChange }: GuideEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      LinkExt.configure({ openOnClick: false }),
      ImageExt.configure({ HTMLAttributes: { class: 'rounded-xl max-w-full' } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Youtube.configure({ nocookie: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: '내용을 입력하세요...' }),
    ],
    content,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[400px] px-5 py-4 focus:outline-none',
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('링크 URL', prev ?? 'https://')
    if (url === null) return
    if (!url) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const insertYoutube = useCallback(() => {
    if (!editor) return
    const url = window.prompt('유튜브 URL을 입력하세요')
    if (!url) return
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }, [editor])

  const insertTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const handleImageFile = useCallback(async (file: File) => {
    if (!editor) return
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadGuideImage(fd)
    if (result.url) {
      editor.chain().focus().setImage({ src: result.url }).run()
    } else {
      alert(`이미지 업로드 실패: ${result.error}`)
    }
  }, [editor])

  if (!editor) return null

  const isTable = editor.isActive('table')

  return (
    <div className="border border-[#e5e5e5] rounded-xl bg-white overflow-hidden">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageFile(file)
          e.target.value = ''
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[#e5e5e5] bg-[#f8f8f8]">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="굵게">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="기울임">
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="밑줄">
          <span className="underline">U</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="취소선">
          <span className="line-through">S</span>
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="제목 2">H2</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="제목 3">H3</Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="왼쪽 정렬">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="가운데 정렬">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4.75A.75.75 0 014.75 4h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 4.75zm2 5.25a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 10zm-2 4.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75a.75.75 0 01-.75-.75z" clipRule="evenodd"/></svg>
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="불릿 목록">
          • 목록
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="번호 목록">
          1. 목록
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="인용구">❝</Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="코드 블록">{'</>'}</Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="구분선">—</Btn>
        <Btn onClick={setLink} active={editor.isActive('link')} title="링크">🔗 링크</Btn>

        <Divider />

        <Btn onClick={() => imageInputRef.current?.click()} active={false} title="이미지 업로드">
          🖼 이미지
        </Btn>
        <Btn onClick={insertYoutube} active={false} title="유튜브 삽입">
          ▶ 유튜브
        </Btn>

        <Divider />

        <Btn onClick={insertTable} active={false} title="표 삽입">⊞ 표</Btn>
        {isTable && (
          <>
            <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} active={false} title="열 추가 (오른쪽)">+열</Btn>
            <Btn onClick={() => editor.chain().focus().deleteColumn().run()} active={false} title="열 삭제">-열</Btn>
            <Btn onClick={() => editor.chain().focus().addRowAfter().run()} active={false} title="행 추가 (아래)">+행</Btn>
            <Btn onClick={() => editor.chain().focus().deleteRow().run()} active={false} title="행 삭제">-행</Btn>
            <Btn onClick={() => editor.chain().focus().deleteTable().run()} active={false} title="표 삭제">표삭제</Btn>
          </>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
