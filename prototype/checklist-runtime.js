import "./supabase-auth.js";
import "./checklist-risk-core.js";
import { createChecklistCloudBackup } from "./supabase-cloud-backup.js";
import { createChecklistPhotoSync } from "./supabase-cloud-photos.js";

const NB514_OLD_JS = "instances(){const out=[];for(const section of sections){for(const blk of['M1','M2','M3','M4'])out.push({section,block:blk});}return out;}}";
const NB514_NEW_JS = "instances(){const out=[];sections.forEach(section=>{const secNum=parseInt(String(section).replace(/[^\\d]/g,''),10)||1;for(let m=1;m<=4;m++){out.push({section,block:'M'+((secNum-1)*4+m)});}});return out;}}";

function __tmhAttachCloudBackup(source, mode){
if(typeof source!=='string'||!source||source.indexOf('id="tmhCloudBackupBtn"')!==-1)return source;
var footbar='<div class="footbar">';
if(source.indexOf(footbar)===-1)return source;
source=source.replace(footbar,footbar+'\n<button class="btn" id="tmhCloudBackupBtn" type="button">☁️ Сохранить в облако</button>\n<button class="btn" id="tmhCloudRestoreBtn" type="button">☁️ Восстановить из облака</button>');
var bridge=`<script>
(function(){
  try {
    window.__TMH_GET_CLOUD_BACKUP_CONTEXT=function(){
      return {
        state:STATE,stats:(typeof computeStats==='function'?computeStats():null),persistState:function(){return saveState(true);},definitions:(typeof EQUIPMENT!=='undefined'?EQUIPMENT:[]).map(function(eq){return {id:eq.id,fields:typeof eq.getFields==='function'?eq.getFields({}):(eq.fields||[]),instances:typeof eq.instances==='function'?eq.instances().filter(function(inst){return (STATE.selectedSections||[]).indexOf(inst.section)>=0;}).map(function(inst){return {id:[eq.id,inst.section].join('|'),fields:typeof eq.getFields==='function'?eq.getFields(inst):(eq.fields||[])};}):[]};}),checklistType:(typeof CUSTOM_CHECKLIST!=='undefined'&&CUSTOM_CHECKLIST?CUSTOM_CHECKLIST.title:({complex:'Комплексный чек-лист',housings:'КМБ',tt:'ТТ',bi:'БИ',hydro:'Гидродемпферы'}[${JSON.stringify(mode||((typeof MODE==='undefined')?'unknown':MODE))}]||${JSON.stringify(mode||((typeof MODE==='undefined')?'unknown':MODE))})),mode:${JSON.stringify(mode||((typeof MODE==='undefined')?'unknown':MODE))},storageKey:LS_KEY,
        applyState:async function(incoming,metadata){
          if(!metadata||typeof metadata.id!=='string'||!Number.isSafeInteger(metadata.revision)||metadata.revision<1)throw new Error('Некорректная версия облачной записи');
          await __psEnsureCloudReady();
          var current=STATE||{},previousState=structuredClone(current),previousLocal=localStorage.getItem(LS_KEY);
          var previousCloudRefKey=previousState.__cloudChecklistId?LS_KEY+'::cloud-ref::'+previousState.__cloudChecklistId:null;
          var attemptedCloudRefKey=null;
          var previousCloudRef=previousCloudRefKey?localStorage.getItem(previousCloudRefKey):null;
          var next=structuredClone(incoming);
          var oldValues=current.values||{},newValues=next.values||(next.values={});
          Object.keys(oldValues).forEach(function(iid){
            var oldItem=oldValues[iid]||{},newItem=newValues[iid]||(newValues[iid]={});
            Object.keys(oldItem).forEach(function(key){if(/_photo$/i.test(key)&&oldItem[key]&&!newItem[key])newItem[key]=oldItem[key];});
          });
          try{
            next.__cloudChecklistId=crypto.randomUUID();
            attemptedCloudRefKey=LS_KEY+'::cloud-ref::'+next.__cloudChecklistId;
            STATE=next;
            var saved=saveState(true);
            if(saved===false)throw new Error('Не удалось сохранить восстановленное состояние локально');
            if(typeof __PS!=='undefined'&&__PS.chain){
              var photoSaveResult=await __PS.chain;
              if(photoSaveResult===false)throw new Error('Не удалось сохранить восстановленные фотографии в IndexedDB');
            }
            await __psEnsureCloudReady();
            if(typeof __tmhOfflineSaveChain!=='undefined'&&__tmhOfflineSaveChain)await __tmhOfflineSaveChain;
            if(typeof __tmhOfflineSaveError!=='undefined'&&__tmhOfflineSaveError)throw new Error('Не удалось сохранить восстановленное состояние в зашифрованном офлайн-хранилище');
            localStorage.setItem(LS_KEY+'::cloud-ref::'+STATE.__cloudChecklistId,JSON.stringify({id:metadata.id,revision:metadata.revision}));
            if(typeof buildEquipment==='function')buildEquipment(STATE.general&&STATE.general.type||'');
            if(typeof renderGeneral==='function')renderGeneral();if(typeof renderPicker==='function')renderPicker();if(typeof renderEquip==='function')renderEquip();if(typeof updateStats==='function')updateStats();
            return true;
          }catch(restoreError){
            STATE=previousState;
            try{
              if(previousLocal===null)localStorage.removeItem(LS_KEY);else localStorage.setItem(LS_KEY,previousLocal);
              if(attemptedCloudRefKey&&attemptedCloudRefKey!==previousCloudRefKey)localStorage.removeItem(attemptedCloudRefKey);
              if(previousCloudRefKey)localStorage.removeItem(previousCloudRefKey);
              if(previousCloudRefKey&&previousCloudRef!==null)localStorage.setItem(previousCloudRefKey,previousCloudRef);
              var rollbackSaved=saveState(true);
              if(rollbackSaved===false)throw new Error('Не удалось восстановить локальное состояние');
              if(typeof __PS!=='undefined'&&__PS.chain&&await __PS.chain===false)throw new Error('Не удалось восстановить фотографии IndexedDB');
              if(typeof __tmhOfflineSaveChain!=='undefined'&&__tmhOfflineSaveChain){
                await __tmhOfflineSaveChain;
                if(__tmhOfflineSaveError)throw __tmhOfflineSaveError;
              }
              if(typeof buildEquipment==='function')buildEquipment(STATE.general&&STATE.general.type||'');
              if(typeof renderGeneral==='function')renderGeneral();if(typeof renderPicker==='function')renderPicker();if(typeof renderEquip==='function')renderEquip();if(typeof updateStats==='function')updateStats();
            }catch(rollbackError){
              throw new Error('Восстановление не завершено, автоматический откат тоже не удался: '+String(rollbackError&&rollbackError.message||rollbackError),{cause:restoreError});
            }
            throw restoreError;
          }
        }
      };
    };
  } catch(e) { window.__TMH_CLOUD_BACKUP_CONTEXT_ERROR=String(e&&e.message||e); }
})();
<\/script>
<script type="module">
import { createChecklistCloudBackup } from './prototype/supabase-cloud-backup.js';
import { createChecklistCloudRestore } from './prototype/supabase-cloud-restore.js';
import { createChecklistPhotoSync } from './prototype/supabase-cloud-photos.js';
const restoreButton=document.getElementById('tmhCloudRestoreBtn');
const __autoOpenChecklistId=(function(){try{return new URLSearchParams(window.location.search).get('openChecklist');}catch(e){return null;}})();
if(restoreButton){
  restoreButton.addEventListener('click',async function(){
    if(restoreButton.disabled)return;
    const requestedChecklistId=__autoOpenChecklistId;
    if(!requestedChecklistId&&!window.confirm('Открыть список облачных копий для режима '+${JSON.stringify(mode)}+'?'))return;
    restoreButton.disabled=true;const oldText=restoreButton.textContent;restoreButton.textContent='⏳ Загружаю список…';
    try{
      const getContext=window.__TMH_GET_CLOUD_BACKUP_CONTEXT;
      if(typeof getContext!=='function')throw new Error('Не удалось получить состояние встроенного чек-листа');
      const parentWindow=window;
      const api=parentWindow&&(parentWindow.TMHAuthReady?await parentWindow.TMHAuthReady:parentWindow.TMHAuth);
      if(!api)throw new Error('Авторизация Supabase недоступна');
      // The srcdoc module runs before DOMContentLoaded. Scope local storage to the
      // signed-in user before the safety snapshot or cloud restore can run.
      if(typeof checkAuth!=='function'||!(await checkAuth()))throw new Error('Сначала войдите в аккаунт Supabase');
      await __psEnsureCloudReady();
      const context=getContext();
      const photoSync=createChecklistPhotoSync({authApi:api});
      const backup=createChecklistCloudBackup({authApi:api,storage:window.localStorage,photoSync,getState:function(){return context.state;},getMode:function(){return context.mode;},getStorageKey:function(){return context.storageKey;},persistState:function(){return context.persistState();},getChecklistDefinitions:function(){return context.definitions;},getChecklistType:function(){return context.checklistType;}});
      const restore=createChecklistCloudRestore({authApi:api,getMode:function(){return context.mode;},getCurrentState:function(){return context.state;},beforeApply:async function(){await backup.createSnapshot({label:'Автокопия перед восстановлением'});},hydrateState:async function(state,metadata,manifest){return (await photoSync.restoreState({state,checklistId:metadata.id,manifest})).state;},applyState:context.applyState});
      const __openId=(function(){try{return new URLSearchParams(window.location.search).get('openChecklist');}catch(e){return null;}})();
      if(__openId){
        await restore.restore(__openId);
        try{window.history.replaceState(null,'',window.location.pathname+window.location.hash);}catch(e){}
        if(typeof showToast==='function')showToast('Чек-лист открыт из личного кабинета');
        return;
      }
      const items=await restore.listAvailable(),matching=items.filter(function(item){return item.mode===context.mode;});
      if(!matching.length){if(typeof showToast==='function')showToast('Для этого режима облачных копий пока нет');return;}
      const lines=matching.map(function(item,index){return (index+1)+'. '+(item.title||'Без названия')+' · версия '+item.revision+' · '+(item.updatedAt||'дата неизвестна');});
      const choice=window.prompt('Режим: '+context.mode+'\\nВыберите облачную копию по номеру:\\n\\n'+lines.join('\\n')+'\\n\\nВведите номер:');
      if(choice===null)return;const selectedIndex=Number(choice)-1;
      if(!Number.isInteger(selectedIndex)||selectedIndex<0||selectedIndex>=matching.length)throw new Error('Неверный номер облачной копии');
      const selected=matching[selectedIndex];
      if(!window.confirm('Восстановить «'+selected.title+'»? Текущая локальная версия сначала будет сохранена в облако. Локальные фотографии останутся на устройстве.'))return;
      restoreButton.textContent='⏳ Создаю копию и восстанавливаю…';await restore.restore(selected.id);
      if(typeof showToast==='function')showToast('Чек-лист восстановлен. Локальные фотографии сохранены.');else window.alert('Чек-лист восстановлен. Локальные фотографии сохранены.');
    }catch(error){console.error('Embedded cloud restore failed',error);const message=String(error&&error.message||'Не удалось восстановить чек-лист');if(typeof showToast==='function')showToast(message);else window.alert(message);}
    finally{restoreButton.disabled=false;restoreButton.textContent=oldText;}
  });
  // The parent page owns the native restore flow when available. Do not
  // auto-restore the same URL from the embedded srcdoc as well.
  const __parentOwnsCloudRestore=false;
  /* Auto-open is coordinated by the runtime after local state hydration. */
}
const button=document.getElementById('tmhCloudBackupBtn');
if(button){
  button.addEventListener('click',async function(){
    if(button.disabled)return;
    if(!window.confirm('Сохранить текущий чек-лист и фотографии в приватное облако?'))return;
    button.disabled=true;
    const oldText=button.textContent;
    button.textContent='⏳ Сохраняю…';
    try{
      const getContext=window.__TMH_GET_CLOUD_BACKUP_CONTEXT;
      if(typeof getContext!=='function')throw new Error('Не удалось получить данные открытого чек-листа');
      const api=window.TMHAuthReady?await window.TMHAuthReady:window.TMHAuth;
      if(!api)throw new Error('Авторизация Supabase недоступна');
      const result=await window.__TMH_SAVE_CLOUD_BACKUP_CONTEXT(getContext());
      const message=result.created?'Облачная копия создана':'Облачная копия обновлена';
      if(typeof showToast==='function')showToast(message+' · фотографий: '+result.photosUploaded);
      else window.alert(message+'\\nЗагружено фотографий: '+result.photosUploaded);
    }catch(error){
      console.error('Cloud backup failed',error);
      const message=error&&error.code==='REVISION_CONFLICT'
        ?'Облачная запись изменена в другом месте. Обновите данные и повторите.'
        :String(error&&error.message||'Не удалось сохранить копию в облаке');
      if(typeof showToast==='function')showToast(message);
      else window.alert(message);
    }finally{
      button.disabled=false;
      button.textContent=oldText;
    }
  });
}
<\/script>`;
var bodyCloseIndex=source.lastIndexOf('</body>');
if(bodyCloseIndex===-1)return source;
return source.slice(0,bodyCloseIndex)+bridge+'</body>'+source.slice(bodyCloseIndex+'</body>'.length);
}
window.__tmhAttachCloudBackup = __tmhAttachCloudBackup;
window.__TMH_SAVE_CLOUD_BACKUP_CONTEXT = async function(context) {
  if (!context || !context.state || typeof context.mode !== "string" ||
      typeof context.storageKey !== "string" || typeof context.persistState !== "function") {
    throw new Error("Не удалось получить состояние чек-листа для облачного сохранения");
  }
  if (typeof __psEnsureCloudReady === "function") await __psEnsureCloudReady();
  const api = window.TMHAuthReady ? await window.TMHAuthReady : window.TMHAuth;
  if (!api) throw new Error("Авторизация Supabase недоступна");
  const photoSync = createChecklistPhotoSync({ authApi: api });
  const backup = createChecklistCloudBackup({
    authApi: api, storage: window.localStorage, photoSync,
    getState: () => context.state, getMode: () => context.mode,
    getStorageKey: () => context.storageKey,
    persistState: () => context.persistState(),
    getChecklistDefinitions: () => context.definitions || [],
    getChecklistStats: () => context.stats || null,
    getChecklistType: () => context.checklistType || ""
  });
  return backup.saveCurrent();
};


