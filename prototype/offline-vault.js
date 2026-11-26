import { createOfflineVaultCrypto } from "./offline-vault-crypto.js";
import { createOfflineVaultDatabase } from "./offline-vault-db.js";
import { createOfflineVaultSession } from "./offline-vault-session.js";

// Factory for the offline primitives. It does not change the existing checklist
// storage, authenticate a user with Supabase, or start synchronization by itself.
export function createOfflineVault(options = {}) {
  const database = createOfflineVaultDatabase(options.database);
  const cryptoVault = createOfflineVaultCrypto(options.crypto);
  const session = createOfflineVaultSession({
    database,
    cryptoVault,
    cryptoImpl: options.crypto?.cryptoImpl ?? globalThis.crypto,
    now: options.now,
  });
  return Object.freeze({ database, cryptoVault, session });
}
