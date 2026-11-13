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
      await page.waitForSelector("#modeSelectModal", { state: "attached", timeout: 45000 });
      await page.waitForSelector(".tmh-footer-main #tmhCloudBackupBtn", { state: "attached", timeout: 15000 });
      await page.waitForSelector(".tmh-footer-main #actPrintBtnV5", { state: "attached", timeout: 15000 });
      await page.waitForSelector(".tmh-footer-main #btnFindUnfilled", { state: "attached", timeout: 15000 });
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
        iframes: document.querySelectorAll("iframe:not(#devPrevFrame)").length,
        parentAuthPending: !!document.getElementById("tmhParentAuthPending"),
        topbar: !!document.querySelector(".topbar"),
        cloudBackup: !!document.getElementById("tmhCloudBackupBtn"),
        cloudRestore: !!document.getElementById("tmhCloudRestoreBtn"),
        footerMain: Array.from(document.querySelector(".tmh-footer-main")?.children || []).map((element) => element.id || element.className),
        headerTheme: !!document.querySelector(".topbar > #themeSwitch"),
        headerAccountControls: ["tmh-account-link", "logout-btn"].every((name) => !!document.querySelector("#userInfo ." + name)),
        headerRows: !!document.querySelector(".topbar #tmhUnifiedModeSwitch") && !!document.querySelector(".topbar #userInfo"),
        headerRoute: !!document.querySelector(".topbar > #btnRouteView"),
        footerMoreActions: ["btnSave", "btnSaveHtml", "btnExport", "btnExportWithPhotos", "btnExportJson", "btnImportJson", "jsonFileInput", "btnPrint", "btnReset", "tmhCloudRestoreBtn"].filter((id) => {
          const element = document.getElementById(id);
          return !!element && !!element.closest(".tmh-footer-more-grid");
        }),
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
      assert.deepEqual(state.footerMain, ["tmhCloudBackupBtn", "actPrintBtnV5", mode === "hydro" ? "btnExportWithPhotos" : "btnExport", "btnFindUnfilled"]);
      assert.equal(state.headerTheme, true);
      assert.equal(state.headerRows, true);
      assert.equal(state.headerAccountControls, true);
      assert.equal(state.headerRoute, mode === "complex" || mode === "housings");
      assert.ok(state.footerMoreActions.includes("tmhCloudRestoreBtn"));
      assert.ok(state.footerMoreActions.includes("btnSave"));
      assert.ok(state.footerMoreActions.includes("btnExportJson"));
      assert.ok(state.footerMoreActions.includes("btnReset"));
      assert.ok(state.footerMoreActions.includes("jsonFileInput"));
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
    await page.waitForSelector("#modeSelectModal", { state: "attached", timeout: 45000 });
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
    await page.waitForSelector("#modeSelectModal", { state: "attached", timeout: 45000 });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, { timeout: 30000 });
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
    try {
      await page.waitForSelector("#modeSelectModal", { state: "attached", timeout: 45000 });
    } catch (error) {
      const diagnostics = await page.evaluate(async () => ({
        url: location.href,
        readyState: document.readyState,
        title: document.title,
        bodyText: document.body?.innerText?.slice(0, 1200) || "",
        controller: !!navigator.serviceWorker.controller,
        registrations: await navigator.serviceWorker.getRegistrations().then((items) =>
          items.map((item) => ({ scope: item.scope, active: item.active?.state || null }))
        ),
        cacheNames: await caches.keys(),
        routeCache: await caches.open("checklist-cache-v113").then((cache) =>
          cache.match("/prototype/checklist/index.html").then((response) => !!response)
        ).catch(() => false)
      }));
      throw new Error("Offline checklist navigation failed: " + JSON.stringify(diagnostics) + "; " + error.message);
    }
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

