const CACHE_NAME = 'lokamig-v7';
const ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Não cachear requisições ao Supabase
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).catch(() => cached);
    })
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'LOKAMIG', {
      body: data.body || '',
      icon: 'https://res.cloudinary.com/dlaregq2k/image/upload/w_192,h_192/v1/lokamig/logo_icon.png',
      badge: 'https://res.cloudinary.com/dlaregq2k/image/upload/w_72,h_72/v1/lokamig/logo_icon.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});
