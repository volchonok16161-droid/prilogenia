// Shared Supabase Auth client for the checklist application.
// This file is loaded by the parent page and same-origin srcdoc checklists.
// Only the publishable key belongs here; never add a service_role/secret key.
import { createOfflineVault } from "./offline-vault.js";
import { createOfflineChecklistStore } from "./offline-checklist-store.js";
import { createOfflineSyncRunner } from "./offline-sync-runner.js";
import { mapOfflineChecklistOperation, createOfflineChecklistOperationMapper } from "./offline-cloud-mapper.js";
import { createCloudSync } from "./supabase-cloud-sync.js";
import { createChecklistPhotoSync } from "./supabase-cloud-photos.js";
import { createOfflineSyncCoordinator } from "./offline-sync-coordinator.js";
import { createOfflineChecklistInstances } from "./offline-checklist-instances.js";

const SUPABASE_URL = "https://fecigiwjtbtabnsfsdym.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_j-bQu5o4dgj13X-8_7maOA_7KvkLuqH";
const STORAGE_KEY = "tmh-supabase-auth-v1";

// The parent page owns one shared offline vault factory; embedded checklist
// runtimes access it through parent.TMHAuth without opening separate databases.
const offlineVault = createOfflineVault();
let activeOfflineIdentity = null;
// A deliberate offline logout must not be undone by the cached-device fallback.
let offlineLogoutRequested = false;
let activeOfflineVault = null;
let activeOfflineUserId = null;
let offlineChecklistStore = null;
let offlineChecklistInstances = null;
let offlineChecklistInstancesUserId = null;
let offlineChecklistInstancesVault = null;
let offlineSyncCoordinator = null;
let offlineSyncStatus = Object.freeze({ status: "locked" });

function getChecklistMode(storageId) {
  const modes = {
    checklist_2es5k_v1: "complex",
    checklist_housings_v4: "housings",
    checklist_tt_v1: "tt",
    checklist_msud_v1: "bi",
    checklist_hydro_v1: "hydro",
  };
  const baseId = String(storageId).split("::user:")[0];
  const mode = modes[baseId];
  if (!mode) {
    const error = new Error("Этот пользовательский режим пока не поддерживает облачную синхронизацию");
    error.code = "UNSUPPORTED_CHECKLIST_MODE";
    throw error;
  }
  return mode;
}

function ensureOfflineSync() {
  if (!activeOfflineVault || !activeOfflineUserId) throw new Error("Офлайн-хранилище не разблокировано");
  if (!offlineChecklistStore) {
    offlineChecklistStore = createOfflineChecklistStore({
      database: offlineVault.database, vault: activeOfflineVault, userId: activeOfflineUserId,
    });
  }
  if (!offlineSyncCoordinator) {
    const cloudSync = createCloudSync(api);
    const photoSync = createChecklistPhotoSync({ authApi: api });
    const mapOperation = createOfflineChecklistOperationMapper({ photoSync });
    const runner = createOfflineSyncRunner({
      authApi: api, database: offlineVault.database, vault: activeOfflineVault,
      cloudSync, mapOperation,
    });
    offlineSyncCoordinator = createOfflineSyncCoordinator({
      authApi: api, syncRunner: runner,
      onStatus(status) {
        offlineSyncStatus = Object.freeze({ ...status });
        try {
          window.dispatchEvent(new CustomEvent("tmh-offline-sync-status", { detail: offlineSyncStatus }));
        } catch {}
      },
    });
  }
  return offlineChecklistStore;
}

// Keep the checklist shell bootable when the device is offline. Supabase JS is
// loaded only when a real cloud/auth operation is requested; device-key offline recovery
// and the local checklist never depend on the external esm.sh host.
let client = null;
let clientPromise = null;
const authStateListeners = new Map();

function attachAuthStateListeners() {
  if (!client) return;
  for (const [callback, entry] of authStateListeners) {
    if (entry.subscription) continue;
    try {
      const result = client.auth.onAuthStateChange(callback);
      entry.subscription = result?.data?.subscription || null;
    } catch (error) {
      console.warn("Supabase auth listener could not be attached yet", error);
    }
  }
}

