// Версия кэша — увеличивайте при каждом обновлении файлов приложения,
// чтобы пользователи получили свежую версию.
const CACHE_VERSION = 'checklist-cache-v72';

// Основные файлы приложения ("оболочка"), которые должны быть доступны
// сразу после установки — без них приложение не откроется офлайн.
const APP_SHELL = [
  './',
  './index.html',
  './account.html',
  './examples.json',
  './oborudovanie.json',
  './zona_riska.xlsx',
  './instruction.html',
  './manifest.json',
  './prototype/embedded/tt.js',
  './prototype/embedded/bi.js',
  './prototype/embedded/hydro.js',
  './prototype/embedded/complex.js',
  './prototype/offline-vault-crypto.js',
  './prototype/offline-vault-db.js',
  './prototype/offline-vault-session.js',
  './prototype/offline-vault.js',
  './prototype/offline-checklist-store.js',
  './prototype/offline-checklist-instances.js',
  './prototype/offline-sync-runner.js',
  './prototype/offline-sync-coordinator.js',
  './prototype/offline-cloud-mapper.js',
  './prototype/offline-checklist-runtime.js',
  './prototype/offline-checklist-schema.js',
  './prototype/supabase-auth.js',
  './prototype/supabase-cloud-sync.js',
  './prototype/supabase-cloud-photos.js',
  './prototype/supabase-cloud-backup.js',
  './prototype/supabase-cloud-restore.js',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './img/manufacturer_pcp.jpg',
  './img/manufacturer_nika.jpg'
];

// Библиотеки с внешних CDN, нужные для экспорта в Excel.
// Кэшируются здесь же при установке — если в момент установки есть интернет,
// то Excel-экспорт будет работать и офлайн.
const CDN_LIBS = [
  'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
  'https://esm.sh/@supabase/supabase-js@2.118.0'
];

