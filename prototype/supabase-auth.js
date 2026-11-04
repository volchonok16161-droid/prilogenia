// Shared Supabase Auth client for the checklist application.
// This file is loaded by the parent page and same-origin srcdoc checklists.
// Only the publishable key belongs here; never add a service_role/secret key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.118.0";
import { createOfflineVault } from "./offline-vault.js";

const SUPABASE_URL = "https://fecigiwjtbtabnsfsdym.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_j-bQu5o4dgj13X-8_7maOA_7KvkLuqH";
const STORAGE_KEY = "tmh-supabase-auth-v1";

// The parent page owns one shared offline vault factory; embedded checklist
// runtimes access it through parent.TMHAuth without opening separate databases.
const offlineVault = createOfflineVault();

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: STORAGE_KEY,
  },
});

const ALLOWED_ROLES = new Set(["employee", "admin", "developer"]);

async function getProfileWithRetry(user, attempts = 2) {
  let result;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    result = await getProfileForUser(user);
    if (!result.error || result.reason !== "profile_query_failed" || attempt + 1 >= attempts) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return result;
}

async function getProfileForUser(user) {
  if (!user?.id) return { profile: null, error: new Error("Сессия не найдена"), reason: "missing_user" };

  const { data, error } = await client
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { profile: null, error, reason: "profile_query_failed" };
  if (!data || !ALLOWED_ROLES.has(data.role)) {
    return { profile: null, error: new Error("Для аккаунта не назначена допустимая роль"), reason: "profile_not_authorized" };
  }

  return { profile: data, error: null };
}

async function getCurrentIdentity() {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return { user: null, profile: null, error: error || null };

  const result = await getProfileWithRetry(data.user);
  if (result.error) {
    // Keep the Auth session on transient profile-query failures; revoke only when
    // the profile is confirmed missing or its role is not allowed.
    if (result.reason === "profile_not_authorized") {
      await client.auth.signOut({ scope: "local" });
      return { user: null, profile: null, error: result.error };
    }
    return { user: data.user, profile: null, error: result.error };
  }

  return { user: data.user, profile: result.profile, error: null };
}

async function resolveLoginEmail(identifier) {
  const normalized = String(identifier || "").trim().normalize("NFC").toLowerCase();
  if (normalized.includes("@")) return normalized;
  if (!normalized) return "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return "u" + hash.slice(0, 63) + "@accounts.invalid";
}

async function signIn(email, password) {
  const normalizedEmail = await resolveLoginEmail(email);
  if (!normalizedEmail || !password) {
    return { user: null, profile: null, error: new Error("Введите логин/email и пароль") };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password: String(password),
  });

  if (error || !data?.user) {
    return { user: null, profile: null, error: error || new Error("Не удалось выполнить вход") };
  }

  const result = await getProfileWithRetry(data.user);
  if (result.error) {
    if (result.reason === "profile_not_authorized") {
      await client.auth.signOut({ scope: "local" });
      return { user: null, profile: null, error: result.error };
    }
    // signIn succeeded; preserve the session so a transient profile lookup
    // failure can be retried without asking the user to enter credentials again.
    return { user: data.user, profile: null, error: result.error };
  }

  return { user: data.user, profile: result.profile, error: null };
}

async function setupOfflinePin(pin) {
  // Re-verify both the live Supabase session and the server-side profile.
  // A stale local checklist_user value is never accepted as enrollment authority.
  const identity = await getCurrentIdentity();
  if (!identity?.user || !identity?.profile || identity.error) {
    throw new Error("Для создания офлайн-PIN требуется действующий онлайн-вход");
  }
  return offlineVault.session.setupAfterVerifiedOnlineLogin(identity, pin);
}

async function unlockOffline(userId, pin) {
  // Local PIN unlock is deliberately separate from signIn/getCurrentIdentity.
  return offlineVault.session.unlockOffline(userId, pin);
}

async function hasOfflineSetup(userId) {
  return offlineVault.session.hasOfflineSetup(userId);
}

async function signOut() {
  const { error } = await client.auth.signOut();
  return { error: error || null };
}

const api = Object.freeze({
  client,
  offlineVault,
  setupOfflinePin,
  unlockOffline,
  hasOfflineSetup,
  storageKey: STORAGE_KEY,
  getCurrentIdentity,
  signIn,
  signOut,
  onAuthStateChange(callback) {
    return client.auth.onAuthStateChange(callback);
  },
});

// Module scripts execute after parsing; consumers can await this promise before init().
window.TMHAuth = api;
window.TMHAuthReady = Promise.resolve(api);
