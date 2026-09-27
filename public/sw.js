// Service worker mínimo: solo recibe push y abre el enlace al tocarlo.
// No cachea nada (no es un service worker de offline/PWA).

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const title = payload.title || 'Homie';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body,
      tag: payload.link || 'homie-notification',
      data: { link: payload.link || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data && event.notification.data.link ? event.notification.data.link : '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(link) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(link);
    }),
  );
});
