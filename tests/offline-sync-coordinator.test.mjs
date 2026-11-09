import test from "node:test";
import assert from "node:assert/strict";
import { createOfflineSyncCoordinator } from "../prototype/offline-sync-coordinator.js";

const UID = "11111111-1111-4111-8111-111111111111";
const identity = { user: { id: UID }, profile: { id: UID, role: "employee" }, error: null };

function target() {
  const listeners = new Map();
  return {
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
    },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    dispatch(name) { for (const fn of [...(listeners.get(name) || [])]) fn(); },
    count(name) { return listeners.get(name)?.size || 0; },
  };
}

function fixture({ online = true, currentIdentity = identity, sync } = {}) {
  const windowTarget = target();
  const documentTarget = target();
  const calls = [];
  const statuses = [];
  const authApi = {
    async getCurrentIdentity() {
      calls.push("identity");
      if (typeof currentIdentity === "function") return currentIdentity();
      return currentIdentity;
    },
  };
  const syncRunner = {
    async syncPending(args) {
      calls.push(["sync", args.userId]);
      if (sync) return sync(args);
      return { status: "synced", processed: 1, synced: 1, conflicts: 0, remaining: 0 };
    },
  };
  const coordinator = createOfflineSyncCoordinator({
    authApi, syncRunner, isOnline: () => online,
    eventTarget: windowTarget, documentTarget,
    onStatus: value => statuses.push(value),
  });
  return { coordinator, windowTarget, documentTarget, calls, statuses };
}

test("startup sync requires a fresh server-verified identity", async () => {
  const { coordinator, calls, statuses } = fixture();
  const result = await coordinator.start();
  assert.equal(result.status, "synced");
  assert.deepEqual(calls, ["identity", ["sync", UID]]);
  assert.equal(statuses.at(-1).status, "synced");
});

test("a local device identity without a verified profile never reaches the runner", async () => {
  const { coordinator, calls } = fixture({
    currentIdentity: { user: { id: UID }, profile: null, error: null },
  });
  const result = await coordinator.syncNow();
  assert.equal(result.status, "auth-required");
  assert.deepEqual(calls, ["identity"]);
});

test("offline startup does not ask for identity or inspect the queue", async () => {
  const { coordinator, calls } = fixture({ online: false });
  const result = await coordinator.start();
  assert.equal(result.status, "offline");
  assert.deepEqual(calls, []);
});

test("reconnect and visibility events trigger a sync", async () => {
  const { coordinator, windowTarget, documentTarget, calls } = fixture();
  await coordinator.start();
  windowTarget.dispatch("online");
  await new Promise(resolve => setImmediate(resolve));
  documentTarget.dispatch("visibilitychange");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.filter(x => x === "identity").length, 3);
  assert.equal(calls.filter(x => Array.isArray(x) && x[0] === "sync").length, 3);
});

test("concurrent reconnect events share one in-flight sync", async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const { coordinator, windowTarget, calls } = fixture({
    sync: async () => { await gate; return { status: "synced", processed: 1, synced: 1, conflicts: 0, remaining: 0 }; },
  });
  const initial = coordinator.start();
  await new Promise(resolve => setImmediate(resolve));
  windowTarget.dispatch("online");
  windowTarget.dispatch("pageshow");
  assert.equal(calls.filter(x => x === "identity").length, 1);
  release();
  await initial;
});

test("stop removes all event listeners", async () => {
  const { coordinator, windowTarget, documentTarget } = fixture();
  await coordinator.start();
  coordinator.stop();
  assert.equal(coordinator.started, false);
  assert.equal(windowTarget.count("online"), 0);
  assert.equal(windowTarget.count("pageshow"), 0);
  assert.equal(documentTarget.count("visibilitychange"), 0);
});

test("profile lookup errors are reported without attempting sync", async () => {
  const { coordinator, calls } = fixture({
    currentIdentity: { user: { id: UID }, profile: null, error: new Error("offline") },
  });
  const result = await coordinator.syncNow();
  assert.equal(result.status, "auth-required");
  assert.deepEqual(calls, ["identity"]);
});
