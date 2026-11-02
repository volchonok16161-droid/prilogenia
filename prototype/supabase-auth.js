// Shared Supabase Auth client for the checklist application.
// This file is loaded by the parent page and same-origin srcdoc checklists.
// Only the publishable key belongs here; never add a service_role/secret key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.118.0";

const SUPABASE_URL = "https://fecigiwjtbtabnsfsdym.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_j-bQu5o4dgj13X-8_7maOA_7KvkLuqH";
const STORAGE_KEY = "tmh-supabase-auth-v1";

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: STORAGE_KEY,
  },
});

const ALLOWED_ROLES = new Set(["employee", "admin", "developer"]);

async function getProfileForUser(user) {
  if (!user?.id) return { profile: null, error: new Error("Сессия не найдена") };

  const { data, error } = await client
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { profile: null, error };
  if (!data || !ALLOWED_ROLES.has(data.role)) {
    return { profile: null, error: new Error("Для аккаунта не назначена допустимая роль") };
  }

  return { profile: data, error: null };
}

async function getCurrentIdentity() {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return { user: null, profile: null, error: error || null };

  const result = await getProfileForUser(data.user);
  if (result.error) {
    // A valid Auth session without an authorized profile must not enter the app.
    await client.auth.signOut({ scope: "local" });
    return { user: null, profile: null, error: result.error };
  }

  return { user: data.user, profile: result.profile, error: null };
}

async function signIn(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { user: null, profile: null, error: new Error("Введите email и пароль") };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password: String(password),
  });

  if (error || !data?.user) {
    return { user: null, profile: null, error: error || new Error("Не удалось выполнить вход") };
  }

  const result = await getProfileForUser(data.user);
  if (result.error) {
    await client.auth.signOut({ scope: "local" });
    return { user: null, profile: null, error: result.error };
  }

  return { user: data.user, profile: result.profile, error: null };
}

async function signOut() {
  const { error } = await client.auth.signOut();
  return { error: error || null };
}

const api = Object.freeze({
  client,
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
