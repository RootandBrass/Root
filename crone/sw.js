const CACHE = 'crone-v9';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  if (url.origin === self.location.origin && (url.pathname === '/crone/' || url.pathname === '/crone/index.html')) {
    event.respondWith((async () => {
      const response = await fetch(event.request);
      const type = response.headers.get('content-type') || '';
      if (!response.ok || !type.includes('text/html')) return response;
      let html = await response.text();
      html = html
        .replace("href=\"/.auth/logout?post_logout_redirect_uri=/\"", "href=\"/.auth/logout?post_logout_redirect_uri=/signed-out.html\"")
        .replace("href=\"/logout\"", "href=\"/.auth/logout?post_logout_redirect_uri=/signed-out.html\"")
        .replace(";el.setAttribute('capture','environment')", "")
        .replace("h.textContent='Choose a photo or take one with your phone.'", "h.textContent='Choose an existing photo or take a new one.'")
        .replace('</body>', '<script src="/crone/trim.js?v=1"></script><script src="/crone/garden.js?v=1"></script><script src="/crone/edit.js?v=2"></script><script src="/crone/features.js?v=1"></script></body>');
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      return new Response(html, { status: response.status, statusText: response.statusText, headers });
    })());
    return;
  }
  event.respondWith(fetch(event.request));
});
