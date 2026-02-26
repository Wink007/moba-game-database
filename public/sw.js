const CACHE_NAME = 'moba-wiki-v1';

// Assets to pre-cache on install (shell)
const SHELL_ASSETS = [
  '/',
  '/offline.html',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
];

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for navigation, cache-first for static assets ────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests (API calls, Google OAuth, etc.)
  if (request.method !== 'GET') return;
  if (!url.origin.startsWith(self.location.origin)) return;
  // Skip Railway API calls
  if (url.pathname.startsWith('/api/')) return;

  // HTML navigation requests — network first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() =>
          caches.match('/offline.html').then((r) => r || new Response('Offline', { status: 503 }))
        )
    );
    return;
  }

  // Static assets (JS, CSS, images) — cache first, update in background (stale-while-revalidate)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      })
    );
  }
});
