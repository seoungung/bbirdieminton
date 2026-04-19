'use client'

import { useState, useEffect, useCallback } from 'react'

type PushState = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'loading'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const ab = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(ab)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Web Push 구독 관리 훅
 *
 * @param clubId  - 현재 모임 ID (구독 범위)
 */
export function usePushNotification(clubId: string) {
  const [state, setState] = useState<PushState>('loading')
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // 초기 상태 확인
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }

    navigator.serviceWorker.ready.then(async (reg) => {
      setRegistration(reg)
      const existing = await reg.pushManager.getSubscription()
      setState(existing ? 'subscribed' : 'unsubscribed')
    })
  }, [])

  // 구독 요청
  const subscribe = useCallback(async () => {
    if (!registration || !VAPID_PUBLIC_KEY) return

    setState('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('denied')
        return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON(), clubId }),
      })

      if (res.ok) {
        setState('subscribed')
      } else {
        await subscription.unsubscribe()
        setState('unsubscribed')
      }
    } catch (err) {
      console.error('[usePushNotification] subscribe error:', err)
      setState('unsubscribed')
    }
  }, [registration, clubId])

  // 구독 취소
  const unsubscribe = useCallback(async () => {
    if (!registration) return

    setState('loading')
    try {
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint, clubId }),
        })
        await subscription.unsubscribe()
      }
      setState('unsubscribed')
    } catch (err) {
      console.error('[usePushNotification] unsubscribe error:', err)
      setState('subscribed') // 실패 시 원래 상태 복원
    }
  }, [registration, clubId])

  return { state, subscribe, unsubscribe }
}
