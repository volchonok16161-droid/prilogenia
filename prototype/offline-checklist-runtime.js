// Shared offline runtime wiring. This factory is deliberately opt-in:
 // no local records are imported, no PIN is stored, and no background sync
 // starts until the caller has unlocked this device's vault and calls start().
import { createCloudSync } from "./supabase-cloud-sync.js";
import { createChecklistPhotoSync } from "./supabase-cloud-photos.js";
import { createOfflineVaultDatabase } from "./offline-vault-db.js";
import { createOfflineChecklistStore } from "./offline-checklist-store.js";
import { createOfflineChecklistOperationMapper } from "./offline-cloud-mapper.js";
import { createOfflineSyncRunner } from "./offline-sync-runner.js";
import { createOfflineSyncCoordinator } from "./offline-sync-coordinator.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createOfflineChecklistRuntime({
  authApi,
  userId,
  unlockedVault,
  database = createOfflineVaultDatabase(),
  isOnline,
  eventTarget,
  documentTarget,
  onStatus,
  idFactory,
  now,
} = {}) {
  if (!authApi?.client || typeof authApi.getCurrentIdentity !== "function") {
    throw new TypeError("A configured Supabase Auth client is required");
  }
  if (typeof userId !== "string" || !UUID_RE.test(userId)) {
    throw new TypeError("A verified account UUID is required");
  }
  if (typeof unlockedVault?.encrypt !== "function" || typeof unlockedVault?.decrypt !== "function") {
    throw new TypeError("Unlock the device vault online/offline before creating this runtime");
  }
  const uid = userId.toLowerCase();
  const cloudSync = createCloudSync(authApi);
  const photoSync = createChecklistPhotoSync({ authApi });
  const mapOperation = createOfflineChecklistOperationMapper({ photoSync });
  const store = createOfflineChecklistStore({ database, vault: unlockedVault, userId: uid, idFactory, now });
  const runner = createOfflineSyncRunner({
    authApi, database, vault: unlockedVault, cloudSync, mapOperation, isOnline, now,
  });
  const coordinator = createOfflineSyncCoordinator({
    authApi, syncRunner: runner, isOnline, eventTarget, documentTarget, onStatus,
  });
  let disposed = false;

  async function start() {
    if (disposed) throw new Error("Offline runtime has been disposed");
    // Re-check the server profile before exposing a syncing runtime. Offline PIN
    // unlock can use the store locally, but cannot authorize this network step.
    const identity = await authApi.getCurrentIdentity();
    if (identity?.error || identity?.user?.id?.toLowerCase() !== uid ||
        identity?.profile?.id !== identity?.user?.id ||
        !["employee", "admin", "developer"].includes(identity?.profile?.role)) {
      const error = new Error("Online sign-in and an enabled employee profile are required to start sync");
      error.code = "AUTH_REQUIRED";
      throw error;
    }
    return coordinator.start();
  }

  function stop() { coordinator.stop(); }
  function dispose() { coordinator.stop(); disposed = true; }

  return Object.freeze({
    userId: uid,
    database,
    store,
    cloudSync,
    photoSync,
    runner,
    coordinator,
    start,
    stop,
    dispose,
  });
}
