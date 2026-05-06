/**
 * 버디민턴 — 어휘 통일 라벨
 *
 * 어휘 일관성 유지: "회원" (멤버 X), "운영자" (회장 X), "매니저" (운영진 X 시 가독성).
 * 단, 기존 일부 화면에서는 운영자/매니저 톤이 더 친숙해 그대로 유지하는 경우도 있음.
 */

import type { MemberRole } from '@/types/club'

export const ROLE_LABEL: Record<MemberRole, string> = {
  owner: '운영자',
  manager: '매니저',
  member: '회원',
}

export const ENTITY_LABEL = {
  member: '회원',
  guest: '게스트',
  session: '세션',
  event: '정기모임',
  match: '매치',
} as const
