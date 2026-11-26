import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildChecklistEquipmentDetails } from "../prototype/checklist-equipment-details.js";

test("equipment breakdown preserves saved answers grouped by instance",()=>{
  const result=buildChecklistEquipmentDetails({state:{selected:["motor"],values:{
    "motor|Секция 1":{check_1:"OK",check_2:"NOK",check_3:"",check_4:"Не требуется",check_2_photo:"private://path"},
    "motor|Секция 2":{check_1:"Да"},
    "brakes|Секция 1":{check_1:"NOK"}
  }}});
  assert.equal(result.length,1);
  assert.equal(result[0].id,"motor");
  assert.equal(result[0].instances.length,2);
  assert.equal(result[0].answered,4);
  assert.equal(result[0].empty,1);
  assert.equal(result[0].nok,1);
  assert.equal(result[0].ok,1);
  assert.equal(result[0].instances[0].operations.length,4);
  assert.equal(result[0].instances[0].operations[3].kind,"answered");
});
test("no fabricated operations or compliance from legacy records",()=>{
  assert.deepEqual(buildChecklistEquipmentDetails({state:{values:{}}}),[]);
  const rows=buildChecklistEquipmentDetails({state:{values:{"unit|1":{measurement:"12",check:"Нет"}}}});
  assert.equal(rows[0].answered,2);
  assert.equal(rows[0].nok,0);
  assert.equal(rows[0].ok,0);
});
test("page exposes accordion and worker precaches detail helper",async()=>{
 const page=await readFile(new URL("../prototype/checklist-details.html",import.meta.url),"utf8");
 const worker=await readFile(new URL("../sw.js",import.meta.url),"utf8");
 assert.match(page,/id="equipmentDetailList"/);
 assert.match(page,/renderEquipmentDetails\(payload\)/);
 assert.match(page,/buildChecklistEquipmentDetails\(payload\)/);
 assert.match(page,/document\.createElement\("details"\)/);
 assert.match(worker,/\.\/prototype\/checklist-equipment-details\.js/);
});

test("verified complex-mode wiring labels and resolved deviation answers",()=>{
 const groups=buildChecklistEquipmentDetails({mode:"complex",state:{
   selected:["nvmontazh"],
   values:{"nvmontazh|Секция №1":{f1:"Устранено",f2:"Да",f3:"Да"},
           "nvmontazh|Секция №2":{f1:"Устранено",f2:"Да",f3:"Да"}}
 }});
 assert.equal(groups.length,1);
 assert.equal(groups[0].label,"Низковольтный электрический монтаж");
 assert.equal(groups[0].answered,6);
 assert.equal(groups[0].nok,2);
 assert.equal(groups[0].instances[0].operations[0].kind,"deviation");
 assert.match(groups[0].instances[0].operations[0].label,/пультом машиниста/);
});
