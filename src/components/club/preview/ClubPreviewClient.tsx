'use client'

import { useState, useTransition } from 'react'
import { ClubPreviewHeader } from './ClubPreviewHeader'
import { ClubPreviewHero } from './ClubPreviewHero'
import { ClubPreviewIdentityTags } from './ClubPreviewIdentityTags'
import { ClubPreviewKpiGrid } from './ClubPreviewKpiGrid'
import { ClubPreviewSchedule } from './ClubPreviewSchedule'
import { ClubPreviewAbout } from './ClubPreviewAbout'
import { ClubPreviewOwnerCard } from './ClubPreviewOwnerCard'
import { ClubPreviewVibe } from './ClubPreviewVibe'
import { ClubPreviewEvents } from './ClubPreviewEvents'
import { ClubPreviewMembers } from './ClubPreviewMembers'
import { ClubPreviewPhotoGallery } from './ClubPreviewPhotoGallery'
import { ClubPreviewFAQ } from './ClubPreviewFAQ'
import { ClubPreviewStickyCTA } from './ClubPreviewStickyCTA'
import {
  submitJoinRequestAction,
  cancelJoinRequestAction,
  type JoinRequestStatus,
} from '@/app/club/[clubId]/join-requests/actions'
import type {
  ClubPreviewEvent,
  ClubPreviewMember,
  ClubPreviewVibe as VibeStats,
  ClubFAQ,
} from '@/types/club'

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
  ownerProfileImg: string | null
  memberCount: number
  upcomingEvents: ClubPreviewEvent[]
  recentMembers: ClubPreviewMember[]
  isLoggedIn: boolean
  isMember: boolean
  myJoinStatus: JoinRequestStatus | null
  // ── Phase A 신규 ──────────────────────────────────────────
  tags: string[]
  feeMonthly: number | null
  feePerSession: number | null
  feeNote: string | null
  ownerBio: string | null
  photoUrls: string[]
  scheduleSummary: string | null
  faqs: ClubFAQ[]
  vibe: VibeStats | null
  /** Phase C — 운영자 공개 연락처 (없으면 메시지 버튼 숨김) */
  contactUrl: string | null
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
    ownerProfileImg,
    memberCount,
    upcomingEvents,
    recentMembers,
    isLoggedIn,
    isMember,
    myJoinStatus: initialStatus,
    tags,
    feeMonthly,
    feePerSession,
    feeNote,
    ownerBio,
    photoUrls,
    scheduleSummary,
    faqs,
    vibe,
    contactUrl,
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
    <div className="min-h-screen bg-white">
      <ClubPreviewHeader name={name} />

      {/* 방문자 모드 배너 — 가입 전 사용자에게 컨텍스트 명시.
          이미 회원이면 표시하지 않음 (운영 페이지 접근 가능). */}
      {!isMember && (
        <div className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg-sub)] px-4 py-2.5">
          <div className="max-w-[1088px] mx-auto flex items-center gap-2 text-[12.5px] text-[var(--color-brand-text-sub)]">
            <span className="inline-flex items-center rounded-full bg-[var(--color-brand-ink)] text-white px-2 py-0.5 text-[10px] font-bold tracking-wide shrink-0">
              방문자
            </span>
            <span>
              지금은 <strong className="text-[var(--color-text-strong)]">미리보기</strong>예요. 가입 후 운영 페이지가 열려요.
            </span>
          </div>
        </div>
      )}

      {/* sticky CTA(약 76px) + safe-area 만큼 본문 하단 여백 확보 */}
      <main className="pb-32">
        <ClubPreviewHero
          name={name}
          thumbnailUrl={thumbnailUrl}
          thumbnailColor={thumbnailColor}
          category={category}
          location={location}
          memberCount={memberCount}
          photoUrls={photoUrls}
        />

        {/* 태그 — Hero 메타 바로 아래, 결정 정보 강화 */}
        <div className="max-w-[1088px] mx-auto">
          <ClubPreviewIdentityTags tags={tags} />
        </div>

        <div className="max-w-[1088px] mx-auto px-4 pt-3 pb-2 space-y-9">
          {/* KPI 그리드 — 위치/일정/회비/멤버 한눈에 */}
          <ClubPreviewKpiGrid
            location={location}
            activityPlace={activityPlace}
            scheduleSummary={scheduleSummary}
            feeMonthly={feeMonthly}
            feePerSession={feePerSession}
            feeNote={feeNote}
            memberCount={memberCount}
          />

          {/* 정기 일정 (자유 텍스트) */}
          <ClubPreviewSchedule
            scheduleSummary={scheduleSummary}
            activityPlace={activityPlace}
          />

          <ClubPreviewAbout
            description={description}
            ownerName={ownerName}
            activityPlace={activityPlace}
            courtCount={courtCount}
          />

          {/* 운영자 카드 */}
          <ClubPreviewOwnerCard
            ownerName={ownerName}
            ownerProfileImg={ownerProfileImg}
            ownerBio={ownerBio}
            contactUrl={contactUrl}
            clubName={name}
          />

          {/* 모임 분위기 (통계) */}
          <ClubPreviewVibe stats={vibe} />

          <ClubPreviewEvents events={upcomingEvents} />

          <ClubPreviewMembers members={recentMembers} totalCount={memberCount} />

          {/* 활동 사진 */}
          <ClubPreviewPhotoGallery photos={photoUrls} clubName={name} />

          {/* FAQ */}
          <ClubPreviewFAQ faqs={faqs} />

          {(flash || error) && (
            <div className="space-y-2">
              {flash && (
                <div className="px-3 py-2.5 bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court-deep)] text-[12.5px] rounded-xl border border-[var(--color-brand-court-soft)]">
                  {flash}
                </div>
              )}
              {error && (
                <div className="px-3 py-2.5 bg-[var(--color-brand-streak-bg)] text-[var(--color-brand-streak)] text-[12.5px] rounded-xl border border-[var(--color-brand-streak-soft)]/50">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ClubPreviewStickyCTA
        clubId={clubId}
        isLoggedIn={isLoggedIn}
        isMember={isMember}
        status={status}
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
