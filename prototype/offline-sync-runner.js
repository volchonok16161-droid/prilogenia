// Explicit, owner-scoped drain of the encrypted offline queue.
// This runner never treats a local device-key unlock as a Supabase session. Call it
// only after connectivity returns; each operation revalidates the server identity.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ROLES = new Set(["employee", "assistant", "admin", "developer"]);

function assertDependencies({ authApi, database, vault, cloudSync, mapOperation }) {
  if (typeof authApi?.getCurrentIdentity !== "function" ||
      typeof database?.listPending !== "function" ||
      typeof database?.claimQueueOperation !== "function" ||
      typeof database?.updateQueueOperation !== "function" ||
      typeof database?.markSynced !== "function" ||
      typeof database?.saveConflict !== "function" ||
      typeof database?.getCloudState !== "function" ||
      typeof vault?.decrypt !== "function" || typeof vault?.encrypt !== "function" ||
      typeof mapOperation !== "function" ||
      !["create", "update", "remove", "get"].every((key) => typeof cloudSync?.[key] === "function")) {
    throw new TypeError("Offline sync runner dependencies are incomplete");
  }
}

function assertVerifiedIdentity(identity, expectedUserId) {
  const id = identity?.user?.id;
  if (identity?.error || !id || !UUID_RE.test(id) || id.toLowerCase() !== expectedUserId ||
      identity?.profile?.id !== id || !ROLES.has(identity?.profile?.role)) {
    const error = new Error("Для синхронизации требуется действующая сессия и разрешённый профиль сотрудника");
    error.code = "AUTH_REQUIRED";
    throw error;
  }
  return id.toLowerCase();
}

// A lost HTTP response can follow a successful database commit.
// JSONB reorders object keys; require an exact normalized snapshot match.
function normalizedJson(v) {
  if (Array.isArray(v)) return v.map(normalizedJson);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map(k => [k, normalizedJson(v[k])]));
  return v;
}
function matchesConfirmedWrite(request, remote) {
  const input = request.input;
  if (!input || !remote || remote.id !== input.id) return false;
  const revision = request.method === "create" ? 1 : Number(input.expectedRevision) + 1;
  return Number(remote.revision) === revision && remote.title === input.title &&
    remote.equipment_type === input.equipmentType &&
    JSON.stringify(normalizedJson(remote.payload)) === JSON.stringify(normalizedJson(input.payload));
}

function createLeaseKeeper({ renew, setIntervalImpl, clearIntervalImpl, intervalMs }) {
  let timer = null;
  let renewal = Promise.resolve();
  let leaseError = null;
  let stopped = false;
  const pulse = () => {
    if (stopped || leaseError) return;
    renewal = renewal.then(async () => {
      if (stopped || leaseError) return;
      const renewed = await renew();
      if (!renewed) {
        leaseError = new Error("Sync lease was lost to another worker");
        leaseError.code = "LEASE_LOST";
      }
    }).catch((error) => { leaseError = error; });
  };
  timer = setIntervalImpl(pulse, intervalMs);
  return Object.freeze({
    async renewNow() {
      if (stopped) throw new Error("Sync lease keeper is stopped");
      await renewal;
      if (leaseError) throw leaseError;
      const renewed = await renew();
      if (!renewed) {
        leaseError = new Error("Sync lease was lost to another worker");
        leaseError.code = "LEASE_LOST";
        throw leaseError;
      }
    },
    async assertOwned() {
      await renewal;
      if (leaseError) throw leaseError;
    },
    async stop() {
      stopped = true;
      if (timer !== null) clearIntervalImpl(timer);
      await renewal;
    },
  });
}