async function getSupabaseClient() {
  if (client) return client;
  if (!clientPromise) {
    clientPromise = import("https://esm.sh/@supabase/supabase-js@2.118.0")
      .then(({ createClient }) => {
        client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: STORAGE_KEY,
          },
        });
        attachAuthStateListeners();
        return client;
      })
      .catch((error) => {
        clientPromise = null;
        throw error;
      });
  }
  return clientPromise;
}

function subscribeAuthState(callback) {
  const entry = { subscription: null };
  authStateListeners.set(callback, entry);
  if (client) attachAuthStateListeners();
  return {
    data: {
      subscription: {
        unsubscribe() {
          try { entry.subscription?.unsubscribe(); } catch {}
          authStateListeners.delete(callback);
        },
      },
    },
  };
}

const ALLOWED_ROLES = new Set(["employee", "assistant", "admin", "developer"]);

async function getProfileWithRetry(user, attempts = 2) {
  let result;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    result = await getProfileForUser(user);
    if (!result.error || result.reason !== "profile_query_failed" || attempt + 1 >= attempts) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return result;
}

async function getProfileForUser(user) {
  if (!user?.id) return { profile: null, error: new Error("Сессия не найдена"), reason: "missing_user" };

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { profile: null, error, reason: "profile_query_failed" };
  if (!data || !ALLOWED_ROLES.has(data.role)) {
    return { profile: null, error: new Error("Для аккаунта не назначена допустимая роль"), reason: "profile_not_authorized" };
  }

  return { profile: data, error: null };
}

async function getCurrentIdentity() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return { user: null, profile: null, error: error || null };

  const result = await getProfileWithRetry(data.user);
  if (result.error) {
    // Keep the Auth session on transient profile-query failures; revoke only when
    // the profile is confirmed missing or its role is not allowed.
    if (result.reason === "profile_not_authorized") {
      await supabase.auth.signOut({ scope: "local" });
      return { user: null, profile: null, error: result.error };
    }
    return { user: data.user, profile: null, error: result.error };
  }

  return { user: data.user, profile: result.profile, error: null };
}

async function activateDeviceVault(identity) {
  if (!identity?.user?.id || !identity?.profile?.id ||
      identity.user.id !== identity.profile.id || !ALLOWED_ROLES.has(identity.profile.role)) {
    throw new Error("A verified online account is required to initialize this device");
  }

  // Verify durable storage before exposing the vault as unlocked. This keeps
  // failed or partial IndexedDB enrollment retryable on the next auth check.
  const setup = await offlineVault.session.setupDeviceKeyAfterVerifiedOnlineLogin(identity);
  const safeIdentity = {
    user: { id: identity.user.id, email: identity.user.email || "" },
    profile: {
      id: identity.profile.id,
      display_name: identity.profile.display_name || "",
      role: identity.profile.role,
    },
  };
  const encryptedIdentity = await setup.vault.encrypt(safeIdentity);
  await offlineVault.database.setMeta("offline:identity:" + setup.userId, encryptedIdentity);

  const storedIdentity = await offlineVault.database.getMeta("offline:identity:" + setup.userId);
  if (!storedIdentity) throw new Error("Encrypted offline identity was not persisted");
  const deviceUnlock = await offlineVault.session.unlockDeviceKey(setup.userId);
  const verifiedIdentity = await deviceUnlock.vault.decrypt(storedIdentity);
  if (verifiedIdentity?.user?.id !== setup.userId ||
      verifiedIdentity?.profile?.id !== setup.userId ||
      !ALLOWED_ROLES.has(verifiedIdentity?.profile?.role)) {
    throw new Error("Persisted offline identity failed verification");
  }

  await offlineVault.database.setMeta("offline:last-user-id", setup.userId);
  await offlineVault.database.setMeta("offline:cloud-sync-enabled:" + setup.userId, true);

  activeOfflineVault = deviceUnlock.vault;
  activeOfflineUserId = setup.userId;
  activeOfflineIdentity = null;
  offlineChecklistStore = null;
  offlineSyncCoordinator?.stop();
  offlineSyncCoordinator = null;
  ensureOfflineSync();
  void offlineSyncCoordinator.start();
  return { userId: setup.userId, ready: true };
}

