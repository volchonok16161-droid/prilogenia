import test from "node:test";
import assert from "node:assert/strict";
import { createChecklistExcelArchive } from "../prototype/supabase-cloud-excel-archive.js";

const USER = "11111111-1111-4111-8111-111111111111";
const EXPORT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function harness({ uploadError = null, insertError = null } = {}) {
  const calls = [];
  const rows = [];
  const files = new Map();
  const storageApi = {
    from(bucket) {
      return {
        async upload(path, blob, options) {
          calls.push(["upload", bucket, path, blob.size, options]);
          if (uploadError) return { data: null, error: uploadError };
          files.set(path, blob);
          return { data: { path }, error: null };
        },
        async download(path) {
          calls.push(["download", bucket, path]);
          return { data: files.get(path) || null, error: null };
        },
      };
    },
  };
  const database = {
    from(table) {
      assert.equal(table, "checklist_exports");
      return {
        insert(value) {
          calls.push(["insert", value]);
          return {
            select() {
              return {
                single: async () => {
                  if (insertError) return { data: null, error: insertError };
                  const row = { id: EXPORT, ...value, created_at: "2026-11-05T10:00:00Z" };
                  rows.push(row);
                  return { data: row, error: null };
                },
              };
            },
          };
        },
        select() {
          const filters = [];
          const query = {
            order() { return query; },
            limit() { return query; },
            eq(key, value) { filters.push([key, value]); return query; },
            maybeSingle: async () => ({ data: rows.find((row) => row.id === filters.find((x) => x[0] === "id")?.[1]) || null, error: null }),
            then(resolve, reject) {
              return Promise.resolve({ data: rows.filter((row) => filters.every(([key, value]) => row[key] === value)), error: null }).then(resolve, reject);
            },
          };
          return query;
        },
      };
    },
  };
  const authApi = { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } };
  const archive = createChecklistExcelArchive({ authApi, storageApi, database, idFactory: () => EXPORT });
  return { archive, calls, rows, files };
}

test("Excel archive uploads a private file and records owner-scoped metadata", async () => {
  const h = harness();
  const blob = new Blob(["xlsx-content"], { type: MIME });
  const row = await h.archive.save({
    blob, fileName: "2026_ВЛ80_123_Чек-лист_Комплексный.xlsx",
    mode: "complex", checklistType: "ВЛ80", checklistNumber: "123", checklistDate: "2026-11-05",
  });
  assert.equal(h.calls[0][0], "upload");
  assert.equal(h.calls[0][1], "checklist-exports");
  assert.equal(h.calls[0][2], USER + "/" + EXPORT + "/2026_ВЛ80_123_Чек-лист_Комплексный.xlsx");
  assert.equal(h.calls[1][0], "insert");
  assert.equal(h.calls[1][1].owner_id, USER);
  assert.equal(h.calls[1][1].mode, "complex");
  assert.equal(h.calls[1][1].file_size, blob.size);
  assert.equal(row.id, EXPORT);
});

test("Excel archive rejects unauthenticated access before storage writes", async () => {
  const h = harness();
  const archive = createChecklistExcelArchive({
    authApi: { async getCurrentIdentity() { return { user: null, error: null }; } },
    storageApi: { from() { throw new Error("must not access storage"); } },
    database: { from() { throw new Error("must not access database"); } },
  });
  await assert.rejects(archive.save({ blob: new Blob(["x"], { type: MIME }), fileName: "x.xlsx", mode: "complex" }),
    (error) => error.code === "AUTH_REQUIRED");
  assert.equal(h.calls.length, 0);
});

test("Excel archive enforces XLSX type and 50 MB size ceiling", async () => {
  const h = harness();
  await assert.rejects(h.archive.save({ blob: new Blob(["x"], { type: "text/plain" }), fileName: "x.xlsx", mode: "complex" }),
    (error) => error.code === "INVALID_EXPORT_TYPE");
  const oversized = new Blob([new Uint8Array(51 * 1024 * 1024)], { type: MIME });
  await assert.rejects(h.archive.save({ blob: oversized, fileName: "x.xlsx", mode: "complex" }),
    (error) => error.code === "EXPORT_SIZE_LIMIT");
  assert.equal(h.calls.length, 0);
});

test("Excel archive reports upload failures and never inserts metadata", async () => {
  const h = harness({ uploadError: { message: "offline" } });
  await assert.rejects(h.archive.save({ blob: new Blob(["x"], { type: MIME }), fileName: "x.xlsx", mode: "complex" }),
    (error) => error.code === "EXCEL_CLOUD_FAILED");
  assert.equal(h.calls.length, 1);
});

test("Excel archive lists and downloads only rows returned by the authenticated owner scope", async () => {
  const h = harness();
  const blob = new Blob(["xlsx-content"], { type: MIME });
  const row = await h.archive.save({ blob, fileName: "complex.xlsx", mode: "complex" });
  const list = await h.archive.list({ mode: "complex" });
  assert.equal(list.length, 1);
  assert.equal(list[0].id, row.id);
  const downloaded = await h.archive.download(row.id);
  assert.equal(downloaded.fileName, "complex.xlsx");
  assert.equal(await downloaded.blob.text(), "xlsx-content");
});

test("Excel archive does not accept unsafe filenames", async () => {
  const h = harness();
  const row = await h.archive.save({ blob: new Blob(["x"], { type: MIME }), fileName: "../unsafe.xlsx", mode: "complex" });
  assert.equal(row.file_name, ".._unsafe.xlsx");
});
