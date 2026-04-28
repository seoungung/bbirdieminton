'use client'

import { MapPin, Users, Crown, Building2 } from 'lucide-react'

interface ClubPreviewMetaProps {
  memberCount: number
  ownerName: string | null
  location: string | null
  courtCount: number | null
}

/**
 * 비멤버 미리보기 페이지의 메타 정보 그리드.
 * 멤버수 / 운영자 / 지역 / 코트 4개 셀.
 * 값이 없는 항목은 자동으로 숨김.
 */
export function ClubPreviewMeta({
  memberCount,
  ownerName,
  location,
  courtCount,
}: ClubPreviewMetaProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-5">
      <MetaCell
        icon={<Users size={14} className="text-[#555]" />}
        label="멤버"
        value={`${memberCount}명`}
      />
      <MetaCell
        icon={<Crown size={14} className="text-[#555]" />}
        label="운영자"
        value={ownerName ?? '-'}
      />
      {location && (
        <MetaCell
          icon={<MapPin size={14} className="text-[#555]" />}
          label="지역"
          value={location}
        />
      )}
      {courtCount != null && (
        <MetaCell
          icon={<Building2 size={14} className="text-[#555]" />}
          label="코트"
          value={`${courtCount}면`}
        />
      )}
    </div>
  )
}

// ── 메타 셀 (인라인 헬퍼) ─────────────────────────────────
function MetaCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-white border border-[#f0f0f0] rounded-xl px-3 py-2.5 flex items-center gap-2.5">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-[#111] truncate">{value}</p>
      </div>
    </div>
  )
}
