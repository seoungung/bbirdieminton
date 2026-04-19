'use client'

import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import { Plus, X, Trash2, Camera, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { AlbumPhotoRow } from '@/app/club/[clubId]/album/actions'
import {
  getAlbumPhotosAction,
  recordAlbumPhotoAction,
  deleteAlbumPhotoAction,
} from '@/app/club/[clubId]/album/actions'
import type { UserStatus } from './types'

interface Props {
  clubId: string
  userStatus: UserStatus
  isManager: boolean
  myMemberId?: string | null
}

export function AlbumTab({ clubId, userStatus, isManager, myMemberId }: Props) {
  const canUpload = userStatus === 'member'
  const [photos, setPhotos] = useState<AlbumPhotoRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await getAlbumPhotosAction(clubId)
    setPhotos(data)
    setIsLoading(false)
  }, [clubId])

  useEffect(() => { load() }, [load])

  const handleDelete = useCallback(async (photo: AlbumPhotoRow) => {
    if (!window.confirm('이 사진을 삭제할까요?')) return
    const result = await deleteAlbumPhotoAction(clubId, photo.id, photo.storage_path)
    if (result.error) { setError(result.error); return }
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    if (lightboxIdx !== null) setLightboxIdx(null)
  }, [clubId, lightboxIdx])

  const canDeletePhoto = (photo: AlbumPhotoRow) =>
    isManager || photo.uploader_member_db_id === myMemberId

  if (showUpload) {
    return (
      <UploadForm
        clubId={clubId}
        myMemberId={myMemberId}
        onClose={() => setShowUpload(false)}
        onUploaded={() => { setShowUpload(false); load() }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl">
          <AlertCircle size={14} className="shrink-0" />{error}
        </div>
      )}

      {/* 업로드 버튼 */}
      {canUpload && (
        <button
          onClick={() => setShowUpload(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#e5e5e5] rounded-2xl text-sm font-semibold text-[#aaa] hover:border-[#beff00] hover:text-[#555] transition-colors"
        >
          <Camera size={16} />
          사진 업로드
        </button>
      )}

      {/* 사진 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square bg-[#f0f0f0] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-14 text-[#ccc]">
          <p className="text-5xl mb-3">📷</p>
          <p className="text-sm font-semibold">아직 업로드된 사진이 없어요</p>
          {canUpload && <p className="text-xs mt-1.5">첫 번째 사진을 올려보세요!</p>}
        </div>
      ) : (
        <>
          <p className="text-xs text-[#bbb] px-1">총 {photos.length}장</p>
          <div className="grid grid-cols-3 gap-1.5">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer bg-[#f0f0f0]"
                onClick={() => setLightboxIdx(idx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.public_url}
                  alt={photo.caption ?? '앨범 사진'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {/* 삭제 버튼 */}
                {canDeletePhoto(photo) && (
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(photo) }}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 라이트박스 */}
      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          initialIdx={lightboxIdx}
          myMemberId={myMemberId}
          isManager={isManager}
          onClose={() => setLightboxIdx(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

// ── 라이트박스 ─────────────────────────────────────────────
function Lightbox({
  photos,
  initialIdx,
  myMemberId,
  isManager,
  onClose,
  onDelete,
}: {
  photos: AlbumPhotoRow[]
  initialIdx: number
  myMemberId?: string | null
  isManager: boolean
  onClose: () => void
  onDelete: (photo: AlbumPhotoRow) => void
}) {
  const [idx, setIdx] = useState(initialIdx)
  const photo = photos[idx]

  const canDelete = isManager || photo.uploader_member_db_id === myMemberId

  const prev = () => setIdx(i => (i > 0 ? i - 1 : photos.length - 1))
  const next = () => setIdx(i => (i < photos.length - 1 ? i + 1 : 0))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X size={22} />
        </button>
        <span className="text-white/60 text-sm">{idx + 1} / {photos.length}</span>
        {canDelete ? (
          <button
            onClick={() => onDelete(photo)}
            className="text-white/70 hover:text-red-400 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        ) : <div className="w-6" />}
      </div>

      {/* 이미지 영역 */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.public_url}
          alt={photo.caption ?? '사진'}
          className="max-h-full max-w-full object-contain rounded-lg select-none"
        />
        {/* 이전/다음 */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* 하단 메타 */}
      <div className="px-5 py-4 shrink-0">
        {photo.caption && (
          <p className="text-white text-sm font-semibold mb-1">{photo.caption}</p>
        )}
        <p className="text-white/40 text-xs">
          {photo.uploader_name && `${photo.uploader_name} · `}
          {new Date(photo.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

// ── 업로드 폼 ──────────────────────────────────────────────
function UploadForm({
  clubId,
  myMemberId,
  onClose,
  onUploaded,
}: {
  clubId: string
  myMemberId?: string | null
  onClose: () => void
  onUploaded: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('10MB 이하의 파일만 업로드할 수 있어요.')
      return
    }
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleUpload = async () => {
    if (!selectedFile || !myMemberId) return
    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const ext = selectedFile.name.split('.').pop() ?? 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const storagePath = `${clubId}/${myMemberId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('club-albums')
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setError('업로드에 실패했습니다. 다시 시도해주세요.')
        setUploading(false)
        return
      }

      startTransition(async () => {
        const result = await recordAlbumPhotoAction(clubId, storagePath, caption)
        if (result.error) {
          // DB 기록 실패 시 storage에서도 제거
          await supabase.storage.from('club-albums').remove([storagePath])
          setError(result.error)
          setUploading(false)
          return
        }
        onUploaded()
      })
    } catch {
      setError('업로드 중 오류가 발생했어요.')
      setUploading(false)
    }
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
          앨범으로
        </button>
        <h2 className="text-sm font-bold text-[#111]">사진 업로드</h2>
        <div className="w-20" />
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 text-xs rounded-xl">
            <AlertCircle size={13} className="shrink-0" />{error}
          </div>
        )}

        {/* 파일 선택 영역 */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${
            preview ? 'border-[#beff00]' : 'border-[#e5e5e5] hover:border-[#beff00]'
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="미리보기" className="w-full max-h-[280px] object-contain bg-[#f8f8f8]" />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[#ccc]">
              <Plus size={32} className="mb-2" />
              <p className="text-sm font-semibold">사진을 선택해주세요</p>
              <p className="text-xs mt-1">JPG, PNG, WebP · 최대 10MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 캡션 */}
        {selectedFile && (
          <input
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="사진 설명 (선택)"
            maxLength={100}
            className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-sm text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#beff00] transition-colors"
          />
        )}

        {/* 업로드 버튼 */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full py-3 bg-[#beff00] text-[#111] font-bold text-sm rounded-xl hover:brightness-95 active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-[#111]/30 border-t-[#111] animate-spin" />
              업로드 중...
            </>
          ) : (
            <>
              <Camera size={15} />
              업로드하기
            </>
          )}
        </button>
      </div>
    </div>
  )
}
