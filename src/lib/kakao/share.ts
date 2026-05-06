/**
 * Kakao SDK (JavaScript) — 카카오톡 공유 헬퍼.
 *
 * 키는 NEXT_PUBLIC_KAKAO_JS_KEY (도메인 화이트리스트로 보호되는 공개 키).
 * 등록 도메인 외에선 SDK가 거부.
 *
 * 사용 흐름:
 *   1. <KakaoSDKScript />를 root layout 등에 1번 마운트
 *   2. 공유 버튼에서 shareLink({ url, title, description, imageUrl }) 호출
 *
 * 공식 문서: https://developers.kakao.com/docs/latest/ko/message/js-link
 */

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean
      init: (key: string) => void
      Share: {
        sendDefault: (options: KakaoShareOptions) => void
      }
    }
  }
}

interface KakaoShareOptions {
  objectType: 'feed'
  content: {
    title: string
    description: string
    imageUrl: string
    link: { mobileWebUrl: string; webUrl: string }
  }
  buttons?: Array<{
    title: string
    link: { mobileWebUrl: string; webUrl: string }
  }>
}

let initStarted = false

function ensureInit(): boolean {
  if (typeof window === 'undefined') return false
  const Kakao = window.Kakao
  if (!Kakao) return false
  if (!Kakao.isInitialized()) {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
    if (!key) {
      console.warn('NEXT_PUBLIC_KAKAO_JS_KEY 가 설정되지 않았어요.')
      return false
    }
    if (initStarted) return false
    initStarted = true
    Kakao.init(key)
  }
  return Kakao.isInitialized()
}

/**
 * 카카오톡 공유 (피드 카드).
 *
 * 메시지 템플릿을 카카오 개발자 센터에 등록하지 않았다면,
 * `objectType: 'feed'` 기본 템플릿을 사용 — 별도 검수 없이 동작.
 *
 * @returns 성공 여부 (false면 SDK 미로드 또는 초기화 실패)
 */
export function shareToKakao(params: {
  url: string
  title: string
  description: string
  imageUrl: string
  buttonText?: string
}): boolean {
  if (!ensureInit()) return false
  const Kakao = window.Kakao
  if (!Kakao) return false

  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: params.title,
      description: params.description,
      imageUrl: params.imageUrl,
      link: { mobileWebUrl: params.url, webUrl: params.url },
    },
    buttons: [
      {
        title: params.buttonText ?? '리포트 보기',
        link: { mobileWebUrl: params.url, webUrl: params.url },
      },
    ],
  })
  return true
}
