import test from "node:test";
import assert from "node:assert/strict";
import { isChecklistComplete, summarizeChecklistStatuses } from "../prototype/checklist-status.js";

test("only a fully completed saved checklist is marked complete", () => {
  assert.equal(isChecklistComplete({ completionPercent: 100, totalFields: 12, filledTotal: 12 }), true);
  assert.equal(isChecklistComplete({ completionPercent: 99, totalFields: 12, filledTotal: 12 }), false);
  assert.equal(isChecklistComplete({ completionPercent: 100, totalFields: 12, filledTotal: 11 }), false);
  assert.equal(isChecklistComplete({ completionPercent: 100, totalFields: 0, filledTotal: 0 }), false);
  assert.equal(isChecklistComplete({ completionPercent: 100, totalFields: 12 }), false);
});

test("missing or invalid legacy stats are conservatively marked in progress", () => {
  assert.equal(isChecklistComplete(null), false);
  assert.equal(isChecklistComplete({}), false);
  assert.equal(isChecklistComplete({ completionPercent: "unknown" }), false);
  assert.equal(isChecklistComplete({ completionPercent: 0 }), false);
});

test("legacy summary stats with an explicit 100 percent remain complete", () => {
  assert.equal(isChecklistComplete({ completionPercent: 100, total: 8, answered: 8 }), true);
});

test("dashboard summary counts total, completed, and in-progress checklists", () => {
  const summary = summarizeChecklistStatuses([
    { stats: { completionPercent: 100, totalFields: 10, filledTotal: 10 } },
    { stats: { completionPercent: 45, totalFields: 10, filledTotal: 4 } },
    { stats: null },
    { stats: { completionPercent: 100, totalFields: 5, filledTotal: 4 } },
  ]);
  assert.deepEqual(summary, { total: 4, completed: 1, inProgress: 3 });
  assert.equal(Object.isFrozen(summary), true);
});

test("empty checklist collection has zero counts", () => {
  assert.deepEqual(summarizeChecklistStatuses([]), { total: 0, completed: 0, inProgress: 0 });
});
