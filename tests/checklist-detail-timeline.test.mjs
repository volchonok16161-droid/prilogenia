import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildChecklistDetailTimeline } from "../prototype/checklist-detail-timeline.js";

test("timeline shows only persisted, dated records and sorts most recent first",()=>{
  const events=buildChecklistDetailTimeline(
    {created_at:"2026-11-20T08:00:00Z",updated_at:"2026-11-22T09:00:00Z"},
    {excelRequestedAt:"2026-11-21T11:00:00Z",actPreparedAt:"2026-11-22T12:00:00Z"},
    {id:"act-1",uploaded_at:"2026-11-23T09:00:00Z"}
  );
  assert.equal(events.length,5);
  assert.deepEqual(events.map(x=>x.title),[
    "Акт загружен","Акт подготовлен к печати","Облачная запись обновлена",
    "Запрошена выгрузка Excel","Чек-лист создан"
  ]);
});
test("timeline never invents Excel, act, or upload events from progress",()=>{
  const events=buildChecklistDetailTimeline(
    {created_at:"2026-11-20T08:00:00Z",updated_at:null},
    {percentage:100,actUploadedAt:"2026-11-22T12:00:00Z"},
    {uploaded_at:"2026-11-23T09:00:00Z"}
  );
  assert.deepEqual(events.map(x=>x.title),["Чек-лист создан"]);
  assert.deepEqual(buildChecklistDetailTimeline({}, {}, null),[]);
});
test("details display overview cards and actual recorded history",async()=>{
  const html=await readFile(new URL("../checklist-details.html",import.meta.url),"utf8");
  assert.match(html,/id="overviewProgress"/);
  assert.match(html,/id="overviewDeviations"/);
  assert.match(html,/id="overviewAct"/);
  assert.match(html,/id="timeline"/);
  assert.match(html,/buildChecklistDetailTimeline\(row,w,act\)/);
  assert.match(html,/aria-valuenow/);
  assert.match(html,/История каждого изменения полей пока не ведётся/);
});

test("offline application caches the inspection timeline dependency",async()=>{
 const sw=await readFile(new URL("../sw.js",import.meta.url),"utf8");
 assert.match(sw,/\.\/prototype\/checklist-detail-timeline\.js/);
 assert.match(sw,/checklist-cache-v163/);
});
