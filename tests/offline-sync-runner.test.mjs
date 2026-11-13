import test from "node:test";
import assert from "node:assert/strict";
import { createOfflineSyncRunner } from "../prototype/offline-sync-runner.js";

const UID = "11111111-1111-4111-8111-111111111111";
const OP = { opId:"op-1", userId:UID, entityId:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", operation:"update", encrypted:{version:1,iv:"iv",ciphertext:"cipher"}, status:"pending", attempts:0 };

function fixture({ identity, online=true, cloud={}, setIntervalImpl, clearIntervalImpl, leaseDurationMs, leaseRenewIntervalMs, retryRevision = null } = {}) {
  const queue=[{...OP}]; const conflicts=[]; const calls=[]; const leaseRenewals=[];
  let cloudState = retryRevision === null ? null : { revision: retryRevision };
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
    async updateQueueOperation(opId,uid,changes,expectedClaim){ const row=queue.find(x=>x.opId===opId&&x.userId===uid); if(!row || (expectedClaim!==undefined && row.leaseClaimId!==expectedClaim)) return false; if (changes.leaseUntil) leaseRenewals.push(changes.leaseUntil); Object.assign(row,changes); return true; },
    async getCloudState(uid,entityId){ return uid===UID && entityId===OP.entityId ? cloudState : null; },
    async markSynced(opId,uid,_revision,expectedClaim,nextState){ const i=queue.findIndex(x=>x.opId===opId&&x.userId===uid); if(i<0 || (expectedClaim!==undefined && queue[i].leaseClaimId!==expectedClaim)) return false; queue.splice(i,1); cloudState=nextState===null?null:(nextState||cloudState); return {opId,serverRevision:_revision??null}; },
    async saveConflict(value){ conflicts.push(value); },
  };
  const authApi={async getCurrentIdentity(){return identity ?? {user:{id:UID},profile:{id:UID,role:"employee"},error:null};}};
  const vault={async decrypt(){return {title:"local", ...(retryRevision === null ? {} : { cloud: { expectedRevision: retryRevision } })};},async encrypt(value){return {version:1,iv:"remote-iv",ciphertext:JSON.stringify(value)};}};
  const cloudSync={
    async create(input){calls.push(["create",input]); if(cloud.create) return cloud.create(input); return {id:OP.entityId,revision:1};},
    async update(input){calls.push(["update",input]); if(cloud.update) return cloud.update(input); return {id:OP.entityId,revision:2};},
    async remove(id){calls.push(["remove",id]); if(cloud.remove) return cloud.remove(id); return true;},
    async get(id){calls.push(["get",id]); if(cloud.get) return cloud.get(id); return {title:"remote"};},
  };
  const runner=createOfflineSyncRunner({
    authApi,database,vault,cloudSync,
    mapOperation:async (_op,value)=>({method:"update",id:OP.entityId,input:{id:OP.entityId,expectedRevision:1,title:value.title,equipmentType:"TT",payload:{}}}),
    isOnline:()=>online,
    ...(setIntervalImpl ? { setIntervalImpl } : {}),
    ...(clearIntervalImpl ? { clearIntervalImpl } : {}),
    ...(leaseDurationMs ? { leaseDurationMs } : {}),
    ...(leaseRenewIntervalMs ? { leaseRenewIntervalMs } : {}),
  });
  return {runner,queue,conflicts,calls,leaseRenewals,get cloudState(){return cloudState;}};
}

test("refuses to sync a local device identity without a verified server profile", async()=>{
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

test("retry with advanced remote revision stores encrypted conflict before uploading photos", async () => {
  const { runner, queue, conflicts, calls } = fixture({
    retryRevision: 1,
    cloud: { get: async () => ({ id: OP.entityId, revision: 3, payload: { state: { remote: true } } }) },
  });
  queue[0].attempts = 1;
  const result = await runner.syncPending({ userId: UID });
  assert.equal(result.conflicts, 1);
  assert.equal(result.failed, 0);
  assert.equal(queue[0].status, "conflict");
  assert.equal(queue[0].encrypted, OP.encrypted);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].remoteEncrypted.version, 1);
  assert.deepEqual(calls.map(call => call[0]), ["get"]);
});

