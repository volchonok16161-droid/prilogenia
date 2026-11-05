// Coordinates PIN enrollment/unlock and persistent retry throttling.
// Call setup only after the parent auth layer has verified the live Supabase user
// AND its profiles row. A locally unlocked vault is never a Supabase session.
const DEVICE_META_KEY = "offline:device-id";
const descriptorKey = (userId) => "offline:descriptor:" + userId;
const attemptsKey = (userId) => "offline:pin-attempts:" + userId;

const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 15 * 60 * 1_000;
const MAX_FAILURES_BEFORE_COOLDOWN = 5;

function assertIdentity(identity) {
  const id = identity?.user?.id;
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
      identity?.profile?.id !== id || !["employee", "admin", "developer"].includes(identity?.profile?.role)) {
    throw new Error("A verified online Supabase identity and authorized profile are required");
  }
  return id.toLowerCase();
}

export function createOfflineVaultSession({ database, cryptoVault, cryptoImpl = globalThis.crypto, now = () => Date.now() }) {
  if (!database?.getMeta || !database?.setMeta || !cryptoVault?.createDescriptor || !cryptoVault?.unlock) {
    throw new TypeError("Offline vault database and cryptography modules are required");
  }
  if (!cryptoImpl?.randomUUID) throw new TypeError("Secure random UUID support is required");

  async function getDeviceId() {
    let id = await database.getMeta(DEVICE_META_KEY);
    if (!id) {
      id = cryptoImpl.randomUUID();
      await database.setMeta(DEVICE_META_KEY, id);
    }
    if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
      throw new Error("Offline device identity is invalid; online recovery is required");
    }
    return id.toLowerCase();
  }

  async function setupDeviceKeyAfterVerifiedOnlineLogin(identity) {
    const userId = assertIdentity(identity);
    const key = "offline:device-key:" + userId;
    const deviceId = await getDeviceId();
    let cryptoKey = await database.getMeta(key);
    if (!cryptoKey) {
      cryptoKey = await cryptoVault.createDeviceKey();
      await database.setMeta(key, cryptoKey);
    }
    return Object.freeze({
      userId,
      deviceId,
      configured: true,
      mode: "device-key",
      vault: cryptoVault.unlockWithDeviceKey({ key: cryptoKey, userId, deviceId }),
    });
  }

  async function unlockDeviceKey(userId) {
    if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) {
      throw new TypeError("A valid account UUID is required");
    }
    const uid = userId.toLowerCase();
    const cryptoKey = await database.getMeta("offline:device-key:" + uid);
    if (!cryptoKey) throw new Error("Device encryption key is not configured for this account");
    const deviceId = await getDeviceId();
    return Object.freeze({
      userId: uid,
      deviceId,
      mode: "device-key",
      vault: cryptoVault.unlockWithDeviceKey({ key: cryptoKey, userId: uid, deviceId }),
    });
  }

  async function setupAfterVerifiedOnlineLogin(identity, pin) {
    const userId = assertIdentity(identity);
    const key = descriptorKey(userId);
    if (await database.getMeta(key)) {
      throw new Error("Offline PIN is already configured for this account on this device");
    }
    const deviceId = await getDeviceId();
    const descriptor = await cryptoVault.createDescriptor({ pin, userId, deviceId });
    await database.setMeta(key, descriptor);
    await database.setMeta(attemptsKey(userId), { failures: 0, blockedUntil: 0 });
    return { userId, deviceId, configured: true };
  }

  async function unlockOffline(userId, pin) {
    if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) {
      throw new TypeError("A valid account UUID is required");
    }
    const uid = userId.toLowerCase();
    const descriptor = await database.getMeta(descriptorKey(uid));
    if (!descriptor) throw new Error("Offline PIN is not configured for this account on this device");

    const deviceId = await getDeviceId();
    const key = attemptsKey(uid);
    const state = await database.getMeta(key) || { failures: 0, blockedUntil: 0 };
    const current = now();
    if (state.blockedUntil > current) {
      const remainingSeconds = Math.ceil((state.blockedUntil - current) / 1000);
      throw new Error("Too many incorrect PIN attempts. Try again in " + remainingSeconds + " seconds");
    }

    try {
      const vault = await cryptoVault.unlock({ pin, descriptor, userId: uid, deviceId });
      await database.setMeta(key, { failures: 0, blockedUntil: 0 });
      return Object.freeze({
        userId: uid,
        deviceId,
        mode: "offline-local-unlock",
        // This flag is deliberately false: PIN unlock does not authenticate with Supabase.
        supabaseAuthenticated: false,
        vault,
      });
    } catch (error) {
      const failures = Math.min((Number(state.failures) || 0) + 1, 20);
      const delay = failures < MAX_FAILURES_BEFORE_COOLDOWN
        ? 0
        : Math.min(BASE_DELAY_MS * (2 ** (failures - MAX_FAILURES_BEFORE_COOLDOWN)), MAX_DELAY_MS);
      await database.setMeta(key, {
        failures,
        blockedUntil: delay ? current + delay : 0,
      });
      throw error;
    }
  }

  async function hasOfflineSetup(userId) {
    if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) return false;
    return Boolean(await database.getMeta(descriptorKey(userId.toLowerCase())));
  }

  return Object.freeze({ getDeviceId, setupDeviceKeyAfterVerifiedOnlineLogin, unlockDeviceKey, setupAfterVerifiedOnlineLogin, unlockOffline, hasOfflineSetup });
}
