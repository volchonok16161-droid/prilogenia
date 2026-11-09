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

test("local device-key recovery is not treated as a Supabase session", async () => {
  const authSource = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");
  const runner = await readFile(new URL("../prototype/offline-sync-runner.js", import.meta.url), "utf8");
  assert.match(authSource, /supabaseAuthenticated: false/);
  assert.match(authSource, /mode: "offline-local-unlock"/);
  assert.match(runner, /assertVerifiedIdentity\(await authApi\.getCurrentIdentity\(\), uid\)/);
});
