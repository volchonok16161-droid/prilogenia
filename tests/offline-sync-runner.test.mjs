import test from "node:test";
import assert from "node:assert/strict";
import { createOfflineSyncRunner } from "../prototype/offline-sync-runner.js";

const UID = "11111111-1111-4111-8111-111111111111";
const OP = { opId:"op-1", userId:UID, entityId:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", operation:"update", encrypted:{version:1,iv:"iv",ciphertext:"cipher"}, status:"pending", attempts:0 };

function fixture({ identity, online=true, cloud={} } = {}) {
  const queue=[{...OP}]; const conflicts=[]; const calls=[];
  const database={
    async listPending(uid, nowIso = new Date().toISOString()){
      assert.equal(uid,UID);
      return queue.filter(x=>x.status==="pending" || (x.status==="processing" && (!x.leaseUntil || x.leaseUntil<=nowIso))).map(x=>({...x}));
    },
    async claimQueueOperation(opId,uid,claimId,nowIso,leaseUntil){
      const row=queue.find(x=>x.opId===opId&&x.userId===uid);
      if(!row) return false;
      const expired=!row.leaseUntil || row.leaseUntil<=nowIso;
      if(row.status!=="pending" && !(row.status==="processing"&&expired)) return false;
      Object.assign(row,{status:"processing",leaseClaimId:claimId,leaseUntil});
      return true;
    },
    async updateQueueOperation(opId,uid,changes){ const row=queue.find(x=>x.opId===opId&&x.userId===uid); if(row) Object.assign(row,changes); return Boolean(row); },
    async markSynced(opId,uid){ const i=queue.findIndex(x=>x.opId===opId&&x.userId===uid); if(i>=0) queue.splice(i,1); },
    async saveConflict(value){ conflicts.push(value); },
  };
  const authApi={async getCurrentIdentity(){return identity ?? {user:{id:UID},profile:{id:UID,role:"employee"},error:null};}};
  const vault={async decrypt(){return {title:"local"};},async encrypt(value){return {version:1,iv:"remote-iv",ciphertext:JSON.stringify(value)};}};
  const cloudSync={
    async create(input){calls.push(["create",input]); if(cloud.create) return cloud.create(input);},
    async update(input){calls.push(["update",input]); if(cloud.update) return cloud.update(input);},
    async remove(id){calls.push(["remove",id]); if(cloud.remove) return cloud.remove(id);},
    async get(id){calls.push(["get",id]); if(cloud.get) return cloud.get(id); return {title:"remote"};},
  };
  const runner=createOfflineSyncRunner({
    authApi,database,vault,cloudSync,
    mapOperation:async (_op,value)=>({method:"update",id:OP.entityId,input:{id:OP.entityId,expectedRevision:1,title:value.title,equipmentType:"TT",payload:{}}}),
    isOnline:()=>online,
  });
  return {runner,queue,conflicts,calls};
}

test("refuses to sync a local PIN identity without a verified server profile", async()=>{
 const {runner,calls}=fixture({identity:{user:{id:UID},profile:null,error:null}});
 await assert.rejects(runner.syncPending({userId:UID}),e=>e.code==="AUTH_REQUIRED");
 assert.equal(calls.length,0);
});

test("offline state exits without reading or sending the queue",async()=>{
 const {runner,calls}=fixture({online:false});
 assert.equal((await runner.syncPending({userId:UID})).status,"offline");
 assert.equal(calls.length,0);
});

test("successful operation is removed from the queue only after cloud success",async()=>{
 const {runner,queue,calls}=fixture();
 const result=await runner.syncPending({userId:UID});
 assert.equal(result.synced,1); assert.equal(queue.length,0); assert.equal(calls[0][0],"update");
});

test("revision conflict stores encrypted local and remote copies and blocks automatic retry",async()=>{
 const {runner,queue,conflicts,calls}=fixture({cloud:{update:async()=>{const e=new Error("stale");e.code="REVISION_CONFLICT";throw e;}}});
 const result=await runner.syncPending({userId:UID});
 assert.equal(result.conflicts,1); assert.equal(queue[0].status,"conflict");
 assert.equal(conflicts.length,1); assert.equal(conflicts[0].localEncrypted,OP.encrypted);
 assert.equal(conflicts[0].remoteEncrypted.version,1); assert.equal(calls.at(-1)[0],"get");
});

test("transient cloud failure preserves the encrypted item as pending",async()=>{
 const {runner,queue}=fixture({cloud:{update:async()=>{throw new Error("network timeout");}}});
 const result=await runner.syncPending({userId:UID});
 assert.equal(result.failed,1); assert.equal(queue[0].status,"pending");
 assert.match(queue[0].lastError,/network timeout/); assert.equal(queue[0].encrypted,OP.encrypted);
});

test("validates batch size and account UUID",async()=>{
 const {runner}=fixture();
 await assert.rejects(runner.syncPending({userId:"bad"}),/UUID/);
 await assert.rejects(runner.syncPending({userId:UID,limit:101}),/limit/);
});

test("two runners cannot claim and send the same live queue lease", async()=>{
 const {queue,calls}=fixture();
 let release;
 const gate=new Promise(resolve=>{release=resolve;});
 const sharedDatabase={
   async listPending(uid,nowIso=new Date().toISOString()){
     return queue.filter(x=>x.userId===uid && (x.status==="pending" || (x.status==="processing" && x.leaseUntil<=nowIso))).map(x=>({...x}));
   },
   async claimQueueOperation(opId,uid,claimId,nowIso,leaseUntil){
     const row=queue.find(x=>x.opId===opId&&x.userId===uid);
     if(!row) return false;
     if(row.status!=="pending" && !(row.status==="processing"&&row.leaseUntil<=nowIso)) return false;
     Object.assign(row,{status:"processing",leaseClaimId:claimId,leaseUntil});
     return true;
   },
   async updateQueueOperation(opId,uid,changes){const row=queue.find(x=>x.opId===opId&&x.userId===uid);if(row)Object.assign(row,changes);return !!row;},
   async markSynced(opId,uid){const i=queue.findIndex(x=>x.opId===opId&&x.userId===uid);if(i>=0)queue.splice(i,1);},
   async saveConflict(){},
 };
 const identity={async getCurrentIdentity(){return {user:{id:UID},profile:{id:UID,role:"employee"},error:null};}};
 const vault={async decrypt(){return {title:"local"};},async encrypt(value){return {version:1,iv:"iv",ciphertext:JSON.stringify(value)};}};
 const cloudSync={
   async create(){},async remove(){},async get(){return {};},
   async update(input){calls.push(input);await gate;}
 };
 const makeRunner=()=>createOfflineSyncRunner({
   authApi:identity,database:sharedDatabase,vault,cloudSync,
   mapOperation:async(_op,value)=>({method:"update",id:OP.entityId,input:{id:OP.entityId,expectedRevision:1,title:value.title,equipmentType:"TT",payload:{}}}),
   isOnline:()=>true,now:()=> "2026-11-04T12:00:00.000Z",claimIdFactory:()=> "claim-"+Math.random(),
 });
 const first=makeRunner().syncPending({userId:UID});
 await new Promise(resolve=>setImmediate(resolve));
 const second=await makeRunner().syncPending({userId:UID});
 assert.equal(calls.length,1);
 assert.equal(second.synced,0);
 release();
 await first;
 assert.equal(queue.length,0);
});

test("expired processing lease becomes claimable after another tab closes", async()=>{
 const {runner,queue}=fixture();
 queue[0].status="processing";
 queue[0].leaseUntil="2026-11-04T11:00:00.000Z";
 const result=await runner.syncPending({userId:UID});
 assert.equal(result.synced,1);
 assert.equal(queue.length,0);
});
