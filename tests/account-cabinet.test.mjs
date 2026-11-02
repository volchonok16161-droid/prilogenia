import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../account.html", import.meta.url), "utf8");

test("account cabinet uses the shared Supabase Auth module", () => {
  assert.match(html, /prototype\/supabase-auth\.js/);
  assert.match(html, /await window\.TMHAuthReady/);
  assert.match(html, /getCurrentIdentity\(\)/);
  assert.match(html, /location\.replace\("\.\/index\.html"\)/);
});

test("account cabinet loads only the signed-in user's cloud checklists", () => {
  assert.match(html, /\.from\("checklists"\)/);
  assert.match(html, /\.eq\("owner_id", user\.id\)/);
  assert.match(html, /\.select\("id,title,equipment_type,revision,created_at,updated_at"\)/);
  assert.match(html, /\.limit\(50\)/);
});

test("account cabinet renders database content as text, not injected HTML", () => {
  assert.match(html, /title\.textContent = row\.title/);
  assert.match(html, /meta\.textContent =/);
  assert.match(html, /info\.append\(title, meta\)/);
  assert.doesNotMatch(html, /innerHTML\s*=/);
});

test("account cabinet exposes a real Supabase sign-out action", () => {
  assert.match(html, /window\.TMHAuth\.signOut\(\)/);
  assert.match(html, /location\.replace\("\.\/index\.html"\)/);
});

test("account cabinet is read-only and contains no demo identity or fake counters", () => {
  assert.doesNotMatch(html, /Иван Петров|12\s*<\/div>|демонстрационные сведения/i);
  assert.doesNotMatch(html, /\.insert\(|\.update\(|\.upsert\(|\.delete\(/);
  assert.match(html, /Облачных копий пока нет/);
});