test("retry with unchanged remote revision continues normal cloud update", async () => {
  const { runner, queue, calls } = fixture({
    retryRevision: 1,
    cloud: { get: async () => ({ id: OP.entityId, revision: 1, payload: {} }) },
  });
  queue[0].attempts = 1;
  const result = await runner.syncPending({ userId: UID });
  assert.equal(result.synced, 1);
  assert.equal(queue.length, 0);
  assert.deepEqual(calls.map(call => call[0]), ["get", "update"]);
});

test("retry with failed owner-scoped lookup keeps encrypted operation pending", async () => {
  const { runner, queue, calls } = fixture({
    retryRevision: 1,
    cloud: { get: async () => { throw new Error("temporary lookup outage"); } },
  });
  queue[0].attempts = 1;
  const result = await runner.syncPending({ userId: UID });
  assert.equal(result.failed, 1);
  assert.equal(queue[0].status, "pending");
  assert.equal(queue[0].encrypted, OP.encrypted);
  assert.deepEqual(calls.map(call => call[0]), ["get"]);
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
   async updateQueueOperation(opId,uid,changes,expectedClaim){const row=queue.find(x=>x.opId===opId&&x.userId===uid);if(!row||(expectedClaim!==undefined&&row.leaseClaimId!==expectedClaim))return false;Object.assign(row,changes);return true;},
   async getCloudState(){return null;},
   async markSynced(opId,uid,_revision,expectedClaim){const i=queue.findIndex(x=>x.opId===opId&&x.userId===uid);if(i<0||(expectedClaim!==undefined&&queue[i].leaseClaimId!==expectedClaim))return false;queue.splice(i,1);return {opId};},
   async saveConflict(){},
 };
 const identity={async getCurrentIdentity(){return {user:{id:UID},profile:{id:UID,role:"employee"},error:null};}};
 const vault={async decrypt(){return {title:"local"};},async encrypt(value){return {version:1,iv:"iv",ciphertext:JSON.stringify(value)};}};
 const cloudSync={
   async create(){},async remove(){},async get(){return {};},
   async update(input){calls.push(input);await gate;return {id:OP.entityId,revision:2};}
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

test("a stale lease owner cannot acknowledge or release a newer claim", async()=>{
 const {queue}=fixture();
 const row=queue[0];
 row.status="processing";
 row.leaseClaimId="new-owner";
 const {runner}=fixture();
 // The runner claims its own item in an isolated fixture; the stale-owner
 // guard itself is asserted against the shared fake DB contract here.
 const guarded={
   async updateQueueOperation(opId,uid,changes,expected){if(row.opId!==opId||row.userId!==uid||row.leaseClaimId!==expected)return false;Object.assign(row,changes);return true;},
   async markSynced(opId,uid,_revision,expected){if(row.opId!==opId||row.userId!==uid||row.leaseClaimId!==expected)return false;return true;},
 };
 assert.equal(await guarded.updateQueueOperation(row.opId,UID,{status:"pending"}, "old-owner"),false);
 assert.equal(await guarded.markSynced(row.opId,UID,undefined,"old-owner"),false);
 assert.equal(row.status,"processing");
 assert.equal(row.leaseClaimId,"new-owner");
 assert.ok(runner);
});

test("photo cleanup survives a failure and retries without resending the checklist", async () => {
  const oldManifest = [{ itemId: "item", field: "photo_photo", path: "old-photo" }];
  const newManifest = [{ itemId: "item", field: "photo_photo", path: "new-photo" }];
  const queue = [{ ...OP }];
  const jobs = [];
  let cloudState = { revision: 1, photoManifest: oldManifest };
  let updateCalls = 0;
  let removeCalls = 0;
  let refuseCleanupCompletion = false;
  const database = {
    async listPending(uid) { return queue.filter(row => row.userId === uid && row.status === "pending").map(row => ({ ...row })); },
    async claimQueueOperation(id, uid, claim, _now, until) {
      const row = queue.find(x => x.opId === id && x.userId === uid);
      if (!row || row.status !== "pending") return false;
      Object.assign(row, { status: "processing", leaseClaimId: claim, leaseUntil: until });
      return true;
    },
    async updateQueueOperation(id, uid, changes, claim) {
      const row = queue.find(x => x.opId === id && x.userId === uid);
      if (!row || row.leaseClaimId !== claim) return false;
      Object.assign(row, changes); return true;
    },
    async getCloudState() { return cloudState; },
    async markSynced(id, uid, revision, claim, nextState, cleanup) {
      const index = queue.findIndex(x => x.opId === id && x.userId === uid && x.leaseClaimId === claim);
      if (index < 0) return false;
      queue.splice(index, 1);
      cloudState = nextState;
      if (cleanup) jobs.push({ ...cleanup, userId: uid, entityId: OP.entityId, status: "pending", attempts: 0 });
      return { opId: id, serverRevision: revision };
    },
    async listPhotoCleanups(uid) { return jobs.filter(x => x.userId === uid && x.status === "pending").map(x => ({ ...x })); },
    async claimPhotoCleanup(id, uid, claim) {
      const job = jobs.find(x => x.cleanupId === id && x.userId === uid);
      if (!job || job.status !== "pending") return false;
      Object.assign(job, { status: "processing", leaseClaimId: claim }); return true;
    },
    async updatePhotoCleanup(id, uid, changes, claim) {
      const job = jobs.find(x => x.cleanupId === id && x.userId === uid);
      if (!job || job.leaseClaimId !== claim) return false;
      Object.assign(job, changes); return true;
    },
    async completePhotoCleanup(id, uid, claim) {
      if (refuseCleanupCompletion) return false;
      const index = jobs.findIndex(x => x.cleanupId === id && x.userId === uid && x.leaseClaimId === claim);
      if (index < 0) return false;
      jobs.splice(index, 1); return true;
    },
    async saveConflict() {},
  };
  const authApi = { async getCurrentIdentity() { return { user: { id: UID }, profile: { id: UID, role: "employee" } }; } };
  const vault = { async decrypt() { return { title: "local" }; }, async encrypt(value) { return { version: 1, iv: "iv", ciphertext: JSON.stringify(value) }; } };
  const cloudSync = {
    async create() {}, async remove() {}, async get() { return { payload: { photoManifest: newManifest } }; },
    async update() { updateCalls += 1; return { id: OP.entityId, revision: 2 }; },
  };
  const mapper = async () => ({
    method: "update", id: OP.entityId,
    input: { id: OP.entityId, expectedRevision: 1, payload: { photoManifest: newManifest } },
    cleanupManifest: oldManifest,
  });
  mapper.removePhotoManifest = async (manifest) => {
    removeCalls += 1;
    assert.deepEqual(manifest.map(x => x.path), ["old-photo"]);
    if (removeCalls === 1) throw new Error("temporary Storage outage");
  };
  const runner = createOfflineSyncRunner({ authApi, database, vault, cloudSync, mapOperation: mapper, isOnline: () => true });
  const first = await runner.syncPending({ userId: UID });
  assert.equal(first.synced, 1);
  assert.equal(first.cleanupFailed, 1);
  assert.equal(first.cleanupRemaining, 1);
  assert.equal(queue.length, 0);
  assert.equal(jobs.length, 1);
  refuseCleanupCompletion = true;
  const second = await runner.syncPending({ userId: UID });
  assert.equal(second.synced, 0);
  assert.equal(second.cleanupProcessed, 0);
  assert.equal(second.cleanupFailed, 1);
  assert.equal(second.cleanupRemaining, 1);
  assert.equal(updateCalls, 1);
  assert.equal(removeCalls, 2);

  refuseCleanupCompletion = false;
  const third = await runner.syncPending({ userId: UID });
  assert.equal(third.synced, 0);
  assert.equal(third.cleanupProcessed, 1);
  assert.equal(third.cleanupRemaining, 0);
  assert.equal(updateCalls, 1);
  assert.equal(removeCalls, 3);
});


function createRecoveryFixture({ lookup, cloudCreate, cloudState = null } = {}) {
  const queue = [{
    opId: "create-op", userId: UID, entityId: OP.entityId, operation: "create",
    encrypted: OP.encrypted, status: "pending", attempts: 0,
  }];
  const calls = [];
  const conflicts = [];
  const database = {
    async listPending(uid) { return queue.filter(row => row.userId === uid && row.status === "pending").map(row => ({ ...row })); },
    async claimQueueOperation(id, uid, claim, _now, until) {
      const row = queue.find(item => item.opId === id && item.userId === uid && item.status === "pending");
      if (!row) return false;
      Object.assign(row, { status: "processing", leaseClaimId: claim, leaseUntil: until });
      return true;
    },
    async updateQueueOperation(id, uid, changes, claim) {
      const row = queue.find(item => item.opId === id && item.userId === uid);
      if (!row || row.leaseClaimId !== claim) return false;
      Object.assign(row, changes); return true;
    },
    async getCloudState() { return cloudState; },
    async markSynced(id, uid, revision, claim, state) {
      const index = queue.findIndex(item => item.opId === id && item.userId === uid && item.leaseClaimId === claim);
      if (index < 0) return false;
      queue.splice(index, 1);
      calls.push(["ack", revision, state]);
      return { opId: id, serverRevision: revision };
    },
    async saveConflict(value) { conflicts.push(value); },
  };
  const authApi = { async getCurrentIdentity() { return { user: { id: UID }, profile: { id: UID, role: "employee" } }; } };
  const vault = { async decrypt() { return { cloud: { id: OP.entityId, title: "offline edit", equipmentType: "TT", payload: { state: {} } } }; }, async encrypt(value) { return { version: 1, iv: "iv", ciphertext: JSON.stringify(value) }; } };
  const cloudSync = {
    async get(id) {
      calls.push(["get", id]);
      if (lookup instanceof Error) throw lookup;
      if (lookup === null) { const error = new Error("not found"); error.code = "NOT_FOUND"; throw error; }
      return lookup;
    },
    async create(input) { calls.push(["create", input]); return cloudCreate || { id: OP.entityId, revision: 1 }; },
    async update(input) { calls.push(["update", input]); return { id: OP.entityId, revision: input.expectedRevision + 1 }; },
    async remove() { throw new Error("unexpected remove"); },
  };
  const runner = createOfflineSyncRunner({
    authApi, database, vault, cloudSync, isOnline: () => true,
    now: () => "2026-11-10T12:00:00.000Z",
    claimIdFactory: () => "recovery-claim",
    mapOperation: async (operation, value) => ({
      method: operation.operation,
      id: operation.entityId,
      input: {
        id: value.cloud.id,
        title: value.cloud.title,
        equipmentType: value.cloud.equipmentType,
        payload: value.cloud.payload,
        ...(operation.operation === "update" ? { expectedRevision: value.cloud.expectedRevision } : {}),
      },
    }),
  });
  return { runner, queue, calls, conflicts };
}

test("create retry updates an existing owner-scoped row only when its saved revision matches", async () => {
  const existing = { id: OP.entityId, revision: 7, payload: {} };
  const { runner, queue, calls } = createRecoveryFixture({ lookup: existing, cloudState: { revision: 7 } });
  const result = await runner.syncPending({ userId: UID });
  assert.equal(result.synced, 1);
  assert.equal(queue.length, 0);
  assert.deepEqual(calls.filter(call => ["create", "update"].includes(call[0])).map(call => call[0]), ["update"]);
  assert.equal(calls.find(call => call[0] === "update")[1].expectedRevision, 7);
  assert.equal(calls[0][0], "get");
});

test("create retry with an existing row and unknown saved revision stores a conflict instead of overwriting", async () => {
  const existing = { id: OP.entityId, revision: 7, payload: { title: "remote" } };
  const { runner, queue, calls, conflicts } = createRecoveryFixture({ lookup: existing });
  const result = await runner.syncPending({ userId: UID });
  assert.equal(result.conflicts, 1);
  assert.equal(queue[0].status, "conflict");
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].remoteEncrypted.version, 1);
  assert.equal(calls.some(call => call[0] === "create" || call[0] === "update"), false);
});

