// Durable IndexedDB repository for encrypted offline records and sync operations.
// This layer intentionally rejects plaintext payloads; callers must encrypt before writing.
const DB_NAME = "tmh-offline-vault";
const DB_VERSION = 2;
const STORES = Object.freeze({
  META: "meta",
  RECORDS: "recordsByOwner",
  QUEUE: "queueByOwner",
  CONFLICTS: "conflictsByOwner",
});

function fail(message) {
  throw new TypeError(message);
}

function assertEncrypted(value, label) {
  if (!value || typeof value !== "object" || value.version !== 1 ||
      typeof value.iv !== "string" || typeof value.ciphertext !== "string") {
    fail(label + " must be an AES-GCM encrypted record");
  }
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
  });
}

export function createOfflineVaultDatabase({
  indexedDBImpl = globalThis.indexedDB,
  dbName = DB_NAME,
} = {}) {
  if (!indexedDBImpl?.open) throw new TypeError("IndexedDB is required for persistent offline storage");
  let opening;

  function open() {
    if (opening) return opening;
    opening = new Promise((resolve, reject) => {
      const request = indexedDBImpl.open(dbName, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORES.META)) {
          db.createObjectStore(STORES.META, { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains(STORES.RECORDS)) {
          const store = db.createObjectStore(STORES.RECORDS, { keyPath: ["userId", "id"] });
          store.createIndex("byUser", "userId", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.QUEUE)) {
          const store = db.createObjectStore(STORES.QUEUE, { keyPath: ["userId", "opId"] });
          store.createIndex("byUserStatus", ["userId", "status"], { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.CONFLICTS)) {
          const store = db.createObjectStore(STORES.CONFLICTS, { keyPath: ["userId", "conflictId"] });
          store.createIndex("byUser", "userId", { unique: false });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () => {
        opening = null;
        reject(request.error || new Error("Could not open offline database"));
      };
      request.onblocked = () => {
        opening = null;
        reject(new Error("Offline database upgrade is blocked by another tab"));
      };
    });
    return opening;
  }

  async function run(storeNames, mode, action) {
    const db = await open();
    const tx = db.transaction(storeNames, mode);
    const done = transactionDone(tx);
    let result;
    try {
      result = await action(tx);
    } catch (error) {
      // The transaction completion promise rejects on abort. Drain it here
      // before rethrowing the original request/validation error, otherwise
      // callers can observe an unhandled rejection after a failed atomic save.
      try { tx.abort(); } catch {}
      try { await done; } catch {}
      throw error;
    }
    await done;
    return result;
  }

  async function getMeta(key) {
    return run([STORES.META], "readonly", async (tx) => {
      const row = await requestResult(tx.objectStore(STORES.META).get(key));
      return row?.value ?? null;
    });
  }

  async function setMeta(key, value) {
    if (typeof key !== "string" || !key) fail("Metadata key is required");
    return run([STORES.META], "readwrite", async (tx) => {
      await requestResult(tx.objectStore(STORES.META).put({ key, value }));
      return value;
    });
  }

  // IndexedDB serializes read-write transactions across tabs. Use one transaction
  // so concurrent first-run tabs converge on the same device ID.
  async function getOrCreateMeta(key, createValue) {
    if (typeof key !== "string" || !key || typeof createValue !== "function") fail("Metadata key and factory are required");
    return run([STORES.META], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.META);
      const existing = await requestResult(store.get(key));
      if (existing) return existing.value;
      const value = createValue();
      if (value == null) fail("Metadata factory returned an empty value");
      await requestResult(store.add({ key, value }));
      return value;
    });
  }

  async function putMetaIfAbsent(key, candidate) {
    if (typeof key !== "string" || !key || candidate == null) fail("Metadata key and candidate are required");
    return run([STORES.META], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.META);
      const existing = await requestResult(store.get(key));
      if (existing) return existing.value;
      await requestResult(store.add({ key, value: candidate }));
      return candidate;
    });
  }

  async function putRecord({ id, userId, kind, encrypted, updatedAt = new Date().toISOString() }) {
    if (typeof id !== "string" || !id || typeof userId !== "string" || !userId ||
        typeof kind !== "string" || !kind) fail("Record identity and kind are required");
    assertEncrypted(encrypted, "Record payload");
    return run([STORES.RECORDS], "readwrite", async (tx) => {
      await requestResult(tx.objectStore(STORES.RECORDS).put({ id, userId, kind, encrypted, updatedAt }));
      return id;
    });
  }

  // Import a legacy snapshot without creating a cloud queue item. The add()
  // request is atomic and refuses to overwrite an existing encrypted record.
  async function putRecordIfAbsent({ id, userId, kind, encrypted, updatedAt = new Date().toISOString() }) {
    if (typeof id !== "string" || !id || typeof userId !== "string" || !userId ||
        typeof kind !== "string" || !kind) fail("Record identity and kind are required");
    assertEncrypted(encrypted, "Record payload");
    return run([STORES.RECORDS], "readwrite", async (tx) => {
      await requestResult(tx.objectStore(STORES.RECORDS).add({ id, userId, kind, encrypted, updatedAt }));
      return id;
    });
  }

  async function getRecord(id, userId) {
    return run([STORES.RECORDS], "readonly", async (tx) => {
      const row = await requestResult(tx.objectStore(STORES.RECORDS).get([userId, id]));
      return row?.userId === userId ? row : null;
    });
  }
  async function putRecordAndEnqueue({
    id, userId, kind, encrypted, opId, entityId, operation = "update",
    updatedAt = new Date().toISOString(), createdAt = updatedAt, onlyIfAbsent = false,
  }) {
    if (typeof id !== "string" || !id || typeof userId !== "string" || !userId ||
        typeof kind !== "string" || !kind || typeof opId !== "string" || !opId ||
        typeof entityId !== "string" || !entityId ||
        !["create", "update", "delete", "photo-upload"].includes(operation)) {
      fail("Invalid offline snapshot or queue metadata");
    }
    if (typeof onlyIfAbsent !== "boolean") fail("onlyIfAbsent must be boolean");
    assertEncrypted(encrypted, "Snapshot payload");
    return run([STORES.RECORDS, STORES.QUEUE], "readwrite", async (tx) => {
      const records = tx.objectStore(STORES.RECORDS);
      const record = { id, userId, kind, encrypted, updatedAt };
      // add() makes first-import-wins atomic across tabs; a duplicate aborts
      // the whole transaction, including the queue write below.
      await requestResult(onlyIfAbsent ? records.add(record) : records.put(record));
      await requestResult(tx.objectStore(STORES.QUEUE).add({
        opId, userId, entityId, operation, encrypted, createdAt,
        status: "pending", attempts: 0,
      }));
      return { id, opId };
    });
  }


  // Atomically persist the newest snapshot and coalesce older pending work
  // for the same entity. A currently processing lease is never overwritten.
  async function putRecordAndCoalesceQueue({
    id, userId, kind, encrypted, opId, entityId, operation = "update",
    updatedAt = new Date().toISOString(), createdAt = updatedAt,
  }) {
    if (typeof id !== "string" || !id || typeof userId !== "string" || !userId ||
        typeof kind !== "string" || !kind || typeof opId !== "string" || !opId ||
        typeof entityId !== "string" || !entityId ||
        !["create", "update", "delete", "photo-upload"].includes(operation)) {
      fail("Invalid offline snapshot or queue metadata");
    }
    assertEncrypted(encrypted, "Snapshot payload");
    return run([STORES.RECORDS, STORES.QUEUE], "readwrite", async (tx) => {
      await requestResult(tx.objectStore(STORES.RECORDS).put({
        id, userId, kind, encrypted, updatedAt,
      }));
      const queue = tx.objectStore(STORES.QUEUE);
      const index = queue.index("byUserStatus");
      const pending = await requestResult(index.getAll([userId, "pending"]));
      const matching = pending
        .filter((row) => row.entityId === entityId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const current = matching.find((row) =>
        ["create", "update", "delete"].includes(row.operation) &&
        ["create", "update", "delete"].includes(operation)
      );
      if (current) {
        // Never merge photo uploads into checklist mutations: they have
        // different idempotency and completion semantics.
        if (current.operation === "delete" && (operation === "update" || operation === "create")) {
          throw new Error("Cannot modify an entity while its deletion is pending");
        }
        if (current.operation === "create" && operation === "delete") {
          throw new Error("A pending create must be resolved before deleting the entity");
        }
        if (current.operation === "update" && operation === "create") {
          throw new Error("Cannot create an entity that already has a pending update");
        }
        // A queued delete followed by a create is a distinct later operation:
        // preserve ordering rather than accidentally turning the delete into a create.
        if (!(current.operation === "delete" && operation === "create")) {
          const nextOperation = current.operation === "create" ? "create" : operation;
          await requestResult(queue.put({
            ...current,
            operation: nextOperation,
            encrypted,
            updatedAt,
          }));
          return { id, opId: current.opId, coalesced: true };
        }
      }
      await requestResult(queue.add({
        opId, userId, entityId, operation, encrypted, createdAt, updatedAt,
        status: "pending", attempts: 0,
      }));
      return { id, opId, coalesced: false };
    });
  }

  async function listRecords(userId, kind) {
    return run([STORES.RECORDS], "readonly", async (tx) => {
      const rows = await requestResult(tx.objectStore(STORES.RECORDS).index("byUser").getAll(userId));
      return kind ? rows.filter((row) => row.kind === kind) : rows;
    });
  }

  async function deleteRecord(id, userId) {
    return run([STORES.RECORDS], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.RECORDS);
      const row = await requestResult(store.get([userId, id]));
      if (row?.userId !== userId) return false;
      await requestResult(store.delete([userId, id]));
      return true;
    });
  }

  async function enqueue({ opId, userId, entityId, operation, encrypted, createdAt = new Date().toISOString() }) {
    if (typeof opId !== "string" || !opId || typeof userId !== "string" || !userId ||
        typeof entityId !== "string" || !entityId ||
        !["create", "update", "delete", "photo-upload"].includes(operation)) {
      fail("Invalid offline operation metadata");
    }
    assertEncrypted(encrypted, "Queued payload");
    return run([STORES.QUEUE], "readwrite", async (tx) => {
      await requestResult(tx.objectStore(STORES.QUEUE).add({
        opId, userId, entityId, operation, encrypted, createdAt, status: "pending", attempts: 0,
      }));
      return opId;
    });
  }

  async function listPending(userId, nowIso = new Date().toISOString()) {
    return run([STORES.QUEUE], "readonly", async (tx) => {
      const index = tx.objectStore(STORES.QUEUE).index("byUserStatus");
      const [pending, processing] = await Promise.all([
        requestResult(index.getAll([userId, "pending"])),
        requestResult(index.getAll([userId, "processing"])),
      ]);
      const ready = pending.concat(processing.filter((row) =>
        typeof row.leaseUntil !== "string" || row.leaseUntil <= nowIso
      ));
      return ready.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    });
  }

  // Atomically claim one queue item. IndexedDB serializes readwrite transactions
  // across tabs, so only one tab can own an unexpired lease at a time.
  async function claimQueueOperation(opId, userId, claimId, nowIso, leaseUntil) {
    if (![opId, userId, claimId, nowIso, leaseUntil].every((value) => typeof value === "string" && value)) {
      fail("Invalid queue claim metadata");
    }
    if (leaseUntil <= nowIso) fail("Queue claim lease must expire in the future");
    return run([STORES.QUEUE], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.QUEUE);
      const row = await requestResult(store.get([userId, opId]));
      if (!row || row.userId !== userId) return false;
      const leaseExpired = typeof row.leaseUntil !== "string" || row.leaseUntil <= nowIso;
      if (row.status !== "pending" && !(row.status === "processing" && leaseExpired)) return false;
      // Preserve per-entity order: a newer operation cannot overtake an older
      // in-flight (or expired-but-unreclaimed) operation in another tab.
      const processing = await requestResult(store.index("byUserStatus").getAll([userId, "processing"]));
      if (processing.some((item) => item.opId !== opId && item.entityId === row.entityId)) return false;
      await requestResult(store.put({
        ...row,
        status: "processing",
        leaseClaimId: claimId,
        leaseUntil,
      }));
      return true;
    });
  }

  async function updateQueueOperation(opId, userId, changes, expectedLeaseClaimId) {
    return run([STORES.QUEUE], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.QUEUE);
      const row = await requestResult(store.get([userId, opId]));
      if (!row || row.userId !== userId) return false;
      if (expectedLeaseClaimId !== undefined && row.leaseClaimId !== expectedLeaseClaimId) return false;
      const next = { ...row, ...changes, opId, userId };
      if (next.encrypted) assertEncrypted(next.encrypted, "Queued payload");
      await requestResult(store.put(next));
      return true;
    });
  }

  // Extend a live claim without changing its fencing token. If another tab
  // reclaimed an expired lease, its different token makes this renewal fail.
  async function renewQueueOperation(opId, userId, expectedLeaseClaimId, nowIso, leaseUntil) {
    if (![opId, userId, expectedLeaseClaimId, nowIso, leaseUntil].every((v) => typeof v === "string" && v) ||
        leaseUntil <= nowIso) fail("Invalid queue lease renewal");
    return run([STORES.QUEUE], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.QUEUE);
      const row = await requestResult(store.get([userId, opId]));
      if (!row || row.userId !== userId || row.status !== "processing" ||
          row.leaseClaimId !== expectedLeaseClaimId) return false;
      await requestResult(store.put({ ...row, leaseUntil }));
      return true;
    });
  }

  function cloudStateKey(userId, entityId) {
    return "cloud-state:" + userId + ":" + entityId;
  }

  async function getCloudState(userId, entityId) {
    return getMeta(cloudStateKey(userId, entityId));
  }

  async function markSynced(opId, userId, serverRevision, expectedLeaseClaimId, cloudState = undefined, cleanupJob = null) {
    if (cloudState !== undefined && cloudState !== null) {
      if (!Number.isSafeInteger(cloudState.revision) || cloudState.revision < 1 ||
          !Array.isArray(cloudState.photoManifest || [])) fail("Invalid cloud sync acknowledgement");
    }
    if (cleanupJob !== null && (!cleanupJob || typeof cleanupJob.cleanupId !== "string" ||
        !cleanupJob.cleanupId || !Array.isArray(cleanupJob.manifest) ||
        !cleanupJob.manifest.length || cleanupJob.manifest.some((entry) =>
          !entry || typeof entry.path !== "string"))) fail("Invalid photo cleanup job");
    return run([STORES.QUEUE, STORES.META], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.QUEUE);
      const row = await requestResult(store.get([userId, opId]));
      if (!row || row.userId !== userId) return false;
      if (expectedLeaseClaimId !== undefined && row.leaseClaimId !== expectedLeaseClaimId) return false;
      if (cloudState === null) {
        await requestResult(tx.objectStore(STORES.META).delete(cloudStateKey(userId, row.entityId)));
      } else if (cloudState !== undefined) {
        await requestResult(tx.objectStore(STORES.META).put({
          key: cloudStateKey(userId, row.entityId),
          value: { revision: cloudState.revision, photoManifest: cloudState.photoManifest || [] },
        }));
      }
      if (cleanupJob) {
        const key = photoCleanupKey(userId, cleanupJob.cleanupId);
        await requestResult(tx.objectStore(STORES.META).put({
          key,
          value: {
            cleanupId: cleanupJob.cleanupId, userId, entityId: row.entityId,
            manifest: cleanupJob.manifest, status: "pending", attempts: 0,
            createdAt: cleanupJob.createdAt || new Date().toISOString(),
          },
        }));
      }
      await requestResult(store.delete([userId, opId]));
      return { opId, serverRevision: serverRevision ?? null };
    });
  }

  function photoCleanupPrefix(userId) { return "photo-cleanup:" + userId + ":"; }
  function photoCleanupKey(userId, cleanupId) { return photoCleanupPrefix(userId) + cleanupId; }

  async function listPhotoCleanups(userId, nowIso = new Date().toISOString(), limit = 25) {
    return run([STORES.META], "readonly", async (tx) => {
      const rows = await requestResult(tx.objectStore(STORES.META).getAll());
      return rows.filter((row) => row.key.startsWith(photoCleanupPrefix(userId)) &&
        row.value && (row.value.status === "pending" ||
          (row.value.status === "processing" && (!row.value.leaseUntil || row.value.leaseUntil <= nowIso))))
        .map((row) => row.value).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(0, limit);
    });
  }

  async function claimPhotoCleanup(cleanupId, userId, claimId, nowIso, leaseUntil) {
    if (![cleanupId, userId, claimId, nowIso, leaseUntil].every((v) => typeof v === "string" && v) ||
        leaseUntil <= nowIso) fail("Invalid photo cleanup claim");
    return run([STORES.META], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.META), key = photoCleanupKey(userId, cleanupId);
      const row = await requestResult(store.get(key));
      if (!row?.value || row.value.userId !== userId) return false;
      const job = row.value, expired = job.status === "processing" &&
        (!job.leaseUntil || job.leaseUntil <= nowIso);
      if (job.status !== "pending" && !expired) return false;
      await requestResult(store.put({ key, value: { ...job, status: "processing", leaseClaimId: claimId, leaseUntil } }));
      return true;
    });
  }

  async function updatePhotoCleanup(cleanupId, userId, changes, expectedClaimId) {
    return run([STORES.META], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.META), key = photoCleanupKey(userId, cleanupId);
      const row = await requestResult(store.get(key));
      if (!row?.value || row.value.userId !== userId ||
          (expectedClaimId !== undefined && row.value.leaseClaimId !== expectedClaimId)) return false;
      await requestResult(store.put({ key, value: { ...row.value, ...changes, cleanupId, userId } }));
      return true;
    });
  }

  async function renewPhotoCleanup(cleanupId, userId, expectedClaimId, nowIso, leaseUntil) {
    if (![cleanupId, userId, expectedClaimId, nowIso, leaseUntil].every((v) => typeof v === "string" && v) ||
        leaseUntil <= nowIso) fail("Invalid photo cleanup lease renewal");
    return run([STORES.META], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.META), key = photoCleanupKey(userId, cleanupId);
      const row = await requestResult(store.get(key));
      if (!row?.value || row.value.userId !== userId ||
          row.value.status !== "processing" || row.value.leaseClaimId !== expectedClaimId) return false;
      await requestResult(store.put({ key, value: { ...row.value, leaseUntil } }));
      return true;
    });
  }

  async function completePhotoCleanup(cleanupId, userId, expectedClaimId) {
    return run([STORES.META], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.META), key = photoCleanupKey(userId, cleanupId);
      const row = await requestResult(store.get(key));
      if (!row?.value || row.value.userId !== userId ||
          (expectedClaimId !== undefined && row.value.leaseClaimId !== expectedClaimId)) return false;
      await requestResult(store.delete(key)); return true;
    });
  }

  async function saveConflict({ conflictId, userId, entityId, localEncrypted, remoteEncrypted, createdAt = new Date().toISOString() }) {
    if (typeof conflictId !== "string" || !conflictId || typeof userId !== "string" || !userId ||
        typeof entityId !== "string" || !entityId) fail("Invalid conflict metadata");
    assertEncrypted(localEncrypted, "Local conflict copy");
    assertEncrypted(remoteEncrypted, "Remote conflict copy");
    return run([STORES.CONFLICTS], "readwrite", async (tx) => {
      await requestResult(tx.objectStore(STORES.CONFLICTS).put({
        conflictId, userId, entityId, localEncrypted, remoteEncrypted, createdAt, status: "unresolved",
      }));
      return conflictId;
    });
  }

  async function listConflicts(userId) {
    return run([STORES.CONFLICTS], "readonly", async (tx) => {
      const rows = await requestResult(tx.objectStore(STORES.CONFLICTS).index("byUser").getAll(userId));
      return rows.filter((row) => row.status === "unresolved");
    });
  }

  async function close() {
    if (!opening) return;
    const db = await opening;
    db.close();
    opening = null;
  }

  return Object.freeze({
    open, close, getMeta, setMeta, getOrCreateMeta, putMetaIfAbsent, getCloudState, putRecord, putRecordIfAbsent, putRecordAndEnqueue, putRecordAndCoalesceQueue, getRecord, listRecords, deleteRecord,
    enqueue, listPending, claimQueueOperation, updateQueueOperation, renewQueueOperation, markSynced, listPhotoCleanups, claimPhotoCleanup, updatePhotoCleanup, renewPhotoCleanup, completePhotoCleanup, saveConflict, listConflicts,
  });
}
