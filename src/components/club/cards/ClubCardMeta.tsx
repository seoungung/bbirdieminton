'use client'

import { MapPin, Crown, Users } from 'lucide-react'

interface ClubCardMetaProps {
  memberCount?: number
  location?: string
  leaderName?: string
}

/**
 * 카드 하단 메타 정보 행.
 * 멤버 수 · 지역 · 운영자 이름을 작은 텍스트로 표시.
 * 아바타 stack은 future enhancement — 현재는 카운트만 표시.
 */
export function ClubCardMeta({ memberCount, location, leaderName }: ClubCardMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
      {memberCount !== undefined && (
        <span className="inline-flex items-center gap-1 text-xs text-[#999]">
          <Users size={11} strokeWidth={2} />
          {memberCount}명
        </span>
      )}
      {location && (
        <span className="inline-flex items-center gap-1 text-xs text-[#999]">
          <MapPin size={11} strokeWidth={2} />
          {location}
        </span>
      )}
      {leaderName && (
        <span className="inline-flex items-center gap-1 text-xs text-[#999]">
          <Crown size={11} strokeWidth={2} />
          {leaderName}
        </span>
      )}
    </div>
  )
}
