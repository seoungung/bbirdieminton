import 'server-only'

/**
 * 카카오 알림톡 발송 — Pro 플랜 기능.
 *
 * ⚠️ 현재 STUB — 실제 발송 X. 콘솔 로그만 남김.
 *
 * 정식 활성화하려면:
 *  1. 카카오 비즈니스 계정 등록 + 알림톡 발신프로필 신청
 *  2. 알림톡 템플릿 사전 심사 (각 알림 타입별, 영업일 1~3일)
 *  3. 발신 채널 (NHN Toast / 알리고 / 카카오 클라우드 메시지) 계약
 *  4. 환경변수: KAKAO_NOTI_API_KEY, KAKAO_SENDER_KEY 등 추가
 *  5. Pro 플랜 사용자에게만 활성 + 월 200건 한도 카운팅
 *
 * 메모리 ref: pricing_rating_strategy_2026-04-29.md
 *  - "미납 자동 알림 (카카오 알림톡, 월 200건)" — Pro 결제 anchor 기능
 */
export interface KakaoNotiPayload {
  to: string         // 수신자 휴대전화 (010xxxxxxxx, 정규화된 형식)
  templateCode: string // 사전 등록된 템플릿 코드 (e.g. 'WAITLIST_PROMOTED')
  variables: Record<string, string> // {clubName, eventTitle, ...}
}

export async function sendKakaoNoti(
  payload: KakaoNotiPayload,
): Promise<{ sent: boolean; reason?: string }> {
  /* TODO: 실제 발송 구현 — Pro 플랜 활성 시 */
  console.info(
    '[kakao-noti STUB] would send:',
    payload.templateCode,
    'to',
    payload.to,
    'with',
    payload.variables,
  )
  return { sent: false, reason: 'STUB — 카카오 알림톡 비즈 연동 필요' }
}
