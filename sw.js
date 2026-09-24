// Версия кэша — увеличивайте при каждом обновлении файлов приложения,
// чтобы пользователи получили свежую версию.
const CACHE_VERSION = 'checklist-cache-v5';

// Основные файлы приложения ("оболочка"), которые должны быть доступны
// сразу после установки — без них приложение не откроется офлайн.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
'./img/manufacturer_pcp.jpg',   // ← добавили
  './img/manufacturer_nika.jpg'   // ← добавили
];

// Библиотеки с внешних CDN, нужные для экспорта в Excel.
// Кэшируются здесь же при установке — если в момент установки есть интернет,
// то Excel-экспорт будет работать и офлайн.
const CDN_LIBS = [
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Кэшируем оболочку — критично для работы офлайн.
      const shellPromise = cache.addAll(APP_SHELL);
      // Кэшируем CDN-библиотеки best-effort: если сети нет прямо сейчас,
      // не проваливаем установку — просто попробуем закэшировать их
      // позже, при первом успешном запросе (см. fetch-обработчик ниже).
      const cdnPromise = Promise.all(
        CDN_LIBS.map((url) =>
          fetch(url, { mode: 'cors' })
            .then((resp) => (resp && resp.ok ? cache.put(url, resp) : null))
            .catch(() => null)
        )
      );
      return Promise.all([shellPromise, cdnPromise]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Только GET-запросы имеет смысл кэшировать.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isCdnLib = CDN_LIBS.includes(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin && !isCdnLib) {
    // Прочие сторонние запросы (если появятся) не трогаем.
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Кэш-прежде-всего: моментальный отклик офлайн.
        // Параллельно тихо обновляем кэш из сети, если она есть.
        event.waitUntil(
          fetch(req)
            .then((resp) => {
              if (resp && resp.ok) {
                caches.open(CACHE_VERSION).then((cache) => cache.put(req, resp));
              }
            })
            .catch(() => {})
        );
        return cached;
      }

      // Не в кэше — идём в сеть, и если получилось, сохраняем на будущее.
      return fetch(req)
        .then((resp) => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return resp;
        })
        .catch(() => {
          // Сети нет и в кэше нет — для навигации отдаём главную страницу,
          // чтобы приложение хотя бы открылось.
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        });
    })
  );
});