test("mobile footer keeps primary actions and the unfilled search usable at 360-430px", async () => {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.route("https://esm.sh/**", (route) => route.abort());
  await page.route("https://fecigiwjtbtabnsfsdym.supabase.co/**", (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "No user", code: "invalid_token" }) })
  );
  try {
    await page.goto(origin + "/prototype/checklist/?mode=complex", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector(".tmh-footer-main #tmhCloudBackupBtn", { state: "attached", timeout: 45000 });
    await page.waitForSelector(".tmh-footer-main #actPrintBtnV5", { state: "attached", timeout: 15000 });
    await page.waitForSelector(".tmh-footer-main #btnFindUnfilled", { state: "attached", timeout: 15000 });
    for (const width of [360, 390, 430]) {
      await page.setViewportSize({ width, height: 800 });
      const layout = await page.evaluate(() => {
        const footer = document.querySelector(".footbar");
        const main = document.querySelector(".tmh-footer-main");
        const primary = ["tmhCloudBackupBtn", "actPrintBtnV5", "btnExport", "btnFindUnfilled"];
        const boxes = primary.map((id) => {
          const rect = document.getElementById(id).getBoundingClientRect();
          return { id, width: rect.width, height: rect.height, right: rect.right };
        });
        const find = document.getElementById("btnFindUnfilled").getBoundingClientRect();
        return {
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          footerWidth: footer.getBoundingClientRect().width,
          mainColumns: getComputedStyle(main).gridTemplateColumns.split(" ").length,
          boxes,
          findWidth: find.width,
          findHeight: find.height,
          findRight: find.right
        };
      });
      assert.equal(layout.document, layout.viewport, "footer must not create horizontal overflow at " + width + "px: " + JSON.stringify(layout));
      assert.equal(layout.mainColumns, 4, JSON.stringify(layout));
      assert.ok(layout.boxes.every((box) => box.width >= 65 && box.height >= 44 && box.right <= width), JSON.stringify(layout));
      assert.ok(layout.boxes[3].width >= 65 && layout.boxes[3].height >= 44, JSON.stringify(layout));
    }
    await page.evaluate(() => { const modal = document.getElementById("loginModal"); if (modal) modal.style.display = "none"; });
    await page.locator(".tmh-footer-more > summary").click();
    for (const id of ["btnSave", "btnSaveHtml", "btnExportJson", "btnImportJson", "btnReset", "tmhCloudRestoreBtn"]) {
      await page.waitForFunction((target) => {
        const element = document.getElementById(target);
        return !!element && !!element.closest(".tmh-footer-more-grid");
      }, id);
    }
  } finally {
    await page.close();
  }
});

test("mobile checklist header and form fit 360/390/430px in all five modes", async () => {
  for (const mode of ["complex", "housings", "tt", "bi", "hydro"]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.route("https://esm.sh/**", (route) => route.abort());
    await page.route("https://fecigiwjtbtabnsfsdym.supabase.co/**", (route) =>
      route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "No user", code: "invalid_token" }) })
    );
    try {
      await page.goto(origin + "/prototype/checklist/?mode=" + mode, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#modeSelectModal", { state: "attached" });
      await page.evaluate(() => { const modal = document.getElementById("loginModal"); if (modal) modal.style.display = "flex"; });
      for (const width of [360, 390, 430]) {
        await page.setViewportSize({ width, height: 844 });
        const layout = await page.evaluate(() => {
          const select = document.querySelector("#modePickerBtn");
          const input = document.querySelector("#loginModal .field input, #loginModal .field select");
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
        assert.equal(layout.document, layout.viewport, mode + " must not scroll horizontally at " + width + "px: " + JSON.stringify(layout));
        assert.ok(layout.modeSelect >= 100, mode + " " + JSON.stringify(layout));
        assert.ok(layout.modeHeight >= 32, mode + " " + JSON.stringify(layout));
        assert.ok(layout.inputWidth > 0 && layout.inputWidth <= layout.viewport, mode + " " + JSON.stringify(layout));
        assert.ok(parseFloat(layout.modeFont) >= 10, mode + " " + JSON.stringify(layout));
        assert.ok(layout.headerWidth <= layout.viewport, mode + " " + JSON.stringify(layout));
      }
    } finally {
      await page.close();
    }
  }
});


test("IndexedDB rolls back a snapshot write when the matching queue insert fails", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(origin + "/prototype/checklist/?mode=hydro", { waitUntil: "domcontentloaded", timeout: 45000 });
    const result = await page.evaluate(async () => {
      const { createOfflineVaultDatabase } = await import("/prototype/offline-vault-db.js");
      const database = createOfflineVaultDatabase({ dbName: "tmh-atomic-rollback-" + crypto.randomUUID() });
      const userId = "11111111-1111-4111-8111-111111111111";
      const encrypted = (value) => ({ version: 1, iv: "test-iv", ciphertext: JSON.stringify(value) });
      const first = encrypted({ revision: "original" });
      const attempted = encrypted({ revision: "should-rollback" });
      try {
        await database.putRecordAndEnqueue({
          id: "checklist-atomic", userId, kind: "checklist",
          encrypted: first, opId: "duplicate-op", entityId: "cloud-checklist",
          operation: "create", createdAt: "2026-11-10T10:00:00.000Z",
        });
        let rejected = false;
        let errorName = "";
        try {
          await database.putRecordAndCoalesceQueue({
            id: "checklist-atomic", userId, kind: "checklist",
            encrypted: attempted, opId: "duplicate-op", entityId: "different-cloud-checklist",
            operation: "update", createdAt: "2026-11-10T10:01:00.000Z",
          });
        } catch (error) {
          rejected = true;
          errorName = error.name;
        }
        const record = await database.getRecord("checklist-atomic", userId);
        const pending = await database.listPending(userId);
        return {
          rejected,
          errorName,
          recordCiphertext: record?.encrypted?.ciphertext,
          expectedCiphertext: first.ciphertext,
          pendingCount: pending.length,
          pendingOperation: pending[0]?.operation,
          pendingCiphertext: pending[0]?.encrypted?.ciphertext,
        };
      } finally {
        await database.close();
      }
    });
    assert.equal(result.rejected, true);
    assert.equal(result.errorName, "ConstraintError");
    assert.equal(result.recordCiphertext, result.expectedCiphertext);
    assert.equal(result.pendingCount, 1);
    assert.equal(result.pendingOperation, "create");
    assert.equal(result.pendingCiphertext, result.expectedCiphertext);
  } finally {
    await page.close();
  }
});


