import "./supabase-auth.js";
import "./checklist-risk-core.js";
import { STANDALONE_PATCHES } from "./standalone-patches.js";
import { createChecklistCloudBackup } from "./supabase-cloud-backup.js";
import { createChecklistPhotoSync } from "./supabase-cloud-photos.js";

function __tmhFindDocumentHeadClose(source) {
  if (typeof source !== "string") return -1;
  const bodyStart = source.indexOf("<body");
  if (bodyStart < 0) return source.indexOf("</head>");
  return source.lastIndexOf("</head>", bodyStart);
}

function __tmhFindDocumentBodyClose(source) {
  if (typeof source !== "string") return -1;
  const lastScriptClose = source.lastIndexOf("</script>");
  return source.indexOf("</body>", lastScriptClose >= 0 ? lastScriptClose + "</script>".length : 0);
}

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
var bodyCloseIndex=__tmhFindDocumentBodyClose(source);
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


function __tmhAttachFooterLayout(source){
  if(typeof source!=='string'||!source||source.indexOf('id="tmhFooterLayoutStyles"')!==-1)return source;
  const style='<style id="tmhFooterLayoutStyles">'+
    '.footbar{display:flex;flex-direction:column;align-items:stretch;gap:8px;padding:10px clamp(10px,2vw,20px);padding-bottom:max(10px,env(safe-area-inset-bottom));}'+
    '.tmh-footer-main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;width:100%;max-width:1040px;margin:0 auto;}'+
    '.tmh-footer-main>.btn,.tmh-footer-more>summary{display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;min-width:0;min-height:46px;margin:0;padding:9px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);color:var(--ink);font:600 13px/1.25 var(--sans,system-ui);text-align:center;white-space:normal;overflow-wrap:anywhere;cursor:pointer;}'+
    '.tmh-footer-main>#tmhCloudBackupBtn{background:var(--amber);border-color:var(--amber);color:#fff;}'+
    '.tmh-footer-main>#actPrintBtnV5{background:var(--ok);border-color:var(--ok);color:#fff;}'+
    '.tmh-footer-more{position:relative;min-width:0;width:100%;max-width:1040px;margin:0 auto;}'+
    '.tmh-footer-more>summary{list-style:none;user-select:none;justify-content:center;gap:10px;text-align:center;font-size:13px;font-weight:700;letter-spacing:0;background:var(--panel2);border:1px solid var(--line);box-shadow:0 1px 3px #102a4310;}'+
    '.tmh-footer-more>summary::after{content:"";display:inline-flex;align-items:center;justify-content:center;flex:0 0 9px;width:9px;height:9px;margin-left:2px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:translateY(-2px) rotate(45deg);transition:transform .18s ease;}'+
    '.tmh-footer-more>summary::-webkit-details-marker{display:none;}'+
    '.tmh-footer-more[open]>summary::after{transform:translateY(2px) rotate(225deg);}'+
    '.tmh-footer-more[open]>summary{border-color:var(--amber);color:var(--amber);}'+
    '.tmh-footer-more-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;width:100%;padding:10px;margin-top:7px;border:1px solid var(--line);border-radius:10px;background:var(--panel);box-shadow:0 5px 18px #0a2a4d18;}'+
    '.tmh-footer-more-grid>.btn{width:100%;min-width:0;min-height:42px;white-space:normal;overflow-wrap:anywhere;}'+
    '.tmh-footer-more-grid>#jsonFileInput{display:none!important;}'+
    '.tmh-footer-unfilled{display:contents;}'+
    '.tmh-footer-main>#btnFindUnfilled{display:flex;align-items:center;justify-content:center;width:100%;min-width:0;min-height:46px;margin:0;padding:7px 3px;border-radius:8px;font-size:12px;font-weight:700;white-space:normal;overflow-wrap:anywhere;}'+
    '@media(max-width:640px){.footbar{gap:7px;padding:8px 10px;padding-bottom:max(8px,env(safe-area-inset-bottom));}.tmh-footer-main{gap:5px;grid-template-columns:repeat(4,minmax(0,1fr));}.tmh-footer-main>.btn,.tmh-footer-more>summary{min-height:50px;padding:6px 3px;font-size:10.5px;line-height:1.15;border-radius:8px;}.tmh-footer-more-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:8px;}.tmh-footer-more-grid>.btn{min-height:44px;padding:8px 7px;font-size:12px;}.tmh-footer-main>#btnFindUnfilled{min-height:50px;font-size:10.5px;padding:5px 2px;}}'+
    '@media(max-width:380px){.tmh-footer-main{gap:5px;}.tmh-footer-main>.btn,.tmh-footer-more>summary,.tmh-footer-main>#btnFindUnfilled{font-size:9.5px;padding:5px 2px;}.tmh-footer-more-grid{grid-template-columns:1fr 1fr;}}'+
    '@media(min-width:641px){.tmh-footer-main>.btn,.tmh-footer-more>summary{min-height:44px;font-size:12.5px;}}'+
    '</style>';
  const headCloseIndex=__tmhFindDocumentHeadClose(source);
  if(headCloseIndex!==-1)source=source.slice(0,headCloseIndex)+style+"</head>"+source.slice(headCloseIndex+"</head>".length);
  const script='<script id="tmhFooterLayoutScript">(function(){'+
    'var footer=document.querySelector(".footbar");if(!footer)return;'+
    'var main=document.createElement("div");main.className="tmh-footer-main";main.setAttribute("aria-label","Основные действия");'+
    'var unfilled=document.createElement("div");unfilled.className="tmh-footer-unfilled";'+
    'var details=document.createElement("details");details.className="tmh-footer-more";'+
    'var summary=document.createElement("summary");summary.textContent="Ещё действия";summary.setAttribute("aria-label","Ещё действия — дополнительные операции");'+
    'var more=document.createElement("div");more.className="tmh-footer-more-grid";'+
    'details.appendChild(summary);details.appendChild(more);footer.appendChild(main);footer.appendChild(details);'+
    'function move(id,target){var el=document.getElementById(id);if(el&&el.parentNode!==target)target.appendChild(el);return el;}'+
    'function mount(){'+
      'var backup=move("tmhCloudBackupBtn",main),act=move("actPrintBtnV5",main),excel=move("btnExport",main)||move("btnExportWithPhotos",main),find=move("btnFindUnfilled",main);'+
      'if(backup){backup.classList.add("primary");backup.textContent="☁ Облако";backup.setAttribute("aria-label","Сохранить в облако");backup.title="Сохранить в облако";}'+
      'if(act){act.textContent="✍ Акт";act.setAttribute("aria-label","Акт на подпись");act.title="Акт на подпись";}'+
      'if(excel){excel.textContent="▦ Excel";excel.setAttribute("aria-label","Экспорт в Excel");excel.title="Экспорт в Excel";}'+
      'if(find){find.textContent="⌕ Найти";find.setAttribute("aria-label","Найти незаполненное");find.title="Найти незаполненное";}'+
      '["btnSave","btnSaveHtml","btnExportJson","btnImportJson","jsonFileInput","btnPrint","btnReset","tmhCloudRestoreBtn"].forEach(function(id){move(id,more);});'+
      'Array.prototype.slice.call(footer.children).forEach(function(el){if(el!==main&&el!==details&&(el.tagName==="BUTTON"||el.tagName==="INPUT"))more.appendChild(el);});'+
      'if(backup&&act&&excel&&find){[backup,act,excel,find].forEach(function(el,index){var current=main.children[index]||null;if(current!==el)main.insertBefore(el,current);});if(details.parentNode!==footer)footer.appendChild(details);if(main.nextElementSibling!==details)footer.insertBefore(details,main.nextSibling);}'+
      'return !!(backup&&act&&excel&&find);'+
    '}' +
    'if(!mount()){var observer=new MutationObserver(function(){if(mount())observer.disconnect();});observer.observe(footer,{childList:true,subtree:true});setTimeout(function(){observer.disconnect();},2000);}'+
  '})();<\/script>';
  const bodyCloseIndex=__tmhFindDocumentBodyClose(source);
  if(bodyCloseIndex!==-1)source=source.slice(0,bodyCloseIndex)+script+"</body>"+source.slice(bodyCloseIndex+"</body>".length);
  return source;
}

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

