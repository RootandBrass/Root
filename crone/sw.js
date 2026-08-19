const CACHE = 'crone-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Crone is private. Never serve its protected pages or API responses from a cache.
  event.respondWith(fetch(event.request));
});
