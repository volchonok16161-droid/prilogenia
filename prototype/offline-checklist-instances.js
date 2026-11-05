// Owner-scoped offline checklist instances. Each explicitly created form gets
// its own local record id and cloud entity id; autosaves only update that instance.
import { buildOfflineCloudEnvelope, OFFLINE_CHECKLIST_MODES } from "./offline-checklist-schema.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PREFIX = "checklist-instance:";

function assertUserId(value) {
  if (typeof value !== "string" || !UUID_RE.test(value)) throw new TypeError("A valid account UUID is required");
  return value.toLowerCase();
}
function assertMode(mode) {
  if (!Object.hasOwn(OFFLINE_CHECKLIST_MODES, mode)) {
    const error = new TypeError("Unsupported checklist mode");
    error.code = "UNSUPPORTED_CHECKLIST_MODE";
    throw error;
  }
  return mode;
}
function assertState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state) ||
      !state.general || typeof state.general !== "object" ||
      !state.values || typeof state.values !== "object") {
    throw new TypeError("Checklist state must contain general and values objects");
  }
  return state;
}

export function createOfflineChecklistInstances({
  database, vault, store, userId,
  idFactory = () => globalThis.crypto.randomUUID(),
  cloudIdFactory = () => globalThis.crypto.randomUUID(),
  now = () => new Date().toISOString(),
} = {}) {
  const uid = assertUserId(userId);
  if (!database?.putRecord || !database?.getRecord || !database?.listRecords ||
      !database?.getMeta || !database?.setMeta || !database?.getCloudState ||
      typeof vault?.encrypt !== "function" || typeof vault?.decrypt !== "function" ||
      typeof store?.saveChecklist !== "function") {
    throw new TypeError("Offline checklist instance dependencies are incomplete");
  }

  function storageId(instanceId) {
    if (typeof instanceId !== "string" || !UUID_RE.test(instanceId)) throw new TypeError("A valid checklist instance UUID is required");
    return PREFIX + instanceId.toLowerCase();
  }

  async function decode(row) {
    if (!row || row.userId !== uid || row.kind !== "checklist-snapshot") return null;
    const value = await vault.decrypt(row.encrypted);
    const instance = value?.instance;
    const state = value?.cloud?.payload?.state || value?.state;
    if (!instance || !UUID_RE.test(instance.instanceId || "") ||
        !Object.hasOwn(OFFLINE_CHECKLIST_MODES, instance.mode) ||
        !state || typeof state !== "object") return null;
    const cloudId = value?.cloud?.id || null;
    const cloudState = cloudId ? await database.getCloudState(uid, cloudId) : null;
    const pending = cloudId ? (await database.listPending(uid)).some((operation) => operation.entityId === cloudId) : false;
    return {
      instanceId: instance.instanceId,
      cloudId,
      mode: instance.mode,
      title: instance.title || OFFLINE_CHECKLIST_MODES[instance.mode],
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt || row.updatedAt,
      state,
      sync: pending ? "pending-sync" : cloudState?.revision ? "synced" : "local-only",
      revision: cloudState?.revision || null,
    };
  }

  async function save(instanceId, mode, state, { create = false } = {}) {
    const key = storageId(instanceId);
    const normalizedMode = assertMode(mode);
    assertState(state);
    const previousRow = await database.getRecord(key, uid);
    if (!create && !previousRow) throw new Error("Checklist instance does not exist on this device");
    if (create && previousRow) throw new Error("Checklist instance already exists");
    const previous = previousRow ? await decode(previousRow) : null;
    if (previous && previous.mode !== normalizedMode) throw new Error("Checklist mode cannot be changed for an existing instance");

    const stamp = now();
    const createdAt = previous?.createdAt || stamp;
    const mappingKey = "offline:cloud-id:" + uid + ":instance:" + instanceId;
    let cloudId = await database.getMeta(mappingKey);
    if (!cloudId) {
      cloudId = cloudIdFactory();
      if (typeof cloudId !== "string" || !UUID_RE.test(cloudId)) throw new TypeError("Cloud checklist id factory must return a UUID");
      await database.setMeta(mappingKey, cloudId);
    }
    const cloudState = await database.getCloudState(uid, cloudId);
    const envelope = buildOfflineCloudEnvelope({
      mode: normalizedMode,
      state,
      cloudId,
      ...(cloudState?.revision ? { expectedRevision: cloudState.revision } : {}),
    });
    const instance = {
      instanceId, mode: normalizedMode, createdAt, updatedAt: stamp,
      title: envelope.cloud.title,
    };
    const localValue = { ...envelope, instance };
    const encrypted = await vault.encrypt(localValue);
    const verified = await vault.decrypt(encrypted);
    if (JSON.stringify(verified) !== JSON.stringify(localValue)) {
      throw new Error("Encrypted checklist instance failed verification");
    }
    // Persist locally first. If queue creation fails, this encrypted version remains usable.
    await database.putRecord({
      id: key, userId: uid, kind: "checklist-snapshot", encrypted, updatedAt: stamp,
    });

    const cloudEnabled = await database.getMeta("offline:cloud-sync-enabled:" + uid);
    if (cloudEnabled !== true) {
      return { saved: true, encrypted: true, queued: false, status: "local-only", ...instance };
    }
    try {
      const queued = await store.saveChecklist({
        id: key,
        value: localValue,
        operation: cloudState?.revision ? "update" : "create",
        entityId: cloudId,
        kind: "checklist-snapshot",
      });
      return { saved: true, encrypted: true, queued: true, status: "pending-sync", cloudId, ...instance, ...queued };
    } catch (error) {
      return {
        saved: true, encrypted: true, queued: false, status: "local-only",
        syncDeferred: true, syncError: error?.message || "Could not enqueue cloud sync",
        cloudId, ...instance,
      };
    }
  }

  async function create(mode, state) {
    const instanceId = idFactory();
    if (typeof instanceId !== "string" || !UUID_RE.test(instanceId)) throw new TypeError("Checklist instance id factory must return a UUID");
    const result = await save(instanceId, mode, state, { create: true });
    return { instanceId, ...result };
  }

  async function load(instanceId) {
    const row = await database.getRecord(storageId(instanceId), uid);
    return decode(row);
  }

  async function list() {
    const rows = await database.listRecords(uid, "checklist-snapshot");
    const result = [];
    for (const row of rows) {
      if (!row.id.startsWith(PREFIX)) continue;
      const item = await decode(row);
      if (item) result.push(item);
    }
    return result.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  return Object.freeze({ create, save, load, list });
}
