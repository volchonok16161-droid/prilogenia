// Timeline based on persisted timestamps, not inferred user actions.
export function buildChecklistDetailTimeline(row, view, act) {
  const events=[];
  const add=(date,title,description)=>{
    if(typeof date!=="string" || !Number.isFinite(Date.parse(date))) return;
    events.push({date,title,description});
  };
  add(row?.created_at,"Чек-лист создан","Дата создания облачной записи");
  add(row?.updated_at,"Облачная запись обновлена","Время последнего сохранённого изменения; промежуточные изменения недоступны");
  add(view?.excelRequestedAt,"Запрошена выгрузка Excel","Запрос экспорта сохранён; скачивание файла не подтверждено");
  add(view?.actPreparedAt,"Акт подготовлен к печати","Событие подготовки, без подтверждения подписи");
  if(act?.id && act?.uploaded_at) add(act.uploaded_at,"Акт загружен","Файл зарегистрирован в облачном хранилище; подпись не проверена");
  return events.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
}