test("IndexedDB keeps records, queued operations and conflicts isolated for two accounts on one device", async () => {
  const page = await browser.newPage();
  const dbName = "tmh-two-user-isolation-" + crypto.randomUUID();
  const userA = "11111111-1111-4111-8111-111111111111";
  const userB = "22222222-2222-4222-8222-222222222222";
  const encryptedA = { version: 1, iv: "iv-a", ciphertext: "cipher-a" };
  const encryptedB = { version: 1, iv: "iv-b", ciphertext: "cipher-b" };
  try {
    await page.goto(origin + "/prototype/checklist/?mode=hydro", { waitUntil: "domcontentloaded", timeout: 45000 });
    const result = await page.evaluate(async ({ dbName, userA, userB, encryptedA, encryptedB }) => {
      const { createOfflineVaultDatabase } = await import("/prototype/offline-vault-db.js");
      const database = createOfflineVaultDatabase({ dbName });
      try {
        for (const [userId, encrypted] of [[userA, encryptedA], [userB, encryptedB]]) {
          await database.putRecord({
            id: "same-record-id", userId, kind: "checklist-snapshot", encrypted,
          });
          await database.enqueue({
            opId: "same-operation-id", userId, entityId: "same-cloud-id",
            operation: "update", encrypted,
          });
          await database.saveConflict({
            conflictId: "same-conflict-id", userId, entityId: "same-cloud-id",
            localEncrypted: encrypted, remoteEncrypted: encrypted,
          });
        }
        const [recordsA, recordsB, pendingA, pendingB, conflictsA, conflictsB] = await Promise.all([
          database.listRecords(userA), database.listRecords(userB),
          database.listPending(userA), database.listPending(userB),
          database.listConflicts(userA), database.listConflicts(userB),
        ]);
        return {
          recordA: (await database.getRecord("same-record-id", userA))?.encrypted?.ciphertext,
          recordB: (await database.getRecord("same-record-id", userB))?.encrypted?.ciphertext,
          recordsA: recordsA.length, recordsB: recordsB.length,
          pendingA: pendingA.map(row => row.encrypted.ciphertext),
          pendingB: pendingB.map(row => row.encrypted.ciphertext),
          conflictsA: conflictsA.map(row => row.localEncrypted.ciphertext),
          conflictsB: conflictsB.map(row => row.localEncrypted.ciphertext),
        };
      } finally {
        await database.close();
      }
    }, { dbName, userA, userB, encryptedA, encryptedB });
    assert.equal(result.recordA, encryptedA.ciphertext);
    assert.equal(result.recordB, encryptedB.ciphertext);
    assert.equal(result.recordsA, 1);
    assert.equal(result.recordsB, 1);
    assert.deepEqual(result.pendingA, [encryptedA.ciphertext]);
    assert.deepEqual(result.pendingB, [encryptedB.ciphertext]);
    assert.deepEqual(result.conflictsA, [encryptedA.ciphertext]);
    assert.deepEqual(result.conflictsB, [encryptedB.ciphertext]);
  } finally {
    await page.close();
  }
});