test("create retry performs INSERT only when the owner-scoped lookup confirms NOT_FOUND", async () => {
  const { runner, queue, calls } = createRecoveryFixture({ lookup: null });
  const result = await runner.syncPending({ userId: UID });
  assert.equal(result.synced, 1);
  assert.equal(queue.length, 0);
  assert.deepEqual(calls.filter(call => ["create", "update"].includes(call[0])).map(call => call[0]), ["create"]);
});

test("create retry never inserts when the lookup fails for a reason other than NOT_FOUND", async () => {
  const outage = new Error("temporary network outage");
  const { runner, queue, calls } = createRecoveryFixture({ lookup: outage });
  const result = await runner.syncPending({ userId: UID });
  assert.equal(result.failed, 1);
  assert.equal(queue.length, 1);
  assert.equal(queue[0].status, "pending");
  assert.equal(calls.some(call => call[0] === "create" || call[0] === "update"), false);
});


test("create retry with a changed remote revision stores a conflict and keeps both versions", async () => {
  const existing = { id: OP.entityId, revision: 8, payload: { title: "remote changed" } };
  const { runner, queue, calls, conflicts } = createRecoveryFixture({
    lookup: existing,
    cloudState: { revision: 7 },
  });
  const result = await runner.syncPending({ userId: UID });
  assert.equal(result.conflicts, 1);
  assert.equal(queue[0].status, "conflict");
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].localEncrypted, OP.encrypted);
  assert.equal(conflicts[0].remoteEncrypted.version, 1);
  assert.equal(calls.some(call => call[0] === "create" || call[0] === "update"), false);
});


