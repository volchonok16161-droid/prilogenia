// Strict adapter between encrypted local queue entries and Supabase checklist CRUD.
// Native state is preserved; inline photos are uploaded to private Storage and replaced
// by a manifest in the cloud payload. The encrypted queue retains the original photos.
import { validateOfflineCloudEnvelope } from "./offline-checklist-schema.js";

function invalid(message) {
  const error = new TypeError(message);
  error.code = "INVALID_OFFLINE_CLOUD_SNAPSHOT";
  return error;
}

export function mapOfflineChecklistOperation(operation, localValue) {
  if (!operation || typeof operation !== "object" ||
      typeof operation.entityId !== "string" || !operation.entityId) {
    throw invalid("Queue operation identity is missing");
  }
  if (operation.operation === "delete") {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(operation.entityId)) {
      throw invalid("Delete operation requires a checklist UUID");
    }
    return Object.freeze({ method: "remove", id: operation.entityId });
  }
  if (operation.operation !== "create" && operation.operation !== "update") {
    throw invalid("This queue operation is not a checklist CRUD operation");
  }
  let cloud;
  try { cloud = validateOfflineCloudEnvelope(localValue, operation.entityId); }
  catch (error) { throw invalid(error.message); }
  const input = {
    id: cloud.id, title: cloud.title, equipmentType: cloud.equipmentType,
    payload: cloud.payload,
  };
  if (operation.operation === "create") return Object.freeze({ method: "create", input: Object.freeze(input) });
  const expectedRevision = Number(cloud.expectedRevision);
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) {
    throw invalid("Update requires the last confirmed cloud revision");
  }
  return Object.freeze({
    method: "update", id: cloud.id,
    input: Object.freeze({ ...input, expectedRevision }),
  });
}

// Use this async mapper in the sync runner when private Storage photo sync is available.
// Photo upload happens before the row write; failed/conflicted row writes roll it back.
export function createOfflineChecklistOperationMapper({ photoSync } = {}) {
  if (typeof photoSync?.uploadState !== "function" ||
      typeof photoSync?.removeManifest !== "function") {
    throw new TypeError("Private checklist photo sync is required");
  }
  return async function mapWithPhotos(operation, localValue) {
    const request = mapOfflineChecklistOperation(operation, localValue);
    if (!["create", "update"].includes(request.method)) return request;
    const cloud = localValue.cloud;
    const state = structuredClone(cloud.payload.state);
    const revision = request.method === "create" ? 1 : request.input.expectedRevision + 1;
    const uploaded = await photoSync.uploadState({
      state, checklistId: cloud.id, revision,
    });
    const cloudState = structuredClone(state);
    for (const entry of uploaded.manifest) {
      if (cloudState.values?.[entry.itemId]) delete cloudState.values[entry.itemId][entry.field];
    }
    const input = {
      ...request.input,
      payload: {
        ...request.input.payload,
        state: cloudState,
        photoManifest: uploaded.manifest,
      },
    };
    return Object.freeze({
      ...request,
      input: Object.freeze(input),
      rollback: () => photoSync.removeManifest(uploaded.manifest),
    });
  };
}
