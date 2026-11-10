// Opens the local encrypted vault for the account verified by Supabase.
// Possession of this device key enables local offline work only; it is not a cloud session.
const DEVICE_META_KEY = "offline:device-id";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertIdentity(identity) {
  const id = identity?.user?.id;
  if (typeof id !== "string" || !UUID_RE.test(id) || identity?.profile?.id !== id ||
      !["employee", "assistant", "admin", "developer"].includes(identity?.profile?.role)) {
    throw new Error("A verified online Supabase identity and authorized profile are required");
  }
  return id.toLowerCase();
}

export function createOfflineVaultSession({ database, cryptoVault, cryptoImpl = globalThis.crypto }) {
  if (!database?.getMeta || !database?.setMeta || !cryptoVault?.createDeviceKey || !cryptoVault?.unlockWithDeviceKey) {
    throw new TypeError("Offline vault database and device-key cryptography modules are required");
  }
  if (!cryptoImpl?.randomUUID) throw new TypeError("Secure random UUID support is required");

  async function createLegacyDeviceId() {
    const id = cryptoImpl.randomUUID();
    await database.setMeta(DEVICE_META_KEY, id);
    return id;
  }

  async function getDeviceId() {
    const id = typeof database.getOrCreateMeta === "function"
      ? await database.getOrCreateMeta(DEVICE_META_KEY, () => cryptoImpl.randomUUID())
      : await database.getMeta(DEVICE_META_KEY) || await createLegacyDeviceId();
    if (typeof id !== "string" || !UUID_RE.test(id)) {
      throw new Error("Offline device identity is invalid; online recovery is required");
    }
    return id.toLowerCase();
  }

  async function setupDeviceKeyAfterVerifiedOnlineLogin(identity) {
    const userId = assertIdentity(identity);
    const metaKey = "offline:device-key:" + userId;
    const deviceId = await getDeviceId();
    let key = await database.getMeta(metaKey);
    if (!key) {
      key = await cryptoVault.createDeviceKey();
      await database.setMeta(metaKey, key);
    }
    return Object.freeze({
      userId, deviceId, configured: true, mode: "device-key",
      vault: cryptoVault.unlockWithDeviceKey({ key, userId, deviceId }),
    });
  }

  async function unlockDeviceKey(userId) {
    if (typeof userId !== "string" || !UUID_RE.test(userId)) throw new TypeError("A valid account UUID is required");
    const uid = userId.toLowerCase();
    const key = await database.getMeta("offline:device-key:" + uid);
    if (!key) throw new Error("Device encryption key is not configured for this account");
    const deviceId = await getDeviceId();
    return Object.freeze({
      userId: uid, deviceId, mode: "device-key",
      vault: cryptoVault.unlockWithDeviceKey({ key, userId: uid, deviceId }),
    });
  }

  return Object.freeze({ getDeviceId, setupDeviceKeyAfterVerifiedOnlineLogin, unlockDeviceKey });
}
