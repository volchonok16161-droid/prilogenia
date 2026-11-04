// Browser event coordinator for the encrypted offline queue.
// It deliberately requires a fresh server-verified identity before invoking
// the runner; a local PIN unlock is never sufficient authorization.
const ALLOWED_ROLES = new Set(["employee", "admin", "developer"]);

function isVerifiedIdentity(identity) {
  const userId = identity?.user?.id;
  return !identity?.error &&
    typeof userId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) &&
    identity?.profile?.id === userId &&
    ALLOWED_ROLES.has(identity?.profile?.role);
}

export function createOfflineSyncCoordinator({
  authApi,
  syncRunner,
  isOnline = () => globalThis.navigator?.onLine !== false,
  eventTarget = globalThis.window,
  documentTarget = globalThis.document,
  onStatus = () => {},
} = {}) {
  if (typeof authApi?.getCurrentIdentity !== "function" ||
      typeof syncRunner?.syncPending !== "function") {
    throw new TypeError("Offline sync coordinator dependencies are incomplete");
  }
  if (typeof isOnline !== "function" || typeof onStatus !== "function") {
    throw new TypeError("Offline sync coordinator callbacks must be functions");
  }

  let started = false;
  let inFlight = null;

  function publish(status) {
    try { onStatus(Object.freeze({ ...status })); } catch {}
  }

  async function performSync() {
    if (!isOnline()) {
      const result = { status: "offline", processed: 0, synced: 0, conflicts: 0, remaining: null };
      publish(result);
      return result;
    }

    publish({ status: "checking-session" });
    let identity;
    try {
      identity = await authApi.getCurrentIdentity();
    } catch (error) {
      const result = { status: "auth-required", error };
      publish(result);
      return result;
    }

    if (!isVerifiedIdentity(identity)) {
      const result = { status: "auth-required" };
      publish(result);
      return result;
    }
    if (!isOnline()) {
      const result = { status: "offline", processed: 0, synced: 0, conflicts: 0, remaining: null };
      publish(result);
      return result;
    }

    publish({ status: "syncing" });
    try {
      const result = await syncRunner.syncPending({ userId: identity.user.id });
      publish(result);
      return result;
    } catch (error) {
      const result = { status: "error", error };
      publish(result);
      return result;
    }
  }

  function syncNow() {
    if (inFlight) return inFlight;
    inFlight = performSync().finally(() => { inFlight = null; });
    return inFlight;
  }

  function handleReconnect() {
    void syncNow();
  }

  function start() {
    if (started) return syncNow();
    started = true;
    eventTarget?.addEventListener?.("online", handleReconnect);
    eventTarget?.addEventListener?.("pageshow", handleReconnect);
    documentTarget?.addEventListener?.("visibilitychange", handleReconnect);
    return syncNow();
  }

  function stop() {
    if (!started) return;
    started = false;
    eventTarget?.removeEventListener?.("online", handleReconnect);
    eventTarget?.removeEventListener?.("pageshow", handleReconnect);
    documentTarget?.removeEventListener?.("visibilitychange", handleReconnect);
  }

  return Object.freeze({ start, stop, syncNow, get started() { return started; } });
}
