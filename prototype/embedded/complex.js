// Lazily loaded standalone HTML source for complex and housing checklist modes.
export default `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#0a5eb0">
<meta name="format-detection" content="telephone=no">
<title>Чек-лист — Комплексный / Кожуха</title>
<script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"><\/script>
<script>
/* Режим передаётся родителем: window.parent.__EMBEDDED_MODE__ */
(function(){
    try{
        var m='complex';
        if(window.parent&&window.parent!==window&&window.parent.__EMBEDDED_MODE__){
            m=window.parent.__EMBEDDED_MODE__;
        }
        window.__MODE__=(m==='housings')?'housings':(/^k_/.test(String(m))?m:'complex');
    }catch(e){window.__MODE__='complex';}
})();
<\/script>
<script>
(function(){try{var t=localStorage.getItem('checklist_theme_v1');if(t!=='tmh'&&t!=='standard'&&t!=='dark')t='tmh';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','tmh');}})();
<\/script>
<style>
:root{--bg:#eef4fb;--panel:#ffffff;--panel2:#f2f7fc;--line:#cfe0f0;--ink:#16324f;--ink-dim:#6d84a0;--amber:#2f7dd6;--amber-dim:#1a5bb8;--ok:#1f9d55;--bad:#d1453b;--info:#2f7dd6;--gold:#d4a017;--gold-light:#f9f0d0;--mono:'JetBrains Mono','Consolas',monospace;--sans:'Inter','Segoe UI',system-ui,sans-serif;}
html[data-theme="tmh"]{--bg:#f0f6fc;--panel:#ffffff;--panel2:#e8f2fb;--line:#c6def2;--ink:#0c2f52;--ink-dim:#5c7a99;--amber:#0a5eb0;--amber-dim:#083f78;--ok:#1f9d55;--bad:#d1453b;--info:#1a86d9;--gold:#d4a017;--gold-light:#f9f0d0;}
html[data-theme="tmh"] .topbar{background:linear-gradient(180deg,#0a5eb0,#0c4a8c 92%);border-bottom:2px solid #083058;}
html[data-theme="tmh"] .topbar .brand .title-block h1{color:#fff;}
html[data-theme="tmh"] .topbar .brand .title-block small{color:#cfe4f7;}
html[data-theme="tmh"] .topbar .brand .tag{background:#fff;color:#0a5eb0;}
html[data-theme="tmh"] .topbar .brand .logo-block .tmh-logo .tmh{color:#fff;}
html[data-theme="tmh"] .topbar .brand .logo-block .tmh-logo .tmh-sub{color:#cfe4f7;}
html[data-theme="tmh"] .topbar .brand .logo-block .nevz-logo .nevz{color:#fff;}
html[data-theme="tmh"] .topbar .brand .logo-block .nevz-logo .nevz-sub{color:#cfe4f7;}
html[data-theme="tmh"] .topbar .brand .logo-block .divider{background:#ffffff40;}
html[data-theme="tmh"] .stat{color:#cfe4f7;border-left-color:#ffffff30;}
html[data-theme="tmh"] .stat b{color:#fff;}
html[data-theme="tmh"] .stat.bad b{color:#ffd6d1;}
html[data-theme="tmh"] .stat.ok b{color:#c9f5da;}
html[data-theme="tmh"] .user-info{color:#cfe4f7;border-left-color:#ffffff30;}
html[data-theme="tmh"] .user-info .role{color:#fff;}
html[data-theme="tmh"] .user-info .logout-btn{border-color:#ffffff40;color:#cfe4f7;}
html[data-theme="tmh"] .user-info .logout-btn:hover{border-color:#ffd6d1;color:#ffd6d1;}
html[data-theme="tmh"] .theme-switch{border-color:#ffffff40;background:#ffffff1a;}
html[data-theme="tmh"] .theme-switch button{color:#cfe4f7;}
html[data-theme="tmh"] .theme-switch button.active{background:#fff;color:#0a5eb0;}
html[data-theme="tmh"] body{background:linear-gradient(180deg,#e4f0fb,#f5fafd 520px);}
html[data-theme="tmh"] .card{border-color:#b9d7f0;}
html[data-theme="tmh"] .field input,html[data-theme="tmh"] .field select{border-color:#b9d7f0;}
html[data-theme="tmh"] .picker-wrap{border-color:#b9d7f0;}
html[data-theme="tmh"] .chip{background:#e6f1fb;border-color:#b9d7f0;color:#456a8c;}
html[data-theme="tmh"] .chip .n{background:#0a5eb01f;color:#0a5eb0;}
html[data-theme="tmh"] .chip.active{background:var(--amber);color:#fff;border-color:var(--amber);box-shadow:0 2px 12px rgba(10,94,176,0.6);}
html[data-theme="tmh"] .chip.active .n{background:#ffffff30;color:#fff;}
html[data-theme="tmh"] .equip{border-color:#b9d7f0;box-shadow:0 2px 10px #0a5eb012;}
html[data-theme="tmh"] .equip>.eh{background:linear-gradient(90deg,#0a5eb0,#0c4a8c 120%);border-bottom-color:#083058;}
html[data-theme="tmh"] .equip>.eh h2{color:#fff;}
html[data-theme="tmh"] .equip>.eh .badge{color:#cfe4f7;}
html[data-theme="tmh"] .sec+.sec{border-top-color:#c6def2;}
html[data-theme="tmh"] .sec h3{color:#0a5eb0;}
html[data-theme="tmh"] .grp .gh{color:#3f6690;}
html[data-theme="tmh"] .inst{background:#f2f8fd;border-color:#c6def2;}
html[data-theme="tmh"] .inst .ih .lbl{color:#0c2f52;}
html[data-theme="tmh"] .pill.na{background:#dcebf8;color:#456a8c;}
html[data-theme="tmh"] .frow select,html[data-theme="tmh"] .frow input[type=text]{border-color:#c6def2;}
html[data-theme="tmh"] .frow.auto .val{border-color:#c6def2;}
html[data-theme="tmh"] .footbar{background:#eaf3fbee;border-top-color:#b9d7f0;box-shadow:0 -2px 14px #0a5eb01a;}
html[data-theme="tmh"] button.btn{border-color:#b9d7f0;}
html[data-theme="tmh"] .select-type-message{border-color:#0a5eb0;background:#eef6fc;}
html[data-theme="tmh"] .modal{border-color:#0a5eb0;}
html[data-theme="tmh"] ::selection{background:#0a5eb0;color:#fff;}
html[data-theme="tmh"] .mk84-warning{background:#fce8e6;border-left-color:#d1453b;}
html[data-theme="tmh"] .sec-wrapper .sec-header{background:var(--panel2);border-bottom:1px solid var(--line);}
html[data-theme="tmh"] .sec-wrapper .sec-header .sec-toggle-icon{color:var(--amber);}
html[data-theme="standard"] .chip,html[data-theme="dark"] .chip{background:#0a5eb01f;border-color:#0a5eb0;color:#0a5eb0;}
html[data-theme="standard"] .chip .n,html[data-theme="dark"] .chip .n{background:#0a5eb01f;color:#0a5eb0;}
html[data-theme="standard"] .chip.active,html[data-theme="dark"] .chip.active{background:#0a5eb0;color:#fff;box-shadow:0 2px 8px #0a5eb0;}
html[data-theme="standard"] .chip.active .n,html[data-theme="dark"] .chip.active .n{background:#ffffff30;}
html[data-theme="dark"]{--bg:#12181f;--panel:#1a222c;--panel2:#212b37;--line:#2c3a48;--ink:#e8edf2;--ink-dim:#8ea0b0;--amber:#3f8ce0;--amber-dim:#1d5f9c;--ok:#3fae6a;--bad:#d9553f;--info:#3f8ce0;--gold:#d4a017;--gold-light:#f9f0d0;}
html[data-theme="dark"] .topbar{background:linear-gradient(180deg,#0d1218,#141b23 90%);}
html[data-theme="dark"] .topbar .brand .logo-block .nevz-logo .nevz{color:var(--ink);}
html[data-theme="dark"] .topbar .brand .logo-block .tmh-logo .tmh-sub,html[data-theme="dark"] .topbar .brand .logo-block .nevz-logo .nevz-sub{color:#9fb3c6;}
html[data-theme="dark"] .chip .n{background:#ffffff14;}
html[data-theme="dark"] .chip.active .n{background:#ffffff30;}
html[data-theme="dark"] .inst{background:#161d25;}
html[data-theme="dark"] .pill.na{background:#2c3a48;color:var(--ink-dim);}
html[data-theme="dark"] .pill.ok{background:#173425;color:var(--ok);}
html[data-theme="dark"] .pill.bad{background:#3a1f1a;color:var(--bad);}
html[data-theme="dark"] .frow{border-top-color:#ffffff0c;}
html[data-theme="dark"] .footbar{background:#0d1218ee;box-shadow:0 -2px 12px #00000040;}
html[data-theme="dark"] .toast{color:#0d1a12;}
html[data-theme="dark"] .theme-switch{background:var(--panel2);}
html[data-theme="dark"] ::selection{background:var(--amber-dim);color:#fff;}
html[data-theme="dark"] .mk84-warning{background:#3a1f1a;border-left-color:#d9553f;}
html[data-theme="dark"] .sec-wrapper .sec-header{background:var(--panel2);border-bottom:1px solid var(--line);}
.field input.error{border-color:var(--bad)!important;box-shadow:0 0 0 2px rgba(209,69,59,0.3);}
.field .error-hint{display:none;font-size:11px;color:var(--bad);margin-top:2px;}
.field .error-hint.show{display:block;}
.theme-switch{display:flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:20px;padding:2px;background:var(--panel2);margin-left:14px;}
.theme-switch button{font-family:var(--sans);font-size:11px;font-weight:600;border:none;background:transparent;color:var(--ink-dim);padding:6px 12px;border-radius:16px;cursor:pointer;transition:.15s;}
.theme-switch button.active{background:var(--amber);color:#fff;}
.theme-switch button:not(.active):hover{color:var(--ink);}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-text-size-adjust:100%;text-size-adjust:100%;}
body{padding-bottom:120px;max-width:100vw;}
button,.chip,select,input{touch-action:manipulation;}
::selection{background:var(--amber-dim);color:#fff;}
.red-after{color:red;}
.topbar{position:relative;z-index:60;background:linear-gradient(180deg,#fff,#dceafc 90%);border-bottom:2px solid var(--amber-dim);padding:10px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.topbar .brand{display:flex;align-items:center;gap:14px;margin-right:auto;}
.topbar .brand .logo-block{display:flex;align-items:center;gap:12px;}
.topbar .brand .logo-block .tmh-logo{display:flex;flex-direction:column;align-items:center;line-height:1.1;}
.topbar .brand .logo-block .tmh-logo .tmh{font-family:var(--mono);font-weight:700;font-size:18px;letter-spacing:.05em;color:#2f7dd6;}
.topbar .brand .logo-block .tmh-logo .tmh-sub{font-size:7px;font-weight:600;color:#6d84a0;letter-spacing:.08em;text-transform:uppercase;}
.topbar .brand .logo-block .divider{width:2px;height:40px;background:var(--line);}
.topbar .brand .logo-block .nevz-logo{display:flex;flex-direction:column;align-items:center;line-height:1.15;}
.topbar .brand .logo-block .nevz-logo .nevz{font-family:var(--mono);font-weight:700;font-size:14px;letter-spacing:.05em;color:#16324f;}
.topbar .brand .logo-block .nevz-logo .nevz-sub{font-size:6.5px;font-weight:600;color:#6d84a0;letter-spacing:.06em;text-transform:uppercase;text-align:center;}
.topbar .brand .tag{font-family:var(--mono);font-weight:700;font-size:13px;letter-spacing:.12em;color:var(--bg);background:var(--amber);padding:4px 8px;border-radius:3px;}
.topbar .brand .title-block h1{font-size:15px;margin:0;font-weight:600;color:var(--ink);}
.topbar .brand .title-block small{display:block;color:var(--ink-dim);font-size:11px;margin-top:1px;}
.stat{font-family:var(--mono);font-size:12px;color:var(--ink-dim);border-left:1px solid var(--line);padding-left:14px;}
.stat b{display:block;font-size:18px;color:var(--ink);font-weight:700;line-height:1.1;}
.stat.bad b{color:var(--bad);}
.stat.ok b{color:var(--ok);}
.stat-bar{position:sticky;top:0;z-index:55;display:flex;align-items:center;gap:0;background:var(--panel);border-bottom:1px solid var(--line);box-shadow:0 2px 10px rgba(10,42,77,0.10);padding:5px 12px;padding-top:max(5px,env(safe-area-inset-top));padding-left:max(12px,env(safe-area-inset-left));padding-right:max(12px,env(safe-area-inset-right));overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.stat-bar::-webkit-scrollbar{display:none;}
.mini-stat{display:flex;align-items:baseline;gap:5px;flex-shrink:0;padding:3px 11px;border-right:1px solid var(--line);white-space:nowrap;}
.mini-stat:last-of-type{border-right:none;}
.mini-stat b{font-family:var(--mono);font-weight:700;font-size:14.5px;color:var(--ink);}
.mini-stat span{font-size:10px;color:var(--ink-dim);text-transform:uppercase;letter-spacing:.03em;}
.mini-stat.ok b{color:var(--ok);}
.mini-stat.bad b{color:var(--bad);}
.mini-stat.fill{margin-left:auto;padding-right:0;}
.mini-stat.fill b{color:var(--amber);}
.mini-progress{position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--line);}
.mini-progress-fill{height:100%;width:0%;background:var(--amber);transition:width .25s ease;}
.btnrow{display:flex;gap:8px;flex-wrap:wrap;}
button.btn{font-family:var(--sans);font-size:12.5px;font-weight:600;background:var(--panel2);color:var(--ink);border:1px solid var(--line);padding:8px 12px;border-radius:6px;cursor:pointer;transition:.15s;}
button.btn:hover{border-color:var(--amber);color:var(--amber);}
button.btn.primary{background:var(--amber);color:#fff;border-color:var(--amber);}
button.btn.primary:hover{background:#5b9ce8;color:#fff;}
button.btn.danger:hover{border-color:var(--bad);color:var(--bad);}
button.btn:disabled{opacity:0.4;cursor:not-allowed;}
.wrap{max-width:1180px;margin:0 auto;padding:22px 20px 0;}
.section-title{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--amber);margin:34px 0 10px;display:flex;align-items:center;gap:10px;}
.section-title::after{content:"";flex:1;height:1px;background:var(--line);}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px;}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;}
.field{display:flex;flex-direction:column;gap:5px;}
.field label{font-size:11.5px;color:var(--ink-dim);font-weight:600;}
.field input,.field select{background:var(--panel2);border:1px solid var(--line);color:var(--ink);padding:9px 10px;border-radius:6px;font-size:13.5px;font-family:var(--sans);}
.field input:focus,.field select:focus{outline:none;border-color:var(--amber);}
.field input:disabled,.field select:disabled{opacity:0.55;cursor:not-allowed;background:var(--line);}
.field select.auto-filled{background:var(--panel2);color:var(--ink);font-weight:600;}
.field .hint-lock{font-size:11px;color:var(--ink-dim);margin-top:2px;}
.picker{display:flex;flex-wrap:wrap;gap:8px;}
.chip{font-size:12.5px;padding:8px 13px;border-radius:20px;border:1px solid var(--line);background:var(--panel2);color:var(--ink-dim);cursor:pointer;user-select:none;transition:.15s;display:flex;align-items:center;gap:7px;}
.chip .n{font-family:var(--mono);font-size:10.5px;background:#0a2a4d14;padding:1px 6px;border-radius:8px;}
.chip.active{background:var(--amber);color:#fff;border-color:var(--amber);font-weight:600;}
.chip.active .n{background:#ffffff30;}
.chip:hover{border-color:var(--amber);}
.equip{margin-top:22px;background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;}
.equip>.eh{padding:14px 18px;background:var(--panel2);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);}
.equip>.eh h2{font-size:14.5px;margin:0;font-weight:700;}
.equip>.eh .badge{font-family:var(--mono);font-size:11px;color:var(--ink-dim);}
.sec{padding:16px 18px;}
.sec+.sec{border-top:1px dashed var(--line);}
.sec h3{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--info);margin:0 0 12px;font-family:var(--mono);}
.grp{margin-bottom:16px;}
.grp .gh{font-size:12px;color:var(--ink-dim);margin-bottom:8px;font-weight:600;}
.inst{border:1px solid var(--line);border-left:3px solid var(--line);border-radius:8px;padding:12px 14px;margin-bottom:10px;background:#f7fafd;transition:.2s;}
.inst.flag-ok{border-left-color:var(--ok);}
.inst.flag-bad{border-left-color:var(--bad);}
.inst .ih{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;flex-wrap:wrap;}
.inst .ih .lbl{font-family:var(--mono);font-size:12.5px;color:var(--ink);font-weight:700;}
.inst .ih .sub{font-size:11px;color:var(--ink-dim);}
.pill{font-family:var(--mono);font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:.03em;}
.pill.na{background:#e2ecf7;color:var(--ink-dim);}
.pill.ok{background:#e1f7ea;color:var(--ok);}
.pill.bad{background:#fce8e6;color:var(--bad);}
.frow{display:grid;grid-template-columns:minmax(200px,1.4fr) minmax(160px,1fr);gap:10px 16px;align-items:start;padding:6px 0;border-top:1px solid #0a2a4d12;transition:border-color .2s,background .2s;}
.frow.photo-required-field{border-left:3px solid var(--bad);padding-left:8px;background:#fce8e640;}
.frow.photo-required-field select,.frow.photo-required-field input{border-color:var(--bad)!important;box-shadow:0 0 0 2px rgba(209,69,59,0.25);}
.frow:first-of-type{border-top:none;}
.frow .flabel{font-size:12.5px;color:var(--ink);padding-top:8px;line-height:1.35;}
.frow .flabel .hint{display:block;font-size:11px;color:var(--ink-dim);font-weight:400;margin-top:4px;padding:4px 8px;background:var(--panel2);border-radius:4px;border-left:3px solid var(--amber);}
.frow .flabel .legend{display:block;font-size:11px;color:var(--bad);font-weight:600;margin-top:2px;line-height:1.4;}
.frow select,.frow input[type=text]{width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--ink);padding:8px 9px;border-radius:6px;font-size:13px;font-family:var(--sans);transition:border-color .2s,background .2s;}
.frow select:focus,.frow input:focus{outline:none;border-color:var(--amber);}
.frow select:disabled,.frow input[type=text]:disabled{opacity:0.55;cursor:not-allowed;background:var(--line);}
.frow select.bad-select{border-color:var(--bad)!important;background:#fce8e6!important;}
html[data-theme="dark"] .frow select.bad-select{background:#3a1f1a!important;border-color:#d9553f!important;}
.frow-ok select{border-color:var(--ok)!important;background:#e1f7ea;}
.frow-bad select{border-color:var(--bad)!important;background:#fce8e6;}
.frow.auto .flabel{color:var(--amber);font-weight:600;}
.frow.auto .val{padding:8px 10px;border-radius:6px;font-family:var(--mono);font-size:12.5px;font-weight:700;background:var(--panel2);border:1px solid var(--line);}
.frow.auto .val.bad{color:var(--bad);border-color:var(--bad);}
.frow.auto .val.ok{color:var(--ok);border-color:var(--ok);}
.frow.auto .val.na{color:var(--ink-dim);}
.mk84-warning{display:none;color:var(--bad);font-size:12px;font-weight:600;margin-top:4px;padding:6px 10px;background:#fce8e6;border-radius:4px;border-left:3px solid var(--bad);grid-column:1/-1;}
html[data-theme="dark"] .mk84-warning{background:#3a1f1a;border-left-color:#d9553f;}
.inst.mk84-detected{border-left-color:var(--bad)!important;background:var(--panel2);}
.inst.mk84-detected .ih .lbl::after{content:" ⚠️ МК-84";color:var(--bad);font-weight:700;}
.photo-area{margin-top:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.photo-preview{width:70px;height:70px;object-fit:cover;border-radius:4px;border:1px solid var(--line);background:var(--panel2);cursor:pointer;transition:transform .2s;}
.photo-preview:hover{transform:scale(1.05);}
.photo-btn{font-size:12px;padding:4px 10px;cursor:pointer;background:var(--panel2);border:1px solid var(--line);color:var(--ink);border-radius:4px;font-family:var(--sans);transition:all .2s;white-space:nowrap;}
.photo-btn:hover{border-color:var(--amber);}
.photo-btn.photo-required{border-color:var(--bad);background:#ffe0db;animation:blink-border 1s infinite;}
@keyframes blink-border{0%{border-color:var(--bad);box-shadow:0 0 0 0 rgba(209,69,59,0.4);}50%{border-color:#ff0000;box-shadow:0 0 0 6px rgba(209,69,59,0);}100%{border-color:var(--bad);box-shadow:0 0 0 0 rgba(209,69,59,0.4);}}
.photo-delete{color:var(--bad);border-color:var(--bad);background:none;font-size:12px;padding:2px 8px;border-radius:4px;cursor:pointer;margin-left:4px;}
.photo-modal-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;cursor:pointer;}
.photo-modal-overlay.active{display:flex;}
.photo-modal{max-width:90vw;max-height:90vh;position:relative;cursor:default;}
.photo-modal img{max-width:100%;max-height:90vh;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.6);}
.photo-modal-close{position:absolute;top:-40px;right:0;background:none;border:none;color:#fff;font-size:32px;cursor:pointer;padding:8px 12px;line-height:1;transition:transform .2s;}
.photo-modal-close:hover{transform:scale(1.2);}
.sec-wrapper{border-bottom:1px solid var(--line);}
.sec-wrapper:last-child{border-bottom:none;}
.sec-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;cursor:pointer;user-select:none;background:var(--panel2);border-bottom:1px solid var(--line);transition:background .15s;font-weight:600;font-size:14px;}
.sec-header:hover{background:var(--line);}
.sec-header .sec-toggle-icon{font-size:14px;color:var(--amber);transition:transform .25s;}
.sec-header .sec-toggle-icon.collapsed{transform:rotate(-90deg);}
.sec-body{padding:0;overflow:hidden;transition:max-height .3s ease;}
.sec-body.collapsed{display:none;}
.sec-body .sec{border-top:none;padding:16px 18px;}
.scroll-top-btn{position:fixed;bottom:80px;right:20px;width:48px;height:48px;border-radius:50%;background:var(--amber);color:#fff;border:none;box-shadow:0 4px 14px rgba(0,0,0,0.25);font-size:24px;cursor:pointer;z-index:100;opacity:0;pointer-events:none;transition:opacity .3s,transform .2s;display:flex;align-items:center;justify-content:center;font-weight:700;line-height:1;}
.scroll-top-btn.visible{opacity:1;pointer-events:auto;}
.scroll-top-btn:hover{transform:scale(1.05);background:var(--amber-dim);}
@media print{.scroll-top-btn{display:none!important;}.sec-body.collapsed{display:block!important;}.sec-header{display:none!important;}}
.footbar{position:relative;bottom:0;left:0;right:0;z-index:40;background:#ffffffee;backdrop-filter:blur(6px);border-top:1px solid var(--line);box-shadow:0 -2px 12px #0a2a4d10;padding:10px 20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
#iframeHost{position:fixed;inset:0;z-index:500;background:var(--bg);flex-direction:column;}
#iframeBar{display:flex;align-items:center;gap:12px;background:#ffffffee;backdrop-filter:blur(6px);border-bottom:1px solid var(--line);box-shadow:0 2px 12px #0a2a4d10;padding:10px 16px;padding-top:max(10px,env(safe-area-inset-top));font-family:var(--sans);}
#iframeModeLabel{font-size:13.5px;color:var(--ink);letter-spacing:.02em;}
html[data-theme="tmh"] #iframeBar{background:linear-gradient(180deg,#0a5eb0,#0c4a8c 92%);border-bottom:2px solid #083058;box-shadow:none;}
html[data-theme="tmh"] #iframeModeLabel{color:#fff;}
html[data-theme="dark"] #iframeBar{background:#0d1218ee;border-bottom:1px solid var(--line);box-shadow:0 2px 12px #00000040;}
#embeddedFrame{flex:1;border:0;width:100%;background:#fff;}
.toast{position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:var(--ok);color:#0d1a12;font-weight:700;font-size:12.5px;padding:9px 16px;border-radius:8px;opacity:0;pointer-events:none;transition:.25s;z-index:60;}
.toast.show{opacity:1;transform:translateX(-50%) translateY(-6px);}
.nav-btn{background:var(--gold);color:#fff;border:none;padding:8px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:background .2s;box-shadow:0 2px 8px rgba(212,160,23,0.3);margin-bottom:16px;border:none;}
.nav-btn:hover{background:#b88a14;}
.nav-btn .badge{background:#e74c3c;border-radius:20px;padding:0 10px;font-size:14px;font-weight:700;}
.notice-list{background:var(--panel);border:1px solid var(--gold);border-radius:8px;padding:6px 0;margin-bottom:20px;box-shadow:0 4px 12px rgba(0,0,0,0.06);display:none;}
.notice-list.show{display:block;}
.notice-list .item{padding:10px 18px;border-bottom:1px solid #f0f0f0;cursor:pointer;transition:background .15s;display:flex;justify-content:space-between;align-items:center;font-size:14px;}
.notice-list .item:hover{background:var(--panel2);}
.notice-list .item:last-child{border-bottom:none;}
.notice-list .item .highlight{color:var(--gold);font-weight:700;}
.notice-list .empty{color:var(--ink-dim);text-align:center;padding:18px;font-size:14px;}
.notice-badge{display:inline-block;background:var(--gold-light);color:#8a6d0b;border-left:4px solid var(--gold);padding:4px 14px;border-radius:4px;font-weight:600;font-size:13px;margin-top:8px;cursor:pointer;}
.notice-badge:hover{background:#f5e6b0;}
.inst.notice-needed{border-color:var(--gold);box-shadow:0 0 0 2px var(--gold),0 4px 12px rgba(212,160,23,0.2);background:#fefcf5;}
html[data-theme="dark"] .inst.notice-needed{border-color:var(--gold);box-shadow:0 0 0 2px var(--gold),0 4px 12px rgba(212,160,23,0.2);background:#2a2418;}
@media (max-width:640px){.frow{grid-template-columns:1fr;}.topbar{padding:8px 12px;gap:8px;}.topbar .brand{gap:8px;}.topbar .brand .logo-block .nevz-logo .nevz-sub{display:none;}.topbar .brand .logo-block .tmh-logo .tmh-sub{display:none;}.topbar .brand .logo-block .divider{height:26px;}.topbar .brand .title-block h1{font-size:12.5px;}.topbar .brand .title-block small{font-size:9.5px;}.theme-switch{margin-left:0;}.mini-stat{padding:3px 8px;}.mini-stat b{font-size:13px;}.mini-stat span{font-size:9px;}.field input,.field select,.frow select,.frow input[type=text]{font-size:16px;padding:10px 10px;}button.btn{min-height:44px;padding:10px 14px;}.chip{min-height:40px;padding:9px 14px;}.theme-switch button{min-height:36px;padding:8px 10px;}.field input,.field select,.frow select{min-height:44px;}.footbar{padding:8px 10px;padding-bottom:max(8px,env(safe-area-inset-bottom));gap:8px;}.footbar .btn{flex:1 1 auto;min-width:0;}.wrap{padding:16px 12px 0;}.card{padding:14px;}.section-title{margin:24px 0 8px;}.sec-header{font-size:13px;padding:10px 14px;}.scroll-top-btn{bottom:75px;right:12px;width:42px;height:42px;font-size:20px;}.photo-modal{max-width:95vw;}.notice-list .item{font-size:13px;padding:8px 14px;}.nav-btn{font-size:13px;padding:6px 16px;}.nav-btn .badge{font-size:13px;}}
@media (max-width:380px){.topbar .brand .tag{font-size:11px;padding:3px 6px;}.mini-stat{padding:3px 6px;}}
.select-type-message{margin-top:22px;background:var(--panel);border:2px solid var(--amber);border-radius:10px;padding:40px 20px;text-align:center;color:var(--ink-dim);}
.select-type-message .icon{font-size:48px;margin-bottom:16px;display:block;}
.select-type-message .title{font-size:20px;font-weight:600;color:var(--amber);margin-bottom:8px;}
.select-type-message .sub{font-size:14px;color:var(--ink-dim);}
.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:1000;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(4px);display:none;}
.modal{background:var(--panel);border:2px solid var(--amber);border-radius:12px;padding:35px 40px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5);}
.modal h2{margin:0 0 8px 0;color:var(--amber);font-size:24px;}
.modal p{color:var(--ink-dim);margin-bottom:24px;font-size:14px;}
.modal .field{margin-bottom:16px;}
.modal .field label{display:block;font-size:12px;color:var(--ink-dim);font-weight:600;margin-bottom:4px;}
.modal .field input{width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--ink);padding:10px 12px;border-radius:6px;font-size:14px;margin-top:0;}
.modal .field input:focus{outline:none;border-color:var(--amber);}
.modal .btn-row{display:flex;gap:10px;margin-top:10px;}
.modal .btn-row button{flex:1;padding:10px 16px;}
.modal .error{color:var(--bad);font-size:13px;margin-top:8px;display:none;text-align:center;}
.modal .error.show{display:block;}
.user-info{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ink-dim);border-left:1px solid var(--line);padding-left:14px;}
.user-info .role{font-weight:600;color:var(--amber);}
.user-info .role.dim{color:var(--ink-dim);}
.user-info .logout-btn{background:none;border:1px solid var(--line);color:var(--ink-dim);padding:3px 10px;border-radius:4px;cursor:pointer;font-size:11px;font-family:var(--sans);}
.user-info .logout-btn:hover{border-color:var(--bad);color:var(--bad);}
.sub-fields{margin-top:8px;padding-left:10px;border-left:2px solid var(--line);display:none;}
.sub-fields.show{display:block;}
.sub-fields .frow{border-top:1px solid var(--line);padding:6px 0;}
.sub-fields .frow:first-of-type{border-top:none;}
.frow .control-wrap{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.frow .control-wrap select,.frow .control-wrap input[type=text]{flex:1 1 120px;min-width:80px;}
.frow .control-wrap .sub-sn{flex:1 1 120px;min-width:80px;}
.sub-info{font-size:11px;color:var(--bad);font-weight:600;display:block;margin-top:2px;}
.kps-select-all-btn{font-size:12px;padding:4px 12px;background:var(--panel2);border:1px solid var(--line);border-radius:4px;cursor:pointer;margin-left:12px;font-family:var(--sans);color:var(--ink);}
.kps-select-all-btn:hover{border-color:var(--amber);}
.frow.unfilled-highlight,.field.unfilled-highlight{box-shadow:0 0 0 3px var(--gold)!important;background:var(--gold-light)!important;border-radius:6px;animation:pulseHighlight 1.2s ease-in-out 3;position:relative;z-index:2;}
.field.unfilled-highlight{padding:6px;}
html[data-theme="dark"] .frow.unfilled-highlight,html[data-theme="dark"] .field.unfilled-highlight{background:#2a2418!important;}
@keyframes pulseHighlight{0%,100%{box-shadow:0 0 0 3px var(--gold);}50%{box-shadow:0 0 0 8px rgba(212,160,23,0.3);}}
#btnFindUnfilled{background:var(--gold);color:#fff;border-color:var(--gold);}
#btnFindUnfilled:hover{background:#b88a14;border-color:#b88a14;color:#fff;}
#btnFindUnfilled .badge-find{background:rgba(255,255,255,0.25);border-radius:10px;padding:0 7px;margin-left:4px;font-size:11px;font-weight:700;}

/* ===== Кнопка выбора чек-листа в topbar ===== */
.mode-picker-btn{
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:7px 14px;
    border-radius:20px;
    border:1px solid var(--line);
    background:var(--panel2);
    color:var(--ink);
    font-family:var(--sans);
    font-size:12px;
    font-weight:600;
    cursor:pointer;
    transition:.15s;
    line-height:1;
    white-space:nowrap;
    flex-shrink:0;
}
.mode-picker-btn:hover{
    border-color:var(--amber);
    color:var(--amber);
    background:var(--panel);
}
.mode-picker-btn .ico{
    font-size:14px;
    line-height:1;
}
html[data-theme="tmh"] .mode-picker-btn{
    color:#cfe4f7;
    border-color:#ffffff40;
    background:#ffffff1a;
}
html[data-theme="tmh"] .mode-picker-btn:hover{
    color:#fff;
    border-color:#ffffff80;
    background:#ffffff30;
}
@media (max-width:640px){
    .mode-picker-btn{
        padding:8px 12px;
        min-height:36px;
        font-size:11.5px;
    }
    .mode-picker-btn .ico{
        font-size:13px;
    }
}

/* ===== Карточки выбора чек-листа в модалке ===== */
.mode-card-btn{display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:16px 18px!important;font-size:14px!important;line-height:1.4!important;border-radius:10px!important;width:100%;position:relative;}
.mode-card-btn small{display:block;font-weight:400;font-size:11.5px;opacity:0.92;margin-top:6px;line-height:1.45;}
.mode-card-btn .mode-card-head{display:flex;align-items:center;gap:4px;}
.mode-card-btn.active{
    box-shadow:0 0 0 3px var(--amber),0 4px 16px rgba(10,94,176,0.3);
}
.mode-card-btn.active .mode-card-head::after{
    content:"✓ АКТИВНЫЙ";
    display:inline-block;
    margin-left:10px;
    font-size:9.5px;
    font-weight:700;
    letter-spacing:.08em;
    background:#ffffff30;
    padding:3px 8px;
    border-radius:10px;
    vertical-align:middle;
}
</style>
</head>
<body>
<div id="nativeApp">
<div class="topbar">
    <div class="brand">
        <div class="logo-block">
            <div class="tmh-logo"><span class="tmh">ТМХ</span><span class="tmh-sub">трансмашхолдинг</span></div>
            <div class="divider"></div>
            <div class="nevz-logo"><span class="nevz">НЭВЗ</span><span class="nevz-sub">новочеркасский<br>электровозостроительный<br>завод</span></div>
        </div>
        <span class="tag" id="locomotiveTypeTag">—</span>
        <div class="title-block">
            <h1 id="modeTitle">Чек-лист проверки при выполнении ТР-50, ТР-250, ТР-500</h1>
            <small id="modeSubtitle">Осмотр производится по локомотивам с пробегом до ТР-500</small>
        </div>
    </div>
     <div class="theme-switch" id="themeSwitch">
        <button type="button" data-theme-value="tmh">ТМХ</button>
        <button type="button" class="active" data-theme-value="standard">Светлая</button>
        <button type="button" data-theme-value="dark">Тёмная</button>
    </div>
    <div class="user-info" id="userInfo" style="display:none;">
        <span>👤 <span id="userName">Пользователь</span></span>
        <span class="role" id="userRole">(user)</span>
        <button class="logout-btn" id="logoutBtn">Выход</button>
    </div>
</div>
<div class="stat-bar" id="statBar">
    <div class="mini-stat"><b id="statTotal">0</b><span>Поз.</span></div>
    <div class="mini-stat ok"><b id="statOk">0</b><span>Без замеч.</span></div>
    <div class="mini-stat bad"><b id="statBad">0</b><span>Несоотв.</span></div>
    <div class="mini-stat fill"><b id="statFilled">0%</b><span>Заполнено</span></div>
    <div class="mini-progress"><div class="mini-progress-fill" id="statProgressFill"></div></div>
</div>
<div class="wrap">
    <div class="section-title">Общие данные</div>
    <div class="card"><div class="grid" id="generalGrid"></div></div>
    <div class="section-title">Выбор секций</div>
    <div class="card"><div id="sectionsSelection" style="margin-top:0;"></div></div>
    <div class="section-title">Выбор чек‑листа</div>
    <div class="card picker-wrap"><div class="picker" id="picker"></div></div>
    <div style="margin-top:20px;">
        <button class="nav-btn" id="toggleNavBtn">
            🔍 Показать позиции, требующие уведомления
            <span class="badge" id="noticeCount">0</span>
        </button>
    </div>
    <div class="notice-list" id="noticeList">
        <div class="empty" id="emptyMsg">Нет позиций, требующих уведомления</div>
    </div>
    <div id="equipRoot"></div>
</div>
<div class="footbar">
    <button class="btn primary" id="btnSave">💾 Сохранить в браузере</button>
    <button class="btn" id="btnSaveHtml">💾 Сохранить как файл</button>
    <button class="btn" id="btnExport" title="Экспорт доступен только при 100% заполнении (для пользователей)">📷 Экспорт Excel</button>
    <button class="btn" id="btnExportJson">📤 Экспорт JSON</button>
    <button class="btn" id="btnImportJson">📥 Загрузить JSON</button>
    <input type="file" id="jsonFileInput" accept=".json" style="display:none;">
     <button class="btn" id="btnFindUnfilled">🔍 Найти незаполненное<span class="badge-find" id="findBadge" style="display:none;">0</span></button>
    <button class="btn danger" id="btnReset">✕ Очистить всё</button>
</div>
<button class="scroll-top-btn" id="scrollTopBtn" aria-label="Наверх">↑</button>
</div>
<div class="toast" id="toast"></div>
<div class="photo-modal-overlay" id="photoModal">
    <div class="photo-modal">
        <button class="photo-modal-close" id="photoModalClose">✕</button>
        <img id="photoModalImg" src="" alt="Фото">
    </div>
</div>
<!-- Модалка авторизации -->
<div class="modal-overlay" id="loginModal">
    <div class="modal">
        <h2>🔐 Авторизация</h2>
        <p>Введите логин и пароль для доступа к чек-листу</p>
        <div class="field"><label>Email</label><input type="text" id="loginInput" placeholder="Введите email"></div>
        <div class="field"><label>Пароль</label><input type="password" id="passwordInput" placeholder="Введите пароль"></div>
        <div class="error" id="loginError">Неверный логин или пароль</div>
        <div class="btn-row"><button class="btn primary" id="loginBtn" style="flex:1;">Войти</button></div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line);font-size:11px;color:var(--ink-dim);text-align:center;">
            
        </div>
    </div>
</div>
<!-- Модалка Продолжить / Новый -->
<div class="modal-overlay" id="continueDialog" style="display:none;">
    <div class="modal">
        <h2>📋 Продолжить или начать новый?</h2>
        <p>У вас есть сохранённый чек-лист. Что хотите сделать?</p>
        <div class="btn-row">
            <button class="btn primary" id="continueBtn">Продолжить заполнять</button>
            <button class="btn danger" id="newBtn">Начать новый (очистить всё)</button>
        </div>
    </div>
</div>
<script>
<\/script>
<script>
/* ========================================================================
   АВТОРИЗАЦИЯ
   ======================================================================== */
const ADMIN_CREDENTIALS = { login: 'admin', passHash: 'c6a92f1d718a2a74fbbe448c66b70baffa1811636e527d1e3245b6c2e2285147' };
function __sha256(s){var b=new TextEncoder().encode(s),i,j,K=[],H=[],p=2,n=0;
function fr(x){return((x-Math.floor(x))*4294967296)|0;}
while(n<64){var c=true;for(i=2;i*i<=p;i++){if(p%i===0){c=false;break;}}if(c){if(n<8)H[n]=fr(Math.pow(p,0.5));K[n]=fr(Math.pow(p,1/3));n++;}p++;}
var l=b.length,w=new Uint32Array((((l+9+63)>>6)<<4));
for(i=0;i<l;i++)w[i>>2]|=b[i]<<(24-(i%4)*8);
w[l>>2]|=0x80<<(24-(l%4)*8);w[w.length-1]=l*8;
function R(x,k){return(x>>>k)|(x<<(32-k));}
for(var o=0;o<w.length;o+=16){var W=new Array(64),a=H.slice(0);
for(i=0;i<64;i++){if(i<16)W[i]=w[o+i];else{var s0=R(W[i-15],7)^R(W[i-15],18)^(W[i-15]>>>3),s1=R(W[i-2],17)^R(W[i-2],19)^(W[i-2]>>>10);W[i]=(W[i-16]+s0+W[i-7]+s1)|0;}
var S1=R(a[4],6)^R(a[4],11)^R(a[4],25),ch=(a[4]&a[5])^(~a[4]&a[6]),t1=(a[7]+S1+ch+K[i]+W[i])|0,S0=R(a[0],2)^R(a[0],13)^R(a[0],22),mj=(a[0]&a[1])^(a[0]&a[2])^(a[1]&a[2]),t2=(S0+mj)|0;
a=[(t1+t2)|0,a[0],a[1],a[2],(a[3]+t1)|0,a[4],a[5],a[6]];}
for(i=0;i<8;i++)H[i]=(H[i]+a[i])|0;}
var h='';for(i=0;i<8;i++)h+=('00000000'+(H[i]>>>0).toString(16)).slice(-8);return h;}
function __adminPassOk(p){try{return __sha256('tmh-checklist-salt:'+String(p))==='c6a92f1d718a2a74fbbe448c66b70baffa1811636e527d1e3245b6c2e2285147';}catch(e){return false;}}
let currentUser=null;
function __tmhApplyUserStorageScope(uid) {
  if (typeof uid !== 'string' || !/^[0-9a-f-]{36}$/i.test(uid)) {
    throw new Error('Не удалось подтвердить UUID пользователя Supabase');
  }
  var base = String(LS_KEY || '');
  var marker = base.lastIndexOf('::user:');
  if (marker >= 0) base = base.slice(0, marker);
  LS_KEY = base + '::user:' + uid;
  window.__TMH_STORAGE_UID = uid;
  window.__TMH_STORAGE_LOCKED = false;
}

function __tmhIsEmbeddedRuntime() {
  try { return Boolean(window.parent && window.parent !== window); } catch (e) { return false; }
}
function __tmhShowLoginModal() {
  if (__tmhIsEmbeddedRuntime()) {
    try {
      var parentModal = window.parent.document.getElementById('loginModal');
      if (parentModal) { parentModal.style.display = 'flex'; return; }
    } catch (e) {}
  }
  var modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'flex';
}

function __tmhInstallAuthWatcher(api) {
  if (window.__TMH_AUTH_WATCHER_INSTALLED || !api || typeof api.onAuthStateChange !== 'function') return;
  window.__TMH_AUTH_WATCHER_INSTALLED = true;
  api.onAuthStateChange(function(event, session) {
    if (window.__TMH_AUTH_ACTION) return;
    if (event === 'SIGNED_OUT') {
      // This runtime may be hosted in an about:srcdoc iframe. Do not reload
      // that document: lock writes and return to the login UI in place.
      window.__TMH_STORAGE_LOCKED = true;
      window.__TMH_STORAGE_UID = null;
      currentUser = null;
      try { localStorage.removeItem('checklist_user'); } catch (e) {}
      if (typeof updateUserUI === 'function') updateUserUI();
      var loginModal = document.getElementById('loginModal');
      __tmhShowLoginModal();
      return;
    }
    if (event === 'SIGNED_IN' && session && session.user && session.user.id) {
      var activeUid = window.__TMH_STORAGE_UID || null;
      // Embedded runtimes can observe the parent's SIGNED_IN event before
      // their own checkAuth() assigns a storage UID. Let checkAuth() scope them.
      if (activeUid && activeUid !== session.user.id) {
        // A srcdoc document must not reload on an account mismatch: lock it
        // and return to login in place, without writing under the new account.
        window.__TMH_STORAGE_LOCKED = true;
        window.__TMH_STORAGE_UID = null;
        currentUser = null;
        try { localStorage.removeItem('checklist_user'); } catch (e) {}
        if (typeof updateUserUI === 'function') updateUserUI();
        var loginModal = document.getElementById('loginModal');
        __tmhShowLoginModal();
        return;
      }
    }
  });
}

function __getTMHAuthApi() {
  try {
    if (window.TMHAuth) return window.TMHAuth;
    if (window.parent && window.parent !== window && window.parent.TMHAuth) return window.parent.TMHAuth;
  } catch (e) {}
  return null;
}

async function checkAuth() {
  if (__tmhIsEmbeddedRuntime()) {
    // The parent page is the single auth owner. Wait briefly for its verified
    // context, but never create a second auth flow from inside the iframe.
    for (var authWait = 0; authWait < 160; authWait += 1) {
      try {
        var sharedAuth = window.parent.__TMH_AUTH_CONTEXT;
        if (sharedAuth && /^[0-9a-f-]{36}$/i.test(String(sharedAuth.userId || '')) &&
            ['admin','developer','employee','assistant','user'].includes(sharedAuth.role)) {
          __tmhApplyUserStorageScope(sharedAuth.userId);
          currentUser = (sharedAuth.role === 'admin' || sharedAuth.role === 'developer') ? 'admin' : 'user';
          window.__TMH_OFFLINE_MODE = Boolean(sharedAuth.offlineMode);
          updateUserUI();
          return true;
        }
      } catch (e) {}
      await new Promise(function(resolve) { setTimeout(resolve, 50); });
    }
    currentUser = null;
    updateUserUI();
    return false;
  }
  const api = __getTMHAuthApi();
  if (!api) { currentUser = null; return false; }
  __tmhInstallAuthWatcher(api);
  try {
    let identity = await api.getOfflineIdentity();
    if (!identity?.user || !identity?.profile) {
      identity = await api.getCurrentIdentity();
      if ((!identity?.user || !identity?.profile) && typeof api.getCachedOfflineIdentity === 'function') {
        identity = await api.getCachedOfflineIdentity(identity?.error);
      }
    }
    if (!identity || !identity.user || !identity.profile) {
      currentUser = null;
      try { localStorage.removeItem('checklist_user'); } catch (e) {}
      updateUserUI();
      return false;
    }
    if (identity.mode !== 'offline-local-unlock' && typeof api.activateDeviceVault === 'function') {
      try { await api.activateDeviceVault(identity); }
      catch (vaultError) { console.warn('Device offline storage is unavailable; continuing with standard local save', vaultError); }
    }
    __tmhApplyUserStorageScope(identity.user.id);
    window.__TMH_OFFLINE_MODE = identity.mode === 'offline-local-unlock' || identity.mode === 'offline-local-cache';
    var __tmhConnectionLabel = document.getElementById('offlineSyncStatus');
    var __tmhBadgeText = document.getElementById('tmhConnectionText');
    var __tmhBadgeDot = document.getElementById('tmhConnectionDot');
    if (__tmhBadgeText) __tmhBadgeText.textContent = window.__TMH_OFFLINE_MODE || navigator.onLine === false ? 'Офлайн · локально' : 'Онлайн';
    if (__tmhBadgeDot) __tmhBadgeDot.style.background = window.__TMH_OFFLINE_MODE || navigator.onLine === false ? '#ffbd4a' : '#45d483';
    if (!window.__TMH_BADGE_EVENTS_BOUND) {
      window.__TMH_BADGE_EVENTS_BOUND = true;
      window.addEventListener('offline', function() {
        var text = document.getElementById('tmhConnectionText'), dot = document.getElementById('tmhConnectionDot');
        if (text) text.textContent = 'Офлайн · локально';
        if (dot) dot.style.background = '#ffbd4a';
      });
      window.addEventListener('online', function() {
        var text = document.getElementById('tmhConnectionText'), dot = document.getElementById('tmhConnectionDot');
        if (text) text.textContent = 'Онлайн';
        if (dot) dot.style.background = '#45d483';
      });
    }
    if (__tmhConnectionLabel) {
      __tmhConnectionLabel.textContent = window.__TMH_OFFLINE_MODE ? 'Офлайн · локально' : (navigator.onLine === false ? 'Нет сети' : 'Онлайн');
      __tmhConnectionLabel.title = window.__TMH_OFFLINE_MODE ? 'Изменения сохраняются на этом устройстве' : 'Доступность сети; синхронизация требует действующей сессии';
    }
    var __tmhStatusOwner = window;
    try { if (window.parent && window.parent !== window) __tmhStatusOwner = window.parent; } catch (e) {}
    if (typeof __tmhStatusOwner.__TMH_SET_CONNECTION_STATUS === 'function') {
      __tmhStatusOwner.__TMH_SET_CONNECTION_STATUS(window.__TMH_OFFLINE_MODE ? 'offline' : 'online');
    }
    const role = identity.profile.role;
    currentUser = (role === 'admin' || role === 'developer') ? 'admin' : 'user';
    if (identity.mode === 'offline-local-unlock' || identity.mode === 'offline-local-cache') {
      // Do not elevate cached/offline identity into a fresh cloud session.
    } else {
      try {
        localStorage.setItem('checklist_user', JSON.stringify({
          login: identity.user.email || '',
          displayName: identity.profile.display_name || '',
          role: currentUser,
          profileRole: role,
          dev: role === 'developer',
          authUid: identity.user.id
        }));
      } catch (e) {}
    }
    updateUserUI();
    return true;
  } catch (e) {
    console.error('Auth check failed', e);
    currentUser = null;
    updateUserUI();
    return false;
  }
}

async function doLogin(login, password) {
  const api = __getTMHAuthApi();
  if (!api) return false;
  window.__TMH_AUTH_ACTION = 'login';
  let result;
  try { result = await api.signIn(login, password); }
  finally { window.__TMH_AUTH_ACTION = ''; }
  if (!result || result.error || !result.user || !result.profile) {
    // When the network/auth service is unavailable, allow only the previously
    // enrolled device identity. The password is NOT verified offline.
    if (result && result.error && typeof api.getCachedOfflineIdentity === 'function') {
      const cachedIdentity = await api.getCachedOfflineIdentity(result.error);
      if (cachedIdentity && cachedIdentity.user && cachedIdentity.profile) {
        const restored = await checkAuth();
        if (restored) {
          if (typeof showToast === 'function') showToast('Офлайн-вход: открыт сохранённый на этом устройстве профиль. Пароль без интернета не проверяется.');
          return true;
        }
      }
    }
    return false;
  }
  if (result.offlineSetupError && typeof showToast === 'function') {
    showToast('Офлайн-вход не подготовлен: ' + (result.offlineSetupError.message || 'ошибка локального хранилища'));
  }
  __tmhApplyUserStorageScope(result.user.id);
  const role = result.profile.role;
  currentUser = (role === 'admin' || role === 'developer') ? 'admin' : 'user';
  try {
    localStorage.setItem('checklist_user', JSON.stringify({
      login: result.user.email || '',
      displayName: result.profile.display_name || '',
      role: currentUser,
      profileRole: role,
      dev: role === 'developer',
      authUid: result.user.id
    }));
  } catch (e) {}
  updateUserUI();
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'none';
  return true;
}


async function doLogout() {
  try {
    if (typeof saveState === 'function') saveState(true);
    if (typeof __PS !== 'undefined' && __PS.chain) await __PS.chain;
    if (typeof __tmhOfflineSaveChain !== 'undefined' && __tmhOfflineSaveChain) await __tmhOfflineSaveChain;
    if (typeof __tmhOfflineSaveError !== 'undefined' && __tmhOfflineSaveError) {
      window.__TMH_STORAGE_LOCKED = false;
      showToast('Не удалось сохранить изменения на устройстве. Выход отменён — повторите попытку.');
      return;
    }
    if (typeof _photoMigrationPromise !== 'undefined' && _photoMigrationPromise) await _photoMigrationPromise;
    if (typeof _photoWriteChain !== 'undefined' && _photoWriteChain) await _photoWriteChain;
  } catch (e) { console.warn('Не удалось завершить локальное сохранение перед выходом', e); }
  window.__TMH_STORAGE_LOCKED = true;
  const api = __getTMHAuthApi();
  if (api) {
    window.__TMH_AUTH_ACTION = 'logout';
    const result = await api.signOut();
    if (result && result.error) {
      window.__TMH_AUTH_ACTION = '';
      window.__TMH_STORAGE_LOCKED = false;
      console.error('Sign out failed', result.error);
      showToast('Не удалось завершить сеанс');
      return;
    }
  }
  currentUser = null;
  try { localStorage.removeItem('checklist_user'); } catch (e) {}
  updateUserUI();
  try {
    const topWindow = window.parent && window.parent !== window ? window.parent : window;
    topWindow.location.reload();
  } catch (e) {
    window.location.reload();
  }
}

function updateUserUI(){const info=document.getElementById('userInfo');const name=document.getElementById('userName');const role=document.getElementById('userRole');if(currentUser){info.style.display='flex';if(currentUser==='admin'){name.textContent = (function(){try{return JSON.parse(localStorage.getItem('checklist_user')||'{}').displayName||'';}catch(e){return '';}})() || 'Администратор';role.textContent='(admin)';role.classList.remove('dim');}else{name.textContent = (function(){try{return JSON.parse(localStorage.getItem('checklist_user')||'{}').displayName||'';}catch(e){return '';}})() || 'Пользователь';role.textContent='(user)';role.classList.add('dim');}}else{info.style.display='none';}}

/* ========================================================================
   ДАННЫЕ ИЗ КЖЦ
   ======================================================================== */
const LOCOMOTIVE_DATA={"2ЭС5К":{"591":"ТЧЭ-10 Карасук","592":"ТЧЭ-10 Карасук","593":"ТЧЭ-10 Карасук","594":"ТЧЭ-10 Карасук","595":"ТЧЭ-10 Карасук","596":"ТЧЭ-10 Карасук","597":"ТЧЭ-10 Карасук","598":"ТЧЭ-10 Карасук","599":"ТЧЭ-10 Карасук","600":"ТЧЭ-10 Карасук","601":"ТЧЭ-10 Карасук","602":"ТЧЭ-10 Карасук","603":"ТЧЭ-10 Карасук","604":"ТЧЭ-10 Карасук","605":"ТЧЭ-10 Карасук","606":"ТЧЭ-10 Карасук","607":"ТЧЭ-10 Карасук","608":"ТЧЭ-10 Карасук","609":"ТЧЭ-10 Карасук","610":"ТЧЭ-10 Карасук","611":"ТЧЭ-10 Карасук","612":"ТЧЭ-10 Карасук","613":"ТЧЭ-10 Карасук","614":"ТЧЭ-10 Карасук","615":"ТЧЭ-10 Карасук","616":"ТЧЭ-10 Карасук","617":"ТЧЭ-10 Карасук","618":"ТЧЭ-10 Карасук","619":"ТЧЭ-10 Карасук","620":"ТЧЭ-10 Карасук","621":"ТЧЭ-11 Тимашевская","622":"ТЧЭ-11 Тимашевская","623":"ТЧЭ-11 Тимашевская","624":"ТЧЭ-11 Тимашевская","625":"ТЧЭ-11 Тимашевская","626":"ТЧЭ-11 Тимашевская","627":"ТЧЭ-11 Тимашевская","628":"ТЧЭ-11 Тимашевская","629":"ТЧЭ-11 Тимашевская","630":"ТЧЭ-11 Тимашевская","631":"ТЧЭ-11 Тимашевская","632":"ТЧЭ-11 Тимашевская","633":"ТЧЭ-11 Тимашевская","634":"ТЧЭ-11 Тимашевская","635":"ТЧЭ-11 Тимашевская","636":"ТЧЭ-11 Тимашевская","637":"ТЧЭ-11 Тимашевская","638":"ТЧЭ-11 Тимашевская","639":"ТЧЭ-11 Тимашевская","640":"ТЧЭ-11 Тимашевская","641":"ТЧЭ-11 Тимашевская","642":"ТЧЭ-11 Тимашевская","643":"ТЧЭ-11 Тимашевская","644":"ТЧЭ-11 Тимашевская","645":"ТЧЭ-11 Тимашевская","646":"ТЧЭ-11 Тимашевская","647":"ТЧЭ-11 Тимашевская","648":"ТЧЭ-11 Тимашевская","649":"ТЧЭ-11 Тимашевская","650":"ТЧЭ-11 Тимашевская","651":"ТЧЭ-11 Тимашевская","652":"ТЧЭ-11 Тимашевская","653":"ТЧЭ-7 Петров Вал","654":"ТЧЭ-7 Петров Вал","655":"ТЧЭ-7 Петров Вал","656":"ТЧЭ-7 Петров Вал","657":"ТЧЭ-7 Петров Вал","658":"ТЧЭ-7 Петров Вал","659":"ТЧЭ-7 Петров Вал","660":"ТЧЭ-7 Петров Вал","661":"ТЧЭ-7 Петров Вал","662":"ТЧЭ-7 Петров Вал","663":"ТЧЭ-7 Петров Вал","664":"ТЧЭ-7 Петров Вал","665":"ТЧЭ-7 Петров Вал","666":"ТЧЭ-7 Петров Вал","667":"ТЧЭ-7 Петров Вал","668":"ТЧЭ-7 Петров Вал","669":"ТЧЭ-7 Петров Вал","670":"ТЧЭ-7 Петров Вал","671":"ТЧЭ-7 Петров Вал","672":"ТЧЭ-7 Петров Вал","673":"ТЧЭ-5 Кандалакша","674":"ТЧЭ-5 Кандалакша","675":"ТЧЭ-5 Кандалакша","676":"ТЧЭ-5 Кандалакша","677":"ТЧЭ-5 Кандалакша","678":"ТЧЭ-5 Кандалакша","679":"ТЧЭ-5 Кандалакша","680":"ТЧЭ-5 Кандалакша","681":"ТЧЭ-5 Кандалакша","682":"ТЧЭ-5 Кандалакша","683":"ТЧЭ-5 Кандалакша","684":"ТЧЭ-5 Кандалакша","685":"ТЧЭ-5 Кандалакша","686":"ТЧЭ-5 Кандалакша","687":"ТЧЭ-5 Кандалакша","688":"ТЧЭ-5 Кандалакша","689":"ТЧЭ-7 Петров Вал","690":"ТЧЭ-7 Петров Вал","691":"ТЧЭ-7 Петров Вал","692":"ТЧЭ-7 Петров Вал","693":"ТЧЭ-11 Тимашевская","694":"ТЧЭ-11 Тимашевская","695":"ТЧЭ-11 Тимашевская","696":"ТЧЭ-11 Тимашевская","697":"ТЧЭ-11 Тимашевская","698":"ТЧЭ-11 Тимашевская","699":"ТЧЭ-10 Карасук","700":"ТЧЭ-10 Карасук","701":"ТЧЭ-10 Карасук","702":"ТЧЭ-10 Карасук","703":"ТЧЭ-10 Карасук","704":"ТЧЭ-10 Карасук","705":"ТЧЭ-10 Карасук","706":"ТЧЭ-10 Карасук","707":"ТЧЭ-10 Карасук","708":"ТЧЭ-10 Карасук","709":"ТЧЭ-10 Карасук","710":"ТЧЭ-10 Карасук","711":"ТЧЭ-10 Карасук","712":"ТЧЭ-10 Карасук","713":"ТЧЭ-10 Карасук","714":"ТЧЭ-10 Карасук","715":"ТЧЭ-10 Карасук","716":"ТЧЭ-10 Карасук","717":"ТЧЭ-10 Карасук","718":"ТЧЭ-10 Карасук","719":"ТЧЭ-10 Карасук","720":"ТЧЭ-10 Карасук","721":"ТЧЭ-10 Карасук","722":"ТЧЭ-10 Карасук","723":"ТЧЭ-10 Карасук","724":"ТЧЭ-10 Карасук","725":"ТЧЭ-10 Карасук","726":"ТЧЭ-10 Карасук","727":"ТЧЭ-10 Карасук","728":"ТЧЭ-10 Карасук","729":"ТЧЭ-10 Карасук","730":"ТЧЭ-10 Карасук","731":"ТЧЭ-10 Карасук","732":"ТЧЭ-10 Карасук","733":"ТЧЭ-10 Карасук","734":"ТЧЭ-10 Карасук","735":"ТЧЭ-10 Карасук","736":"ТЧЭ-10 Карасук","737":"ТЧЭ-10 Карасук","738":"ТЧЭ-10 Карасук","739":"ТЧЭ-10 Карасук","740":"ТЧЭ-10 Карасук","741":"ТЧЭ-10 Карасук","742":"ТЧЭ-10 Карасук","743":"ТЧЭ-10 Карасук","744":"ТЧЭ-10 Карасук","745":"ТЧЭ-10 Карасук","746":"ТЧЭ-10 Карасук","747":"ТЧЭ-10 Карасук","748":"ТЧЭ-10 Карасук","749":"ТЧЭ-10 Карасук","750":"ТЧЭ-10 Карасук","751":"ТЧЭ-10 Карасук","752":"ТЧЭ-10 Карасук","753":"ТЧЭ-10 Карасук","754":"ТЧЭ-11 Тимашевская","755":"ТЧЭ-11 Тимашевская","756":"ТЧЭ-11 Тимашевская","757":"ТЧЭ-11 Тимашевская","758":"ТЧЭ-11 Тимашевская","759":"ТЧЭ-11 Тимашевская","760":"ТЧЭ-11 Тимашевская","761":"ТЧЭ-11 Тимашевская","762":"ТЧЭ-11 Тимашевская","763":"ТЧЭ-11 Тимашевская","764":"ТЧЭ-11 Тимашевская","765":"ТЧЭ-11 Тимашевская","766":"ТЧЭ-11 Тимашевская","767":"ТЧЭ-11 Тимашевская","768":"ТЧЭ-11 Тимашевская","769":"ТЧЭ-11 Тимашевская","770":"ТЧЭ-11 Тимашевская","771":"ТЧЭ-11 Тимашевская","772":"ТЧЭ-5 Карталы","773":"ТЧЭ-5 Карталы","774":"ТЧЭ-5 Карталы","775":"ТЧЭ-5 Карталы","776":"ТЧЭ-5 Карталы","777":"ТЧЭ-5 Карталы","778":"ТЧЭ-5 Карталы","779":"ТЧЭ-5 Карталы","780":"ТЧЭ-5 Карталы","781":"ТЧЭ-5 Карталы","782":"ТЧЭ-7 Петров Вал","783":"ТЧЭ-7 Петров Вал","784":"ТЧЭ-7 Петров Вал","785":"ТЧЭ-7 Петров Вал","786":"ТЧЭ-7 Петров Вал","787":"ТЧЭ-7 Петров Вал","788":"ТЧЭ-7 Петров Вал","789":"ТЧЭ-7 Петров Вал","790":"ТЧЭ-7 Петров Вал","791":"ТЧЭ-7 Петров Вал","792":"ТЧЭ-7 Петров Вал","793":"ТЧЭ-7 Петров Вал","794":"ТЧЭ-7 Петров Вал","795":"ТЧЭ-7 Петров Вал","796":"ТЧЭ-7 Петров Вал","797":"ТЧЭ-7 Петров Вал","798":"ТЧЭ-7 Петров Вал","799":"ТЧЭ-14 Сальск","800":"ТЧЭ-14 Сальск","801":"ТЧЭ-14 Сальск","802":"ТЧЭ-14 Сальск","803":"ТЧЭ-14 Сальск","804":"ТЧЭ-14 Сальск","805":"ТЧЭ-14 Сальск","806":"ТЧЭ-14 Сальск","807":"ТЧЭ-14 Сальск","808":"ТЧЭ-14 Сальск","809":"ТЧЭ-14 Сальск","810":"ТЧЭ-14 Сальск","811":"ТЧЭ-14 Сальск","812":"ТЧЭ-14 Сальск","813":"ТЧЭ-14 Сальск","814":"ТЧЭ-14 Сальск","815":"ТЧЭ-14 Сальск","816":"ТЧЭ-14 Сальск","817":"ТЧЭ-14 Сальск","818":"ТЧЭ-14 Сальск","819":"ТЧЭ-9 Лянгасово","820":"ТЧЭ-9 Лянгасово","821":"ТЧЭ-9 Лянгасово","822":"ТЧЭ-9 Лянгасово","823":"ТЧЭ-9 Лянгасово","824":"ТЧЭ-9 Лянгасово","825":"ТЧЭ-9 Лянгасово","826":"ТЧЭ-9 Лянгасово","827":"ТЧЭ-9 Лянгасово","828":"ТЧЭ-9 Лянгасово","829":"ТЧЭ-9 Лянгасово","830":"ТЧЭ-9 Лянгасово"},"3ЭС5К":{"1515":"ТЧЭ-3 Чита","1516":"ТЧЭ-3 Чита","1517":"ТЧЭ-3 Чита","1518":"ТЧЭ-3 Чита","1519":"ТЧЭ-3 Чита","1520":"ТЧЭ-3 Чита","1521":"ТЧЭ-3 Чита","1522":"ТЧЭ-3 Чита","1523":"ТЧЭ-3 Чита","1524":"ТЧЭ-3 Чита","1525":"ТЧЭ-7 Абакан","1526":"ТЧЭ-7 Абакан","1527":"ТЧЭ-7 Абакан","1528":"ТЧЭ-7 Абакан","1529":"ТЧЭ-7 Абакан","1530":"ТЧЭ-7 Абакан","1531":"ТЧЭ-7 Абакан","1532":"ТЧЭ-7 Абакан","1533":"ТЧЭ-7 Абакан","1534":"ТЧЭ-7 Абакан","1535":"ТЧЭ-7 Абакан","1536":"ТЧЭ-7 Абакан","1537":"ТЧЭ-7 Абакан","1538":"ТЧЭ-7 Абакан","1539":"ТЧЭ-7 Абакан","1540":"ТЧЭ-7 Абакан","1541":"ТЧЭ-7 Абакан","1542":"ТЧЭ-7 Абакан","1543":"ТЧЭ-7 Абакан","1544":"ТЧЭ-7 Абакан","1545":"ТЧЭ-7 Абакан","1546":"ТЧЭ-7 Абакан","1547":"ТЧЭ-7 Абакан","1548":"ТЧЭ-7 Абакан","1549":"ТЧЭ-7 Абакан","1550":"ТЧЭ-7 Абакан","1551":"ТЧЭ-7 Абакан","1552":"ТЧЭ-7 Абакан","1553":"ТЧЭ-7 Абакан","1554":"ТЧЭ-7 Абакан","1555":"ТЧЭ-7 Абакан","1556":"ТЧЭ-7 Абакан","1557":"ТЧЭ-7 Абакан","1558":"ТЧЭ-7 Абакан","1559":"ТЧЭ-7 Абакан","1560":"ТЧЭ-7 Абакан","1561":"ТЧЭ-7 Абакан","1562":"ТЧЭ-7 Абакан","1563":"ТЧЭ-7 Абакан","1564":"ТЧЭ-7 Абакан","1565":"ТЧЭ-7 Абакан","1566":"ТЧЭ-10 Карасук","1567":"ТЧЭ-10 Карасук","1568":"ТЧЭ-10 Карасук","1569":"ТЧЭ-10 Карасук","1570":"ТЧЭ-10 Карасук","1571":"ТЧЭ-10 Карасук","1572":"ТЧЭ-10 Карасук","1573":"ТЧЭ-10 Карасук","1574":"ТЧЭ-10 Карасук","1575":"ТЧЭ-10 Карасук","1576":"ТЧЭ-7 Абакан","1577":"ТЧЭ-7 Абакан","1578":"ТЧЭ-7 Абакан","1579":"ТЧЭ-7 Абакан","1580":"ТЧЭ-7 Абакан","1581":"ТЧЭ-7 Абакан","1582":"ТЧЭ-7 Абакан","1583":"ТЧЭ-7 Абакан","1584":"ТЧЭ-7 Абакан","1585":"ТЧЭ-7 Абакан","1586":"ТЧЭ-7 Абакан","1587":"ТЧЭ-7 Абакан","1588":"ТЧЭ-7 Абакан","1589":"ТЧЭ-7 Абакан","1590":"ТЧЭ-7 Абакан","1591":"ТЧЭ-7 Абакан","1592":"ТЧЭ-7 Абакан","1593":"ТЧЭ-7 Абакан","1594":"ТЧЭ-7 Абакан","1595":"ТЧЭ-7 Абакан","1596":"ТЧЭ-7 Абакан","1597":"ТЧЭ-7 Абакан","1598":"ТЧЭ-7 Абакан","1599":"ТЧЭ-7 Абакан","1600":"ТЧЭ-7 Абакан","1601":"ТЧЭ-7 Абакан","1602":"ТЧЭ-7 Абакан","1603":"ТЧЭ-7 Абакан","1604":"ТЧЭ-7 Абакан","1605":"ТЧЭ-7 Абакан","1606":"ТЧЭ-7 Абакан","1607":"ТЧЭ-7 Абакан","1608":"ТЧЭ-7 Абакан","1609":"ТЧЭ-7 Абакан","1610":"ТЧЭ-7 Абакан","1611":"ТЧЭ-7 Абакан","1612":"ТЧЭ-7 Абакан","1613":"ТЧЭ-7 Абакан","1614":"ТЧЭ-7 Абакан","1615":"ТЧЭ-7 Абакан","1616":"ТЧЭ-7 Абакан","1617":"ТЧЭ-7 Абакан","1618":"ТЧЭ-7 Абакан","1619":"ТЧЭ-7 Абакан","1620":"ТЧЭ-7 Абакан","1621":"ТЧЭ-7 Абакан","1622":"ТЧЭ-7 Абакан","1623":"ТЧЭ-7 Абакан","1624":"ТЧЭ-7 Абакан","1625":"ТЧЭ-7 Абакан","1626":"ТЧЭ-7 Абакан","1627":"ТЧЭ-7 Абакан","1628":"ТЧЭ-7 Абакан","1629":"ТЧЭ-7 Абакан","1630":"ТЧЭ-7 Абакан","1631":"ТЧЭ-7 Абакан","1632":"ТЧЭ-7 Абакан","1633":"ТЧЭ-7 Абакан","1634":"ТЧЭ-7 Абакан","1635":"ТЧЭ-7 Абакан","1636":"ТЧЭ-7 Абакан","1637":"ТЧЭ-7 Абакан","1638":"ТЧЭ-7 Абакан","1639":"ТЧЭ-7 Абакан","1640":"ТЧЭ-7 Абакан","1641":"ТЧЭ-7 Абакан","1642":"ТЧЭ-7 Абакан","1643":"ТЧЭ-7 Абакан","1644":"ТЧЭ-7 Абакан","1645":"ТЧЭ-7 Абакан","1646":"ТЧЭ-7 Абакан","1647":"ТЧЭ-7 Абакан","1648":"ТЧЭ-7 Абакан","1649":"ТЧЭ-7 Абакан","1650":"ТЧЭ-7 Абакан","1651":"ТЧЭ-7 Абакан","1652":"ТЧЭ-1 Боготол","1653":"ТЧЭ-1 Боготол","1654":"ТЧЭ-1 Боготол","1655":"ТЧЭ-1 Боготол","1656":"ТЧЭ-1 Боготол","1657":"ТЧЭ-1 Боготол","1658":"ТЧЭ-1 Боготол","1659":"ТЧЭ-1 Боготол","1660":"ТЧЭ-1 Боготол","1661":"ТЧЭ-1 Боготол","1662":"ТЧЭ-1 Боготол","1663":"ТЧЭ-1 Боготол","1664":"ТЧЭ-1 Боготол","1665":"ТЧЭ-1 Боготол","1666":"ТЧЭ-1 Боготол","1667":"ТЧЭ-1 Боготол","1668":"ТЧЭ-1 Боготол","1669":"ТЧЭ-1 Боготол","1670":"ТЧЭ-1 Боготол","1671":"ТЧЭ-1 Боготол","1672":"ТЧЭ-1 Боготол","1673":"ТЧЭ-1 Боготол","1674":"ТЧЭ-1 Боготол","1675":"ТЧЭ-1 Боготол","1676":"ТЧЭ-1 Боготол","1677":"ТЧЭ-1 Боготол","1678":"ТЧЭ-1 Боготол","1679":"ТЧЭ-1 Боготол","1680":"ТЧЭ-1 Боготол","1681":"ТЧЭ-1 Боготол","1682":"ТЧЭ-1 Боготол","1683":"ТЧЭ-1 Боготол","1684":"ТЧЭ-1 Боготол","1685":"ТЧЭ-1 Боготол","1686":"ТЧЭ-1 Боготол","1687":"ТЧЭ-1 Боготол","1688":"ТЧЭ-1 Боготол","1689":"ТЧЭ-1 Боготол","1690":"ТЧЭ-1 Боготол","1691":"ТЧЭ-1 Боготол","1693":"ТЧЭ-1 Боготол","1694":"ТЧЭ-1 Боготол","1695":"ТЧЭ-1 Боготол","1696":"ТЧЭ-1 Боготол","1697":"ТЧЭ-1 Боготол","1698":"ТЧЭ-1 Боготол","1699":"ТЧЭ-1 Боготол","1700":"ТЧЭ-1 Боготол","1701":"ТЧЭ-1 Боготол","1702":"ТЧЭ-1 Боготол","1703":"ТЧЭ-1 Боготол","1704":"ТЧЭ-1 Боготол","1705":"ТЧЭ-1 Боготол","1706":"ТЧЭ-1 Боготол","1692":"ТЧЭ-1 Боготол"},"4ЭС5К":{"66":"ТЧЭ-8 Смоляниново","67":"ТЧЭ-8 Смоляниново","68":"ТЧЭ-8 Смоляниново","69":"ТЧЭ-8 Смоляниново","70":"ТЧЭ-8 Смоляниново","71":"ТЧЭ-8 Смоляниново","72":"ТЧЭ-8 Смоляниново","73":"ТЧЭ-8 Смоляниново","74":"ТЧЭ-8 Смоляниново","75":"ТЧЭ-8 Смоляниново","76":"ТЧЭ-8 Смоляниново","77":"ТЧЭ-8 Смоляниново","78":"ТЧЭ-8 Смоляниново","79":"ТЧЭ-8 Смоляниново","80":"ТЧЭ-8 Смоляниново","81":"ТЧЭ-8 Смоляниново","82":"ТЧЭ-8 Смоляниново","83":"ТЧЭ-8 Смоляниново","84":"ТЧЭ-8 Смоляниново","85":"ТЧЭ-8 Смоляниново","86":"ТЧЭ-8 Смоляниново","87":"ТЧЭ-8 Смоляниново"}};

const MILEAGE_DATA={"2ЭС5К_243":1489262,"2ЭС5К_244":1375568,"2ЭС5К_245":1442978,"2ЭС5К_246":1261753,"2ЭС5К_247":1409436,"2ЭС5К_248":1485963,"2ЭС5К_249":1541198,"2ЭС5К_250":1463390,"2ЭС5К_251":1320196,"2ЭС5К_252":1490410,"2ЭС5К_253":1303097,"2ЭС5К_254":1382606,"2ЭС5К_255":1467920,"2ЭС5К_256":1375667,"2ЭС5К_257":1474236,"2ЭС5К_258":1454033,"2ЭС5К_259":1414463,"2ЭС5К_260":1385713,"2ЭС5К_261":1515685,"2ЭС5К_262":1377349,"2ЭС5К_263":1336788,"2ЭС5К_264":1489558,"2ЭС5К_265":1359429,"2ЭС5К_266":1330042,"2ЭС5К_267":1325530,"2ЭС5К_268":1413974,"2ЭС5К_269":1288907,"2ЭС5К_270":1363545,"2ЭС5К_271":1334650,"2ЭС5К_272":1415107,"2ЭС5К_273":1462487,"2ЭС5К_274":911056,"2ЭС5К_275":867230,"2ЭС5К_276":1611049,"2ЭС5К_277":1580751,"2ЭС5К_278":1035179,"2ЭС5К_279":959478,"2ЭС5К_280":1473774,"2ЭС5К_281":1695643,"2ЭС5К_282":1695637,"2ЭС5К_283":1472503,"2ЭС5К_284":1663000,"2ЭС5К_285":1662996,"2ЭС5К_286":908459,"2ЭС5К_287":817153,"2ЭС5К_288":893275,"2ЭС5К_289":820068,"2ЭС5К_290":820168,"2ЭС5К_291":812570,"2ЭС5К_292":926982,"2ЭС5К_293":719524,"2ЭС5К_294":1023924,"2ЭС5К_295":700263,"2ЭС5К_296":1033955,"2ЭС5К_297":1315822,"2ЭС5К_298":1060538,"2ЭС5К_299":1332858,"2ЭС5К_300":1295418,"2ЭС5К_301":1306657,"2ЭС5К_302":814704,"2ЭС5К_303":648000,"2ЭС5К_304":671341,"2ЭС5К_305":760246,"2ЭС5К_306":857326,"2ЭС5К_307":1251675,"2ЭС5К_308":739821,"2ЭС5К_309":1030731,"2ЭС5К_310":1075129,"2ЭС5К_311":1071576,"2ЭС5К_312":928321,"2ЭС5К_313":913875,"2ЭС5К_314":887806,"2ЭС5К_315":1275330,"2ЭС5К_316":1280060,"2ЭС5К_317":1299346,"2ЭС5К_318":1275320,"2ЭС5К_319":1199222,"2ЭС5К_320":1280161,"2ЭС5К_321":1327145,"2ЭС5К_322":1180085,"2ЭС5К_323":1098539,"2ЭС5К_324":1119425,"2ЭС5К_325":1256815,"2ЭС5К_326":1307637,"2ЭС5К_327":1176623,"2ЭС5К_328":1219937,"2ЭС5К_329":1225896,"2ЭС5К_330":1320586,"2ЭС5К_331":1299992,"2ЭС5К_332":1305972,"2ЭС5К_333":1259031,"2ЭС5К_334":1117409,"2ЭС5К_335":1242016,"2ЭС5К_336":1202951,"2ЭС5К_337":1255303,"2ЭС5К_338":1249067,"2ЭС5К_339":1254983,"2ЭС5К_340":1198595,"2ЭС5К_341":1119626,"2ЭС5К_342":1151587,"2ЭС5К_343":1211600,"2ЭС5К_344":1239939,"2ЭС5К_345":1102979,"2ЭС5К_346":1068362,"2ЭС5К_347":1410454,"2ЭС5К_348":1287923,"2ЭС5К_349":1143637,"2ЭС5К_350":1278721,"2ЭС5К_351":1210276,"2ЭС5К_352":1257055,"2ЭС5К_353":1262131,"2ЭС5К_354":1442543,"2ЭС5К_355":1253277,"2ЭС5К_356":1264831,"2ЭС5К_357":1099106,"2ЭС5К_358":1201130,"2ЭС5К_359":1172586,"2ЭС5К_360":1427396,"2ЭС5К_361":1322305,"2ЭС5К_362":1301225,"2ЭС5К_363":1177001,"2ЭС5К_364":1171004,"2ЭС5К_365":1232317,"2ЭС5К_366":1433207,"2ЭС5К_367":1207206,"2ЭС5К_368":1250979,"2ЭС5К_369":1180238,"2ЭС5К_370":1233602,"2ЭС5К_371":1257505,"2ЭС5К_372":1226995,"2ЭС5К_373":1232710,"2ЭС5К_374":1072326,"2ЭС5К_375":1334304,"2ЭС5К_376":1227860,"2ЭС5К_377":1268481,"2ЭС5К_378":1234512,"2ЭС5К_379":1150475,"2ЭС5К_380":1435918,"2ЭС5К_381":1224530,"2ЭС5К_382":1177531,"2ЭС5К_383":1170893,"2ЭС5К_384":1129268,"2ЭС5К_385":1162667,"2ЭС5К_386":1161967,"2ЭС5К_387":1250236,"2ЭС5К_388":1223982,"2ЭС5К_389":1153703,"2ЭС5К_390":1125848,"2ЭС5К_391":1161221,"2ЭС5К_392":1215878,"2ЭС5К_393":1219541,"2ЭС5К_394":1157454,"2ЭС5К_395":914211,"2ЭС5К_396":1080103,"2ЭС5К_397":1203834,"2ЭС5К_398":1090095,"2ЭС5К_399":1194199,"2ЭС5К_400":1180207,"2ЭС5К_401":1162919,"2ЭС5К_402":1097769,"2ЭС5К_403":1101084,"2ЭС5К_404":1174110,"2ЭС5К_405":1087424,"2ЭС5К_406":1083227,"2ЭС5К_407":1143920,"2ЭС5К_408":1118941,"2ЭС5К_409":1149649,"2ЭС5К_410":1159137,"2ЭС5К_411":1059305,"2ЭС5К_412":1150845,"2ЭС5К_413":1001838,"2ЭС5К_414":1110803,"2ЭС5К_415":940568,"2ЭС5К_416":938740,"2ЭС5К_417":908463,"2ЭС5К_418":846063,"2ЭС5К_419":917069,"2ЭС5К_420":735002,"2ЭС5К_421":693007,"2ЭС5К_422":694158,"2ЭС5К_423":745353,"2ЭС5К_424":682759,"2ЭС5К_425":677091,"2ЭС5К_426":593485,"2ЭС5К_427":692381,"2ЭС5К_428":723875,"2ЭС5К_429":737461,"2ЭС5К_430":750954,"2ЭС5К_431":729857,"2ЭС5К_432":784632,"2ЭС5К_433":1119799,"2ЭС5К_434":1042117,"2ЭС5К_435":1015602,"2ЭС5К_436":1096124,"2ЭС5К_437":896376,"2ЭС5К_438":1014877,"2ЭС5К_439":1279135,"2ЭС5К_440":1349479,"2ЭС5К_441":1355374,"2ЭС5К_442":1191120,"2ЭС5К_443":1336754,"2ЭС5К_444":1348171,"2ЭС5К_445":1288884,"2ЭС5К_446":1322569,"2ЭС5К_447":1232029,"2ЭС5К_448":1345848,"2ЭС5К_449":1307451,"2ЭС5К_450":1312259,"2ЭС5К_451":1329697,"2ЭС5К_452":1356663,"2ЭС5К_453":1269028,"2ЭС5К_454":1329268,"2ЭС5К_455":1288770,"2ЭС5К_456":1289352,"2ЭС5К_457":1302154,"2ЭС5К_458":1300631,"2ЭС5К_459":1323478,"2ЭС5К_460":1349492,"2ЭС5К_461":1337940,"2ЭС5К_462":1282436,"2ЭС5К_463":1333809,"2ЭС5К_464":1276821,"2ЭС5К_465":1289716,"2ЭС5К_466":1340528,"2ЭС5К_467":1288402,"2ЭС5К_468":1330594,"2ЭС5К_469":1281913,"2ЭС5К_470":1353305,"2ЭС5К_471":1271198,"2ЭС5К_472":1315445,"2ЭС5К_473":1303894,"2ЭС5К_474":1302875,"2ЭС5К_475":1317335,"2ЭС5К_476":1308202,"2ЭС5К_477":1133087,"2ЭС5К_478":1328095,"2ЭС5К_479":1226091,"2ЭС5К_480":1283543,"2ЭС5К_481":1313997,"2ЭС5К_482":1307373,"2ЭС5К_483":1232763,"2ЭС5К_484":1287088,"2ЭС5К_485":1338739,"2ЭС5К_486":1261901,"2ЭС5К_487":1278250,"2ЭС5К_488":1242660,"2ЭС5К_489":1301243,"2ЭС5К_490":1235899,"2ЭС5К_491":1258769,"2ЭС5К_492":1238528,"2ЭС5К_493":1274761,"2ЭС5К_494":1213568,"2ЭС5К_495":1236977,"2ЭС5К_496":1225643,"2ЭС5К_497":1240348,"2ЭС5К_498":1194435,"2ЭС5К_499":1087527,"2ЭС5К_500":1088272,"2ЭС5К_501":1253176,"2ЭС5К_502":1157657,"2ЭС5К_503":1226548,"2ЭС5К_504":1259365,"2ЭС5К_505":1123132,"2ЭС5К_506":1248459,"2ЭС5К_507":1210795,"2ЭС5К_508":1220752,"2ЭС5К_509":1149344,"2ЭС5К_510":1055778,"2ЭС5К_511":1133486,"2ЭС5К_512":1192920,"2ЭС5К_513":1200804,"2ЭС5К_514":626751,"2ЭС5К_515":284497,"2ЭС5К_516":258909,"2ЭС5К_517":445032,"2ЭС5К_518":669467,"2ЭС5К_519":664851,"2ЭС5К_520":665170,"2ЭС5К_521":616000,"2ЭС5К_522":604564,"2ЭС5К_523":590262,"2ЭС5К_524":535630,"2ЭС5К_525":508659,"2ЭС5К_526":556927,"2ЭС5К_527":501465,"2ЭС5К_528":464468,"2ЭС5К_529":528494,"2ЭС5К_530":478287,"2ЭС5К_531":471761,"2ЭС5К_532":541360,"2ЭС5К_533":525256,"2ЭС5К_534":631450,"2ЭС5К_535":488901,"2ЭС5К_536":570973,"2ЭС5К_537":469073,"2ЭС5К_538":481576,"2ЭС5К_539":534482,"2ЭС5К_540":570016,"2ЭС5К_541":664245,"2ЭС5К_542":452008,"2ЭС5К_543":664740,"2ЭС5К_544":432577,"2ЭС5К_545":675715,"2ЭС5К_546":235487,"2ЭС5К_547":484134,"2ЭС5К_548":490820,"2ЭС5К_549":527636,"2ЭС5К_550":504603,"2ЭС5К_551":451238,"2ЭС5К_552":585659,"2ЭС5К_553":449995,"2ЭС5К_554":459967,"2ЭС5К_555":292554,"2ЭС5К_556":291217,"2ЭС5К_557":295993,"2ЭС5К_558":287851,"2ЭС5К_559":285357,"2ЭС5К_560":285691,"2ЭС5К_561":279763,"2ЭС5К_562":282315,"2ЭС5К_563":295030,"2ЭС5К_564":288224,"2ЭС5К_565":204682,"2ЭС5К_566":114500,"2ЭС5К_567":212957,"2ЭС5К_568":340314,"2ЭС5К_569":496080,"2ЭС5К_570":460728,"2ЭС5К_571":454819,"2ЭС5К_572":481764,"2ЭС5К_573":489535,"2ЭС5К_574":416086,"2ЭС5К_575":474678,"2ЭС5К_576":479662,"2ЭС5К_577":458136,"2ЭС5К_578":421354,"2ЭС5К_579":411902,"2ЭС5К_580":403174,"2ЭС5К_581":438551,"2ЭС5К_582":411882,"2ЭС5К_583":422549,"2ЭС5К_584":470948,"2ЭС5К_585":436695,"2ЭС5К_586":447999,"2ЭС5К_587":481853,"2ЭС5К_588":427439,"2ЭС5К_589":444021,"2ЭС5К_590":215171,"2ЭС5К_591":565188,"2ЭС5К_592":603426,"2ЭС5К_593":617625,"2ЭС5К_594":619010,"2ЭС5К_595":605409,"2ЭС5К_596":586010,"2ЭС5К_597":574628,"2ЭС5К_598":603109,"2ЭС5К_599":604564,"2ЭС5К_600":587042,"2ЭС5К_601":593402,"2ЭС5К_602":624852,"2ЭС5К_603":600674,"2ЭС5К_604":541435,"2ЭС5К_605":570800,"2ЭС5К_606":586704,"2ЭС5К_607":588878,"2ЭС5К_608":559997,"2ЭС5К_609":544621,"2ЭС5К_610":502357,"2ЭС5К_611":536230,"2ЭС5К_612":482083,"2ЭС5К_613":552204,"2ЭС5К_614":514309,"2ЭС5К_615":496218,"2ЭС5К_616":509664,"2ЭС5К_617":432662,"2ЭС5К_618":511445,"2ЭС5К_619":529716,"2ЭС5К_620":524441,"2ЭС5К_621":314251,"2ЭС5К_622":299177,"2ЭС5К_623":280538,"2ЭС5К_624":268701,"2ЭС5К_625":315797,"2ЭС5К_626":301291,"2ЭС5К_627":312162,"2ЭС5К_628":254952,"2ЭС5К_629":302929,"2ЭС5К_630":324914,"2ЭС5К_631":291167,"2ЭС5К_632":279055,"2ЭС5К_633":320151,"2ЭС5К_634":280317,"2ЭС5К_635":274930,"2ЭС5К_636":309148,"2ЭС5К_637":270803,"2ЭС5К_638":256628,"2ЭС5К_639":272046,"2ЭС5К_640":269538,"2ЭС5К_641":279331,"2ЭС5К_642":297953,"2ЭС5К_643":271074,"2ЭС5К_644":307657,"2ЭС5К_645":259548,"2ЭС5К_646":287485,"2ЭС5К_647":65607,"2ЭС5К_648":273763,"2ЭС5К_649":201469,"2ЭС5К_650":270723,"2ЭС5К_651":275575,"2ЭС5К_652":275247,"2ЭС5К_653":275332,"2ЭС5К_654":274806,"2ЭС5К_655":274903,"2ЭС5К_656":275346,"2ЭС5К_657":272494,"2ЭС5К_658":265578,"2ЭС5К_659":265623,"2ЭС5К_660":260700,"2ЭС5К_661":224101,"2ЭС5К_662":274760,"2ЭС5К_663":249165,"2ЭС5К_664":231120,"2ЭС5К_665":225528,"2ЭС5К_666":248334,"2ЭС5К_667":237532,"2ЭС5К_668":250189,"2ЭС5К_669":249401,"2ЭС5К_670":257656,"2ЭС5К_671":231250,"2ЭС5К_672":241589,"2ЭС5К_673":188019,"2ЭС5К_674":225074,"2ЭС5К_675":221673,"2ЭС5К_676":195356,"2ЭС5К_677":204445,"2ЭС5К_678":215611,"2ЭС5К_679":252206,"2ЭС5К_680":263459,"2ЭС5К_681":243339,"2ЭС5К_682":233280,"2ЭС5К_683":223739,"2ЭС5К_684":242553,"2ЭС5К_685":211199,"2ЭС5К_686":248261,"2ЭС5К_687":214637,"2ЭС5К_688":250507,"2ЭС5К_689":218735,"2ЭС5К_690":251200,"2ЭС5К_691":245772,"2ЭС5К_692":235717,"2ЭС5К_693":236850,"2ЭС5К_694":258062,"2ЭС5К_695":222369,"2ЭС5К_696":234140,"2ЭС5К_697":226627,"2ЭС5К_698":254714,"2ЭС5К_699":367732,"2ЭС5К_700":302685,"2ЭС5К_701":327268,"2ЭС5К_702":376786,"2ЭС5К_703":356212,"2ЭС5К_704":347781,"2ЭС5К_705":386393,"2ЭС5К_706":361638,"2ЭС5К_707":376507,"2ЭС5К_708":344287,"2ЭС5К_709":372673,"2ЭС5К_710":345822,"2ЭС5К_711":371035,"2ЭС5К_712":373399,"2ЭС5К_713":355397,"2ЭС5К_714":347174,"2ЭС5К_715":348047,"2ЭС5К_716":330094,"2ЭС5К_717":357996,"2ЭС5К_718":266817,"2ЭС5К_719":322321,"2ЭС5К_720":351310,"2ЭС5К_721":339683,"2ЭС5К_722":326862,"2ЭС5К_723":350983,"2ЭС5К_724":355079,"2ЭС5К_725":336823,"2ЭС5К_726":309992,"2ЭС5К_727":326351,"2ЭС5К_728":329802,"2ЭС5К_729":333225,"2ЭС5К_730":319326,"2ЭС5К_731":317351,"2ЭС5К_732":311655,"2ЭС5К_733":304218,"2ЭС5К_734":323330,"2ЭС5К_735":327594,"2ЭС5К_736":325565,"2ЭС5К_737":334213,"2ЭС5К_738":325123,"2ЭС5К_739":326522,"2ЭС5К_740":315772,"2ЭС5К_741":331222,"2ЭС5К_742":326184,"2ЭС5К_743":285411,"2ЭС5К_744":305810,"2ЭС5К_745":318201,"2ЭС5К_746":312527,"2ЭС5К_747":265478,"2ЭС5К_748":305205,"2ЭС5К_749":297936,"2ЭС5К_750":266739,"2ЭС5К_751":229043,"2ЭС5К_752":242345,"2ЭС5К_753":258495,"2ЭС5К_754":165091,"2ЭС5К_755":160988,"2ЭС5К_756":176487,"2ЭС5К_757":145380,"2ЭС5К_758":163735,"2ЭС5К_759":154577,"2ЭС5К_760":172934,"2ЭС5К_761":153968,"2ЭС5К_762":131657,"2ЭС5К_763":143227,"2ЭС5К_764":137951,"2ЭС5К_765":157387,"2ЭС5К_766":82749,"2ЭС5К_767":146317,"2ЭС5К_768":129864,"2ЭС5К_769":147753,"2ЭС5К_770":129698,"2ЭС5К_771":125815,"2ЭС5К_772":132235,"2ЭС5К_773":113860,"2ЭС5К_774":114756,"2ЭС5К_775":102464,"2ЭС5К_776":110187,"2ЭС5К_777":128111,"2ЭС5К_778":114522,"2ЭС5К_779":106648,"2ЭС5К_780":94258,"2ЭС5К_781":97608,"2ЭС5К_782":94720,"2ЭС5К_783":97593,"2ЭС5К_784":88242,"2ЭС5К_785":103697,"2ЭС5К_786":99507,"2ЭС5К_787":93164,"2ЭС5К_788":95323,"2ЭС5К_789":99022,"2ЭС5К_790":76917,"2ЭС5К_791":99302,"2ЭС5К_792":104034,"2ЭС5К_793":92905,"2ЭС5К_794":102462,"2ЭС5К_795":78918,"2ЭС5К_796":94612,"2ЭС5К_797":102999,"2ЭС5К_798":97996,"2ЭС5К_799":60471,"2ЭС5К_800":53502,"2ЭС5К_801":51396,"2ЭС5К_802":56999,"2ЭС5К_803":62701,"2ЭС5К_804":60010,"2ЭС5К_805":57211,"2ЭС5К_806":47651,"2ЭС5К_807":52100,"2ЭС5К_808":58008,"2ЭС5К_809":60955,"2ЭС5К_810":68902,"2ЭС5К_811":55621,"2ЭС5К_812":49393,"2ЭС5К_813":54704,"2ЭС5К_814":55663,"2ЭС5К_815":57582,"2ЭС5К_816":65056,"2ЭС5К_817":58853,"2ЭС5К_818":49923,"2ЭС5К_819":63508,"2ЭС5К_820":11522,"2ЭС5К_821":36227,"2ЭС5К_822":67429,"2ЭС5К_823":55206,"2ЭС5К_824":51884,"2ЭС5К_825":63556,"2ЭС5К_826":37088,"2ЭС5К_827":37320,"2ЭС5К_828":45301,"2ЭС5К_829":18737,"2ЭС5К_830":24809,"3ЭС5К_814":1932638,"3ЭС5К_815":1955730,"3ЭС5К_816":1883938,"3ЭС5К_817":1624288,"3ЭС5К_818":1880857,"3ЭС5К_819":1764998,"3ЭС5К_820":1855142,"3ЭС5К_821":1927610,"3ЭС5К_822":1866520,"3ЭС5К_823":1821371,"3ЭС5К_824":1977661,"3ЭС5К_825":1945378,"3ЭС5К_826":1888290,"3ЭС5К_827":1898010,"3ЭС5К_828":1949334,"3ЭС5К_829":1813437,"3ЭС5К_830":1873779,"3ЭС5К_831":1818472,"3ЭС5К_832":1874122,"3ЭС5К_833":1846018,"3ЭС5К_834":1840579,"3ЭС5К_835":1890309,"3ЭС5К_836":1779685,"3ЭС5К_837":1799618,"3ЭС5К_838":1811771,"3ЭС5К_839":1510212,"3ЭС5К_840":1472436,"3ЭС5К_841":1484185,"3ЭС5К_842":1405206,"3ЭС5К_843":1481921,"3ЭС5К_844":1455961,"3ЭС5К_845":1415147,"3ЭС5К_846":1465042,"3ЭС5К_847":1431396,"3ЭС5К_848":1480992,"3ЭС5К_849":1448025,"3ЭС5К_850":1459659,"3ЭС5К_851":1442470,"3ЭС5К_852":1416342,"3ЭС5К_853":1346579,"3ЭС5К_854":1372837,"3ЭС5К_855":1215526,"3ЭС5К_856":1417220,"3ЭС5К_857":1377398,"3ЭС5К_858":1436592,"3ЭС5К_859":1344669,"3ЭС5К_860":1361827,"3ЭС5К_861":1264890,"3ЭС5К_862":1425758,"3ЭС5К_863":1369488,"3ЭС5К_864":1379369,"3ЭС5К_865":1424538,"3ЭС5К_866":1428575,"3ЭС5К_867":1377288,"3ЭС5К_868":1555444,"3ЭС5К_869":1457512,"3ЭС5К_870":1438627,"3ЭС5К_871":1486349,"3ЭС5К_872":1463496,"3ЭС5К_873":1445339,"3ЭС5К_874":1459825,"3ЭС5К_875":1457325,"3ЭС5К_876":879349,"3ЭС5К_877":830448,"3ЭС5К_878":874120,"3ЭС5К_879":879064,"3ЭС5К_880":874230,"3ЭС5К_881":847553,"3ЭС5К_882":831829,"3ЭС5К_883":906848,"3ЭС5К_884":964343,"3ЭС5К_885":956193,"3ЭС5К_886":1362410,"3ЭС5К_887":1356800,"3ЭС5К_888":1337077,"3ЭС5К_889":1336227,"3ЭС5К_890":1341009,"3ЭС5К_891":1304787,"3ЭС5К_892":1300044,"3ЭС5К_893":1317605,"3ЭС5К_894":1377573,"3ЭС5К_895":1331426,"3ЭС5К_896":1444253,"3ЭС5К_897":1456910,"3ЭС5К_898":1477726,"3ЭС5К_899":1430373,"3ЭС5К_900":1452081,"3ЭС5К_901":1468730,"3ЭС5К_902":1523487,"3ЭС5К_905":1381664,"3ЭС5К_906":1470171,"3ЭС5К_907":1491015,"3ЭС5К_908":1414774,"3ЭС5К_909":1417571,"3ЭС5К_910":1428787,"3ЭС5К_911":1366059,"3ЭС5К_912":1394260,"3ЭС5К_913":1436046,"3ЭС5К_914":1431818,"3ЭС5К_915":1415133,"3ЭС5К_916":1407900,"3ЭС5К_917":1413250,"3ЭС5К_918":1391528,"3ЭС5К_919":1344802,"3ЭС5К_920":1377615,"3ЭС5К_921":1342064,"3ЭС5К_922":1407275,"3ЭС5К_923":1368212,"3ЭС5К_924":1359440,"3ЭС5К_925":1384491,"3ЭС5К_926":1341152,"3ЭС5К_927":1376046,"3ЭС5К_928":1431907,"3ЭС5К_929":1317004,"3ЭС5К_930":1360133,"3ЭС5К_931":1381358,"3ЭС5К_932":1293828,"3ЭС5К_933":1381826,"3ЭС5К_934":1379270,"3ЭС5К_935":1376298,"3ЭС5К_936":1372139,"3ЭС5К_937":1357033,"3ЭС5К_938":1331827,"3ЭС5К_939":1310405,"3ЭС5К_940":1311383,"3ЭС5К_941":1086888,"3ЭС5К_942":1372999,"3ЭС5К_943":1363790,"3ЭС5К_944":1376501,"3ЭС5К_945":1351060,"3ЭС5К_946":1373170,"3ЭС5К_947":1305335,"3ЭС5К_948":1404062,"3ЭС5К_949":1291045,"3ЭС5К_950":1272332,"3ЭС5К_951":1349135,"3ЭС5К_952":1327481,"3ЭС5К_953":1365386,"3ЭС5К_954":1334219,"3ЭС5К_955":1369377,"3ЭС5К_956":1381220,"3ЭС5К_957":1368614,"3ЭС5К_958":1383745,"3ЭС5К_959":1368700,"3ЭС5К_960":1348510,"3ЭС5К_961":1326528,"3ЭС5К_962":1316843,"3ЭС5К_963":1371690,"3ЭС5К_964":1318364,"3ЭС5К_965":1321660,"3ЭС5К_966":1362753,"3ЭС5К_967":1335146,"3ЭС5К_968":1334365,"3ЭС5К_969":1291153,"3ЭС5К_970":1347797,"3ЭС5К_971":1321892,"3ЭС5К_972":1360812,"3ЭС5К_973":1281101,"3ЭС5К_974":1329844,"3ЭС5К_975":1347318,"3ЭС5К_976":1349909,"3ЭС5К_977":1311856,"3ЭС5К_978":1346258,"3ЭС5К_979":1323507,"3ЭС5К_980":1360165,"3ЭС5К_981":1365342,"3ЭС5К_982":1322125,"3ЭС5К_983":1340166,"3ЭС5К_984":1298799,"3ЭС5К_985":1307306,"3ЭС5К_986":1335115,"3ЭС5К_987":1290229,"3ЭС5К_988":1334266,"3ЭС5К_989":1313762,"3ЭС5К_990":1328632,"3ЭС5К_991":1309824,"3ЭС5К_992":1316154,"3ЭС5К_993":1341633,"3ЭС5К_994":1316961,"3ЭС5К_995":1290029,"3ЭС5К_996":1334131,"3ЭС5К_997":1286894,"3ЭС5К_998":1280889,"3ЭС5К_999":1315748,"3ЭС5К_1000":1217992,"3ЭС5К_1006":1225006,"3ЭС5К_1007":1239265,"3ЭС5К_1008":1289899,"3ЭС5К_1009":1312568,"3ЭС5К_1010":1261482,"3ЭС5К_1011":1184583,"3ЭС5К_1012":1324904,"3ЭС5К_1013":1268674,"3ЭС5К_1014":1095949,"3ЭС5К_1015":1224475,"3ЭС5К_1016":1296213,"3ЭС5К_1017":1325551,"3ЭС5К_1018":1243150,"3ЭС5К_1019":1286223,"3ЭС5К_1020":989715,"3ЭС5К_1021":1289199,"3ЭС5К_1022":1274243,"3ЭС5К_1023":1267421,"3ЭС5К_1024":1249122,"3ЭС5К_1025":1264162,"3ЭС5К_1026":1260970,"3ЭС5К_1027":1255232,"3ЭС5К_1028":1236405,"3ЭС5К_1029":1239663,"3ЭС5К_1030":1296635,"3ЭС5К_1031":1278363,"3ЭС5К_1032":1240188,"3ЭС5К_1033":1200498,"3ЭС5К_1034":1207581,"3ЭС5К_1035":1236658,"3ЭС5К_1036":1182871,"3ЭС5К_1037":1205145,"3ЭС5К_1038":1258039,"3ЭС5К_1039":1207689,"3ЭС5К_1040":1255081,"3ЭС5К_1041":1171943,"3ЭС5К_1042":1227719,"3ЭС5К_1043":1104256,"3ЭС5К_1044":1205660,"3ЭС5К_1045":1251458,"3ЭС5К_1046":1021839,"3ЭС5К_1047":1212271,"3ЭС5К_1048":1194222,"3ЭС5К_1049":1126500,"3ЭС5К_1050":1194183,"3ЭС5К_1051":1192935,"3ЭС5К_1052":1269425,"3ЭС5К_1053":1189609,"3ЭС5К_1054":1162719,"3ЭС5К_1055":1181380,"3ЭС5К_1056":1199332,"3ЭС5К_1057":1116531,"3ЭС5К_1058":1261159,"3ЭС5К_1059":1224617,"3ЭС5К_1060":1112329,"3ЭС5К_1061":1102190,"3ЭС5К_1062":1184589,"3ЭС5К_1063":1204439,"3ЭС5К_1064":1084269,"3ЭС5К_1065":1109749,"3ЭС5К_1066":1105405,"3ЭС5К_1067":1161673,"3ЭС5К_1068":1194554,"3ЭС5К_1069":1098368,"3ЭС5К_1070":1160443,"3ЭС5К_1071":1123008,"3ЭС5К_1072":1128157,"3ЭС5К_1073":1135510,"3ЭС5К_1074":1194866,"3ЭС5К_1075":1200798,"3ЭС5К_1076":1192195,"3ЭС5К_1077":1174316,"3ЭС5К_1078":1148329,"3ЭС5К_1079":1190374,"3ЭС5К_1080":1118412,"3ЭС5К_1081":1195213,"3ЭС5К_1082":1156893,"3ЭС5К_1083":1169194,"3ЭС5К_1084":1209251,"3ЭС5К_1085":1150121,"3ЭС5К_1086":1133013,"3ЭС5К_1087":1104544,"3ЭС5К_1088":1124855,"3ЭС5К_1089":1185222,"3ЭС5К_1090":1089611,"3ЭС5К_1091":1153157,"3ЭС5К_1092":1173838,"3ЭС5К_1093":1195500,"3ЭС5К_1094":1148342,"3ЭС5К_1095":1150721,"3ЭС5К_1096":1165990,"3ЭС5К_1097":1117478,"3ЭС5К_1098":1102596,"3ЭС5К_1099":1127629,"3ЭС5К_1100":1136592,"3ЭС5К_1101":1142128,"3ЭС5К_1102":1096587,"3ЭС5К_1103":1158473,"3ЭС5К_1104":1099385,"3ЭС5К_1105":1147522,"3ЭС5К_1106":1122990,"3ЭС5К_1107":1102954,"3ЭС5К_1108":1143338,"3ЭС5К_1109":1091190,"3ЭС5К_1110":1097623,"3ЭС5К_1111":1090917,"3ЭС5К_1112":1101493,"3ЭС5К_1113":1140926,"3ЭС5К_1114":1116557,"3ЭС5К_1115":1093965,"3ЭС5К_1116":1130718,"3ЭС5К_1117":1124623,"3ЭС5К_1118":1111878,"3ЭС5К_1119":1114551,"3ЭС5К_1120":1091771,"3ЭС5К_1121":1099925,"3ЭС5К_1122":1103487,"3ЭС5К_1123":1115223,"3ЭС5К_1124":1097029,"3ЭС5К_1125":1119181,"3ЭС5К_1126":1087243,"3ЭС5К_1127":1081823,"3ЭС5К_1128":1094714,"3ЭС5К_1129":1092522,"3ЭС5К_1130":1061446,"3ЭС5К_1131":415885,"3ЭС5К_1132":418561,"3ЭС5К_1133":402445,"3ЭС5К_1134":402729,"3ЭС5К_1135":408292,"3ЭС5К_1136":374406,"3ЭС5К_1137":390026,"3ЭС5К_1138":384566,"3ЭС5К_1139":385525,"3ЭС5К_1140":381274,"3ЭС5К_1141":365086,"3ЭС5К_1142":380684,"3ЭС5К_1143":358856,"3ЭС5К_1144":372058,"3ЭС5К_1145":1041444,"3ЭС5К_1146":1052939,"3ЭС5К_1147":841174,"3ЭС5К_1148":1079876,"3ЭС5К_1149":1084648,"3ЭС5К_1150":1041082,"3ЭС5К_1151":1076260,"3ЭС5К_1152":1041365,"3ЭС5К_1153":1018040,"3ЭС5К_1154":1047067,"3ЭС5К_1155":1041344,"3ЭС5К_1156":1054551,"3ЭС5К_1157":996566,"3ЭС5К_1158":1025980,"3ЭС5К_1159":1083793,"3ЭС5К_1160":1010036,"3ЭС5К_1161":1095544,"3ЭС5К_1162":1023509,"3ЭС5К_1163":1070503,"3ЭС5К_1164":1049767,"3ЭС5К_1165":1026146,"3ЭС5К_1166":1053979,"3ЭС5К_1167":1046548,"3ЭС5К_1168":1064747,"3ЭС5К_1169":1037492,"3ЭС5К_1170":1019589,"3ЭС5К_1171":1066059,"3ЭС5К_1172":1016238,"3ЭС5К_1173":1060971,"3ЭС5К_1174":1073748,"3ЭС5К_1175":1055392,"3ЭС5К_1176":1057391,"3ЭС5К_1177":990908,"3ЭС5К_1178":1057613,"3ЭС5К_1179":1067035,"3ЭС5К_1180":1013995,"3ЭС5К_1181":1046764,"3ЭС5К_1182":1015693,"3ЭС5К_1183":1003456,"3ЭС5К_1184":1023082,"3ЭС5К_1185":993052,"3ЭС5К_1186":1030528,"3ЭС5К_1187":1021185,"3ЭС5К_1188":1001653,"3ЭС5К_1189":1016233,"3ЭС5К_1190":1003095,"3ЭС5К_1191":1030149,"3ЭС5К_1192":1018817,"3ЭС5К_1193":1052781,"3ЭС5К_1194":1023661,"3ЭС5К_1195":1002275,"3ЭС5К_1196":988810,"3ЭС5К_1197":1000329,"3ЭС5К_1198":966406,"3ЭС5К_1199":1006987,"3ЭС5К_1200":1023462,"3ЭС5К_1201":1025663,"3ЭС5К_1202":1028546,"3ЭС5К_1203":962555,"3ЭС5К_1204":1018900,"3ЭС5К_1205":1028558,"3ЭС5К_1206":1014944,"3ЭС5К_1207":1007767,"3ЭС5К_1208":993299,"3ЭС5К_1209":1026755,"3ЭС5К_1210":1000838,"3ЭС5К_1211":1014204,"3ЭС5К_1212":1010800,"3ЭС5К_1213":1008154,"3ЭС5К_1214":737029,"3ЭС5К_1215":1025475,"3ЭС5К_1216":991697,"3ЭС5К_1217":976578,"3ЭС5К_1218":1003890,"3ЭС5К_1219":1009820,"3ЭС5К_1220":1018899,"3ЭС5К_1221":1020314,"3ЭС5К_1222":1007178,"3ЭС5К_1223":989519,"3ЭС5К_1224":1000552,"3ЭС5К_1225":1000016,"3ЭС5К_1226":996649,"3ЭС5К_1227":1001576,"3ЭС5К_1228":989374,"3ЭС5К_1229":984749,"3ЭС5К_1230":993680,"3ЭС5К_1231":981186,"3ЭС5К_1232":1005717,"3ЭС5К_1233":989943,"3ЭС5К_1234":995969,"3ЭС5К_1235":972045,"3ЭС5К_1236":1001028,"3ЭС5К_1237":982560,"3ЭС5К_1238":951758,"3ЭС5К_1239":971603,"3ЭС5К_1240":936767,"3ЭС5К_1241":990081,"3ЭС5К_1242":962403,"3ЭС5К_1243":920181,"3ЭС5К_1244":933835,"3ЭС5К_1245":888624,"3ЭС5К_1246":916887,"3ЭС5К_1247":921875,"3ЭС5К_1248":944079,"3ЭС5К_1249":902573,"3ЭС5К_1250":927862,"3ЭС5К_1251":857593,"3ЭС5К_1252":967948,"3ЭС5К_1253":925338,"3ЭС5К_1254":905450,"3ЭС5К_1255":926180,"3ЭС5К_1256":909873,"3ЭС5К_1257":937109,"3ЭС5К_1258":906688,"3ЭС5К_1259":902227,"3ЭС5К_1260":918969,"3ЭС5К_1261":852166,"3ЭС5К_1262":872575,"3ЭС5К_1263":892154,"3ЭС5К_1264":909148,"3ЭС5К_1265":865753,"3ЭС5К_1266":873460,"3ЭС5К_1267":887359,"3ЭС5К_1268":875680,"3ЭС5К_1269":875497,"3ЭС5К_1270":916684,"3ЭС5К_1271":887845,"3ЭС5К_1272":844212,"3ЭС5К_1273":856809,"3ЭС5К_1274":816592,"3ЭС5К_1275":885520,"3ЭС5К_1276":902124,"3ЭС5К_1277":851071,"3ЭС5К_1278":925194,"3ЭС5К_1279":877803,"3ЭС5К_1280":900969,"3ЭС5К_1281":518321,"3ЭС5К_1282":883775,"3ЭС5К_1283":881413,"3ЭС5К_1284":858971,"3ЭС5К_1285":870696,"3ЭС5К_1286":872784,"3ЭС5К_1287":881189,"3ЭС5К_1288":891962,"3ЭС5К_1289":892689,"3ЭС5К_1290":868342,"3ЭС5К_1291":886358,"3ЭС5К_1292":866585,"3ЭС5К_1293":861715,"3ЭС5К_1294":906578,"3ЭС5К_1295":875176,"3ЭС5К_1296":843018,"3ЭС5К_1297":848129,"3ЭС5К_1298":820592,"3ЭС5К_1299":851466,"3ЭС5К_1300":850029,"3ЭС5К_1301":862844,"3ЭС5К_1302":833910,"3ЭС5К_1303":886148,"3ЭС5К_1304":861447,"3ЭС5К_1305":852899,"3ЭС5К_1306":860140,"3ЭС5К_1307":887987,"3ЭС5К_1308":817620,"3ЭС5К_1309":879460,"3ЭС5К_1310":869840,"3ЭС5К_1311":885989,"3ЭС5К_1312":859380,"3ЭС5К_1313":860978,"3ЭС5К_1314":863888,"3ЭС5К_1315":817737,"3ЭС5К_1316":877149,"3ЭС5К_1317":834275,"3ЭС5К_1318":847215,"3ЭС5К_1319":849276,"3ЭС5К_1320":833477,"3ЭС5К_1321":864221,"3ЭС5К_1322":829665,"3ЭС5К_1323":839931,"3ЭС5К_1324":816616,"3ЭС5К_1325":856127,"3ЭС5К_1326":848418,"3ЭС5К_1327":857483,"3ЭС5К_1328":856189,"3ЭС5К_1329":874460,"3ЭС5К_1330":836569,"3ЭС5К_1331":828485,"3ЭС5К_1332":879018,"3ЭС5К_1333":782035,"3ЭС5К_1334":842549,"3ЭС5К_1335":859840,"3ЭС5К_1336":821408,"3ЭС5К_1337":842004,"3ЭС5К_1338":804589,"3ЭС5К_1339":823089,"3ЭС5К_1340":846113,"3ЭС5К_1341":806991,"3ЭС5К_1342":828230,"3ЭС5К_1343":819269,"3ЭС5К_1344":814077,"3ЭС5К_1345":803400,"3ЭС5К_1346":764799,"3ЭС5К_1347":795026,"3ЭС5К_1348":819921,"3ЭС5К_1349":817362,"3ЭС5К_1350":821303,"3ЭС5К_1351":774939,"3ЭС5К_1352":771489,"3ЭС5К_1353":776766,"3ЭС5К_1354":774064,"3ЭС5К_1355":830717,"3ЭС5К_1356":739445,"3ЭС5К_1357":784797,"3ЭС5К_1358":844121,"3ЭС5К_1359":785609,"3ЭС5К_1360":813366,"3ЭС5К_1361":790822,"3ЭС5К_1362":773694,"3ЭС5К_1363":798406,"3ЭС5К_1364":751676,"3ЭС5К_1365":762414,"3ЭС5К_1366":790923,"3ЭС5К_1367":728387,"3ЭС5К_1368":801832,"3ЭС5К_1369":763865,"3ЭС5К_1371":780397,"3ЭС5К_1372":806105,"3ЭС5К_1373":786866,"3ЭС5К_1374":666305,"3ЭС5К_1375":817018,"3ЭС5К_1376":742938,"3ЭС5К_1377":708413,"3ЭС5К_1378":733870,"3ЭС5К_1379":764943,"3ЭС5К_1380":771160,"3ЭС5К_1381":776983,"3ЭС5К_1382":757204,"3ЭС5К_1383":754209,"3ЭС5К_1384":755146,"3ЭС5К_1385":731475,"3ЭС5К_1386":754055,"3ЭС5К_1387":751161,"3ЭС5К_1388":770508,"3ЭС5К_1389":762312,"3ЭС5К_1390":709098,"3ЭС5К_1391":633482,"3ЭС5К_1392":694305,"3ЭС5К_1393":753875,"3ЭС5К_1394":745863,"3ЭС5К_1395":731467,"3ЭС5К_1396":738015,"3ЭС5К_1397":733474,"3ЭС5К_1398":741653,"3ЭС5К_1399":718596,"3ЭС5К_1400":737759,"3ЭС5К_1401":733804,"3ЭС5К_1402":741479,"3ЭС5К_1403":706966,"3ЭС5К_1404":739615,"3ЭС5К_1405":698701,"3ЭС5К_1406":546805,"3ЭС5К_1407":725970,"3ЭС5К_1408":731328,"3ЭС5К_1409":683595,"3ЭС5К_1410":684480,"3ЭС5К_1411":751567,"3ЭС5К_1412":755531,"3ЭС5К_1413":703575,"3ЭС5К_1414":676266,"3ЭС5К_1415":715379,"3ЭС5К_1416":709468,"3ЭС5К_1417":698628,"3ЭС5К_1418":649250,"3ЭС5К_1419":716994,"3ЭС5К_1420":724858,"3ЭС5К_1421":671771,"3ЭС5К_1422":644583,"3ЭС5К_1423":658507,"3ЭС5К_1424":679367,"3ЭС5К_1425":683129,"3ЭС5К_1426":678581,"3ЭС5К_1427":703183,"3ЭС5К_1428":698429,"3ЭС5К_1429":657884,"3ЭС5К_1430":600534,"3ЭС5К_1431":667779,"3ЭС5К_1432":640654,"3ЭС5К_1433":639073,"3ЭС5К_1434":651095,"3ЭС5К_1435":694730,"3ЭС5К_1436":634520,"3ЭС5К_1437":673567,"3ЭС5К_1438":657442,"3ЭС5К_1439":646508,"3ЭС5К_1440":667323,"3ЭС5К_1441":669493,"3ЭС5К_1442":646933,"3ЭС5К_1443":633375,"3ЭС5К_1444":652618,"3ЭС5К_1445":640523,"3ЭС5К_1446":635506,"3ЭС5К_1447":642514,"3ЭС5К_1448":612056,"3ЭС5К_1449":638216,"3ЭС5К_1450":620606,"3ЭС5К_1451":638012,"3ЭС5К_1452":614010,"3ЭС5К_1453":584225,"3ЭС5К_1454":610762,"3ЭС5К_1455":641309,"3ЭС5К_1456":606052,"3ЭС5К_1457":606830,"3ЭС5К_1458":619739,"3ЭС5К_1459":611850,"3ЭС5К_1460":586970,"3ЭС5К_1461":584153,"3ЭС5К_1462":573469,"3ЭС5К_1463":557796,"3ЭС5К_1464":616338,"3ЭС5К_1465":582253,"3ЭС5К_1466":573821,"3ЭС5К_1467":606300,"3ЭС5К_1468":580755,"3ЭС5К_1469":579009,"3ЭС5К_1470":566908,"3ЭС5К_1471":547399,"3ЭС5К_1472":541762,"3ЭС5К_1473":538114,"3ЭС5К_1474":616818,"3ЭС5К_1475":591225,"3ЭС5К_1476":587126,"3ЭС5К_1477":584256,"3ЭС5К_1478":580793,"3ЭС5К_1479":574133,"3ЭС5К_1480":588169,"3ЭС5К_1481":607974,"3ЭС5К_1482":556662,"3ЭС5К_1483":532172,"3ЭС5К_1484":533843,"3ЭС5К_1485":559593,"3ЭС5К_1486":560341,"3ЭС5К_1487":536879,"3ЭС5К_1488":543229,"3ЭС5К_1489":599609,"3ЭС5К_1490":551832,"3ЭС5К_1491":572924,"3ЭС5К_1492":552155,"3ЭС5К_1493":573526,"3ЭС5К_1494":585178,"3ЭС5К_1495":547145,"3ЭС5К_1496":532521,"3ЭС5К_1497":520162,"3ЭС5К_1498":573201,"3ЭС5К_1499":548486,"3ЭС5К_1500":566475,"3ЭС5К_1501":578160,"3ЭС5К_1502":549475,"3ЭС5К_1503":552863,"3ЭС5К_1504":549932,"3ЭС5К_1505":567759,"3ЭС5К_1506":551835,"3ЭС5К_1507":568389,"3ЭС5К_1508":561347,"3ЭС5К_1509":563375,"3ЭС5К_1510":535773,"3ЭС5К_1511":541284,"3ЭС5К_1512":551774,"3ЭС5К_1513":541381,"3ЭС5К_1514":539746,"3ЭС5К_1515":521718,"3ЭС5К_1516":529098,"3ЭС5К_1517":511293,"3ЭС5К_1518":530636,"3ЭС5К_1519":528562,"3ЭС5К_1520":528676,"3ЭС5К_1521":515072,"3ЭС5К_1522":508108,"3ЭС5К_1523":523578,"3ЭС5К_1524":526675,"3ЭС5К_1525":486772,"3ЭС5К_1526":502091,"3ЭС5К_1527":438795,"3ЭС5К_1528":496535,"3ЭС5К_1529":497448,"3ЭС5К_1530":492164,"3ЭС5К_1531":479333,"3ЭС5К_1532":501592,"3ЭС5К_1533":499789,"3ЭС5К_1534":476245,"3ЭС5К_1535":517518,"3ЭС5К_1536":502559,"3ЭС5К_1537":486255,"3ЭС5К_1538":494655,"3ЭС5К_1539":479787,"3ЭС5К_1540":470745,"3ЭС5К_1541":460014,"3ЭС5К_1542":461734,"3ЭС5К_1543":466015,"3ЭС5К_1544":473543,"3ЭС5К_1545":455638,"3ЭС5К_1546":468021,"3ЭС5К_1547":464918,"3ЭС5К_1548":462003,"3ЭС5К_1549":477688,"3ЭС5К_1550":450357,"3ЭС5К_1551":431875,"3ЭС5К_1552":452945,"3ЭС5К_1553":449577,"3ЭС5К_1554":453120,"3ЭС5К_1555":446472,"3ЭС5К_1556":446328,"3ЭС5К_1557":443594,"3ЭС5К_1558":397613,"3ЭС5К_1559":452184,"3ЭС5К_1560":427739,"3ЭС5К_1561":421291,"3ЭС5К_1562":434123,"3ЭС5К_1563":408940,"3ЭС5К_1564":427343,"3ЭС5К_1565":428429,"3ЭС5К_1566":458697,"3ЭС5К_1567":532883,"3ЭС5К_1568":504747,"3ЭС5К_1569":502066,"3ЭС5К_1570":513101,"3ЭС5К_1571":512440,"3ЭС5К_1572":513352,"3ЭС5К_1573":527160,"3ЭС5К_1574":516440,"3ЭС5К_1575":521564,"3ЭС5К_1576":336354,"3ЭС5К_1577":339510,"3ЭС5К_1578":350384,"3ЭС5К_1579":351131,"3ЭС5К_1580":342099,"3ЭС5К_1581":345755,"3ЭС5К_1582":351796,"3ЭС5К_1583":361833,"3ЭС5К_1584":358898,"3ЭС5К_1585":352278,"3ЭС5К_1586":340393,"3ЭС5К_1587":368606,"3ЭС5К_1588":339187,"3ЭС5К_1589":341559,"3ЭС5К_1590":329196,"3ЭС5К_1591":330382,"3ЭС5К_1592":326779,"3ЭС5К_1593":342273,"3ЭС5К_1594":312680,"3ЭС5К_1595":316042,"3ЭС5К_1596":298624,"3ЭС5К_1597":293886,"3ЭС5К_1598":309932,"3ЭС5К_1599":295627,"3ЭС5К_1600":310039,"3ЭС5К_1601":298868,"3ЭС5К_1602":292334,"3ЭС5К_1603":283748,"3ЭС5К_1604":286079,"3ЭС5К_1605":254154,"3ЭС5К_1606":261848,"3ЭС5К_1607":250611,"3ЭС5К_1608":269800,"3ЭС5К_1609":257339,"3ЭС5К_1610":261625,"3ЭС5К_1611":253104,"3ЭС5К_1612":263370,"3ЭС5К_1613":260548,"3ЭС5К_1614":240477,"3ЭС5К_1615":245553,"3ЭС5К_1616":248106,"3ЭС5К_1617":233092,"3ЭС5К_1618":232415,"3ЭС5К_1619":236759,"3ЭС5К_1620":236390,"3ЭС5К_1621":224844,"3ЭС5К_1622":226842,"3ЭС5К_1623":202790,"3ЭС5К_1624":187746,"3ЭС5К_1625":202038,"3ЭС5К_1626":206410,"3ЭС5К_1627":196321,"3ЭС5К_1628":198615,"3ЭС5К_1629":179274,"3ЭС5К_1630":170923,"3ЭС5К_1631":164470,"3ЭС5К_1632":172583,"3ЭС5К_1633":190405,"3ЭС5К_1634":168003,"3ЭС5К_1635":174665,"3ЭС5К_1636":157207,"3ЭС5К_1637":178855,"3ЭС5К_1638":162542,"3ЭС5К_1639":153956,"3ЭС5К_1640":153509,"3ЭС5К_1641":166941,"3ЭС5К_1642":160867,"3ЭС5К_1643":154061,"3ЭС5К_1644":129910,"3ЭС5К_1645":142010,"3ЭС5К_1646":135643,"3ЭС5К_1647":128711,"3ЭС5К_1648":132519,"3ЭС5К_1649":136770,"3ЭС5К_1650":137633,"3ЭС5К_1651":124010,"3ЭС5К_1652":95057,"3ЭС5К_1653":105304,"3ЭС5К_1654":101372,"3ЭС5К_1655":103237,"3ЭС5К_1656":101367,"3ЭС5К_1657":109891,"3ЭС5К_1658":96199,"3ЭС5К_1659":86884,"3ЭС5К_1660":93599,"3ЭС5К_1661":97697,"3ЭС5К_1662":91776,"3ЭС5К_1663":97125,"3ЭС5К_1664":83064,"3ЭС5К_1665":94152,"3ЭС5К_1666":90784,"3ЭС5К_1667":77933,"3ЭС5К_1668":80696,"3ЭС5К_1669":71722,"3ЭС5К_1670":72187,"3ЭС5К_1671":68589,"3ЭС5К_1672":64323,"3ЭС5К_1673":64955,"3ЭС5К_1674":58165,"3ЭС5К_1675":61494,"3ЭС5К_1676":55207,"3ЭС5К_1677":54412,"3ЭС5К_1678":45881,"3ЭС5К_1679":44941,"3ЭС5К_1680":52176,"3ЭС5К_1681":48915,"3ЭС5К_1682":42120,"3ЭС5К_1683":39295,"3ЭС5К_1684":36690,"3ЭС5К_1685":38318,"3ЭС5К_1686":28965,"3ЭС5К_1687":29977,"3ЭС5К_1688":30487,"3ЭС5К_1689":21500,"3ЭС5К_1690":23208,"3ЭС5К_1691":22387,"3ЭС5К_1692":17749,"3ЭС5К_1693":9894,"3ЭС5К_1694":11874,"3ЭС5К_1695":12537,"3ЭС5К_1696":13544,"4ЭС5К_4":1304805,"4ЭС5К_33":750713,"4ЭС5К_34":872985,"4ЭС5К_35":870033,"4ЭС5К_36":364180,"4ЭС5К_37":865346,"4ЭС5К_38":187975,"4ЭС5К_39":430521,"4ЭС5К_40":751573,"4ЭС5К_41":716617,"4ЭС5К_42":398391,"4ЭС5К_43":599541,"4ЭС5К_44":368432,"4ЭС5К_45":567669,"4ЭС5К_46":595860,"4ЭС5К_47":585619,"4ЭС5К_48":566301,"4ЭС5К_49":535846,"4ЭС5К_50":545717,"4ЭС5К_51":544915,"4ЭС5К_52":538623,"4ЭС5К_53":533977,"4ЭС5К_54":528722,"4ЭС5К_55":499516,"4ЭС5К_56":497533,"4ЭС5К_57":497029,"4ЭС5К_58":490583,"4ЭС5К_59":517357,"4ЭС5К_60":478551,"4ЭС5К_61":499954,"4ЭС5К_62":480877,"4ЭС5К_63":490876,"4ЭС5К_64":481279,"4ЭС5К_65":456112,"4ЭС5К_66":461355,"4ЭС5К_67":473274,"4ЭС5К_68":438660,"4ЭС5К_69":427031,"4ЭС5К_70":427865,"4ЭС5К_71":403495,"4ЭС5К_72":380923,"4ЭС5К_73":407401,"4ЭС5К_74":385553,"4ЭС5К_75":365849,"4ЭС5К_76":354457,"4ЭС5К_77":342513,"4ЭС5К_78":341518,"4ЭС5К_79":317568,"4ЭС5К_80":331068,"4ЭС5К_81":310416,"4ЭС5К_82":265077,"4ЭС5К_83":267445,"4ЭС5К_84":257846,"4ЭС5К_85":258945,"4ЭС5К_86":22480,"4ЭС5К_87":8004};

const DEPOT_PLACES={"ТЧЭ-10 Карасук":["СЛД-9 КАРАСУК","АЛТАЙСКАЯ","АРТЫШТА","ИРТЫШСКОЕ"],"ТЧЭ-11 Тимашевская":["СЛД-10 ТИМАШЕВСК-КАВ","СЛД-24 САЛЬСК-ГРУЗОВОЕ","СЛД-6 ПЕТРОВВАЛЬСКОЕ"],"ТЧЭ-7 Петров Вал":["СЛД-10 ТИМАШЕВСК-КАВ","СЛД-24 САЛЬСК-ГРУЗОВОЕ","СЛД-6 ПЕТРОВВАЛЬСКОЕ"],"ТЧЭ-5 Кандалакша":["СЛД-27 КАНДАЛАКША","СЛД-34 Красноуфимск-Уральский"],"ТЧЭ-5 Карталы":["СЛД-25 АРКАИМ"],"ТЧЭ-14 Сальск":["СЛД-10 ТИМАШЕВСК-КАВ","СЛД-24 САЛЬСК-ГРУЗОВОЕ","СЛД-6 ПЕТРОВВАЛЬСКОЕ"],"ТЧЭ-9 Лянгасово":["СЛД-27 КАНДАЛАКША","СЛД-30 ЛЯНГАСОВО-ЗАП","СЛД-34 Красноуфимск-Уральский"],"ТЧЭ-3 Чита":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК"],"ТЧЭ-7 Абакан":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-1 Боготол":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-8 Смоляниново":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-2 Хабаровск-2":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-2 Красноярск":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-11 Белогорск":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-9 Вихоревка":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-7 Улан-Удэ":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-5 Иркутск":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-3 Иланская":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-12 С-Байкальск":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"],"ТЧЭ-2 Нижнеудинск":["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ","СЛД-21 МАГДАГАЧИ","СЛД-19 РАЗДОЛЬНОЕ","СЛД-17 ЧИТА","СЛД-61 КАРЫМСКАЯ","СЛД-24 ТАЙШЕТ","СЛД-25 СЕВЕРОБАЙКАЛЬСК","СЛД-22 НИЖНЕУДИНСКОЕ","СЛД-9 КАНСК-ИЛАНСКИЙ","СЛД-10 АБАКАН","СЛД-11 БОГОТОЛ-СИБ","МЕЖДУРЕЧЕНСК","МАРИИНСК","ИРКУТСК","СЛД-38 Приморское"]};

function kzcNumbersForType(type){if(!type||!LOCOMOTIVE_DATA[type])return[];return Object.keys(LOCOMOTIVE_DATA[type]).sort((a,b)=>{const na=parseInt(a,10),nb=parseInt(b,10);if(!isNaN(na)&&!isNaN(nb)&&na!==nb)return na-nb;return a.localeCompare(b);});}
function kzcRecord(type,number){if(!type||!number||!LOCOMOTIVE_DATA[type])return null;const depot=LOCOMOTIVE_DATA[type][number];if(!depot)return null;const places=(typeof LOCOMOTIVE_PLACES!=='undefined'&&LOCOMOTIVE_PLACES[type+'|'+number])?[LOCOMOTIVE_PLACES[type+'|'+number]]:(DEPOT_PLACES[depot]||[]);return{depot,places};}
function getMileageFromData(type,number){if(!type||!number)return null;return MILEAGE_DATA[type+'_'+number]||null;}
function isValidMileage(mileageStr,type,number){const val=parseInt(mileageStr,10);if(isNaN(val)||val<0)return false;const tableVal=getMileageFromData(type,number);if(tableVal!==null)return val>=tableVal;return val>0;}
function getMileageError(mileageStr,type,number){const val=parseInt(mileageStr,10);if(isNaN(val)||val<0)return'Введите корректное число (≥ 0)';const tableVal=getMileageFromData(type,number);if(tableVal!==null){if(val<tableVal)return\`Пробег должен быть ≥ \${tableVal} км (по данным завода)\`;return null;}else{if(val<=0)return'Пробег должен быть больше 0 (данные отсутствуют)';return null;}}
const LOCOMOTIVE_TYPES=Object.keys(LOCOMOTIVE_DATA);

/* ========================================================================
   КОНСТАНТЫ КОЖУХОВ
   ======================================================================== */
const HOUSINGS=[];for(let i=1;i<=4;i++){HOUSINGS.push({id:'kc'+i,label:'Коллекторная сторона КП'+i});HOUSINGS.push({id:'kp'+i,label:'Против коллекторная сторона КП'+i});}
const MANUFACTURER_OPTS=['ПЦП','Ника'];
const YES_NO_FIXED=['Да','Нет','Устранено'];
const YES_NO_FIXED1=['Да','Нет'];
const FORMATION_OPTS=['СЛД','НЭВЗ'];
function shouldShowFormation(iid){const leak=getVal(iid,'leak');return leak==='Нет';}
function isFormationLocked(){const mileage=parseInt(STATE.general.mileage,10);return(!isNaN(mileage)&&mileage>275000);}
function getMaxSectionsForType(type){if(type==='2ЭС5К')return 2;if(type==='3ЭС5К')return 3;if(type==='4ЭС5К')return 4;return 4;}
function getSections(type){const count=getMaxSectionsForType(type);const s=[];for(let i=1;i<=count;i++){s.push({label:\`Секция №\${i}\`,typeName:i<=2?'кабина':'бустер'});}return s;}

/* ========================================================================
   РЕЖИМЫ: 'complex' или 'housings'
   ======================================================================== */
const MODE_KEY='checklist_mode_v2';
const LS_KEY_COMPLEX='checklist_2es5k_v1';
const LS_KEY_HOUSINGS='checklist_housings_v4';
const EMBEDDED_MODES=['tt','bi','hydro'];
const ALL_MODES=['complex','housings','tt','bi','hydro'];
const MODE_NAMES={complex:'Комплексный',housings:'Только Кожуха',tt:'ТТ',bi:'БИ',hydro:'Гидродемпферы'};
const __openModeParam=new URLSearchParams(window.location.search).get('mode');
let MODE=(__openModeParam||((typeof window.__MODE__!=='undefined')?window.__MODE__:(function(){try{return localStorage.getItem('checklist_mode_v2')||'complex';}catch(e){return 'complex';}})()));
if(MODE!=='complex'&&MODE!=='housings'&&EMBEDDED_MODES.indexOf(MODE)===-1&&!/^k_/.test(String(MODE)))MODE='complex';
let LS_KEY=(MODE==='housings')?LS_KEY_HOUSINGS:((MODE!=='complex')?('checklist_custom_'+MODE+'_v1'):LS_KEY_COMPLEX);
try{localStorage.setItem(MODE_KEY,MODE);}catch(e){}

let STATE={general:{type:'',number:'',date:'',depot:'',place:'',mileage:''},values:{},selectedSections:[],selected:[],changeLog:[]};
window.__TMH_GET_NATIVE_CLOUD_BACKUP_CONTEXT=function(){
  return {
    state:STATE,stats:(typeof computeStats==="function"?computeStats():null),persistState:function(){return saveState(true);},definitions:(typeof EQUIPMENT!=='undefined'?EQUIPMENT:[]).map(function(eq){return {id:eq.id,fields:typeof eq.getFields==='function'?eq.getFields({}):(eq.fields||[]),instances:typeof eq.instances==='function'?eq.instances().filter(function(inst){return (!(STATE.selectedSections||[]).length||(STATE.selectedSections||[]).indexOf(inst.section)>=0);}).map(function(inst){return {id:[eq.id,inst.section].join('|'),fields:typeof eq.getFields==='function'?eq.getFields(inst):(eq.fields||[])};}):[]};}),checklistType:(typeof CUSTOM_CHECKLIST!=='undefined'&&CUSTOM_CHECKLIST?CUSTOM_CHECKLIST.title:({complex:'Комплексный чек-лист',housings:'КМБ',tt:'ТТ',bi:'БИ',hydro:'Гидродемпферы'}[MODE]||MODE)),mode:MODE,storageKey:LS_KEY,
    applyState:async function(incoming,metadata){
      if(!metadata||typeof metadata.id!=='string'||!Number.isSafeInteger(metadata.revision)||metadata.revision<1)throw new Error('Некорректная версия облачной записи');
      await __psEnsureCloudReady();
      var current=STATE||{};
      var next=structuredClone(incoming);
      var oldValues=current.values||{},newValues=next.values||{};
      Object.keys(oldValues).forEach(function(iid){
        var oldItem=oldValues[iid]||{};
        var newItem=newValues[iid]||(newValues[iid]={});
        Object.keys(oldItem).forEach(function(key){
          if(/_photo$/i.test(key)&&oldItem[key]&&!newItem[key])newItem[key]=oldItem[key];
        });
      });
      next.__cloudChecklistId=crypto.randomUUID();
      STATE=next;
      var saved=saveState(true);
      if(saved===false)throw new Error('Не удалось сохранить восстановленное состояние локально');
      await __psEnsureCloudReady();
      if(typeof __tmhOfflineSaveChain!=='undefined'&&__tmhOfflineSaveChain)await __tmhOfflineSaveChain;
      if(typeof __tmhOfflineSaveError!=='undefined'&&__tmhOfflineSaveError)throw new Error('Не удалось сохранить восстановленное состояние в зашифрованном офлайн-хранилище');
      localStorage.setItem(LS_KEY+'::cloud-ref::'+STATE.__cloudChecklistId,JSON.stringify({id:metadata.id,revision:metadata.revision}));
      buildEquipment(STATE.general&&STATE.general.type||'');
      renderGeneral();renderPicker();renderEquip();updateStats();
      return true;
    }
  };
};
if(typeof __EMBEDDED_STATE!=='undefined'&&__EMBEDDED_STATE){STATE=__EMBEDDED_STATE;const el=document.getElementById('__embedded_state');if(el)el.parentNode.removeChild(el);}

function loadState(){try{const raw=localStorage.getItem(LS_KEY);if(raw){const p=JSON.parse(raw);STATE=Object.assign({general:{type:'',number:'',date:'',depot:'',place:'',mileage:''},values:{},selectedSections:[],selected:[],changeLog:[]},p);if(!Array.isArray(STATE.selectedSections))STATE.selectedSections=[];if(!Array.isArray(STATE.selected))STATE.selected=[];}}catch(e){console.warn('Не удалось загрузить сохранённые данные',e);}}
var __psOrigLoad=loadState;
loadState=function(){var prev=STATE;var r=__psOrigLoad.apply(this,arguments);
  try{if(prev&&prev!==STATE&&prev.values&&STATE&&STATE.values){for(var iid in prev.values){var o=prev.values[iid];if(!o)continue;for(var k in o){if(k.slice(-6)==='_photo'&&o[k]){if(!STATE.values[iid])STATE.values[iid]={};if(!STATE.values[iid][k])STATE.values[iid][k]=o[k];}}}}}catch(e){}
  __psRestore();return r;};

/* ===== Оборудование из конструктора (oborudovanie.json) — только комплексный чек-лист ===== */
function __ceEsc(s){return String(s==null?'':s).split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');}
function __ceBr(s){return __ceEsc(s).split(String.fromCharCode(10)).join('<br>');}
function __ceHint(fl){
  var h=__ceBr(fl.hint||'');
  if(fl.explain)h+=(h?'<br>':'')+'<span class="red-after">'+__ceBr(fl.explain)+'</span>';
  return h;
}
function __ceField(fl){
  var extra={photo:fl.photo!=='never'};
  if(fl.photo==='always')extra.photoAlways=true;
  if(fl.calc===false)extra.calc=false;
  if(fl.type==='select')return f(fl.key,fl.label,'select',fl.options.slice(),(fl.ok&&fl.ok.length)?fl.ok.slice():null,__ceHint(fl),extra);
  return f(fl.key,fl.label,'text',null,null,__ceHint(fl),extra);
}
function __ceInstances(ly){
  ly=ly||{};
  return function(){
    var secs=sections.slice(),out=[];
    if(ly.scope==='cabins')secs=secs.filter(function(s){return !isBoosterSection(s);});
    if(ly.scope==='boosters')secs=secs.filter(function(s){return isBoosterSection(s);});
    var blocks=(ly.blocks&&ly.blocks.length)?ly.blocks.slice():[];
    if(!blocks.length&&ly.count>1){for(var i=1;i<=ly.count;i++)blocks.push('№'+i);}
    secs.forEach(function(s){
      if(blocks.length)blocks.forEach(function(b){out.push({section:s,block:b});});
      else out.push({section:s});
    });
    return out;
  };
}
var __ceOrigBuild=buildEquipment;
buildEquipment=function(type){
  var r=__ceOrigBuild.apply(this,arguments);
  try{
    if(!type||(typeof MODE!=='undefined'&&MODE==='housings'))return r;
    var chk=(typeof CUSTOM_CHECKLIST!=='undefined')?CUSTOM_CHECKLIST:null;
    var list=(typeof CUSTOM_EQUIPMENT!=='undefined')?CUSTOM_EQUIPMENT:[];
    list.forEach(function(ce){
      var want=chk?(chk.equipment.indexOf(ce.id)>=0):!!(ce.checklists&&ce.checklists.indexOf('complex')>=0);
      if(!want)return;
      if(EQUIPMENT.some(function(e){return e.id===ce.id;}))return;
      EQUIPMENT.push({id:ce.id,title:ce.title,custom:true,fields:ce.fields.map(__ceField),instances:__ceInstances(ce.layout)});
    });
    if(chk){   // свой чек-лист: только выбранное оборудование, в выбранном порядке
      EQUIPMENT=EQUIPMENT.filter(function(e){return chk.equipment.indexOf(e.id)>=0;});
      EQUIPMENT.sort(function(a,b){return chk.equipment.indexOf(a.id)-chk.equipment.indexOf(b.id);});
    }
  }catch(e){console.warn('[конструктор]',e);}
  return r;
};
/* имя режима для файлов выгрузки и заголовок страницы своего чек-листа */
function __modeLabel(){return(typeof MODE!=='undefined'&&MODE==='housings')?'кожухи':((typeof CUSTOM_CHECKLIST!=='undefined'&&CUSTOM_CHECKLIST)?CUSTOM_CHECKLIST.title:'комплексный');}
if(typeof updateModeTitle==='function'){
  var __ceOrigTitle=updateModeTitle;
  updateModeTitle=function(){
    __ceOrigTitle.apply(this,arguments);
    try{
      var c=(typeof CUSTOM_CHECKLIST!=='undefined')?CUSTOM_CHECKLIST:null;if(!c)return;
      var h1=document.getElementById('modeTitle'),sub=document.getElementById('modeSubtitle');
      if(h1)h1.textContent=c.title;if(sub)sub.textContent=c.subtitle||'';document.title='Чек-лист — '+c.title;
    }catch(e){}
  };
}
/* ===== Подсказка «номер не найден»: объясняет, откуда взят список локомотивов ===== */
function __regHint(){
  var base='Такого номера нет в базе для данного типа электровоза.';
  try{
    if(typeof REGISTRY_INFO==='undefined')return base;
    var i=REGISTRY_INFO;
    if(i.source==='excel')return base+' Список взят из файла zona_riska.xlsx (лист «'+i.sheet+'», локомотивов: '+i.count+'). Проверьте серию и номер в этом листе и что обновлённый файл загружен на сайт (после загрузки подождите 1–3 минуты и откройте чек-лист заново).';
    var why={file:'файл zona_riska.xlsx не удалось прочитать (нет связи или файла нет на сайте)',sheet:'в файле нет листа «'+i.sheet+'»',empty:'в листе «'+i.sheet+'» нет ни одного корректного локомотива'}[i.reason]||'файл не использован';
    return base+' Используется встроенный список, потому что '+why+'.';
  }catch(e){return base;}
}

/* ===== Вход разработчика (роль dev: права администратора + кнопка конструктора) ===== */
const DEV_CREDENTIALS={login:'developer',passHash:'04fab717765ab87625bc5d5cbf1da92c2ec5122dcfaaf45b30fe61cf489af277'};
function __devPassOk(p){try{return __sha256('tmh-checklist-dev:'+String(p))==='04fab717765ab87625bc5d5cbf1da92c2ec5122dcfaaf45b30fe61cf489af277';}catch(e){return false;}}
var __devOrigLogin=doLogin;
doLogin=function(login,password){
  if(login===DEV_CREDENTIALS.login){
    if(!__devPassOk(password))return false;
    currentUser='admin';
    localStorage.setItem('checklist_user',JSON.stringify({login:login,role:'admin',dev:true}));
    updateUserUI();document.getElementById('loginModal').style.display='none';
    showToast('✅ Вход выполнен как Разработчик (кнопка 🛠 слева внизу)');
    try{if(window.parent&&window.parent!==window&&window.parent.__devRefresh)window.parent.__devRefresh();}catch(e){}
    return true;
  }
  return __devOrigLogin.apply(this,arguments);
};
var __devOrigUI=updateUserUI;
updateUserUI=function(){
  __devOrigUI.apply(this,arguments);
  try{var u=JSON.parse(localStorage.getItem('checklist_user')||'null');
    if(currentUser==='admin'&&u&&u.dev){var n=document.getElementById('userName'),r=document.getElementById('userRole');if(n)n.textContent='Разработчик';if(r)r.textContent='(developer)';}}catch(e){}
};

/* ===== Узлы осмотра по правилам из zona_riska.xlsx (лист «Узлы») ===== */
var __NR={key:null,only:{},deny:{},matched:[],catalog:[],types:[]};
function __nrN(s){return String(s==null?'':s).toLowerCase().split('ё').join('е').split(' ').join('').split(String.fromCharCode(160)).join('');}
function __nrDg(c){return c>='0'&&c<='9';}
function __nrMatch(cand,rule){
  if(!rule)return false;
  var i=cand.indexOf(rule);
  while(i>=0){
    var before=i>0?cand.charAt(i-1):'',after=cand.charAt(i+rule.length);
    var okA=!after||!(__nrDg(after)&&__nrDg(rule.charAt(rule.length-1)));
    var okB=!before||!(__nrDg(before)&&__nrDg(rule.charAt(0)));
    if(okA&&okB)return true;
    i=cand.indexOf(rule,i+1);
  }
  return false;
}
function __nrNum(cell,n){
  n=String(n==null?'':n).split(' ').join('');if(!n)return false;if(!cell)return true;
  var parts=String(cell).split(';').join(',').split(' ').join(',').split(',');
  for(var i=0;i<parts.length;i++){
    var p=parts[i];if(!p)continue;if(p===n)return true;
    var d=p.indexOf('-');if(d<0)d=p.indexOf('–');if(d<0)d=p.indexOf('—');
    if(d>0){var a=parseInt(p.slice(0,d),10),b=parseInt(p.slice(d+1),10),v=parseInt(n,10);
      if(!isNaN(a)&&!isNaN(b)&&!isNaN(v)&&String(v)===n&&v>=a&&v<=b)return true;}
  }
  return false;
}
function __nrKind(n){
  if(n.indexOf('секци')===0)return 'sec';
  if(n.indexOf('тележк')===0)return 'tel';
  if(__NR.types.indexOf(n)>=0)return 'type';
  return 'eq';
}
function __nrAdd(list,n){list=list||[];if(list.indexOf(n)<0)list.push(n);return list;}
// пересчёт правил для текущего локомотива; true — если локомотив (тип/номер/приписка) изменился
function __nrEval(){
  var g=(typeof STATE!=='undefined'&&STATE&&STATE.general)?STATE.general:{};
  var key=[g.type,g.number,g.depot].join('|');
  if(__NR.key===key)return false;
  __NR.key=key;__NR.only={};__NR.deny={};__NR.matched=[];
  var rules=(typeof NODE_RULES!=='undefined')?NODE_RULES:[];
  rules.forEach(function(r){
    if(r.series&&r.series!==g.type)return;
    if(r.number&&!__nrNum(r.number,g.number))return;
    if(r.depot&&__nrN(r.depot)!==__nrN(g.depot))return;
    __NR.matched.push(r);
    (r.nodes||[]).forEach(function(nm){
      var n=__nrN(nm),k=__nrKind(n);
      if(r.mode==='except')__NR.deny[k]=__nrAdd(__NR.deny[k],n);else __NR.only[k]=__nrAdd(__NR.only[k],n);
    });
  });
  return true;
}
function __nrAllowed(kind,cands){
  var on=__NR.only[kind],dn=__NR.deny[kind];
  var hit=function(list){for(var i=0;i<list.length;i++)for(var j=0;j<cands.length;j++)if(__nrMatch(cands[j],list[i]))return true;return false;};
  if(on&&on.length&&!hit(on))return false;
  if(dn&&dn.length&&hit(dn))return false;
  return true;
}
function __nrReport(){
  try{
    var list=[];
    __NR.matched.forEach(function(r){(r.nodes||[]).forEach(function(nm){
      var n=__nrN(nm),ok=false;
      for(var i=0;i<__NR.catalog.length&&!ok;i++)if(__nrMatch(__NR.catalog[i],n))ok=true;
      if(!ok)list.push('узел «'+nm+'» не найден в этом чек-листе (правило из строки '+r.row+' листа «Узлы»)');
    });});
    var P=window.parent;
    if(P&&P!==window&&P.__RISK_CORE__&&P.__RISK_CORE__.reportNodeIssues)P.__RISK_CORE__.reportNodeIssues(P.eval('MODE'),list);
  }catch(e){}
}
function __nrFilter(){
  if(typeof EQUIPMENT==='undefined')return;
  var g=(STATE&&STATE.general)?STATE.general:{},cat=[];
  try{__nrOrigSec(g.type||'').forEach(function(s){cat.push(__nrN(s.label));});}catch(e){}
  if(typeof ALL_POSSIBLE_TYPES!=='undefined'){__NR.types=ALL_POSSIBLE_TYPES.map(__nrN);}
  EQUIPMENT.forEach(function(eq){
    cat.push(__nrN(eq.name||eq.title||''));cat.push(__nrN(eq.id));
    try{var oi=eq.__nrOrig||eq.instances;(oi.call(eq)||[]).forEach(function(i){
      if(i.section)cat.push(__nrN(i.section));if(i.group)cat.push(__nrN(i.group));if(i.block)cat.push(__nrN(i.block));});}catch(e){}
  });
  __NR.catalog=cat;
  if(typeof ALL_POSSIBLE_TYPES!=='undefined')ALL_POSSIBLE_TYPES=ALL_POSSIBLE_TYPES.filter(function(t){return __nrAllowed('type',[__nrN(t)]);});
  EQUIPMENT=EQUIPMENT.filter(function(eq){return __nrAllowed('eq',[__nrN(eq.name||eq.title||''),__nrN(eq.id)]);});
  EQUIPMENT.forEach(function(eq){
    if(eq.__nrWrapped||typeof eq.instances!=='function')return;
    var oi=eq.instances;eq.__nrOrig=oi;eq.__nrWrapped=true;
    eq.instances=function(){
      var list=oi.apply(this,arguments)||[];
      return list.filter(function(i){
        return(!i.section||__nrAllowed('sec',[__nrN(i.section)]))&&(!i.group||__nrAllowed('tel',[__nrN(i.group)]))&&(!i.block||__nrAllowed('type',[__nrN(i.block)]));
      });
    };
  });
  __nrReport();
}
function __nrPrune(){
  try{
    var ids=EQUIPMENT.map(function(e){return e.id;}),g=STATE.general||{};
    var secOk=function(s){return __nrAllowed('sec',[__nrN(s)]);};
    if(STATE.selected&&STATE.selected.length)STATE.selected=STATE.selected.filter(function(id){return ids.indexOf(id)>=0;});
    if(STATE.selectedSections&&STATE.selectedSections.length)STATE.selectedSections=STATE.selectedSections.filter(secOk);
    if(g.selectedSections&&g.selectedSections.length)g.selectedSections=g.selectedSections.filter(secOk);
    if(g.selectedTypes&&g.selectedTypes.length)g.selectedTypes=g.selectedTypes.filter(function(t){return __nrAllowed('type',[__nrN(t)]);});
    if(g.selectedTelezhki&&g.selectedTelezhki.length)g.selectedTelezhki=g.selectedTelezhki.filter(function(t){return __nrAllowed('tel',[__nrN('Тележка '+t),__nrN(t)]);});
  }catch(e){}
}
var __nrOrigSec=getSections;
getSections=function(type){
  var all=__nrOrigSec.apply(this,arguments);
  try{__nrEval();return all.filter(function(s){return __nrAllowed('sec',[__nrN(s.label)]);});}catch(e){return all;}
};
var __nrOrigBuild=buildEquipment;
buildEquipment=function(type){
  var r=__nrOrigBuild.apply(this,arguments);
  try{__nrEval();__nrFilter();__nrPrune();}catch(e){console.warn('[узлы]',e);}
  return r;
};
function __nrRebuild(){try{if(STATE&&STATE.general&&STATE.general.type)buildEquipment(STATE.general.type);}catch(e){}}
function __nrWrap(orig){return function(){if(__nrEval())__nrRebuild();return orig.apply(this,arguments);};}
if(typeof renderGeneral==='function')renderGeneral=__nrWrap(renderGeneral);
if(typeof renderEquip==='function')renderEquip=__nrWrap(renderEquip);
if(typeof renderPicker==='function')renderPicker=__nrWrap(renderPicker);
if(typeof computeStats==='function')computeStats=__nrWrap(computeStats);
if(typeof updateStats==='function')updateStats=__nrWrap(updateStats);

function fullClearState(){ __psClear();localStorage.removeItem(LS_KEY);STATE={general:{type:'',number:'',date:'',depot:'',place:'',mileage:''},values:{},selectedSections:[],selected:[],changeLog:[]};buildEquipment('');if(window._mk84Cache)window._mk84Cache={};}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast._t);showToast._t=setTimeout(()=>t.classList.remove('show'),1600);}
function f(key,label,type,options,ok,hint,extra){return Object.assign({key,label,type,options,ok,hint},extra||{});}
function sel(key,label,options,ok,hint){return f(key,label,'select',options,ok,hint,{photo:true});}
function sel1(key,label,options,ok,hint){return f(key,label,'select',options,ok,hint,{calc:false,photo:true});}
function txt(key,label,hint,extra){return f(key,label,'text',null,null,hint,Object.assign({photo:true},extra||{}));}

let EQUIPMENT=[];
let sections=[];
function isBoosterSection(sectionLabel){const num=parseInt(sectionLabel.replace('Секция №',''),10);return !isNaN(num)&&num>2;}
function buildEquipment(type){
EQUIPMENT=[];
if(!type||type==='')return;
sections=getSections(type).map(s=>s.label);

EQUIPMENT.push({id:'vb8',title:'Выключатель быстродействующий ВБ-8',fields:[
txt('zav','Заводской №','Прописать заводской номер с маркировочной таблицы аппарата. Если нет информации — указать "-"'),
f('f0','Вид ВБ-8','select',['Старый','Новый'],null,null,{calc:false,photo:true}),
sel('f1','Визуальный контроль несоосности регулировочного болта (После ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить отсутствие касания регулировочного болта во включенном и выключенном положении (визуально) паза кронштейна.<br><span class="red-after">Касание отсутствует - "Да", Касание есть, работы не проводились - "Нет", Произведена замена комплекта из-за касания - "Устранено"</span>'),
sel('f2','Факт замены болта на изменённой конструкции (После ТР-1)',['Да','Нет'],['Да','Нет'],'Проверить фактическое исполнение конструкции при выдаче с ремонта<br><span class="red-after">Болт 8 мм (новой конструкции) - "Да", Болт 6 мм (старой конструкции) - "Нет"</span>'),
sel('f3','Соответствие боковин электромагнита (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить наличие трещин на боковинах электромагнита (визуально).<br><span class="red-after">Трещины отсутствуют - "Да", Трещина есть, работы не проводились - "Нет", Произведена замена электромагнита - "Устранено"</span>'),
sel('f4','Наличие крышек на низковольтных блокировках (После ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить наличие пластиковых крышек на низковольтных блокировках.<br><span class="red-after">В наличии - "Да", Отсутствуют - "Нет", Установлены после проверки - "Устранено"</span>'),
sel('f5','Зачистка силовых контактов (При ТР-1)',['Да','Нет'],['Да'],'Проверить состояние силовых контактов при выходе из ремонта.<br><span class="red-after">Зачищены - "Да", Не зачищены, имеются подгары - "Нет"</span>'),
sel('f6','Зачистка блокировочных контактов (При ТР-1)',['Да','Нет'],['Да'],'Проверить наличие подгара контактов, грязи на блокировочных контактах.<br><span class="red-after">Зачищены - "Да", Не зачищены, имеются подгары, загрязнения - "Нет"</span>'),
sel('f7','Зачистка полюса электромагнита — зеркала (При ТР-1)',['Да','Нет'],['Да'],'Проверить состояние магнитопровода (зеркала) при выдаче с ремонта.<br><span class="red-after">Зачищены - "Да", Не зачищены, имеются подгары, загрязнения - "Нет"</span>')
],instances(){const out=[];for(const section of sections)for(const bsa of['Сх. БСА 1','Сх. БСА 2'])for(const qf of['Сх. QF 11','Сх. QF 12'])out.push({section,group:bsa,block:qf});return out;}});

EQUIPMENT.push({id:'mk9',title:'Контактор МК-9',fields:[
txt('zav','Заводской №','Прописать заводской номер с маркировочной таблицы аппарата<br>Если нет информации по заводскому номеру указать "-"<br>Если контактор МК-84 — прописать в ячейку "МК-84" <span class="red-after">(это считается несоответствием, остальные поля автоматически устанавливаются в "не требуется")</span>'),
sel('f1','Наличие и тип шунтирующих устройств (При ТР-1)',['Нет','503','508','Не соответствует КД'],['503','508'],'При наличии указать тип шунтирующего устройства.<br><span class="red-after">ШУ в наличии - "503"/"508", ШУ отсутствует - "Нет", Не соответствует КД - "Не соответствует КД"</span>'),
sel('f2','Целостность ШУ (При ТР-1)',['Да','Заменен'],['Да'],'Необходимо отключить одну сторону от цепи.<br>Проверить целостность диода с помощью мультиметра (методом прозвонки).<br><span class="red-after">Звуковой сигнал в одну сторону и его отсутствие в другую - "Да"<br>Нет звукового сигнала или сигнал в обе стороны - "Заменен"</span>'),
sel('f3','Зачистка силовых контактов (При ТР-1)',['Да','Нет'],['Да'],'Проверить состояние силовых контактов при выходе из ремонта.<br><span class="red-after">Зачищены - "Да", Не зачищены, имеются подгары - "Нет"</span>'),
sel('f4','Соответствие линии касания (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить линию касания контактной группы оттиском копировальной бумаги.<br><span class="red-after">≥80% прилегания - "Да",<br>Несоответствие не устранено - "Нет",<br>Несоответствие устранено - "Устранено"</span>')
],instances(){const out=[];for(const section of sections){for(const blk of['КМ1','КМ11','КМ12','КМ13'])out.push({section,block:blk});out.push({section,block:'КМ14'});}return out;}});

EQUIPMENT.push({id:'msud',title:'Система МСУД-015',fields:[
txt('zav','Заводской №','Прописать заводской номер с маркировочной таблицы аппарата. Если нет информации — указать "-"'),
sel1('f1','Тип установленного блока индикации',['БИ','БС','ДМ']),
f('f2','Факт пломбировки разъёмов БИ (Перед ТР-1)','select',['Да','Нет'],['Да'],'Произвести визуальный осмотр и убедиться в наличии пломб на лицевой стороне блоков индикации.<br><span class="red-after">В наличии, номер соответствует - "Да", В наличии номер не соответствует или не в наличии - "Нет"</span>',{photo:true,calc:false}),
f('f3','Факт пломбировки SF37 (Перед ТР-1)','select',['Да','Нет'],['Да'],'Произвести визуальный осмотр и убедиться в наличии пломбы на SF37<br><span class="red-after">В наличии, номер соответствует - "Да", В наличии номер не соответствует или не в наличии - "Нет"</span>',{photo:true,calc:false}),
sel('f4','Наличие установленной защиты системного диска (После ТР-1)',['Да','Нет'],['Да'],'При запуске ПО на МСУД-015 обратить внимание на защиту системного диска на блоке индикации (БИ). Красное сообщение при включении БИ.<br><span class="red-after">Защита установлена - "Да", Защита отсутствует - "Нет"</span>'),
sel('f5','Соответствие версий прошивки ячеек установленному ПО (После ТР-1)',['Да','Нет','Устранено'],['Да'],'Произвести проверку версии программного обеспечения (F-2-9 → кнопка «i» → контроль версий)<br><span class="red-after">Все зелёные индикаторы - "Да", Есть красный не устранён - "Нет", Есть красный устранён - "Устранено"</span>'),
txt('f6','Установка пломбы разъёмов БИ (После ТР-1)','Указать № пломбы'),
txt('f7','Установка пломбы SF37 (После ТР-1)','Указать № пломбы')
],instances(){const out=[];const cab=sections.slice(0,2);for(const section of cab)out.push({section,block:'А78'});return out;}});

EQUIPMENT.push({id:'bvv',title:'БВВ-057',fields:[
sel('f1','Наличие шунтирующих устройств (При ТР-1)',['Да','Нет'],['Да'],'Проверить наличие ШУ на катушках аппаратов.<br><span class="red-after">В наличии - "Да", Отсутствуют - "Нет"</span>'),
sel('f2','Соответствие характеристик ШУ (При ТР-1)',['Да','Нет','Заменен'],['Да'],'Проверить целостность диода с помощью мультиметра (методом прозвонки).<br><span class="red-after">Звуковой сигнал в одну сторону и его отсутствие в другую - "Да",<br>Нет сигнала или сигнал в обе стороны - "Нет",<br>Выполнена замена ШУ - "Заменен"</span>')
],instances(){const allBlocks=['КМ41 (8 блок)','КМ42 (8 блок)','КМ1 (8 блок)','КМ11 (8 блок)','КМ12 (8 блок)','КМ13 (8 блок)','КМ14 (8 блок)','КМ15 (8 блок)','КМ2 (8 блок)','КМ3 (8 блок)','KV2 (6 блок)','КМ36 (8 блок)','КМ45 (8 блок)','КМ24 (1ВВК)','КМ25 (1ВВК)'];const out=[];const boostExclude=['КМ24 (1ВВК)','КМ25 (1ВВК)','КМ36 (8 блок)','КМ45 (8 блок)'];for(const section of sections){const isB=isBoosterSection(section);for(const blk of allBlocks){if(isB&&boostExclude.includes(blk))continue;out.push({section,block:blk});}}return out;}});

EQUIPMENT.push({id:'re16t',title:'РЭ16Т',fields:[
sel('f1','Отсутствуют замечания в ТУ-152 (Перед ТР-1)',['Да','Нет'],['Да'],'Проверить наличие замечаний в ТУ-152 "Неисправно KV, отключается KV"<br><span class="red-after">Замечания отсутствуют - "Да", Есть замечания - "Нет"</span>'),
sel('f2','Отсутствие механических заеданий/перекосов (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить на наличие механического заедания при подаче 50В<br><span class="red-after">Замечания отсутствуют - "Да", Есть замечания, проведена замена - "Устранено", Есть замечания, замена не проведена - "Нет"</span>'),
sel('f3','Соответствие монтажа подводящих кабелей (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить провис/натяг подводящих кабелей<br><span class="red-after">Замечания отсутствуют - "Да", Есть замечания, корректировка монтажа - "Устранено", Есть замечания, устранение невозможно - "Нет"</span>'),
sel('f4','Соответствие затяжки винтового соединения крепления проводов (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить ослабление крепления винтового соединения<br><span class="red-after">Замечания отсутствуют - "Да", Есть замечания, произведена протяжка - "Устранено", Есть замечания, устранение невозможно - "Нет"</span>')
],instances(){const out=[];const blocks=['KV2','KV14','KV8','KV9','KV10','KV12','KV43','KV44'];const boostExclude=['KV8','KV10'];for(const section of sections){const isB=isBoosterSection(section);for(const blk of blocks){if(isB&&boostExclude.includes(blk))continue;out.push({section,block:blk});}}return out;}});

EQUIPMENT.push({id:'shina',title:'Силовой электрический монтаж — шинный монтаж',fields:[
sel('f1','Затяжка крепления ВИП, БЦВ к кузову',['Да','Нет','Устранено'],['Да'],'Ослабления отсутствуют - "Да", Ослабления - "Нет", Ослабления протянуты - "Устранено"'),
f('f2','Использование моментного ключа при затяжке','select',['Да','Нет'],['Да'],'Протяжка моментным ключом проведена - "Да", Не проведена - "Нет"',{photo:true,calc:false}),
sel('f3','Соответствие геометрических параметров',['Да','Нет'],['Да'],'Визуальный контроль изгибов/натягов шинного монтажа.<br><span class="red-after">Изгибов/натягов не выявлено - "Да", Выявлены изгибы/натяги - "Нет"</span>')
],instances(){const out=[];for(const section of sections){for(const blk of['U1','U2'])out.push({section,block:blk});}return out;},customRender:false});

EQUIPMENT.push({id:'las023',title:'Токоприёмник ЛАС-023 — рукав пневмопривода',fields:[
sel('f1','Целостность рукава (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить рукав на наличие механических повреждений, поперечных трещин.<br><span class="red-after">Несоответствий не выявлено - "Да", Выявлены несоответствия, замена не проведена - "Нет", Проведена замена - "Устранено"</span>'),
sel('f2','Герметичность рукава (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить на слух утечку воздуха при поднятии ТКП<br><span class="red-after">Несоответствий не выявлено - "Да", Выявлены несоответствия, замена не проведена - "Нет", Проведена замена - "Устранено"</span>'),
sel('f3','Соответствие рукава КД (При ТР-1)',['Да','Нет'],['Да'],'Визуальный осмотр соответствия рукава РЭ в части маркировки<br><span class="red-after">Соответствует маркировка - "Да", Не соответствует или не читаемая - "Нет"</span>')
],instances(){const out=[];const cab=sections.slice(0,2);for(const section of cab){for(const vid of['к МАО','к Пневмоприводу'])out.push({section,block:'XA1',sub:vid});}return out;}});

EQUIPMENT.push({id:'nb514',title:'НБ-514Е — щёткодержатель',fields:[
txt('zav','Заводской №','Прописать заводской номер с маркировочной таблицы аппарата. Если нет информации — указать "-"'),
sel('f1','Соответствие крепления щёткодержателя (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить наличие ослабления креплений щёткодержателя (контроль крепления по срабатыванию пружинной шайбы).<br><span class="red-after">Шайба сработана - "Да", Шайба не сработана, произведена протяжка - "Устранено", Шайба не сработана, не протянуто - "Нет"</span>'),
sel('f2','Нанесение эмали на шпильку (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Проверить факт нанесения эмали на шпильку<br><span class="red-after">Наличие нанесенной эмали - "Да", Отсутствие эмали, произведено нанесение - "Устранено", Отсутствие эмали - "Нет"</span>'),
sel('f4','Соответствие расположения корпуса щёткодержателя (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Выборочная (1 щёткодержатель с ТЭД) визуальная проверка перекоса корпуса щёткодержателя (контроль по равномерности зазора между щёткодержателем и коллектором)<br><span class="red-after">Перекос не выявлен - "Да", Выявлен перекос, устранен - "Устранено", Выявлен перекос, не устранен - "Нет"</span>'),
sel('f5','Замена щёток (При ТР-1)',['Да','Нет'],['Да'],'При проведении ТР-50 производится 100% замена щёток<br><span class="red-after">Замена проведена 100% - "Да", Замена не проведена хотя бы на 1 ЩД - "Нет"</span>'),
sel('f6','Соответствие щёток РЭ (При ТР-1)',['Да','Нет'],['Да'],'Проверить устанавливаемые щётки на соответствие РЭ<br><span class="red-after">Соответствуют 100% установленных щёток - "Да", Не соответствуют щётки хотя бы на 1 ЩД - "Нет"</span>'),
sel('f7','Комплектность ЩД (При ТР-1)',['Да','Нет','Устранено'],['Да'],'Осмотр комплектности ЩД (пружины, нажимные пальцы, винты регулировочные)<br><span class="red-after">Комплектность в наличии - "Да", Выявлена некомплектность, устранено - "Устранено", Выявлена некомплектность, не устранено - "Нет"</span>')
],instances(){const out=[];for(const section of sections){for(const blk of['M1','M2','M3','M4'])out.push({section,block:blk});}return out;}});

EQUIPMENT.push({id:'nvmontazh',title:'Низковольтный электрический монтаж',fields:[
sel('f1','Соответствие протяжки штепсельных соединений под пультом машиниста (При ТР-1)',['Да','Устранено'],['Да'],'Произвести визуальный осмотр резьбовых разъёмов под пультом машиниста на предмет ослаблений<br><span class="red-after">Ослабления не обнаружены - "Да", Ослабления обнаружены и устранены - "Устранено"</span>'),
sel('f2','Соответствие протяжки штепсельных соединений ящика МСУД БУ-006 (При ТР-1)',['Да','Устранено'],['Да'],'Произвести ручную протяжку внешних разъёмных соединителей на предмет ослаблений. Контроль по нанесённым рискам<br><span class="red-after">Ослабления не обнаружены - "Да", Ослабления обнаружены и устранены - "Устранено"</span>'),
sel('f3','Соответствие протяжки штепсельных соединений ящика МСУД БУ-006-01 (При ТР-1)',['Да','Устранено'],['Да'],'Произвести ручную протяжку внешних разъёмных соединителей на предмет ослаблений. Контроль по нанесённым рискам<br><span class="red-after">Ослабления не обнаружены - "Да", Ослабления обнаружены и устранены - "Устранено"</span>')
],instances(){const out=[];for(const section of sections)out.push({section});return out;}});

EQUIPMENT.push({id:'gres',title:'Главный резервуар',fields:[
sel('f1','Соответствие работы продувок (После ТР-1)',['Да','Нет','Устранено'],['Да'],'Расшифровка файлов МСУД на предмет несоответствия работы продувок в период эксплуатации с прошлого ТР<br><span class="red-after">Соответствие работы - "Да", Несоответствие работы - "Нет", Устранено - "Устранено"</span>'),
sel('f2','Наличие клапанов продувки (После ТР-1)',['Да','Нет'],['Да'],'Произвести осмотр на наличие клапанов: У21-КН10, У22-КН11, У23-КН12, У24-КН13<br><span class="red-after">Наличие клапанов - "Да", Отсутствуют - "Нет"</span>'),
sel('f3','Соответствие положения кранов продувки КН10-КН13 (После ТР-1)',['Открыты','Произведено открытие','Передан с закрытым из-за утечки'],['Открыты'],'Проверка на предмет открытия кранов<br><span class="red-after">Открыты краны - "Открыты", Закрыты, произведено открытие - "Произведено открытие", Закрыты из-за утечки - "Передан с закрытым из-за утечки"</span>'),
sel('f4','Наличие утечки воздуха при открытии кранов продувки КН10-КН13 (После ТР-1)',['Не обнаружено','Устранена','Не устранена'],['Не обнаружено'],'Проверка на предмет утечки воздуха по вентилю при открытии крана<br><span class="red-after">Утечка воздуха не обнаружена - "Не обнаружено", Утечка обнаружена, устранена - "Устранена", Утечка обнаружена, не устранена - "Не устранена"</span>'),
sel('f5','Наличие утечки при открытии КП-29 (при наличии) (После ТР-1)',['Норма','Нет','Не производилось'],['Норма','Не производилось'],'Проверка на предмет утечки воздуха по вентилю при открытии крана<br><span class="red-after">Утечка не обнаружена - "Норма", Утечка обнаружена, устранена - "Нет", Не проверялось - "Не производилось"</span>'),
sel('f6','Наличие утечки КН71-КН74 (только при наличии клапанов КЭО) (После ТР-1)',['Норма','Нет','Не производилось'],['Норма','Не производилось'],'Проверка на предмет утечки воздуха по вентилю при открытии крана<br><span class="red-after">Утечка не обнаружена - "Норма", Утечка обнаружена, устранена - "Нет", Не проверялось - "Не производилось"</span>'),
sel('f7','Соответствие дистанционной продувки резервуаров с кабины (После ТР-1)',['Норма','Нет'],['Норма'],'Выполнить продувку резервуаров с кабины с помощью кнопок (один жмёт кнопку, другой смотрит под кузовом)<br><span class="red-after">Выполняется продувка дистанционно - "Норма", Не выполняется - "Нет"</span>'),
sel('f8','Соответствие продувки резервуаров с помощью МСУД (После ТР-1)',['Норма','Нет'],['Норма'],'Выполняется при поднятом электровозе, F4 — продувка резервуаров (1 секция — 12 минут)<br><span class="red-after">Выполняется продувка с помощью МСУД - "Норма", Не выполняется - "Нет"</span>')
],instances(){const out=[];for(const section of sections){for(const blk of['КН10, КН71','КН11, КН72','КН12, КН73','КН13, КН74'])out.push({section,block:blk});}return out;}});

EQUIPMENT.push({id:'housings',title:'Кожуха',fields:[
sel('manufacturer','Изготовитель',MANUFACTURER_OPTS,null,'Выберите изготовителя в соответствии с маркировочной табличкой: <span class="legend">ООО "Профит Центр Плюс" - ПЦП<br>ООО "Ника" - Ника</span>'),
sel('oil','Соответствие уровня смазки',YES_NO_FIXED,['Да'],'Уровень смазки должен быть на отметке щупа между нижней и верхней контрольными метками (рисками)<br><span class="legend">Несоответствий не выявлено - "Да";<br> Выявлены несоответствия - "Нет";<br> Выявлены несоответствия, долили смазку - "Устранено"</span>'),
sel('leak','Отсутствуют течи масла по уплотнениям',YES_NO_FIXED1,['Да'],'Осмотреть уплотнительный стык между верхней и нижней крышками КЗП по всему периметру. При визуальном осмотре не должно наблюдаться капель, подтеков или отпотевания масла. Наличие влажного (масляного) следа в зоне стыка является браковочным признаком<br><span class="legend">Течи не выявлены/следы старых течей - "Да";<br> Свежие следы течей - "Нет"</span>'),
sel('formation','Формирование',FORMATION_OPTS,null,'Посмотреть по электронному паспорту<br><span class="legend">Формирование КМБ на НЭВЗ - НЭВЗ<br>Формирование КМБ на ТР-250 или при замене ТЭД - СЛД</span>',{photo:false}),
txt('zav','Заводской № (только для НЭВЗ, при отсутствии течей)','Введите заводской номер кожуха (заполняется только при формировании НЭВЗ и отсутствии течей)',{photo:false})
],instances(){const out=[];for(const section of sections){for(const housing of HOUSINGS)out.push({section,housingId:housing.id,housingLabel:housing.label});}return out;},customComputeFlag:function(iid){const oil=getVal(iid,'oil');const leak=getVal(iid,'leak');const hasOil=oil&&oil!=='';const hasLeak=leak&&leak!=='';if(!hasOil&&!hasLeak)return{state:'na',label:'Нет'};if(oil==='Да'&&leak==='Да')return{state:'ok',label:'Нет'};return{state:'bad',label:'Да'};},customRender:false});

EQUIPMENT.push({id:'rassekatel',title:'Рассекатель',fields:[
f('presence','Наличие Рассекателя','select',['Да','Нет'],['Да'],'Проверить наличие рассекателя<span class="legend"> В наличии - "Да"<Br> Отсутствует - "Нет"',{photo:false}),
sel('install','Соответствует установки рассекатель согласно чертежу',['Да','Нет'],['Да'],'')
],instances(){const out=[];for(const section of sections){for(const type of['U1','U2'])out.push({section,block:type});}return out;},customComputeFlag:function(iid){const presence=getVal(iid,'presence');if(!presence||presence==='')return{state:'na',label:'—'};if(presence==='Нет')return{state:'ok',label:'Нет'};if(presence==='Да'){const install=getVal(iid,'install');if(!install||install==='')return{state:'na',label:'—'};if(install==='Да')return{state:'ok',label:'Нет'};if(install==='Нет')return{state:'bad',label:'Да'};}return{state:'na',label:'—'};},customRender:false});

EQUIPMENT.push({id:'kps',title:'КПС-0,5-38',customRender:true,instances:function(){const out=[];for(const section of sections){for(const gid in GROUPS)out.push({section,gid});}return out;}});

// Фильтрация по режиму


/* ROUTE_ORDER_V5 */
var ROUTE_ORDER = ["las023","nvmontazh","vb8","shina","rassekatel","mk9","bvv","re16t","kps","gres","nb514","housings","msud"];
var FIELD_ORDER = {"las023":["zav","f1","f3","f2"],"nvmontazh":["f1","f2","f3"],"vb8":["zav","f0","f3","f1","f2","f4","f5","f6","f7"],"shina":["f3","f1","f2"],"rassekatel":["presence","install"],"mk9":["zav","f1","f2","f3","f4"],"bvv":["f1","f2"],"re16t":["f1","f2","f3","f4"],"gres":["f2","f3","f4","f5","f6","f1","f7","f8"],"nb514":["zav","f1","f2","f4","f5","f6","f7"],"msud":["zav","f1","f2","f3","f4","f5","f6","f7"],"housings":["manufacturer","oil","leak","formation","zav"]};
var INSTANCE_ORDER = {"bvv":["КМ1 (8 блок)","КМ2 (8 блок)","КМ3 (8 блок)","КМ11 (8 блок)","КМ12 (8 блок)","КМ13 (8 блок)","КМ14 (8 блок)","КМ15 (8 блок)","КМ36 (8 блок)","КМ41 (8 блок)","КМ42 (8 блок)","КМ45 (8 блок)","KV2 (6 блок)","КМ24 (1ВВК)","КМ25 (1ВВК)"]};
EQUIPMENT.sort(function(a,b){
  var ia = ROUTE_ORDER.indexOf(a.id);
  var ib = ROUTE_ORDER.indexOf(b.id);
  return (ia<0?999:ia) - (ib<0?999:ib);
});
EQUIPMENT.forEach(function(eq){
  var fo = FIELD_ORDER[eq.id];
  if (fo && eq.fields) {
    eq.fields.sort(function(a,b){
      var ia = fo.indexOf(a.key);
      var ib = fo.indexOf(b.key);
      return (ia<0?999:ia) - (ib<0?999:ib);
    });
  }
  var io = INSTANCE_ORDER[eq.id];
  if (io && typeof eq.instances === "function") {
    var orig = eq.instances;
    eq.instances = function(){
      var list = orig.call(eq);
      list.sort(function(a,b){
        var ka = a.block || a.housingLabel || a.group || "";
        var kb = b.block || b.housingLabel || b.group || "";
        var ia = io.indexOf(ka);
        var ib = io.indexOf(kb);
        return (ia<0?999:ia) - (ib<0?999:ib);
      });
      return list;
    };
  }
});

if (typeof applyRouteOrder === "function") { applyRouteOrder(); }
if(MODE==='housings'){EQUIPMENT=EQUIPMENT.filter(e=>e.id==='housings');}
}

const GROUPS={'g1':{id:'g1',label:'С101+1/2С102',fullLabel:'С101+1/2С102 (Группа МВ1, провода с206-с3)',normalMin:617.2,normalMax:726,reject:617.1,parts:['С101','С102']},'g2':{id:'g2',label:'С103+1/2С102',fullLabel:'С103+1/2С102 (Группа МВ2, провода с208-с3)',normalMin:617.2,normalMax:726,reject:617.1,parts:['С103','С102']},'g3':{id:'g3',label:'С107+1/2С108',fullLabel:'С107+1/2С108 (Группа МВ1, провода с121-с3)',normalMin:617.2,normalMax:726,reject:617.1,parts:['С107','С108']},'g4':{id:'g4',label:'С104-С105',fullLabel:'С104-С105 (Группа МК, провода с214-с3)',normalMin:822.9,normalMax:968,reject:822.8,parts:['С104','С105']},'g5':{id:'g5',label:'С106-1/2С109',fullLabel:'С106-1/2С109 (Группа ДП, провода с202-с3)',normalMin:617.2,normalMax:726,reject:617.1,parts:['С106','С109']},'g6':{id:'g6',label:'1/2С109',fullLabel:'1/2С109 (Группа КМ2, провода с123-с3)',normalMin:205.8,normalMax:242,reject:205.7,parts:['С109']},'g7':{id:'g7',label:'1/2С108',fullLabel:'1/2С108 (Группа КМ2, провода с122-с3)',normalMin:205.8,normalMax:242,reject:205.7,parts:['С108']}};
function buildPartToGroupsMap(){const map={};for(const gid in GROUPS){const g=GROUPS[gid];for(const part of g.parts){if(!map[part])map[part]=[];map[part].push(gid);}}return map;}
const PART_TO_GROUPS=buildPartToGroupsMap();
function getGroupsForPart(part){return PART_TO_GROUPS[part]||[];}

function instId(eqId,inst,idx){if(eqId==='housings')return[eqId,inst.section,inst.housingId||'',idx].join('|');return[eqId,inst.section,inst.group||'',inst.block||'',inst.sub||'',idx].join('|');}
function getVal(iid,key){return(STATE.values[iid]&&STATE.values[iid][key])||'';}
function setVal(iid,key,val){if(!STATE.values[iid])STATE.values[iid]={};STATE.values[iid][key]=val;saveState(true);updateStats();}
function addNotRequiredOption(select){if(select.querySelector('option[value="не требуется"]'))return;const notReq=document.createElement('option');notReq.value='не требуется';notReq.textContent='не требуется';if(select.options.length>0)select.insertBefore(notReq,select.options[1]);else select.appendChild(notReq);}
function removeNotRequiredOption(select){const opt=select.querySelector('option[value="не требуется"]');if(opt)opt.remove();}
function isMk84(iid){const zavVal=getVal(iid,'zav')||'';const n=zavVal.trim().toUpperCase();return(n==='МК-84'||n==='MK-84'||n==='МК84'||n==='MK84');}
function setMk84Fields(iid){const card=document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);if(!card)return;const eq=EQUIPMENT.find(e=>e.id==='mk9');if(!eq)return;eq.fields.forEach(field=>{if(field.key==='zav')return;const c=card.querySelector(\`.frow[data-field-key="\${field.key}"] select, .frow[data-field-key="\${field.key}"] input\`);if(!c)return;if(c.tagName==='SELECT'){addNotRequiredOption(c);c.value='не требуется';c.disabled=true;}else{c.value='не требуется';c.disabled=true;}setVal(iid,field.key,'не требуется');});card.classList.add('mk84-detected');refreshInstance(eq,null,iid,card);updatePhotoRequirementForField(iid,'zav',card);}
function clearMk84Fields(iid){const card=document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);if(!card)return;const eq=EQUIPMENT.find(e=>e.id==='mk9');if(!eq)return;eq.fields.forEach(field=>{if(field.key==='zav')return;const c=card.querySelector(\`.frow[data-field-key="\${field.key}"] select, .frow[data-field-key="\${field.key}"] input\`);if(!c)return;if(c.tagName==='SELECT'){removeNotRequiredOption(c);c.value='';c.disabled=false;}else{c.value='';c.disabled=false;}setVal(iid,field.key,'');});card.classList.remove('mk84-detected');syncShuntF2(eq,iid,card);refreshInstance(eq,null,iid,card);updatePhotoRequirementForField(iid,'zav',card);}
function checkMk84Status(eq,iid){if(eq.id!=='mk9')return;const card=document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);if(!card)return;const now=isMk84(iid);const was=card.dataset.wasMk84==='true';if(now!==was){if(now)setMk84Fields(iid);else clearMk84Fields(iid);card.dataset.wasMk84=now;}else{updatePhotoRequirementForField(iid,'zav',card);}const w=card.querySelector('.mk84-warning');if(w)w.style.display=now?'block':'none';card.classList.toggle('mk84-detected',now);refreshInstance(eq,null,iid,card);}
function syncShuntF2(eq,iid,card){if(eq.id!=='mk9'&&eq.id!=='bvv')return;if(eq.id==='mk9'&&isMk84(iid))return;const f1Val=getVal(iid,'f1');const f2Select=card.querySelector('.frow[data-field-key="f2"] select');if(!f2Select)return;const sp='отсутствует ШУ';const ex=f2Select.querySelector(\`option[value="\${sp}"]\`);if(f1Val==='Нет'){if(!ex){const o=document.createElement('option');o.value=sp;o.textContent=sp;f2Select.appendChild(o);}f2Select.value=sp;f2Select.disabled=true;setVal(iid,'f2',sp);}else{if(ex)ex.remove();if(getVal(iid,'f2')===sp)setVal(iid,'f2','');f2Select.value=getVal(iid,'f2')||'';f2Select.disabled=false;}}
function syncVb8OldNew(iid,card){card=card||document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);if(!card)return;const eq=EQUIPMENT.find(e=>e.id==='vb8');if(!eq)return;const f0Val=getVal(iid,'f0');const isOld=(f0Val==='Старый');const f1Row=card.querySelector('.frow[data-field-key="f1"]');const f2Row=card.querySelector('.frow[data-field-key="f2"]');if(!f1Row||!f2Row)return;const f1Select=f1Row.querySelector('select');const f2Select=f2Row.querySelector('select');if(!f1Select||!f2Select)return;function manage(select,fieldKey,disabled){const nr=select.querySelector('option[value="не требуется"]');if(disabled){if(!nr){const o=document.createElement('option');o.value='не требуется';o.textContent='не требуется';if(select.options.length>0)select.insertBefore(o,select.options[1]);else select.appendChild(o);}select.value='не требуется';select.disabled=true;setVal(iid,fieldKey,'не требуется');}else{if(nr)nr.remove();select.disabled=false;if(select.value==='не требуется'){select.value='';setVal(iid,fieldKey,'');}}}manage(f1Select,'f1',isOld);manage(f2Select,'f2',isOld);refreshInstance(eq,null,iid,card);}
function computeFlag(eq,iid){if(eq.customComputeFlag)return eq.customComputeFlag(iid);if(eq.id==='mk9'&&isMk84(iid))return{state:'bad',label:'Да'};let any=false,bad=false;for(const field of eq.fields){if(field.calc===false)continue;if(field.key==='zav')continue;if(field.type==='text')continue;const v=getVal(iid,field.key);if(!v||v==='')continue;any=true;if(v==='не требуется')continue;if(v==='отсутствует ШУ')continue;if(!field.ok||!field.ok.includes(v))bad=true;}if(!any)return{state:'na',label:'—'};return bad?{state:'bad',label:'Да'}:{state:'ok',label:'Нет'};}

// Сжатие фото: усилено с 800px/0.7 → 500px/0.5 (файл JSON уменьшается в 3-4 раза)
function compressImage(file,maxSize,quality,callback){const reader=new FileReader();reader.onload=function(e){const img=new Image();img.onload=function(){let w=img.width,h=img.height;if(w>maxSize||h>maxSize){const r=Math.min(maxSize/w,maxSize/h);w=Math.round(w*r);h=Math.round(h*r);}const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);callback(c.toDataURL('image/jpeg',quality));};img.src=e.target.result;};reader.readAsDataURL(file);}

function updatePhotoRequirementForField(iid,fieldKey,card){if(!card)card=document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);if(!card)return;const row=card.querySelector(\`.frow[data-field-key="\${fieldKey}"]\`);if(!row)return;const pa=row.querySelector('.photo-area');if(!pa)return;const btns=pa.querySelectorAll('.photo-btn');const val=getVal(iid,fieldKey);const pd=getVal(iid,fieldKey+'_photo');const eq=EQUIPMENT.find(e=>e.id===iid.split('|')[0]);if(!eq)return;const field=eq.fields.find(f=>f.key===fieldKey);if(!field)return;let required=false;if(eq.id==='vb8'&&fieldKey==='f0'){const v0=getVal(iid,'f0');if(v0&&v0!=='')required=!pd;}else if(eq.id==='mk9'&&fieldKey==='zav'){if(isMk84(iid)&&!pd)required=true;}else if(eq.id==='vb8'&&fieldKey==='f2'){required=false;}else{if(val&&val!==''&&val!=='— выбрать'&&val!=='не требуется'&&val!=='отсутствует ШУ'){if(field.photoAlways||(field.ok&&!field.ok.includes(val)))required=true;}}btns.forEach(btn=>{btn.classList.toggle('photo-required',required&&!pd);btn.title=required&&!pd?'Требуется фото':'Добавить фото';});row.classList.toggle('photo-required-field',required&&!pd);}

function initPhotoModal(){const modal=document.getElementById('photoModal');const img=document.getElementById('photoModalImg');const close=document.getElementById('photoModalClose');function open(src){img.src=src;modal.classList.add('active');modal.style.display='flex';}function closeM(){modal.classList.remove('active');modal.style.display='none';img.src='';}modal.addEventListener('click',e=>{if(e.target===modal)closeM();});close.addEventListener('click',closeM);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeM();});window.openPhotoModal=open;}

function addPhotoSupport(row,field,eq,iid){const photoKey=field.key+'_photo';const photoData=getVal(iid,photoKey);const wrap=document.createElement('div');wrap.className='photo-area';const preview=document.createElement('img');preview.className='photo-preview';preview.style.display=photoData?'block':'none';preview.alt='Фото';const cam=document.createElement('input');cam.type='file';cam.accept='image/*';cam.capture='environment';cam.style.display='none';const gal=document.createElement('input');gal.type='file';gal.accept='image/*';gal.style.display='none';const cBtn=document.createElement('button');cBtn.className='photo-btn';cBtn.textContent='📸 Сделать фото';const gBtn=document.createElement('button');gBtn.className='photo-btn';gBtn.textContent='🖼️ Выбрать из галереи';const dBtn=document.createElement('button');dBtn.className='photo-delete';dBtn.textContent='✕';dBtn.style.display=photoData?'inline-block':'none';if(photoData)preview.src=photoData;function handle(file){if(!file)return;cBtn.textContent='⏳';cBtn.disabled=true;gBtn.disabled=true;compressImage(file,500,0.5,d=>{setVal(iid,photoKey,d);preview.src=d;preview.style.display='block';dBtn.style.display='inline-block';requestAnimationFrame(()=>{cBtn.textContent='📸 Сделать фото';cBtn.disabled=false;gBtn.disabled=false;updatePhotoRequirementForField(iid,field.key);showToast('Фото прикреплено');updateStats();});});}cBtn.addEventListener('click',e=>{e.preventDefault();cam.click();});gBtn.addEventListener('click',e=>{e.preventDefault();gal.click();});cam.addEventListener('change',function(){const f=this.files[0];if(f)handle(f);this.value='';});gal.addEventListener('change',function(){const f=this.files[0];if(f)handle(f);this.value='';});dBtn.addEventListener('click',e=>{e.preventDefault();setVal(iid,photoKey,'');preview.src='';preview.style.display='none';dBtn.style.display='none';requestAnimationFrame(()=>{updatePhotoRequirementForField(iid,field.key);showToast('Фото удалено');updateStats();});});preview.addEventListener('click',function(){if(this.src&&this.style.display!=='none'&&typeof window.openPhotoModal==='function')window.openPhotoModal(this.src);});wrap.appendChild(preview);wrap.appendChild(cBtn);wrap.appendChild(gBtn);wrap.appendChild(dBtn);wrap.appendChild(cam);wrap.appendChild(gal);row.appendChild(wrap);setTimeout(()=>{updatePhotoRequirementForField(iid,field.key);},50);}

function fieldRow(eq,inst,iid,field){const row=document.createElement('div');row.className='frow';row.dataset.fieldKey=field.key;const lbl=document.createElement('div');lbl.className='flabel';let hintText=field.hint||'';if(eq.id==='rassekatel'&&field.key==='install'){if(inst.block==='U1')hintText='Рассекатель должен находиться со стороны тягового трансформатора — справа от ВИП при взгляде на него со стороны прохода <span class="legend"> Соответствует - "Да" <br> Не соответствует - "Нет"';else if(inst.block==='U2')hintText='Рассекатель должен находиться со стороны 8 блока — справа от ВИП при взгляде на него со стороны прохода ';}lbl.innerHTML=field.label+(hintText?\`<span class="hint">\${hintText}</span>\`:'');row.appendChild(lbl);let control;const mk84=(eq.id==='mk9'&&field.key!=='zav'&&isMk84(iid));const isZav=(eq.id==='mk9'&&field.key==='zav');const saved=getVal(iid,field.key);if(field.type==='select'){control=document.createElement('select');control.dataset.fieldKey=field.key;const blank=document.createElement('option');blank.value='';blank.textContent='— выбрать —';control.appendChild(blank);for(const o of field.options){const op=document.createElement('option');op.value=o;op.textContent=o;control.appendChild(op);}if((eq.id==='mk9'||eq.id==='bvv')&&field.key==='f2'){if(saved==='отсутствует ШУ'){const o=document.createElement('option');o.value='отсутствует ШУ';o.textContent='отсутствует ШУ';control.appendChild(o);}}control.value=saved;if(mk84){addNotRequiredOption(control);control.disabled=true;control.value='не требуется';if(saved!=='не требуется')setVal(iid,field.key,'не требуется');}control.addEventListener('change',function(){const val=this.value;if(val==='не требуется'){this.disabled=true;setVal(iid,field.key,val);}else{this.disabled=false;setVal(iid,field.key,val);}if((eq.id==='mk9'||eq.id==='bvv')&&field.key==='f1'){const card=this.closest('.inst');if(card)syncShuntF2(eq,iid,card);}if(eq.id==='vb8'&&field.key==='f0'){const card=this.closest('.inst');if(card){syncVb8OldNew(iid,card);updatePhotoRequirementForField(iid,'f0',card);}}refreshInstance(eq,inst,iid);if(isZav)checkMk84Status(eq,iid);if(field.photo&&field.key!=='zav'){setTimeout(()=>updatePhotoRequirementForField(iid,field.key),50);}row.classList.remove('frow-ok','frow-bad');if(val&&val!==''&&val!=='— выбрать'&&val!=='не требуется'&&val!=='отсутствует ШУ'){if(field.ok&&field.ok.includes(val))row.classList.add('frow-ok');else if(field.ok&&!field.ok.includes(val))row.classList.add('frow-bad');}if(eq.id==='housings'&&(field.key==='leak'||field.key==='oil'||field.key==='formation')){const card=this.closest('.inst');if(card){const iid2=card.dataset.iid;if(iid2)refreshInstance(eq,inst,iid2,card);}}if(eq.id==='rassekatel'&&field.key==='presence'){const card=this.closest('.inst');if(card){const iid2=card.dataset.iid;if(iid2)refreshInstance(eq,inst,iid2,card);}}});}else{control=document.createElement('input');control.type='text';control.value=saved;if(mk84){control.disabled=true;control.value='не требуется';if(saved!=='не требуется')setVal(iid,field.key,'не требуется');}if(field.key==='zav'&&eq.id!=='mk9'){control.addEventListener('input',function(){this.value=this.value.replace(/[^0-9\\-\\.]/g,'');setVal(iid,field.key,this.value);});control.addEventListener('blur',function(){this.value=this.value.replace(/[^0-9\\-\\.]/g,'');setVal(iid,field.key,this.value);refreshInstance(eq,inst,iid);if(field.photo)updatePhotoRequirementForField(iid,field.key);});}control.addEventListener('input',function(){setVal(iid,field.key,this.value);if(isZav)setTimeout(()=>checkMk84Status(eq,iid),10);if(field.photo&&field.key!=='zav')updatePhotoRequirementForField(iid,field.key);});control.addEventListener('blur',function(){const cv=getVal(iid,field.key);if(this.value!==cv)setVal(iid,field.key,this.value);refreshInstance(eq,inst,iid);if(isZav)checkMk84Status(eq,iid);if(field.photo&&field.key!=='zav')updatePhotoRequirementForField(iid,field.key);});control.addEventListener('change',function(){setVal(iid,field.key,this.value);refreshInstance(eq,inst,iid);if(isZav)checkMk84Status(eq,iid);if(field.photo&&field.key!=='zav')updatePhotoRequirementForField(iid,field.key);});}
const cw=document.createElement('div');cw.style.display='grid';cw.style.gridTemplateColumns='1fr';cw.appendChild(control);row.appendChild(cw);if(field.photo)addPhotoSupport(row,field,eq,iid);if(isZav){const warning=document.createElement('div');warning.className='mk84-warning';warning.textContent='⚠️ ВНИМАНИЕ: Установлен контактор МК-84 — остальные поля автоматически установлены в "не требуется"!';row.appendChild(warning);row._mk84Warning=warning;}return row;}

function buildInstanceCard(eq,inst,idx){const iid=instId(eq.id,inst,idx);const card=document.createElement('div');card.className='inst';card.dataset.iid=iid;const head=document.createElement('div');head.className='ih';let title=eq.title;if(eq.id==='housings'&&inst.housingLabel){title=inst.housingLabel;}else{const p=[inst.group,inst.block,inst.sub].filter(Boolean).join(' · ');if(p)title=p;}const lbl=document.createElement('div');lbl.innerHTML=\`<span class="lbl">\${title}</span>\`;head.appendChild(lbl);const pill=document.createElement('span');pill.className='pill na';pill.textContent='—';head.appendChild(pill);card.appendChild(head);const badgeContainer=document.createElement('div');badgeContainer.className='notice-badge';badgeContainer.id=\`badge_\${iid}\`;badgeContainer.style.display='none';badgeContainer.textContent='⚠️ Требуется уведомление';badgeContainer.addEventListener('click',function(e){e.stopPropagation();card.scrollIntoView({behavior:'smooth',block:'center'});highlightCard(card);});card.appendChild(badgeContainer);const isSF37Hidden=(eq.id==='msud')&&isSF37NotRequired();for(const field of eq.fields){if(isSF37Hidden&&(field.key==='f3'||field.key==='f7'))continue;card.appendChild(fieldRow(eq,inst,iid,field));}const autoRow=document.createElement('div');autoRow.className='frow auto';const aLbl=document.createElement('div');aLbl.className='flabel';aLbl.textContent='Наличие выявленных несоответствий (заполняется автоматически)';const aVal=document.createElement('div');aVal.className='val na';aVal.textContent='—';autoRow.appendChild(aLbl);autoRow.appendChild(aVal);card.appendChild(autoRow);card._pill=pill;card._autoVal=aVal;refreshInstance(eq,inst,iid,card);if(eq.id==='mk9'){const now=isMk84(iid);card.dataset.wasMk84=now;if(now)setMk84Fields(iid);else syncShuntF2(eq,iid,card);}else if(eq.id==='bvv'){syncShuntF2(eq,iid,card);}else if(eq.id==='vb8'){syncVb8OldNew(iid,card);}return card;}

function refreshInstance(eq,inst,iid,card){card=card||document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);if(!card)return;const flag=computeFlag(eq,iid);card.classList.remove('flag-ok','flag-bad');card._pill.className='pill '+flag.state;card._pill.textContent=flag.state==='na'?'—':(flag.state==='ok'?'Норма':'Есть замечания');card._autoVal.className='val '+flag.state;card._autoVal.textContent=flag.label;if(flag.state==='ok')card.classList.add('flag-ok');if(flag.state==='bad')card.classList.add('flag-bad');if(eq.id==='housings'){const formRow=card.querySelector('.frow[data-field-key="formation"]');if(formRow){const show=shouldShowFormation(iid);formRow.style.display=show?'':'none';const s=formRow.querySelector('select');if(s){if(isFormationLocked()&&show){s.value='СЛД';setVal(iid,'formation','СЛД');s.disabled=true;}else{s.disabled=false;}}}[['oil',1],['leak',1]].forEach(([fk])=>{const s=card.querySelector(\`select[data-field-key="\${fk}"]\`);if(s){const v=getVal(iid,fk);if(v==='Нет'||v==='Устранено')s.classList.add('bad-select');else s.classList.remove('bad-select');}});const zavRow=card.querySelector('.frow[data-field-key="zav"]');if(zavRow){const f=getVal(iid,'formation');const l=getVal(iid,'leak');if(f==='НЭВЗ'&&l==='Нет')zavRow.style.display='';else{zavRow.style.display='none';const zi=zavRow.querySelector('input[type="text"]');if(zi){zi.value='';setVal(iid,'zav','');}}}}if(eq.id==='rassekatel'){const presence=getVal(iid,'presence');const iRow=card.querySelector('.frow[data-field-key="install"]');if(iRow){if(presence==='Да')iRow.style.display='';else{iRow.style.display='none';setVal(iid,'install','');const s=iRow.querySelector('select');if(s)s.value='';}}const iSel=card.querySelector('select[data-field-key="install"]');if(iSel){const v=getVal(iid,'install');if(v==='Нет')iSel.classList.add('bad-select');else iSel.classList.remove('bad-select');}}if(eq.id==='shina'){const f1=card.querySelector('select[data-field-key="f1"]');if(f1){const v=getVal(iid,'f1');if(v==='Нет'||v==='Устранено')f1.classList.add('bad-select');else f1.classList.remove('bad-select');}const f3=card.querySelector('select[data-field-key="f3"]');if(f3){const v=getVal(iid,'f3');if(v==='Нет')f3.classList.add('bad-select');else f3.classList.remove('bad-select');}}if(eq.id==='housings'){const badge=document.getElementById(\`badge_\${iid}\`);if(badge){const needed=isNoticeNeeded(iid);badge.style.display=needed?'inline-block':'none';card.classList.toggle('notice-needed',needed);}}updateStats();updateNoticeList();updateNoticeCount();}

function isNoticeNeeded(iid){const f=getVal(iid,'formation');const l=getVal(iid,'leak');return(f==='НЭВЗ'&&l==='Нет');}
function updateNoticeList(){const list=document.getElementById('noticeList');const emptyMsg=document.getElementById('emptyMsg');list.querySelectorAll('.item').forEach(el=>el.remove());const needed=[];document.querySelectorAll('.inst[data-iid]').forEach(card=>{const iid=card.dataset.iid;const eqId=iid.split('|')[0];if(eqId==='housings'&&isNoticeNeeded(iid))needed.push(iid);});if(needed.length===0){emptyMsg.style.display='block';return;}emptyMsg.style.display='none';needed.forEach(iid=>{const card=document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);if(!card)return;const lbl=card.querySelector('.ih .lbl');const title=lbl?lbl.textContent:iid;const section=iid.split('|')[1]||'';const div=document.createElement('div');div.className='item';div.dataset.iid=iid;div.innerHTML=\`<span><strong>\${title}</strong> (\${section})</span><span class="highlight">⚠️ Требуется уведомление</span>\`;div.addEventListener('click',()=>{if(card){card.scrollIntoView({behavior:'smooth',block:'center'});highlightCard(card);}});list.appendChild(div);});}
function updateNoticeCount(){let count=0;document.querySelectorAll('.inst[data-iid]').forEach(card=>{const iid=card.dataset.iid;const eqId=iid.split('|')[0];if(eqId==='housings'&&isNoticeNeeded(iid))count++;});const badge=document.getElementById('noticeCount');if(badge)badge.textContent=count;}
function highlightCard(card){card.style.transition='box-shadow .3s';card.style.boxShadow='0 0 0 4px #d4a017, 0 4px 20px rgba(212,160,23,0.5)';setTimeout(()=>{card.style.boxShadow='';},2500);}

/* ========================================================================
   ПОИСК НЕЗАПОЛНЕННОГО (исправленный)
   ======================================================================== */
const GENERAL_CHECKS=[{key:'date',validate:v=>!!v},{key:'type',validate:v=>!!v},{key:'number',validate:v=>!!v},{key:'place',validate:v=>!!v},{key:'mileage',validate:v=>{if(!v)return false;return isValidMileage(v,STATE.general.type,STATE.general.number);}}];

function findFirstUnfilledGeneral(){for(const check of GENERAL_CHECKS){const val=STATE.general[check.key];if(!check.validate(val)){const wrap=document.querySelector(\`#generalGrid [data-general-field="\${check.key}"]\`);if(!wrap)continue;const control=wrap.querySelector('input, select');if(control&&!control.disabled)return{element:wrap,focusEl:control};}}return null;}

/* Проверка: требует ли поле фото, которое ещё не приложено */
function isPhotoRequiredForField(eq,iid,field,val){
if(!val||val==='')return false;
if(eq.id==='vb8'&&field.key==='f0')return true;
if(eq.id==='mk9'&&field.key==='zav')return isMk84(iid);
if(eq.id==='vb8'&&field.key==='f2')return false;
if(val==='не требуется'||val==='отсутствует ШУ')return false; // то же правило, что и у подсветки кнопки фото
if(field.photoAlways)return true;
if(field.ok&&!field.ok.includes(val))return true;
return false;
}
function fieldNeedsPhotoButMissing(eq,iid,field){
const val=getVal(iid,field.key);
if(!isPhotoRequiredForField(eq,iid,field,val))return false;
const pd=getVal(iid,field.key+'_photo');
return !pd;
}

function findFirstUnfilled(){
const gen=findFirstUnfilledGeneral();
if(gen)return gen;
const cards=document.querySelectorAll('.inst');
for(const card of cards){
const iid=card.dataset.iid;
const gid=card.dataset.gid;
if(iid){
const eqId=iid.split('|')[0];
const eq=EQUIPMENT.find(e=>e.id===eqId);
if(!eq||eq.customRender)continue;
for(const field of eq.fields){
const row=card.querySelector(\`.frow[data-field-key="\${field.key}"]\`);
if(!row)continue;
if(row.style.display==='none')continue;
const control=row.querySelector('select, input[type="text"]');
if(!control)continue;
if(control.disabled)continue;
const val=getVal(iid,field.key);
// 1) пустое поле — приоритет
if(!val||val==='')return{element:row,focusEl:control,reason:'empty'};
// 2) заполнено, но требуется фото, а его нет
if(field.photo&&fieldNeedsPhotoButMissing(eq,iid,field)){
return{element:row,focusEl:control,reason:'photo'};
}
}
}else if(gid){
const section=card.dataset.section;
const group=GROUPS[gid];
if(!group)continue;
const groupSelect=card.querySelector('.group-select');
if(!groupSelect)continue;
const groupStatus=getGroupStatus(section,gid);
if(!groupStatus||groupStatus==='')return{element:groupSelect.closest('.frow'),focusEl:groupSelect,reason:'empty'};
if(groupStatus==='Нет'){
for(const part of group.parts){
for(const sub of['1','2']){
const val=getPartStatus(section,part,sub);
if(!val||val===''){const sel=card.querySelector(\`.part-select[data-part-name="\${part}"][data-sub="\${sub}"]\`);if(sel)return{element:sel.closest('.frow'),focusEl:sel,reason:'empty'};}
if(val==='Нет'){const sn=getSn(section,part,sub);if(!sn||sn===''){const inp=card.querySelector(\`.sub-sn[data-part-name="\${part}"][data-sub="\${sub}"]\`);if(inp)return{element:inp.closest('.frow'),focusEl:inp,reason:'empty'};}}
}}}}
}
return null;
}

function countUnfilled(){
let count=0;
for(const check of GENERAL_CHECKS){const val=STATE.general[check.key];if(!check.validate(val)){const wrap=document.querySelector(\`#generalGrid [data-general-field="\${check.key}"]\`);if(wrap){const c=wrap.querySelector('input, select');if(c&&!c.disabled)count++;}else count++;}}
const cards=document.querySelectorAll('.inst');
for(const card of cards){
const iid=card.dataset.iid;const gid=card.dataset.gid;
if(iid){
const eqId=iid.split('|')[0];const eq=EQUIPMENT.find(e=>e.id===eqId);if(!eq||eq.customRender)continue;
for(const field of eq.fields){
const row=card.querySelector(\`.frow[data-field-key="\${field.key}"]\`);
if(!row||row.style.display==='none')continue;
const c=row.querySelector('select, input[type="text"]');
if(!c||c.disabled)continue;
const val=getVal(iid,field.key);
if(!val||val==='')count++;
else if(field.photo&&fieldNeedsPhotoButMissing(eq,iid,field))count++;
}
}else if(gid){
const section=card.dataset.section;const group=GROUPS[gid];if(!group)continue;
const gs=getGroupStatus(section,gid);
if(!gs||gs===''){count++;continue;}
if(gs==='Нет'){for(const part of group.parts){for(const sub of['1','2']){const val=getPartStatus(section,part,sub);if(!val||val==='')count++;else if(val==='Нет'){const sn=getSn(section,part,sub);if(!sn||sn==='')count++;}}}}
}
}
return count;
}

function expandCollapsedForRow(row){let parent=row.parentElement;while(parent){if(parent.classList.contains('sec-body')&&parent.classList.contains('collapsed')){parent.classList.remove('collapsed');const h=parent.previousElementSibling;if(h){const ic=h.querySelector('.sec-toggle-icon');if(ic)ic.classList.remove('collapsed');}}parent=parent.parentElement;}}

function updateFindBadge(){const badge=document.getElementById('findBadge');if(!badge)return;const n=countUnfilled();if(n>0){badge.textContent=n;badge.style.display='inline-block';}else{badge.style.display='none';}}
function findAndScrollToUnfilled(){
document.querySelectorAll('.frow.unfilled-highlight, .field.unfilled-highlight').forEach(el=>el.classList.remove('unfilled-highlight'));
if(!STATE.general.type){showToast('⚠️ Сначала выберите тип электровоза');const ts=document.querySelector('#generalGrid [data-general-field="type"] select');if(ts){ts.focus();ts.scrollIntoView({behavior:'smooth',block:'center'});}return;}
const result=findFirstUnfilled();
if(!result){showToast('✅ Все данные и операции заполнены!');updateFindBadge();return;}
if(result.element.classList.contains('frow'))expandCollapsedForRow(result.element);
requestAnimationFrame(()=>{
result.element.scrollIntoView({behavior:'smooth',block:'center'});
result.element.classList.add('unfilled-highlight');
setTimeout(()=>{if(result.focusEl&&!result.focusEl.disabled){try{result.focusEl.focus({preventScroll:true});}catch(e){}}},450);
setTimeout(()=>{result.element.classList.remove('unfilled-highlight');},4000);
});
const rem=countUnfilled();
if(result.reason==='photo'){showToast('📷 Требуется прикрепить фото. Осталось: '+(rem-1>0?rem-1:0));}
else if(rem>1)showToast(\`Переход к незаполненному полю. Осталось: \${rem-1}\`);
else showToast('Переход к последнему незаполненному полю');
}


// ========================================================================
// РЕНДЕР ОБЩИХ ДАННЫХ
// ========================================================================
function fillSelectOptions(select,options,currentVal,placeholder){select.innerHTML='';const b=document.createElement('option');b.value='';b.textContent=placeholder||'— выберите —';select.appendChild(b);for(const o of options){const op=document.createElement('option');op.value=o;op.textContent=o;select.appendChild(op);}select.value=(currentVal!==undefined&&currentVal!==null&&options.includes(currentVal))?currentVal:'';}
function refreshChain(changedKey){const type=STATE.general.type||'';const number=STATE.general.number||'';if(changedKey==='type'){STATE.general.number='';STATE.general.depot='';STATE.general.place='';STATE.selectedSections=[];STATE.selected=[];}if(changedKey==='number'){const rec=kzcRecord(type,number);STATE.general.depot=rec?rec.depot:'';STATE.general.place='';}}

function renderGeneral(){const grid=document.getElementById('generalGrid');grid.innerHTML='';const type=STATE.general.type||'';const number=STATE.general.number||'';const rec=kzcRecord(type,number);

const dateWrap=document.createElement('div');dateWrap.className='field';dateWrap.dataset.generalField='date';const dl=document.createElement('label');dl.textContent='Дата осмотра';dateWrap.appendChild(dl);const di=document.createElement('input');di.type='date';di.value=STATE.general.date||'';di.addEventListener('input',()=>{STATE.general.date=di.value;saveState(true);updateStats();});di.addEventListener('change',()=>{STATE.general.date=di.value;saveState(true);updateStats();});dateWrap.appendChild(di);grid.appendChild(dateWrap);

const typeWrap=document.createElement('div');typeWrap.className='field';typeWrap.dataset.generalField='type';const tl=document.createElement('label');tl.textContent='Тип электровоза';typeWrap.appendChild(tl);const ts=document.createElement('select');fillSelectOptions(ts,LOCOMOTIVE_TYPES,type,'— выберите тип —');ts.addEventListener('change',function(){const val=this.value;STATE.general.type=val;refreshChain('type');document.getElementById('locomotiveTypeTag').textContent=val||'—';buildEquipment(val);saveState(true);renderGeneral();renderPicker();renderEquip();updateStats();if(val)showToast('Тип электровоза изменён на '+val);else showToast('Выберите тип электровоза');});typeWrap.appendChild(ts);grid.appendChild(typeWrap);

const numWrap=document.createElement('div');numWrap.className='field';numWrap.dataset.generalField='number';const nl=document.createElement('label');nl.textContent='Номер электровоза';numWrap.appendChild(nl);const ni=document.createElement('input');ni.type='text';ni.placeholder='Введите номер электровоза (с 2024 г.)';ni.value=number;ni.disabled=!type;ni.classList.add('number-input');const eh=document.createElement('div');eh.className='error-hint';eh.textContent=__regHint();numWrap.appendChild(ni);numWrap.appendChild(eh);
function validateNumber(){const val=ni.value.trim();if(val===''){STATE.general.number='';refreshChain('number');saveState(true);renderGeneral();updateStats();ni.classList.remove('error');eh.classList.remove('show');return true;}const valid=kzcNumbersForType(type);if(!valid.includes(val)){ni.classList.add('error');eh.classList.add('show');return false;}const numberChanged=STATE.general.number!==val;STATE.general.number=val;if(numberChanged)refreshChain('number');saveState(true);renderGeneral();updateStats();ni.classList.remove('error');eh.classList.remove('show');return true;}
ni.addEventListener('blur',function(){const v=validateNumber();if(!v)setTimeout(()=>this.focus(),0);});ni.addEventListener('input',function(){this.classList.remove('error');eh.classList.remove('show');});ni.addEventListener('keypress',function(e){if(e.key==='Enter'){e.preventDefault();this.blur();}});
if(!type){const h=document.createElement('div');h.className='hint-lock';h.textContent='Сначала выберите тип электровоза';numWrap.appendChild(h);}grid.appendChild(numWrap);

const depWrap=document.createElement('div');depWrap.className='field';depWrap.dataset.generalField='depot';const dl2=document.createElement('label');dl2.textContent='Приписка электровоза';depWrap.appendChild(dl2);const dpi=document.createElement('input');dpi.type='text';dpi.value=rec?rec.depot:'';dpi.readOnly=true;dpi.classList.add('auto-filled');depWrap.appendChild(dpi);grid.appendChild(depWrap);

const plWrap=document.createElement('div');plWrap.className='field';plWrap.dataset.generalField='place';const pll=document.createElement('label');pll.textContent='Место осмотра';plWrap.appendChild(pll);const ps=document.createElement('select');let places=[];if(rec&&rec.depot&&DEPOT_PLACES[rec.depot])places=(rec.places&&rec.places.length)?rec.places:DEPOT_PLACES[rec.depot];fillSelectOptions(ps,places,STATE.general.place||'',rec?'— выберите место —':'— сначала выберите номер —');ps.disabled=!rec;ps.addEventListener('change',function(){STATE.general.place=this.value;saveState(true);updateStats();renderGeneral();});plWrap.appendChild(ps);grid.appendChild(plWrap);

const miWrap=document.createElement('div');miWrap.className='field';miWrap.dataset.generalField='mileage';const ml=document.createElement('label');ml.textContent='Пробег электровоза от постройки, км';miWrap.appendChild(ml);const mi=document.createElement('input');mi.type='text';mi.value=STATE.general.mileage||'';mi.placeholder='Введите пробег (только цифры)';const ready=type&&rec&&(STATE.general.place||'');mi.disabled=!ready;const me=document.createElement('div');me.className='error-hint';me.style.display='none';me.style.marginTop='2px';miWrap.appendChild(me);
function validateMileageInput(){const val=mi.value.trim();if(val===''){mi.classList.remove('error');me.style.display='none';return true;}const t=STATE.general.type;const n=STATE.general.number;if(!t||!n){mi.classList.remove('error');me.style.display='none';return true;}const err=getMileageError(val,t,n);if(err){mi.classList.add('error');me.textContent=err;me.style.display='block';return false;}mi.classList.remove('error');me.style.display='none';return true;}
mi.addEventListener('input',function(){this.value=this.value.replace(/[^0-9]/g,'');STATE.general.mileage=this.value;validateMileageInput();saveState(true);updateStats();});mi.addEventListener('blur',function(){validateMileageInput();STATE.general.mileage=this.value;saveState(true);updateStats();});mi.addEventListener('change',function(){this.value=this.value.replace(/[^0-9]/g,'');STATE.general.mileage=this.value;validateMileageInput();saveState(true);updateStats();});mi.addEventListener('keypress',function(e){if(e.key==='Enter'){e.preventDefault();this.blur();}});
miWrap.appendChild(mi);if(!ready){const h=document.createElement('div');h.className='hint-lock';if(!type)h.textContent='Сначала выберите тип и номер электровоза';else if(!rec)h.textContent='Введите корректный номер электровоза';else if(!STATE.general.place)h.textContent='Выберите место осмотра';miWrap.appendChild(h);}else if(STATE.general.mileage){setTimeout(validateMileageInput,10);}grid.appendChild(miWrap);

document.getElementById('locomotiveTypeTag').textContent=type||'—';
renderSectionsSelection();
renderPicker();
}

function renderSectionsSelection(){const c=document.getElementById('sectionsSelection');const type=STATE.general.type||'';if(!type){c.innerHTML='<div style="color:var(--ink-dim);font-size:12px;">Выберите тип электровоза для выбора секций</div>';return;}const so=getSections(type);const sel=STATE.selectedSections||[];c.innerHTML='';const lbl=document.createElement('div');lbl.style.cssText='font-size:11.5px;color:var(--ink-dim);font-weight:600;margin-bottom:8px;';lbl.textContent='Выберите секции для осмотра';c.appendChild(lbl);const wr=document.createElement('div');wr.className='picker';const all=document.createElement('div');const allSel=sel.length===so.length;all.className='chip'+(allSel?' active':'');all.innerHTML='<span>Все</span>';all.onclick=function(){if(allSel)STATE.selectedSections=[];else STATE.selectedSections=so.map(s=>s.label);saveState(true);renderSectionsSelection();renderEquip();updateStats();};wr.appendChild(all);for(const s of so){const chip=document.createElement('div');const isAct=sel.includes(s.label);chip.className='chip'+(isAct?' active':'');const tn=s.typeName?\` (\${s.typeName})\`:'';chip.innerHTML=\`<span>\${s.label}\${tn}</span>\`;chip.onclick=function(){const i=STATE.selectedSections.indexOf(s.label);if(i>=0)STATE.selectedSections.splice(i,1);else STATE.selectedSections.push(s.label);saveState(true);renderSectionsSelection();renderEquip();updateStats();};wr.appendChild(chip);}c.appendChild(wr);}

function renderPicker(){const picker=document.getElementById('picker');picker.innerHTML='';if(!STATE.general.type){const m=document.createElement('div');m.style.cssText='width:100%;text-align:center;color:var(--ink-dim);padding:12px 0;';m.textContent='Сначала выберите тип электровоза в разделе "Общие данные"';picker.appendChild(m);return;}
// В режиме "Только Кожуха" — фиксируем выбор только на кожухах
if(MODE==='housings'){if(STATE.selected.length!==1||STATE.selected[0]!=='housings'){STATE.selected=['housings'];saveState(true);}const eq=EQUIPMENT[0];if(!eq)return;const n=eq.instances().length;const chip=document.createElement('div');chip.className='chip active';chip.innerHTML=\`<span>\${eq.title}</span><span class="n">\${n}</span>\`;chip.onclick=()=>{};picker.appendChild(chip);return;}
const all=document.createElement('div');const allSel=STATE.selected.length===EQUIPMENT.length;all.className='chip'+(allSel?' active':'');all.innerHTML='<span>Весь чек-лист</span>';all.onclick=()=>{if(allSel)STATE.selected=[];else STATE.selected=EQUIPMENT.map(e=>e.id);saveState(true);renderPicker();renderEquip();};picker.appendChild(all);for(const eq of EQUIPMENT){const n=eq.instances().length;const chip=document.createElement('div');const isAct=STATE.selected.includes(eq.id);chip.className='chip'+(isAct?' active':'');chip.innerHTML=\`<span>\${eq.title}</span><span class="n">\${n}</span>\`;chip.onclick=()=>{const i=STATE.selected.indexOf(eq.id);if(i>=0)STATE.selected.splice(i,1);else STATE.selected.push(eq.id);saveState(true);renderPicker();renderEquip();};picker.appendChild(chip);}}

function getPartStatus(section,part,sub){return STATE.values['p_'+section+'_'+part+'_'+sub]||'';}
function setPartStatus(section,part,sub,value){const key='p_'+section+'_'+part+'_'+sub;if(STATE.values[key]===value)return;if(value==='Да'){const groups=getGroupsForPart(part);for(const gid of groups){const gs=getGroupStatus(section,gid);if(gs!=='Нет')continue;const group=GROUPS[gid];let allDa=true;for(const p of group.parts){for(const s of['1','2']){const cv=(p===part&&s===sub)?value:getPartStatus(section,p,s);if(cv!=='Да'){allDa=false;break;}}if(!allDa)break;}if(allDa){showToast('❌ Нельзя выбрать "Да" для всех подпунктов в группе '+group.label);document.querySelectorAll(\`.part-select[data-part-name="\${part}"][data-sub="\${sub}"][data-section="\${section}"]\`).forEach(s=>{s.value=getPartStatus(section,part,sub);});return;}}}STATE.values[key]=value;document.querySelectorAll(\`.part-select[data-part-name="\${part}"][data-sub="\${sub}"][data-section="\${section}"]\`).forEach(s=>{if(s.value!==value)s.value=value;});const affected=getGroupsForPart(part);for(const gid of affected){document.querySelectorAll(\`.inst[data-section="\${section}"][data-gid="\${gid}"]\`).forEach(b=>{updateKpsBlockStatus(b,section,gid);});}saveState(true);updateStats();}
function getSn(section,part,sub){return STATE.values['sn_'+section+'_'+part+'_'+sub]||'';}
function setSn(section,part,sub,value){const key='sn_'+section+'_'+part+'_'+sub;if(STATE.values[key]===value)return;STATE.values[key]=value;const other=sub==='1'?'2':'1';const ok='sn_'+section+'_'+part+'_'+other;if(STATE.values[ok]!==value){STATE.values[ok]=value;document.querySelectorAll(\`.sub-sn[data-part-name="\${part}"][data-sub="\${other}"][data-section="\${section}"]\`).forEach(i=>{i.value=value;});}document.querySelectorAll(\`.sub-sn[data-part-name="\${part}"][data-sub="\${sub}"][data-section="\${section}"]\`).forEach(i=>{i.value=value;});saveState(true);updateStats();}
function getGroupStatus(section,gid){return STATE.values['g_'+section+'_'+gid]||'';}
function setGroupStatus(section,gid,value,selectEl){const prev=getGroupStatus(section,gid);STATE.values['g_'+section+'_'+gid]=value;if(prev==='Нет'&&value==='Да'){const g=GROUPS[gid];if(g){for(const p of g.parts){for(const s of['1','2']){delete STATE.values['p_'+section+'_'+p+'_'+s];delete STATE.values['sn_'+section+'_'+p+'_'+s];}}document.querySelectorAll(\`.inst[data-section="\${section}"][data-gid="\${gid}"]\`).forEach(b=>{b.querySelectorAll('.part-select').forEach(s=>{s.value='';});b.querySelectorAll('.sub-sn').forEach(i=>{i.value='';});});}saveState(true);}document.querySelectorAll(\`.inst[data-section="\${section}"][data-gid="\${gid}"]\`).forEach(b=>{const sub=b.querySelector('.sub-fields');if(sub){if(value==='Нет')sub.classList.add('show');else sub.classList.remove('show');}const s=b.querySelector('.group-select');if(s&&s!==selectEl&&s.value!==value)s.value=value;updateKpsBlockStatus(b,section,gid);});if(value==='Нет'){const g=GROUPS[gid];if(g){for(const p of g.parts){for(const s of['1','2']){const v=getPartStatus(section,p,s);const sn=getSn(section,p,s);document.querySelectorAll(\`.part-select[data-section="\${section}"][data-part-name="\${p}"][data-sub="\${s}"]\`).forEach(el=>{if(el.value!==v)el.value=v;});document.querySelectorAll(\`.sub-sn[data-section="\${section}"][data-part-name="\${p}"][data-sub="\${s}"]\`).forEach(el=>{if(el.value!==sn)el.value=sn;});}}}}updateStats();}
function computeKpsFlag(section,gid){const g=GROUPS[gid];if(!g)return{state:'na',label:'—'};let any=false,bad=false;const st=getGroupStatus(section,gid);if(st&&st!==''){any=true;if(st==='Нет'){bad=true;for(const p of g.parts){for(const s of['1','2']){const ps=getPartStatus(section,p,s);if(ps&&ps!==''){any=true;if(ps==='Нет')bad=true;}}}}}if(!any)return{state:'na',label:'—'};return bad?{state:'bad',label:'Да'}:{state:'ok',label:'Нет'};}
function updateKpsBlockStatus(block,section,gid){const flag=computeKpsFlag(section,gid);const pill=block.querySelector('.pill');if(pill){pill.className='pill '+flag.state;pill.textContent=flag.state==='na'?'—':(flag.state==='ok'?'Норма':'Есть замечания');}const av=block.querySelector('.auto-val');if(av){av.className='val '+flag.state+' auto-val';av.textContent=flag.label;}block.classList.remove('flag-ok','flag-bad');if(flag.state==='ok')block.classList.add('flag-ok');if(flag.state==='bad')block.classList.add('flag-bad');}
function updateKpsRowStyle(row,select){const val=select.value;row.classList.remove('frow-ok','frow-bad');if(val&&val!==''){if(val==='Да')row.classList.add('frow-ok');else if(val==='Нет')row.classList.add('frow-bad');}}
function toggleSnVisibility(select,snInput){if(select.value==='Нет')snInput.style.display='';else{snInput.style.display='none';const s=select.dataset.section;const p=select.dataset.partName;const sub=select.dataset.sub;if(s&&p&&sub){delete STATE.values['sn_'+s+'_'+p+'_'+sub];saveState(true);}snInput.value='';}}

function buildKpsGroupCard(group,section){const block=document.createElement('div');block.className='inst';block.dataset.section=section;block.dataset.gid=group.id;const head=document.createElement('div');head.className='ih';const lbl=document.createElement('span');lbl.className='lbl';lbl.textContent=group.fullLabel;head.appendChild(lbl);const pill=document.createElement('span');pill.className='pill na';pill.textContent='—';head.appendChild(pill);block.appendChild(head);const infoRow=document.createElement('div');infoRow.className='frow';infoRow.style.borderTop='none';infoRow.style.paddingBottom='4px';const infoLabel=document.createElement('div');infoLabel.className='flabel';infoLabel.style.fontSize='12px';infoLabel.style.color='#d1453b';infoLabel.style.fontWeight='600';infoLabel.textContent=\`Да — \${group.normalMin} мкФ – \${group.normalMax} мкФ, Нет — менее \${group.reject} мкФ\`;infoRow.appendChild(infoLabel);infoRow.appendChild(document.createElement('div'));block.appendChild(infoRow);const frow=document.createElement('div');frow.className='frow';const fLbl=document.createElement('div');fLbl.className='flabel';fLbl.textContent='Соответствие:';frow.appendChild(fLbl);const fCtrl=document.createElement('div');const select=document.createElement('select');select.className='group-select';const blank=document.createElement('option');blank.value='';blank.textContent='— выбрать —';select.appendChild(blank);['Да','Нет'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;select.appendChild(o);});select.value=getGroupStatus(section,group.id);select.addEventListener('change',function(){setGroupStatus(section,group.id,this.value,this);updateKpsRowStyle(frow,this);});fCtrl.appendChild(select);frow.appendChild(fCtrl);block.appendChild(frow);updateKpsRowStyle(frow,select);const subC=document.createElement('div');subC.className='sub-fields';if(getGroupStatus(section,group.id)==='Нет')subC.classList.add('show');for(const part of group.parts){const dn=part.replace(/\\//g,'').replace(/\\s/g,'');const r1=document.createElement('div');r1.className='frow';const l1=document.createElement('div');l1.className='flabel';l1.innerHTML=part+' В.1: <span class="hint">Да — 205.8–242 мкФ, Нет — <205.7 мкФ</span>';r1.appendChild(l1);const cw1=document.createElement('div');cw1.className='control-wrap';const s1=document.createElement('select');s1.className='part-select';s1.dataset.partName=part;s1.dataset.sub='1';s1.dataset.section=section;['','Да','Нет'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v||'—';s1.appendChild(o);});s1.value=getPartStatus(section,part,'1');s1.addEventListener('change',function(){setPartStatus(section,part,'1',this.value);updateKpsRowStyle(r1,this);const sn=r1.querySelector('.sub-sn');if(sn)toggleSnVisibility(this,sn);});const sn1=document.createElement('input');sn1.type='text';sn1.className='sub-sn';sn1.placeholder='Зав. № (только при Нет)';sn1.dataset.section=section;sn1.dataset.partName=part;sn1.dataset.sub='1';sn1.value=getSn(section,part,'1');sn1.addEventListener('input',function(){setSn(section,part,'1',this.value);});toggleSnVisibility(s1,sn1);cw1.appendChild(s1);cw1.appendChild(sn1);r1.appendChild(cw1);subC.appendChild(r1);updateKpsRowStyle(r1,s1);
const r2=document.createElement('div');r2.className='frow';const l2=document.createElement('div');l2.className='flabel';l2.innerHTML=part+' В.2: <span class="hint">Да — 205.8–242 мкФ, Нет — <205.7 мкФ</span>';r2.appendChild(l2);const cw2=document.createElement('div');cw2.className='control-wrap';const s2=document.createElement('select');s2.className='part-select';s2.dataset.partName=part;s2.dataset.sub='2';s2.dataset.section=section;['','Да','Нет'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v||'—';s2.appendChild(o);});s2.value=getPartStatus(section,part,'2');s2.addEventListener('change',function(){setPartStatus(section,part,'2',this.value);updateKpsRowStyle(r2,this);const sn=r2.querySelector('.sub-sn');if(sn)toggleSnVisibility(this,sn);});const sn2=document.createElement('input');sn2.type='text';sn2.className='sub-sn';sn2.placeholder='Зав. № (только при Нет)';sn2.dataset.section=section;sn2.dataset.partName=part;sn2.dataset.sub='2';sn2.value=getSn(section,part,'2');sn2.addEventListener('input',function(){setSn(section,part,'2',this.value);});toggleSnVisibility(s2,sn2);cw2.appendChild(s2);cw2.appendChild(sn2);r2.appendChild(cw2);subC.appendChild(r2);updateKpsRowStyle(r2,s2);}
block.appendChild(subC);const autoRow=document.createElement('div');autoRow.className='frow auto';const aLbl=document.createElement('div');aLbl.className='flabel';aLbl.textContent='Наличие выявленных несоответствий';const aVal=document.createElement('div');aVal.className='val na auto-val';aVal.textContent='—';autoRow.appendChild(aLbl);autoRow.appendChild(aVal);block.appendChild(autoRow);updateKpsBlockStatus(block,section,group.id);return block;}

function renderKps(eq,sectionsToShow){const root=document.getElementById('equipRoot');if(!sectionsToShow||sectionsToShow.length===0){const msg=document.createElement('div');msg.className='select-type-message';msg.innerHTML='<span class="icon">📋</span><div class="title">Выберите секции</div><div class="sub">Для отображения КПС выберите хотя бы одну секцию</div>';root.appendChild(msg);return;}const wrap=document.createElement('div');wrap.className='equip';const eh=document.createElement('div');eh.className='eh';const total=sectionsToShow.length*Object.keys(GROUPS).length;eh.innerHTML=\`<h2>\${eq.title}</h2><span class="badge">\${total} поз.</span>\`;wrap.appendChild(eh);for(const section of sectionsToShow){const wrapper=document.createElement('div');wrapper.className='sec-wrapper';const header=document.createElement('div');header.className='sec-header';const icon=document.createElement('span');icon.className='sec-toggle-icon';icon.textContent='▼';header.innerHTML=\`<span>\${section}</span>\`;header.appendChild(icon);wrapper.appendChild(header);const body=document.createElement('div');body.className='sec-body';const sec=document.createElement('div');sec.className='sec';for(const gid in GROUPS){sec.appendChild(buildKpsGroupCard(GROUPS[gid],section));}body.appendChild(sec);wrapper.appendChild(body);let collapsed=false;header.addEventListener('click',function(){collapsed=!collapsed;body.classList.toggle('collapsed',collapsed);icon.classList.toggle('collapsed',collapsed);});wrap.appendChild(wrapper);}root.appendChild(wrap);document.querySelectorAll('.inst[data-gid]').forEach(b=>{const s=b.dataset.section;const g=b.dataset.gid;if(s&&g)updateKpsBlockStatus(b,s,g);});}

function renderEquip(){const root=document.getElementById('equipRoot');root.innerHTML='';if(!STATE.general.type){root.innerHTML=\`<div class="select-type-message"><span class="icon">🚆</span><div class="title">Выберите тип электровоза</div><div class="sub">Для отображения чек-листа необходимо выбрать тип электровоза в разделе «Общие данные»</div></div>\`;updateStats();return;}
const selSec=STATE.selectedSections||[];const allSec=getSections(STATE.general.type).map(s=>s.label);const sectionsToShow=selSec.length>0?selSec:allSec;const hasSelEq=STATE.selected.length>0;
if(sectionsToShow.length===0||!hasSelEq){let msg='';if(sectionsToShow.length===0&&!hasSelEq)msg='Выберите секции для осмотра и выберите узел(ы) для проверки (или «Весь чек-лист»).';else if(sectionsToShow.length===0)msg='Выберите секции для осмотра.';else msg='Выберите узел(ы) для проверки (или «Весь чек-лист»).';root.innerHTML=\`<div class="select-type-message"><span class="icon">📋</span><div class="title">\${msg}</div><div class="sub">Чек-лист отобразится после выбора секций и хотя бы одного узла.</div></div>\`;updateStats();return;}
const active=EQUIPMENT.filter(e=>STATE.selected.length===0||STATE.selected.includes(e.id));
if(active.length===0){root.innerHTML=\`<div class="select-type-message"><span class="icon">📋</span><div class="title">Выберите узел(ы) для проверки</div><div class="sub">В разделе «Выбор чек‑листа» выберите хотя бы один узел.</div></div>\`;updateStats();return;}
const stdEq=active.filter(e=>!e.customRender);const custEq=active.filter(e=>e.customRender);
for(const eq of stdEq){const wrap=document.createElement('div');wrap.className='equip';const eh=document.createElement('div');eh.className='eh';const totalV=eq.instances().filter(i=>sectionsToShow.includes(i.section)).length;eh.innerHTML=\`<h2>\${eq.title}</h2><span class="badge">\${totalV} поз.</span>\`;wrap.appendChild(eh);const instances=eq.instances();const bySec={};instances.forEach((inst,idx)=>{if(!sectionsToShow.includes(inst.section))return;bySec[inst.section]=bySec[inst.section]||[];bySec[inst.section].push({inst,idx});});const secNames=Object.keys(bySec);const ak=\`accordion_\${eq.id}\`;let ast={};try{const sv=localStorage.getItem(ak);if(sv)ast=JSON.parse(sv);}catch(e){}if(Object.keys(ast).length===0)secNames.forEach(n=>{ast[n]=true;});for(const secName of secNames){const items=bySec[secName];const wrapper=document.createElement('div');wrapper.className='sec-wrapper';const header=document.createElement('div');header.className='sec-header';const isOpen=ast[secName]!==false;const icon=document.createElement('span');icon.className='sec-toggle-icon'+(isOpen?'':' collapsed');icon.textContent='▼';const sObj=getSections(STATE.general.type);const sMap={};sObj.forEach(s=>{sMap[s.label]=s.typeName;});const tn=sMap[secName]||'';const dName=tn?\`\${secName} (\${tn})\`:secName;header.innerHTML=\`<span>\${dName}</span>\`;header.appendChild(icon);wrapper.appendChild(header);const body=document.createElement('div');body.className='sec-body'+(isOpen?'':' collapsed');body.dataset.sectionName=secName;const secEl=document.createElement('div');secEl.className='sec';const h3=document.createElement('h3');h3.textContent=dName;secEl.appendChild(h3);const byGrp={};let hasGroups=false;for(const it of items){const g=it.inst.group||'';if(g)hasGroups=true;byGrp[g]=byGrp[g]||[];byGrp[g].push(it);}for(const gname in byGrp){let container=secEl;if(hasGroups&&gname){const grp=document.createElement('div');grp.className='grp';const gh=document.createElement('div');gh.className='gh';gh.textContent=gname;grp.appendChild(gh);secEl.appendChild(grp);container=grp;}for(const it of byGrp[gname])container.appendChild(buildInstanceCard(eq,it.inst,it.idx));}body.appendChild(secEl);wrapper.appendChild(body);header.addEventListener('click',function(){const b=this.nextElementSibling;const ic=this.querySelector('.sec-toggle-icon');const nowC=b.classList.toggle('collapsed');ic.classList.toggle('collapsed',nowC);ast[secName]=!nowC;localStorage.setItem(ak,JSON.stringify(ast));updateStats();});wrap.appendChild(wrapper);}root.appendChild(wrap);}
for(const eq of custEq)renderKps(eq,sectionsToShow);
document.querySelectorAll('.inst[data-iid]').forEach(card=>{const iid=card.dataset.iid;const eqId=iid.split('|')[0];const eq=EQUIPMENT.find(e=>e.id===eqId);if(eq)refreshInstance(eq,null,iid,card);});
stdEq.forEach(eq=>{if(eq.id==='mk9'){eq.instances().forEach((inst,idx)=>{const iid=instId(eq.id,inst,idx);const card=document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);if(card){const now=isMk84(iid);if(card.dataset.wasMk84===undefined){card.dataset.wasMk84=now;if(now)setMk84Fields(iid);else syncShuntF2(eq,iid,card);}const w=card.querySelector('.mk84-warning');if(w)w.style.display=now?'block':'none';card.classList.toggle('mk84-detected',now);updatePhotoRequirementForField(iid,'zav',card);}});}if(eq.id==='vb8'){eq.instances().forEach((inst,idx)=>{const iid=instId(eq.id,inst,idx);const card=document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);if(card)syncVb8OldNew(iid,card);});}});
updateStats();updateNoticeList();updateNoticeCount();}

function isSF37NotRequired(){const t=STATE.general.type||'';const n=STATE.general.number||'';if(!t||!n)return false;const num=parseInt(n,10);if(isNaN(num))return false;if(t==='2ЭС5К'&&num>=762)return true;if(t==='3ЭС5К'&&num>=1623)return true;if(t==='4ЭС5К'&&num===86)return true;return false;}

function computeStats(){
const gf=['date','type','number','depot','place','mileage'];
let fg=0;
for(const f of gf){
if(f==='mileage'){
const val=STATE.general.mileage||'';
if(val!==''){
if(isValidMileage(val,STATE.general.type,STATE.general.number))fg++;
}
}else{
if(STATE.general[f]&&STATE.general[f]!=='')fg++;
}
}
let ti=0,oi=0,bi=0;
let afc=0,ffc=0;
const type=STATE.general.type||'';
if(type){
const selSec=STATE.selectedSections||[];
const allSec=getSections(type).map(s=>s.label);
const sectionsToShow=selSec.length>0?selSec:allSec;
const active=EQUIPMENT.filter(e=>STATE.selected.length===0||STATE.selected.includes(e.id));
const hideSF37=isSF37NotRequired();
for(const eq of active){
if(eq.customRender){
for(const inst of eq.instances()){
if(!sectionsToShow.includes(inst.section))continue;
const section=inst.section;
const gid=inst.gid;
const group=GROUPS[gid];
if(!group)continue;
ti++;
const flag=computeKpsFlag(section,gid);
if(flag.state==='ok')oi++;
if(flag.state==='bad')bi++;
afc++;
const status=getGroupStatus(section,gid);
if(status&&status!=='')ffc++;
if(status==='Нет'){
for(const p of group.parts){
for(const s of['1','2']){
afc++;
const ps=getPartStatus(section,p,s);
if(ps&&ps!=='')ffc++;
if(ps==='Нет'){
afc++;
const sn=getSn(section,p,s);
if(sn&&sn!=='')ffc++;
}
}
}
}
}
}else{
const instances=eq.instances();
for(const inst of instances){
if(!sectionsToShow.includes(inst.section))continue;
ti++;
const idx=instances.indexOf(inst);
const iid=instId(eq.id,inst,idx);
const flag=computeFlag(eq,iid);
if(flag.state==='ok')oi++;
if(flag.state==='bad')bi++;
for(const field of eq.fields){
if(eq.id==='housings'&&field.key==='formation'){
const l=getVal(iid,'leak');
if(l!=='Нет')continue;
}
if(eq.id==='housings'&&field.key==='zav'){
const f=getVal(iid,'formation');
const l=getVal(iid,'leak');
if(f!=='НЭВЗ'||l!=='Нет')continue;
}
if(eq.id==='rassekatel'&&field.key==='install'){
const p=getVal(iid,'presence');
if(p!=='Да')continue;
}
if(eq.id==='msud'&&hideSF37&&(field.key==='f3'||field.key==='f7'))continue;
afc++;
const val=getVal(iid,field.key);
if(val&&val!==''&&val!=='— выбрать')ffc++;
if(field.photo&&isPhotoRequiredForField(eq,iid,field,val)){
afc++;
const pd=getVal(iid,field.key+'_photo');
if(pd)ffc++;
}
}
}
}
}
}
const tf=gf.length+afc;
const ft=fg+ffc;
const percent=tf?Math.floor(100*ft/tf):0;
return{totalInstances:ti,okInstances:oi,badInstances:bi,allFieldsCount:afc,filledFieldsCount:ffc,filledGeneral:fg,totalFields:tf,filledTotal:ft,percent};
}
function updateStats(){const stats=computeStats();document.getElementById('statTotal').textContent=stats.totalInstances;document.getElementById('statOk').textContent=stats.okInstances;document.getElementById('statBad').textContent=stats.badInstances;document.getElementById('statFilled').textContent=stats.percent+'%';const bar=document.getElementById('statProgressFill');if(bar)bar.style.width=stats.percent+'%';const exp=document.getElementById('btnExport');if(currentUser==='admin'){exp.disabled=false;exp.title='Администратор: экспорт доступен всегда';}else{if(stats.percent>=100){exp.disabled=false;exp.title='Чек-лист заполнен на 100%, экспорт разрешён';}else{exp.disabled=true;exp.title='Экспорт доступен только при 100% заполнении (сейчас '+stats.percent+'%)';}}updateFindBadge();}

async function exportWithPhotos(){ try{await __psReady();}catch(e){}
    try{
        if(currentUser!=='admin'){
            const s=computeStats();
            if(s.percent<100){
                showToast('⚠️ Экспорт доступен только при 100% заполнении чек-листа');
                return;
            }
        }
        const type=STATE.general.type||'';
        const number=STATE.general.number||'';
        const mileage=STATE.general.mileage||'';
        if(!isValidMileage(mileage,type,number)){
            const err=getMileageError(mileage,type,number);
            showToast('⚠️ Некорректный пробег: '+(err||''));
            return;
        }
        if(typeof ExcelJS==='undefined'){
            showToast('⚠️ Библиотека ExcelJS не загружена.');
            return;
        }
        if(!type){
            showToast('⚠️ Сначала выберите тип электровоза');
            return;
        }

        const wb=new ExcelJS.Workbook();
        wb.creator='Чек-лист';
        const wsD=wb.addWorksheet('Данные');
        const wsP=wb.addWorksheet('Фотографии');
        const wsS=wb.addWorksheet('Сводная');
        const MAX_OPS_COLUMNS=30;
        let opsOverflowCount=0;
        const summaryIssues=[];

        const commonHeaders=[
            'Дата осмотра','Место осмотра','Приписка эл-за','Серия эл-за',
            'Номер эл-за','Пробег эл-за','Уведомление поставщика, добавление записи в УНГУ',
            'Узел','Деталь','СЕКЦИЯ','БЛОК','СХ. №','Заводской №'
        ];

        const dh=[];
        for(let i=1;i<=MAX_OPS_COLUMNS;i++){
            dh.push('Контрольная операция '+i);
            dh.push('Соответствие контроля '+i);
        }
        wsD.addRow([...commonHeaders,...dh]);

        const ph=[];
        for(let i=1;i<=MAX_OPS_COLUMNS;i++){
            ph.push('Контрольная операция '+i);
            ph.push('Фото '+i);
        }
        wsP.addRow([...commonHeaders,...ph]);

        const selSec=STATE.selectedSections||[];
        const allSec=getSections(type).map(s=>s.label);
        const sectionsToShow=selSec.length>0?selSec:allSec;
        const active=EQUIPMENT.filter(e=>STATE.selected.length===0||STATE.selected.includes(e.id));
        const hideSF37=isSF37NotRequired();

        for(const eq of active){
            if(eq.customRender){
                for(const inst of eq.instances()){
                    if(!sectionsToShow.includes(inst.section)) continue;
                    const section=inst.section;
                    const gid=inst.gid;
                    const group=GROUPS[gid];
                    if(!group) continue;

                    const status=getGroupStatus(section,gid);
                    const flag=computeKpsFlag(section,gid);

                    const snParts=[];
                    for(const p of group.parts){
                        for(const s of ['1','2']){
                            const ps=getPartStatus(section,p,s);
                            if(ps==='Нет'){
                                const sn=getSn(section,p,s);
                                if(sn) snParts.push(p+' В.'+s+': '+sn);
                            }
                        }
                    }
                    const combinedSn=snParts.join('; ');
                    const wiresMatch=group.fullLabel.match(/провода\\s+([^)]*)/);
                    const wires=wiresMatch?wiresMatch[1]:'';

                    const cd=[
                        STATE.general.date||'',
                        STATE.general.place||'',
                        STATE.general.depot||'',
                        STATE.general.type||'',
                        STATE.general.number||'',
                        STATE.general.mileage||'',
                        '',
                        eq.title,
                        group.fullLabel,
                        section,
                        wires,
                        '',
                        combinedSn
                    ];

                    const ops=[{label:group.fullLabel,value:status||''}];
                    for(const p of group.parts){
                        for(const s of ['1','2']){
                            const v=getPartStatus(section,p,s)||'';
                            ops.push({label:p+' В.'+s+':',value:v});
                            if(v==='Нет'){
                                const sn=getSn(section,p,s)||'';
                                if(sn) ops.push({label:'Заводской №',value:sn});
                            }
                        }
                    }
                    ops.push({label:'Наличие выявленных несоответствий',value:flag.label});

                    if(flag.state==='bad'){
                        summaryIssues.push({node:eq.title,section,place:group.fullLabel,comment:flag.label});
                    }
                    if(ops.length>MAX_OPS_COLUMNS){
                        opsOverflowCount++;
                        console.warn('Превышен лимит колонок экспорта ('+MAX_OPS_COLUMNS+') для узла "'+eq.title+'", секция '+section+'. Часть проверок не попадёт в файл.');
                    }

                    const rd=[...cd];
                    for(let i=0;i<MAX_OPS_COLUMNS;i++){
                        if(i<ops.length){
                            rd.push(ops[i].label);
                            rd.push(ops[i].value);
                        }else{
                            rd.push('');
                            rd.push('');
                        }
                    }
                    wsD.addRow(rd);

                    const rp=[...cd];
                    for(let i=0;i<MAX_OPS_COLUMNS;i++){
                        if(i<ops.length){
                            rp.push(ops[i].label);
                            rp.push('');
                        }else{
                            rp.push('');
                            rp.push('');
                        }
                    }
                    wsP.addRow(rp);
                }
            }else{
                const instances=eq.instances();
                for(const inst of instances){
                    if(!sectionsToShow.includes(inst.section)) continue;
                    const idx=instances.indexOf(inst);
                    const iid=instId(eq.id,inst,idx);

                    const cd=[
                        STATE.general.date||'',
                        STATE.general.place||'',
                        STATE.general.depot||'',
                        STATE.general.type||'',
                        STATE.general.number||'',
                        STATE.general.mileage||'',
                        '',
                        eq.title,
                        inst.housingLabel||'',
                        inst.section,
                        eq.id==='housings'?'':(inst.block||inst.section),
                        '',
                        getVal(iid,'zav')||''
                    ];

                    const fields=eq.fields.filter(f=>f.key!=='zav');
                    const ops=[];
                    for(const field of fields){
                        if(eq.id==='housings'&&field.key==='formation'){
                            const l=getVal(iid,'leak');
                            if(l!=='Нет') continue;
                        }
                        if(eq.id==='housings'&&field.key==='zav') continue;
                        if(eq.id==='rassekatel'&&field.key==='install'){
                            const p=getVal(iid,'presence');
                            if(p!=='Да') continue;
                        }
                        if(eq.id==='msud'&&hideSF37&&(field.key==='f3'||field.key==='f7')) continue;

                        const val=getVal(iid,field.key)||'';
                        const pd=getVal(iid,field.key+'_photo')||'';
                        ops.push({label:field.label,value:val,photo:pd});
                    }
                    const flag=computeFlag(eq,iid);
                    ops.push({label:'Наличие выявленных несоответствий',value:flag.label,photo:''});

                    if(flag.state==='bad'){
                        summaryIssues.push({node:eq.title,section:inst.section,place:inst.housingLabel||inst.block||'',comment:flag.label});
                    }
                    if(ops.length>MAX_OPS_COLUMNS){
                        opsOverflowCount++;
                        console.warn('Превышен лимит колонок экспорта ('+MAX_OPS_COLUMNS+') для узла "'+eq.title+'", секция '+inst.section+'. Часть проверок не попадёт в файл.');
                    }

                    const rd=[...cd];
                    for(let i=0;i<MAX_OPS_COLUMNS;i++){
                        if(i<ops.length){
                            rd.push(ops[i].label);
                            rd.push(ops[i].value);
                        }else{
                            rd.push('');
                            rd.push('');
                        }
                    }
                    wsD.addRow(rd);

                    const rp=[...cd];
                    for(let i=0;i<MAX_OPS_COLUMNS;i++){
                        if(i<ops.length){
                            rp.push(ops[i].label);
                            rp.push('');
                        }else{
                            rp.push('');
                            rp.push('');
                        }
                    }
                    const rowP=wsP.addRow(rp);
                    const rowPI=rowP.number;

                    for(let i=0;i<MAX_OPS_COLUMNS&&i<ops.length;i++){
                        const pd=ops[i].photo;
                        if(pd&&pd.startsWith('data:image')){
                            const colIdx=13+2*i+1;
                            const b64=pd.split(',')[1];
                            const mimeMatch=pd.match(/data:(image\\/\\w+);/);
                            const mime=mimeMatch?mimeMatch[1]:'image/png';
                            const ext=mime.split('/')[1]||'png';
                            const imgId=wb.addImage({base64:b64,extension:ext});
                            wsP.addImage(imgId,{tl:{col:colIdx,row:rowPI-1},ext:{width:100,height:100}});
                            rowP.height=105;
                        }
                    }
                }
            }
        }

        for(let i=0;i<MAX_OPS_COLUMNS;i++){
            const ci=13+2*i+1;
            wsP.getColumn(ci).width=25;
        }

        const stats=computeStats();
        wsS.addRow(['Сводная информация по чек-листу']);
        wsS.addRow(['Электровоз', (STATE.general.type||'')+' № '+(STATE.general.number||'')]);
        wsS.addRow(['Дата осмотра', STATE.general.date||'']);
        wsS.addRow(['Всего проверенных позиций', stats.totalInstances]);
        wsS.addRow(['Без замечаний', stats.okInstances]);
        wsS.addRow(['С замечаниями', stats.badInstances]);
        wsS.addRow(['Заполнено полей, %', stats.percent]);
        wsS.addRow([]);
        wsS.addRow(['Узел', 'Секция', 'Место/деталь', 'Замечание']);
        if(summaryIssues.length===0){
            wsS.addRow(['Несоответствий не выявлено']);
        }else{
            for(const issue of summaryIssues){
                wsS.addRow([issue.node, issue.section, issue.place, issue.comment]);
            }
        }
        wsS.getColumn(1).width=30;
        wsS.getColumn(2).width=14;
        wsS.getColumn(3).width=30;
        wsS.getColumn(4).width=40;

        if(opsOverflowCount>0){
            showToast('⚠️ У '+opsOverflowCount+' позици(й) больше '+MAX_OPS_COLUMNS+' проверок — часть данных не попала в файл (см. консоль)');
        }

        const wsH=wb.addWorksheet('История изменений');
        wsH.addRow(['Дата и время','Пользователь','Позиция','Поле','Значение']);
        const log=Array.isArray(STATE.changeLog)?STATE.changeLog:[];
        if(log.length===0){
            wsH.addRow(['Журнал изменений пуст']);
        }else{
            for(const entry of log){
                const dt=new Date(entry.t);
                const dtStr=isNaN(dt.getTime())?'':dt.toLocaleString('ru-RU');
                wsH.addRow([dtStr, entry.user||'', entry.iid||'', entry.key||'', entry.val!==undefined?String(entry.val):'']);
            }
        }
        wsH.getColumn(1).width=20;
        wsH.getColumn(2).width=12;
        wsH.getColumn(3).width=25;
        wsH.getColumn(4).width=20;
        wsH.getColumn(5).width=35;

        const buf=await wb.xlsx.writeBuffer();
        const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        const date=STATE.general.date||'без_даты';
        const tv=STATE.general.type||'без_серии';
        const nv=STATE.general.number||'без_номера';
        const bn=date+'_'+tv+'_'+nv+'_Чек-лист_'+__modeLabel();
        const sb=bn.replace(/[\\/\\\\:*?"<>|]/g,'_');
        a.download=sb+'.xlsx';
        let __tmhExcelCloudSaved = false;
        try {
          const __saveCloud = window.parent && window.parent.__TMH_SAVE_CLOUD_BACKUP_CONTEXT;
          const __getContext = window.__TMH_GET_CLOUD_BACKUP_CONTEXT;
          if (typeof __saveCloud !== 'function' || typeof __getContext !== 'function') throw new Error('Облачное сохранение чек-листа не подключено');
          await __psEnsureCloudReady();
          const __cloudResult = await __saveCloud(__getContext());
          __tmhExcelCloudSaved = true;
          console.info('Checklist cloud backup completed during Excel export', { id: __cloudResult.row.id, revision: __cloudResult.row.revision });
        } catch (__cloudError) {
          console.error('Excel export cloud backup failed', __cloudError);
        }
        a.href=url;
        a.click();
        URL.revokeObjectURL(url);
        showToast(__tmhExcelCloudSaved ? '☁️ Резервная копия чек-листа и фото сохранена в облако; Excel скачан' : '⚠️ Excel скачан, но облачная копия чек-листа не обновлена. Проверьте вход и подключение.');
    }catch(e){
        console.error(e);
        showToast('⚠️ Ошибка при экспорте: '+e.message);
    }
}
// ========================================================================
// ЭКСПОРТ JSON С ВОПРОСОМ О ФОТО
// ========================================================================
function hasAnyPhotos(){for(const iid in STATE.values){if(STATE.values[iid]){for(const k in STATE.values[iid]){if(k.endsWith('_photo')&&STATE.values[iid][k])return true;}}}return false;}
function exportJson(){
saveState(true);
const data=JSON.parse(JSON.stringify(STATE));
let includePhotos=false;
if(hasAnyPhotos()){
includePhotos=confirm('📷 Обнаружены фотографии.\\n\\nВключить их в JSON-файл?\\n\\n• ОК — с фото (большой файл, только для личного архива)\\n• Отмена — без фото (компактный файл, подходит для передачи разработчику)');
if(!includePhotos){
for(const iid in data.values){if(data.values[iid]){for(const k in data.values[iid]){if(k.endsWith('_photo'))delete data.values[iid][k];}}}
}
}else{includePhotos=false;}
data._meta={version:2,mode:MODE,exportedAt:new Date().toISOString(),withPhotos:includePhotos};
const json=JSON.stringify(data);
const blob=new Blob([json],{type:'application/json'});
const url=URL.createObjectURL(blob);
const a=document.createElement('a');
const tv=STATE.general.type||'без_серии';
const nv=STATE.general.number||'';
const modeName=__modeLabel();
const baseName=tv+(nv?'_'+nv:'')+'_'+modeName+(includePhotos?'_с_фото':'_без_фото');
const sb=baseName.replace(/[\\/\\\\:*?"<>|]/g,'_');
a.download=sb+'.json';
a.href=url;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
showToast('✅ JSON экспортирован'+(includePhotos?' (с фото)':' (компактный)'));
}

function importJson(){document.getElementById('jsonFileInput').click();}
function handleJsonFile(file){const reader=new FileReader();reader.onload=function(e){try{const json=JSON.parse(e.target.result);if(typeof json!=='object'||!json.general||typeof json.values!=='object')throw new Error('Неверный формат JSON');if(json._meta&&json._meta.mode&&json._meta.mode!==MODE){if(!confirm(\`Файл создан для режима "\${json._meta.mode==='housings'?'Кожуха':'Комплексный'}". Загрузить как есть?\`))return;}STATE=json;delete STATE._meta;if(!Array.isArray(STATE.selectedSections))STATE.selectedSections=[];if(!Array.isArray(STATE.selected))STATE.selected=[];saveState(true);const type=STATE.general.type||'';buildEquipment(type);renderGeneral();renderEquip();updateStats();showToast('✅ JSON загружен, данные восстановлены');}catch(err){showToast('⚠️ Ошибка загрузки JSON: '+err.message);console.error(err);}};reader.onerror=function(){showToast('⚠️ Ошибка чтения файла');};reader.readAsText(file);}

function saveAsHtmlFile(){loadState();const type=STATE.general.type||'';const number=STATE.general.number||'';const mileage=STATE.general.mileage||'';if(!isValidMileage(mileage,type,number)){const err=getMileageError(mileage,type,number);showToast('⚠️ Некорректный пробег: '+(err||''));return;}saveState(true);
const htmlContent='<!DOCTYPE html>\\n'+document.documentElement.outerHTML;
const stateJson=JSON.stringify(STATE).replace(/<\\//g,'<\\\\/');
const modeJson=JSON.stringify(MODE||'complex').replace(/<\\//g,'<\\\\/');
const embeddedScript=\`<script id="__embedded_mode">\\nwindow.__EMBEDDED_MODE = \${modeJson};\\n<\\/script>\\n<script id="__embedded_state">\\nwindow.__EMBEDDED_STATE = \${stateJson};\\n<\\/script>\\n\`;
let newHtml=htmlContent;
newHtml=newHtml.replace(/<script[^>]*>\\s*(?:const\\s+|var\\s+|window\\.)__EMBEDDED_(?:MODE|STATE)[\\s\\S]*?<\\/script>\\s*/g,'');
const headClose='</head>';const hi=newHtml.indexOf(headClose);
if(hi!==-1)newHtml=newHtml.slice(0,hi)+embeddedScript+newHtml.slice(hi);
else{const bc='</body>';const bi=newHtml.indexOf(bc);if(bi!==-1)newHtml=newHtml.slice(0,bi)+embeddedScript+newHtml.slice(bi);}
const blob=new Blob([newHtml],{type:'text/html; charset=utf-8'});
const url=URL.createObjectURL(blob);const a=document.createElement('a');
const tv=STATE.general.type||'без_серии';const nv=STATE.general.number||'';
const modeName=__modeLabel();
const baseName=tv+(nv?'_'+nv:'')+'_'+modeName;const sb=baseName.replace(/[\\/\\\\:*?"<>|]/g,'_');
a.download='чек-лист_'+sb+'.html';a.href=url;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);showToast('✅ Файл сохранён');}

// ========================================================================
// ВЫБОР РЕЖИМА / ПЕРЕКЛЮЧЕНИЕ
// ========================================================================
function updateModeTitle(){const h1=document.getElementById('modeTitle');const sub=document.getElementById('modeSubtitle');if(!h1||!sub)return;if(MODE==='housings'){h1.textContent='Чек-лист проверки КМБ при выполнении ТО-2, ТР-50, ТР-250, ТР-500';sub.textContent='Проверка кожухов (с фотофиксацией и уведомлениями)';document.title='Чек-лист — Кожуха';}else{h1.textContent='Чек-лист проверки при выполнении ТР-50, ТР-250, ТР-500';sub.textContent='Осмотр производится по локомотивам с пробегом до ТР-500';document.title='Чек-лист — Комплексный';}}

/* ========================================================================
   ВСТРАИВАЕМЫЕ ЧЕК-ЛИСТЫ (ТТ / БИ / Гидродемпфер) — изолированные iframe
   ======================================================================== */
function b64ToUtf8(b64){const binary=atob(b64);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return new TextDecoder('utf-8').decode(bytes);}
/* Cloud backup bridge is injected by the parent shell. */
function getEmbeddedSource(mode){
if(typeof EMBED_TT_HTML==='undefined')return '';if(mode==='tt')return EMBED_TT_HTML;if(mode==='bi')return EMBED_BI_HTML;if(mode==='hydro')return EMBED_HYDRO_HTML;return'';}
function showEmbeddedApp(mode){const nativeApp=document.getElementById('nativeApp');const host=document.getElementById('iframeHost');const frame=document.getElementById('embeddedFrame');const label=document.getElementById('iframeModeLabel');if(!host||!frame)return;if(nativeApp)nativeApp.style.display='none';document.title='Чек-лист — '+MODE_NAMES[mode];if(label)label.textContent=MODE_NAMES[mode];frame.srcdoc=window.__tmhAttachCloudBackup(getEmbeddedSource(mode),mode);host.style.display='flex';}
function hideEmbeddedApp(){const nativeApp=document.getElementById('nativeApp');const host=document.getElementById('iframeHost');const frame=document.getElementById('embeddedFrame');if(host)host.style.display='none';if(frame)frame.srcdoc='about:blank';if(nativeApp)nativeApp.style.display='';}

function __tmhStorageIdForMode(mode){
    const ids={complex:LS_KEY_COMPLEX,housings:LS_KEY_HOUSINGS,tt:'checklist_tt_v1',bi:'checklist_msud_v1',hydro:'checklist_hydro_v1'};
    return ids[mode]||LS_KEY;
}
async function selectModeAndStart(mode){
    // Если MODE уже был установлен и он совпадает — это не первый запуск
    if(MODE && mode===MODE){
        showToast('Этот чек-лист уже открыт');
        closeModeModal();
        return;
    }
    // Если MODE был установлен и отличается — переключение
    if(MODE && mode!==MODE){
        switchMode(mode);
        return;
    }
    // Иначе — первый выбор режима
    MODE=mode;
    try{localStorage.setItem(MODE_KEY,mode);}catch(e){}
    closeModeModal();
    if(EMBEDDED_MODES.indexOf(mode)!==-1){
        const hasAuth = await checkAuth();
        if(!hasAuth){__tmhShowLoginModal();updateModePicker();return;}
        const requestedLocalId = new URLSearchParams(window.location.search).get('openLocalChecklist');
        const api = __getTMHAuthApi();
        if(requestedLocalId && api && typeof api.activateOfflineChecklistInstance === 'function'){
            try{await api.activateOfflineChecklistInstance(__tmhStorageIdForMode(mode),requestedLocalId);}
            catch(error){showToast(error.message||'Не удалось открыть локальный чек-лист');}
        }
        showEmbeddedApp(mode);
        updateModePicker();
        return;
    }
    LS_KEY=(mode==='housings')?LS_KEY_HOUSINGS:LS_KEY_COMPLEX;
    updateModeTitle();
    updateModePicker();
    const hasAuth = await checkAuth();
    if(!hasAuth)__tmhShowLoginModal();
    else {
        const requestedLocalId = new URLSearchParams(window.location.search).get('openLocalChecklist');
        const api = __getTMHAuthApi();
        if(requestedLocalId && api && typeof api.activateOfflineChecklistInstance === 'function'){
            try{await api.activateOfflineChecklistInstance(__tmhStorageIdForMode(mode),requestedLocalId);}
            catch(error){showToast(error.message||'Не удалось открыть локальный чек-лист');}
        }
        showContinueDialogOrStart();
    }
}
function openModeModal(isSwitch){
    const modal=document.getElementById('modeSelectModal');
    const title=document.getElementById('modeModalTitle');
    const subtitle=document.getElementById('modeModalSubtitle');
    const cancel=document.getElementById('modeModalCancel');
    if(!modal)return;
    if(isSwitch){
        title.textContent='🔄 Сменить чек-лист';
        subtitle.textContent='Выберите другой чек-лист. Данные каждого режима хранятся отдельно — переключение ничего не потеряет.';
        cancel.style.display='inline-block';
    }else{
        title.textContent='📋 Выберите чек-лист';
        subtitle.textContent='Какой чек-лист вы хотите заполнить? Данные каждого режима сохраняются отдельно.';
        cancel.style.display='none';
    }
    // Подсветка активного пункта
    document.getElementById('modeComplexBtn').classList.toggle('active',MODE==='complex');
    document.getElementById('modeHousingsBtn').classList.toggle('active',MODE==='housings');
    const ttB=document.getElementById('modeTtBtn');if(ttB)ttB.classList.toggle('active',MODE==='tt');
    const biB=document.getElementById('modeBiBtn');if(biB)biB.classList.toggle('active',MODE==='bi');
    const hyB=document.getElementById('modeHydroBtn');if(hyB)hyB.classList.toggle('active',MODE==='hydro');
    modal.style.display='flex';
}

function closeModeModal(){
    const modal=document.getElementById('modeSelectModal');
    if(modal)modal.style.display='none';
}

function switchMode(newMode){
    if(newMode===MODE){
        showToast('Этот чек-лист уже открыт');
        closeModeModal();
        return;
    }
    const name = MODE_NAMES[newMode]||newMode;
    if(!confirm('Сменить чек-лист на "'+name+'"?\\n\\nДанные текущего режима сохранены. Страница перезагрузится.'))return;
    if(MODE==='complex'||MODE==='housings')saveState(true);
    try{localStorage.setItem(MODE_KEY,newMode);}catch(e){}
    location.reload();
}

function updateModePicker(){
    const btn=document.getElementById('modePickerBtn');
    const label=document.getElementById('modePickerLabel');
    if(!btn||!label)return;
    if(!MODE){btn.style.display='none';return;}
    btn.style.display='';
    label.textContent = MODE_NAMES[MODE]||MODE;
}
// ========================================================================
// ДИАЛОГ "ПРОДОЛЖИТЬ / НОВЫЙ"
// ========================================================================
let dialogShown=false;
async function showContinueDialogOrStart(){
    if(!window.__TMH_STORAGE_UID){__tmhShowLoginModal();return;}
    if(dialogShown)return;
    let hasSaved = localStorage.getItem(LS_KEY) !== null;
            const api = typeof __getTMHAuthApi === 'function' ? __getTMHAuthApi() : null;
            if (api && api.isOfflineVaultUnlocked?.() && typeof api.hasOfflineChecklist === 'function') {
                hasSaved = hasSaved || await api.hasOfflineChecklist(LS_KEY);
            }
    if(typeof __EMBEDDED_STATE!=='undefined'&&__EMBEDDED_STATE){
        startApp(false);
        return;
    }
    if(hasSaved){
        document.getElementById('continueDialog').style.display='flex';
        dialogShown=true;
    }else{
        startApp(true);
    }
}
async function __tmhRestoreActiveOfflineState() {
  const api = typeof __getTMHAuthApi === 'function' ? __getTMHAuthApi() : null;
  if (!api || typeof api.hasOfflineChecklist !== 'function' || !api.isOfflineVaultUnlocked?.()) return false;
  if (!await api.hasOfflineChecklist(LS_KEY)) return false;
  const snapshot = await api.loadOfflineChecklist(LS_KEY);
  if (!snapshot || typeof snapshot !== 'object' || !snapshot.general || !snapshot.values) {
    throw new Error('Зашифрованная локальная копия чек-листа повреждена');
  }
  STATE = snapshot;
  return true;
}
async function startApp(useNew){
    if(useNew)fullClearState();
    else{const restored=await __tmhRestoreActiveOfflineState();if(!restored){if(!STATE.general.type&&!localStorage.getItem(LS_KEY))fullClearState();else loadState();}}
    const type=STATE.general.type||'';
    buildEquipment(type);
    renderGeneral();
    renderEquip();
    updateStats();
    document.getElementById('continueDialog').style.display='none';
    dialogShown=true;

    if(!window._autosaveStarted){
        window._autosaveStarted = true;
        window.addEventListener('beforeunload',function(){saveState(true);});
        setInterval(()=>saveState(true),20000);
    }
}
// ========================================================================
// ТЕМЫ
// ========================================================================
const THEME_KEY='checklist_theme_v1';const THEME_VALUES=['tmh','standard','dark'];
function applyTheme(theme){const t=THEME_VALUES.includes(theme)?theme:'tmh';document.documentElement.setAttribute('data-theme',t);document.querySelectorAll('#themeSwitch button').forEach(b=>{b.classList.toggle('active',b.dataset.themeValue===t);});try{localStorage.setItem(THEME_KEY,t);}catch(e){}}
function initThemeSwitch(){document.querySelectorAll('#themeSwitch button').forEach(b=>{b.addEventListener('click',()=>applyTheme(b.dataset.themeValue));});let saved='tmh';try{saved=localStorage.getItem(THEME_KEY)||'tmh';}catch(e){}applyTheme(saved);}
/* Если тема сменена внутри встроенного (iframe) чек-листа — синхронизируем шапку в родителе */
window.addEventListener('storage',function(e){if(e.key===THEME_KEY&&THEME_VALUES.includes(e.newValue)){document.documentElement.setAttribute('data-theme',e.newValue);document.querySelectorAll('#themeSwitch button').forEach(b=>{b.classList.toggle('active',b.dataset.themeValue===e.newValue);});}});

function setupCommonHandlers(){
    document.getElementById('loginBtn').onclick = async function() {
        const l=document.getElementById('loginInput').value.trim();
        const p=document.getElementById('passwordInput').value;
        const err=document.getElementById('loginError');
        if(!l||!p){err.textContent='Заполните все поля';err.classList.add('show');return;}
        if (await doLogin(l,p)){err.classList.remove('show');if(MODE&&EMBEDDED_MODES.indexOf(MODE)!==-1)showEmbeddedApp(MODE);else showContinueDialogOrStart();}
        else{err.textContent='Неверный логин или пароль';err.classList.add('show');}
    };
    document.getElementById('loginInput').onkeypress=function(e){if(e.key==='Enter')document.getElementById('loginBtn').click();};
    document.getElementById('passwordInput').onkeypress=function(e){if(e.key==='Enter')document.getElementById('loginBtn').click();};
    document.getElementById('logoutBtn').onclick=doLogout;
    document.getElementById('continueBtn').onclick=function(){loadState();startApp(false);};
    document.getElementById('newBtn').onclick = async function() {
    const api = __getTMHAuthApi();
    if (api && typeof api.beginNewOfflineChecklistInstance === 'function' && window.__TMH_STORAGE_UID) {
      try { await api.beginNewOfflineChecklistInstance(LS_KEY); }
      catch (error) { showToast('Не удалось создать новый чек-лист: ' + (error.message || error)); return; }
    }
    fullClearState();
    startApp(true);
  };
    document.getElementById('btnSave').onclick=()=>saveState();
    document.getElementById('btnSaveHtml').onclick=saveAsHtmlFile;
    document.getElementById('btnExport').onclick=exportWithPhotos;
    document.getElementById('btnReset').onclick=()=>{if(confirm('Очистить все данные чек-листа? Это действие необратимо.')){fullClearState();renderGeneral();renderEquip();showToast('Все данные очищены');}};
    document.getElementById('btnExportJson').onclick=exportJson;
    document.getElementById('btnImportJson').onclick=importJson;
    document.getElementById('jsonFileInput').onchange=function(e){const f=this.files[0];if(f){handleJsonFile(f);this.value='';}};
    document.getElementById('btnFindUnfilled').onclick=findAndScrollToUnfilled;
    const sb=document.getElementById('scrollTopBtn');
    window.addEventListener('scroll',function(){if(window.scrollY>300)sb.classList.add('visible');else sb.classList.remove('visible');});
    sb.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
    initThemeSwitch();
        initThemeSwitch();
    document.getElementById('toggleNavBtn').addEventListener('click',function(){document.getElementById('noticeList').classList.toggle('show');});
}

/* ===== Защита от переполнения localStorage: при нехватке места фото уходят в IndexedDB ===== */
var __PS={db:null,restored:false,restoreFailed:false,synced:{},chain:Promise.resolve(true),warnAt:0,ready:null};
function __psFlagKey(){return LS_KEY+'__photos_idb';}
function __psFlagOn(){try{return localStorage.getItem(__psFlagKey())==='1';}catch(e){return false;}}
function __psOpen(){
  if(__PS.db)return __PS.db;
  __PS.db=new Promise(function(res,rej){
    if(!window.indexedDB){rej(new Error('IndexedDB недоступен'));return;}
    var r=indexedDB.open('checklist_photos_db',1);
    r.onupgradeneeded=function(e){var d=e.target.result;if(!d.objectStoreNames.contains('photos'))d.createObjectStore('photos');};
    r.onsuccess=function(e){res(e.target.result);};
    r.onerror=function(e){rej(e.target.error);};
  });
  return __PS.db;
}
function __psCollect(){
  var out={};
  if(!STATE||!STATE.values)return out;
  for(var iid in STATE.values){var o=STATE.values[iid];if(!o)continue;
    for(var k in o){if(k.slice(-6)==='_photo'&&o[k])out[LS_KEY+'::'+iid+'::'+k]=o[k];}}
  return out;
}
function __psLight(){
  var lv={};
  for(var iid in STATE.values){var o=STATE.values[iid];if(!o){lv[iid]=o;continue;}
    var c={};for(var k in o){if(k.slice(-6)!=='_photo')c[k]=o[k];}lv[iid]=c;}
  return Object.assign({},STATE,{values:lv});
}
function __psWarn(msg){
  try{
    var now=Date.now();if(now-__PS.warnAt<15000)return;__PS.warnAt=now;
    var old=document.getElementById('__psBanner');if(old)old.remove();
    var d=document.createElement('div');d.id='__psBanner';
    d.setAttribute('style','position:fixed;left:8px;right:8px;top:8px;z-index:99999;background:#b3261e;color:#fff;padding:12px 14px;border-radius:10px;font:600 14px/1.35 sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.35)');
    d.textContent='⚠️ '+msg+' ';
    var b=document.createElement('button');b.textContent='Закрыть';
    b.setAttribute('style','margin-left:8px;border:0;border-radius:6px;padding:4px 10px;font-weight:700');
    b.onclick=function(){d.remove();};d.appendChild(b);document.body.appendChild(d);
  }catch(e){console.warn(msg);}
}
function __psSync(){
  var cur=__psCollect();
  return __psOpen().then(function(db){return new Promise(function(res,rej){
    var tx=db.transaction('photos','readwrite'),st=tx.objectStore('photos'),k;
    for(k in cur){if(__PS.synced[k]!==cur[k])st.put(cur[k],k);}
    if(__PS.restored){for(k in __PS.synced){if(!(k in cur))st.delete(k);}}
    tx.oncomplete=function(){
      for(var k2 in cur)__PS.synced[k2]=cur[k2];
      if(__PS.restored){for(var k3 in __PS.synced){if(!(k3 in cur))delete __PS.synced[k3];}}
      res(true);};
    tx.onerror=function(){rej(tx.error);};tx.onabort=function(){rej(tx.error);};
  });}).catch(function(e){console.warn('IndexedDB: сохранение фото не удалось',e);return false;});
}
function __psRestore(){
  if(!__psFlagOn()){__PS.restored=true;return Promise.resolve(false);}
  var prefix=LS_KEY+'::';
  __PS.ready=__psOpen().then(function(db){return new Promise(function(res,rej){
    var found={},tx=db.transaction('photos','readonly'),req=tx.objectStore('photos').openCursor(IDBKeyRange.bound(prefix,prefix+String.fromCharCode(65535)));
    req.onsuccess=function(e){var c=e.target.result;if(c){found[c.key]=c.value;c.continue();}else res(found);};
    req.onerror=function(){rej(req.error);};
  });}).then(function(found){
    var any=false;
    for(var key in found){
      var rest=key.slice(prefix.length),sep=rest.indexOf('::');if(sep<0)continue;
      var iid=rest.slice(0,sep),pk=rest.slice(sep+2);
      if(!STATE.values[iid])STATE.values[iid]={};
      if(!STATE.values[iid][pk]){STATE.values[iid][pk]=found[key];any=true;}
      __PS.synced[key]=found[key];
    }
    __PS.restored=true;__PS.restoreFailed=false;
    if(any){try{if(typeof renderEquip==='function')renderEquip();if(typeof updateStats==='function')updateStats();if(typeof updateFindBadge==='function')updateFindBadge();}catch(e){console.warn(e);}}
    return true;
  }).catch(function(e){__PS.restored=true;__PS.restoreFailed=true;console.warn('IndexedDB: чтение фото не удалось',e);__psWarn('Не удалось прочитать фото из памяти браузера. Загрузите сохранённый JSON-файл с фото.');return false;});
  return __PS.ready;
}
function __psReady(){return __PS.ready||Promise.resolve(false);}
async function __psEnsureCloudReady(){
  if(__psFlagOn()){
    if(!__PS.ready)await __psRestore();else await __psReady();
    if(__PS.restoreFailed)throw new Error('Не удалось прочитать фотографии из IndexedDB. Облачная операция отменена; локальные фотографии не изменены.');
  }
  if(__PS.chain){var ok=await __PS.chain;if(ok===false)throw new Error('Не удалось завершить очередь фотографий IndexedDB. Облачная операция отменена.');}
}
function __psClear(){
  try{localStorage.removeItem(__psFlagKey());}catch(e){}
  __PS.synced={};__PS.restored=true;
  __psOpen().then(function(db){var tx=db.transaction('photos','readwrite'),prefix=LS_KEY+'::';
    var req=tx.objectStore('photos').openCursor(IDBKeyRange.bound(prefix,prefix+String.fromCharCode(65535)));
    req.onsuccess=function(e){var c=e.target.result;if(c){c.delete();c.continue();}};}).catch(function(){});
}
function __psOverflow(silent){
  __PS.chain=__PS.chain.then(function(){return __psSync();}).then(function(ok){
    if(!ok)throw new Error('idb');
    try{localStorage.setItem(__psFlagKey(),'1');}catch(e){localStorage.removeItem(LS_KEY);localStorage.setItem(__psFlagKey(),'1');}
    localStorage.setItem(LS_KEY,JSON.stringify(__psLight()));
    if(!silent)showToast('Сохранено в браузере (фото — в расширенном хранилище)');
    return true;
  }).catch(function(e){
    console.warn('Save failed',e);
    __psWarn('Данные НЕ сохранены: память браузера переполнена. Сделайте «Экспорт JSON» (с фото) и не закрывайте вкладку.');
    return false;
  });
  return __PS.chain;
}
function saveState(silent){
  if(!window.__TMH_STORAGE_UID||window.__TMH_STORAGE_LOCKED)return false;
  if(!STATE||!STATE.general)return false;
  if(__psFlagOn()){
    try{localStorage.setItem(LS_KEY,JSON.stringify(__psLight()));}
    catch(e){__psWarn('Данные НЕ сохранены: память браузера переполнена. Сделайте «Экспорт JSON» (с фото).');return false;}
    __PS.chain=__PS.chain.then(function(){return __psSync();}).then(function(ok){
      if(!ok)__psWarn('Фото не удалось сохранить в браузере. Сделайте «Экспорт JSON» (с фото).');return ok;});
    if(!silent)showToast('Сохранено в браузере');
    return true;
  }
  try{localStorage.setItem(LS_KEY,JSON.stringify(STATE));}
  catch(e){__psOverflow(silent);return false;}
  if(!silent)showToast('Сохранено в браузере');
  return true;
}

var __tmhOriginalSaveState = saveState;
var __tmhOfflineSaveChain = Promise.resolve(true);
var __tmhOfflinePendingWrites = 0;
var __tmhOfflineSaveError = null;
window.addEventListener('beforeunload', function(event) {
  if (__tmhOfflinePendingWrites > 0) {
    event.preventDefault();
    event.returnValue = '';
    return '';
  }
});
saveState = function(silent) {
  if (!window.__TMH_STORAGE_UID || window.__TMH_STORAGE_LOCKED || !STATE || !STATE.general) return false;
  var api = __getTMHAuthApi();
  if (window.__TMH_OFFLINE_MODE) {
    // Without an unlocked legacy vault, preserve normal localStorage saving.
    // Never fail a user's checklist edit merely because cloud/offline crypto is locked.
    if (!api || typeof api.isOfflineVaultUnlocked !== 'function' || !api.isOfflineVaultUnlocked()) {
      return __tmhOriginalSaveState.apply(this, arguments);
    }
    if (typeof api.saveOfflineChecklist !== 'function') return __tmhOriginalSaveState.apply(this, arguments);
    var snapshot = structuredClone(STATE);
    __tmhOfflinePendingWrites++;
    __tmhOfflineSaveChain = __tmhOfflineSaveChain.then(function() {
      __tmhOfflineSaveError = null;
      return api.saveOfflineChecklist(LS_KEY, snapshot);
    }).then(function() {
      if (!silent && typeof showToast === 'function') showToast('Сохранено в зашифрованном офлайн-хранилище');
      return true;
    }).catch(function(error) {
      __tmhOfflineSaveError = error;
      console.error('Encrypted offline save failed', error);
      if (typeof __psWarn === 'function') __psWarn('Не удалось сохранить зашифрованную офлайн-копию. Не закрывайте приложение до устранения ошибки.');
      return false;
    }).finally(function() {
      __tmhOfflinePendingWrites = Math.max(0, __tmhOfflinePendingWrites - 1);
    });
    return true;
  }
  var result = __tmhOriginalSaveState.apply(this, arguments);
  if (result !== false && api && typeof api.saveOfflineChecklist === 'function' &&
      typeof api.isOfflineVaultUnlocked === 'function' && api.isOfflineVaultUnlocked()) {
    var snapshot = structuredClone(STATE);
    __tmhOfflinePendingWrites++;
    __tmhOfflineSaveChain = __tmhOfflineSaveChain.then(function() {
      __tmhOfflineSaveError = null;
      return api.saveOfflineChecklist(LS_KEY, snapshot);
    }).catch(function(error) {
      __tmhOfflineSaveError = error;
      console.error('Encrypted offline save failed', error);
      if (typeof __psWarn === 'function') __psWarn('Не удалось сохранить зашифрованную офлайн-копию. Не закрывайте приложение до устранения ошибки.');
      return false;
    }).finally(function() {
      __tmhOfflinePendingWrites = Math.max(0, __tmhOfflinePendingWrites - 1);
    });
  }
  return result;
};


async function init(){
    initPhotoModal();
    updateModeTitle();
    const hasAuth = await checkAuth();
    if(!hasAuth){
      if(__tmhIsEmbeddedRuntime()){
        var pendingModal=document.getElementById('loginModal');
        if(pendingModal)pendingModal.style.display='none';
        var pending=document.getElementById('tmhParentAuthPending');
        if(!pending){
          pending=document.createElement('div');
          pending.id='tmhParentAuthPending';
          pending.textContent='Ожидаем подтверждение авторизации основной страницы. Повторный вход здесь отключён.';
          pending.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:var(--bg,#fff);color:var(--ink,#222);font:16px/1.5 system-ui;z-index:99999;';
          document.body.appendChild(pending);
        }
        // The parent may finish its session check after this iframe's first
        // bounded wait. Resume from its verified event without a second login.
        if (!window.__TMH_PARENT_AUTH_RESUME_INSTALLED) {
          window.__TMH_PARENT_AUTH_RESUME_INSTALLED = true;
          var resumeFromParent = async function() {
            if (await checkAuth()) {
              var waiting = document.getElementById('tmhParentAuthPending');
              if (waiting) waiting.remove();
              showContinueDialogOrStart();
            }
          };
          try {
            window.parent.addEventListener('tmh:auth-ready', resumeFromParent, { once: true });
            resumeFromParent();
          } catch (e) {}
        }
        return;
      }
      __tmhShowLoginModal();
    } else showContinueDialogOrStart();
    setupCommonHandlers();
}





















/* ROUTE_VIEW_V18 */
(function setupRouteView(){
  window.ROUTE_ZONES        = ["roof","cab","vvk","underbody_1","corridor","underbody_2","measurement","bogies","msud_final"];
  window.ROUTE_ZONE_LABELS  = {"roof":"⛰️ Крыша","cab":"🚪 Кабина","vvk":"⚡ Высоковольтная камера (ВВК)","underbody_1":"🔧 Подкузов — сторона ТТ","corridor":"🚶 Служебный коридор","underbody_2":"🔧 Подкузов — сторона 8 блока","measurement":"📐 Измерения","bogies":"🛞 Тележки, ТЭД и Кожуха","msud_final":"📋 МСУД-015 (в конце)"};
  window.ROUTE_ZONE_MAP     = {"las023":"roof","nvmontazh":"cab","vb8":"vvk","mk9":"vvk","bvv":"vvk","re16t":"vvk","rassekatel":"underbody_1","shina":"underbody_1","gres":"underbody_2","kps":"measurement","nb514":"bogies","housings":"bogies","msud":"msud_final"};
  window.ROUTE_INSTANCE_ZONE= {"shina":{"U1":"underbody_1","U2":"underbody_2"},"rassekatel":{"U1":"underbody_1","U2":"underbody_2"}};
  window.ROUTE_FIELD_ZONE   = {"nvmontazh":{"f1":"cab","f2":"cab","f3":"corridor"}};
  window.ROUTE_ORDER        = ["vb8","bvv","mk9","re16t","nvmontazh","rassekatel","shina","gres","kps","nb514","housings","msud","las023"];
  window.FIELD_ORDER        = {"las023":["zav","f1","f3","f2"],"nvmontazh":["f1","f2","f3"],"vb8":["zav","f0","f3","f1","f2","f4","f5","f6","f7"],"shina":["f3","f1","f2"],"rassekatel":["presence","install"],"mk9":["zav","f1","f2","f3","f4"],"bvv":["f1","f2"],"re16t":["f1","f2","f3","f4"],"gres":["f2","f3","f4","f5","f6","f1","f7","f8"],"nb514":["zav","f1","f2","f4","f5","f6","f7"],"msud":["zav","f1","f2","f3","f4","f5","f6","f7"],"housings":["manufacturer","oil","leak","formation","zav"]};
  window.ROUTE_PRIORITY     = [{"eqId":"las023","label":null,"field":null,"prio":1},{"eqId":"nvmontazh","label":null,"field":"f1","prio":2},{"eqId":"nvmontazh","label":null,"field":"f2","prio":3},{"eqId":"vb8","label":"Сх. БСА 1 · Сх. QF 11","field":null,"prio":4},{"eqId":"vb8","label":"Сх. БСА 1 · Сх. QF 12","field":null,"prio":5},{"eqId":"bvv","label":"КМ24 (1ВВК)","field":null,"prio":6},{"eqId":"bvv","label":"КМ25 (1ВВК)","field":null,"prio":7},{"eqId":"rassekatel","label":"U1","field":null,"prio":8},{"eqId":"shina","label":"U1","field":null,"prio":9},{"eqId":"rassekatel","label":"U2","field":null,"prio":10},{"eqId":"shina","label":"U2","field":null,"prio":11},{"eqId":"vb8","label":"Сх. БСА 2 · Сх. QF 11","field":null,"prio":12},{"eqId":"vb8","label":"Сх. БСА 2 · Сх. QF 12","field":null,"prio":13}];
  window.ROUTE_VIEW_MODE    = false;

  /* === Обёртка updatePhotoRequirementForField === */
  (function(){
    if (window._photoWrapped) return;
    if (typeof updatePhotoRequirementForField !== "function") return;
    window._photoWrapped = true;
    var _origPhoto = updatePhotoRequirementForField;
    window.updatePhotoRequirementForField = function(iid, fieldKey, card){
      var c = card;
      if (!c) {
        c = document.querySelector('.inst[data-iid="' + CSS.escape(iid) + '"]');
        if (!c) c = document.querySelector('.route-step[data-iid="' + CSS.escape(iid) + '"]');
      }
      if (!c) return;
      try { return _origPhoto.call(this, iid, fieldKey, c); } catch(e){ console.warn("[photoWrap]", e); }
    };
    try { updatePhotoRequirementForField = window.updatePhotoRequirementForField; } catch(e){}
  })();

  /* === Обёртка fieldRow: ставим data-field-key на все controls === */
  (function(){
    if (window._fieldRowWrapped) return;
    if (typeof fieldRow !== "function") return;
    window._fieldRowWrapped = true;
    var _origFieldRow = fieldRow;
    window.fieldRow = function(eq, inst, iid, field) {
      var row = _origFieldRow.apply(this, arguments);
      try {
        var controls = row.querySelectorAll("select, input");
        for (var i=0; i<controls.length; i++) {
          if (!controls[i].dataset.fieldKey) controls[i].dataset.fieldKey = field.key;
        }
      } catch(e) {}
      return row;
    };
    try { fieldRow = window.fieldRow; } catch(e){}
  })();

  function patchInstances(eq){
    if (eq.id === "nb514" && !eq._nb514Patched) {
      eq.instances = function(){
        var out = [];
        var secList = (typeof sections !== "undefined" && sections.length) ? sections : [];
        secList.forEach(function(sec, sIdx){
          var baseM = sIdx * 4;
          for (var kp = 1; kp <= 4; kp++) out.push({ section: sec, block: "\\u041C" + (baseM + kp) });
        });
        return out;
      };
      eq._nb514Patched = true;
    }
    if (eq.id === "housings" && !eq._housingsPatched) {
      eq.instances = function(){
        var out = [];
        var secList = (typeof sections !== "undefined" && sections.length) ? sections : [];
        secList.forEach(function(sec, sIdx){
          var baseM = sIdx * 4;
          for (var kp = 1; kp <= 4; kp++){
            var mNum = baseM + kp;
            out.push({ section: sec, housingId: "kc"+kp, housingLabel: "\\u041C" + mNum + " \\u041A\\u043E\\u043B\\u043B\\u0435\\u043A\\u0442\\u043E\\u0440\\u043D\\u0430\\u044F \\u0441\\u0442\\u043E\\u0440\\u043E\\u043D\\u0430 \\u041A\\u041F" + mNum });
            out.push({ section: sec, housingId: "kp"+kp, housingLabel: "\\u041C" + mNum + " \\u041F\\u0440\\u043E\\u0442\\u0438\\u0432 \\u043A\\u043E\\u043B\\u043B\\u0435\\u043A\\u0442\\u043E\\u0440\\u043D\\u0430\\u044F \\u0441\\u0442\\u043E\\u0440\\u043E\\u043D\\u0430 \\u041A\\u041F" + mNum });
          }
        });
        return out;
      };
      eq._housingsPatched = true;
    }
  }

  window.applyRouteOrder = function(){
    if (!Array.isArray(EQUIPMENT)) return;
    EQUIPMENT.sort(function(a,b){
      var ia=window.ROUTE_ORDER.indexOf(a.id), ib=window.ROUTE_ORDER.indexOf(b.id);
      return (ia<0?999:ia)-(ib<0?999:ib);
    });
    EQUIPMENT.forEach(function(eq){
      patchInstances(eq);
      var fo=window.FIELD_ORDER[eq.id];
      if (fo && Array.isArray(eq.fields)) {
        eq.fields.sort(function(a,b){
          var ia=fo.indexOf(a.key), ib=fo.indexOf(b.key);
          return (ia<0?999:ia)-(ib<0?999:ib);
        });
      }
    });
  };

  function instLabelOf(inst){
    if (inst.housingLabel) return inst.housingLabel;
    if (inst.group && inst.block && inst.sub) return inst.group+" \\u00B7 "+inst.block+" \\u00B7 "+inst.sub;
    if (inst.group && inst.block) return inst.group+" \\u00B7 "+inst.block;
    if (inst.block && inst.sub) return inst.block+" \\u00B7 "+inst.sub;
    return inst.block || inst.group || inst.section || "";
  }

  function normalizeLabel(label) {
    if (!label) return "";
    return String(label).replace(/\\s*\\([^)]*\\)\\s*$/, "").trim();
  }

  function metkaNumber(label) {
    var clean = normalizeLabel(label);
    var m = clean.match(/^\\u041C(\\d+)(?:\\s|$)/);
    return m ? parseInt(m[1], 10) : 9999;
  }

  function priorityFor(eqId, label, fieldKey) {
    for (var i=0; i<window.ROUTE_PRIORITY.length; i++){
      var e = window.ROUTE_PRIORITY[i];
      if (e.eqId !== eqId) continue;
      if (e.label !== null && e.label !== label) continue;
      if (e.field !== null && e.field !== fieldKey) continue;
      return e.prio;
    }
    return 9999;
  }

  function getZoneForInstance(eqId, inst){
    var map=window.ROUTE_INSTANCE_ZONE[eqId];
    if (map) {
      var key=instLabelOf(inst);
      if (map[key]) return map[key];
      if (map["*"]) return map["*"];
    }
    return window.ROUTE_ZONE_MAP[eqId] || "other";
  }

  function getZoneForField(eqId, fieldKey, inst){
    var fo=window.ROUTE_FIELD_ZONE[eqId];
    if (fo && fo[fieldKey]) return fo[fieldKey];
    return getZoneForInstance(eqId, inst);
  }

  function setValQuiet(iid, key, val) {
    if (!STATE.values[iid]) STATE.values[iid] = {};
    STATE.values[iid][key] = val;
  }

  /* === Применение блокировок к одной строке === */
  function fixupRouteRow(row, eq, iid, field) {
    var control = row.querySelector(".frow select, .frow input");
    if (!control) return;
    var hide = false, disable = false, disableVal = "";

    var isMk84Now = (eq.id === "mk9" && typeof isMk84 === "function") ? isMk84(iid) : false;

    if (eq.id === "mk9" && field.key !== "zav" && isMk84Now) {
      disable = true; disableVal = "\\u043D\\u0435 \\u0442\\u0440\\u0435\\u0431\\u0443\\u0435\\u0442\\u0441\\u044F";
    }
    if ((eq.id === "mk9" || eq.id === "bvv") && field.key === "f2") {
      if (!isMk84Now && getVal(iid, "f1") === "\\u041D\\u0435\\u0442") {
        disable = true; disableVal = "\\u043E\\u0442\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u0443\\u0435\\u0442 \\u0428\\u0423";
      }
    }
    if (eq.id === "vb8" && (field.key === "f1" || field.key === "f2")) {
      if (getVal(iid, "f0") === "\\u0421\\u0442\\u0430\\u0440\\u044B\\u0439") {
        disable = true; disableVal = "\\u043D\\u0435 \\u0442\\u0440\\u0435\\u0431\\u0443\\u0435\\u0442\\u0441\\u044F";
      }
    }
    if (eq.id === "rassekatel" && field.key === "install") {
      if (getVal(iid, "presence") !== "\\u0414\\u0430") hide = true;
    }
    if (eq.id === "housings" && field.key === "formation") {
      if (getVal(iid, "leak") !== "\\u041D\\u0435\\u0442") hide = true;
    }
    if (eq.id === "housings" && field.key === "zav") {
      var l = getVal(iid, "leak"), f = getVal(iid, "formation");
      if (l !== "\\u041D\\u0435\\u0442" || f !== "\\u041D\\u042D\\u0412\\u0417") hide = true;
    }
    if (eq.id === "msud" && (field.key === "f3" || field.key === "f7")) {
      if (typeof isSF37NotRequired === "function" && isSF37NotRequired()) hide = true;
    }

    if (hide) { row.style.display = "none"; }
    else { row.style.display = ""; }

    if (disable) {
      if (control.tagName === "SELECT") {
        var found = false;
        for (var i=0; i<control.options.length; i++) {
          if (control.options[i].value === disableVal) { found = true; break; }
        }
        if (!found) {
          var o = document.createElement("option");
          o.value = disableVal; o.textContent = disableVal;
          control.appendChild(o);
        }
        control.value = disableVal;
      } else {
        control.value = disableVal;
      }
      control.disabled = true;
      if (getVal(iid, field.key) !== disableVal) setValQuiet(iid, field.key, disableVal);
    } else if (!hide) {
      if (control.tagName === "SELECT") control.disabled = false;
      else if (!isMk84Now) control.disabled = false;
      var cv = control.value;
      if (cv === "\\u043D\\u0435 \\u0442\\u0440\\u0435\\u0431\\u0443\\u0435\\u0442\\u0441\\u044F" || cv === "\\u043E\\u0442\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u0443\\u0435\\u0442 \\u0428\\u0423") {
        control.value = "";
        setValQuiet(iid, field.key, "");
      }
    }

    /* Обновить фото-индикацию */
    try {
      if (typeof window.updatePhotoRequirementForField === "function") {
        window.updatePhotoRequirementForField(iid, field.key);
      }
    } catch(e){}
  }

  function renumberRouteSteps(){
    var steps = document.querySelectorAll(".route-view .route-step");
    var n = 0;
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].style.display === "none") continue;
      n++;
      var num = steps[i].querySelector(".route-step-num");
      if (num) num.textContent = n;
    }
  }

  window.fixupRouteInstance = function(iid){
    var rows = document.querySelectorAll('.route-view .route-step[data-iid="' + CSS.escape(iid) + '"]');
    if (rows.length === 0) return;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var eqId = row.dataset.eqId;
      var fk = row.dataset.fieldKey;
      var eq = EQUIPMENT.find(function(e){ return e.id === eqId; });
      if (!eq) continue;
      var field = eq.fields.find(function(f){ return f.key === fk; });
      if (!field) continue;
      try { fixupRouteRow(row, eq, iid, field); } catch(e){ console.warn("[fixup]", e); }
    }
    renumberRouteSteps();
    saveState(true);
    updateStats();
  };

  window.renderRouteView = function(){
    var root=document.getElementById("equipRoot"); if(!root) return;
    root.innerHTML="";
    var type=STATE.general.type||"";
    if(!type){
      root.innerHTML='<div class="select-type-message"><span class="icon">\\u{1F686}</span><div class="title">Выберите тип электровоза</div></div>';
      return;
    }
    var selSec=STATE.selectedSections||[];
    var allSec=getSections(type).map(function(s){return s.label;});
    var sectionsToShow=selSec.length>0?selSec:allSec;
    var active=EQUIPMENT.filter(function(e){
      return STATE.selected.length===0 || STATE.selected.indexOf(e.id)!==-1;
    });

    var steps=[];
    active.forEach(function(eq){
      if (eq.customRender) {
        sectionsToShow.forEach(function(section){
          Object.keys(GROUPS).forEach(function(gid){
            steps.push({ zone:"measurement", section:section, eq:eq, isKps:true,
              gid:gid, iid:"kps|"+section+"|"+gid,
              label: GROUPS[gid].label, idx:0, prio: 9999, metkaNum: 9999, field:null });
          });
        });
        return;
      }
      var instances=eq.instances();
      instances.forEach(function(inst, idx){
        if (sectionsToShow.indexOf(inst.section)===-1) return;
        var iid=instId(eq.id, inst, idx);
        var label=instLabelOf(inst);
        eq.fields.forEach(function(field){
          var zone=getZoneForField(eq.id, field.key, inst);
          var prio=priorityFor(eq.id, label, field.key);
          steps.push({
            zone:zone, section:inst.section, eq:eq, inst:inst, iid:iid,
            label:label, field:field, idx:idx,
            prio: prio, metkaNum: metkaNumber(label)
          });
        });
      });
    });

    steps.sort(function(a,b){
      var sA=sectionsToShow.indexOf(a.section), sB=sectionsToShow.indexOf(b.section);
      if (sA!==sB) return sA-sB;
      var aHasP = a.prio < 9999, bHasP = b.prio < 9999;
      if (aHasP && bHasP && a.prio !== b.prio) return a.prio - b.prio;
      if (aHasP && !bHasP) return -1;
      if (!aHasP && bHasP) return 1;
      var zA=window.ROUTE_ZONES.indexOf(a.zone), zB=window.ROUTE_ZONES.indexOf(b.zone);
      if (zA!==zB) return (zA<0?999:zA)-(zB<0?999:zB);
      if (a.metkaNum !== b.metkaNum) return a.metkaNum - b.metkaNum;
      var eA=window.ROUTE_ORDER.indexOf(a.eq.id), eB=window.ROUTE_ORDER.indexOf(b.eq.id);
      if (eA!==eB) return (eA<0?999:eA)-(eB<0?999:eB);
      if (a.idx!==b.idx) return a.idx-b.idx;
      var fo=window.FIELD_ORDER[a.eq.id]||[];
      var fA=a.field?fo.indexOf(a.field.key):-1;
      var fB=b.field?fo.indexOf(b.field.key):-1;
      return (fA<0?999:fA)-(fB<0?999:fB);
    });

    var wrap=document.createElement("div"); wrap.className="route-view";
    var head=document.createElement("div"); head.className="route-view-header";
    head.innerHTML="<b>\\u{1F6E4}\\uFE0F Маршрут по операциям</b> \\u00B7 Всего шагов: <b>"+steps.length+"</b>";
    wrap.appendChild(head);

    var lastSec=null, lastZone=null, lastEqId=null, lastIid=null, num=0;
    steps.forEach(function(st){
      if (st.section!==lastSec){
        var sH=document.createElement("div"); sH.className="route-section-header";
        sH.textContent=st.section; wrap.appendChild(sH);
        lastSec=st.section; lastZone=null; lastEqId=null; lastIid=null;
      }
      if (st.zone!==lastZone){
        var zH=document.createElement("div"); zH.className="route-zone-header";
        zH.textContent=window.ROUTE_ZONE_LABELS[st.zone]||st.zone; wrap.appendChild(zH);
        lastZone=st.zone; lastEqId=null; lastIid=null;
      }
      if (st.eq.id!==lastEqId){
        var eH=document.createElement("div"); eH.className="route-eq-header";
        eH.textContent=st.eq.title; wrap.appendChild(eH);
        lastEqId=st.eq.id; lastIid=null;
      }
      if (st.iid!==lastIid && !st.isKps){
        var iH=document.createElement("div"); iH.className="route-inst-header";
        iH.textContent=st.label||st.section; wrap.appendChild(iH);
        lastIid=st.iid;
      }
      num++;
      var row=document.createElement("div"); row.className="route-step";
      row.dataset.iid = st.iid;
      row.dataset.eqId = st.eq.id;
      row.dataset.fieldKey = st.field ? st.field.key : "";
      var n=document.createElement("div"); n.className="route-step-num"; n.textContent=num;
      var body=document.createElement("div"); body.className="route-step-body";
      try {
        if (st.isKps) body.appendChild(buildKpsGroupCard(GROUPS[st.gid], st.section));
        else body.appendChild(fieldRow(st.eq, st.inst, st.iid, st.field));
      } catch(e){ body.textContent="Ошибка: "+e.message; }
      row.appendChild(n); row.appendChild(body); wrap.appendChild(row);
    });

    if (steps.length===0){
      var em=document.createElement("div");
      em.style.padding="20px"; em.style.textAlign="center"; em.style.color="var(--ink-dim)";
      em.textContent="Нет операций.";
      wrap.appendChild(em);
    }
    root.appendChild(wrap);

    /* Первичная инициализация видимости/блокировок */
    var allRows = document.querySelectorAll(".route-view .route-step");
    for (var i = 0; i < allRows.length; i++) {
      var row = allRows[i];
      var iid = row.dataset.iid, eqId = row.dataset.eqId, fk = row.dataset.fieldKey;
      if (!iid || !eqId || !fk) continue;
      var eq = EQUIPMENT.find(function(e){ return e.id === eqId; });
      if (!eq) continue;
      var field = eq.fields.find(function(f){ return f.key === fk; });
      if (!field) continue;
      try { fixupRouteRow(row, eq, iid, field); } catch(e){}
    }
    renumberRouteSteps();
    saveState(true);
    updateStats();
  };

  /* === Обработчики структурных изменений === */
  function handleStructuralChange(e){
    if (!window.ROUTE_VIEW_MODE) return;
    var t = e.target;
    if (!t || !t.dataset || !t.dataset.fieldKey) return;
    var row = t.closest(".route-step");
    if (!row) return;
    var iid = row.dataset.iid;
    if (!iid) return;
    try { window.fixupRouteInstance(iid); } catch(err){ console.warn("[fixup inst]", err); }
  }

  document.addEventListener("change", function(e){
    if (!window.ROUTE_VIEW_MODE) return;
    var t = e.target;
    if (!t || !t.dataset || !t.dataset.fieldKey) return;
    if (t.tagName === "SELECT") { handleStructuralChange(e); return; }
    if (t.tagName === "INPUT" && t.dataset.fieldKey === "zav") { handleStructuralChange(e); }
  }, true);

  document.addEventListener("blur", function(e){
    if (!window.ROUTE_VIEW_MODE) return;
    var t = e.target;
    if (!t || !t.dataset || t.dataset.fieldKey !== "zav") return;
    if (t.tagName === "INPUT") { handleStructuralChange(e); }
  }, true);

  /* Дополнительный слушатель для МК-84 в реальном времени (при вводе) */
  document.addEventListener("input", function(e){
    if (!window.ROUTE_VIEW_MODE) return;
    var t = e.target;
    if (!t || !t.dataset || t.dataset.fieldKey !== "zav") return;
    var row = t.closest(".route-step");
    if (!row) return;
    var eqId = row.dataset.eqId;
    if (eqId !== "mk9") return;
    /* Пересчёт только при изменении isMk84 */
    var iid = row.dataset.iid;
    var now = (typeof isMk84 === "function") && isMk84(iid);
    var was = row.dataset.wasMk84 === "true";
    if (now !== was) {
      row.dataset.wasMk84 = String(now);
      try { window.fixupRouteInstance(iid); } catch(err){}
    }
  }, true);

  var _orig=renderEquip;
  renderEquip=function(){
    if (window.ROUTE_VIEW_MODE) return window.renderRouteView();
    return _orig.apply(this, arguments);
  };

  function addBtn(){
    if (document.getElementById("btnRouteView")) return;
    var brand=document.querySelector(".topbar .brand"); if(!brand) return;
    var btn=document.createElement("button");
    btn.id="btnRouteView"; btn.className="mode-picker-btn"; btn.type="button";
    btn.style.marginLeft="14px";
    btn.innerHTML='<span class="ico">\\u{1F6E4}\\uFE0F</span><span id="routeViewLabel">Маршрут по операциям</span>';
    btn.onclick=function(){
      window.ROUTE_VIEW_MODE=!window.ROUTE_VIEW_MODE;
      var lbl=document.getElementById("routeViewLabel");
      var ico=btn.querySelector(".ico");
      if(lbl) lbl.textContent=window.ROUTE_VIEW_MODE?"Обычный вид":"Маршрут по операциям";
      if(ico) ico.textContent=window.ROUTE_VIEW_MODE?"\\u{1F4CB}":"\\u{1F6E4}\\uFE0F";
      renderEquip();
    };
    var ts=document.getElementById("themeSwitch");
    if(ts && ts.parentNode===brand.parentNode) brand.parentNode.insertBefore(btn, ts);
    else brand.appendChild(btn);
  }
  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded", addBtn);
  else addBtn();
  setTimeout(addBtn, 300); setTimeout(addBtn, 1000);

  var css=document.createElement("style");
  css.textContent=[
    ".route-view{padding:8px 0;}",
    ".route-view-header{padding:12px 16px;background:var(--panel2);border-radius:8px;margin-bottom:16px;font-size:14px;}",
    ".route-section-header{margin:32px 0 12px;padding:14px 18px;background:linear-gradient(90deg,var(--amber) 0%,var(--amber-dim) 100%);color:#fff;font-size:16px;font-weight:700;border-radius:8px;text-align:center;}",
    ".route-section-header:first-of-type{margin-top:0;}",
    ".route-zone-header{margin:20px 0 8px;padding:12px 18px;background:var(--panel2);border-left:5px solid var(--amber);border-radius:6px;font-size:14px;font-weight:700;color:var(--amber);}",
    ".route-eq-header{margin:14px 0 6px;padding:8px 14px;background:var(--panel);border-radius:6px;font-size:13.5px;font-weight:600;color:var(--ink);border:1px solid var(--line);}",
    ".route-inst-header{margin:8px 0 4px 20px;padding:6px 12px;border-left:3px solid var(--ink-dim);font-size:12px;color:var(--ink-dim);font-weight:600;}",
    ".route-step{display:grid;grid-template-columns:44px 1fr;gap:12px;align-items:start;padding:4px 0 4px 30px;}",
    ".route-step-num{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:var(--amber);color:#fff;font-weight:700;font-size:13.5px;font-family:var(--mono);flex-shrink:0;margin-top:6px;box-shadow:0 2px 6px rgba(0,0,0,.15);}",
    ".route-step-body{min-width:0;}",
    ".route-step-body .frow{border-top:none;padding:4px 0;}",
    "@media(max-width:640px){.route-step{grid-template-columns:34px 1fr;gap:8px;padding-left:14px;}.route-step-num{width:28px;height:28px;font-size:12px;}.route-section-header{font-size:14px;padding:10px 14px;}.route-zone-header{font-size:13px;padding:9px 14px;}}"
  ].join("");
  document.head.appendChild(css);
})();

init();
<\/script>
</body>
</html>
`;
