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
  self.skipWaiting();
});

// Estratégia: Tenta o Cache primeiro para os arquivos listados, senão vai para a rede
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Se tiver no cache, entrega o do cache. Se não, busca na rede.
      return cachedResponse || fetch(event.request).catch(() => {
        // Se a rede falhar e não tiver no cache (ex: uma imagem nova)
        console.log('Falha na rede e arquivo não está no cache.');
      });
    })
  );
});

// Limpa caches antigos quando houver atualização de versão
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});