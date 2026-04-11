const CACHE_NAME = 'lokamig-pwa-v2';
const assets = [
  './',
  './index.html',
  './login.html',
  './admin.html',
  './styles.css',
  './app.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap'
];

// Instala e guarda os arquivos vitais no cache do celular
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Sistema de Cache LOKAMIG Ativado');
      return cache.addAll(assets);
    })
  );
});

// Estratégia: Tenta buscar na rede, se falhar (offline), busca no cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});