async function resolveLoginEmail(identifier) {
  const normalized = String(identifier || "").trim().normalize("NFC").toLowerCase();
  if (normalized.includes("@")) return normalized;
  if (!normalized) return "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return "u" + hash.slice(0, 63) + "@accounts.invalid";
}

async function signIn(email, password) {
  activeOfflineIdentity = null;
  activeOfflineVault = null;
  activeOfflineUserId = null;
  offlineChecklistStore = null;
  offlineSyncCoordinator?.stop();
  offlineSyncCoordinator = null;
  const normalizedEmail = await resolveLoginEmail(email);
  if (!normalizedEmail || !password) {
    return { user: null, profile: null, error: new Error("Введите логин/email и пароль") };
  }

  let data = null;
  let error = null;
  let supabase = null;
  try {
    supabase = await getSupabaseClient();
    const response = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: String(password),
    });
    data = response?.data || null;
    error = response?.error || null;
  } catch (authError) {
    error = authError;
  }

  if (error || !data?.user) {
    return { user: null, profile: null, error: error || new Error("Не удалось выполнить вход") };
  }

  const result = await getProfileWithRetry(data.user);
  if (result.error) {
    if (result.reason === "profile_not_authorized") {
      await supabase.auth.signOut({ scope: "local" });
      return { user: null, profile: null, error: result.error };
    }
    // signIn succeeded; preserve the session so a transient profile lookup
    // failure can be retried without asking the user to enter credentials again.
    return { user: data.user, profile: null, error: result.error };
  }

  offlineLogoutRequested = false;
  await offlineVault.database.setMeta("offline:logout-requested", false);
  try { globalThis.localStorage?.removeItem("tmh-offline-logout-requested"); } catch {}
  let offlineSetupError = null;
  try { await activateDeviceVault({ user: data.user, profile: result.profile }); }
  catch (vaultError) {
    offlineSetupError = vaultError;
    console.warn("Device offline storage could not be initialized", vaultError);
  }
  return { user: data.user, profile: result.profile, error: null, offlineSetupError };
}

async function getCachedOfflineIdentity(cause) {
  // Explicit logout wins over automatic device-key recovery. Only a deliberate
  // fresh online login or device-key recovery may activate the offline identity again.
  if (offlineLogoutRequested) return null;
  try {
    if (globalThis.localStorage?.getItem("tmh-offline-logout-requested") === "true") return null;
  } catch {}
  try {
    if (await offlineVault.database.getMeta("offline:logout-requested") === true) return null;
  } catch { return null; }
  let reportedOffline = globalThis.__TMH_CONNECTION_MODE === "offline";
  try {
    reportedOffline = reportedOffline ||
      globalThis.parent?.__TMH_CONNECTION_MODE === "offline" ||
      globalThis.document?.getElementById("tmhConnectionBadge")?.dataset?.mode === "offline" ||
      globalThis.parent?.document?.getElementById("tmhConnectionBadge")?.dataset?.mode === "offline";
  } catch {}
  const networkFailure = reportedOffline ||
    globalThis.navigator?.onLine === false ||
    cause?.name === "AuthRetryableFetchError" ||
    cause?.name === "AuthUnknownError" ||
    cause instanceof TypeError ||
    cause?.status === 0 ||
    /fetch|network|offline|timeout|connection|failed to load|load failed/i.test(String(cause?.message || cause || ""));
  if (!networkFailure) return null;
  let cached = null;
  try { cached = JSON.parse(globalThis.localStorage?.getItem("checklist_user") || "null"); } catch {}
  // Logout clears checklist_user for security/UI cleanup. The device-bound
  // offline identity is still recoverable from the encrypted vault metadata.
  let userId = cached?.authUid;
  if (typeof userId !== "string") {
    try { userId = await offlineVault.database.getMeta("offline:last-user-id"); } catch {}
  }
  if (typeof userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) return null;
  try {
    const unlocked = await offlineVault.session.unlockDeviceKey(userId);
    const encryptedIdentity = await offlineVault.database.getMeta("offline:identity:" + unlocked.userId);
    if (!encryptedIdentity) return null;
    const identity = await unlocked.vault.decrypt(encryptedIdentity);
    if (identity?.user?.id !== unlocked.userId ||
        identity?.profile?.id !== unlocked.userId ||
        !ALLOWED_ROLES.has(identity?.profile?.role)) return null;
    activeOfflineVault = unlocked.vault;
    activeOfflineUserId = unlocked.userId;
    activeOfflineIdentity = Object.freeze({
      user: Object.freeze(identity.user),
      profile: Object.freeze({ ...identity.profile }),
      mode: "offline-local-unlock",
      supabaseAuthenticated: false,
    });
    offlineChecklistStore = null;
    offlineSyncCoordinator?.stop();
    offlineSyncCoordinator = null;
    ensureOfflineSync();
    void offlineSyncCoordinator.start();
    return activeOfflineIdentity;
  } catch (error) {
    console.warn("Could not unlock device-bound offline storage", error);
    return null;
  }
}

