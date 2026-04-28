'use client'

import { useState, useTransition } from 'react'
import { ClubPreviewHeader } from './ClubPreviewHeader'
import { ClubPreviewHero } from './ClubPreviewHero'
import { ClubPreviewAbout } from './ClubPreviewAbout'
import { ClubPreviewEvents } from './ClubPreviewEvents'
import { ClubPreviewMembers } from './ClubPreviewMembers'
import { ClubPreviewStickyCTA } from './ClubPreviewStickyCTA'
import {
  submitJoinRequestAction,
  cancelJoinRequestAction,
  type JoinRequestStatus,
} from '@/app/club/[clubId]/join-requests/actions'
import type { ClubPreviewEvent, ClubPreviewMember } from '@/types/club'

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
  upcomingEvents: ClubPreviewEvent[]
  recentMembers: ClubPreviewMember[]
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
    upcomingEvents,
    recentMembers,
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

      {/* sticky CTA(약 76px) + safe-area 만큼 본문 하단 여백 확보 */}
      <main className="pb-32">
        <ClubPreviewHero
          name={name}
          thumbnailUrl={thumbnailUrl}
          thumbnailColor={thumbnailColor}
          category={category}
          location={location}
          memberCount={memberCount}
        />

        <div className="max-w-[720px] mx-auto px-4 pt-3 pb-2 space-y-9">
          <ClubPreviewAbout
            description={description}
            ownerName={ownerName}
            activityPlace={activityPlace}
            courtCount={courtCount}
          />

          <ClubPreviewEvents events={upcomingEvents} />

          <ClubPreviewMembers
            members={recentMembers}
            totalCount={memberCount}
          />

          {(flash || error) && (
            <div className="space-y-2">
              {flash && (
                <div className="px-3 py-2.5 bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court-deep)] text-[12.5px] rounded-xl border border-[var(--color-brand-court-soft)]">
                  {flash}
                </div>
              )}
              {error && (
                <div className="px-3 py-2.5 bg-red-50 text-red-600 text-[12.5px] rounded-xl border border-red-100">
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
