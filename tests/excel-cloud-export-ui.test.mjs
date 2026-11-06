import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const main = await readFile(new URL("../index.html", import.meta.url), "utf8");
const modes = ["complex.js", "tt.js", "bi.js", "hydro.js"];

test("Excel export uses the existing checklist backup flow, not a separate file archive", () => {
  assert.match(main, /window\.__TMH_SAVE_CLOUD_BACKUP_CONTEXT = async function\(context\)/);
  assert.match(main, /createChecklistCloudBackup\(/);
  assert.match(main, /return backup\.saveCurrent\(\)/);
  assert.doesNotMatch(main, /createChecklistExcelArchive|__TMH_SAVE_EXCEL_EXPORT/);
});

for (const file of modes) {
  test(file + " saves the current checklist snapshot and photos to cloud before downloading Excel", async () => {
    const source = await readFile(new URL("../prototype/embedded/" + file, import.meta.url), "utf8");
    const start = source.indexOf("async function exportWithPhotos");
    const anchor = source.indexOf("a.download", start);
    const save = source.indexOf("__TMH_SAVE_CLOUD_BACKUP_CONTEXT", anchor);
    const click = source.indexOf("a.click()", anchor);
    assert.ok(start >= 0 && anchor > start, "export handler and filename exist");
    assert.ok(save > anchor && click > save, "cloud checklist backup is awaited before local Excel download");
    assert.match(source.slice(save, click), /__getContext\(\)/);
    assert.match(source.slice(save, click), /await __psEnsureCloudReady\(\)/, "embedded photo writes are flushed before the shared backup runs");
    assert.match(source.slice(save, click), /catch \(__cloudError\)/);
    assert.match(source.slice(click, click + 280), /Excel скачан, но облачная копия чек-листа не обновлена/);
  });
}

test("native complex checklist Excel export calls the same cloud backup function", () => {
  const start = main.indexOf("async function exportWithPhotos");
  const anchor = main.indexOf("a.download=sb+'.xlsx';", start);
  const save = main.indexOf("__TMH_SAVE_CLOUD_BACKUP_CONTEXT", anchor);
  const click = main.indexOf("a.click()", anchor);
  assert.ok(start >= 0 && anchor > start && save > anchor && click > save);
  assert.match(main.slice(save, click), /__TMH_GET_NATIVE_CLOUD_BACKUP_CONTEXT/);
});

test("native and embedded save buttons use the same shared backup entry point", () => {
  assert.match(main, /const result=await window\.__TMH_SAVE_CLOUD_BACKUP_CONTEXT\(getContext\(\)\)/);
  assert.match(main, /window\.parent\.__TMH_SAVE_CLOUD_BACKUP_CONTEXT\(getContext\(\)\)/);
});

test("Excel export success messaging distinguishes the local workbook from the cloud checklist backup", () => {
  const sources = [main, ...modes.map(() => "")];
  assert.match(main, /Резервная копия чек-листа и фото сохранена в облако; Excel скачан/);
  assert.match(main, /Excel скачан, но облачная копия чек-листа не обновлена/);
});
