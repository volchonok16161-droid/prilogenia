// Read-only breakdown of answers actually present in a saved cloud snapshot.
// A snapshot does not necessarily include the equipment catalog. Never invent
// missing operations or infer compliance from a non-empty answer.
// Verified catalog entries from the built-in complex checklist (prototype/embedded/complex.js).
// Legacy cloud snapshots do not contain the full equipment catalog.
const KNOWN_COMPLEX = {
  nvmontazh:{
    title:"Низковольтный электрический монтаж",
    fields:{
      f1:{title:"Протяжка штепсельных соединений под пультом машиниста (ТР-1)",ok:["Да"]},
      f2:{title:"Протяжка штепсельных соединений ящика МСУД БУ-006 (ТР-1)",ok:["Да"]},
      f3:{title:"Протяжка штепсельных соединений ящика МСУД БУ-006-01 (ТР-1)",ok:["Да"]}
    }
  }
};
const object = value => value && typeof value==="object" && !Array.isArray(value);
const trim = value => String(value??"").trim();
function showValue(value){
  if(value===null||value===undefined) return "";
  if(typeof value==="string"||typeof value==="number"||typeof value==="boolean") return trim(value).slice(0,240);
  if(Array.isArray(value)) return value.map(x=>typeof x==="string"?x:"").filter(Boolean).join(", ").slice(0,240);
  return "";
}
function status(text,field){
  if(text&&field&&Array.isArray(field.ok)&&field.ok.length){
    return field.ok.some(v=>trim(v).toLowerCase()===text.toLowerCase())?"ok":text.toLowerCase()==="не требуется"?"answered":"deviation";
  }
  const v=text.toLowerCase();
  if(["ok","ок"].includes(v)) return "ok";
  if(["nok","not ok","не ок"].includes(v)) return "nok";
  return text?"answered":"empty";
}
export function buildChecklistEquipmentDetails(payload){
  const state=object(payload?.state)?payload.state:{};
  const values=object(state.values)?state.values:{};
  const selection=Array.isArray(state.selected)?new Set(state.selected.map(String)):null;
  const groups=new Map();
  for(const [instanceId,fields] of Object.entries(values)){
    if(!object(fields)) continue;
    const tokens=instanceId.split("|"),equipmentId=tokens[0]||instanceId;
    if(selection?.size && !selection.has(equipmentId)) continue;
    if(!groups.has(equipmentId)) groups.set(equipmentId,{id:equipmentId,label:equipmentId,instances:[],answered:0,empty:0,nok:0,ok:0});
    const group=groups.get(equipmentId);
    const catalog=payload?.mode==="complex"?KNOWN_COMPLEX[equipmentId]:null;
    if(catalog) group.label=catalog.title;
    const operations=[];
    for(const [key,raw] of Object.entries(fields)){
      if(/_photo$/i.test(key)||key.startsWith("__")) continue;
      const answer=showValue(raw),definition=catalog?.fields?.[key],kind=status(answer,definition);
      operations.push({key,label:definition?.title||key,answer,kind});
      if(kind==="empty") group.empty++;else group.answered++;
      if(kind==="nok"||kind==="deviation")group.nok++;if(kind==="ok")group.ok++;
    }
    if(operations.length) group.instances.push({id:instanceId,label:tokens.slice(1).join(" · ")||"Общие операции",operations});
  }
  return [...groups.values()].filter(g=>g.instances.length).sort((a,b)=>a.label.localeCompare(b.label,"ru"));
}
