import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createDocumentRegister, documentDashboardRows, DOCUMENT_TEMPLATE_REGISTRY } from "../prototype/checklist-document-register.js";
import { DOCUMENT_EXPORT_RUNTIME } from "../prototype/checklist-document-export.js";

test("first document template is housings only, awaiting approved user sample",()=>{
 assert.deepEqual(Object.keys(DOCUMENT_TEMPLATE_REGISTRY),["housings_notice"]);
 assert.equal(DOCUMENT_TEMPLATE_REGISTRY.housings_notice.templateVersion,null);
 const reg=createDocumentRegister({general:{type:"2ЭС5К",number:"789",date:"2026-11-26"},notices:[
  {equipmentId:"housings",equipmentName:"Кожуха",instanceId:"housings|Секция 1",fieldKey:"f2",operationName:"Осмотр",answer:"Нет",notificationStatus:"Да"},
  {equipmentId:"nvmontazh",instanceId:"nvmontazh|Секция 1",fieldKey:"f1",answer:"Устранено"}
 ]});
 assert.equal(reg.schemaVersion,1);
 assert.equal(reg.notices[0].templateId,"housings_notice");
 assert.equal(reg.notices[0].noticeGeneratedAt,null);
 assert.equal(reg.notices[0].noticeCopyUploaded,null);
 assert.equal(reg.notices[0].notificationStatus,"marked_delivered");
 assert.equal(reg.notices[1].templateId,null);
 assert.equal(reg.notices[1].templateState,"not_configured");
 assert.equal(reg.act.signatureVerified,false);
 const rows=documentDashboardRows(reg,"checklist-123");
 assert.equal(rows[0].checklistId,"checklist-123");
 assert.equal(rows[0].generated,"Не сформирован");
 assert.equal(rows[0].copyUploaded,"Нет подтверждения");
 assert.equal(rows[1].templateStatus,"not_configured");
});
test("no automatic documents are fabricated for a normal checklist",()=>{
 const reg=createDocumentRegister({general:{number:"12"}});
 assert.deepEqual(reg.notices,[]);
 assert.equal(reg.act.preparedAt,null);
});
test("cloud snapshot stores documents separately and removes intermediary notice source",async()=>{
 const backup=await readFile(new URL("../prototype/supabase-cloud-backup.js",import.meta.url),"utf8");
 const runtime=await readFile(new URL("../prototype/checklist-runtime.js",import.meta.url),"utf8");
 assert.match(backup,/const documents = createDocumentRegister/);
 assert.match(backup,/workflow: workflowSource \? workflow : null/);
 assert.match(backup,/documents,/);
 assert.match(runtime,/documentItems:triggered\.map/);
 assert.match(runtime,/__tmhDocumentRegisterExcel\(wb\)/);
 assert.match(runtime,/DOCUMENT_EXPORT_RUNTIME/);
});
test("Excel has a distinct structured document register without claiming signed act or uploaded notice copy",()=>{
 assert.match(DOCUMENT_EXPORT_RUNTIME,/Реестр документов/);
 assert.match(DOCUMENT_EXPORT_RUNTIME,/Ожидает образец/);
 assert.match(DOCUMENT_EXPORT_RUNTIME,/Нет подтверждения/);
 assert.match(DOCUMENT_EXPORT_RUNTIME,/Копия документа/);
 assert.match(DOCUMENT_EXPORT_RUNTIME,/kind:'Акт'/);
});
