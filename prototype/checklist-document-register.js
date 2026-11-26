// Document workflow registry v1. A triggered notice is not a generated or
// delivered document. Template content will be added only after approval.
export const DOCUMENT_TEMPLATE_REGISTRY = Object.freeze({
  housings_notice: Object.freeze({
    id:"housings_notice", equipmentId:"housings",
    name:"Уведомление по кожухам", templateVersion:null,
    templateState:"awaiting_approved_sample"
  })
});
const text=value=>String(value??"").trim();
const safeId=value=>text(value).slice(0,200);
export function createDocumentRegister({notices=[],general={},act=null}={}){
  const entries=[];
  for(const item of Array.isArray(notices)?notices:[]){
    if(!item||!item.equipmentId||!item.instanceId||!item.fieldKey)continue;
    const template=Object.values(DOCUMENT_TEMPLATE_REGISTRY).find(t=>t.equipmentId===item.equipmentId);
    // Other notice triggers are tracked by the checklist but are not yet
    // configured for automatic document formation.
    const notificationStatus=item.notificationStatus==="Да"?"marked_delivered":
      item.notificationStatus==="Нет"?"marked_not_delivered":"pending";
    entries.push(Object.freeze({
      recordId:[safeId(item.equipmentId),safeId(item.instanceId),safeId(item.fieldKey)].join("::"),
      templateId:template?.id??null,
      templateState:template?.templateState??"not_configured",
      equipmentId:safeId(item.equipmentId),
      equipmentName:text(item.equipmentName).slice(0,200),
      instanceId:safeId(item.instanceId),
      fieldKey:safeId(item.fieldKey),
      operationName:text(item.operationName).slice(0,300),
      answer:text(item.answer).slice(0,120),
      notificationStatus,
      notificationMarkedAt:text(item.notificationMarkedAt)||null,
      noticeGeneratedAt:null,
      noticeCopyUploaded:false,
      requiresNotification:true
    }));
  }
  return Object.freeze({
    schemaVersion:1,
    locomotive:{type:text(general.type),number:text(general.number),date:text(general.date)},
    notices:Object.freeze(entries),
    act:Object.freeze({
      preparedAt:typeof act?.preparedAt==="string"?act.preparedAt:null,
      signedCopyUploaded:false,
      signatureVerified:false
    })
  });
}
export function documentDashboardRows(register,checklistId=""){
  const base={checklistId:text(checklistId),locomotiveType:text(register?.locomotive?.type),
    locomotiveNumber:text(register?.locomotive?.number),
    inspectionDate:text(register?.locomotive?.date)};
  return (Array.isArray(register?.notices)?register.notices:[]).map(n=>({
    ...base,recordId:n.recordId,templateId:n.templateId||"",
    equipment:n.equipmentName||n.equipmentId,section:n.instanceId,
    operation:n.operationName||n.fieldKey,answer:n.answer,
    notificationRequired:"Да",deliveryStatus:n.notificationStatus,
    generated:n.noticeGeneratedAt?"Да":"Нет",
    copyUploaded:n.noticeCopyUploaded?"Да":"Нет",
    templateStatus:n.templateState
  }));
}
