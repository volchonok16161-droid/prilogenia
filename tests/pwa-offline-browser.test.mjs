import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

test("checklist entry point opens again from the service-worker cache without network", async (t) => {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      const relative = pathname === "/" ? "index.html" : pathname.slice(1) + (pathname.endsWith("/") ? "index.html" : "");
      const file = resolve(root, relative);
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      const info = await stat(file);
      if (!info.isFile()) throw new Error("Not a file");
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": mime[extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });

  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  let browser;
  t.after(async () => {
    if (browser) await browser.close();
    await new Promise((resolveClose) => server.close(resolveClose));
  });

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "allow" });
  const page = await context.newPage();

  await page.goto(origin + "/prototype/checklist/", { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true });
      });
    }
  });

  const onlineState = await page.evaluate(async () => ({
    manifest: document.querySelector('link[rel="manifest"]')?.href,
    controller: !!navigator.serviceWorker.controller,
    cachedEntry: !!(await caches.match("/prototype/checklist/index.html")),
  }));
  assert.equal(onlineState.manifest, origin + "/manifest.json");
  assert.equal(onlineState.controller, true, "the checklist must be controlled by its service worker");
  assert.equal(onlineState.cachedEntry, true, "the checklist entry HTML must be precached");

  await context.setOffline(true);
  await page.goto(origin + "/prototype/checklist/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const heading = document.querySelector(".topbar .brand .title-block h1") || document.querySelector("main h1");
    return !!heading && /Чек-лист|Загрузка чек-листа/i.test(heading.textContent || "");
  }, { timeout: 10000 });
  const heading = await page.locator(".topbar .brand .title-block h1, main h1").first().textContent();
  assert.match(heading, /Чек-лист|Загрузка чек-листа/i);
  assert.equal(new URL(page.url()).pathname, "/prototype/checklist/");
});