function __tmhAttachHeaderLayout(source){
  if(typeof source!=="string"||!source||source.indexOf('id="tmhHeaderLayoutStyles"')!==-1)return source;
  const css='<style id="tmhHeaderLayoutStyles">'+
    '.topbar{display:grid!important;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto auto auto;align-items:center;gap:7px 14px;padding:9px clamp(12px,2vw,20px)!important;} '+
    '#tmhUnifiedModeSwitch{display:flex!important;grid-column:1/-1;grid-row:1;align-items:center;justify-content:flex-start;gap:7px;flex-wrap:wrap;width:100%;max-width:none;margin:0;padding:0 0 7px;border:0;border-bottom:1px solid #ffffff35;border-radius:0;background:transparent;overflow:visible;} '+
    '#tmhUnifiedModeSwitch #modePickerBtn{order:0;}#tmhUnifiedModeSwitch #tmhRiskOpenBtn{order:1;}#tmhUnifiedModeSwitch>a{order:2;} '+
    '#tmhUnifiedModeSwitch .tmh-head-action{min-height:34px;padding:6px 11px;font-size:12px;border-radius:8px;} '+
    '.topbar .brand{display:grid!important;grid-template-columns:auto auto minmax(120px,1fr);grid-template-rows:auto;align-items:center;gap:8px 12px;grid-column:1;grid-row:2;min-width:0;} '+
    '.topbar .brand .logo-block{grid-column:1;grid-row:1;display:flex;align-items:center;gap:8px;min-width:0;} '+
    '.topbar .brand .logo-block .tmh-logo .tmh,.topbar .brand .logo-block .nevz-logo .nevz{font-size:20px;} '+
    '.topbar .brand .logo-block .tmh-sub,.topbar .brand .logo-block .nevz-sub{font-size:8px;line-height:1.1;} '+
    '.topbar .brand .logo-block .divider{height:32px;} '+
    '.topbar .brand .tag{grid-column:2;grid-row:1;align-self:center;margin:0;padding:5px 8px;font-size:11px;white-space:nowrap;} '+
    '.topbar .brand .title-block{grid-column:3;grid-row:1;min-width:0;} '+
    '.topbar .brand .title-block h1{margin:0;font-size:clamp(14px,1.35vw,17px);line-height:1.2;} '+
    '.topbar .brand .title-block small{display:block;margin-top:2px;font-size:10px;line-height:1.25;} '+
    '.topbar>.theme-switch,#themeSwitch{grid-column:2;grid-row:2;display:flex!important;align-items:center;justify-content:center;gap:2px;width:auto;min-width:0;max-width:100%;margin:0!important;padding:3px;border:1px solid #ffffff55;border-radius:9px;background:#ffffff18;} '+
    '.topbar>.theme-switch button,#themeSwitch button{min-height:30px;padding:5px 8px;border:0;border-radius:7px;background:transparent;color:#fff;font-size:10px;font-weight:700;white-space:nowrap;} '+
    '.topbar>.theme-switch button.active,#themeSwitch button.active{background:#fff;color:#0a5eb0;} '+
    '.topbar>#btnRouteView{grid-column:1/-1;grid-row:3;justify-self:start;display:inline-flex;align-items:center;justify-content:center;min-height:34px;margin:0!important;padding:6px 11px;border:1px solid #ffffff65;border-radius:8px;background:#ffffff18;color:#fff;font:600 12px/1.2 var(--sans,system-ui);white-space:nowrap;} '+
    '.topbar>.user-info{grid-column:1/-1;grid-row:4;display:flex!important;align-items:center;justify-content:flex-end;gap:6px 8px;min-width:0;margin:0;padding:6px 0 0;border:0;border-top:1px solid #ffffff35;flex-wrap:wrap;font-size:11px;} '+
    '.topbar>.user-info .tmh-account-link,.topbar>.user-info .logout-btn{display:inline-flex;align-items:center;justify-content:center;min-height:32px;margin:0;padding:5px 10px;border:1px solid #ffffff65;border-radius:7px;background:#ffffff18;color:#fff;text-decoration:none;font:600 11px/1.2 var(--sans,system-ui);white-space:nowrap;} '+
    '.topbar>.user-info .tmh-account-link{margin-left:auto;} '+
    '@media(max-width:900px){.topbar{grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto auto auto;gap:6px 9px;padding:8px 12px!important;}.topbar .brand{grid-column:1;grid-row:2;}.topbar>.theme-switch,#themeSwitch{grid-column:2;grid-row:2;}.topbar>#btnRouteView{grid-row:3;}.topbar>.user-info{grid-row:4;}} '+
    '@media(max-width:640px){.topbar{gap:6px 7px;padding:8px 10px!important;}.topbar .brand{grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto auto;gap:4px 8px;}.topbar .brand .logo-block{grid-column:1;grid-row:1;gap:6px;}.topbar .brand .logo-block .tmh-logo .tmh,.topbar .brand .logo-block .nevz-logo .nevz{font-size:17px;}.topbar .brand .logo-block .tmh-sub,.topbar .brand .logo-block .nevz-sub{display:none;}.topbar .brand .logo-block .divider{height:26px;}.topbar .brand .tag{grid-column:2;grid-row:1;padding:4px 6px;font-size:10px;white-space:normal;text-align:center;}.topbar .brand .title-block{grid-column:1/-1;grid-row:2;}.topbar .brand .title-block h1{font-size:13px;line-height:1.2;}.topbar .brand .title-block small{font-size:9px;line-height:1.2;}#tmhUnifiedModeSwitch{gap:5px;padding-bottom:6px;}#tmhUnifiedModeSwitch .tmh-head-action{min-height:34px;padding:6px 8px;font-size:11px;}#tmhUnifiedModeSwitch #modePickerBtn{flex:1 1 145px;}#tmhUnifiedModeSwitch #tmhRiskOpenBtn,#tmhUnifiedModeSwitch>a{flex:0 1 auto;}#themeSwitch{gap:0;padding:2px;}#themeSwitch button{min-height:29px;padding:4px 6px;font-size:9px;}.topbar>#btnRouteView{min-height:34px;font-size:11px;}.topbar>.user-info{justify-content:flex-start;gap:6px;}.topbar>.user-info .tmh-account-link{margin-left:auto;}} '+
    '@media(max-width:380px){#tmhUnifiedModeSwitch{gap:4px;}#tmhUnifiedModeSwitch .tmh-head-action{padding:5px 6px;font-size:10px;}#themeSwitch button{padding:4px 5px;font-size:8.5px;}.topbar .brand .logo-block .tmh-logo .tmh,.topbar .brand .logo-block .nevz-logo .nevz{font-size:15px;}} '+
    '</style>';
  const close=__tmhFindDocumentHeadClose(source);
  if(close>=0)source=source.slice(0,close)+css+"</head>"+source.slice(close+"</head>".length);
  return source;
}
function injectUnifiedChrome(source, mode) {
  const options = availableModes().map(function(item) {
    return '<option value="' + escapeHtml(item.id) + '"' + (item.id === mode ? " selected" : "") + '>' + escapeHtml(item.title) + '</option>';
  }).join("");
  const modeDescriptions = {
    complex:"Комплексная проверка оборудования локомотива",
    housings:"Проверка кожухов моторно-осевых подшипников",
    tt:"Проверка тягового трансформатора",
    bi:"Проверка ПО МСУД-015",
    hydro:"Проверка гидродемпферов"
  };
  const modeButtonIds = { complex:"modeComplexBtn", housings:"modeHousingsBtn", tt:"modeTtBtn", bi:"modeBiBtn", hydro:"modeHydroBtn" };
  const modeCards = availableModes().map(function(item) {
    const active = item.id === mode;
    const buttonId = modeButtonIds[item.id] || "";
    return '<button type="button" class="tmh-mode-card' + (active ? ' active' : '') +
      '" ' + (buttonId ? 'id="' + buttonId + '" ' : '') +
      'data-tmh-mode="' + escapeHtml(item.id) + '" aria-current="' + (active ? 'page' : 'false') + '">' +
      '<span class="tmh-mode-icon" aria-hidden="true">📋</span>' +
      '<span class="tmh-mode-copy"><b>' + escapeHtml(item.title) + '</b><small>' +
      escapeHtml(modeDescriptions[item.id] || "Дополнительный чек-лист") + '</small></span>' +
      '<span class="tmh-mode-current">' + (active ? '✓ ОТКРЫТ' : 'Открыть') + '</span></button>';
  }).join("");
  const chrome = '<div id="tmhUnifiedModeSwitch" aria-label="Управление приложением">' +
    '<button class="tmh-head-action primary" id="modePickerBtn" type="button"><span aria-hidden="true">⇄</span><span id="modePickerLabel">Сменить чек-лист</span></button>' +
    '<button class="tmh-head-action" id="tmhRiskOpenBtn" type="button">📍 Зона риска</button>' +
    '<a class="tmh-head-action" href="/instruction.html">📖 Инструкция</a></div>';
  const style = `<style id="tmhUnifiedRuntimeStyles">
#tmhUnifiedModeSwitch{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:6px;flex:1 1 auto;min-width:0;max-width:none;margin:0;padding:6px 10px;overflow-x:hidden;overflow-y:visible;white-space:normal;scrollbar-width:none;-webkit-overflow-scrolling:touch;background:linear-gradient(180deg,#0a5eb0,#0c4a8c 92%);border-bottom:2px solid #083058}#tmhUnifiedModeSwitch::-webkit-scrollbar{display:none}#tmhUnifiedModeSwitch #themeSwitch{display:flex!important;align-items:center;gap:1px;flex:0 1 auto;width:auto;min-width:0;max-width:100%;margin:0!important;padding:2px;border:1px solid #ffffff55;border-radius:9px;background:#ffffff18}#tmhUnifiedModeSwitch #themeSwitch button{min-height:30px;padding:5px 9px;border:0;border-radius:7px;background:transparent;color:#fff;font-size:11px;font-weight:700;white-space:nowrap}#tmhUnifiedModeSwitch #themeSwitch button.active{background:#fff;color:#0a5eb0}#tmhUnifiedModeSwitch #btnRouteView{display:inline-flex;align-items:center;justify-content:center;order:2;flex:0 0 auto;min-height:34px;margin:0!important;padding:6px 9px;border:1px solid #ffffff75;border-radius:8px;background:#ffffff18;color:#fff;font:600 12px/1.2 var(--sans,system-ui);white-space:nowrap;cursor:pointer}#tmhUnifiedModeSwitch #btnRouteView:hover{background:#ffffff30}
#tmhUnifiedModeSwitch .tmh-head-action{display:flex;align-items:center;justify-content:center;gap:5px;flex:0 0 auto;min-width:0;min-height:34px;padding:6px 9px;border:1px solid #ffffff75;border-radius:8px;background:#ffffff18;color:#fff;text-decoration:none;font:600 12px/1.2 var(--sans,system-ui);text-align:center;cursor:pointer;white-space:nowrap}
#tmhUnifiedModeSwitch .tmh-head-action:hover{background:#ffffff30}
#tmhUnifiedModeSwitch button{font-family:inherit}
#tmhUnifiedModeSwitch #modePickerBtn{display:flex!important}
#tmhUnifiedModeSwitch #modePickerBtn span:last-child{min-width:0}
#tmhUnifiedModeSwitch a:focus-visible,#tmhUnifiedModeSwitch button:focus-visible{outline:3px solid #fff;outline-offset:2px}
@media(max-width:900px){#tmhUnifiedModeSwitch{flex-basis:100%;max-width:none;margin:0}}
@media(max-width:640px){
.topbar{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto auto auto;gap:7px 8px;padding:10px 12px 11px;background:linear-gradient(180deg,#0a5eb0,#0c4a8c 92%);border-bottom:2px solid #083058}
.topbar .brand{display:contents}
.topbar .brand .logo-block{grid-column:1;grid-row:1;display:flex;align-items:center;gap:8px;min-width:0}
.topbar .brand .logo-block .tmh-logo .tmh,.topbar .brand .logo-block .nevz-logo .nevz{font-size:21px}
.topbar .brand .tmh-sub,.topbar .brand .nevz-sub{display:none}
.topbar .brand .logo-block .divider{height:34px}
.topbar .brand .tag{grid-column:2;grid-row:1;align-self:center;font-size:15px;padding:7px 12px;margin:0;border-radius:8px}
#tmhUnifiedModeSwitch{grid-column:1/-1;grid-row:2;display:flex;flex-wrap:nowrap;align-items:center;justify-content:flex-start;gap:5px;width:100%;max-width:none;margin:0;padding:5px 8px;overflow-x:auto;overscroll-behavior-x:contain}
#tmhUnifiedModeSwitch .tmh-head-action{min-height:34px;padding:6px 8px;font-size:11.5px;line-height:1.15}
#tmhUnifiedModeSwitch #themeSwitch{flex:0 0 auto;justify-content:flex-start;padding:2px}
#tmhUnifiedModeSwitch #themeSwitch button{min-height:30px;padding:5px 8px;font-size:10.5px}
#tmhUnifiedModeSwitch #btnRouteView{min-height:34px;padding:6px 8px;font-size:11px}
.topbar .brand .title-block{grid-column:1/-1;grid-row:3;min-width:0}
.topbar .brand .title-block h1{font-size:17px;line-height:1.25;white-space:normal;margin:0;color:#fff}
.topbar .brand .title-block small{display:block;font-size:12px;line-height:1.3;margin-top:4px;color:#cfe4f7}
.topbar .user-info{grid-column:1/-1;grid-row:4;display:flex!important;align-items:center;gap:7px;flex-wrap:wrap;padding:5px 0 0;border-left:0;border-top:1px solid #ffffff30;font-size:12px}
.topbar .user-info{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.topbar .user-info .tmh-account-link{display:inline-flex;align-items:center;justify-content:center;order:90;margin-left:4px}.topbar .user-info .logout-btn{order:91;min-height:34px;padding:5px 10px}
.topbar .user-info .tmh-account-link{min-height:34px;padding:5px 10px;border:1px solid #ffffff55;border-radius:8px;color:#fff;text-decoration:none}
}
@media(prefers-reduced-motion:reduce){.footbar,.tmh-account-link{transition:none!important}}
#modeSelectModal{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;box-sizing:border-box;padding:12px;background:rgba(5,20,38,.78);backdrop-filter:blur(4px)}
#modeSelectModal[aria-hidden="false"]{display:flex}
#modeSelectModal .tmh-mode-modal{box-sizing:border-box;display:flex;flex-direction:column;gap:0;width:min(600px,calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow:hidden;padding:22px 20px 16px;border:2px solid var(--amber,#0a5eb0);border-radius:14px;background:var(--panel,#fff);color:var(--ink,#16324f);box-shadow:0 20px 60px #0008}
#modeSelectModal h2{margin:0 0 8px;color:var(--amber,#0a5eb0);font-size:clamp(20px,4vw,25px);line-height:1.2}
#modeSelectModal p{margin:0 0 14px;color:var(--ink-dim,#6d84a0);font-size:13px;line-height:1.45}
#modeSelectModal .tmh-mode-list{display:flex;flex:1 1 auto;flex-direction:column;gap:9px;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:2px 5px 4px 2px}
#modeSelectModal .tmh-mode-card{display:grid;grid-template-columns:28px minmax(0,1fr) auto;align-items:center;gap:10px;flex:0 0 auto;min-height:68px;padding:12px 14px;border:1px solid var(--line,#cfe0f0);border-radius:10px;background:var(--panel2,#f2f7fc);color:var(--ink,#16324f);font:inherit;text-align:left;cursor:pointer}
#modeSelectModal .tmh-mode-card:hover{border-color:var(--amber,#0a5eb0);background:var(--panel,#fff)}
#modeSelectModal .tmh-mode-card.active{border:2px solid var(--amber,#0a5eb0);padding:11px 13px;box-shadow:0 3px 14px #0a5eb022}
#modeSelectModal .tmh-mode-icon{font-size:20px}
#modeSelectModal .tmh-mode-copy{display:flex;min-width:0;flex-direction:column;gap:3px}
#modeSelectModal .tmh-mode-copy b{font-size:14px;line-height:1.3;overflow-wrap:anywhere}
#modeSelectModal .tmh-mode-copy small{color:var(--ink-dim,#6d84a0);font-size:11px;line-height:1.35}
#modeSelectModal .tmh-mode-current{color:var(--ink-dim,#6d84a0);font-size:9px;font-weight:700;letter-spacing:.04em;white-space:nowrap}
#modeSelectModal .tmh-mode-card.active .tmh-mode-current{color:var(--ok,#1f9d55)}
#modeSelectModal .tmh-mode-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}
@media(max-width:640px){
#modeSelectModal{padding:12px 0 calc(12px + env(safe-area-inset-bottom,0px))}
#modeSelectModal .tmh-mode-modal{width:calc(100% - 24px);max-height:calc(100dvh - 24px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));padding:18px 14px 13px}
#modeSelectModal .tmh-mode-card{grid-template-columns:24px minmax(0,1fr);min-height:64px;padding:11px 12px}
#modeSelectModal .tmh-mode-card.active{padding:10px 11px}
#modeSelectModal .tmh-mode-current{grid-column:2;justify-self:start}
}
</style>`;  const bodyStart = source.search(/<body\b/i);
  const headCloseIndex = source.lastIndexOf("</head>", bodyStart >= 0 ? bodyStart : source.length);
  if (headCloseIndex >= 0) {
    let head = source.slice(0, headCloseIndex);
    if (/<base\b/i.test(head)) head = head.replace(/<base\b[^>]*>/i, '<base href="/">');
    else head += '<base href="/">';
    source = head + style + source.slice(headCloseIndex);
  }
  source = source.replace(/<button class="mode-picker-btn" id="modePickerBtn"[\s\S]*?<\/button>\s*/i, "");
  source = source.replace(/(<button class="logout-btn"[^>]*>)/i, '<a class="tmh-account-link" href="/account.html">Личный кабинет</a>$1');
  const userInfoPattern = /(<div class="user-info"[^>]*>)/i;
  const topbarPattern = /<\/div>\s*(<div class="stat-bar")/i;
  if (userInfoPattern.test(source)) source = source.replace(userInfoPattern, chrome + "$1");
  else if (topbarPattern.test(source)) source = source.replace(topbarPattern, chrome + "</div>\n$1");
  else source = source.replace(/<body[^>]*>/i, function(tag) { return tag + chrome; });
  const riskMarkup = `<style>#riskOverlay{position:fixed;inset:0;z-index:3100;display:none;flex-direction:column;background:var(--bg,#eef4fb);color:var(--ink,#16324f);font-family:var(--sans,system-ui,sans-serif)}
#riskOverlay.open{display:flex}
#riskBar{display:flex;align-items:center;gap:12px;padding:10px 16px;padding-top:max(10px,env(safe-area-inset-top));background:#0a5eb0;color:#fff}
#riskBar b{flex:1;font-size:15px}
#riskBody{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 16px calc(28px + env(safe-area-inset-bottom));width:100%;max-width:920px;margin:0 auto;box-sizing:border-box}
.rz-box{background:var(--panel,#fff);border:1px solid var(--line,#cfe0f0);border-radius:12px;padding:12px 14px;margin-bottom:12px}
.rz-box summary{cursor:pointer;font-weight:700}
.rz-box p{margin:8px 0 0;line-height:1.45;white-space:pre-wrap}
.rz-controls{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:560px){.rz-controls{grid-template-columns:1fr}}
.rz-controls label{display:block;font-size:12px;color:var(--ink-dim,#6d84a0);margin-bottom:4px}
.rz-controls select,.rz-controls input{width:100%;box-sizing:border-box;padding:10px 12px;font-size:16px;border:1px solid var(--line,#cfe0f0);border-radius:8px;background:var(--panel2,#f2f7fc);color:var(--ink,#16324f)}
.rz-meta{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;font-size:13px;color:var(--ink-dim,#6d84a0);margin:2px 2px 10px}
.rz-meta button{font-size:13px}
.rz-banner{border-radius:10px;padding:10px 14px;margin-bottom:12px;font-weight:700}
.rz-banner.info{background:#e8f2fb;color:#0c2f52;border:1px solid #0a5eb0}
.rz-banner.warn{background:#fff4e0;color:#7a4b00;border:1px solid #d4a017}
.rz-card{background:var(--panel,#fff);border:1px solid var(--line,#cfe0f0);border-left:5px solid #0a5eb0;border-radius:10px;padding:10px 14px;margin-bottom:10px}
.rz-card.hit{outline:2px solid #0a5eb0;background:#eef6fc}
html[data-theme="dark"] .rz-card.hit{background:#14283d}
.rz-place{margin-top:6px;line-height:1.45}
.rz-place small{color:var(--ink-dim,#6d84a0)}
.rz-h{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline}
.rz-h b{font-size:16px}
.rz-depot{font-size:13px;color:var(--ink-dim,#6d84a0)}
.rz-comm{margin-top:6px;font-size:13px;color:var(--ink-dim,#6d84a0);line-height:1.4;white-space:pre-wrap}
#riskBtnBar{font-weight:700}
@media(max-width:560px){#iframeBar{flex-wrap:wrap;gap:6px;padding-left:8px;padding-right:8px}#iframeModeLabel{order:3;flex:1 1 100%;font-size:12.5px}#iframeBar .btn{flex:1 1 0;min-width:0;padding:6px 6px;font-size:12px;line-height:1.2;white-space:normal;text-align:center}#riskBtnBar{margin-left:0!important}}</style><div id="riskOverlay" role="dialog" aria-label="Зона риска" aria-modal="true"><div id="riskBar"><b id="riskTitle">📍 Зона риска</b><button class="btn" id="riskClose" type="button">✕ Закрыть</button></div><div id="riskBody"></div></div>`;
  const riskViewerScript = '<script src="prototype/checklist-risk-viewer.js?v=1"></script>';
  const modeModal = '<div class="modal-overlay" id="modeSelectModal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modeModalTitle" tabindex="-1">' +
    '<div class="tmh-mode-modal"><h2 id="modeModalTitle">Сменить чек-лист</h2>' +
    '<p id="modeModalSubtitle">Выберите режим. Данные каждого режима сохраняются отдельно.</p>' +
    '<div class="tmh-mode-list">' + modeCards + '</div>' +
    '<div class="tmh-mode-actions"><button type="button" class="btn" id="modeModalCancel">Закрыть</button></div></div></div>';
  const routeScript = [
    '<script>(function(){',
    'var currentMode=' + JSON.stringify(mode) + ';',
    'var switchButton=document.getElementById("modePickerBtn"),modal=document.getElementById("modeSelectModal"),cancelButton=document.getElementById("modeModalCancel");',
    'function closeModeDialog(){if(!modal)return;modal.style.display="none";modal.setAttribute("aria-hidden","true");if(switchButton)switchButton.focus();}',
    'function openModeDialog(){if(!modal)return;modal.style.display="flex";modal.setAttribute("aria-hidden","false");var first=modal.querySelector("[data-tmh-mode]");if(first)first.focus();}',
    'if(switchButton)switchButton.addEventListener("click",openModeDialog);',
    'if(cancelButton)cancelButton.addEventListener("click",closeModeDialog);',
    'if(modal){modal.addEventListener("click",function(event){if(event.target===modal)closeModeDialog();});document.addEventListener("keydown",function(event){if(event.key==="Escape"&&modal.getAttribute("aria-hidden")==="false")closeModeDialog();});',
    'modal.querySelectorAll("[data-tmh-mode]").forEach(function(button){button.addEventListener("click",async function(){',
    'var nextMode=button.getAttribute("data-tmh-mode");if(!nextMode)return;if(nextMode===currentMode){closeModeDialog();return;}',
    'var label=button.querySelector(".tmh-mode-copy b"),nextName=label?label.textContent:nextMode;',
    'if(!window.confirm("Переключить чек-лист на «"+nextName+"»? Текущие данные и фотографии будут сохранены на этом устройстве."))return;',
    'modal.querySelectorAll("[data-tmh-mode]").forEach(function(item){item.disabled=true;});button.classList.add("saving");',
    'try{',
    'var context=typeof window.__TMH_GET_CLOUD_BACKUP_CONTEXT==="function"?window.__TMH_GET_CLOUD_BACKUP_CONTEXT():null,activeState=context&&context.state;',
    'var hasData=!!(activeState&&activeState.general&&(activeState.general.type||activeState.general.number||Object.keys(activeState.values||{}).length||(activeState.selectedSections||[]).length||(activeState.selected||[]).length));',
    'if(hasData){if(typeof saveState!=="function")throw new Error("Функция сохранения чек-листа недоступна");if(saveState(true)===false)throw new Error("Не удалось сохранить текущий чек-лист. Проверьте авторизацию и локальное хранилище.");}',
    'if(typeof __PS!=="undefined"&&__PS.chain){var photoResult=await __PS.chain;if(photoResult===false)throw new Error("Не удалось завершить сохранение фотографий. Переключение отменено.");}',
    'if(typeof _photoMigrationPromise!=="undefined"&&_photoMigrationPromise)await _photoMigrationPromise;if(typeof _photoWriteChain!=="undefined"&&_photoWriteChain)await _photoWriteChain;',
    'if(typeof __tmhOfflineSaveChain!=="undefined"&&__tmhOfflineSaveChain)await __tmhOfflineSaveChain;if(typeof __tmhOfflineSaveError!=="undefined"&&__tmhOfflineSaveError)throw new Error("Не удалось завершить зашифрованное локальное сохранение. Переключение отменено.");',
    'try{localStorage.setItem("checklist_mode_v2",nextMode);}catch(storageError){throw new Error("Не удалось сохранить выбранный режим на устройстве.");}',
    'var params=new URLSearchParams(location.search);params.set("mode",nextMode);params.delete("openChecklist");params.delete("openLocalChecklist");',
    'var query=params.toString(),target=location.pathname+(query?"?"+query:"")+location.hash;location.replace(target);',
    '}catch(error){console.error("Checklist mode switch failed",error);button.classList.remove("saving");modal.querySelectorAll("[data-tmh-mode]").forEach(function(item){item.disabled=false;});if(typeof showToast==="function")showToast(error&&error.message||"Не удалось переключить чек-лист");}',
    '});});}',
    'var original=window.showContinueDialogOrStart;if(typeof original==="function"&&!window.__TMH_ROUTE_START_WRAPPED){window.__TMH_ROUTE_START_WRAPPED=true;window.showContinueDialogOrStart=async function(){',
    'var params=new URLSearchParams(location.search),localId=params.get("openLocalChecklist");',
    'if(localId&&!window.__TMH_ROUTE_LOCAL_ACTIVATED){var api=window.TMHAuthReady?await window.TMHAuthReady:window.TMHAuth;if(!api||typeof api.activateOfflineChecklistInstance!=="function")throw new Error("Офлайн-запись недоступна");await api.activateOfflineChecklistInstance(LS_KEY,localId);window.__TMH_ROUTE_LOCAL_ACTIVATED=true;}',
    'if(params.get("openChecklist")&&!window.__TMH_ROUTE_CLOUD_RESTORE_TRIGGERED){window.__TMH_ROUTE_CLOUD_RESTORE_TRIGGERED=true;try{if(typeof startApp!=="function")throw new Error("Не удалось загрузить состояние чек-листа");await startApp(false);',
    'if(typeof __PS!=="undefined"&&__PS.chain)await __PS.chain;if(typeof __tmhOfflineSaveChain!=="undefined"&&__tmhOfflineSaveChain)await __tmhOfflineSaveChain;if(typeof __tmhOfflineSaveError!=="undefined"&&__tmhOfflineSaveError)throw new Error("Не удалось завершить локальное сохранение перед восстановлением");',
    'var context=typeof window.__TMH_GET_CLOUD_BACKUP_CONTEXT==="function"?window.__TMH_GET_CLOUD_BACKUP_CONTEXT():null;if(!context||!context.state||!context.state.general||!context.state.values)throw new Error("Локальное состояние не загружено полностью; облачное восстановление отменено");',
    'var restoreButton=document.getElementById("tmhCloudRestoreBtn");if(!restoreButton)throw new Error("Кнопка восстановления облачной копии недоступна");restoreButton.click();',
    '}catch(error){console.error("Cloud restore preparation failed",error);if(typeof showToast==="function")showToast(error&&error.message||"Не удалось подготовить локальную копию");}return true;}',
    'return await original.apply(this,arguments);};}',
    '})();<\/script>'
  ].join("\n");
  const routeBodyCloseIndex = __tmhFindDocumentBodyClose(source);
  if (routeBodyCloseIndex >= 0) {
    source = source.slice(0, routeBodyCloseIndex) + modeModal + riskMarkup + routeScript + riskViewerScript + "</body>" + source.slice(routeBodyCloseIndex + "</body>".length);
  }
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
  // Templates were originally authored for srcdoc/iframe embedding. In the standalone
  // runtime their parent window is the application window itself; normalize every
  // legacy bridge before evaluating the template so auth, storage and navigation
  // resolve locally rather than waiting for a non-existent host shell.
  source = source.replaceAll("window.parent", "window");
  source = risk.applyRegistry(source, mode) || source;
  source = __tmhAttachCloudBackup(source, mode);
  source = __tmhAttachFooterLayout(source);
  source = injectUnifiedChrome(source, mode);
  source = __tmhAttachHeaderLayout(source);
  window.__TMH_ACTIVE_MODE__ = mode;
  const migratedPatches = STANDALONE_PATCHES.map(function(patch) {
    return '<script id="' + patch.id + '">' + patch.code.replaceAll("window.parent", "window") + '</script>';
  }).join("\n");
  const patchBodyCloseIndex = __tmhFindDocumentBodyClose(source);
  if (patchBodyCloseIndex >= 0) {
    source = source.slice(0, patchBodyCloseIndex) + migratedPatches + "</body>" + source.slice(patchBodyCloseIndex + "</body>".length);
  }
  const compactStripScript = '<script id="tmhCompactControlStrip">(function(){var expectsRoute=' + JSON.stringify(mode === "complex" || mode === "housings" || /^k_/.test(String(mode))) + ';function mount(){var bar=document.getElementById("tmhUnifiedModeSwitch");if(!bar)return false;var userInfo=document.getElementById("userInfo");if(userInfo&&userInfo.parentNode&&bar.nextElementSibling!==userInfo)userInfo.parentNode.insertBefore(bar,userInfo);var theme=document.getElementById("themeSwitch");var route=document.getElementById("btnRouteView");return !!theme;}var observer=new MutationObserver(function(){if(mount()&&(!expectsRoute||document.getElementById("btnRouteView")))observer.disconnect();});observer.observe(document.documentElement,{childList:true,subtree:true});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();setTimeout(function(){mount();observer.disconnect();},1800);})();<\/script>';
  const compactStripClose = __tmhFindDocumentBodyClose(source);
  if (compactStripClose >= 0) source = source.slice(0, compactStripClose) + compactStripScript + "</body>" + source.slice(compactStripClose + "</body>".length);
  if (window.__tmhBootTimer) {
    clearTimeout(window.__tmhBootTimer);
    window.__tmhBootTimer = null;
  }
  // document.write replaces the bootstrap document; retain PWA metadata in the final document
  // so Chrome/Safari continue to associate the standalone checklist with its manifest.
  if (!/<link\b[^>]*rel=["']manifest["']/i.test(source)) {
    source = source.replace(/<head([^>]*)>/i, '<head$1><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#0a5eb0"><link rel="apple-touch-icon" href="/icon-192.png">');
  }
  const connectionBadge = '<style id="tmhStandaloneConnectionStyle">#tmhConnectionBadge{position:fixed;left:10px;right:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);z-index:2147483000;display:flex;align-items:center;gap:7px;padding:8px 12px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:#17324f;color:#fff;box-shadow:0 3px 14px rgba(0,0,0,.24);font:600 12px/1.2 system-ui,sans-serif;pointer-events:none;white-space:nowrap}#tmhConnectionDot{width:9px;height:9px;min-width:9px;border-radius:50%;background:#45d483;box-shadow:0 0 0 2px rgba(255,255,255,.16)}</style><script id="tmhStandaloneConnectionRuntime">(function(){var last='unknown',busy=false;function paint(mode){last=mode;var b=document.getElementById('tmhConnectionBadge'),t=document.getElementById('tmhConnectionText'),d=document.getElementById('tmhConnectionDot');if(t)t.textContent=mode==='offline'?'Офлайн · локально':mode==='syncing'?'Синхронизация…':mode==='error'?'Ошибка синхронизации':mode==='pending'?'Ожидает синхронизации':'Онлайн';if(d)d.style.background=mode==='online'?'#45d483':mode==='error'?'#ef5350':'#ffbd4a';if(b){b.dataset.mode=mode;b.title=mode==='offline'?'Работа и сохранение на этом устройстве':mode==='pending'?'Изменения ожидают отправки в облако':mode==='error'?'Не удалось синхронизировать изменения':'Состояние соединения и синхронизации';}}async function probe(){if(busy)return;if(navigator.onLine===false){paint('offline');return;}busy=true;try{var r=await fetch('https://fecigiwjtbtabnsfsdym.supabase.co/auth/v1/health',{cache:'no-store',mode:'no-cors'});paint('online');}catch(e){paint('offline');}finally{busy=false;}}function mount(){if(!document.body)return;var b=document.getElementById('tmhConnectionBadge');if(!b){b=document.createElement('div');b.id='tmhConnectionBadge';b.setAttribute('role','status');b.setAttribute('aria-live','polite');b.innerHTML='<span id="tmhConnectionDot"></span><span id="tmhConnectionText">Проверяем связь…</span>';document.body.appendChild(b);}window.__TMH_SET_CONNECTION_STATUS=paint;window.addEventListener('offline',function(){paint('offline')});window.addEventListener('online',probe);window.addEventListener('tmh-offline-sync-status',function(e){var x=e.detail||{};if(x.status==='error'||x.status==='conflict')paint('error');else if((x.pendingCount||0)>0||x.status==='pending-sync')paint('pending');else if(x.status==='synced')paint(navigator.onLine===false?'offline':'online');});probe();if(!window.__tmhConnectionPoll)window.__tmhConnectionPoll=setInterval(function(){var api=window.TMHAuth;if(api&&typeof api.getOfflineSyncStatus==='function'){var x=api.getOfflineSyncStatus();if(x&&(x.status==='error'||x.status==='conflict'))paint('error');else if(x&&(x.pendingCount||0)>0)paint('pending');else probe();}else probe();},15000);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();})();<\\/script>';
  const badgeClose = __tmhFindDocumentBodyClose(source);
  if (badgeClose >= 0) source = source.slice(0,badgeClose) + connectionBadge + source.slice(badgeClose);
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
