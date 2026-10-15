/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Offline sederhana: GET ke API diambil dari jaringan, jatuh ke cache terakhir bila gagal.
const api = new URL(import.meta.env.VITE_API_URL).origin
registerRoute(
  ({ request, url }) => request.method === 'GET' && url.origin === api && url.pathname !== '/tick',
  new NetworkFirst({ cacheName: 'api', networkTimeoutSeconds: 5 }),
)

self.addEventListener('push', (e) => {
  const d = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(d.title ?? 'Noremy', {
      body: d.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
    }),
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow('/'))),
  )
})
