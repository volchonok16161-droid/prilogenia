import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");

test("parent Supabase auth API exposes one shared offline vault factory", () => {
  assert.match(auth, /import \{ createOfflineVault \} from "\.\/offline-vault\.js"/);
  assert.match(auth, /const offlineVault = createOfflineVault\(\)/);
  assert.match(auth, /const api = Object\.freeze\(\{[\s\S]*?offlineVault,/);
  assert.match(auth, /window\.TMHAuth = api/);
  assert.match(auth, /window\.TMHAuthReady = Promise\.resolve\(api\)/);
});

test("offline vault exposure does not treat PIN unlock as Supabase authentication", async () => {
  const session = await readFile(new URL("../prototype/offline-vault-session.js", import.meta.url), "utf8");
  assert.match(session, /supabaseAuthenticated: false/);
  assert.match(session, /mode: "offline-local-unlock"/);
});
