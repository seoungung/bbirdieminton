'use client'

import { useEffect } from 'react'

/**
 * Service Worker 등록 컴포넌트
 * ClubLayout 에서 한 번만 마운트되어 SW를 등록합니다.
 */
export function SwRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => {
          // 개발 환경 등에서 실패 시 조용히 무시
          console.warn('[SW] 등록 실패:', err)
        })
    }
  }, [])

  return null
}
