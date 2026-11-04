// Device-bound offline vault cryptography. This module stores no PIN and performs no auth.
// A successful unlock proves possession of the device PIN only; it is NOT a Supabase session.
const VERSION = 1;
const DEFAULT_ITERATIONS = 310_000;
const MIN_PIN_LENGTH = 6;
const MAX_PIN_LENGTH = 12;
const MARKER = "TMH_OFFLINE_VAULT_OK_V1";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertUuid(value, label) {
  if (typeof value !== "string" || !UUID_RE.test(value)) {
    throw new TypeError(label + " must be a UUID");
  }
  return value.toLowerCase();
}

function assertPin(pin) {
  if (typeof pin !== "string" || !/^\d{6,12}$/.test(pin)) {
    throw new TypeError("PIN must contain 6 to 12 digits");
  }
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new TypeError("Invalid encoded vault data");
  }
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function aadFor(userId, deviceId) {
  return new TextEncoder().encode("tmh-offline-vault|" + VERSION + "|" + userId + "|" + deviceId);
}

export function createOfflineVaultCrypto({
  cryptoImpl = globalThis.crypto,
  iterations = DEFAULT_ITERATIONS,
} = {}) {
  if (!cryptoImpl?.subtle || typeof cryptoImpl.getRandomValues !== "function") {
    throw new TypeError("WebCrypto is required for offline vault encryption");
  }
  if (!Number.isSafeInteger(iterations) || iterations < 310_000 || iterations > 1_000_000) {
    throw new RangeError("PBKDF2 iterations must be between 310000 and 1000000");
  }

  async function deriveKey(pin, salt) {
    assertPin(pin);
    const material = await cryptoImpl.subtle.importKey(
      "raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"],
    );
    return cryptoImpl.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  }

  async function encryptBytes(key, bytes, aad) {
    const iv = cryptoImpl.getRandomValues(new Uint8Array(12));
    const ciphertext = await cryptoImpl.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData: aad, tagLength: 128 },
      key,
      bytes,
    );
    return { iv: toBase64Url(iv), ciphertext: toBase64Url(new Uint8Array(ciphertext)) };
  }

  async function decryptBytes(key, record, aad) {
    if (!record || typeof record !== "object") throw new TypeError("Invalid encrypted record");
    return new Uint8Array(await cryptoImpl.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: fromBase64Url(record.iv),
        additionalData: aad,
        tagLength: 128,
      },
      key,
      fromBase64Url(record.ciphertext),
    ));
  }

  async function createDescriptor({ pin, userId, deviceId }) {
    assertPin(pin);
    const uid = assertUuid(userId, "userId");
    const did = assertUuid(deviceId, "deviceId");
    const salt = cryptoImpl.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(pin, salt);
    const aad = aadFor(uid, did);
    const verifier = await encryptBytes(key, new TextEncoder().encode(MARKER), aad);
    return Object.freeze({
      version: VERSION,
      kdf: "PBKDF2-SHA256",
      iterations,
      cipher: "AES-256-GCM",
      userId: uid,
      deviceId: did,
      salt: toBase64Url(salt),
      verifier: Object.freeze(verifier),
    });
  }

  async function unlock({ pin, descriptor, userId, deviceId }) {
    assertPin(pin);
    if (!descriptor || descriptor.version !== VERSION ||
        descriptor.kdf !== "PBKDF2-SHA256" ||
        descriptor.cipher !== "AES-256-GCM" ||
        descriptor.iterations !== iterations) {
      throw new Error("Unsupported offline vault descriptor");
    }
    const uid = assertUuid(userId, "userId");
    const did = assertUuid(deviceId, "deviceId");
    if (descriptor.userId !== uid || descriptor.deviceId !== did) {
      throw new Error("Offline vault belongs to another account or device");
    }
    const salt = fromBase64Url(descriptor.salt);
    if (salt.byteLength !== 16) throw new TypeError("Invalid vault salt");
    const key = await deriveKey(pin, salt);
    const plaintext = await decryptBytes(key, descriptor.verifier, aadFor(uid, did));
    if (new TextDecoder().decode(plaintext) !== MARKER) throw new Error("Invalid PIN");
    return Object.freeze({
      encrypt: (value) => encryptJson(key, value, uid, did),
      decrypt: (record) => decryptJson(key, record, uid, did),
    });
  }

  async function encryptJson(key, value, userId, deviceId) {
    let json;
    try { json = JSON.stringify(value); }
    catch (error) { throw new TypeError("Value must be JSON serializable", { cause: error }); }
    if (json === undefined) throw new TypeError("Value must be JSON serializable");
    return Object.freeze({
      version: VERSION,
      ...(await encryptBytes(key, new TextEncoder().encode(json), aadFor(userId, deviceId))),
    });
  }

  async function decryptJson(key, record, userId, deviceId) {
    if (record?.version !== VERSION) throw new Error("Unsupported encrypted record version");
    const plaintext = await decryptBytes(key, record, aadFor(userId, deviceId));
    return JSON.parse(new TextDecoder().decode(plaintext));
  }

  return Object.freeze({ createDescriptor, unlock });
}
