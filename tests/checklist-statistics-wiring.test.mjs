import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

const templates = [
  ["BI", "prototype/embedded/bi.js"],
  ["complex and housings", "prototype/embedded/complex.js"],
  ["hydro", "prototype/embedded/hydro.js"],
  ["TT", "prototype/embedded/tt.js"],
];

test("editing general inspection date saves state and refreshes progress in every checklist template", async () => {
  for (const [mode, path] of templates) {
    const source = await readFile(resolve(ROOT, path), "utf8");
    assert.match(source, /function computeStats\s*\(/, mode + " must define statistics calculation");
    assert.match(source, /function updateStats\s*\(/, mode + " must define the statistics renderer");

    const dateIndex = source.indexOf("dateInput.type = 'date'");
    const compactDateIndex = source.indexOf("di.type='date'");
    const index = dateIndex >= 0 ? dateIndex : compactDateIndex;
    assert.notEqual(index, -1, mode + " must render an inspection date input");

    const dateSection = source.slice(index, index + 700);
    assert.match(dateSection, /addEventListener\(['"]input['"][\s\S]{0,300}STATE\.general\.date\s*=/,
      mode + " must write the edited date to checklist state");
    assert.match(dateSection, /addEventListener\(['"]input['"][\s\S]{0,450}saveState\(true\)[\s\S]{0,180}updateStats\(\)/,
      mode + " must save and recalculate progress while editing the date");
    assert.match(dateSection, /addEventListener\(['"]change['"][\s\S]{0,450}saveState\(true\)[\s\S]{0,180}updateStats\(\)/,
      mode + " must save and recalculate progress when the date picker commits a value");
  }
});