test("offline vault restores encrypted checklist, pending queue, conflict and expired lease after browser reload", async () => {
  const page = await browser.newPage();
  const dbName = "tmh-reload-recovery-" + crypto.randomUUID();
  const userId = "11111111-1111-4111-8111-111111111111";
  const entityId = "reload-checklist";
  const encryptedLocal = { version: 1, iv: "reload-iv-local", ciphertext: "encrypted-local-payload" };
  const encryptedRemote = { version: 1, iv: "reload-iv-remote", ciphertext: "encrypted-remote-payload" };
  const baseTime = "2026-11-10T10:00:00.000Z";
  try {
    await page.goto(origin + "/prototype/checklist/?mode=hydro", { waitUntil: "domcontentloaded", timeout: 45000 });
    const beforeReload = await page.evaluate(async ({ dbName, userId, entityId, encryptedLocal, encryptedRemote, baseTime }) => {
      const { createOfflineVaultDatabase } = await import("/prototype/offline-vault-db.js");
      const database = createOfflineVaultDatabase({ dbName });
      await database.putRecordAndEnqueue({
        id: "reload-record", userId, kind: "checklist", encrypted: encryptedLocal,
        opId: "reload-operation", entityId, operation: "update", createdAt: baseTime, updatedAt: baseTime,
      });
      await database.saveConflict({
        conflictId: "reload-conflict", userId, entityId,
        localEncrypted: encryptedLocal, remoteEncrypted: encryptedRemote, createdAt: baseTime,
      });
      await database.setMeta("reload-marker", { saved: true, version: 4 });
      const claimed = await database.claimQueueOperation(
        "reload-operation", userId, "old-tab-claim", baseTime,
        "2026-11-10T10:05:00.000Z"
      );
      await database.close();
      return { claimed };
    }, { dbName, userId, entityId, encryptedLocal, encryptedRemote, baseTime });
    assert.equal(beforeReload.claimed, true);

    await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
    const afterReload = await page.evaluate(async ({ dbName, userId, entityId }) => {
      const { createOfflineVaultDatabase } = await import("/prototype/offline-vault-db.js");
      const database = createOfflineVaultDatabase({ dbName });
      try {
        const record = await database.getRecord("reload-record", userId);
        const pending = await database.listPending(userId, "2026-11-10T10:06:00.000Z");
        const conflicts = await database.listConflicts(userId);
        const marker = await database.getMeta("reload-marker");
        const reclaimed = await database.claimQueueOperation(
          "reload-operation", userId, "new-tab-claim",
          "2026-11-10T10:06:00.000Z", "2026-11-10T10:11:00.000Z"
        );
        return {
          recordCiphertext: record?.encrypted?.ciphertext,
          pendingCount: pending.length,
          pendingStatus: pending[0]?.status,
          pendingClaim: pending[0]?.leaseClaimId,
          conflictCount: conflicts.length,
          conflictLocal: conflicts[0]?.localEncrypted?.ciphertext,
          conflictRemote: conflicts[0]?.remoteEncrypted?.ciphertext,
          marker,
          reclaimed,
          cloudState: await database.getCloudState(userId, entityId),
        };
      } finally {
        await database.close();
      }
    }, { dbName, userId, entityId });
    assert.equal(afterReload.recordCiphertext, encryptedLocal.ciphertext);
    assert.equal(afterReload.pendingCount, 1);
    assert.equal(afterReload.pendingStatus, "processing");
    assert.equal(afterReload.pendingClaim, "old-tab-claim");
    assert.equal(afterReload.conflictCount, 1);
    assert.equal(afterReload.conflictLocal, encryptedLocal.ciphertext);
    assert.equal(afterReload.conflictRemote, encryptedRemote.ciphertext);
    assert.deepEqual(afterReload.marker, { saved: true, version: 4 });
    assert.equal(afterReload.reclaimed, true);
    assert.equal(afterReload.cloudState, null);
  } finally {
    await page.close();
  }
});


test("standalone checklist mounts developer menu and all three existing tools for a developer", { timeout: 60000 }, async () => {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Auth check failed") && !message.text().includes("Failed to load resource")) {
      pageErrors.push("console: " + message.text());
    }
  });
  await page.route("https://esm.sh/**", (route) => route.abort());
  await page.route("https://fecigiwjtbtabnsfsdym.supabase.co/**", (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "Browser test: no signed-in user" }) })
  );
  try {
    await page.goto(origin + "/prototype/checklist/?mode=complex", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector("#modeSelectModal", { state: "attached", timeout: 45000 });
    await page.evaluate(() => localStorage.setItem("checklist_user", JSON.stringify({
      login: "developer-test@example.invalid",
      role: "admin",
      profileRole: "developer",
      dev: true,
      authUid: "00000000-0000-4000-8000-000000000001"
    })));
    await page.waitForFunction(() => {
      const button = document.getElementById("devFab");
      return button && getComputedStyle(button).display !== "none";
    }, { timeout: 10000 });
    await page.click("#devFab");
    await page.waitForSelector("#devMenu", { state: "visible" });
    const menuText = await page.locator("#devMenu").innerText();
    assert.match(menuText, /Конструктор оборудования/);
    assert.match(menuText, /Конструктор чек-листов/);
    assert.match(menuText, /Справочник \(Excel\)/);
    assert.equal(await page.evaluate(() => typeof window.__DEV_PANEL_V1__), "object");
    assert.equal(await page.evaluate(() => typeof window.__XL_PANEL_V1__), "object");
    await page.getByRole("menuitem", { name: /Конструктор оборудования/ }).click();
    await page.waitForFunction(() => document.getElementById("devOverlay")?.classList.contains("open"));
    await page.click("#devTabCk");
    await page.waitForSelector("#devNewCk", { state: "visible" });
    assert.deepEqual(pageErrors, []);
  } finally {
    await page.close();
  }
});
