(function(){
  'use strict';
  var FILE='zona_riska.xlsx';
  var SHEET_BY_MODE={complex:'Комплексный',housings:'КМБ',tt:'ТТ',bi:'БИ',hydro:'Гидродемпферы'};
  var TITLE_BY_MODE={complex:'Комплексный чек-лист',housings:'КМБ',tt:'ТТ (тяговый трансформатор)',bi:'БИ (МСУД-015)',hydro:'Гидродемпферы'};
  var INSTR_SHEET='Инструкция',PLACES_SHEET='Места осмотра',NODES_SHEET='Узлы',MILEAGE_SHEET='Пробег';
  var store={data:null,error:null,loading:null,stamp:'',lastTry:0,cache:{},places:null,milCache:null,issues:{},used:{},nodeIssues:{},rules:{},custom:[],customStamp:'',customError:null,customLoaded:false,checklists:[]};

  /* ---------- чтение xlsx (zip + xml), без внешних библиотек ---------- */
  function u8str(u8){return new TextDecoder('utf-8').decode(u8);}
  function inflateRaw(u8){
    if(typeof DecompressionStream==='undefined')return Promise.reject(new Error('Браузер не поддерживает чтение Excel (нужен Chrome 80+, Safari 16.4+).'));
    var s=new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(s).arrayBuffer().then(function(b){return new Uint8Array(b);});
  }
  function readZip(buf){
    var dv=new DataView(buf),e=buf.byteLength-22;
    while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;
    if(e<0)throw new Error('Файл не похож на xlsx (нет структуры zip).');
    var cnt=dv.getUint16(e+10,true),p=dv.getUint32(e+16,true),files={};
    for(var i=0;i<cnt;i++){
      if(dv.getUint32(p,true)!==0x02014b50)break;
      var method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),nlen=dv.getUint16(p+28,true),xlen=dv.getUint16(p+30,true),clen=dv.getUint16(p+32,true),lho=dv.getUint32(p+42,true);
      var name=u8str(new Uint8Array(buf,p+46,nlen));
      files[name]={method:method,csize:csize,lho:lho};
      p+=46+nlen+xlen+clen;
    }
    return files;
  }
  function entryText(buf,f){
    if(!f)return Promise.resolve('');
    var dv=new DataView(buf),nlen=dv.getUint16(f.lho+26,true),xlen=dv.getUint16(f.lho+28,true),st=f.lho+30+nlen+xlen;
    var raw=new Uint8Array(buf,st,f.csize);
    if(f.method===0)return Promise.resolve(u8str(raw));
    if(f.method===8)return inflateRaw(raw).then(u8str);
    return Promise.reject(new Error('Неподдерживаемое сжатие в xlsx.'));
  }
  function xml(s){return new DOMParser().parseFromString(s,'application/xml');}
  function tags(node,n){return node.getElementsByTagNameNS('*',n);}
  function joinT(node){var o='',t=tags(node,'t');for(var i=0;i<t.length;i++)o+=t[i].textContent;return o;}
  function colIdx(ref){var m=/^([A-Z]+)/i.exec(ref||''),n=0;if(!m)return 0;var s=m[1].toUpperCase();for(var i=0;i<s.length;i++)n=n*26+(s.charCodeAt(i)-64);return n-1;}
  function cellText(c,sst){
    var t=c.getAttribute('t'),v=tags(c,'v')[0];
    if(t==='s')return v?(sst[parseInt(v.textContent,10)]||''):'';
    if(t==='inlineStr'){var is=tags(c,'is')[0];return is?joinT(is):'';}
    if(t==='str'||t==='e')return v?v.textContent:'';
    if(t==='b')return(v&&v.textContent==='1')?'да':'нет';
    if(!v)return '';
    var s=v.textContent,n=Number(s);
    return(s!==''&&isFinite(n))?String(n):s;
  }
  function parseXlsx(buf){
    var files=readZip(buf),sheets={};
    return Promise.all([entryText(buf,files['xl/workbook.xml']),entryText(buf,files['xl/_rels/workbook.xml.rels']),entryText(buf,files['xl/sharedStrings.xml'])]).then(function(r){
      var wb=xml(r[0]),rels=xml(r[1]),sst=[];
      if(r[2]){var si=tags(xml(r[2]),'si');for(var i=0;i<si.length;i++)sst.push(joinT(si[i]));}
      var relMap={},rl=tags(rels,'Relationship');
      for(var k=0;k<rl.length;k++){var tg=rl[k].getAttribute('Target')||'';relMap[rl[k].getAttribute('Id')]=tg.charAt(0)==='/'?tg.slice(1):'xl/'+tg;}
      var sh=tags(wb,'sheet'),jobs=[];
      for(var j=0;j<sh.length;j++){
        (function(el){
          var name=el.getAttribute('name'),rid=el.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||el.getAttribute('r:id');
          jobs.push(entryText(buf,files[relMap[rid]]).then(function(txt){
            var rows=[];
            if(txt){var rw=tags(xml(txt),'row');
              for(var a=0;a<rw.length;a++){
                var cells=tags(rw[a],'c'),line=[],ri=parseInt(rw[a].getAttribute('r'),10)-1;
                for(var b=0;b<cells.length;b++){line[colIdx(cells[b].getAttribute('r'))]=cellText(cells[b],sst);}
                rows[isNaN(ri)?rows.length:ri]=line;
              }}
            sheets[name]=rows;
          }));
        })(sh[j]);
      }
      return Promise.all(jobs);
    }).then(function(){return sheets;});
  }

  /* ---------- запись xlsx: заменяются только строки данных выбранных листов, всё остальное остаётся как было ---------- */
  var CRC_T=null;
  function crc32(u8){
    if(!CRC_T){CRC_T=new Uint32Array(256);for(var n=0;n<256;n++){var c0=n;for(var k=0;k<8;k++)c0=(c0&1)?(0xEDB88320^(c0>>>1)):(c0>>>1);CRC_T[n]=c0>>>0;}}
    var c=0xFFFFFFFF;for(var i=0;i<u8.length;i++)c=CRC_T[(c^u8[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0;
  }
  function deflateRawBytes(u8){
    if(typeof CompressionStream==='undefined')return Promise.resolve(null);
    try{
      var s=new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      return new Response(s).arrayBuffer().then(function(b){return new Uint8Array(b);}).catch(function(){return null;});
    }catch(e){return Promise.resolve(null);}
  }
  function entryBytes(buf,f){
    var dv=new DataView(buf),nlen=dv.getUint16(f.lho+26,true),xlen=dv.getUint16(f.lho+28,true),st=f.lho+30+nlen+xlen;
    var raw=new Uint8Array(buf,st,f.csize);
    if(f.method===0)return Promise.resolve(new Uint8Array(raw));
    if(f.method===8)return inflateRaw(raw);
    return Promise.reject(new Error('Неподдерживаемое сжатие в xlsx.'));
  }
  function xlsxIndex(buf){
    var files=readZip(buf);
    return Promise.all([entryText(buf,files['xl/workbook.xml']),entryText(buf,files['xl/_rels/workbook.xml.rels'])]).then(function(r){
      var wb=xml(r[0]),rels=xml(r[1]),relMap={},rl=tags(rels,'Relationship'),paths={};
      for(var k=0;k<rl.length;k++){var tg=rl[k].getAttribute('Target')||'';relMap[rl[k].getAttribute('Id')]=tg.charAt(0)==='/'?tg.slice(1):'xl/'+tg;}
      var sh=tags(wb,'sheet');
      for(var j=0;j<sh.length;j++){
        var rid=sh[j].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh[j].getAttribute('r:id');
        paths[sh[j].getAttribute('name')]=relMap[rid];
      }
      return {files:files,paths:paths};
    });
  }
  function u16(n){return [n&255,(n>>>8)&255];}
  function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];}
  function buildZip(entries){
    var enc=new TextEncoder(),chunks=[],central=[],offset=0;
    return Promise.all(entries.map(function(e){return deflateRawBytes(e.data);})).then(function(comps){
      var now=new Date(),dt=((now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1))&0xFFFF,dd=(((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate())&0xFFFF;
      entries.forEach(function(e,i){
        var name=enc.encode(e.name),data=e.data,comp=comps[i],method=comp?8:0,payload=comp||data,crc=crc32(data);
        var lh=[0x50,0x4b,3,4].concat(u16(20),u16(0x0800),u16(method),u16(dt),u16(dd),u32(crc),u32(payload.length),u32(data.length),u16(name.length),u16(0));
        chunks.push(new Uint8Array(lh),name,payload);
        central.push({name:name,method:method,crc:crc,csize:payload.length,usize:data.length,off:offset,dt:dt,dd:dd});
        offset+=lh.length+name.length+payload.length;
      });
      var cdStart=offset,cdParts=[];
      central.forEach(function(c){
        var ch=[0x50,0x4b,1,2].concat(u16(20),u16(20),u16(0x0800),u16(c.method),u16(c.dt),u16(c.dd),u32(c.crc),u32(c.csize),u32(c.usize),u16(c.name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(c.off));
        cdParts.push(new Uint8Array(ch),c.name);offset+=ch.length+c.name.length;
      });
      var eocd=[0x50,0x4b,5,6].concat(u16(0),u16(0),u16(central.length),u16(central.length),u32(offset-cdStart),u32(cdStart),u16(0));
      var all=chunks.concat(cdParts,[new Uint8Array(eocd)]),total=0;all.forEach(function(a){total+=a.length;});
      var out=new Uint8Array(total),p=0;all.forEach(function(a){out.set(a,p);p+=a.length;});
      return out;
    });
  }
  function xe(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');}
  function colLetter(i){var s='';i++;while(i>0){var m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26);}return s;}
  // edit: {hdrRow (1-based), cols, rows:[[...]], numCols:[индексы колонок с числами], pad: число пустых подготовленных строк}
  function patchSheet(xmlText,edit){
    var m=/<sheetData\s*\/>|<sheetData>([\s\S]*?)<\/sheetData>/.exec(xmlText);
    if(!m)throw new Error('В листе нет данных (sheetData).');
    var inner=m[1]||'',keep=[],styles={},gotStyles=false,re=/<row\b[^>]*?\br="(\d+)"[^>]*?(?:\/>|>[\s\S]*?<\/row>)/g,r;
    while((r=re.exec(inner))){
      if(+r[1]<=edit.hdrRow){keep.push(r[0]);}
      else if(!gotStyles){
        var cre=/<c\b[^>]*?\br="([A-Z]+)\d+"[^>]*?\bs="(\d+)"/g,c;
        while((c=cre.exec(r[0])))styles[c[1]]=c[2];
        gotStyles=Object.keys(styles).length>0;
      }
    }
    var out=[],rn=edit.hdrRow,num=edit.numCols||[];
    function cellXml(L,rowN,v,isNum){
      var st=styles[L]?' s="'+styles[L]+'"':'';
      if(v===undefined||v===null||v==='')return st?'<c r="'+L+rowN+'"'+st+'/>':'';
      v=String(v);
      if(isNum&&/^\d+(\.\d+)?$/.test(v))return '<c r="'+L+rowN+'"'+st+'><v>'+v+'</v></c>';
      return '<c r="'+L+rowN+'"'+st+' t="inlineStr"><is><t xml:space="preserve">'+xe(v)+'</t></is></c>';
    }
    edit.rows.forEach(function(vals){
      rn++;var cells=[];
      for(var ci=0;ci<edit.cols;ci++)cells.push(cellXml(colLetter(ci),rn,vals[ci],num.indexOf(ci)>=0));
      out.push('<row r="'+rn+'">'+cells.join('')+'</row>');
    });
    var lastData=rn;
    if(gotStyles){for(var k=0;k<(edit.pad||0);k++){rn++;var pc=[];for(var cj=0;cj<edit.cols;cj++)pc.push(cellXml(colLetter(cj),rn,'',false));out.push('<row r="'+rn+'">'+pc.join('')+'</row>');}}
    var lastCol=colLetter(Math.max(0,edit.cols-1));
    var res=xmlText.slice(0,m.index)+'<sheetData>'+keep.join('')+out.join('')+'</sheetData>'+xmlText.slice(m.index+m[0].length);
    res=res.replace(/<dimension\s+ref="[^"]*"\s*\/>/,'<dimension ref="A1:'+lastCol+Math.max(lastData,edit.hdrRow)+'"/>');
    res=res.replace(/<autoFilter\s+ref="[^"]*"/,'<autoFilter ref="A'+edit.hdrRow+':'+lastCol+Math.max(lastData,edit.hdrRow)+'"');
    return res;
  }
  function buildXlsx(buf,edits){
    return xlsxIndex(buf).then(function(ix){
      var names=Object.keys(ix.files);
      return Promise.all(names.map(function(n){return entryBytes(buf,ix.files[n]);})).then(function(datas){
        var entries=names.map(function(n,i){return {name:n,data:datas[i]};}),dec=new TextDecoder('utf-8'),enc=new TextEncoder();
        Object.keys(edits).forEach(function(sn){
          var path=ix.paths[sn];if(!path)throw new Error('В файле нет листа «'+sn+'».');
          var e=entries.filter(function(x){return x.name===path;})[0];
          if(!e)throw new Error('Не найден файл листа «'+sn+'» ('+path+').');
          e.data=enc.encode(patchSheet(dec.decode(e.data),edits[sn]));
        });
        return buildZip(entries);
      });
    });
  }

  // новый лист: spec={name, header:[...], rows:[[...]], widths:[...], styleFrom:'ТТ', seriesCol:0, seriesList:[...]}
  function sheetXmlNew(sp,st){
    var cols=sp.header.length,ws=sp.widths||[],out=[];
    function sty(map,L){return map[L]?' s="'+map[L]+'"':'';}
    function cell(L,rn,v,map){
      if(v===undefined||v===null||v==='')return map[L]?'<c r="'+L+rn+'"'+sty(map,L)+'/>':'';
      return '<c r="'+L+rn+'"'+sty(map,L)+' t="inlineStr"><is><t xml:space="preserve">'+xe(String(v))+'</t></is></c>';
    }
    var hdr='';for(var i=0;i<cols;i++)hdr+=cell(colLetter(i),1,sp.header[i],st.hdr);
    out.push('<row r="1">'+hdr+'</row>');
    var rn=1;
    (sp.rows||[]).forEach(function(r){rn++;var c='';for(var j=0;j<cols;j++)c+=cell(colLetter(j),rn,r[j],st.col);out.push('<row r="'+rn+'">'+c+'</row>');});
    var last=rn;
    if(Object.keys(st.col).length){for(var k=0;k<300;k++){rn++;var pc='';for(var q=0;q<cols;q++)pc+=cell(colLetter(q),rn,'',st.col);out.push('<row r="'+rn+'">'+pc+'</row>');}}
    var lastCol=colLetter(cols-1),colsXml='<cols>';
    for(var w=0;w<cols;w++)colsXml+='<col min="'+(w+1)+'" max="'+(w+1)+'" width="'+(ws[w]||18)+'" customWidth="1"/>';
    colsXml+='</cols>';
    var dv='';
    if(sp.seriesCol!=null&&sp.seriesCol>=0&&sp.seriesList&&sp.seriesList.length){
      var L0=colLetter(sp.seriesCol);
      dv='<dataValidations count="1"><dataValidation type="list" allowBlank="1" sqref="'+L0+'2:'+L0+(Math.max(last,1)+400)+'"><formula1>"'+xe(sp.seriesList.join(','))+'"</formula1></dataValidation></dataValidations>';
    }
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:'+lastCol+Math.max(last,1)+'"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>'+colsXml+'<sheetData>'+out.join('')+'</sheetData><autoFilter ref="A1:'+lastCol+Math.max(last,1)+'"/>'+dv+'</worksheet>';
  }
  function addSheets(buf,specs){
    return xlsxIndex(buf).then(function(ix){
      var names=Object.keys(ix.files);
      return Promise.all(names.map(function(n){return entryBytes(buf,ix.files[n]);})).then(function(datas){
        var entries=names.map(function(n,i){return {name:n,data:datas[i]};}),dec=new TextDecoder('utf-8'),enc=new TextEncoder();
        function get(n){return entries.filter(function(e){return e.name===n;})[0];}
        var ct=get('[Content_Types].xml'),wb=get('xl/workbook.xml'),rl=get('xl/_rels/workbook.xml.rels');
        if(!ct||!wb||!rl)throw new Error('В файле нет служебных частей xlsx.');
        var ctx=dec.decode(ct.data),wbx=dec.decode(wb.data),rx=dec.decode(rl.data);
        var maxFile=0,maxSid=0,maxRid=0;
        names.forEach(function(n){var m=/^xl\/worksheets\/sheet(\d+)\.xml$/.exec(n);if(m)maxFile=Math.max(maxFile,+m[1]);});
        wbx.replace(/sheetId="(\d+)"/g,function(a,d){maxSid=Math.max(maxSid,+d);return a;});
        rx.replace(/Id="rId(\d+)"/g,function(a,d){maxRid=Math.max(maxRid,+d);return a;});
        var added=[];
        specs.forEach(function(sp){
          if(ix.paths[sp.name])return;                 // такой лист уже есть — не трогаем
          maxFile++;maxSid++;maxRid++;
          var path='xl/worksheets/sheet'+maxFile+'.xml',st={hdr:{},col:{}},src=ix.paths[sp.styleFrom];
          if(src&&get(src)){
            var sx=dec.decode(get(src).data),r1=/<row\b[^>]*?\br="1"[^>]*>([\s\S]*?)<\/row>/.exec(sx),r2=/<row\b[^>]*?\br="2"[^>]*>([\s\S]*?)<\/row>/.exec(sx),c;
            if(r1){var a1=/<c\b[^>]*?\br="([A-Z]+)1"[^>]*?\bs="(\d+)"/g;while((c=a1.exec(r1[1])))st.hdr[c[1]]=c[2];}
            if(r2){var a2=/<c\b[^>]*?\br="([A-Z]+)2"[^>]*?\bs="(\d+)"/g;while((c=a2.exec(r2[1])))st.col[c[1]]=c[2];}
          }
          entries.push({name:path,data:enc.encode(sheetXmlNew(sp,st))});
          ctx=ctx.replace('</Types>','<Override PartName="/'+path+'" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
          wbx=wbx.replace('</sheets>','<sheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" name="'+xe(sp.name)+'" sheetId="'+maxSid+'" r:id="rId'+maxRid+'"/></sheets>');
          rx=rx.replace('</Relationships>','<Relationship Id="rId'+maxRid+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+maxFile+'.xml"/></Relationships>');
          added.push(sp.name);
        });
        ct.data=enc.encode(ctx);wb.data=enc.encode(wbx);rl.data=enc.encode(rx);
        return buildZip(entries).then(function(bytes){return {bytes:bytes,added:added};});
      });
    });
  }

  /* ---------- разбор листов ---------- */
  function norm(s){return String(s==null?'':s).replace(/ё/g,'е').replace(/Ё/g,'Е').trim();}
  function sheetKey(s){return norm(s).toLowerCase();}
  function findSheet(sheets,wanted){
    var w=sheetKey(wanted);
    for(var n in sheets){if(sheetKey(n)===w)return n;}
    for(var m in sheets){if(sheetKey(m).indexOf(w)===0)return m;}
    return null;
  }
  function mapHeader(row){
    var m={series:-1,number:-1,depot:-1,place:-1,comment:-1};
    (row||[]).forEach(function(t,i){
      var s=sheetKey(t);
      if(m.series<0&&/сери/.test(s))m.series=i;
      else if(m.number<0&&/(номер|№)/.test(s))m.number=i;
      else if(m.depot<0&&/(приписк|депо)/.test(s))m.depot=i;
      else if(m.place<0&&/(мест|осмотр)/.test(s))m.place=i;
      else if(m.comment<0&&/(коммент|примеч)/.test(s))m.comment=i;
    });
    return m;
  }
  function depotOf(series,number){
    try{
      if(typeof LOCOMOTIVE_DATA==='undefined'||!series||!number)return '';
      var tbl=LOCOMOTIVE_DATA[series];
      return(tbl&&tbl[number])?tbl[number]:'';
    }catch(e){return '';}
  }
  // справочник «приписка → места осмотра»: лист «Места осмотра», запасной вариант — данные, встроенные в приложение
  function placesMap(){
    if(store.places)return store.places;
    var map={},nm=store.data?findSheet(store.data,PLACES_SHEET):null;
    if(nm){
      var rows=store.data[nm],start=0;
      if(rows[0]&&/приписк|депо/.test(sheetKey(rows[0][0])))start=1;
      for(var i=start;i<rows.length;i++){
        var r=rows[i];if(!r)continue;var d=norm(r[0]),p=norm(r[1]);
        if(d&&p){(map[d]=map[d]||[]);if(map[d].indexOf(p)<0)map[d].push(p);}
      }
    }
    try{if(!nm&&typeof DEPOT_PLACES!=='undefined'){for(var k in DEPOT_PLACES)map[k]=DEPOT_PLACES[k].slice();}}catch(e){}
    store.places=map;return map;
  }
  function parseEntries(rows){
    var out=[],hdrAt=0,pm=placesMap();
    for(var i=0;i<Math.min(rows.length,10);i++){if(rows[i]&&mapHeader(rows[i]).number>=0){hdrAt=i;break;}}
    var m=mapHeader(rows[hdrAt]||[]);
    if(m.number<0){m={series:0,number:1,depot:2,place:3,comment:4};}
    for(var r=hdrAt+1;r<rows.length;r++){
      var row=rows[r];if(!row)continue;
      var g=function(i){return i>=0?norm(row[i]):'';};
      var e={series:g(m.series),number:g(m.number),depot:g(m.depot),place:g(m.place),comment:g(m.comment)};
      if(!e.series&&!e.number&&!e.depot&&!e.place)continue;
      if(!e.depot)e.depot=depotOf(e.series,e.number);
      e.row=r+1;
      e.explicitPlace=!!e.place;
      e.places=e.place?[e.place]:((e.depot&&pm[e.depot])?pm[e.depot]:[]);
      e.hay=sheetKey([e.series,e.number,e.depot,e.places.join(' '),e.comment].join(' | '));
      out.push(e);
    }
    return out;
  }
  // номер в ячейке может быть: 746 | 591-620 | 591; 600; 650 | пусто (вся серия)
  function numberMatches(cell,n){
    n=norm(n);if(!n)return false;
    if(!cell)return true;
    var parts=cell.split(/[;,\s]+/);
    for(var i=0;i<parts.length;i++){
      var p=parts[i];if(!p)continue;
      if(p===n)return true;
      var rg=/^(\d+)\s*[-–—]\s*(\d+)$/.exec(p);
      if(rg&&/^\d+$/.test(n)){var v=+n;if(v>=+rg[1]&&v<=+rg[2])return true;}
    }
    return false;
  }
  function searchMatches(e,q){
    q=sheetKey(q);if(!q)return true;
    if(/^\d+$/.test(q)){
      if(e.number===''){ // правило для всей серии: подходит только если такой номер есть в этой серии
        if(!e.series)return true;
        try{if(typeof LOCOMOTIVE_DATA!=='undefined'&&LOCOMOTIVE_DATA[e.series])return !!LOCOMOTIVE_DATA[e.series][q];}catch(_){}
        return true;
      }
      return numberMatches(e.number,q)||e.number.toLowerCase().indexOf(q)>=0;
    }
    return e.hay.indexOf(q)>=0;
  }

  /* ---------- загрузка файла ---------- */
  function fmtStamp(h){if(!h)return '';var d=new Date(h);return isNaN(d)?'':d.toLocaleString('ru-RU');}
  function sigOf(buf){var u=new Uint8Array(buf),h=u.length;for(var i=0;i<u.length;i+=61)h=(h*31+u[i])|0;return u.length+':'+h;}
  function load(force){
    if(store.loading)return store.loading;
    if(store.data&&!force)return Promise.resolve(store.data);
    store.lastTry=Date.now();
    store.loading=fetch(FILE+'?v='+Date.now(),{cache:'no-store'}).then(function(resp){
      if(!resp.ok)throw new Error('Файл '+FILE+' не найден на сервере (код '+resp.status+'). Положите его рядом с index.html.');
      store.stamp=fmtStamp(resp.headers.get('last-modified'));
      return resp.arrayBuffer();
    }).then(function(buf){store.newSig=sigOf(buf);return parseXlsx(buf);}).then(function(sheets){
      store.sig=store.newSig;store.data=sheets;store.cache={};store.places=null;store.milCache=null;store.error=null;return sheets;
    }).catch(function(e){
      store.error=(e&&e.message)||String(e);
      if(location.protocol==='file:')store.error='Файл нельзя прочитать при открытии с диска (file://). Откройте приложение с сайта или установите его на телефон.';
      throw e;
    }).then(function(x){store.loading=null;return x;},function(e){store.loading=null;throw e;});
    return store.loading;
  }


  function entriesFor(mode){
    if(!store.data)return [];
    if(store.cache[mode])return store.cache[mode];
    var name=findSheet(store.data,SHEET_BY_MODE[mode]||'');
    return(store.cache[mode]=name?parseEntries(store.data[name]):[]);
  }

  /* ---------- справочник локомотивов для самих чек-листов ----------
     Перед запуском чек-листа его встроенные LOCOMOTIVE_DATA / DEPOT_PLACES заменяются
     данными из zona_riska.xlsx. Если файл не прочитан — остаётся встроенный список. */
  var LAT2CYR={A:'А',B:'В',C:'С',E:'Е',H:'Н',K:'К',M:'М',O:'О',P:'Р',T:'Т',X:'Х'};
  function normSeries(s){
    s=String(s==null?'':s).replace(/\s+/g,'').toUpperCase().replace(/Ё/g,'Е');
    return s.replace(/[A-Z]/g,function(c){return LAT2CYR[c]||c;});   // латинские «двойники» → кириллица
  }
  function builtinSeries(){
    try{if(typeof LOCOMOTIVE_DATA!=='undefined'){var k=Object.keys(LOCOMOTIVE_DATA);if(k.length)return k;}}catch(e){}
    return ['2ЭС5К','3ЭС5К','4ЭС5К'];
  }
  function builtinPlaces(){try{if(typeof DEPOT_PLACES!=='undefined')return DEPOT_PLACES;}catch(e){}return {};}
  function flat(s){return String(s||'').replace(/\s+/g,' ').trim().toLowerCase();}
  function buildRegistry(mode){
    var entries=entriesFor(mode);if(!entries.length)return null;
    var allowed=builtinSeries(),pm=placesMap(),bp=builtinPlaces(),canon={};
    Object.keys(pm).concat(Object.keys(bp)).forEach(function(d){canon[flat(d)]=canon[flat(d)]||d;});
    var loco={},lp={},places={},issues=[],seen={},count=0,warnedDepot={};
    allowed.forEach(function(s){loco[s]={};});
    entries.forEach(function(e){
      var ser=normSeries(e.series),num=String(e.number||'').replace(/\s+/g,''),dep0=String(e.depot||'').replace(/\s+/g,' ').trim(),row='строка '+e.row;
      if(!ser&&!num&&!dep0)return;
      if(!ser||!num){issues.push(row+': не указана серия или номер — строка пропущена');return;}
      if(allowed.indexOf(ser)<0){issues.push(row+': серия «'+e.series+'» не поддерживается чек-листом (допустимы: '+allowed.join(', ')+') — строка пропущена');return;}
      if(!dep0){issues.push(row+': у локомотива '+ser+' № '+num+' не указана приписка — строка пропущена');return;}
      var key=ser+'|'+num;
      if(seen[key]){issues.push(row+': '+ser+' № '+num+' уже есть в строке '+seen[key]+' — повтор пропущен');return;}
      seen[key]=e.row;
      var dep=canon[flat(dep0)]||dep0;
      loco[ser][num]=dep;count++;
      if(e.place)lp[key]=e.place;
      if(!places[dep])places[dep]=(pm[dep]&&pm[dep].length?pm[dep]:(bp[dep]||[])).slice();
      if(!places[dep].length&&!e.place&&!warnedDepot[dep]){warnedDepot[dep]=1;issues.push(row+': для приписки «'+dep+'» нет мест осмотра на листе «'+PLACES_SHEET+'» — список мест будет пуст');}
    });
    Object.keys(pm).forEach(function(d){if(!places[d])places[d]=pm[d].slice();});
    allowed.forEach(function(s){if(!Object.keys(loco[s]).length)delete loco[s];});
    if(!count)return null;
    return {loco:loco,places:places,lp:lp,issues:issues,count:count};
  }
  /* ---------- правила «какие узлы осматривать» (лист «Узлы») ---------- */
  function hdrRules(row){
    var m={sheet:-1,series:-1,number:-1,depot:-1,mode:-1,nodes:-1,comment:-1};
    (row||[]).forEach(function(t,i){
      var s=sheetKey(t);
      if(m.sheet<0&&/(чек|лист)/.test(s))m.sheet=i;
      else if(m.series<0&&/сери/.test(s))m.series=i;
      else if(m.number<0&&/(номер|№)/.test(s))m.number=i;
      else if(m.depot<0&&/(приписк|депо)/.test(s))m.depot=i;
      else if(m.mode<0&&/(режим|действ)/.test(s))m.mode=i;
      else if(m.nodes<0&&/узл/.test(s))m.nodes=i;
      else if(m.comment<0&&/(коммент|примеч)/.test(s))m.comment=i;
    });
    return m;
  }
  function ruleMode(v){var s=sheetKey(v);return(/^(кроме|искл|без|не )/.test(s))?'except':'only';}
  function buildRules(mode){
    var out={rules:[],issues:[]};
    var nm=store.data?findSheet(store.data,NODES_SHEET):null;if(!nm)return out;
    var rows=store.data[nm],hi=0,m;
    for(var i=0;i<Math.min(rows.length,10);i++){if(rows[i]&&hdrRules(rows[i]).nodes>=0){hi=i;break;}}
    m=hdrRules(rows[hi]||[]);
    if(m.nodes<0){m={sheet:0,series:1,number:2,depot:3,mode:4,nodes:5,comment:6};}
    var want=sheetKey(SHEET_BY_MODE[mode]||''),allowed=builtinSeries(),pm=placesMap(),bp=builtinPlaces(),canon={};
    Object.keys(pm).concat(Object.keys(bp)).forEach(function(d){canon[flat(d)]=canon[flat(d)]||d;});
    for(var r=hi+1;r<rows.length;r++){
      var row=rows[r];if(!row)continue;
      var g=function(i){return i>=0?norm(row[i]):'';};
      var sh=g(m.sheet),sk=sheetKey(sh);
      if(!g(m.nodes)&&!g(m.series)&&!g(m.number)&&!g(m.depot)&&!sh)continue;
      if(sk&&sk.indexOf('все')!==0&&sk!==want)continue;     // правило для другого чек-листа
      var rowN='строка '+(r+1)+' (лист «'+NODES_SHEET+'»)';
      var nodes=g(m.nodes).split(/[;\n]+/).map(function(x){return norm(x);}).filter(Boolean);
      if(!nodes.length){out.issues.push(rowN+': не указаны узлы — правило пропущено');continue;}
      var ser=g(m.series)?normSeries(g(m.series)):'';
      if(ser&&allowed.indexOf(ser)<0){out.issues.push(rowN+': серия «'+g(m.series)+'» не поддерживается — правило пропущено');continue;}
      var dep=g(m.depot),depC=dep?(canon[flat(dep)]||dep):'';
      if(dep&&!canon[flat(dep)])out.issues.push(rowN+': приписка «'+dep+'» не найдена в списке мест осмотра — правило может не сработать');
      out.rules.push({series:ser,number:g(m.number).replace(/\s+/g,''),depot:depC,mode:ruleMode(g(m.mode)),nodes:nodes,row:r+1});
    }
    return out;
  }
  // текст для окна «Зона риска»: какие узлы относятся к этому локомотиву
  function nodeRulesText(mode,e){
    var rs=(store.rules[mode]||[]),only=[],deny=[];
    rs.forEach(function(r){
      if(r.series&&r.series!==normSeries(e.series))return;
      if(r.number&&!numberMatches(r.number,e.number))return;
      if(r.depot&&flat(r.depot)!==flat(e.depot))return;
      (r.mode==='except'?deny:only).push.apply(r.mode==='except'?deny:only,r.nodes);
    });
    var t=[];if(only.length)t.push('осматривать только: '+only.join('; '));if(deny.length)t.push('не осматривать: '+deny.join('; '));
    return t.join(' · ');
  }
  function reportNodeIssues(mode,list){if(mode)store.nodeIssues[mode]=list||[];}
  /* ---------- оборудование из конструктора (oborudovanie.json) ---------- */
  var CUSTOM_FILE='oborudovanie.json';
  function cleanStr(v){return String(v==null?'':v).replace(/[<>]/g,'').replace(/\s+/g,' ').trim();}   // < и > вырезаются: названия попадают в разметку чек-листа
  function cleanText(v){return String(v==null?'':v).replace(/\r/g,'').trim();}
  function slug(v){return String(v||'').toLowerCase().replace(/[^a-z0-9_]/g,'_').replace(/^_+|_+$/g,'');}
  // приводит описание к безопасному виду; возвращает {list, issues}
  function cleanCustom(raw){
    var out=[],issues=[],seenId={};
    var arr=(raw&&raw.equipment)?raw.equipment:(Array.isArray(raw)?raw:[]);
    arr.forEach(function(e,i){
      var title=cleanStr(e&&e.title),id=slug(e&&e.id);
      if(!id||!title){issues.push('Оборудование №'+(i+1)+': нет названия или идентификатора — пропущено');return;}
      if(seenId[id]){issues.push('Оборудование «'+title+'»: повторяется идентификатор '+id+' — пропущено');return;}
      seenId[id]=1;
      var ly=e.layout||{},scope=(ly.scope==='cabins'||ly.scope==='boosters')?ly.scope:'all';
      var blocks=(Array.isArray(ly.blocks)?ly.blocks:[]).map(cleanStr).filter(Boolean);
      var count=Math.max(1,Math.min(30,parseInt(ly.count,10)||1));
      var fields=[],seenKey={};
      (Array.isArray(e.fields)?e.fields:[]).forEach(function(f,j){
        var key=slug(f&&f.key),label=cleanStr(f&&f.label);
        if(!key||!label){issues.push('«'+title+'», поле №'+(j+1)+': нет названия или ключа — пропущено');return;}
        if(seenKey[key]){issues.push('«'+title+'», поле «'+label+'»: повторяется ключ '+key+' — пропущено');return;}
        seenKey[key]=1;
        var type=(f.type==='select')?'select':'text',options=[],ok=[];
        if(type==='select'){
          options=(Array.isArray(f.options)?f.options:[]).map(cleanStr).filter(function(x,k,a){return x&&a.indexOf(x)===k;});
          if(!options.length){issues.push('«'+title+'», поле «'+label+'»: список без вариантов — пропущено');return;}
          ok=(Array.isArray(f.ok)?f.ok:[]).map(cleanStr).filter(function(x){return options.indexOf(x)>=0;});
        }
        var photo=(f.photo==='always'||f.photo==='never')?f.photo:'deviation';
        fields.push({key:key,label:label,type:type,options:options,ok:ok,photo:photo,calc:f.calc!==false,hint:cleanText(f.hint),explain:cleanText(f.explain)});
      });
      if(!fields.length){issues.push('Оборудование «'+title+'»: нет ни одного поля — пропущено');return;}
      if(fields.length>30)issues.push('Оборудование «'+title+'»: полей '+fields.length+', а в выгрузку Excel попадают только первые 30 операций — разделите узел на два');
      var inComplex=Array.isArray(e.checklists)?(e.checklists.indexOf('complex')>=0):true;
      out.push({id:id,title:title,checklists:inComplex?['complex']:[],layout:{scope:scope,blocks:blocks,count:count},fields:fields});
    });
    var ck=cleanChecklists((raw&&raw.checklists)||[],out.map(function(e){return e.id;}));
    return {list:out,checklists:ck.list,issues:issues.concat(ck.issues)};
  }
  var BUILTIN_EQ=[
    {id:'vb8',title:'Выключатель быстродействующий ВБ-8'},{id:'bvv',title:'БВВ-057'},{id:'mk9',title:'Контактор МК-9'},{id:'re16t',title:'РЭ16Т'},
    {id:'nvmontazh',title:'Низковольтный электрический монтаж'},{id:'rassekatel',title:'Рассекатель'},{id:'shina',title:'Силовой электрический монтаж — шинный монтаж'},
    {id:'gres',title:'Главный резервуар'},{id:'kps',title:'КПС-0,5-38'},{id:'nb514',title:'НБ-514Е — щёткодержатель'},{id:'housings',title:'Кожуха'},
    {id:'msud',title:'Система МСУД-015'},{id:'las023',title:'Токоприёмник ЛАС-023 — рукав пневмопривода'}];
  var RESERVED_SHEETS=['инструкция','тт','би','гидродемпферы','комплексный','кмб','узлы','список узлов','пробег','места осмотра'];
  function cleanSheetName(v){return String(v==null?'':v).replace(/[\[\]:*?\/\\<>]/g,'').replace(/\s+/g,' ').trim().slice(0,31);}
  // описания чек-листов, созданных в конструкторе
  function cleanChecklists(arr,equipIds){
    var out=[],issues=[],seenId={},seenSheet={},known={};
    BUILTIN_EQ.forEach(function(b){known[b.id]=1;});equipIds.forEach(function(i){known[i]=1;});
    (Array.isArray(arr)?arr:[]).forEach(function(c,i){
      var title=cleanStr(c&&c.title),id=slug(c&&c.id);
      if(id&&id.indexOf('k_')!==0)id='k_'+id;
      if(!id||!title){issues.push('Чек-лист №'+(i+1)+': нет названия или идентификатора — пропущен');return;}
      if(seenId[id]){issues.push('Чек-лист «'+title+'»: повторяется идентификатор '+id+' — пропущен');return;}
      var sheet=cleanSheetName(c.sheet||title);
      if(!sheet){issues.push('Чек-лист «'+title+'»: не задано название листа Excel — пропущен');return;}
      if(RESERVED_SHEETS.indexOf(sheet.toLowerCase())>=0){issues.push('Чек-лист «'+title+'»: название листа «'+sheet+'» занято служебным листом — выберите другое');return;}
      if(seenSheet[sheet.toLowerCase()]){issues.push('Чек-лист «'+title+'»: лист «'+sheet+'» уже используется другим чек-листом — пропущен');return;}
      var eq=[];
      (Array.isArray(c.equipment)?c.equipment:[]).forEach(function(x){var k=slug(x);if(!known[k]){issues.push('Чек-лист «'+title+'»: неизвестное оборудование «'+x+'» — убрано');return;}if(eq.indexOf(k)<0)eq.push(k);});
      if(!eq.length){issues.push('Чек-лист «'+title+'»: не выбрано ни одного оборудования — пропущен');return;}
      seenId[id]=1;seenSheet[sheet.toLowerCase()]=1;
      var icon=cleanStr(c.icon).slice(0,4)||'🔧';
      out.push({id:id,title:title,subtitle:cleanStr(c.subtitle),icon:icon,sheet:sheet,equipment:eq});
    });
    return {list:out,issues:issues};
  }
  /* ---------- режимы (чек-листы из конструктора) на стартовом экране ---------- */
  function applyModes(list){
    list=list||[];
    window.__CUSTOM_MODES__=list;
    list.forEach(function(m){SHEET_BY_MODE[m.id]=m.sheet;TITLE_BY_MODE[m.id]=m.title;});
  }
  function registerOuter(){
    var list=window.__CUSTOM_MODES__||[];
    list.forEach(function(m){
      try{if(typeof ALL_MODES!=='undefined'&&ALL_MODES.indexOf(m.id)<0)ALL_MODES.push(m.id);}catch(e){}
      try{if(typeof EMBEDDED_MODES!=='undefined'&&EMBEDDED_MODES.indexOf(m.id)<0)EMBEDDED_MODES.push(m.id);}catch(e){}
      try{if(typeof MODE_NAMES!=='undefined')MODE_NAMES[m.id]='Чек-лист '+m.title;}catch(e){}
    });
  }
  function renderModeButtons(){
    registerOuter();
    var modal=document.getElementById('modeSelectModal');if(!modal)return;
    var box=modal.querySelector('.modal > div[style*="flex-direction:column"]');if(!box)return;
    [].slice.call(box.querySelectorAll('.mode-custom')).forEach(function(b){b.remove();});
    (window.__CUSTOM_MODES__||[]).forEach(function(m){
      var b=document.createElement('button');b.className='btn primary mode-card-btn mode-custom';b.id='mode_'+m.id;b.type='button';
      var head=document.createElement('span');head.className='mode-card-head';head.appendChild(document.createTextNode(m.icon+' '));
      var bold=document.createElement('b');bold.textContent=m.title;head.appendChild(bold);b.appendChild(head);
      if(m.subtitle){var sm=document.createElement('small');sm.textContent=m.subtitle;b.appendChild(sm);}
      b.onclick=function(){if(typeof selectModeAndStart==='function')selectModeAndStart(m.id);};
      box.appendChild(b);
    });
  }
  function modeInfo(mode){
    var arr=(window.__RISK_CORE__&&window.__RISK_CORE__.devChecklists)||store.checklists||[];
    for(var i=0;i<arr.length;i++){if(arr[i].id===mode)return arr[i];}
    return null;
  }
  function loadCustom(){
    return fetch(CUSTOM_FILE+'?v='+Date.now(),{cache:'no-store'}).then(function(resp){
      if(resp.status===404){store.custom=[];store.checklists=[];applyModes([]);try{localStorage.removeItem('custom_modes_v1');}catch(e){}renderModeButtons();store.customError=null;store.customLoaded=true;return [];}
      if(!resp.ok)throw new Error('Файл '+CUSTOM_FILE+': код '+resp.status);
      store.customStamp=fmtStamp(resp.headers.get('last-modified'));
      return resp.json();
    }).then(function(j){
      if(!j)return [];
      var c=cleanCustom(j);store.custom=c.list;store.checklists=c.checklists;store.customError=null;store.customLoaded=true;
      store.issues.custom=c.issues;
      var modes=c.checklists.map(function(k){return {id:k.id,title:k.title,subtitle:k.subtitle,icon:k.icon,sheet:k.sheet};});
      applyModes(modes);try{localStorage.setItem('custom_modes_v1',JSON.stringify(modes));}catch(e){}
      renderModeButtons();return c.list;
    }).catch(function(e){store.customError=(e&&e.message)||String(e);return store.custom;});
  }
  /* ---------- пробег (лист «Пробег»): минимальный пробег от постройки, км ---------- */
  function hdrMileage(row){
    var h={series:-1,number:-1,km:-1};
    (row||[]).forEach(function(t,i){
      var s=sheetKey(t);
      if(h.series<0&&/сери/.test(s))h.series=i;
      else if(h.number<0&&/(номер|№)/.test(s))h.number=i;
      else if(h.km<0&&/(пробег|км)/.test(s))h.km=i;
    });
    return h;
  }
  function buildMileage(){
    if(store.milCache)return store.milCache;
    var out={found:false,table:{},issues:[],count:0};
    var nm=store.data?findSheet(store.data,MILEAGE_SHEET):null;
    if(!nm){return(store.milCache=out);}
    var rows=store.data[nm],hi=0,m;
    for(var i=0;i<Math.min(rows.length,10);i++){if(rows[i]&&hdrMileage(rows[i]).km>=0){hi=i;break;}}
    m=hdrMileage(rows[hi]||[]);if(m.km<0)m={series:0,number:1,km:2};
    var allowed=builtinSeries();
    out.found=true;
    for(var r=hi+1;r<rows.length;r++){
      var row=rows[r];if(!row)continue;
      var ser=normSeries(row[m.series]),num=norm(row[m.number]).replace(/\s+/g,''),raw=norm(row[m.km]);
      if(!ser&&!num&&!raw)continue;
      var rowN='строка '+(r+1)+' (лист «'+MILEAGE_SHEET+'»)';
      if(!ser||!num){out.issues.push(rowN+': не указана серия или номер — строка пропущена');continue;}
      if(allowed.indexOf(ser)<0){out.issues.push(rowN+': серия «'+row[m.series]+'» не поддерживается — строка пропущена');continue;}
      if(!raw)continue;                                   // пустой пробег = минимума нет
      var km=raw.replace(/[\s\u00a0]/g,'').replace(',','.');
      if(!/^\d+(\.\d+)?$/.test(km)){out.issues.push(rowN+': пробег «'+raw+'» не является числом — строка пропущена');continue;}
      var key=ser+'_'+num;
      if(Object.prototype.hasOwnProperty.call(out.table,key)){out.issues.push(rowN+': '+ser+' № '+num+' уже есть выше — повтор пропущен');continue;}
      out.table[key]=Math.floor(parseFloat(km));out.count++;
    }
    return(store.milCache=out);
  }
  function mileageFor(series,number){
    var t=buildMileage(),key=normSeries(series)+'_'+norm(number).replace(/\s+/g,''),v;
    if(t.found)v=t.table[key];
    else{try{if(typeof MILEAGE_DATA!=='undefined')v=MILEAGE_DATA[key];}catch(e){}}   // файла/листа нет — встроенная таблица
    return(v==null)?null:v;
  }
  function safeJson(o){return JSON.stringify(o).replace(/</g,'\\u003c');}
  function replaceConst(html,name,json,extra){
    var m=new RegExp('const\\s+'+name+'\\s*=\\s*\\{').exec(html);if(!m)return null;
    var i=m.index+m[0].length-1,d=0;
    for(;i<html.length;i++){var c=html.charAt(i);if(c==='{')d++;else if(c==='}'){d--;if(d===0)break;}}
    var end=i+1;if(html.charAt(end)===';')end++;
    return html.slice(0,m.index)+'const '+name+'='+json+';'+(extra||'')+html.slice(end);
  }
  function applyRegistry(html,mode){
    try{
      var reg=buildRegistry(mode),rl=buildRules(mode),ml=buildMileage();
      store.rules[mode]=rl.rules;
      store.issues[mode]=(reg?reg.issues:[]).concat(rl.issues,ml.issues);store.used[mode]=false;
      // сведения для самого чек-листа: откуда взят список (чтобы он мог объяснить, почему номер не найден)
      var sheet=SHEET_BY_MODE[mode]||'',info={source:'builtin',reason:'file',sheet:sheet,count:0,mileage:!!ml.found};
      if(store.data){if(!findSheet(store.data,sheet))info.reason='sheet';else if(!reg)info.reason='empty';else{info.source='excel';info.reason='ok';info.count=reg.count;}}
      var extra='\nconst NODE_RULES='+safeJson(rl.rules)+';\nconst REGISTRY_INFO='+safeJson(info)+';';
      var chk=modeInfo(mode);
      if(mode==='complex'||chk){var cu=(window.__RISK_CORE__&&window.__RISK_CORE__.devOverride)||store.custom||[];extra+='\nconst CUSTOM_EQUIPMENT='+safeJson(cu)+';';if(chk)extra+='\nconst CUSTOM_CHECKLIST='+safeJson(chk)+';';}
      var hasMil=/const\s+MILEAGE_DATA\s*=/.test(html),milTable=null;
      if(ml.found)milTable=ml.table;else{try{if(typeof MILEAGE_DATA!=='undefined')milTable=MILEAGE_DATA;}catch(e){}}
      if(!hasMil&&milTable)extra+='\nconst MILEAGE_DATA='+safeJson(milTable)+';';   // ТТ и БИ: своей таблицы нет — передаём
      var out=html;
      if(reg){
        var a=replaceConst(out,'LOCOMOTIVE_DATA',safeJson(reg.loco),'');
        var b=a&&replaceConst(a,'DEPOT_PLACES',safeJson(reg.places),'\nconst LOCOMOTIVE_PLACES='+safeJson(reg.lp)+';'+extra);
        if(b){out=b;extra=null;store.used[mode]=true;}
      }
      if(extra!==null)out=out.replace(/<script(?![^>]*\bsrc=)[^>]*>/,function(t){return t+extra;});   // список не подменяли — передаём только правила и сведения
      if(ml.found&&hasMil){var mm=replaceConst(out,'MILEAGE_DATA',safeJson(ml.table),'');if(mm)out=mm;}   // таблица пробега — из Excel
      return out;
    }catch(e){console.warn('[zona_riska] не удалось применить справочник',e);return html;}
  }

  // перечитать файл перед запуском чек-листа (не дольше ms миллисекунд — иначе используем то, что есть)
  function ready(ms){
    var p=Promise.all([load(true).catch(function(){}),loadCustom().catch(function(){})]);
    return Promise.race([p,new Promise(function(r){setTimeout(r,ms||2500);})]);
  }
  // долго открытая вкладка (компьютер): при возврате на неё проверяем, не изменился ли файл
  document.addEventListener('visibilitychange',function(){
    if(document.hidden||store.loading||Date.now()-store.lastTry<60000||!store.data)return;
    var before=store.sig;
    load(true).then(function(){
      if(before&&store.sig&&store.sig!==before&&typeof showToast==='function')showToast('📄 Файл zona_riska.xlsx обновлён. Изменения применятся при следующем открытии чек-листа.');
    },function(){});
  });
  window.__cmIds=function(){return(window.__CUSTOM_MODES__||[]).map(function(m){return m.id;});};
  // режимы из конструктора, известные с прошлого запуска: нужны сразу, чтобы открылся последний выбранный чек-лист
  try{var __cm=JSON.parse(localStorage.getItem('custom_modes_v1')||'[]');if(Array.isArray(__cm))applyModes(__cm);}catch(e){}
  document.addEventListener('DOMContentLoaded',function(){renderModeButtons();loadCustom().catch(function(){});});
  window.__RISK_CORE__={store:store,load:load,ready:ready,applyRegistry:applyRegistry,entriesFor:entriesFor,findSheet:findSheet,
    norm:norm,sheetKey:sheetKey,numberMatches:numberMatches,searchMatches:searchMatches,placesMap:placesMap,parseXlsx:parseXlsx,
    FILE:FILE,SHEET_BY_MODE:SHEET_BY_MODE,TITLE_BY_MODE:TITLE_BY_MODE,INSTR_SHEET:INSTR_SHEET,nodeRulesText:nodeRulesText,reportNodeIssues:reportNodeIssues,NODES_SHEET:NODES_SHEET,loadCustom:loadCustom,applyModes:applyModes,renderModeButtons:renderModeButtons,cleanChecklists:cleanChecklists,BUILTIN_EQ:BUILTIN_EQ,devChecklists:null,mileageFor:mileageFor,xlsx:{index:xlsxIndex,build:buildXlsx,addSheets:addSheets,sigOf:sigOf,entryBytes:entryBytes},normSeries:normSeries,builtinSeries:builtinSeries,flat:flat,MILEAGE_SHEET:MILEAGE_SHEET,cleanCustom:cleanCustom,CUSTOM_FILE:CUSTOM_FILE,devOverride:null};
})();
