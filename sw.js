// Versão do app — INCREMENTE este número a cada novo deploy.
// Isso força o navegador a descartar o cache antigo e baixar os arquivos novos,
// sem nunca tocar no IndexedDB (onde ficam as quantidades de figurinhas do usuário).
const APP_VERSION = 'v3';
const CACHE_NAME = `album-copa-${APP_VERSION}`;

self.addEventListener('install', event => {
  // Ativa o novo SW imediatamente, sem esperar todas as abas antigas fecharem.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Remove TODOS os caches de versões antigas do app.
      // Isso só afeta o Cache API (arquivos estáticos: html, js, css, json, imagens).
      // Não encosta no IndexedDB — banco separado, gerido pelo storage.service.ts.
      const nomesCaches = await caches.keys();
      await Promise.all(
        nomesCaches
          .filter(nome => nome.startsWith('album-copa-') && nome !== CACHE_NAME)
          .map(nome => caches.delete(nome))
      );
      // Assume controle de todas as abas abertas imediatamente.
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('https://bielmurbak.github.io')) return;

  const url = new URL(event.request.url);
  const ehArquivoPrincipal =
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css');

  if (ehArquivoPrincipal) {
    // Network-first: tenta buscar a versão mais nova primeiro.
    // Garante que HTML/JS/CSS atualizem rápido mesmo que o APP_VERSION
    // não tenha sido incrementado manualmente nesse deploy.
    // Se não tiver internet, cai para o cache (mantém o app funcionando offline).
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copia = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Demais arquivos (imagens, ícones, json de dados): cache-first com atualização em segundo plano.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    )
  );
});