const MODE_LABELS = { complex:"Комплексный", housings:"КМБ", tt:"Тяговый трансформатор", bi:"БИ (МСУД-015)", hydro:"Гидродемпферы" };
function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function(ch) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
  });
}
function availableModes() {
  const custom = Array.isArray(window.__CUSTOM_MODES__) ? window.__CUSTOM_MODES__ : [];
  return Object.keys(MODE_LABELS).map(function(id) { return { id:id, title:MODE_LABELS[id] }; })
    .concat(custom.map(function(item) { return { id:item.id, title:item.title || item.id }; }));
}
function injectUnifiedChrome(source, mode) {
  const options = availableModes().map(function(item) {
    return '<option value="' + escapeHtml(item.id) + '"' + (item.id === mode ? " selected" : "") + '>' + escapeHtml(item.title) + '</option>';
  }).join("");
  const chrome = '<div id="tmhUnifiedModeSwitch" aria-label="Управление приложением">' +
    '<label for="tmhUnifiedModeSelect">Чек-лист</label>' +
    '<select id="tmhUnifiedModeSelect">' + options + '</select>' +
    '<a class="btn" href="./account.html">👤 Личный кабинет</a></div>';
  const style = '<style id="tmhUnifiedRuntimeStyles">' +
    '#tmhUnifiedModeSwitch{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto;padding:6px 0}' +
    '#tmhUnifiedModeSwitch label{font-size:12px;font-weight:600;color:inherit}' +
    '#tmhUnifiedModeSelect{font:inherit;max-width:min(42vw,260px);min-width:150px;padding:8px 10px;border:1px solid var(--line,#cfe0f0);border-radius:8px;background:var(--panel,#fff);color:var(--ink,#16324f)}' +
    '#tmhUnifiedModeSwitch .btn{white-space:nowrap;text-decoration:none}' +
    '#modePickerBtn{display:none!important}' +
    '@media(max-width:720px){#tmhUnifiedModeSwitch{width:100%;margin:0;justify-content:flex-end}#tmhUnifiedModeSelect{max-width:58vw;min-width:130px}}' +
    '</style>';
  source = source.replace("</head>", '<base href="/">' + style + "</head>");
  const topbarPattern = /<\/div>\s*(<div class="stat-bar")/i;
  if (topbarPattern.test(source)) source = source.replace(topbarPattern, chrome + "</div>\n$1");
  else source = source.replace(/<body[^>]*>/i, function(tag) { return tag + chrome; });
  const routeScript = '<script>(function(){' +
    'var select=document.getElementById("tmhUnifiedModeSelect");' +
    'if(select){select.value=' + JSON.stringify(mode) + ';select.addEventListener("change",async function(){' +
      'var next=select.value;if(!next||next===' + JSON.stringify(mode) + ')return;' +
      'if(!window.confirm("Сменить чек-лист? Текущие данные будут сохранены перед переходом.")){select.value=' + JSON.stringify(mode) + ';return;}' +
      'try{if(typeof saveState==="function"){var saved=saveState(true);if(saved===false)throw new Error("Не удалось сохранить текущий чек-лист");}' +
      'if(typeof __PS!=="undefined"&&__PS.chain)await __PS.chain;' +
      'if(typeof __tmhOfflineSaveChain!=="undefined"&&__tmhOfflineSaveChain)await __tmhOfflineSaveChain;' +
      'if(typeof __tmhOfflineSaveError!=="undefined"&&__tmhOfflineSaveError)throw new Error("Не удалось завершить локальное сохранение");' +
      'localStorage.setItem("checklist_mode_v2",next);var url=new URL(location.href);url.searchParams.set("mode",next);url.searchParams.delete("openChecklist");url.searchParams.delete("openLocalChecklist");location.assign(url.href);' +
      '}catch(error){window.alert(error&&error.message||"Не удалось переключить чек-лист");select.value=' + JSON.stringify(mode) + ';}' +
    '});}' +
    'var original=window.showContinueDialogOrStart;' +
    'if(typeof original==="function"&&!window.__TMH_ROUTE_START_WRAPPED){window.__TMH_ROUTE_START_WRAPPED=true;window.showContinueDialogOrStart=async function(){' +
      'var params=new URLSearchParams(location.search);var localId=params.get("openLocalChecklist");' +
      'if(localId&&!window.__TMH_ROUTE_LOCAL_ACTIVATED){var api=window.TMHAuthReady?await window.TMHAuthReady:window.TMHAuth;if(!api||typeof api.activateOfflineChecklistInstance!=="function")throw new Error("Офлайн-запись недоступна");await api.activateOfflineChecklistInstance(LS_KEY,localId);window.__TMH_ROUTE_LOCAL_ACTIVATED=true;}' +
      'if(params.get("openChecklist")&&!window.__TMH_ROUTE_CLOUD_RESTORE_TRIGGERED){window.__TMH_ROUTE_CLOUD_RESTORE_TRIGGERED=true;try{if(typeof startApp!=="function")throw new Error("Не удалось загрузить состояние чек-листа");await startApp(false);if(typeof __PS!=="undefined"&&__PS.chain)await __PS.chain;if(typeof __tmhOfflineSaveChain!=="undefined"&&__tmhOfflineSaveChain)await __tmhOfflineSaveChain;if(typeof __tmhOfflineSaveError!=="undefined"&&__tmhOfflineSaveError)throw new Error("Не удалось завершить локальное сохранение перед восстановлением");var context=typeof window.__TMH_GET_CLOUD_BACKUP_CONTEXT==="function"?window.__TMH_GET_CLOUD_BACKUP_CONTEXT():null;if(!context||!context.state||!context.state.general||!context.state.values)throw new Error("Локальное состояние не загружено полностью; облачное восстановление отменено");var button=document.getElementById("tmhCloudRestoreBtn");if(!button)throw new Error("Кнопка восстановления облачной копии недоступна");button.click();}catch(error){console.error("Cloud restore preparation failed",error);if(typeof showToast==="function")showToast(error&&error.message||"Не удалось подготовить локальную копию");}return true;}' +
      'return await original.apply(this,arguments);};}' +
  '})();</script>';
  source = source.replace(/<\/body>/i, routeScript + "</body>");
  return source;
}

