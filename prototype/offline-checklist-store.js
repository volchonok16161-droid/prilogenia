// Safe adapter for checklist snapshots. Legacy storage is never modified or deleted.
// Callers must explicitly confirm migration; offline vault unlock is not Supabase auth.
function assertUserId(userId) {
  if (typeof userId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    throw new TypeError("A valid account UUID is required");
  }
  return userId.toLowerCase();
}

function assertVault(vault) {
  if (!vault || typeof vault.encrypt !== "function" || typeof vault.decrypt !== "function") {
    throw new TypeError("An unlocked offline vault is required");
  }
}

export function createOfflineChecklistStore({ database, vault, userId, idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date().toISOString() }) {
  if (!database?.putRecordAndEnqueue || !database?.getRecord || !database?.listRecords ||
      !database?.listPending || !database?.listConflicts) {
    throw new TypeError("Offline vault database is incomplete");
  }
  assertVault(vault);
  const uid = assertUserId(userId);

  async function saveChecklist({ id, value, operation = "update", entityId = id, kind = "checklist", onlyIfAbsent = false }) {
    if (typeof id !== "string" || !id || typeof entityId !== "string" || !entityId) {
      throw new TypeError("Checklist id and entity id are required");
    }
    // Refuse non-JSON snapshots and verify the ciphertext can be decrypted
    // back to the exact serialized payload before committing it to IndexedDB.
    // This catches key/session mismatches before a durable queue item is created.
    const serialized = JSON.stringify(value);
    if (typeof serialized !== "string") {
      throw new TypeError("Checklist snapshot must be JSON-serializable");
    }
    const encrypted = await vault.encrypt(value);
    const verified = await vault.decrypt(encrypted);
    if (JSON.stringify(verified) !== serialized) {
      throw new Error("Encrypted checklist snapshot failed round-trip verification");
    }
    const stamp = now();
    const opId = idFactory();
    try {
      const writer = onlyIfAbsent
        ? database.putRecordAndEnqueue
        : (database.putRecordAndCoalesceQueue || database.putRecordAndEnqueue);
      var writeResult = await writer.call(database, {
        id, userId: uid, kind, encrypted, opId, entityId, operation,
        updatedAt: stamp, createdAt: stamp, onlyIfAbsent,
      });
    } catch (error) {
      if (onlyIfAbsent && error?.name === "ConstraintError") {
        throw new Error("An encrypted snapshot with this id already exists", { cause: error });
      }
      throw error;
    }
    return { id, opId: writeResult?.opId || opId, status: "pending-sync", updatedAt: stamp };
  }

  async function readChecklist(id) {
    const row = await database.getRecord(id, uid);
    if (!row) return null;
    return {
      id: row.id,
      kind: row.kind,
      value: await vault.decrypt(row.encrypted),
      updatedAt: row.updatedAt,
    };
  }

  async function listChecklists(kind = "checklist") {
    const rows = await database.listRecords(uid, kind);
    const values = [];
    for (const row of rows) {
      values.push({
        id: row.id,
        kind: row.kind,
        value: await vault.decrypt(row.encrypted),
        updatedAt: row.updatedAt,
      });
    }
    return values;
  }

  async function getSyncStatus() {
    const [pending, conflicts] = await Promise.all([
      database.listPending(uid),
      database.listConflicts(uid),
    ]);
    return Object.freeze({
      status: conflicts.length ? "conflict" : pending.length ? "pending-sync" : "synced",
      pendingCount: pending.length,
      conflictCount: conflicts.length,
    });
  }

  async function migrateLegacySnapshot({ id, legacyValue, confirmed = false, kind = "checklist" }) {
    if (confirmed !== true) throw new Error("Explicit confirmation is required before importing legacy data");
    if (typeof id !== "string" || !id) throw new TypeError("Legacy checklist id is required");
    // The database's add() path makes the existence check and queue creation
    // one atomic transaction, so concurrent imports cannot overwrite each other.
    // The old LocalStorage / IndexedDB entry is intentionally left untouched.
    return saveChecklist({ id, value: legacyValue, operation: "create", entityId: id, kind, onlyIfAbsent: true });
  }

  return Object.freeze({
    userId: uid,
    saveChecklist,
    readChecklist,
    listChecklists,
    getSyncStatus,
    migrateLegacySnapshot,
  });
}
