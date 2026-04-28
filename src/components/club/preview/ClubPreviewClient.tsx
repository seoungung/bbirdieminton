'use client'

import { useState, useTransition } from 'react'
import { Tag } from 'lucide-react'
import { BackButton } from '@/components/club/BackButton'
import { ClubCardImage } from '@/components/club/cards/ClubCardImage'
import { ClubPreviewCTA } from './ClubPreviewCTA'
import { ClubPreviewMeta } from './ClubPreviewMeta'
import {
  submitJoinRequestAction,
  cancelJoinRequestAction,
  type JoinRequestStatus,
} from '@/app/club/[clubId]/join-requests/actions'

export interface ClubPreviewClientProps {
  clubId: string
  name: string
  description: string | null
  location: string | null
  activityPlace: string | null
  category: string | null
  courtCount: number | null
  thumbnailColor: string
  thumbnailUrl: string | null
  ownerName: string | null
  memberCount: number
  isLoggedIn: boolean
  isMember: boolean
  myJoinStatus: JoinRequestStatus | null
}

export function ClubPreviewClient(props: ClubPreviewClientProps) {
  const {
    clubId,
    name,
    description,
    location,
    activityPlace,
    category,
    courtCount,
    thumbnailColor,
    thumbnailUrl,
    ownerName,
    memberCount,
    isLoggedIn,
    isMember,
    myJoinStatus: initialStatus,
  } = props

  const [status, setStatus] = useState<JoinRequestStatus | null>(initialStatus)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    setError(null)
    setFlash(null)
    startTransition(async () => {
      const result = await submitJoinRequestAction(clubId)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.alreadyMember) {
        // 멤버 row 가 있으면 바로 모임으로 진입
        window.location.href = `/club/${clubId}`
        return
      }
      setStatus('pending')
      setFlash('가입 신청을 보냈어요. 운영자 승인을 기다려주세요.')
    })
  }

  const handleCancel = () => {
    setError(null)
    setFlash(null)
    startTransition(async () => {
      const result = await cancelJoinRequestAction(clubId)
      if (result.error) {
        setError(result.error)
        return
      }
      setStatus(null)
      setFlash('신청을 취소했어요.')
    })
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* 헤더 */}
      <header className="bg-white border-b border-[#e5e5e5] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[720px] mx-auto flex items-center gap-3">
          <BackButton fallback="/club/home" />
          <h1 className="text-base font-bold text-[#111] truncate">{name}</h1>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-4 py-5 pb-24">
        {/* 썸네일 */}
        <div className="mb-5 rounded-2xl overflow-hidden border border-[#f0f0f0]">
          <ClubCardImage
            name={name}
            thumbnailUrl={thumbnailUrl}
            thumbnailColor={thumbnailColor}
          />
        </div>

        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="text-2xl font-extrabold text-[#111] leading-snug">
            {name}
          </h2>
          {category && (
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#555] bg-[#f0f0f0] px-2.5 py-1 rounded-full">
              <Tag size={11} strokeWidth={2.2} />
              {category}
            </span>
          )}
        </div>

        {/* 메타 그리드 */}
        <ClubPreviewMeta
          memberCount={memberCount}
          ownerName={ownerName}
          location={location}
          courtCount={courtCount}
        />

        {/* 활동 장소 */}
        {activityPlace && (
          <section className="bg-white border border-[#f0f0f0] rounded-2xl px-4 py-3.5 mb-4">
            <p className="text-xs font-semibold text-[#999] mb-1">활동 장소</p>
            <p className="text-sm text-[#111] leading-relaxed">
              {activityPlace}
            </p>
          </section>
        )}

        {/* 모임 소개 */}
        <section className="bg-white border border-[#f0f0f0] rounded-2xl px-4 py-4 mb-5">
          <p className="text-xs font-semibold text-[#999] mb-2">모임 소개</p>
          {description ? (
            <p className="text-sm text-[#222] leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          ) : (
            <p className="text-sm text-[#bbb] leading-relaxed">
              아직 소개가 등록되지 않았어요.
            </p>
          )}
        </section>

        {/* 알림 영역 */}
        {flash && (
          <div className="mb-3 px-3 py-2.5 bg-[#ecfdf5] text-[#059669] text-xs rounded-xl border border-[#a7f3d0]">
            {flash}
          </div>
        )}
        {error && (
          <div className="mb-3 px-3 py-2.5 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* CTA */}
        <ClubPreviewCTA
          clubId={clubId}
          isLoggedIn={isLoggedIn}
          isMember={isMember}
          status={status}
          isPending={isPending}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}
