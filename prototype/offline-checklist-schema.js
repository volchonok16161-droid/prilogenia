// Versioned cloud envelope for the five built-in checklist runtimes.
// Keep the full JSON state (general, values, selections, changeLog and mode-specific
// fields) together. Never infer fields from a partially-known legacy snapshot.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const OFFLINE_CHECKLIST_MODES = Object.freeze({
  complex: "Комплексный чек-лист",
  housings: "КМБ",
  tt: "ТТ (тяговый трансформатор)",
  bi: "БИ (МСУД-015)",
  hydro: "Гидродемпферы",
});

function invalid(message, code = "INVALID_OFFLINE_CHECKLIST") {
  const error = new TypeError(message);
  error.code = code;
  return error;
}

function cloneJson(value) {
  let serialized;
  try { serialized = JSON.stringify(value); } catch (error) {
    throw invalid("Состояние чек-листа не является JSON-совместимым");
  }
  if (typeof serialized !== "string") throw invalid("Состояние чек-листа пустое или не сериализуемое");
  let copy;
  try { copy = JSON.parse(serialized); } catch {
    throw invalid("Не удалось проверить структуру состояния чек-листа");
  }
  if (!copy || typeof copy !== "object" || Array.isArray(copy) ||
      !copy.general || typeof copy.general !== "object" || Array.isArray(copy.general) ||
      !copy.values || typeof copy.values !== "object" || Array.isArray(copy.values)) {
    throw invalid("В снимке должны присутствовать объекты general и values");
  }
  return copy;
}

function makeTitle(mode, state) {
  const general = state.general || {};
  const parts = [OFFLINE_CHECKLIST_MODES[mode]];
  const locomotive = [general.type, general.number ? "№ " + general.number : ""].filter(Boolean).join(" ");
  if (locomotive) parts.push(locomotive);
  if (general.date) parts.push(String(general.date));
  return parts.join(" · ").slice(0, 200);
}

export function buildOfflineCloudEnvelope({
  mode, state, cloudId, expectedRevision, idFactory = () => globalThis.crypto.randomUUID(),
} = {}) {
  if (!Object.hasOwn(OFFLINE_CHECKLIST_MODES, mode)) {
    throw invalid("Для этого режима пока нет проверенного облачного адаптера", "UNSUPPORTED_CHECKLIST_MODE");
  }
  const snapshot = cloneJson(state);
  const id = cloudId || idFactory();
  if (typeof id !== "string" || !UUID_RE.test(id)) throw invalid("Для облачной записи требуется UUID");
  const cloud = {
    id,
    title: makeTitle(mode, snapshot),
    equipmentType: mode,
    payload: Object.freeze({
      schemaVersion: 1,
      mode,
      state: snapshot,
    }),
  };
  if (expectedRevision !== undefined) {
    const revision = Number(expectedRevision);
    if (!Number.isSafeInteger(revision) || revision < 1) {
      throw invalid("Для обновления нужна подтверждённая положительная ревизия");
    }
    cloud.expectedRevision = revision;
  }
  return Object.freeze({ cloud: Object.freeze(cloud) });
}

export function validateOfflineCloudEnvelope(value, entityId) {
  const cloud = value?.cloud;
  if (!cloud || typeof cloud !== "object" || Array.isArray(cloud) ||
      typeof entityId !== "string" || !UUID_RE.test(entityId) ||
      typeof cloud.id !== "string" || cloud.id.toLowerCase() !== entityId.toLowerCase()) {
    throw invalid("Облачный конверт отсутствует или не совпадает с идентификатором очереди");
  }
  if (!Object.hasOwn(OFFLINE_CHECKLIST_MODES, cloud.equipmentType) ||
      cloud.payload?.schemaVersion !== 1 ||
      cloud.payload?.mode !== cloud.equipmentType ||
      !cloud.payload?.state || typeof cloud.payload.state !== "object" ||
      Array.isArray(cloud.payload.state) ||
      !cloud.payload.state.general || !cloud.payload.state.values) {
    throw invalid("Облачный конверт не соответствует версии схемы чек-листа");
  }
  return cloud;
}
