import type React from 'react'

/**
 * 본문 컴포넌트 매핑 테이블.
 * 콘텐츠 작성 후 아래 형식으로 등록:
 *   import { SomePostBody } from './some-slug'
 *   POST_BODIES['some-slug'] = SomePostBody
 */
const POST_BODIES: Record<string, () => React.ReactElement> = {
  // 예: 'admin-guide-fees': AdminGuideFeesBody,
}

/** slug에 해당하는 본문 컴포넌트를 반환. 미작성 시 null. */
export function getPostBody(slug: string): (() => React.ReactElement) | null {
  return POST_BODIES[slug] ?? null
}