async function saveOfflineChecklist(id, snapshot) {
  if (!activeOfflineVault || !activeOfflineUserId) throw new Error("Офлайн-хранилище не разблокировано");
  if (typeof id !== "string" || !id) throw new TypeError("Checklist storage id is required");
  const baseId = String(id).split("::user:")[0];
  if (["checklist_2es5k_v1", "checklist_housings_v4", "checklist_tt_v1", "checklist_msud_v1", "checklist_hydro_v1"].includes(baseId)) {
    return saveOfflineChecklistForActiveInstance(id, snapshot);
  }
  const userId = activeOfflineUserId;
  const localEncrypted = await activeOfflineVault.encrypt(snapshot);
  await offlineVault.database.putRecord({ id, userId, kind: "checklist-snapshot", encrypted: localEncrypted });
  const cloudEnabled = await offlineVault.database.getMeta("offline:cloud-sync-enabled:" + userId);
  if (cloudEnabled !== true) {
    return { saved: true, encrypted: true, queued: false, status: "local-only", userId, id };
  }
  try {
    const store = ensureOfflineSync();
    const mode = getChecklistMode(id);
    const mapdevice keygKey = "offline:cloud-id:" + userId + ":" + id;
    let cloudId = await offlineVault.database.getMeta(mapdevice keygKey);
    if (!cloudId) { cloudId = crypto.randomUUID(); await offlineVault.database.setMeta(mapdevice keygKey, cloudId); }
    const cloudState = await offlineVault.database.getCloudState(userId, cloudId);
    const { buildOfflineCloudEnvelope } = await import("./offline-checklist-schema.js");
    const envelope = buildOfflineCloudEnvelope({
      mode, state: snapshot, cloudId,
      ...(cloudState?.revision ? { expectedRevision: cloudState.revision } : {}),
    });
    const result = await store.saveChecklist({
      id, value: envelope, operation: cloudState?.revision ? "update" : "create",
      entityId: cloudId, kind: "checklist-snapshot",
    });
    if (globalThis.navigator?.onLine !== false && offlineSyncCoordinator) void offlineSyncCoordinator.syncNow();
    return { saved: true, encrypted: true, queued: true, userId, id, cloudId, ...result };
  } catch (syncError) {
    console.warn("Cloud sync queue unavailable; encrypted local snapshot was retained", syncError);
    return { saved: true, encrypted: true, queued: false, status: "local-only",
      syncDeferred: true, syncError: syncError?.message || "Cloud sync could not be queued", userId, id };
  }
}

async function saveOfflineChecklistForActiveInstance(id, snapshot) {
  if (!activeOfflineVault || !activeOfflineUserId) throw new Error("Офлайн-хранилище не разблокировано");
  const mode = getChecklistMode(id);
  const key = activeInstanceMetaKey(id);
  const instances = await getOfflineChecklistInstances();
  let instanceId = await offlineVault.database.getMeta(key);
  let result;
  if (instanceId) result = await instances.save(instanceId, mode, snapshot);
  else {
    result = await instances.create(mode, snapshot);
    instanceId = result.instanceId;
    await offlineVault.database.setMeta(key, instanceId);
  }
  requestOfflineSyncAfterInstanceSave(result);
  return { ...result, id, instanceId, userId: activeOfflineUserId };
}
function activeInstanceMetaKey(storageId, userId = activeOfflineUserId) {
  const mode = getChecklistMode(storageId);
  return "offline:active-instance:" + userId + ":" + mode;
}

