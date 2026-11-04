// Strict adapter between encrypted local queue entries and Supabase checklist CRUD.
// The versioned schema explicitly carries the complete native checklist state.
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
    id: cloud.id,
    title: cloud.title,
    equipmentType: cloud.equipmentType,
    payload: cloud.payload,
  };

  if (operation.operation === "create") {
    return Object.freeze({ method: "create", input: Object.freeze(input) });
  }

  const expectedRevision = Number(cloud.expectedRevision);
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) {
    throw invalid("Update requires the last confirmed cloud revision");
  }
  return Object.freeze({
    method: "update",
    id: cloud.id,
    input: Object.freeze({ ...input, expectedRevision }),
  });
}
