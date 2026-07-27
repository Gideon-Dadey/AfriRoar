/* AfriRoar service worker - network-first shell, fast production updates */
const CACHE = 'afriroar-shell-v5';
const PRECACHE = [
  '/manifest.webmanifest',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/favicon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API or auth traffic
  if (url.pathname.startsWith('/api/')) return;

  // Never let the SW cache itself or the HTML entry - always hit the network
  if (url.pathname === '/sw.js' || url.pathname === '/index.html') {
    event.respondWith(fetch(request));
    return;
  }

  // Navigations: network-first so deploys show immediately when online
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('/', copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = (await caches.match(request)) || (await caches.match('/'));
          if (cached) return cached;
          throw new Error('offline');
        })
    );
    return;
  }

  // Hashed build assets: cache-first (filenames change on every deploy)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
      )
    );
    return;
  }

  // Icons / static images: stale-while-revalidate
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/sr/') || url.pathname === '/manifest.webmanifest') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
