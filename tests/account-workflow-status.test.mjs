import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildChecklistWorkflowView } from "../prototype/checklist-workflow-status.js";

test("legacy checklists never receive invented workflow confirmations", () => {
  const view = buildChecklistWorkflowView({stats:{completionPercent:100,totalFields:10,filledTotal:10}});
  assert.equal(view.percentage,100);
  assert.equal(view.equipment,null);
  assert.equal(view.notifications,null);
  assert.equal(view.excelRequestedAt,null);
  assert.equal(view.actPreparedAt,null);
  assert.equal(view.actUploadedAt,null);
});

test("workflow tracks selected scope, notification outcomes and document requests", () => {
  const timestamp="2026-11-24T08:30:00Z";
  const view=buildChecklistWorkflowView({
    stats:{completionPercent:80,totalFields:10,filledTotal:8},
    workflow:{
      selection:{selectedEquipment:2,availableEquipment:3,selectedSections:1,availableSections:2},
      notifications:{required:3,delivered:1,notDelivered:1,pending:1,missingEvidence:0},
      excel:{requestedAt:timestamp},
      act:{preparedAt:timestamp,uploadedAt:timestamp,verifiedUpload:false}
    }
  });
  assert.deepEqual(view.equipment,{selected:2,available:3});
  assert.deepEqual(view.sections,{selected:1,available:2});
  assert.equal(view.notifications.required,3);
  assert.equal(view.notifications.notSent,1);
  assert.equal(view.excelRequestedAt,timestamp);
  assert.equal(view.actPreparedAt,timestamp);
  assert.equal(view.actUploadedAt,null);
});

test("invalid or unverifiable uploaded-act signals stay unconfirmed", () => {
  assert.equal(buildChecklistWorkflowView({workflow:{act:{uploadedAt:"2026-11-24T08:30:00Z"}}}).actUploadedAt,null);
});

test("personal cabinet renders lifecycle indicators from owner-scoped cloud records", async () => {
  const html=await readFile(new URL("../account.html",import.meta.url),"utf8");
  assert.match(html,/workflow:payload->workflow/);
  assert.match(html,/buildChecklistWorkflowView\(row\)/);
  assert.match(html,/workflow-grid/);
  assert.match(html,/Не подтверждена/);
  assert.match(html,/Нет подтверждения/);
});
