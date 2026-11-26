// Read-only breakdown of answers actually present in a saved cloud snapshot.
// A snapshot does not necessarily include the equipment catalog. Never invent
// missing operations or infer compliance from a non-empty answer.
const object = value => value && typeof value==="object" && !Array.isArray(value);
const trim = value => String(value??"").trim();
function showValue(value){
  if(value===null||value===undefined) return "";
  if(typeof value==="string"||typeof value==="number"||typeof value==="boolean") return trim(value).slice(0,240);
  if(Array.isArray(value)) return value.map(x=>typeof x==="string"?x:"").filter(Boolean).join(", ").slice(0,240);
  return "";
}
function status(text){
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
    const operations=[];
    for(const [key,raw] of Object.entries(fields)){
      if(/_photo$/i.test(key)||key.startsWith("__")) continue;
      const answer=showValue(raw),kind=status(answer);
      operations.push({key,answer,kind});
      if(kind==="empty") group.empty++;else group.answered++;
      if(kind==="nok")group.nok++;if(kind==="ok")group.ok++;
    }
    if(operations.length) group.instances.push({id:instanceId,label:tokens.slice(1).join(" · ")||"Общие операции",operations});
  }
  return [...groups.values()].filter(g=>g.instances.length).sort((a,b)=>a.label.localeCompare(b.label,"ru"));
}