async function activateOfflineChecklistInstance(storageId, instanceId) {
  if (!activeOfflineVault || !activeOfflineUserId) throw new Error("Офлайн-хранилище не разблокировано");
  const mode = getChecklistMode(storageId);
  const instance = await loadOfflineChecklistInstance(instanceId);
  if (!instance || instance.mode !== mode) throw new Error("Локальный чек-лист не найден или относится к другому режиму");
  await offlineVault.database.setMeta(activeInstanceMetaKey(storageId), instanceId);
  return { activated: true, instanceId, mode };
}

async function beginNewOfflineChecklistInstance(storageId) {
  if (!activeOfflineVault || !activeOfflineUserId) throw new Error("Офлайн-хранилище не разблокировано");
  const key = activeInstanceMetaKey(storageId);
  await offlineVault.database.setMeta(key, null);
  return { ready: true, mode: getChecklistMode(storageId) };
}

async function getOfflineChecklistInstances() {
  if (!activeOfflineVault || !activeOfflineUserId) throw new Error("Офлайн-хранилище не разблокировано");
  const store = ensureOfflineSync();
  if (!offlineChecklistInstances || offlineChecklistInstancesUserId !== activeOfflineUserId ||
      offlineChecklistInstancesVault !== activeOfflineVault) {
    offlineChecklistInstances = createOfflineChecklistInstances({
      database: offlineVault.database, vault: activeOfflineVault, store, userId: activeOfflineUserId,
    });
    offlineChecklistInstancesUserId = activeOfflineUserId;
    offlineChecklistInstancesVault = activeOfflineVault;
  }
  return offlineChecklistInstances;
}

function requestOfflineSyncAfterInstanceSave(result) {
  // Saving is already durable locally. Kick the queue in the background only
  // when this write was queued and the browser currently has a network path.
  // The coordinator performs a fresh Supabase identity/role check before upload.
  if (result?.queued && globalThis.navigator?.onLine !== false && offlineSyncCoordinator) {
    void offlineSyncCoordinator.syncNow().catch((error) => {
      console.warn("Offline checklist sync will retry later", error);
    });
  }
  return result;
}

async function createOfflineChecklistInstance(mode, snapshot) {
  const result = await (await getOfflineChecklistInstances()).create(mode, snapshot);
  return requestOfflineSyncAfterInstanceSave(result);
}
async function saveOfflineChecklistInstance(instanceId, mode, snapshot) {
  const result = await (await getOfflineChecklistInstances()).save(instanceId, mode, snapshot);
  return requestOfflineSyncAfterInstanceSave(result);
}
async function loadOfflineChecklistInstance(instanceId) {
  return (await getOfflineChecklistInstances()).load(instanceId);
}
async function listOfflineChecklistInstances() {
  return (await getOfflineChecklistInstances()).list();
}

async function migrateLegacyChecklist(storageId, snapshot, confirmed = false) {
  if (!activeOfflineVault || !activeOfflineUserId) {
    throw new Error("Сначала разблокируйте офлайн-хранилище после входа в учётную запись");
  }
  getChecklistMode(storageId);
  if (confirmed !== true) throw new Error("Требуется явное подтверждение переноса");
  if (!snapshot || typeof snapshot !== "object" || !snapshot.general || typeof snapshot.general !== "object") {
    throw new TypeError("Некорректный снимок старого чек-листа");
  }
  const store = ensureOfflineSync();
  const result = await store.migrateLegacySnapshot({
    id: storageId, legacyValue: snapshot, confirmed: true, kind: "checklist-snapshot",
  });
  const imported = await store.readChecklist(storageId);
  if (!imported || JSON.stringify(imported.value) !== JSON.stringify(snapshot)) {
    throw new Error("Проверка перенесённой копии не пройдена");
  }
  return { ...result, verified: true, userId: activeOfflineUserId };
}

