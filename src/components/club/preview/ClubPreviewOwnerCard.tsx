'use client'

import Image from 'next/image'
import { Crown, MessageCircle } from 'lucide-react'

interface Props {
  ownerName: string | null
  ownerProfileImg: string | null
  ownerBio: string | null
  /** 운영자가 settings 에서 입력한 공개 연락처 (mailto/카카오 오픈챗/tel/https).
   *  null/미입력 → 메시지 버튼 미노출 */
  contactUrl?: string | null
  /** mailto: 의 subject 에 노출할 클럽명 (선택) */
  clubName?: string
}

/**
 * 운영자 미니 프로필 카드.
 * - 아바타 + 이름 + 한줄 소개
 * - "메시지 보내기" 버튼: contact_url 입력 시 활성, 없으면 숨김.
 *   - mailto:..., https://open.kakao.com/..., tel:... 등 자유 형식
 *   - mailto: 의 경우 subject 에 [클럽명] 가입 문의 자동 첨부
 * - 이름조차 없으면 섹션 숨김.
 */
export function ClubPreviewOwnerCard({
  ownerName,
  ownerProfileImg,
  ownerBio,
  contactUrl,
  clubName,
}: Props) {
  if (!ownerName) return null

  const initial = ownerName.charAt(0).toUpperCase()
  const trimmedContact = (contactUrl ?? '').trim()
  const messageHref = buildMessageHref(trimmedContact, clubName)

  return (
    <section>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#bbb] mb-2.5">
        운영자
      </p>
      <div className="flex items-center gap-3 rounded-2xl border border-[#ebebeb] bg-white px-4 py-4">
        <Avatar name={ownerName} profileImg={ownerProfileImg} initial={initial} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[15px] font-bold text-[#111] truncate">
              {ownerName}
            </p>
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-brand-streak-soft)] text-[#92400e]"
              aria-label="모임장"
            >
              <Crown size={10} strokeWidth={2.5} />
              모임장
            </span>
          </div>
          {ownerBio && ownerBio.trim() ? (
            <p className="mt-1 text-[12.5px] text-[#666] leading-snug break-keep line-clamp-2">
              {ownerBio.trim()}
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-[#bbb]">소개가 아직 없어요.</p>
          )}
        </div>

        {messageHref && (
          <a
            href={messageHref}
            target={messageHref.startsWith('http') ? '_blank' : undefined}
            rel={messageHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            aria-label="운영자에게 메시지 보내기"
            className="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-[#111] border border-[#ebebeb] rounded-xl px-2.5 py-1.5 hover:bg-[#f8f8f8] hover:border-[#d0d0d0] transition-colors"
          >
            <MessageCircle size={13} strokeWidth={2.2} />
            쪽지
          </a>
        )}
      </div>
    </section>
  )
}

/**
 * 운영자 입력 contact_url 을 안전한 href 로 변환.
 *
 * 허용 스킴: mailto:, tel:, https:, http:, kakaoopen://
 * - mailto: 의 경우 subject 자동 추가 (이미 ? 가 있으면 그대로 둠)
 * - 스킴이 없는 https? URL 같으면 https:// prefix
 * - 그 외(이메일만 입력 등)는 mailto: 로 보정
 * - 안전하지 않은 입력은 null 반환 → 버튼 숨김
 */
function buildMessageHref(
  contact: string,
  clubName: string | undefined,
): string | null {
  if (!contact) return null

  const lower = contact.toLowerCase()

  /* 1) 명시적 스킴이 이미 있는 경우 — 화이트리스트만 허용 */
  if (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('tel:')
  ) {
    return contact
  }

  if (lower.startsWith('mailto:')) {
    /* 이미 query string 이 있으면 그대로, 없으면 subject 추가 */
    if (contact.includes('?')) return contact
    const subject = clubName
      ? `[${clubName}] 가입 문의`
      : '모임 가입 문의'
    return `${contact}?subject=${encodeURIComponent(subject)}`
  }

  /* 2) 스킴 없음 — 단순 이메일 형식 추정 */
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    const subject = clubName
      ? `[${clubName}] 가입 문의`
      : '모임 가입 문의'
    return `mailto:${contact}?subject=${encodeURIComponent(subject)}`
  }

  /* 3) 도메인처럼 보이면 https 로 */
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(contact)) {
    return `https://${contact}`
  }

  /* 그 외 — 안전하지 않은 입력 */
  return null
}

function Avatar({
  name,
  profileImg,
  initial,
}: {
  name: string
  profileImg: string | null
  initial: string
}) {
  if (profileImg) {
    /* 카카오 등 외부 프로필 이미지는 종종 http:// — https 강제 변환 (보안 + 일부 호스팅 환경 호환) */
    const safeSrc = profileImg.startsWith('http://')
      ? profileImg.replace(/^http:\/\//, 'https://')
      : profileImg
    return (
      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#f0f0f0] shrink-0">
        <Image
          src={safeSrc}
          alt={name}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
    )
  }
  return (
    <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
      <span className="text-[16px] font-bold text-[#666]">{initial}</span>
    </div>
  )
}
