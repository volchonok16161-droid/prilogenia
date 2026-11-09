import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { parse } from "acorn";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PATCH_IDS = [
  "__UNIVERSAL_PATCH_V2__", "__ORDER_CTOR_V4__", "__ROUTE_FIX_V1__",
  "__ROUTE_REGROUP_V2__", "__MFG_REF_PHOTOS_V5__", "__OKNOK_EXAMPLES_V1__",
  "__ACT_PRINT_V5__", "__EXPORT_PHOTO_GUARD_V2__", "__ADMIN_NO_LIMITS_V1__",
  "__MULTI_JSON_FIX_V5__"
];
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".css": "text/css; charset=utf-8"
};
let server;
let browser;
let origin;

before(async () => {
  server = createServer(async (req, res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      const file = resolve(ROOT, "." + pathname);
      if (!file.startsWith(ROOT + sep)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      const body = await readFile(file);
      const ext = file.slice(file.lastIndexOf("."));
      res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });
  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  origin = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolveClose) => server.close(resolveClose));
});

for (const mode of ["complex", "housings", "tt", "bi", "hydro"]) {
  test("standalone browser boots " + mode + " mode with no iframe or parent-auth dependency", async () => {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.stack || error.message));
    page.on("console", (message) => { if (message.type() === "error" && !message.text().includes("Auth check failed") && !message.text().includes("Failed to load resource")) pageErrors.push("console: " + message.text() + " @ " + JSON.stringify(message.location())); });
    await page.route("https://esm.sh/**", (route) => route.abort());
    await page.route("https://fecigiwjtbtabnsfsdym.supabase.co/**", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Browser test: no signed-in user", code: "invalid_token" })
      })
    );
    try {
      await page.addInitScript(() => { window.__standaloneTestErrors = []; window.addEventListener("error", (event) => window.__standaloneTestErrors.push({ message: event.message, filename: event.filename, line: event.lineno, column: event.colno })); });
      await page.goto(origin + "/prototype/checklist/?mode=" + mode, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForSelector("#modeSelectModal", { timeout: 45000 });
      await page.waitForFunction(() => document.readyState === "complete");
      await page.waitForTimeout(350);
      const state = await page.evaluate(async (ids) => ({
        selectedMode: document.querySelector("#modeSelectModal [data-tmh-mode][aria-current=\"page\"]")?.getAttribute("data-tmh-mode") || null,
        baseURI: document.baseURI,
        examplePhotoChecks: await (async () => {
          const response = await fetch("/examples.json");
          if (!response.ok) return [{ path: "/examples.json", status: response.status }];
          const manifest = await response.json();
          const paths = [...new Set(Object.values(manifest.items || {}).flatMap((item) => Object.values(item)))];
          return Promise.all(paths.map(async (path) => {
            const result = await fetch(path);
            return { path, status: result.status };
          }));
        })(),
        iframes: document.querySelectorAll("iframe").length,
        parentAuthPending: !!document.getElementById("tmhParentAuthPending"),
        topbar: !!document.querySelector(".topbar"),
        cloudBackup: !!document.getElementById("tmhCloudBackupBtn"),
        cloudRestore: !!document.getElementById("tmhCloudRestoreBtn"),
        patches: ids.filter((id) => !!document.getElementById(id)),
        patchParentRefs: ids.filter((id) => (document.getElementById(id)?.textContent || "").includes("window.parent")),
        hasCloudContext: typeof window.__TMH_GET_CLOUD_BACKUP_CONTEXT === "function",
        runtimeErrors: window.__standaloneTestErrors,
        inlineScripts: Array.from(document.scripts).flatMap((script, index) => {
          if (script.src || script.type === "module" || !script.textContent.trim()) return [];
          return [{ id: script.id || "inline-" + index, code: script.textContent }];
        })
      }), PATCH_IDS);
      assert.equal(state.selectedMode, mode);
      assert.equal(state.baseURI, origin + "/");
      assert.ok(state.examplePhotoChecks.length > 0);
      assert.ok(state.examplePhotoChecks.every((item) => item.status === 200), JSON.stringify(state.examplePhotoChecks));
      assert.equal(state.iframes, 0);
      assert.equal(state.parentAuthPending, false);
      assert.equal(state.topbar, true);
      assert.equal(state.cloudBackup, true);
      assert.equal(state.cloudRestore, true);
      assert.deepEqual(state.patches, PATCH_IDS);
      assert.deepEqual(state.patchParentRefs, []);
      assert.equal(state.hasCloudContext, true);
      state.inlineSyntaxErrors = state.inlineScripts.flatMap((script) => {
        try { parse(script.code, { ecmaVersion: "latest", sourceType: "script" }); return []; }
        catch (error) {
          const pos = Number.isInteger(error.pos) ? error.pos : 0;
          return [{ id: script.id, error: error.message, loc: error.loc, snippet: script.code.slice(Math.max(0, pos - 120), pos + 120), charCode: script.code.charCodeAt(pos) }];
        }
      });
      delete state.inlineScripts;
      assert.deepEqual(state.inlineSyntaxErrors, []);
      assert.deepEqual(state.runtimeErrors, []);
      assert.deepEqual(pageErrors, []);
    } finally {
      await page.close();
    }
  });
}

