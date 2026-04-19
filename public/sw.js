// 버디민턴 Service Worker — Web Push 알림 처리

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// ── Push 이벤트 수신 ──────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: '버디민턴', body: event.data.text() }
  }

  const title = data.title ?? '버디민턴 클럽'
  const options = {
    body: data.body ?? '',
    icon: '/symbol_birdieminton-color.png',
    badge: '/favicon_birdieminton-color.png',
    tag: data.tag ?? 'birdminton-club',
    data: { url: data.url ?? '/club/home' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── 알림 클릭 — 해당 URL로 이동 ──────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url ?? '/club/home'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 이미 열려 있는 창이 있으면 포커스
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      // 없으면 새 창
      return clients.openWindow(targetUrl)
    })
  )
})
