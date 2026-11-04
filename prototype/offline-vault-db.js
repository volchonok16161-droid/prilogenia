// Durable IndexedDB repository for encrypted offline records and sync operations.
// This layer intentionally rejects plaintext payloads; callers must encrypt before writing.
const DB_NAME = "tmh-offline-vault";
const DB_VERSION = 1;
const STORES = Object.freeze({
  META: "meta",
  RECORDS: "records",
  QUEUE: "queue",
  CONFLICTS: "conflicts",
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
          const store = db.createObjectStore(STORES.RECORDS, { keyPath: "id" });
          store.createIndex("byUser", "userId", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.QUEUE)) {
          const store = db.createObjectStore(STORES.QUEUE, { keyPath: "opId" });
          store.createIndex("byUserStatus", ["userId", "status"], { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.CONFLICTS)) {
          const store = db.createObjectStore(STORES.CONFLICTS, { keyPath: "conflictId" });
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
      try { tx.abort(); } catch {}
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

  async function putRecord({ id, userId, kind, encrypted, updatedAt = new Date().toISOString() }) {
    if (typeof id !== "string" || !id || typeof userId !== "string" || !userId ||
        typeof kind !== "string" || !kind) fail("Record identity and kind are required");
    assertEncrypted(encrypted, "Record payload");
    return run([STORES.RECORDS], "readwrite", async (tx) => {
      await requestResult(tx.objectStore(STORES.RECORDS).put({ id, userId, kind, encrypted, updatedAt }));
      return id;
    });
  }

  async function getRecord(id, userId) {
    return run([STORES.RECORDS], "readonly", async (tx) => {
      const row = await requestResult(tx.objectStore(STORES.RECORDS).get(id));
      return row?.userId === userId ? row : null;
    });
  }
  async function putRecordAndEnqueue({
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
      await requestResult(tx.objectStore(STORES.QUEUE).add({
        opId, userId, entityId, operation, encrypted, createdAt,
        status: "pending", attempts: 0,
      }));
      return { id, opId };
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
      const row = await requestResult(store.get(id));
      if (row?.userId !== userId) return false;
      await requestResult(store.delete(id));
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

  async function listPending(userId) {
    return run([STORES.QUEUE], "readonly", async (tx) => {
      const rows = await requestResult(tx.objectStore(STORES.QUEUE).index("byUserStatus").getAll([userId, "pending"]));
      return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    });
  }

  async function updateQueueOperation(opId, userId, changes) {
    return run([STORES.QUEUE], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.QUEUE);
      const row = await requestResult(store.get(opId));
      if (!row || row.userId !== userId) return false;
      const next = { ...row, ...changes, opId, userId };
      if (next.encrypted) assertEncrypted(next.encrypted, "Queued payload");
      await requestResult(store.put(next));
      return true;
    });
  }

  async function markSynced(opId, userId, serverRevision) {
    return run([STORES.QUEUE], "readwrite", async (tx) => {
      const store = tx.objectStore(STORES.QUEUE);
      const row = await requestResult(store.get(opId));
      if (!row || row.userId !== userId) return false;
      await requestResult(store.delete(opId));
      return { opId, serverRevision: serverRevision ?? null };
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
    open, close, getMeta, setMeta, putRecord, putRecordAndEnqueue, getRecord, listRecords, deleteRecord,
    enqueue, listPending, updateQueueOperation, markSynced, saveConflict, listConflicts,
  });
}
