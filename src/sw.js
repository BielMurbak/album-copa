const CACHE_NAME = 'album-copa-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    fetch('/album-copa/assets/data/figurinhas.json')
      .then(() => caches.open(CACHE_NAME))
      .then(cache => cache.addAll([
        '/album-copa/',
        '/album-copa/index.html',
        '/album-copa/assets/data/figurinhas.json'
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
      )
      .catch(() => caches.match('/album-copa/index.html'))
  );
});