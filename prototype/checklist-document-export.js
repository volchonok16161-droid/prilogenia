// Injected into the isolated checklist document. Excel data is operational
// metadata, NOT evidence that a document was signed or uploaded.
export const DOCUMENT_EXPORT_RUNTIME = `
function __tmhDocumentRegisterExcel(workbook){
  var ws=workbook.addWorksheet('Реестр документов');
  ws.columns=[
    {header:'Тип записи',key:'kind',width:23},
    {header:'Серия',key:'type',width:16},
    {header:'Номер электровоза',key:'number',width:19},
    {header:'Дата осмотра',key:'date',width:19},
    {header:'Тип уведомления',key:'template',width:27},
    {header:'Оборудование',key:'equipment',width:38},
    {header:'Секция / экземпляр',key:'instance',width:30},
    {header:'Операция',key:'operation',width:55},
    {header:'Ответ',key:'answer',width:24},
    {header:'Требуется уведомление',key:'required',width:25},
    {header:'Отметка передачи',key:'delivery',width:23},
    {header:'Документ сформирован',key:'generated',width:25},
    {header:'Копия документа',key:'copy',width:25},
    {header:'Версия шаблона',key:'version',width:24}
  ];
  var general=STATE.general||{},base={
    type:general.type||'',number:general.number||'',date:general.date||''
  };
  var items=typeof __tmhNoticeItems==='function'?__tmhNoticeItems():[];
  items.forEach(function(x){
    var isHousings=x.eq&&x.eq.id==='housings';
    ws.addRow(Object.assign({},base,{
      kind:'Уведомление',template:isHousings?'Уведомление по кожухам':'Не настроен',
      equipment:x.eq.title||x.eq.id,instance:x.iid,
      operation:x.field.label||x.field.key,answer:String(x.answer||''),
      required:'Да',
      delivery:x.status==='Да'?'Отмечена передача':x.status==='Нет'?'Отмечено: не передано':'Нет отметки',
      generated:'Нет подтверждения',
      copy:'Нет подтверждения',
      version:isHousings?'Ожидает образец':'Не настроен'
    }));
  });
  var act=STATE.__tmhWorkflow&&STATE.__tmhWorkflow.act||{};
  ws.addRow(Object.assign({},base,{
    kind:'Акт',template:'Акт осмотра',required:'',
    generated:act.preparedAt?'Подготовлен к печати':'Нет подтверждения',
    copy:'Не проверено при экспорте',version:'Ожидает утверждённый шаблон'
  }));
  ws.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};
  ws.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0A5EB0'}};
  ws.autoFilter={from:{row:1,column:1},to:{row:Math.max(2,ws.rowCount),column:14}};
}
`;