async function main() {
  const risk = window.__RISK_CORE__;
  if (!risk || typeof risk.ready !== "function") throw new Error("Не удалось загрузить справочник режимов");
  await risk.ready(2500);
  const params = new URLSearchParams(window.location.search);
  let storedMode = null;
  try { storedMode = localStorage.getItem("checklist_mode_v2"); } catch (_) {}
  let mode = params.get("mode") || storedMode || "complex";
  const known = availableModes().map(function(item){ return item.id; });
  if (known.indexOf(mode) < 0) mode = "complex";
  let source;
  if (mode === "tt") source = (await import("./embedded/tt.js")).default;
  else if (mode === "bi") source = (await import("./embedded/bi.js")).default;
  else if (mode === "hydro") source = (await import("./embedded/hydro.js")).default;
  else source = (await import("./embedded/complex.js")).default;
  if (mode === "complex" || mode === "housings" || /^k_/.test(String(mode))) {
    window.__EMBEDDED_MODE__ = mode;
    source = source.replace(/if\(window\.parent&&window\.parent!==window&&window\.parent\.__EMBEDDED_MODE__\)\{\s*m=window\.parent\.__EMBEDDED_MODE__;\s*\}/,
      "if(window.__EMBEDDED_MODE__){m=window.__EMBEDDED_MODE__;}");
    source = source.split(NB514_OLD_JS).join(NB514_NEW_JS);
  }
  source = risk.applyRegistry(source, mode) || source;
  source = __tmhAttachCloudBackup(source, mode);
  source = injectUnifiedChrome(source, mode);
  document.open();
  document.write(source);
  document.close();
}
main().catch(function(error) {
  console.error("Unified checklist runtime failed", error);
  document.body.innerHTML = '<main style="max-width:720px;margin:10vh auto;padding:24px;font:16px/1.5 system-ui"><h1>Не удалось открыть чек-лист</h1><p></p><a href="./prototype/checklist/">Вернуться к приложению</a></main>';
  const paragraph = document.querySelector("main p");
  if (paragraph) paragraph.textContent = String(error && error.message || error);
});
