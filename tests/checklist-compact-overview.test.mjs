import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const page=await readFile(new URL("../prototype/checklist-details.html",import.meta.url),"utf8");

test("inspection detail view has one compact status section without duplicated progress",()=>{
 assert.match(page,/Результаты осмотра/);
 assert.equal((page.match(/id="percent"/g)||[]).length,1);
 assert.equal((page.match(/id="deviations"/g)||[]).length,1);
 assert.doesNotMatch(page,/id="overviewProgress"/);
 assert.doesNotMatch(page,/id="timeline"/);
 assert.doesNotMatch(page,/id="notificationStats"/);
 assert.match(page,/id="attention"/);
});
test("essential checklist information and signed attachment controls survive",()=>{
 for(const id of ["title","inspectionDate","depot","place","percent","fields","missing",
                   "deviations","excel","actUpload","uploadAct","viewAct","openChecklist"])
   assert.match(page,new RegExp('id="'+id+'"'));
 assert.match(page,/listChecklistActs\(api,ownerId\)/);
 assert.match(page,/getChecklistActLink\(api,verifiedAct\)/);
 assert.match(page,/eq\("owner_id",ownerId\)/);
});
test("long equipment details are collapsed by default",()=>{
 assert.match(page,/<details class="more-details panel">/);
 assert.doesNotMatch(page,/<details class="more-details panel" open/);
 assert.match(page,/if\(event\.target\.open&&current\)renderEquipmentDetails/);
 assert.match(page,/Сведения об актах сейчас недоступны/);
});

test("notifications are included with documents without creating a verbose section",()=>{
 assert.match(page,/Документы и уведомления/);
 assert.equal((page.match(/id="notificationStatus"/g)||[]).length,1);
 assert.match(page,/id="notificationDetail"/);
 assert.match(page,/notifications\.required===0/);
 assert.match(page,/notifications\.pending\+notifications\.notSent/);
 assert.match(page,/notifications\.missingEvidence/);
 assert.doesNotMatch(page,/<h2>Уведомления<\/h2>/);
});

test("compact notification row distinguishes unverified legacy zeros from confirmed none",()=>{
 assert.match(page,/notifications\.verified\?"Не требуются по копии":"Требуется проверка"/);
 assert.match(page,/облачной копии нет подтверждённого расчёта уведомлений/);
 assert.match(page,/notifications\.required===0/);
});
