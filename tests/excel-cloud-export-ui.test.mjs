import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const main = await readFile(new URL("../index.html", import.meta.url), "utf8");
const modes = [
  ["complex.js", "MODE"],
  ["tt.js", "'tt'"],
  ["bi.js", "'bi'"],
  ["hydro.js", "'hydro'"],
];

test("the parent page exposes an authenticated private Excel archive uploader", () => {
  assert.match(main, /createChecklistExcelArchive/);
  assert.match(main, /window\.__TMH_SAVE_EXCEL_EXPORT = async function\(blob, metadata\)/);
  assert.match(main, /return archive\.save\(\{ blob, \.\.\.metadata \}\)/);
});

for (const [file, mode] of modes) {
  test(file + " uploads the generated workbook before triggering the download", async () => {
    const source = await readFile(new URL("../prototype/embedded/" + file, import.meta.url), "utf8");
    const anchor = source.indexOf("a.download");
    const upload = source.indexOf("__saveExcel(blob", anchor);
    const click = source.indexOf("a.click()", anchor);
    assert.ok(anchor >= 0, "xlsx filename is generated");
    assert.ok(upload > anchor, "cloud upload follows filename generation");
    assert.ok(click > upload, "download happens after cloud upload attempt");
    assert.match(source.slice(upload, click), /mode: /);
    assert.match(source.slice(upload, click), /checklistDate:/);
    assert.match(source.slice(upload, click), /catch \(__cloudError\)/);
    assert.match(source.slice(click, click + 250), /Excel скачан, но не сохранён в облако/);
  });
}