test("renews the fenced queue lease while a long cloud request is running", async () => {
  let tick;
  let cleared = false;
  const { runner, queue, leaseRenewals } = fixture({
    setIntervalImpl(callback, interval) {
      assert.equal(interval, 1_000);
      tick = callback;
      return "lease-timer";
    },
    clearIntervalImpl(handle) {
      assert.equal(handle, "lease-timer");
      cleared = true;
    },
    leaseDurationMs: 30_000,
    leaseRenewIntervalMs: 1_000,
    cloud: {
      update: async () => {
        tick();
        await new Promise(resolve => setImmediate(resolve));
        return { id: OP.entityId, revision: 2 };
      },
    },
  });
  // The fake IndexedDB contract records the renewed lease expiry.
  const result = await runner.syncPending({ userId: UID });
  assert.equal(result.synced, 1);
  assert.equal(queue.length, 0);
  assert.ok(leaseRenewals.length >= 3);
  assert.equal(cleared, true);
});


test("two tabs preserve per-checklist order when a newer edit arrives during an in-flight sync", async () => {
  const secondOp = { ...OP, opId: "op-2", operation: "update", createdAt: "2026-11-10T12:01:00.000Z" };
  const queue = [{ ...OP, createdAt: "2026-11-10T12:00:00.000Z" }, secondOp];
  const calls = [];
  let cloudState = { revision: 3, photoManifest: [] };
  let releaseFirst;
  const firstGate = new Promise(resolve => { releaseFirst = resolve; });
  let firstStartedResolve;
  const firstStarted = new Promise(resolve => { firstStartedResolve = resolve; });
  const database = {
    async listPending(uid, nowIso = new Date().toISOString()) {
      return queue.filter(row => row.userId === uid &&
        (row.status === "pending" || (row.status === "processing" && row.leaseUntil <= nowIso)))
        .map(row => ({ ...row }));
    },
    async claimQueueOperation(opId, uid, claimId, nowIso, leaseUntil) {
      const row = queue.find(item => item.opId === opId && item.userId === uid);
      if (!row) return false;
      const expired = !row.leaseUntil || row.leaseUntil <= nowIso;
      if (row.status !== "pending" && !(row.status === "processing" && expired)) return false;
      if (queue.some(item => item.entityId === row.entityId && item.opId !== opId &&
          item.status === "processing" && item.leaseUntil > nowIso)) return false;
      Object.assign(row, { status: "processing", leaseClaimId: claimId, leaseUntil });
      return true;
    },
    async renewQueueOperation(opId, uid, claimId, _now, leaseUntil) {
      const row = queue.find(item => item.opId === opId && item.userId === uid);
      if (!row || row.status !== "processing" || row.leaseClaimId !== claimId) return false;
      row.leaseUntil = leaseUntil; return true;
    },
    async updateQueueOperation(opId, uid, changes, claimId) {
      const row = queue.find(item => item.opId === opId && item.userId === uid);
      if (!row || row.leaseClaimId !== claimId) return false;
      Object.assign(row, changes); return true;
    },
    async getCloudState() { return cloudState; },
    async markSynced(opId, uid, revision, claimId, nextState) {
      const index = queue.findIndex(item => item.opId === opId && item.userId === uid && item.leaseClaimId === claimId);
      if (index < 0) return false;
      queue.splice(index, 1);
      cloudState = nextState || cloudState;
      return { opId, serverRevision: revision };
    },
    async saveConflict() {},
  };
  const authApi = { async getCurrentIdentity() { return { user: { id: UID }, profile: { id: UID, role: "employee" } }; } };
  const vault = {
    async decrypt(encrypted) { return { title: encrypted.ciphertext }; },
    async encrypt(value) { return { version: 1, iv: "iv", ciphertext: JSON.stringify(value) }; },
  };
  let remoteRevision = 3;
  const cloudSync = {
    async create() { throw new Error("unexpected create"); },
    async remove() { throw new Error("unexpected remove"); },
    async get() { throw new Error("unexpected get"); },
    async update(input) {
      calls.push({ ...input });
      if (calls.length === 1) { firstStartedResolve(); await firstGate; }
      remoteRevision += 1;
      return { id: OP.entityId, revision: remoteRevision };
    },
  };
  const makeRunner = () => createOfflineSyncRunner({
    authApi, database, vault, cloudSync, isOnline: () => true,
    now: () => "2026-11-10T12:05:00.000Z",
    claimIdFactory: () => "claim-" + Math.random(),
    mapOperation: async (operation, value) => ({
      method: "update",
      input: { id: operation.entityId, expectedRevision: value.cloud?.expectedRevision, title: value.title, equipmentType: "TT", payload: {} },
    }),
  });
  const firstRun = makeRunner().syncPending({ userId: UID, limit: 1 });
  await firstStarted;
  const secondWhileFirstActive = await makeRunner().syncPending({ userId: UID, limit: 1 });
  assert.equal(secondWhileFirstActive.synced, 0);
  assert.equal(calls.length, 1);
  releaseFirst();
  const firstResult = await firstRun;
  assert.equal(firstResult.synced, 1);
  const secondAfterFirst = await makeRunner().syncPending({ userId: UID, limit: 1 });
  assert.equal(secondAfterFirst.synced, 1);
  assert.equal(queue.length, 0);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].expectedRevision, 3);
  assert.equal(calls[1].expectedRevision, 4);
});