async function enableOfflineCloudSync() {
  if (!activeOfflineVault || !activeOfflineUserId) {
    throw new Error("Сначала разблокируйте офлайн-хранилище после входа в учётную запись");
  }
  const identity = await getCurrentIdentity();
  if (!identity?.user || identity.user.id !== activeOfflineUserId ||
      !identity?.profile || identity.profile.id !== activeOfflineUserId || identity.error) {
    const error = new Error("Для включения облачной синхронизации нужен действующий онлайн-вход этого сотрудника");
    error.code = "AUTH_REQUIRED";
    throw error;
  }
  await offlineVault.database.setMeta("offline:cloud-sync-enabled:" + activeOfflineUserId, true);
  ensureOfflineSync();
  void offlineSyncCoordinator.start();
  return { enabled: true, userId: activeOfflineUserId };
}

async function loadOfflineChecklist(id) {
  if (!activeOfflineVault || !activeOfflineUserId) return null;
  const instanceId = await offlineVault.database.getMeta(activeInstanceMetaKey(id));
  if (!instanceId) return null;
  const instance = await loadOfflineChecklistInstance(instanceId);
  return instance?.state || null;
}

async function hasOfflineChecklist(id) {
  if (!activeOfflineUserId) return false;
  const instanceId = await offlineVault.database.getMeta(activeInstanceMetaKey(id));
  if (!instanceId) return false;
  return Boolean(await loadOfflineChecklistInstance(instanceId));
}

async function getOfflineIdentity() {
  if (activeOfflineIdentity && globalThis.navigator?.onLine !== false) {
    const offlineUserId = activeOfflineIdentity.user.id;
    try {
      const online = await getCurrentIdentity();
      if (online?.user?.id === offlineUserId && online?.profile?.id === offlineUserId && !online.error) {
        activeOfflineIdentity = null;
        return online;
      }
    } catch {}
  }
  return activeOfflineIdentity;
}

async function getLastOfflineUserId() {
  return offlineVault.database.getMeta("offline:last-user-id");
}

async function signOut() {
  offlineLogoutRequested = true;
  try { await offlineVault.database.setMeta("offline:logout-requested", true); } catch {}
  try { globalThis.localStorage?.setItem("tmh-offline-logout-requested", "true"); } catch {}
  if (activeOfflineIdentity) {
    try {
      if (client) await client.auth.signOut({ scope: "local" });
      else globalThis.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      try { globalThis.localStorage?.removeItem(STORAGE_KEY); } catch {}
    }
    activeOfflineIdentity = null;
    activeOfflineVault = null;
    activeOfflineUserId = null;
    offlineChecklistStore = null;
    offlineSyncCoordinator?.stop();
    offlineSyncCoordinator = null;
    return { error: null, offline: true };
  }
  activeOfflineIdentity = null;
  activeOfflineVault = null;
  activeOfflineUserId = null;
  offlineChecklistStore = null;
  offlineSyncCoordinator?.stop();
  offlineSyncCoordinator = null;
  const supabase = await getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    try { await supabase.auth.signOut({ scope: "local" }); } catch {}
  }
  return { error: error || null };
}

const api = Object.freeze({
  get client() { return client; },
  getClient() { return getSupabaseClient(); },
  offlineVault,

  getOfflineIdentity,
  activateDeviceVault,
  getCachedOfflineIdentity,
  saveOfflineChecklist,
  saveOfflineChecklistForActiveInstance,
  beginNewOfflineChecklistInstance,
  activateOfflineChecklistInstance,
  createOfflineChecklistInstance,
  saveOfflineChecklistInstance,
  loadOfflineChecklistInstance,
  listOfflineChecklistInstances,
  migrateLegacyChecklist,
  enableOfflineCloudSync,
  isOfflineVaultUnlocked() { return Boolean(activeOfflineVault && activeOfflineUserId); },
  loadOfflineChecklist,
  hasOfflineChecklist,
  getLastOfflineUserId,
  getOfflineSyncStatus() { return offlineSyncStatus; },
  syncOfflineNow() { return offlineSyncCoordinator ? offlineSyncCoordinator.syncNow() : Promise.resolve({ status: "locked" }); },
  storageKey: STORAGE_KEY,
  getCurrentIdentity,
  signIn,
  signOut,
  onAuthStateChange(callback) {
    return subscribeAuthState(callback);
  },
});

// Module scripts execute after parsing; consumers can await this promise before init().
window.TMHAuth = api;
window.TMHAuthReady = Promise.resolve(api);
