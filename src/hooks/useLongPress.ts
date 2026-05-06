'use client'

import { useRef, useCallback } from 'react'

/**
 * 태블릿/터치 환경에서 long-press → 컨텍스트 메뉴 발동을 지원하는 hook.
 *
 * 사용법:
 *   const { handlers, wasLongPress } = useLongPress({ onLongPress: (x, y) => openMenu(x, y) })
 *   <button {...handlers} onClick={() => {
 *     if (wasLongPress.current) { wasLongPress.current = false; return }
 *     // 일반 클릭 동작
 *   }}>...</button>
 *
 * - 손가락이 움직이면 long-press 취소 (스크롤 의도 보존)
 * - 데스크톱 우클릭(`onContextMenu`)은 즉시 트리거
 */
export interface LongPressHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: () => void
  onTouchCancel: () => void
  onTouchMove: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

interface LongPressOptions {
  /** 트리거까지 ms (default 500) */
  ms?: number
  /** 트리거 시 호출되는 핸들러 — clientX/Y 받음 (메뉴 띄울 위치) */
  onLongPress: (x: number, y: number) => void
}

interface UseLongPressResult {
  handlers: LongPressHandlers
  /**
   * 직전 터치가 long-press 로 트리거됐는지. onClick 핸들러에서
   * 이 값을 읽어 일반 클릭 동작을 무시하고 false 로 리셋해야 함.
   */
  wasLongPressRef: React.MutableRefObject<boolean>
}

export function useLongPress({
  ms = 500,
  onLongPress,
}: LongPressOptions): UseLongPressResult {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasLongPressRef = useRef(false)

  const start = useCallback(
    (x: number, y: number) => {
      // 새 제스처 — 이전 트리거 플래그는 onClick 단계에서 소비되어야 한다.
      // 여기서 리셋하지 않음(연속 제스처 보호).
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        wasLongPressRef.current = true
        onLongPress(x, y)
      }, ms)
    },
    [ms, onLongPress],
  )

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handlers: LongPressHandlers = {
    onTouchStart: (e) => {
      const t = e.touches[0]
      if (!t) return
      start(t.clientX, t.clientY)
    },
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onTouchMove: cancel,
    onContextMenu: (e) => {
      e.preventDefault()
      cancel()
      wasLongPressRef.current = true
      onLongPress(e.clientX, e.clientY)
    },
  }

  return { handlers, wasLongPressRef }
}
