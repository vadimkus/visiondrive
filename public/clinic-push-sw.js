/* global self */
self.addEventListener('push', (event) => {
  let data = { title: 'Practice OS', body: '', url: '/clinic' }
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() }
    }
  } catch {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Practice OS', {
      body: data.body || '',
      data: { url: data.url || '/clinic' },
      icon: '/favicon.ico',
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/clinic'
  const path = typeof url === 'string' && url.startsWith('http') ? url : self.location.origin + (url || '/clinic')
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === path && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(path)
      }
    })
  )
})
