import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

const numberValidationTemplates = [
  ["complex and housings", "prototype/embedded/complex.js", "function validateNumber()", "ni.addEventListener('blur'"],
  ["hydro", "prototype/embedded/hydro.js", "function validateNumber()", "numInput.addEventListener('blur'"],
];

test("revalidating an unchanged locomotive number does not clear the selected inspection place", async () => {
  for (const [mode, path, startMarker, endMarker] of numberValidationTemplates) {
    const source = await readFile(resolve(ROOT, path), "utf8");
    const start = source.indexOf(startMarker);
    assert.notEqual(start, -1, mode + " must define number validation");
    const end = source.indexOf(endMarker, start);
    assert.notEqual(end, -1, mode + " must bind number validation to blur");
    const validateNumber = source.slice(start, end);

    assert.match(validateNumber, /numberChanged\s*=\s*STATE\.general\.number\s*!==\s*val/,
      mode + " must detect whether the number actually changed");
    assert.match(validateNumber, /if\s*\(numberChanged\)\s*refreshChain\(['"]number['"]\)/,
      mode + " may reset dependent place only after a real number change");
    assert.doesNotMatch(validateNumber, /STATE\.general\.number\s*=\s*val\s*;\s*refreshChain\(['"]number['"]\)/,
      mode + " must not unconditionally clear the inspection place on blur");
  }
});
