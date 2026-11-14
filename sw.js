// Версия кэша — увеличивайте при каждом обновлении файлов приложения,
// чтобы пользователи получили свежую версию.
const CACHE_VERSION = 'checklist-cache-v132';

// Основные файлы приложения ("оболочка"), которые должны быть доступны
// сразу после установки — без них приложение не откроется офлайн.
const APP_SHELL = [
  './',
  './index.html',
  './prototype/checklist/index.html',
  './account.html',
  './employee-login.html',
  './examples.json',
  './oborudovanie.json',
  './zona_riska.xlsx',
  './instruction.html',
  './manifest.json',
  './prototype/embedded/tt.js',
  './prototype/embedded/bi.js',
  './prototype/embedded/hydro.js',
  './prototype/embedded/complex.js',
  './prototype/checklist-runtime.js',
  './prototype/developer-tools-runtime.js',
  './prototype/standalone-patches.js',
  './prototype/checklist-risk-core.js',
  './prototype/checklist-risk-viewer.js',
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
  './prototype/checklist-status.js',
  './prototype/supabase-cloud-delete.js',
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
  './examples/e_11hwbr_ok_mvurndpt.jpg',
  './examples/e_1bsfymh_nok_mw7ky4gj.jpg',
  './examples/e_1bsfymh_ok_mw7kuj7s.jpg',
  './examples/e_1ewky5i_nok_mwae4avk.jpg',
  './examples/e_1ewky5i_ok_mwae270j.jpg',
  './examples/e_1f6kjuh_ok_mw3cskr3.jpg',
  './examples/e_34genw_nok_mw3ctx4g.jpg',
  './examples/e_34genw_ok_mw3cweof.jpg',
  './examples/e_4f4g6q_ok_mw3c1xep.jpg',
  './examples/e_60lj59_nok_mw90im9y.jpg',
  './examples/e_60lj59_ok_mw3bue26.jpg',
  './examples/e_8xwyuc_nok_mw908eo0.jpg',
  './examples/e_8xwyuc_ok_mw3bvqck.jpg',
  './examples/e_97wkjb_nok_mw90eg5z.jpg',
  './examples/e_97wkjb_ok_mw3cr629.jpg',
  './examples/e_9hw68a_nok_mw904sar.jpg',
  './examples/e_9hw68a_ok_mw3cnf1c.jpg',
  './examples/e_bt562a_ok_mw3cyrza.jpg',
  './examples/e_ccb29u_nok_mw3c5tbl.jpg',
  './examples/e_l6lc2o_nok_mw912aau.jpg',
  './examples/e_l6lc2o_ok_mw913qz1.jpg',
  './examples/e_lgkxrn_ok_mw90d5j3.jpg',
  './examples/e_mlo8xh_ok_mwdlfvn9.jpg',
  './examples/e_1t0dv68_ok_mwejlrk5.jpg',
  './examples/e_m0k55l_nok_mw90bijk.jpg',
  './examples/e_m0k55l_ok_mw909xe1.jpg',
  './examples/e_mv5ci4_nok_mw3cke16.jpg',
  './examples/e_mv5ci4_ok_mw3cfvu3.jpg',
  './examples/e_n4ijxh_nok_mw919d1g.jpg',
  './examples/e_n4ijxh_ok_mw917yrw.jpg',
  './examples/e_nf4jw2_nok_mwagxj2x.jpg',
  './examples/e_nf4jw2_ok_mw3c8x03.jpg',
  './examples/e_og93o0_ok_mwaf68eq.jpg',
  './examples/e_tlpx9k_nok_mwaezl2a.jpg',
  './examples/e_tlpx9k_ok_mwaexu18.jpg',
  './examples/e_tnpuzo_nok_mw90wp2u.jpg',
  './examples/e_tnpuzo_ok_mw95gfk0.jpg',
  './examples/e_tvpiyj_nok_mw90mqmv.jpg',
  './examples/e_tvpiyj_ok_mwaf133a.jpg',
  './examples/e_u7p2dm_nok_mwadzp56.jpg',
  './examples/e_u7p2dm_ok_mwady3cq.jpg',
  './examples/e_v9njfe_nok_mw90r79x.jpg',
  './examples/e_v9njfe_ok_mw90szhq.jpg',
  './examples/e_wiqyko_nok_mw90gtnr.jpg',
  './examples/e_wiqyko_ok_mw3caqgz.jpg',
  './examples/e_wsqk9n_nok_mwagw3eh.jpg',
  './examples/e_xcprnl_nok_mw3d1zxm.jpg',
  './examples/e_xt23tv_nok_mw91c917.jpg',
  './examples/e_xt23tv_ok_mw7kw1nl.jpg',
  './examples/e_y6okqi_nok_mw3catkd.jpg',
  './examples/e_ygo6fh_nok_mw3ccza2.jpg',
  './examples/e_ygo6fh_ok_mwaguclv.jpg',
  './img/manufacturer_nika.jpg'
];

// Библиотеки с внешних CDN, нужные для экспорта в Excel.
// Кэшируются здесь же при установке — если в момент установки есть интернет,
// то Excel-экспорт будет работать и офлайн.
const CDN_LIBS = [
  'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
  'https://esm.sh/@supabase/supabase-js@2.118.0'
];

// Only explicitly listed same-origin application assets may enter Cache Storage.
// In particular, API endpoints and user-specific responses must stay network-only.
const APP_SHELL_PATHS = new Set(
  APP_SHELL.map((path) => new URL(path, self.location.href).pathname)
);
// The browser navigates to this clean route, while install precaches its index.html.
APP_SHELL_PATHS.add(new URL('./prototype/checklist/', self.location.href).pathname);
APP_SHELL_PATHS.add(new URL('./prototype/checklist', self.location.href).pathname);

// Критический минимум: без этих двух URL приложение нельзя открыть офлайн.
const REQUIRED_APP_SHELL = ['./', './index.html', './prototype/checklist/index.html'];
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
  if (isSameOrigin && !APP_SHELL_PATHS.has(url.pathname)) {
    // Same-origin API, персональные данные и произвольные динамические ответы
    // никогда не сохраняем в Cache Storage. Кэшируем только app shell.
    return;
  }

  const isChecklistRoute = isSameOrigin &&
    (url.pathname === '/prototype/checklist/' || url.pathname === '/prototype/checklist');
  const cacheRequest = isChecklistRoute
    ? new Request(new URL('./prototype/checklist/index.html', self.location.href))
    : isSameOrigin
      ? new Request(url.origin + url.pathname)
      : req;

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
    caches.match(cacheRequest).then((cached) => {
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
                  const old = await cache.match(cacheRequest);
                  if (old) changed = (await old.clone().text()) !== (await resp.clone().text());
                }
              } catch (e) {}
              if (isCdnLib) await cache.put(req, resp);
              else await cache.put(cacheRequest, resp);
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
            caches.open(CACHE_VERSION).then((cache) => cache.put(isCdnLib ? req : cacheRequest, copy));
          }
          return resp;
        })
        .catch(async () => {
          // Сети нет и в кэше нет — для навигации отдаём главную страницу,
          // чтобы приложение хотя бы открылось.
          if (req.mode === 'navigate') {
            // Keep the unified checklist route on its own cached entry point.
            // Falling back to the legacy root page would silently reopen the old iframe app.
            if (url.pathname === '/prototype/checklist/' || url.pathname === '/prototype/checklist') {
              return (await caches.match('./prototype/checklist/index.html')) ||
                caches.match('./index.html');
            }
            return caches.match('./index.html');
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        });
    })
  );
});
