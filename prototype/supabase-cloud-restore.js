import { createCloudSync } from "./supabase-cloud-sync.js";

export function createChecklistCloudRestore({
  authApi,
  cloudApi: injectedCloudApi,
  getMode,
  applyState,
  beforeApply,
  hydrateState,
  getCurrentState,
} = {}) {
  if (!authApi || typeof authApi.getCurrentIdentity !== "function" ||
      typeof getMode !== "function" || typeof applyState !== "function" ||
      (beforeApply !== undefined && typeof beforeApply !== "function") ||
      (hydrateState !== undefined && typeof hydrateState !== "function") ||
      (getCurrentState !== undefined && typeof getCurrentState !== "function")) {
    throw new Error("Для восстановления нужны Auth, режим и функция безопасного применения состояния");
  }

  const cloud = injectedCloudApi || createCloudSync(authApi);

  async function listAvailable() {
    const identity = await authApi.getCurrentIdentity();
    if (identity?.error || !identity?.user?.id) {
      const error = new Error("Сначала войдите в аккаунт Supabase");
      error.code = "AUTH_REQUIRED";
      throw error;
    }
    const rows = await cloud.list();
    return rows.map((row) => Object.freeze({
      id: row.id,
      title: row.title,
      equipmentType: row.equipment_type,
      revision: row.revision,
      updatedAt: row.updated_at,
      mode: typeof row.payload?.mode === "string" ? row.payload.mode : null,
    }));
  }

  async function restore(id) {
    const identity = await authApi.getCurrentIdentity();
    if (identity?.error || !identity?.user?.id) {
      const error = new Error("Сначала войдите в аккаунт Supabase");
      error.code = "AUTH_REQUIRED";
      throw error;
    }

    const row = await cloud.get(id);
    const payload = row?.payload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
        !payload.state || typeof payload.state !== "object" || Array.isArray(payload.state)) {
      const error = new Error("Облачная запись не содержит корректного состояния чек-листа");
      error.code = "INVALID_CLOUD_PAYLOAD";
      throw error;
    }

    const expectedMode = String(getMode() || "unknown");
    if (payload.mode !== expectedMode) {
      const error = new Error("Режим облачного чек-листа не совпадает с открытой формой");
      error.code = "MODE_MISMATCH";
      throw error;
    }

    // Prepare and validate all remote assets before creating a safety copy.
    const metadata = Object.freeze({
      id: row.id,
      revision: row.revision,
      title: row.title,
      updatedAt: row.updated_at,
    });
    const clonedState = structuredClone(payload.state);
    const hydratedState = hydrateState
      ? await hydrateState(clonedState, metadata, Array.isArray(payload.photos) ? payload.photos : [])
      : clonedState;

    // Opening an already-restored checklist (for example after login/page reload)
    // must not create another cloud snapshot. Ignore the local-only identity marker.
    let stateChanged = true;
    if (getCurrentState) {
      const currentState = getCurrentState();
      if (currentState && typeof currentState === "object" && !Array.isArray(currentState)) {
        const comparable = (value) => {
          if (Array.isArray(value)) return value.map(comparable);
          if (!value || typeof value !== "object") return value;
          return Object.keys(value).sort().reduce((result, key) => {
            if (key !== "__cloudChecklistId") result[key] = comparable(value[key]);
            return result;
          }, {});
        };
        stateChanged = JSON.stringify(comparable(currentState)) !== JSON.stringify(comparable(hydratedState));
      }
    }
    if (stateChanged && beforeApply) {
      await beforeApply(Object.freeze({ id: row.id, revision: row.revision }));
    }

    // The UI must explicitly decide how to apply data. This module never writes
    // LocalStorage/IndexedDB and never touches the photo fields stored locally.
    await applyState(hydratedState, metadata);

    return Object.freeze({
      id: row.id,
      revision: row.revision,
      title: row.title,
    });
  }

  return Object.freeze({ listAvailable, restore });
}