// Критический минимум: без этих двух URL приложение нельзя открыть офлайн.
const REQUIRED_APP_SHELL = ['./', './index.html'];
// Остальные ресурсы загружаются независимо: один отсутствующий файл не отменяет
// установку всего Service Worker. Ошибки сохраняются в диагностическом отчёте.
const OPTIONAL_APP_SHELL = APP_SHELL.filter((path) => !REQUIRED_APP_SHELL.includes(path));

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const requiredResults = await Promise.allSettled(
      REQUIRED_APP_SHELL.map(async (path) => {
        const response = await fetch(path, { cache: 'no-cache' });
        if (!response.ok) throw new Error(path + ': HTTP ' + response.status);
        await cache.put(path, response);
        return path;
      })
    );
    const requiredFailures = requiredResults
      .map((result, index) => result.status === 'rejected'
        ? { path: REQUIRED_APP_SHELL[index], error: String(result.reason) }
        : null)
      .filter(Boolean);
    if (requiredFailures.length) {
      // Не активируем новую версию, если главная страница не сохранена.
      throw new Error('Не удалось сохранить обязательные файлы: ' +
        requiredFailures.map((item) => item.path).join(', '));
    }

    const optionalResults = await Promise.allSettled(
      OPTIONAL_APP_SHELL.map(async (path) => {
        const response = await fetch(path, { cache: 'no-cache' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        await cache.put(path, response);
        return path;
      })
    );
    const failedOptional = optionalResults
      .map((result, index) => result.status === 'rejected'
        ? { path: OPTIONAL_APP_SHELL[index], error: String(result.reason) }
        : null)
      .filter(Boolean);

    const cdnResults = await Promise.allSettled(CDN_LIBS.map(async (url) => {
      const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      await cache.put(url, response);
    }));
    const failedCdn = cdnResults
      .map((result, index) => result.status === 'rejected'
        ? { url: CDN_LIBS[index], error: String(result.reason) }
        : null)
      .filter(Boolean);

    const report = {
      version: CACHE_VERSION,
      checkedAt: new Date().toISOString(),
      requiredCached: REQUIRED_APP_SHELL,
      optionalCached: (await Promise.all(OPTIONAL_APP_SHELL.map(async (path) =>
        (await cache.match(path)) ? path : null))).filter(Boolean),
      failedOptional,
      failedCdn
    };
    await cache.put('./__offline-cache-report.json', new Response(JSON.stringify(report), {
      headers: { 'Content-Type': 'application/json' }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const current = await caches.open(CACHE_VERSION);
    const indexReady = !!(await current.match('./index.html'));
    if (indexReady) {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter((key) => key.startsWith('checklist-cache-') && key !== CACHE_VERSION)
        .map((key) => caches.delete(key)));
    }
    await self.clients.claim();
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const reportResponse = await current.match('./__offline-cache-report.json');
    let report = null;
    if (reportResponse) {
      try { report = await reportResponse.json(); } catch (e) {}
    }
    windows.forEach((client) => client.postMessage({
      type: 'offline-cache-status',
      ready: indexReady,
      report
    }));
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Только GET-запросы имеет смысл кэшировать.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Supabase JS is an ESM graph: cache the package entry during install and
  // cache its versioned @supabase/* module imports as they are fetched online.
  // This allows the first (online) sign-in to warm the complete dependency graph.
  const isSupabaseEsm = url.origin === 'https://esm.sh' &&
    (url.pathname === '/@supabase/supabase-js@2.118.0' ||
     url.pathname.startsWith('/@supabase/'));
  const isCdnLib = CDN_LIBS.includes(req.url) || isSupabaseEsm;
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin && !isCdnLib) {
    // Прочие сторонние запросы (если появятся) не трогаем.
    return;
  }

  // Справочники должны быстро открываться из локальной копии даже при
  // медленном интернете. Сеть проверяем ограниченное время, а обновление кэша
  // продолжается в фоне. Если сеть недоступна, используем последнюю копию.
  if (isSameOrigin && /\/(zona_riska\.xlsx|oborudovanie\.json|examples\.json)$/.test(url.pathname)) {
    const key = new Request(url.origin + url.pathname);
    const networkPromise = fetch(req, { cache: 'no-store' }).then(async (resp) => {
      if (resp && resp.ok) {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(key, resp.clone());
      }
      return resp;
    });
    // Продлеваем жизнь Service Worker до завершения фонового обновления.
    event.waitUntil(networkPromise.catch(() => {}));
    event.respondWith((async () => {
      const cached = await caches.match(key);
      const timeoutMs = cached ? 1200 : 4000;
      const outcome = await Promise.race([
        networkPromise.then((response) => ({ response })).catch((error) => ({ error })),
        new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), timeoutMs))
      ]);
      if (outcome.response) return outcome.response;
      if (cached) return cached;
      if (outcome.error) throw outcome.error;
      return new Response('', { status: 504, statusText: 'Offline cache is not ready' });
    })());
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Кэш-прежде-всего: моментальный отклик офлайн.
        // Параллельно тихо обновляем кэш из сети, если она есть.
        // cache:'no-cache' — всегда проверять на сервере, а не брать копию из HTTP-кэша
        // (GitHub Pages разрешает кэшировать файлы на 10 минут).
        event.waitUntil(
          fetch(req, { cache: 'no-cache' })
            .then(async (resp) => {
              if (!(resp && resp.ok)) return;
              const cache = await caches.open(CACHE_VERSION);
              let changed = false;
              try {
                // Для главной страницы сравниваем свежую копию с сохранённой: если отличается — сообщаем странице.
                if (/(^|\/)(index\.html)?$/.test(url.pathname)) {
                  const old = await cache.match(req);
                  if (old) changed = (await old.clone().text()) !== (await resp.clone().text());
                }
              } catch (e) {}
              await cache.put(req, resp);
              if (changed) {
                const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
                cs.forEach((c) => c.postMessage({ type: 'update-available' }));
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
