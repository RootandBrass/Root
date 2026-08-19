const CACHE = 'crone-v5';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Crone is private. Never cache protected pages or API responses.
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Patch the Crone document at the edge of the PWA so mobile image fields
  // use the normal photo chooser (camera OR existing library), sign out goes
  // through Azure auth, and the editor cards are grouped by Root & Brass area.
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
        .replace('</body>', '<script src="/crone/organize.js?v=1"></script></body>');

      const headers = new Headers(response.headers);
      headers.delete('content-length');
      return new Response(html, { status: response.status, statusText: response.statusText, headers });
    })());
    return;
  }

  event.respondWith(fetch(event.request));
});
