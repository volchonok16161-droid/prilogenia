// Strict adapter between encrypted local queue entries and Supabase checklist CRUD.
// The legacy checklist UI is intentionally not guessed or transformed here: callers
// must persist an explicit `cloud` envelope in the encrypted snapshot before enqueueing.
// Unsupported shapes fail closed and remain in the local queue.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(message) {
  const error = new TypeError(message);
  error.code = "INVALID_OFFLINE_CLOUD_SNAPSHOT";
  return error;
}

function assertChecklistEnvelope(value, entityId) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      !value.cloud || typeof value.cloud !== "object" || Array.isArray(value.cloud)) {
    throw invalid("Offline snapshot must contain an explicit cloud checklist envelope");
  }
  const cloud = value.cloud;
  if (typeof entityId !== "string" || !UUID_RE.test(entityId) ||
      typeof cloud.id !== "string" || !UUID_RE.test(cloud.id) ||
      cloud.id.toLowerCase() !== entityId.toLowerCase()) {
    throw invalid("Cloud checklist id must match the queued entity id");
  }
  if (typeof cloud.title !== "string" || typeof cloud.equipmentType !== "string" ||
      !cloud.payload || typeof cloud.payload !== "object" || Array.isArray(cloud.payload)) {
    throw invalid("Cloud checklist envelope has invalid title, equipment type, or payload");
  }
  return cloud;
}

export function mapOfflineChecklistOperation(operation, localValue) {
  if (!operation || typeof operation !== "object" ||
      typeof operation.entityId !== "string" || !operation.entityId) {
    throw invalid("Queue operation identity is missing");
  }

  if (operation.operation === "delete") {
    if (!UUID_RE.test(operation.entityId)) throw invalid("Delete operation requires a checklist UUID");
    return Object.freeze({ method: "remove", id: operation.entityId });
  }

  if (operation.operation !== "create" && operation.operation !== "update") {
    throw invalid("This queue operation is not a checklist CRUD operation");
  }

  const cloud = assertChecklistEnvelope(localValue, operation.entityId);
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
    throw invalid("Update requires the last confirmed positive cloud revision");
  }
  return Object.freeze({
    method: "update",
    id: cloud.id,
    input: Object.freeze({ ...input, expectedRevision }),
  });
}