test("service worker reopens the standalone checklist after network loss", { timeout: 120000 }, async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error" &&
        !message.text().includes("Auth check failed") &&
        !message.text().includes("Failed to load resource")) {
      errors.push(message.text());
    }
  });
  await page.route("https://esm.sh/**", (route) => route.abort());
  await page.route("https://fecigiwjtbtabnsfsdym.supabase.co/**", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Browser test: no signed-in user", code: "invalid_token" })
    })
  );
  try {
    await page.goto(origin + "/prototype/checklist/?mode=hydro", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector("#modeSelectModal", { timeout: 45000 });
    await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) throw new Error("Service Worker is unavailable");
      const registration = await navigator.serviceWorker.register("/sw.js");
      const worker = registration.installing || registration.waiting || registration.active;
      if (!worker) throw new Error("Service Worker registration has no worker");
      if (worker.state !== "activated") {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Service Worker activation timed out: " + worker.state)), 30000);
          worker.addEventListener("statechange", () => {
            if (worker.state === "activated") { clearTimeout(timeout); resolve(); }
            if (worker.state === "redundant") { clearTimeout(timeout); reject(new Error("Service Worker became redundant")); }
          });
        });
      }
    });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector("#modeSelectModal", { timeout: 45000 });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, { timeout: 30000 });
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector("#modeSelectModal", { timeout: 45000 });
    const state = await page.evaluate(async () => ({
      mode: document.querySelector("#modeSelectModal [data-tmh-mode][aria-current=\"page\"]")?.getAttribute("data-tmh-mode") || null,
      offline: navigator.onLine === false,
      controlled: !!navigator.serviceWorker.controller,
      iframes: document.querySelectorAll("iframe").length,
      cachedPhotoStatus: (await fetch("/examples/e_11hwbr_ok_mvurndpt.jpg")).status
    }));
    assert.equal(state.mode, "hydro");
    assert.equal(state.offline, true);
    assert.equal(state.controlled, true);
    assert.equal(state.iframes, 0);
    assert.equal(state.cachedPhotoStatus, 200);
    assert.deepEqual(errors, []);
  } finally {
    await context.setOffline(false).catch(() => {});
    await context.close();
  }
});

test("mobile checklist header and form fit a narrow phone viewport", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.route("https://esm.sh/**", (route) => route.abort());
  await page.route("https://fecigiwjtbtabnsfsdym.supabase.co/**", (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "No user", code: "invalid_token" }) })
  );
  try {
    await page.goto(origin + "/prototype/checklist/?mode=complex", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#modeSelectModal");
    const layout = await page.evaluate(() => {
      const select = document.querySelector("#modePickerBtn");
      const input = document.querySelector(".field input, .field select");
      const header = document.querySelector(".topbar");
      return {
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        modeSelect: select ? Math.round(select.getBoundingClientRect().width) : 0,
        modeHeight: select ? Math.round(select.getBoundingClientRect().height) : 0,
        inputWidth: input ? Math.round(input.getBoundingClientRect().width) : 0,
        headerWidth: header ? Math.round(header.getBoundingClientRect().width) : 0,
        modeFont: select ? getComputedStyle(select).fontSize : null
      };
    });
    assert.equal(layout.document, layout.viewport, "mobile page must not scroll horizontally");
    assert.ok(layout.modeSelect >= 100, JSON.stringify(layout));
    assert.ok(layout.modeHeight >= 32, JSON.stringify(layout));
    assert.ok(layout.inputWidth > 0 && layout.inputWidth <= layout.viewport, JSON.stringify(layout));
    assert.ok(parseFloat(layout.modeFont) >= 11, JSON.stringify(layout));
  } finally {
    await page.close();
  }
});