export function createOfflineSyncRunner({
  authApi, database, vault, cloudSync, mapOperation,
  isOnline = () => globalThis.navigator?.onLine !== false,
  now = () => new Date().toISOString(),
  claimIdFactory = () => globalThis.crypto.randomUUID(),
  setIntervalImpl = (...args) => globalThis.setInterval(...args),
  clearIntervalImpl = (handle) => globalThis.clearInterval(handle),
  leaseDurationMs = 5 * 60 * 1000,
  leaseRenewIntervalMs = 60 * 1000,
}) {
  assertDependencies({ authApi, database, vault, cloudSync, mapOperation });

  async function syncPending({ userId, limit = 25 } = {}) {
    if (typeof userId !== "string" || !UUID_RE.test(userId)) {
      throw new TypeError("A valid account UUID is required");
    }
    const uid = userId.toLowerCase();
    if (!Number.isSafeInteger(leaseDurationMs) || leaseDurationMs < 30_000 ||
        !Number.isSafeInteger(leaseRenewIntervalMs) || leaseRenewIntervalMs < 1_000 ||
        leaseRenewIntervalMs >= leaseDurationMs) throw new TypeError("Invalid sync lease timing");
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new TypeError("Sync batch limit must be between 1 and 100");
    }
    if (!isOnline()) {
      return Object.freeze({ status: "offline", processed: 0, synced: 0, conflicts: 0, remaining: null });
    }

    // Verify the server-side Auth user AND profiles row before reading or sending
    // any queue item. Revalidate before every item to catch revoked accounts.
    assertVerifiedIdentity(await authApi.getCurrentIdentity(), uid);
    const pending = (await database.listPending(uid, now())).slice(0, limit);
    let synced = 0;
    let conflicts = 0;
    let failed = 0;

    for (const operation of pending) {
      let claimed = false;
      let claimId = null;
      let leaseKeeper = null;
      try {
        if (!isOnline()) break;
        assertVerifiedIdentity(await authApi.getCurrentIdentity(), uid);
        const claimedAt = now();
        const leaseUntil = new Date(Date.parse(claimedAt) + leaseDurationMs).toISOString();
        claimId = claimIdFactory();
        claimed = await database.claimQueueOperation(
          operation.opId, uid, claimId, claimedAt, leaseUntil,
        );
        if (!claimed) continue;
        const renewClaim = async () => {
          const renewedAt = now();
          const renewedUntil = new Date(Date.parse(renewedAt) + leaseDurationMs).toISOString();
          if (typeof database.renewQueueOperation === "function") {
            return database.renewQueueOperation(operation.opId, uid, claimId, renewedAt, renewedUntil);
          }
          return database.updateQueueOperation(operation.opId, uid, { leaseUntil: renewedUntil }, claimId);
        };
        leaseKeeper = createLeaseKeeper({ renew: renewClaim, setIntervalImpl, clearIntervalImpl, intervalMs: leaseRenewIntervalMs });
        if (operation.userId !== uid || typeof operation.opId !== "string" ||
            typeof operation.entityId !== "string") {
          throw new Error("Очередь содержит некорректную операцию владельца");
        }
        const localValue = await vault.decrypt(operation.encrypted);
        const cloudState = await database.getCloudState(uid, operation.entityId);
        let effectiveOperation = operation;
        let effectiveValue = localValue;
        if (operation.operation === "create") {
          // A tab may close after Supabase committed the INSERT but before
          // IndexedDB acknowledged it. Probe the deterministic id through the
          // owner-scoped API even when no local cloud revision was persisted.
          // RLS makes an existing row visible only to its authenticated owner.
          let existing = null;
          try {
            existing = await cloudSync.get(operation.entityId);
          } catch (lookupError) {
            if (lookupError?.code !== "NOT_FOUND") throw lookupError;
          }
          if (existing) {
            const knownRevision = Number(cloudState?.revision);
            const remoteRevision = Number(existing.revision);
            if (existing.id !== operation.entityId ||
                !Number.isSafeInteger(remoteRevision) || remoteRevision < 1 ||
                !Number.isSafeInteger(knownRevision) || knownRevision < 1 ||
                knownRevision !== remoteRevision) {
              // Without the exact revision recorded before the interrupted
              // request, an existing row might contain another session's edits.
              // Preserve both versions instead of blindly overwriting it.
              const remoteEncrypted = await vault.encrypt(existing);
              await database.saveConflict({
                conflictId: operation.opId,
                userId: uid,
                entityId: operation.entityId,
                localEncrypted: operation.encrypted,
                remoteEncrypted,
                createdAt: now(),
              });
              const conflictMarked = await database.updateQueueOperation(operation.opId, uid, {
                status: "conflict",
                leaseClaimId: null,
                leaseUntil: null,
                lastError: "CREATE_RECOVERY_CONFLICT",
              }, claimId);
              if (!conflictMarked) throw new Error("Sync queue lease expired while saving create recovery conflict");
              conflicts += 1;
              continue;
            }
            effectiveOperation = { ...operation, operation: "update" };
            effectiveValue = {
              ...localValue,
              cloud: { ...localValue.cloud, expectedRevision: remoteRevision },
            };
          }
        }
        if (operation.operation === "update" && cloudState?.revision) {
          effectiveValue = {
            ...localValue,
            cloud: { ...localValue.cloud, expectedRevision: cloudState.revision },
          };
        }
        // On a retry, first check whether the server revision has moved.
        // A previous request may have committed despite a lost HTTP response.
        // Never upload a new batch of photos against an already stale revision.
        if (operation.operation === "update" && Number(operation.attempts) > 0) {
          const expectedRevision = Number(effectiveValue?.cloud?.expectedRevision);
          if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) {
            throw new Error("Retry requires a confirmed cloud revision");
          }
          const remote = await cloudSync.get(operation.entityId);
          if (Number(remote?.revision) !== expectedRevision) {
            const remoteEncrypted = await vault.encrypt(remote);
            await database.saveConflict({
              conflictId: operation.opId,
              userId: uid,
              entityId: operation.entityId,
              localEncrypted: operation.encrypted,
              remoteEncrypted,
              createdAt: now(),
            });
            const conflictMarked = await database.updateQueueOperation(operation.opId, uid, {
              status: "conflict",
              leaseClaimId: null,
              leaseUntil: null,
              lastError: "RETRY_REVISION_CONFLICT",
            }, claimId);
            if (!conflictMarked) throw new Error("Sync queue lease expired while saving retry conflict");
            conflicts += 1;
            continue;
          }
        }
        const request = await mapOperation(effectiveOperation, effectiveValue, cloudState);
        if (!request || !["create", "update", "remove"].includes(request.method)) {
          throw new TypeError("mapOperation must return create, update, or remove");
        }

        await leaseKeeper.renewNow();
        const updated = await database.updateQueueOperation(operation.opId, uid, {
          attempts: (Number(operation.attempts) || 0) + 1,
          lastAttemptAt: now(),
          lastError: null,
        }, claimId);
        if (!updated) throw new Error("Sync queue lease was lost before sending");

        try {
          let cloudResult;
          try {
            await leaseKeeper.assertOwned();
            cloudResult = await cloudSync[request.method](request.method === "remove" ? request.id : request.input);
            await leaseKeeper.renewNow();
          } catch (cloudError) {
            // A timeout may follow a committed write. Do not remove photos
            // that the cloud record may reference.
            let confirmed = false;
            if (cloudError?.code !== "REVISION_CONFLICT" && request.method !== "remove") {
              try {
                const remote = await cloudSync.get(request.input.id);
                if (matchesConfirmedWrite(request, remote)) {
                  cloudResult = remote;
                  confirmed = true;
                  await leaseKeeper.renewNow();
                }
              } catch (_) {
                // The probe may itself fail. Preserve encrypted data and photos.
              }
            }
            if (!confirmed) {
              // Only a definitive revision rejection permits rollback; an
              // uncertain network error could have committed on the server.
              if (cloudError?.code === "REVISION_CONFLICT" && typeof request.rollback === "function") {
                try { await request.rollback(); }
                catch (cleanupError) { cloudError.cleanupError = cleanupError; }
              }
              throw cloudError;
            }
          }
          let acknowledgement;
          if (request.method === "remove") {
            acknowledgement = await database.markSynced(operation.opId, uid, undefined, claimId, null, request.cleanupManifest?.length ? { cleanupId: operation.opId + ':photo-cleanup', manifest: request.cleanupManifest, reason: 'delete', createdAt: now() } : null);
          } else {
            const revision = Number(cloudResult?.revision);
            if (!Number.isSafeInteger(revision) || revision < 1) {
              throw new Error("Cloud API did not return a valid checklist revision");
            }
            acknowledgement = await database.markSynced(operation.opId, uid, revision, claimId, {
              revision,
              photoManifest: request.input?.payload?.photoManifest || [],
            }, request.cleanupManifest?.length ? {
              cleanupId: operation.opId + ':photo-cleanup', manifest: request.cleanupManifest, reason: 'replace', createdAt: now(),
            } : null);
          }
          if (!acknowledgement) throw new Error("Sync queue lease expired before acknowledgement");
          // markSynced atomically persists the confirmed server revision and clears this queue item.
          synced += 1;
        } catch (error) {
          if (error?.code !== "REVISION_CONFLICT" || request.method !== "update") throw error;
          // Keep both versions encrypted and move the operation out of pending;
          // never choose a winner or overwrite either side automatically.
          const remote = await cloudSync.get(request.id || request.input?.id);
          const remoteEncrypted = await vault.encrypt(remote);
          await database.saveConflict({
            conflictId: operation.opId,
            userId: uid,
            entityId: operation.entityId,
            localEncrypted: operation.encrypted,
            remoteEncrypted,
            createdAt: now(),
          });
          const conflictMarked = await database.updateQueueOperation(operation.opId, uid, {
            status: "conflict",
            leaseClaimId: null,
            leaseUntil: null,
            lastError: "REVISION_CONFLICT",
          }, claimId);
          if (!conflictMarked) throw new Error("Sync queue lease expired while saving conflict");
          conflicts += 1;
        }
      } catch (error) {
        failed += 1;
        // Release only a lease this runner actually acquired. The encrypted
        // payload remains intact and can be retried by this or another tab.
        if (claimed) {
          await database.updateQueueOperation(operation.opId, uid, {
            status: "pending",
            leaseClaimId: null,
            leaseUntil: null,
            lastError: String(error?.code || error?.message || "SYNC_FAILED").slice(0, 240),
          }, claimId);
        }
        if (error?.code === "AUTH_REQUIRED" || !isOnline()) break;
      } finally {
        if (leaseKeeper) await leaseKeeper.stop();
      }
    }

    let cleanupProcessed = 0;
    let cleanupFailed = 0;
    if (typeof database.listPhotoCleanups === 'function' && typeof database.claimPhotoCleanup === 'function' &&
        typeof database.updatePhotoCleanup === 'function' && typeof database.completePhotoCleanup === 'function' &&
        typeof mapOperation.removePhotoManifest === 'function' && isOnline()) {
      const jobs = await database.listPhotoCleanups(uid, now(), limit);
      for (const job of jobs) {
        let cleanupClaim = null;
        let cleanupKeeper = null;
        try {
          if (!isOnline()) break;
          assertVerifiedIdentity(await authApi.getCurrentIdentity(), uid);
          const claimedAt = now();
          const leaseUntil = new Date(Date.parse(claimedAt) + 5 * 60 * 1000).toISOString();
          cleanupClaim = claimIdFactory();
          const claimedCleanup = await database.claimPhotoCleanup(job.cleanupId, uid, cleanupClaim, claimedAt, leaseUntil);
          if (!claimedCleanup) continue;
          const renewCleanup = async () => {
            const renewedAt = now();
            const renewedUntil = new Date(Date.parse(renewedAt) + leaseDurationMs).toISOString();
            if (typeof database.renewPhotoCleanup === "function") {
              return database.renewPhotoCleanup(job.cleanupId, uid, cleanupClaim, renewedAt, renewedUntil);
            }
            return database.updatePhotoCleanup(job.cleanupId, uid, { leaseUntil: renewedUntil }, cleanupClaim);
          };
          cleanupKeeper = createLeaseKeeper({ renew: renewCleanup, setIntervalImpl, clearIntervalImpl, intervalMs: leaseRenewIntervalMs });
          let activeManifest = [];
          if (job.reason === "delete") {
            // A delete cleanup is authorized only after a fresh RLS-scoped
            // lookup confirms that the cloud checklist is actually absent.
            try {
              await cloudSync.get(job.entityId);
              throw new Error("Checklist still exists remotely; photo cleanup deferred");
            } catch (lookupError) {
              if (lookupError?.code !== "NOT_FOUND") throw lookupError;
            }
          } else {
            const latestRemote = await cloudSync.get(job.entityId);
            activeManifest = Array.isArray(latestRemote?.payload?.photoManifest)
              ? latestRemote.payload.photoManifest
              : [];
          }
          const activePaths = new Set(activeManifest.map((entry) => entry?.path).filter(Boolean));
          const staleManifest = (job.manifest || []).filter((entry) => entry?.path && !activePaths.has(entry.path));
          await cleanupKeeper.renewNow();
          if (staleManifest.length) {
            await mapOperation.removePhotoManifest(staleManifest);
            await cleanupKeeper.renewNow();
          }
          const completed = await database.completePhotoCleanup(job.cleanupId, uid, cleanupClaim);
          if (!completed) throw new Error("Photo cleanup lease expired before acknowledgement");
          cleanupProcessed += 1;
        } catch (error) {
          cleanupFailed += 1;
          if (cleanupClaim) await database.updatePhotoCleanup(job.cleanupId, uid, {
            status: 'pending', leaseClaimId: null, leaseUntil: null,
            attempts: (Number(job.attempts) || 0) + 1,
            lastError: String(error?.code || error?.message || 'PHOTO_CLEANUP_FAILED').slice(0, 240),
          }, cleanupClaim);
          if (error?.code === 'AUTH_REQUIRED' || !isOnline()) break;
        } finally {
          if (cleanupKeeper) await cleanupKeeper.stop();
        }
      }
    }
    const cleanupRemaining = typeof database.listPhotoCleanups === 'function' ? (await database.listPhotoCleanups(uid, now(), 100)).length : 0;
    const remaining = (await database.listPending(uid, now())).length;
    return Object.freeze({
      status: conflicts ? "conflict" : failed ? "error" : remaining ? "pending-sync" : "synced",
      processed: synced + conflicts + failed,
      synced, conflicts, failed, remaining, cleanupProcessed, cleanupFailed, cleanupRemaining,
    });
  }

  return Object.freeze({ syncPending });
}
