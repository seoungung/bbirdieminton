'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import type { MemberRole } from '@/types/club'
import { ClubCardImage } from './ClubCardImage'
import { ClubCardMeta } from './ClubCardMeta'

// ── 공유 클럽 shape ────────────────────────────────────────
interface ClubBase {
  id: string
  name: string
  description: string | null
  court_count: number
  created_at: string
  memberCount?: number
  location?: string
  leaderName?: string
  thumbnailColor?: string
  thumbnail_url?: string | null
}

interface ClubWithMyRole extends ClubBase {
  myRole?: MemberRole
}

// ── 역할 라벨 ──────────────────────────────────────────────
const ROLE_LABEL: Record<MemberRole, string> = {
  owner: '운영자',
  manager: '매니저',
  member: '멤버',
}

// ── 역할 배지 스타일 ──────────────────────────────────────
const ROLE_STYLE: Record<MemberRole, string> = {
  owner: 'bg-[#fff9e6] text-[#b45309] border border-[#fde68a]',
  manager: 'bg-[var(--color-brand-court-bg)] text-[var(--color-brand-court)] border border-[var(--color-brand-court-soft)]',
  member: 'bg-[#f5f5f5] text-[#555] border border-[#e5e5e5]',
}

// ── 14일 이내 NEW 판별 ────────────────────────────────────
function isNewClub(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000
}

// ── Props (Discriminated Union) ────────────────────────────
type PinterestClubCardProps =
  | {
      mode: 'all'
      club: ClubBase
      isMember: boolean
      isFavorited: boolean
      onToggleFavorite: (id: string) => void
      isLoggedIn: boolean
    }
  | {
      mode: 'my'
      club: ClubWithMyRole
      isFavorited?: never
      onToggleFavorite?: never
      isMember?: never
      isLoggedIn?: never
    }

/**
 * Pinterest-style masonry 카드.
 * - mode='all': 찜 버튼 + 가입됨/미가입 시각화
 * - mode='my': 역할 배지 + 입장하기 CTA
 *
 * 이미지 영역은 ClubCardImage, 메타는 ClubCardMeta에서 담당.
 */
export function PinterestClubCard(props: PinterestClubCardProps) {
  const { mode, club } = props
  const isNew = isNewClub(club.created_at)
  // 멤버/내 모임 → 대시보드. 비멤버 → preview 라우트(/clubs/[id]).
  const isMember = mode === 'my' || (mode === 'all' && props.isMember)
  const href = isMember ? `/club/${club.id}` : `/clubs/${club.id}`

  return (
    <div className="bg-white border border-[#f0f0f0] rounded-2xl overflow-hidden break-inside-avoid mb-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      {/* 이미지 / 그라데이션 영역 */}
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <ClubCardImage
          name={club.name}
          thumbnailUrl={club.thumbnail_url}
          thumbnailColor={club.thumbnailColor}
          isNew={isNew}
        />
      </Link>

      {/* 카드 하단 텍스트 영역 */}
      <div className="px-4 pt-3.5 pb-4">
        {/* 헤더 row: 이름 + (찜 버튼 or 역할 배지) */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={href}
            className="font-bold text-[#111] text-base leading-snug line-clamp-1 hover:underline flex-1"
          >
            {club.name}
          </Link>

          {mode === 'all' && (
            <button
              onClick={() => props.onToggleFavorite(club.id)}
              className="shrink-0 mt-0.5 transition-colors"
              aria-label={props.isFavorited ? '찜 해제' : '찜하기'}
            >
              <Heart
                size={16}
                className={
                  props.isFavorited
                    ? 'fill-red-400 text-[var(--color-brand-streak)]'
                    : 'text-[#ccc] hover:text-red-300'
                }
              />
            </button>
          )}

          {mode === 'my' && club.myRole && (
            <span
              className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_STYLE[club.myRole]}`}
            >
              {ROLE_LABEL[club.myRole]}
            </span>
          )}
        </div>

        {/* 설명 */}
        {club.description && (
          <p className="text-xs text-[#666] leading-relaxed line-clamp-2 mb-1">
            {club.description}
          </p>
        )}

        {/* 메타 (멤버수 · 지역 · 운영자) */}
        <ClubCardMeta
          memberCount={club.memberCount}
          location={club.location}
          leaderName={club.leaderName}
        />

        {/* 구분선 */}
        <div className="border-t border-[#f0f0f0] mt-3 mb-3" />

        {/* CTA */}
        {mode === 'all' ? (
          <Link
            href={href}
            className={
              props.isMember
                ? 'w-full flex items-center justify-center bg-[var(--color-brand-lime)] text-[#111] font-bold text-sm py-2 rounded-xl hover:brightness-95 transition-all'
                : 'w-full flex items-center justify-center border border-[#e5e5e5] text-[#555] font-semibold text-sm py-2 rounded-xl hover:bg-[#f8f8f8] transition-all'
            }
          >
            {props.isMember ? '모임 보기' : '둘러보기'}
          </Link>
        ) : (
          <Link
            href={href}
            className="w-full flex items-center justify-center bg-[var(--color-brand-lime)] text-[#111] font-bold text-sm py-2 rounded-xl hover:brightness-95 transition-all"
          >
            입장하기
          </Link>
        )}
      </div>
    </div>
  )
}
