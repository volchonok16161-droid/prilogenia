import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { listChecklistActs, uploadChecklistAct } from "../prototype/checklist-acts.js";

const USER="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CHECKLIST="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

test("act upload requires an authenticated owner and a safe file", async () => {
  const api={getCurrentIdentity:async()=>({user:{id:USER}})};
  await assert.rejects(uploadChecklistAct(api,{ownerId:USER,checklistId:CHECKLIST,
    file:{name:"bad.exe",type:"application/octet-stream",size:12}}),/Допустимы/);
  await assert.rejects(uploadChecklistAct(api,{ownerId:"not-uuid",checklistId:CHECKLIST,
    file:{name:"act.pdf",type:"application/pdf",size:12}}),/идентификатор/);
});

test("account act archive respects owner and checklist scoping", async () => {
  let uploaded=false,inserted=false;
  const api={
    getCurrentIdentity:async()=>({user:{id:USER}}),
    client:{
      from(name){
        if(name==="checklists")return {select:()=>({eq:()=>({eq:()=>({single:async()=>({data:{id:CHECKLIST},error:null})})})})};
        if(name==="checklist_acts")return {
          select:()=>({eq:()=>({order:async()=>({data:[],error:null})})}),
          insert:()=>({select:()=>({single:async()=>{inserted=true;return{data:{id:CHECKLIST},error:null}}})})
        };
        throw new Error("Unexpected query");
      },
      storage:{from:()=>({
        upload:async()=>{uploaded=true;return{error:null}},
        remove:async()=>({error:null})
      })}
    }
  };
  const originalCrypto=globalThis.crypto;
  if(!globalThis.crypto)Object.defineProperty(globalThis,"crypto",{configurable:true,value:{randomUUID:()=>CHECKLIST}});
  try{
    await uploadChecklistAct(api,{ownerId:USER,checklistId:CHECKLIST,
      file:{name:"signed.pdf",type:"application/pdf",size:120}});
    assert.equal(uploaded,true);
    assert.equal(inserted,true);
    const listed=await listChecklistActs(api,USER);
    assert.equal(listed.size,0);
  }finally{
    if(!originalCrypto)delete globalThis.crypto;
  }
});

test("cabinet only claims uploaded act when verified metadata exists",async()=>{
  const html=await readFile(new URL("../account.html",import.meta.url),"utf8");
  assert.match(html,/listChecklistActs\(api, user\.id\)/);
  assert.match(html,/verifiedAct \? "Загружен/);
  assert.match(html,/uploadChecklistAct\(api,/);
  assert.match(html,/getChecklistActLink\(api,/);
});
