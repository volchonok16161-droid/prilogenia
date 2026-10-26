/* Isolated prototype. Does not read or write legacy checklist keys. */
(function (root) {
  'use strict';
  const DB_NAME = 'checklist_sync_prototype_v1';
  const DB_VERSION = 1;
  const RECORDS = 'records';
  const OUTBOX = 'outbox';

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!root.indexedDB) return reject(new Error('IndexedDB недоступна в этом браузере'));
      const request = root.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(RECORDS)) {
          const store = db.createObjectStore(RECORDS, { keyPath: 'key' });
          store.createIndex('ownerId', 'ownerId', { unique: false });
        }
        if (!db.objectStoreNames.contains(OUTBOX)) {
          const store = db.createObjectStore(OUTBOX, { keyPath: 'opId' });
          store.createIndex('ownerId', 'ownerId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Не удалось открыть IndexedDB'));
      request.onblocked = () => reject(new Error('Открытие базы заблокировано другой вкладкой'));
    });
  }

  function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Ошибка IndexedDB'));
    });
  }

  function txDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = tx.onerror = () => reject(tx.error || new Error('Транзакция отменена'));
    });
  }

  function requireOwner(ownerId) {
    if (typeof ownerId !== 'string' || !ownerId.trim()) {
      throw new Error('Для личных данных требуется идентификатор сотрудника');
    }
    return ownerId.trim();
  }

  function makeKey(ownerId, id) { return ownerId + '::' + id; }
  function makeId() {
    return 'op-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  async function saveRecord(ownerId, record) {
    ownerId = requireOwner(ownerId);
    if (!record || typeof record.id !== 'string' || !record.id.trim()) {
      throw new Error('У записи должен быть строковый id');
    }
    const db = await openDb();
    const tx = db.transaction([RECORDS, OUTBOX], 'readwrite');
    const records = tx.objectStore(RECORDS);
    const outbox = tx.objectStore(OUTBOX);
    const saved = {
      key: makeKey(ownerId, record.id),
      ownerId,
      id: record.id,
      data: record.data == null ? {} : record.data,
      updatedAt: new Date().toISOString(),
      localVersion: Number.isInteger(record.localVersion) ? record.localVersion + 1 : 1,
      syncState: 'pending'
    };
    records.put(saved);
    outbox.add({
      opId: makeId(), ownerId, recordId: saved.id, type: 'upsert',
      payload: saved, createdAt: saved.updatedAt, attempts: 0
    });
    await txDone(tx);
    db.close();
    return saved;
  }

  async function listRecords(ownerId) {
    ownerId = requireOwner(ownerId);
    const db = await openDb();
    const tx = db.transaction(RECORDS, 'readonly');
    const rows = await requestResult(tx.objectStore(RECORDS).index('ownerId').getAll(ownerId));
    await txDone(tx);
    db.close();
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async function listPending(ownerId) {
    ownerId = requireOwner(ownerId);
    const db = await openDb();
    const tx = db.transaction(OUTBOX, 'readonly');
    const rows = await requestResult(tx.objectStore(OUTBOX).index('ownerId').getAll(ownerId));
    await txDone(tx);
    db.close();
    return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /* Transport is injected by the caller; this prototype never contacts a server.
     transport.push(operation) must return { status: 'ok' } or { status: 'conflict' }.
     Conflicts are kept in the outbox for explicit resolution, never overwritten silently. */
  async function syncOwner(ownerId, transport) {
    ownerId = requireOwner(ownerId);
    if (!transport || typeof transport.push !== 'function') {
      throw new Error('Синхронизация отключена: не подключён транспорт сервера');
    }
    const pending = await listPending(ownerId);
    const result = { sent: 0, conflicts: 0, failed: 0 };
    for (const operation of pending) {
      try {
        const response = await transport.push(operation);
        if (response && response.status === 'ok') {
          const db = await openDb();
          const tx = db.transaction(OUTBOX, 'readwrite');
          tx.objectStore(OUTBOX).delete(operation.opId);
          await txDone(tx);
          db.close();
          result.sent++;
        } else if (response && response.status === 'conflict') {
          result.conflicts++;
        } else {
          result.failed++;
        }
      } catch (_) {
        result.failed++;
      }
    }
    return result;
  }

  async function clearPrototypeData() {
    const db = await openDb();
    const tx = db.transaction([RECORDS, OUTBOX], 'readwrite');
    tx.objectStore(RECORDS).clear();
    tx.objectStore(OUTBOX).clear();
    await txDone(tx);
    db.close();
  }

  root.ChecklistSyncPrototype = Object.freeze({
    dbName: DB_NAME, saveRecord, listRecords, listPending, syncOwner, clearPrototypeData
  });
})(typeof window !== 'undefined' ? window : self);
