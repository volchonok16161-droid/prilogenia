// Explicit, local-only import of the currently open legacy checklist.
// The original LocalStorage/legacy photo records are never removed or modified.
function currentChecklistContext() {
  const getters = [
    () => window.__TMH_GET_NATIVE_CLOUD_BACKUP_CONTEXT,
    () => window.__TMH_GET_CLOUD_BACKUP_CONTEXT,
    () => window.parent !== window ? window.parent.__TMH_GET_NATIVE_CLOUD_BACKUP_CONTEXT : null,
    () => window.parent !== window ? window.parent.__TMH_GET_CLOUD_BACKUP_CONTEXT : null,
  ];
  for (const get of getters) {
    try {
      const getter = get();
      if (typeof getter === "function") {
        const context = getter.call(window);
        if (context?.storageKey && context?.state?.general) return context;
      }
    } catch {}
  }
  const documents = [document];
  try { if (window.parent !== window) documents.push(window.parent.document); } catch {}
  for (const doc of documents) {
    for (const frame of doc.querySelectorAll("iframe")) {
      try {
        const child = frame.contentWindow;
        const getter = child?.__TMH_GET_CLOUD_BACKUP_CONTEXT;
        if (typeof getter === "function") {
          const context = getter.call(child);
          if (context?.storageKey && context?.state?.general) return context;
        }
      } catch {}
    }
  }
  throw new Error("Сначала откройте нужный чек-лист");
}

async function ensureUnlocked(api) {
  if (api.isOfflineVaultUnlocked()) return;
  const userId = await api.getLastOfflineUserId();
  if (!userId) {
    const identity = await api.getCurrentIdentity();
    if (!identity?.user || !identity?.profile || identity.error) {
      throw new Error("Сначала войдите онлайн в аккаунт сотрудника");
    }
    const pin = window.prompt("Создайте PIN этого устройства (6–12 цифр) для зашифрованного офлайн-хранилища");
    if (pin === null) return false;
    if (!/^\d{6,12}$/.test(pin)) throw new Error("PIN должен содержать от 6 до 12 цифр");
    await api.setupOfflinePin(pin);
    return true;
  }
  const pin = window.prompt("Введите PIN этого устройства для доступа к зашифрованному хранилищу");
  if (pin === null) return false;
  if (!/^\d{6,12}$/.test(pin)) throw new Error("PIN должен содержать от 6 до 12 цифр");
  await api.unlockOffline(userId, pin);
  return true;
}

async function migrateCurrentChecklist(button) {
  const context = currentChecklistContext();
  if (!context?.storageKey || !context?.state?.general) {
    throw new Error("Не удалось прочитать открытый чек-лист");
  }
  if (!window.confirm(
    "Создать зашифрованную локальную копию текущего чек-листа?\n\n" +
    "Исходная запись и фотографии останутся на месте. Облачная отправка НЕ включится."
  )) return;
  button.disabled = true;
  try {
    const api = window.TMHAuthReady ? await window.TMHAuthReady : window.TMHAuth;
    if (!api) throw new Error("Сервис авторизации ещё загружается");
    if (!(await ensureUnlocked(api))) return;
    // Copy the live in-memory snapshot; don't depend on the async legacy save
    // finishing before import, and don't touch the legacy key or photo store.
    const snapshot = JSON.parse(JSON.stringify(context.state));
    const result = await api.migrateLegacyChecklist(context.storageKey, snapshot, true);
    if (!result?.verified || result.queued !== false || result.status !== "local-only") {
      throw new Error("Не удалось подтвердить локальный перенос");
    }
    if (typeof window.showToast === "function") {
      window.showToast("Зашифрованная локальная копия создана. Исходный чек-лист сохранён; облачная синхронизация выключена");
    } else {
      window.alert("Зашифрованная локальная копия создана. Исходный чек-лист сохранён; облачная синхронизация выключена");
    }
  } finally {
    button.disabled = false;
  }
}

function attach(button) {
  if (button.dataset.offlineMigrationBound === "1") return;
  button.dataset.offlineMigrationBound = "1";
  button.addEventListener("click", async () => {
    try { await migrateCurrentChecklist(button); }
    catch (error) {
      const message = error?.message || "Не удалось перенести чек-лист";
      if (typeof window.showToast === "function") window.showToast(message);
      else window.alert(message);
    }
  });
}

function install() {
  const placements = [
    [document.getElementById("userInfo"), "Перенести в офлайн-хранилище"],
    [document.getElementById("iframeBar"), "Перенести в офлайн-хранилище"],
  ];
  for (const [host, label] of placements) {
    if (!host || host.querySelector('[data-offline-migration-button="1"]')) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "logout-btn";
    button.textContent = label;
    button.title = "Создать зашифрованную локальную копию без отправки в облако";
    button.dataset.offlineMigrationButton = "1";
    attach(button);
    host.append(button);
  }
}

install();
