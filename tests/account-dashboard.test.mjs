import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../account.html", import.meta.url), "utf8");

test("account dashboard displays total, completed, and in-progress checklist counters", () => {
  assert.match(html, /id="checklistCount"/);
  assert.match(html, /id="completedCount"/);
  assert.match(html, /id="inProgressCount"/);
  assert.match(html, /summarizeChecklistStatuses\(rows\)/);
});

test("account dashboard labels each cloud checklist using saved authoritative stats", () => {
  assert.match(html, /isChecklistComplete\(row\.stats\)/);
  assert.match(html, /✓ Выполнен/);
  assert.match(html, /В работе/);
  assert.match(html, /status\.className = "status-pill " \+ \(completed \? "done" : "progress"\)/);
});

test("account dashboard paginates all owned cloud checklists for accurate totals", () => {
  assert.match(html, /const pageSize = 500/);
  assert.match(html, /\.range\(offset, offset \+ pageSize - 1\)/);
  assert.match(html, /if \(page\.length < pageSize\) break/);
  assert.doesNotMatch(html, /\.limit\(50\)/);
});

test("account dashboard counters filter the cloud checklist list by status", () => {
  assert.match(html, /data-filter="all"/);
  assert.match(html, /data-filter="completed"/);
  assert.match(html, /data-filter="inProgress"/);
  assert.match(html, /activeChecklistFilter/);
  assert.match(html, /visibleRows = rows\.filter/);
  assert.match(html, /aria-pressed/);
});

test("account dashboard opens the selected cloud checklist in its matching mode", () => {
  assert.match(html, /openChecklist=/);
  assert.match(html, /&mode=/);
  assert.match(html, /open\.textContent = "Открыть"/);
});
