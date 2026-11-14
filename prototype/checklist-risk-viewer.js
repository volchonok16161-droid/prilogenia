(function(){
  'use strict';
  var C=window.__RISK_CORE__;if(!C)return;
  var FILE=C.FILE,SHEET_BY_MODE=C.SHEET_BY_MODE,TITLE_BY_MODE=C.TITLE_BY_MODE,INSTR_SHEET=C.INSTR_SHEET,store=C.store;
  var norm=C.norm,sheetKey=C.sheetKey,findSheet=C.findSheet,numberMatches=C.numberMatches,searchMatches=C.searchMatches,entriesFor=C.entriesFor,load=C.load;
  var ov=document.getElementById('riskOverlay'),body=document.getElementById('riskBody'),titleEl=document.getElementById('riskTitle');
  var ui=null; // ссылки на элементы открытого окна
  /* ---------- текущий чек-лист и локомотив ---------- */
  function curMode(){return window.__TMH_ACTIVE_MODE__||(function(){try{return(typeof MODE!=='undefined'&&MODE)?MODE:null;}catch(e){return null;}})();}
  function curLoco(){
    try{
      var context=typeof window.__TMH_GET_CLOUD_BACKUP_CONTEXT==='function'?window.__TMH_GET_CLOUD_BACKUP_CONTEXT():null;
      var state=context&&context.state;
      if(!state&&typeof STATE!=='undefined')state=STATE;
      var g=state&&state.general;
      return(g&&g.type&&g.number)?{t:g.type,n:g.number,d:g.depot||''}:null;
    }catch(e){return null;}
  }
  function hitsFor(entries,loco){
    if(!loco)return [];
    return entries.filter(function(e){return(!e.series||norm(e.series)===norm(loco.t))&&numberMatches(e.number,loco.n);});
  }

  /* ---------- окно ---------- */
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
  function instrText(mode){
    if(!store.data)return [];
    var nm=findSheet(store.data,INSTR_SHEET);if(!nm)return [];
    var want=sheetKey(SHEET_BY_MODE[mode]||''),out=[];
    store.data[nm].forEach(function(r,i){
      if(!r||i===0&&/раздел/.test(sheetKey(r[0])))return;
      var sec=sheetKey(r[0]),txt=norm(r[1]);
      if(txt&&(sec==='общее'||sec===want))out.push(txt);
    });
    return out;
  }
  function render(){
    var mode=curMode();if(!ui||!mode)return;
    var entries=entriesFor(mode),loco=curLoco(),hits=hitsFor(entries,loco);
    var depSel=ui.depot.value,q=ui.q.value;
    // список приписок
    var depots={},noDepot=0;
    entries.forEach(function(e){if(e.depot)depots[e.depot]=(depots[e.depot]||0)+1;else noDepot++;});
    var names=Object.keys(depots).sort(function(a,b){return a.localeCompare(b,'ru');});
    ui.depot.innerHTML='';
    var o=el('option',null,'Все приписки ('+entries.length+')');o.value='';ui.depot.appendChild(o);
    names.forEach(function(n){var op=el('option',null,n+' ('+depots[n]+')');op.value=n;ui.depot.appendChild(op);});
    if(noDepot){var op2=el('option',null,'— приписка не указана ('+noDepot+')');op2.value='__none__';ui.depot.appendChild(op2);}
    ui.depot.value=(depSel&&(depots[depSel]||depSel==='__none__'&&noDepot))?depSel:'';
    // фильтрация
    var shown=entries.filter(function(e){
      var d=ui.depot.value;
      if(d==='__none__'&&e.depot)return false;
      if(d&&d!=='__none__'&&e.depot!==d)return false;
      return searchMatches(e,q);
    });
    // если введённый номер совпал точно — показываем только точные совпадения (591, а не 1591)
    var qq=norm(q);
    if(/^\d+$/.test(qq)){var exact=shown.filter(function(e){return e.number&&numberMatches(e.number,qq);});if(exact.length)shown=exact;}
    // откуда чек-лист берёт список и есть ли ошибки в файле
    ui.banner.innerHTML='';
    if(store.used[mode]===true){
      ui.banner.appendChild(el('div','rz-banner info','Этот чек-лист использует список локомотивов из файла '+FILE+' (лист «'+SHEET_BY_MODE[mode]+'»).'));
    }else if(store.used[mode]===false){
      ui.banner.appendChild(el('div','rz-banner warn','Файл '+FILE+' не был прочитан при запуске этого чек-листа, поэтому используется встроенный список. Перезагрузите страницу при наличии связи.'));
    }
    var iss=(store.issues[mode]||[]).concat(store.nodeIssues[mode]||[]);
    if(iss.length){
      var dt=el('details','rz-box');dt.open=true;
      dt.appendChild(el('summary',null,'⚠️ Проблемы в файле: '+iss.length+' (эти строки не попали в чек-лист или работают не полностью)'));
      iss.slice(0,40).forEach(function(t){dt.appendChild(el('p',null,t));});
      if(iss.length>40)dt.appendChild(el('p',null,'… и ещё '+(iss.length-40)));
      ui.banner.appendChild(dt);
    }
    // справка по открытому локомотиву
    if(loco&&entries.length){
      var f=hits[0];
      ui.banner.appendChild(el('div','rz-banner '+(f?'info':'warn'),f
        ?('Открытый локомотив '+loco.t+' № '+loco.n+' — приписка: '+(f.depot||'не указана')+(f.places.length?('; место осмотра: '+f.places.join('; ')):''))
        :('Открытый локомотив '+loco.t+' № '+loco.n+' не найден в списке (лист «'+SHEET_BY_MODE[mode]+'» файла '+FILE+')')));
    }
    // список
    ui.list.innerHTML='';
    ui.count.textContent='Показано: '+shown.length+' из '+entries.length;
    if(!entries.length){ui.list.appendChild(el('div','rz-banner warn','В листе «'+(SHEET_BY_MODE[mode])+'» пока нет локомотивов. Добавьте строки в файл '+FILE+'.'));return;}
    if(!shown.length){ui.list.appendChild(el('div','rz-banner warn','Ничего не найдено. Измените приписку или поисковый запрос.'));return;}
    shown.slice(0,200).forEach(function(e){
      var isHit=hits.indexOf(e)>=0,c=el('div','rz-card'+(isHit?' hit':'')),h=el('div','rz-h');
      h.appendChild(el('b',null,(e.series||'Все серии')+' № '+(e.number||'все номера')));
      h.appendChild(el('span','rz-depot',e.depot?e.depot:'приписка не указана'));
      c.appendChild(h);
      if(e.places.length){
        var p=el('div','rz-place');
        p.appendChild(el('span',null,'📍 '+(e.explicitPlace||e.places.length===1?'Место осмотра: ':'Места осмотра: ')+e.places.join('; ')));
        if(!e.explicitPlace&&e.places.length>1)p.appendChild(el('small',null,'  (по приписке)'));
        c.appendChild(p);
      }
      var km=C.mileageFor(e.series,e.number);
      if(km!=null)c.appendChild(el('div','rz-place','🛣 Пробег по данным завода: '+km+' км (ниже вводить нельзя)'));
      var nt=C.nodeRulesText(mode,e);
      if(nt)c.appendChild(el('div','rz-place','🔧 Узлы: '+nt));
      if(e.comment)c.appendChild(el('div','rz-comm',e.comment));
      ui.list.appendChild(c);
    });
    if(shown.length>200)ui.list.appendChild(el('div','rz-banner warn','Показаны первые 200. Уточните номер или выберите приписку.'));
  }
  function build(){
    var mode=curMode();body.innerHTML='';ui={};
    titleEl.textContent='📍 Зона риска — '+(TITLE_BY_MODE[mode]||'чек-лист');
    ui.banner=el('div');body.appendChild(ui.banner);
    var instr=instrText(mode);
    if(instr.length){
      var d=el('details','rz-box');d.open=(window.innerWidth>=700);   // на телефоне свёрнуто, чтобы сразу видеть результаты
      d.appendChild(el('summary',null,'Как пользоваться'));
      instr.forEach(function(t){d.appendChild(el('p',null,t));});body.appendChild(d);
    }
    var box=el('div','rz-box'),ctr=el('div','rz-controls');
    var f1=el('div'),l1=el('label',null,'Приписка');ui.depot=el('select');f1.appendChild(l1);f1.appendChild(ui.depot);
    var f2=el('div'),l2=el('label',null,'Поиск по номеру локомотива (или серии, месту)');ui.q=el('input');ui.q.type='search';ui.q.setAttribute('inputmode','search');ui.q.setAttribute('autocomplete','off');ui.q.placeholder='например: 746';
    f2.appendChild(l2);f2.appendChild(ui.q);
    ctr.appendChild(f1);ctr.appendChild(f2);box.appendChild(ctr);body.appendChild(box);
    var meta=el('div','rz-meta');ui.count=el('span');meta.appendChild(ui.count);
    ui.stamp=el('span',null,store.stamp?('Файл от '+store.stamp):'');meta.appendChild(ui.stamp);
    var rb=el('button','btn','🔄 Обновить');rb.type='button';rb.onclick=function(){refresh(true);};meta.appendChild(rb);
    var cb=el('button','btn','✕ Сбросить');cb.type='button';cb.onclick=function(){ui.q.value='';ui.depot.value='';render();};meta.appendChild(cb);
    body.appendChild(meta);
    ui.list=el('div');body.appendChild(ui.list);
    ui.depot.onchange=render;ui.q.oninput=render;
    var loco=curLoco();if(loco&&loco.n)ui.q.value=loco.n;   // сразу показываем текущий локомотив
  }
  function refresh(force,silent){
    if(!ui)return;
    if(!silent){ui.list.innerHTML='';ui.list.appendChild(el('div','rz-banner warn','Загрузка…'));}
    load(force).then(function(){
      if(!ui)return;ui.stamp.textContent=store.stamp?('Файл от '+store.stamp):'';render();
    }).catch(function(){
      if(!ui||(silent&&store.data))return;ui.list.innerHTML='';ui.list.appendChild(el('div','rz-banner bad','Не удалось загрузить данные: '+(store.error||'ошибка')));
    });
  }
  function open(){
    if(!curMode()){return;}
    build();ov.classList.add('open');if(store.data)render();refresh(true,!!store.data);   // всегда перечитываем файл; старые данные показываем сразу
    setTimeout(function(){try{ui.q.focus();}catch(e){}},50);
  }
  function close(){ov.classList.remove('open');ui=null;}

  var btn=document.getElementById('tmhRiskOpenBtn');
  if(btn)btn.addEventListener('click',open);
  document.getElementById('riskClose').addEventListener('click',close);
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape')close();});
  window.__RISK_ZONE_V1__={load:load,parseXlsx:C.parseXlsx,numberMatches:numberMatches,open:open};
})();