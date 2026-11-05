// Lazily loaded standalone HTML source for the HYDRO checklist mode.
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
<title>Чек-лист гидродемпферов — ТР-50</title>
<script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"><\/script>
<script>
(function(){
  try{
    var t = localStorage.getItem('checklist_theme_v1');
    if(t!=='tmh' && t!=='standard' && t!=='dark') t = 'tmh';
    document.documentElement.setAttribute('data-theme', t);
  }catch(e){
    document.documentElement.setAttribute('data-theme','tmh');
  }
})();
<\/script>
<style>
/* ===== СТИЛИ (полный набор) ===== */
:root{
  --bg:#eef4fb;
  --panel:#ffffff;
  --panel2:#f2f7fc;
  --line:#cfe0f0;
  --ink:#16324f;
  --ink-dim:#6d84a0;
  --amber:#2f7dd6;
  --amber-dim:#1a5bb8;
  --ok:#1f9d55;
  --bad:#d1453b;
  --info:#2f7dd6;
  --gold:#d4a017;
  --gold-light:#f9f0d0;
  --mono:'JetBrains Mono','Consolas',monospace;
  --sans:'Inter','Segoe UI',system-ui,sans-serif;
}
html[data-theme="tmh"]{
  --bg:#f0f6fc;
  --panel:#ffffff;
  --panel2:#e8f2fb;
  --line:#c6def2;
  --ink:#0c2f52;
  --ink-dim:#5c7a99;
  --amber:#0a5eb0;
  --amber-dim:#083f78;
  --ok:#1f9d55;
  --bad:#d1453b;
  --info:#1a86d9;
}
html[data-theme="tmh"] .topbar{
  background:linear-gradient(180deg,#0a5eb0,#0c4a8c 92%);
  border-bottom:2px solid #083058;
}
html[data-theme="tmh"] .topbar .brand .title-block h1{color:#ffffff;}
html[data-theme="tmh"] .topbar .brand .title-block small{color:#cfe4f7;}
html[data-theme="tmh"] .topbar .brand .tag{background:#ffffff;color:#0a5eb0;}
html[data-theme="tmh"] .topbar .brand .logo-block .tmh-logo .tmh{color:#ffffff;}
html[data-theme="tmh"] .topbar .brand .logo-block .tmh-logo .tmh-sub{color:#cfe4f7;}
html[data-theme="tmh"] .topbar .brand .logo-block .nevz-logo .nevz{color:#ffffff;}
html[data-theme="tmh"] .topbar .brand .logo-block .nevz-logo .nevz-sub{color:#cfe4f7;}
html[data-theme="tmh"] .topbar .brand .logo-block .divider{background:#ffffff40;}
html[data-theme="tmh"] .stat{color:#cfe4f7;border-left-color:#ffffff30;}
html[data-theme="tmh"] .stat b{color:#ffffff;}
html[data-theme="tmh"] .stat.bad b{color:#ffd6d1;}
html[data-theme="tmh"] .stat.ok b{color:#c9f5da;}
html[data-theme="tmh"] .user-info{color:#cfe4f7;border-left-color:#ffffff30;}
html[data-theme="tmh"] .user-info .role{color:#ffffff;}
html[data-theme="tmh"] .user-info .logout-btn{border-color:#ffffff40;color:#cfe4f7;}
html[data-theme="tmh"] .user-info .logout-btn:hover{border-color:#ffd6d1;color:#ffd6d1;}
html[data-theme="tmh"] .theme-switch{border-color:#ffffff40;background:#ffffff1a;}
html[data-theme="tmh"] .theme-switch button{color:#cfe4f7;}
html[data-theme="tmh"] .theme-switch button.active{background:#ffffff;color:#0a5eb0;}
html[data-theme="tmh"] body{background:linear-gradient(180deg,#e4f0fb,#f5fafd 520px);}
html[data-theme="tmh"] .card{border-color:#b9d7f0;}
html[data-theme="tmh"] .field input,
html[data-theme="tmh"] .field select{border-color:#b9d7f0;}
html[data-theme="tmh"] .picker-wrap{border-color:#b9d7f0;}
html[data-theme="tmh"] .chip{
  background:#e6f1fb;
  border-color:#b9d7f0;
  color:#456a8c;
}
html[data-theme="tmh"] .chip .n{
  background:#0a5eb01f;
  color:#0a5eb0;
}
html[data-theme="tmh"] .chip.active{
  background:var(--amber);
  color:#ffffff;
  border-color:var(--amber);
  box-shadow:0 2px 12px rgba(10,94,176,0.6);
}
html[data-theme="tmh"] .chip.active .n{
  background:#ffffff30;
  color:#ffffff;
}
html[data-theme="tmh"] .equip{border-color:#b9d7f0;box-shadow:0 2px 10px #0a5eb012;}
html[data-theme="tmh"] .equip>.eh{
  background:linear-gradient(90deg,#0a5eb0,#0c4a8c 120%);border-bottom-color:#083058;
}
html[data-theme="tmh"] .equip>.eh h2{color:#ffffff;}
html[data-theme="tmh"] .equip>.eh .badge{color:#cfe4f7;}
html[data-theme="tmh"] .sec+.sec{border-top-color:#c6def2;}
html[data-theme="tmh"] .sec h3{color:#0a5eb0;}
html[data-theme="tmh"] .grp .gh{color:#3f6690;}
html[data-theme="tmh"] .inst{background:#f2f8fd;border-color:#c6def2;}
html[data-theme="tmh"] .inst .ih .lbl{color:#0c2f52;}
html[data-theme="tmh"] .pill.na{background:#dcebf8;color:#456a8c;}
html[data-theme="tmh"] .frow select,
html[data-theme="tmh"] .frow input[type=text]{border-color:#c6def2;}
html[data-theme="tmh"] .frow.auto .val{border-color:#c6def2;}
html[data-theme="tmh"] .footbar{background:#eaf3fbee;border-top-color:#b9d7f0;box-shadow:0 -2px 14px #0a5eb01a;}
html[data-theme="tmh"] button.btn{border-color:#b9d7f0;}
html[data-theme="tmh"] .select-type-message{border-color:#0a5eb0;background:#eef6fc;}
html[data-theme="tmh"] .modal{border-color:#0a5eb0;}
html[data-theme="tmh"] ::selection{background:#0a5eb0;color:#fff;}
html[data-theme="tmh"] .mk84-warning{background:#fce8e6;border-left-color:#d1453b;}
html[data-theme="tmh"] .sec-wrapper .sec-header{
  background:var(--panel2);
  border-bottom:1px solid var(--line);
}
html[data-theme="tmh"] .sec-wrapper .sec-header .sec-toggle-icon{
  color:var(--amber);
}
html[data-theme="standard"] .chip,
html[data-theme="dark"] .chip {
  background: #0a5eb01f;
  border-color: #0a5eb0;
  color: #0a5eb0;
}
html[data-theme="standard"] .chip .n,
html[data-theme="dark"] .chip .n {
  background: #0a5eb01f;
  color: #0a5eb0;
}
html[data-theme="standard"] .chip.active,
html[data-theme="dark"] .chip.active {
  background: #0a5eb0;
  color: #ffffff;
  box-shadow: 0 2px 8px #0a5eb0;
}
html[data-theme="standard"] .chip.active .n,
html[data-theme="dark"] .chip.active .n {
  background: #ffffff30;
}
html[data-theme="dark"]{
  --bg:#12181f;
  --panel:#1a222c;
  --panel2:#212b37;
  --line:#2c3a48;
  --ink:#e8edf2;
  --ink-dim:#8ea0b0;
  --amber:#3f8ce0;
  --amber-dim:#1d5f9c;
  --ok:#3fae6a;
  --bad:#d9553f;
  --info:#3f8ce0;
}
html[data-theme="dark"] .topbar{
  background:linear-gradient(180deg,#0d1218,#141b23 90%);
}
html[data-theme="dark"] .topbar .brand .logo-block .nevz-logo .nevz{color:var(--ink);}
html[data-theme="dark"] .topbar .brand .logo-block .tmh-logo .tmh-sub,
html[data-theme="dark"] .topbar .brand .logo-block .nevz-logo .nevz-sub{color:#9fb3c6;}
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
html[data-theme="dark"] .sec-wrapper .sec-header{
  background:var(--panel2);
  border-bottom:1px solid var(--line);
}
.field input.error {
  border-color: var(--bad) !important;
  box-shadow: 0 0 0 2px rgba(209, 69, 59, 0.3);
}
.field .error-hint {
  display: none;
  font-size: 11px;
  color: var(--bad);
  margin-top: 2px;
}
.field .error-hint.show {
  display: block;
}
.theme-switch{
  display:flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:20px;
  padding:2px;background:var(--panel2);margin-left:14px;
}
.theme-switch button{
  font-family:var(--sans);font-size:11px;font-weight:600;border:none;background:transparent;
  color:var(--ink-dim);padding:6px 12px;border-radius:16px;cursor:pointer;transition:.15s;
}
.theme-switch button.active{background:var(--amber);color:#ffffff;}
.theme-switch button:not(.active):hover{color:var(--ink);}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
  -webkit-text-size-adjust:100%;text-size-adjust:100%;}
body{padding-bottom:120px;max-width:100vw;}
button,.chip,select,input{touch-action:manipulation;}
::selection{background:var(--amber-dim);color:#fff;}
.red-after{color:red;}
.topbar{
  position:relative;z-index:50;
  background:linear-gradient(180deg,#ffffff,#dceafc 90%);
  border-bottom:2px solid var(--amber-dim);
  padding:10px 20px;
  display:flex;align-items:center;gap:16px;flex-wrap:wrap;
}
.topbar .brand{display:flex;align-items:center;gap:14px;margin-right:auto;}
.topbar .brand .logo-block{display:flex;align-items:center;gap:12px;}
.topbar .brand .logo-block .tmh-logo{
  display:flex;flex-direction:column;align-items:center;line-height:1.1;
}
.topbar .brand .logo-block .tmh-logo .tmh{
  font-family:var(--mono);font-weight:700;font-size:18px;letter-spacing:.05em;color:#2f7dd6;
}
.topbar .brand .logo-block .tmh-logo .tmh-sub{
  font-size:7px;font-weight:600;color:#6d84a0;letter-spacing:.08em;text-transform:uppercase;
}
.topbar .brand .logo-block .divider{width:2px;height:40px;background:var(--line);}
.topbar .brand .logo-block .nevz-logo{
  display:flex;flex-direction:column;align-items:center;line-height:1.15;
}
.topbar .brand .logo-block .nevz-logo .nevz{
  font-family:var(--mono);font-weight:700;font-size:14px;letter-spacing:.05em;color:#16324f;
}
.topbar .brand .logo-block .nevz-logo .nevz-sub{
  font-size:6.5px;font-weight:600;color:#6d84a0;letter-spacing:.06em;text-transform:uppercase;text-align:center;
}
.topbar .brand .tag{
  font-family:var(--mono);font-weight:700;font-size:13px;letter-spacing:.12em;
  color:var(--bg);background:var(--amber);padding:4px 8px;border-radius:3px;
}
.topbar .brand .title-block h1{font-size:15px;margin:0;font-weight:600;color:var(--ink);}
.topbar .brand .title-block small{display:block;color:var(--ink-dim);font-size:11px;margin-top:1px;}
.stat{
  font-family:var(--mono);font-size:12px;color:var(--ink-dim);
  border-left:1px solid var(--line);padding-left:14px;
}
.stat b{display:block;font-size:18px;color:var(--ink);font-weight:700;line-height:1.1;}
.stat.bad b{color:var(--bad);}
.stat.ok b{color:var(--ok);}
.stat-bar{
  position:sticky;top:0;z-index:55;
  display:flex;align-items:center;gap:0;
  background:var(--panel);border-bottom:1px solid var(--line);
  box-shadow:0 2px 10px rgba(10,42,77,0.10);
  padding:5px 12px;
  padding-top:max(5px, env(safe-area-inset-top));
  padding-left:max(12px, env(safe-area-inset-left));
  padding-right:max(12px, env(safe-area-inset-right));
  overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;
}
.stat-bar::-webkit-scrollbar{display:none;}
.mini-stat{
  display:flex;align-items:baseline;gap:5px;flex-shrink:0;
  padding:3px 11px;border-right:1px solid var(--line);white-space:nowrap;
}
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
button.btn{
  font-family:var(--sans);font-size:12.5px;font-weight:600;
  background:var(--panel2);color:var(--ink);border:1px solid var(--line);
  padding:8px 12px;border-radius:6px;cursor:pointer;transition:.15s;
}
button.btn:hover{border-color:var(--amber);color:var(--amber);}
button.btn.primary{background:var(--amber);color:#ffffff;border-color:var(--amber);}
button.btn.primary:hover{background:#5b9ce8;color:#ffffff;}
button.btn.danger:hover{border-color:var(--bad);color:var(--bad);}
button.btn:disabled{opacity:0.4;cursor:not-allowed;}
.wrap{max-width:1180px;margin:0 auto;padding:22px 20px 0;}
.section-title{
  font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--amber);margin:34px 0 10px;display:flex;align-items:center;gap:10px;
}
.section-title::after{content:"";flex:1;height:1px;background:var(--line);}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px;}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;}
.field{display:flex;flex-direction:column;gap:5px;}
.field label{font-size:11.5px;color:var(--ink-dim);font-weight:600;}
.field input,.field select{
  background:var(--panel2);border:1px solid var(--line);color:var(--ink);
  padding:9px 10px;border-radius:6px;font-size:13.5px;font-family:var(--sans);
}
.field input:focus,.field select:focus{outline:none;border-color:var(--amber);}
.field input:disabled,.field select:disabled{
  opacity:0.55;cursor:not-allowed;background:var(--line);
}
.field select.auto-filled{background:var(--panel2);color:var(--ink);font-weight:600;}
.field .hint-lock{font-size:11px;color:var(--ink-dim);margin-top:2px;}
.picker{display:flex;flex-wrap:wrap;gap:8px;}
.chip{
  font-size:12.5px;padding:8px 13px;border-radius:20px;border:1px solid var(--line);
  background:var(--panel2);color:var(--ink-dim);cursor:pointer;user-select:none;transition:.15s;
  display:flex;align-items:center;gap:7px;
}
.chip .n{font-family:var(--mono);font-size:10.5px;background:#0a2a4d14;padding:1px 6px;border-radius:8px;}
.chip.active{background:var(--amber);color:#ffffff;border-color:var(--amber);font-weight:600;}
.chip.active .n{background:#ffffff30;}
.chip:hover{border-color:var(--amber);}
.equip{margin-top:22px;background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;}
.equip>.eh{
  padding:14px 18px;background:var(--panel2);display:flex;align-items:center;justify-content:space-between;
  border-bottom:1px solid var(--line);
}
.equip>.eh h2{font-size:14.5px;margin:0;font-weight:700;}
.equip>.eh .badge{font-family:var(--mono);font-size:11px;color:var(--ink-dim);}
.sec{padding:16px 18px;}
.sec+.sec{border-top:1px dashed var(--line);}
.sec h3{
  font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--info);
  margin:0 0 12px;font-family:var(--mono);
}
.grp{margin-bottom:16px;}
.grp .gh{font-size:12px;color:var(--ink-dim);margin-bottom:8px;font-weight:600;}
.inst{
  border:1px solid var(--line);border-left:3px solid var(--line);border-radius:8px;
  padding:12px 14px;margin-bottom:10px;background:#f7fafd;transition:.2s;
}
.inst.flag-ok{border-left-color:var(--ok);}
.inst.flag-bad{border-left-color:var(--bad);}
.inst .ih{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;flex-wrap:wrap;}
.inst .ih .lbl{font-family:var(--mono);font-size:12.5px;color:var(--ink);font-weight:700;}
.inst .ih .sub{font-size:11px;color:var(--ink-dim);}
.pill{
  font-family:var(--mono);font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:20px;
  letter-spacing:.03em;
}
.pill.na{background:#e2ecf7;color:var(--ink-dim);}
.pill.ok{background:#e1f7ea;color:var(--ok);}
.pill.bad{background:#fce8e6;color:var(--bad);}
.frow{display:grid;grid-template-columns:minmax(200px,1.4fr) minmax(160px,1fr);gap:10px 16px;align-items:start;padding:6px 0;border-top:1px solid #0a2a4d12;}
.frow:first-of-type{border-top:none;}
.frow .flabel{font-size:12.5px;color:var(--ink);padding-top:8px;line-height:1.35;}
.frow .flabel .hint{display:block;font-size:11px;color:var(--ink-dim);font-weight:400;margin-top:2px;}
.frow select,.frow input[type=text]{
  width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--ink);
  padding:8px 9px;border-radius:6px;font-size:13px;font-family:var(--sans);
}
.frow select:focus,.frow input:focus{outline:none;border-color:var(--amber);}
.frow select:disabled,.frow input[type=text]:disabled{
  opacity:0.55;cursor:not-allowed;background:var(--line);
}
.frow.auto .flabel{color:var(--amber);font-weight:600;}
.frow.auto .val{
  padding:8px 10px;border-radius:6px;font-family:var(--mono);font-size:12.5px;font-weight:700;
  background:var(--panel2);border:1px solid var(--line);
}
.frow.auto .val.bad{color:var(--bad);border-color:var(--bad);}
.frow.auto .val.ok{color:var(--ok);border-color:var(--ok);}
.frow.auto .val.na{color:var(--ink-dim);}
.mk84-warning{
  display:none;color:var(--bad);font-size:12px;font-weight:600;
  margin-top:4px;padding:6px 10px;background:#fce8e6;
  border-radius:4px;border-left:3px solid var(--bad);
  grid-column:1 / -1;
}
html[data-theme="dark"] .mk84-warning{
  background:#3a1f1a;border-left-color:#d9553f;
}
.inst.mk84-detected{
  border-left-color:var(--bad) !important;
  background:var(--panel2);
}
.inst.mk84-detected .ih .lbl::after{
  content:" ⚠️ МК-84";
  color:var(--bad);
  font-weight:700;
}
.photo-area {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.photo-preview {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--line);
  background: var(--panel2);
}
.photo-btn {
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  background: var(--panel2);
  border: 1px solid var(--line);
  color: var(--ink);
  border-radius: 4px;
  font-family: var(--sans);
  transition: all 0.2s;
}
.photo-btn:hover { border-color: var(--amber); }
.photo-btn.photo-required {
  border-color: var(--bad);
  background: #ffe0db;
  animation: blink-border 1s infinite;
}
@keyframes blink-border {
  0% { border-color: var(--bad); box-shadow: 0 0 0 0 rgba(209,69,59,0.4); }
  50% { border-color: #ff0000; box-shadow: 0 0 0 6px rgba(209,69,59,0); }
  100% { border-color: var(--bad); box-shadow: 0 0 0 0 rgba(209,69,59,0.4); }
}
.photo-delete {
  color: var(--bad);
  border-color: var(--bad);
  background: none;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 4px;
}
.sec-wrapper {
  border-bottom: 1px solid var(--line);
}
.sec-wrapper:last-child {
  border-bottom: none;
}
.sec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  cursor: pointer;
  user-select: none;
  background: var(--panel2);
  border-bottom: 1px solid var(--line);
  transition: background 0.15s;
  font-weight: 600;
  font-size: 14px;
}
.sec-header:hover {
  background: var(--line);
}
.sec-header .sec-toggle-icon {
  font-size: 14px;
  color: var(--amber);
  transition: transform 0.25s;
}
.sec-header .sec-toggle-icon.collapsed {
  transform: rotate(-90deg);
}
.sec-body {
  padding: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.sec-body.collapsed {
  display: none;
}
.sec-body .sec {
  border-top: none;
  padding: 16px 18px;
}
.scroll-top-btn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--amber);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
  font-size: 24px;
  cursor: pointer;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  line-height: 1;
}
.scroll-top-btn.visible {
  opacity: 1;
  pointer-events: auto;
}
.scroll-top-btn:hover {
  transform: scale(1.05);
  background: var(--amber-dim);
}
@media print {
  .scroll-top-btn { display: none !important; }
  .sec-body.collapsed { display: block !important; }
  .sec-header { display: none !important; }
}
.footbar{
  position:relative;bottom:0;left:0;right:0;z-index:40;
  background:#ffffffee;backdrop-filter:blur(6px);border-top:1px solid var(--line);box-shadow:0 -2px 12px #0a2a4d10;
  padding:10px 20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;
}
.toast{
  position:fixed;bottom:70px;left:50%;transform:translateX(-50%);
  background:var(--ok);color:#0d1a12;font-weight:700;font-size:12.5px;
  padding:9px 16px;border-radius:8px;opacity:0;pointer-events:none;transition:.25s;z-index:60;
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(-6px);}
@media (max-width:640px){
  .frow{grid-template-columns:1fr;}
  .topbar{padding:8px 12px;gap:8px;}
  .topbar .brand{gap:8px;}
  .topbar .brand .logo-block .nevz-logo .nevz-sub{display:none;}
  .topbar .brand .logo-block .tmh-logo .tmh-sub{display:none;}
  .topbar .brand .logo-block .divider{height:26px;}
  .topbar .brand .title-block h1{font-size:12.5px;}
  .topbar .brand .title-block small{font-size:9.5px;}
  .theme-switch{margin-left:0;}
  .mini-stat{padding:3px 8px;}
  .mini-stat b{font-size:13px;}
  .mini-stat span{font-size:9px;}
  .field input,.field select,.frow select,.frow input[type=text]{font-size:16px;padding:10px 10px;}
  button.btn{min-height:44px;padding:10px 14px;}
  .chip{min-height:40px;padding:9px 14px;}
  .theme-switch button{min-height:36px;padding:8px 10px;}
  .field input,.field select,.frow select{min-height:44px;}
  .footbar{padding:8px 10px;padding-bottom:max(8px, env(safe-area-inset-bottom));gap:8px;}
  .footbar .btn{flex:1 1 auto;min-width:0;}
  .wrap{padding:16px 12px 0;}
  .card{padding:14px;}
  .section-title{margin:24px 0 8px;}
  .sec-header{font-size:13px;padding:10px 14px;}
  .scroll-top-btn {
    bottom: 75px;
    right: 12px;
    width: 42px;
    height: 42px;
    font-size: 20px;
  }
  .card-item {
    padding: 10px !important;
  }
  .card-item .field-row label {
    font-size: 12px !important;
  }
  .card-item .field-row select,
  .card-item .field-row input {
    font-size: 16px !important;
    padding: 8px 10px !important;
  }
  .section-header {
    font-size: 16px !important;
    margin: 16px 0 8px !important;
  }
  .group-header {
    font-size: 15px !important;
    margin: 12px 0 6px !important;
  }
}
@media (max-width:380px){
  .topbar .brand .tag{font-size:11px;padding:3px 6px;}
  .mini-stat{padding:3px 6px;}
}
.select-type-message{
  margin-top:22px;background:var(--panel);border:2px solid var(--amber);border-radius:10px;
  padding:40px 20px;text-align:center;color:var(--ink-dim);
}
.select-type-message .icon{font-size:48px;margin-bottom:16px;display:block;}
.select-type-message .title{font-size:20px;font-weight:600;color:var(--amber);margin-bottom:8px;}
.select-type-message .sub{font-size:14px;color:var(--ink-dim);}
.modal-overlay{
  position:fixed;top:0;left:0;right:0;bottom:0;
  background:rgba(0,0,0,0.8);z-index:1000;
  display:flex;justify-content:center;align-items:center;backdrop-filter:blur(4px);
  display:none;
}
.modal{
  background:var(--panel);border:2px solid var(--amber);border-radius:12px;
  padding:35px 40px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5);
}
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
.user-info{
  display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ink-dim);
  border-left:1px solid var(--line);padding-left:14px;
}
.user-info .role{font-weight:600;color:var(--amber);}
.user-info .role.dim{color:var(--ink-dim);}
.user-info .logout-btn{
  background:none;border:1px solid var(--line);color:var(--ink-dim);
  padding:3px 10px;border-radius:4px;cursor:pointer;font-size:11px;font-family:var(--sans);
}
.user-info .logout-btn:hover{border-color:var(--bad);color:var(--bad);}
.card-item {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  transition: border-color 0.2s;
}
.card-item .field-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 8px;
}
.card-item .field-row:last-child {
  margin-bottom: 0;
}
.card-item .field-row label {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-dim);
}
.card-item .field-row select,
.card-item .field-row input {
  width: 100%;
  padding: 6px 8px;
  font-size: 14px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--panel2);
  color: var(--ink);
  font-family: var(--sans);
}
.card-item .field-row select:disabled,
.card-item .field-row input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--line);
}
.card-item .field-row select:focus,
.card-item .field-row input:focus {
  outline: none;
  border-color: var(--amber);
}
.card-item .block-type {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--amber);
}
.group-header {
  font-weight: 700;
  font-size: 16px;
  margin: 16px 0 8px;
  padding: 6px 10px;
  background: var(--panel2);
  border-radius: 6px;
}
.section-header {
  font-weight: 700;
  font-size: 18px;
  margin: 20px 0 12px;
  color: var(--amber);
  border-bottom: 2px solid var(--line);
  padding-bottom: 4px;
}
.frow.unfilled-highlight,.field.unfilled-highlight,.field-row.unfilled-highlight{box-shadow:0 0 0 3px var(--gold)!important;background:var(--gold-light)!important;border-radius:6px;animation:pulseHighlight 1.2s ease-in-out 3;position:relative;z-index:2;}
.field.unfilled-highlight,.field-row.unfilled-highlight{padding:6px;}
html[data-theme="dark"] .frow.unfilled-highlight,html[data-theme="dark"] .field.unfilled-highlight,html[data-theme="dark"] .field-row.unfilled-highlight{background:#2a2418!important;}
@keyframes pulseHighlight{0%,100%{box-shadow:0 0 0 3px var(--gold);}50%{box-shadow:0 0 0 8px rgba(212,160,23,0.3);}}
#btnFindUnfilled{background:var(--gold);color:#fff;border-color:var(--gold);}
#btnFindUnfilled:hover{background:#b88a14;border-color:#b88a14;color:#fff;}
#btnFindUnfilled .badge-find{background:rgba(255,255,255,0.25);border-radius:10px;padding:0 7px;margin-left:4px;font-size:11px;font-weight:700;}
</style>
</head>
<body>
<div class="topbar">
  <div class="brand">
    <div class="logo-block">
      <div class="tmh-logo"><span class="tmh">ТМХ</span><span class="tmh-sub">трансмашхолдинг</span></div>
      <div class="divider"></div>
      <div class="nevz-logo"><span class="nevz">НЭВЗ</span><span class="nevz-sub">новочеркасский<br>электровозостроительный<br>завод</span></div>
    </div>
    <span class="tag" id="locomotiveTypeTag">—</span>
    <div class="title-block"><h1>Чек-лист гидродемпферов при ТР-50/ТР-250</h1><small>Осмотр производится по локомотивам с пробегом до ТР-500</small></div>
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
  <div class="card">
    <div class="grid" id="generalGrid"></div>
    <div id="sectionsSelection" style="margin-top:14px;"></div>
  </div>

  <div class="section-title">Выбор типов гидродемпферов</div>
  <div class="card"><div id="typePicker" style="margin-top:0;"></div></div>

  <div id="equipRoot"></div>
</div>

<div class="footbar">
  <button class="btn primary" id="btnSave">💾 Сохранить в браузере</button>
  <button class="btn" id="btnSaveHtml">💾 Сохранить как файл</button>
  <button class="btn" id="btnExportWithPhotos">📷 Экспорт Excel</button>
  <button class="btn" id="btnExportJson">📤 Экспорт JSON</button>
  <button class="btn" id="btnImportJson">📥 Загрузить JSON</button>
  <input type="file" id="jsonFileInput" accept=".json" style="display:none;">
  <button class="btn" id="btnFindUnfilled">🔍 Найти незаполненное<span class="badge-find" id="findBadge" style="display:none;">0</span></button>
  <button class="btn" id="btnPrint">🖨 Печать / PDF</button>
  <button class="btn danger" id="btnReset">✕ Очистить всё</button>
</div>

<button class="scroll-top-btn" id="scrollTopBtn" aria-label="Наверх">↑</button>
<div class="toast" id="toast"></div>

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
let currentUser = null;

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
    try {
      var sharedAuth = window.parent.__TMH_AUTH_CONTEXT;
      if (sharedAuth && /^[0-9a-f-]{36}$/i.test(String(sharedAuth.userId || '')) &&
          ['admin','developer','user'].includes(sharedAuth.role)) {
        __tmhApplyUserStorageScope(sharedAuth.userId);
        currentUser = (sharedAuth.role === 'admin' || sharedAuth.role === 'developer') ? 'admin' : 'user';
        window.__TMH_OFFLINE_MODE = Boolean(sharedAuth.offlineMode);
        updateUserUI();
        return true;
      }
    } catch (e) {}
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

function __tmhBindOfflinePinControls() {}

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

function updateUserUI() {
  const info = document.getElementById('userInfo');
  const name = document.getElementById('userName');
  const role = document.getElementById('userRole');
  if (currentUser) {
    info.style.display = 'flex';
    if (currentUser === 'admin') {
      name.textContent = (function(){try{return JSON.parse(localStorage.getItem('checklist_user')||'{}').displayName||'';}catch(e){return '';}})() || 'Администратор';
      role.textContent = '(admin)';
      role.classList.remove('dim');
    } else {
      name.textContent = (function(){try{return JSON.parse(localStorage.getItem('checklist_user')||'{}').displayName||'';}catch(e){return '';}})() || 'Пользователь';
      role.textContent = '(user)';
      role.classList.add('dim');
    }
  } else {
    info.style.display = 'none';
  }
}

/* ========================================================================
   ДАННЫЕ ИЗ КЖЦ (ПОЛНЫЕ) — ОБНОВЛЕНЫ ПО EXCEL
   ======================================================================== */
const LOCOMOTIVE_DATA = {
  "2ЭС5К": {
    "591":"ТЧЭ-10 Карасук","592":"ТЧЭ-10 Карасук","593":"ТЧЭ-10 Карасук","594":"ТЧЭ-10 Карасук","595":"ТЧЭ-10 Карасук","596":"ТЧЭ-10 Карасук","597":"ТЧЭ-10 Карасук","598":"ТЧЭ-10 Карасук","599":"ТЧЭ-10 Карасук","600":"ТЧЭ-10 Карасук",
    "601":"ТЧЭ-10 Карасук","602":"ТЧЭ-10 Карасук","603":"ТЧЭ-10 Карасук","604":"ТЧЭ-10 Карасук","605":"ТЧЭ-10 Карасук","606":"ТЧЭ-10 Карасук","607":"ТЧЭ-10 Карасук","608":"ТЧЭ-10 Карасук","609":"ТЧЭ-10 Карасук","610":"ТЧЭ-10 Карасук",
    "611":"ТЧЭ-10 Карасук","612":"ТЧЭ-10 Карасук","613":"ТЧЭ-10 Карасук","614":"ТЧЭ-10 Карасук","615":"ТЧЭ-10 Карасук","616":"ТЧЭ-10 Карасук","617":"ТЧЭ-10 Карасук","618":"ТЧЭ-10 Карасук","619":"ТЧЭ-10 Карасук","620":"ТЧЭ-10 Карасук",
    "621":"ТЧЭ-11 Тимашевская","622":"ТЧЭ-11 Тимашевская","623":"ТЧЭ-11 Тимашевская","624":"ТЧЭ-11 Тимашевская","625":"ТЧЭ-11 Тимашевская","626":"ТЧЭ-11 Тимашевская","627":"ТЧЭ-11 Тимашевская","628":"ТЧЭ-11 Тимашевская","629":"ТЧЭ-11 Тимашевская","630":"ТЧЭ-11 Тимашевская",
    "631":"ТЧЭ-11 Тимашевская","632":"ТЧЭ-11 Тимашевская","633":"ТЧЭ-11 Тимашевская","634":"ТЧЭ-11 Тимашевская","635":"ТЧЭ-11 Тимашевская","636":"ТЧЭ-11 Тимашевская","637":"ТЧЭ-11 Тимашевская","638":"ТЧЭ-11 Тимашевская","639":"ТЧЭ-11 Тимашевская","640":"ТЧЭ-11 Тимашевская",
    "641":"ТЧЭ-11 Тимашевская","642":"ТЧЭ-11 Тимашевская","643":"ТЧЭ-11 Тимашевская","644":"ТЧЭ-11 Тимашевская","645":"ТЧЭ-11 Тимашевская","646":"ТЧЭ-11 Тимашевская","647":"ТЧЭ-11 Тимашевская","648":"ТЧЭ-11 Тимашевская","649":"ТЧЭ-11 Тимашевская","650":"ТЧЭ-11 Тимашевская",
    "651":"ТЧЭ-11 Тимашевская","652":"ТЧЭ-11 Тимашевская","653":"ТЧЭ-7 Петров Вал","654":"ТЧЭ-7 Петров Вал","655":"ТЧЭ-7 Петров Вал","656":"ТЧЭ-7 Петров Вал","657":"ТЧЭ-7 Петров Вал","658":"ТЧЭ-7 Петров Вал","659":"ТЧЭ-7 Петров Вал","660":"ТЧЭ-7 Петров Вал",
    "661":"ТЧЭ-7 Петров Вал","662":"ТЧЭ-7 Петров Вал","663":"ТЧЭ-7 Петров Вал","664":"ТЧЭ-7 Петров Вал","665":"ТЧЭ-7 Петров Вал","666":"ТЧЭ-7 Петров Вал","667":"ТЧЭ-7 Петров Вал","668":"ТЧЭ-7 Петров Вал","669":"ТЧЭ-7 Петров Вал","670":"ТЧЭ-7 Петров Вал",
    "671":"ТЧЭ-7 Петров Вал","672":"ТЧЭ-7 Петров Вал","673":"ТЧЭ-5 Кандалакша","674":"ТЧЭ-5 Кандалакша","675":"ТЧЭ-5 Кандалакша","676":"ТЧЭ-5 Кандалакша","677":"ТЧЭ-5 Кандалакша","678":"ТЧЭ-5 Кандалакша","679":"ТЧЭ-5 Кандалакша","680":"ТЧЭ-5 Кандалакша",
    "681":"ТЧЭ-5 Кандалакша","682":"ТЧЭ-5 Кандалакша","683":"ТЧЭ-5 Кандалакша","684":"ТЧЭ-5 Кандалакша","685":"ТЧЭ-5 Кандалакша","686":"ТЧЭ-5 Кандалакша","687":"ТЧЭ-5 Кандалакша","688":"ТЧЭ-5 Кандалакша","689":"ТЧЭ-7 Петров Вал","690":"ТЧЭ-7 Петров Вал",
    "691":"ТЧЭ-7 Петров Вал","692":"ТЧЭ-7 Петров Вал","693":"ТЧЭ-11 Тимашевская","694":"ТЧЭ-11 Тимашевская","695":"ТЧЭ-11 Тимашевская","696":"ТЧЭ-11 Тимашевская","697":"ТЧЭ-11 Тимашевская","698":"ТЧЭ-11 Тимашевская","699":"ТЧЭ-10 Карасук","700":"ТЧЭ-10 Карасук",
    "701":"ТЧЭ-10 Карасук","702":"ТЧЭ-10 Карасук","703":"ТЧЭ-10 Карасук","704":"ТЧЭ-10 Карасук","705":"ТЧЭ-10 Карасук","706":"ТЧЭ-10 Карасук","707":"ТЧЭ-10 Карасук","708":"ТЧЭ-10 Карасук","709":"ТЧЭ-10 Карасук","710":"ТЧЭ-10 Карасук",
    "711":"ТЧЭ-10 Карасук","712":"ТЧЭ-10 Карасук","713":"ТЧЭ-10 Карасук","714":"ТЧЭ-10 Карасук","715":"ТЧЭ-10 Карасук","716":"ТЧЭ-10 Карасук","717":"ТЧЭ-10 Карасук","718":"ТЧЭ-10 Карасук","719":"ТЧЭ-10 Карасук","720":"ТЧЭ-10 Карасук",
    "721":"ТЧЭ-10 Карасук","722":"ТЧЭ-10 Карасук","723":"ТЧЭ-10 Карасук","724":"ТЧЭ-10 Карасук","725":"ТЧЭ-10 Карасук","726":"ТЧЭ-10 Карасук","727":"ТЧЭ-10 Карасук","728":"ТЧЭ-10 Карасук","729":"ТЧЭ-10 Карасук","730":"ТЧЭ-10 Карасук",
    "731":"ТЧЭ-10 Карасук","732":"ТЧЭ-10 Карасук","733":"ТЧЭ-10 Карасук","734":"ТЧЭ-10 Карасук","735":"ТЧЭ-10 Карасук","736":"ТЧЭ-10 Карасук","737":"ТЧЭ-10 Карасук","738":"ТЧЭ-10 Карасук","739":"ТЧЭ-10 Карасук","740":"ТЧЭ-10 Карасук",
    "741":"ТЧЭ-10 Карасук","742":"ТЧЭ-10 Карасук","743":"ТЧЭ-10 Карасук","744":"ТЧЭ-10 Карасук","745":"ТЧЭ-10 Карасук","746":"ТЧЭ-10 Карасук","747":"ТЧЭ-10 Карасук","748":"ТЧЭ-10 Карасук","749":"ТЧЭ-10 Карасук","750":"ТЧЭ-10 Карасук",
    "751":"ТЧЭ-10 Карасук","752":"ТЧЭ-10 Карасук","753":"ТЧЭ-10 Карасук","754":"ТЧЭ-11 Тимашевская","755":"ТЧЭ-11 Тимашевская","756":"ТЧЭ-11 Тимашевская","757":"ТЧЭ-11 Тимашевская","758":"ТЧЭ-11 Тимашевская","759":"ТЧЭ-11 Тимашевская","760":"ТЧЭ-11 Тимашевская",
    "761":"ТЧЭ-11 Тимашевская","762":"ТЧЭ-11 Тимашевская","763":"ТЧЭ-11 Тимашевская","764":"ТЧЭ-11 Тимашевская","765":"ТЧЭ-11 Тимашевская","766":"ТЧЭ-11 Тимашевская","767":"ТЧЭ-11 Тимашевская","768":"ТЧЭ-11 Тимашевская","769":"ТЧЭ-11 Тимашевская","770":"ТЧЭ-11 Тимашевская",
    "771":"ТЧЭ-11 Тимашевская","772":"ТЧЭ-5 Карталы","773":"ТЧЭ-5 Карталы","774":"ТЧЭ-5 Карталы","775":"ТЧЭ-5 Карталы","776":"ТЧЭ-5 Карталы","777":"ТЧЭ-5 Карталы","778":"ТЧЭ-5 Карталы","779":"ТЧЭ-5 Карталы","780":"ТЧЭ-5 Карталы",
    "781":"ТЧЭ-5 Карталы","782":"ТЧЭ-7 Петров Вал","783":"ТЧЭ-7 Петров Вал","784":"ТЧЭ-7 Петров Вал","785":"ТЧЭ-7 Петров Вал","786":"ТЧЭ-7 Петров Вал","787":"ТЧЭ-7 Петров Вал","788":"ТЧЭ-7 Петров Вал","789":"ТЧЭ-7 Петров Вал","790":"ТЧЭ-7 Петров Вал",
    "791":"ТЧЭ-7 Петров Вал","792":"ТЧЭ-7 Петров Вал","793":"ТЧЭ-7 Петров Вал","794":"ТЧЭ-7 Петров Вал","795":"ТЧЭ-7 Петров Вал","796":"ТЧЭ-7 Петров Вал","797":"ТЧЭ-7 Петров Вал","798":"ТЧЭ-7 Петров Вал","799":"ТЧЭ-14 Сальск","800":"ТЧЭ-14 Сальск",
    "801":"ТЧЭ-14 Сальск","802":"ТЧЭ-14 Сальск","803":"ТЧЭ-14 Сальск","804":"ТЧЭ-14 Сальск","805":"ТЧЭ-14 Сальск","806":"ТЧЭ-14 Сальск","807":"ТЧЭ-14 Сальск","808":"ТЧЭ-14 Сальск","809":"ТЧЭ-14 Сальск","810":"ТЧЭ-14 Сальск",
    "811":"ТЧЭ-14 Сальск","812":"ТЧЭ-14 Сальск","813":"ТЧЭ-14 Сальск","814":"ТЧЭ-14 Сальск","815":"ТЧЭ-14 Сальск","816":"ТЧЭ-14 Сальск","817":"ТЧЭ-14 Сальск","818":"ТЧЭ-14 Сальск","819":"ТЧЭ-9 Лянгасово","820":"ТЧЭ-9 Лянгасово",
    "821":"ТЧЭ-9 Лянгасово","822":"ТЧЭ-9 Лянгасово","823":"ТЧЭ-9 Лянгасово","824":"ТЧЭ-9 Лянгасово","825":"ТЧЭ-9 Лянгасово","826":"ТЧЭ-9 Лянгасово","827":"ТЧЭ-9 Лянгасово","828":"ТЧЭ-9 Лянгасово","829":"ТЧЭ-9 Лянгасово","830":"ТЧЭ-9 Лянгасово"
  },
  "3ЭС5К": {
    "1482":"ТЧЭ-3 Чита","1483":"ТЧЭ-3 Чита","1484":"ТЧЭ-3 Чита","1485":"ТЧЭ-3 Чита","1486":"ТЧЭ-3 Чита","1487":"ТЧЭ-3 Чита","1488":"ТЧЭ-3 Чита","1489":"ТЧЭ-3 Чита","1490":"ТЧЭ-3 Чита","1491":"ТЧЭ-3 Чита",
    "1492":"ТЧЭ-3 Чита","1493":"ТЧЭ-3 Чита","1494":"ТЧЭ-3 Чита","1495":"ТЧЭ-3 Чита","1496":"ТЧЭ-3 Чита","1497":"ТЧЭ-3 Чита","1498":"ТЧЭ-3 Чита","1499":"ТЧЭ-3 Чита","1500":"ТЧЭ-3 Чита","1501":"ТЧЭ-3 Чита",
    "1502":"ТЧЭ-3 Чита","1503":"ТЧЭ-3 Чита","1504":"ТЧЭ-3 Чита","1505":"ТЧЭ-3 Чита","1506":"ТЧЭ-3 Чита","1507":"ТЧЭ-3 Чита","1508":"ТЧЭ-3 Чита","1509":"ТЧЭ-3 Чита","1510":"ТЧЭ-3 Чита","1511":"ТЧЭ-3 Чита",
    "1512":"ТЧЭ-3 Чита","1513":"ТЧЭ-3 Чита","1514":"ТЧЭ-3 Чита","1515":"ТЧЭ-3 Чита","1516":"ТЧЭ-3 Чита","1517":"ТЧЭ-3 Чита","1518":"ТЧЭ-3 Чита","1519":"ТЧЭ-3 Чита","1520":"ТЧЭ-3 Чита","1521":"ТЧЭ-3 Чита",
    "1522":"ТЧЭ-3 Чита","1523":"ТЧЭ-3 Чита","1524":"ТЧЭ-3 Чита","1525":"ТЧЭ-7 Абакан","1526":"ТЧЭ-7 Абакан","1527":"ТЧЭ-7 Абакан","1528":"ТЧЭ-7 Абакан","1529":"ТЧЭ-7 Абакан","1530":"ТЧЭ-7 Абакан","1531":"ТЧЭ-7 Абакан",
    "1532":"ТЧЭ-7 Абакан","1533":"ТЧЭ-7 Абакан","1534":"ТЧЭ-7 Абакан","1535":"ТЧЭ-7 Абакан","1536":"ТЧЭ-7 Абакан","1537":"ТЧЭ-7 Абакан","1538":"ТЧЭ-7 Абакан","1539":"ТЧЭ-7 Абакан","1540":"ТЧЭ-7 Абакан","1541":"ТЧЭ-7 Абакан",
    "1542":"ТЧЭ-7 Абакан","1543":"ТЧЭ-7 Абакан","1544":"ТЧЭ-7 Абакан","1545":"ТЧЭ-7 Абакан","1546":"ТЧЭ-7 Абакан","1547":"ТЧЭ-7 Абакан","1548":"ТЧЭ-7 Абакан","1549":"ТЧЭ-7 Абакан","1550":"ТЧЭ-7 Абакан","1551":"ТЧЭ-7 Абакан",
    "1552":"ТЧЭ-7 Абакан","1553":"ТЧЭ-7 Абакан","1554":"ТЧЭ-7 Абакан","1555":"ТЧЭ-7 Абакан","1556":"ТЧЭ-7 Абакан","1557":"ТЧЭ-7 Абакан","1558":"ТЧЭ-7 Абакан","1559":"ТЧЭ-7 Абакан","1560":"ТЧЭ-7 Абакан","1561":"ТЧЭ-7 Абакан",
    "1562":"ТЧЭ-7 Абакан","1563":"ТЧЭ-7 Абакан","1564":"ТЧЭ-7 Абакан","1565":"ТЧЭ-7 Абакан","1566":"ТЧЭ-10 Карасук","1567":"ТЧЭ-10 Карасук","1568":"ТЧЭ-10 Карасук","1569":"ТЧЭ-10 Карасук","1570":"ТЧЭ-10 Карасук","1571":"ТЧЭ-10 Карасук",
    "1572":"ТЧЭ-10 Карасук","1573":"ТЧЭ-10 Карасук","1574":"ТЧЭ-10 Карасук","1575":"ТЧЭ-10 Карасук","1576":"ТЧЭ-7 Абакан","1577":"ТЧЭ-7 Абакан","1578":"ТЧЭ-7 Абакан","1579":"ТЧЭ-7 Абакан","1580":"ТЧЭ-7 Абакан","1581":"ТЧЭ-7 Абакан",
    "1582":"ТЧЭ-7 Абакан","1583":"ТЧЭ-7 Абакан","1584":"ТЧЭ-7 Абакан","1585":"ТЧЭ-7 Абакан","1586":"ТЧЭ-7 Абакан","1587":"ТЧЭ-7 Абакан","1588":"ТЧЭ-7 Абакан","1589":"ТЧЭ-7 Абакан","1590":"ТЧЭ-7 Абакан","1591":"ТЧЭ-7 Абакан",
    "1592":"ТЧЭ-7 Абакан","1593":"ТЧЭ-7 Абакан","1594":"ТЧЭ-7 Абакан","1595":"ТЧЭ-7 Абакан","1596":"ТЧЭ-7 Абакан","1597":"ТЧЭ-7 Абакан","1598":"ТЧЭ-7 Абакан","1599":"ТЧЭ-7 Абакан","1600":"ТЧЭ-7 Абакан","1601":"ТЧЭ-7 Абакан",
    "1602":"ТЧЭ-7 Абакан","1603":"ТЧЭ-7 Абакан","1604":"ТЧЭ-7 Абакан","1605":"ТЧЭ-7 Абакан","1606":"ТЧЭ-7 Абакан","1607":"ТЧЭ-7 Абакан","1608":"ТЧЭ-7 Абакан","1609":"ТЧЭ-7 Абакан","1610":"ТЧЭ-7 Абакан","1611":"ТЧЭ-7 Абакан",
    "1612":"ТЧЭ-7 Абакан","1613":"ТЧЭ-7 Абакан","1614":"ТЧЭ-7 Абакан","1615":"ТЧЭ-7 Абакан","1616":"ТЧЭ-7 Абакан","1617":"ТЧЭ-7 Абакан","1618":"ТЧЭ-7 Абакан","1619":"ТЧЭ-7 Абакан","1620":"ТЧЭ-7 Абакан","1621":"ТЧЭ-7 Абакан",
    "1622":"ТЧЭ-7 Абакан","1623":"ТЧЭ-7 Абакан","1624":"ТЧЭ-7 Абакан","1625":"ТЧЭ-7 Абакан","1626":"ТЧЭ-7 Абакан","1627":"ТЧЭ-7 Абакан","1628":"ТЧЭ-7 Абакан","1629":"ТЧЭ-7 Абакан","1630":"ТЧЭ-7 Абакан","1631":"ТЧЭ-7 Абакан",
    "1632":"ТЧЭ-7 Абакан","1633":"ТЧЭ-7 Абакан","1634":"ТЧЭ-7 Абакан","1635":"ТЧЭ-7 Абакан","1636":"ТЧЭ-7 Абакан","1637":"ТЧЭ-7 Абакан","1638":"ТЧЭ-7 Абакан","1639":"ТЧЭ-7 Абакан","1640":"ТЧЭ-7 Абакан","1641":"ТЧЭ-7 Абакан",
    "1642":"ТЧЭ-7 Абакан","1643":"ТЧЭ-7 Абакан","1644":"ТЧЭ-7 Абакан","1645":"ТЧЭ-7 Абакан","1646":"ТЧЭ-7 Абакан","1647":"ТЧЭ-7 Абакан","1648":"ТЧЭ-7 Абакан","1649":"ТЧЭ-7 Абакан","1650":"ТЧЭ-7 Абакан","1651":"ТЧЭ-7 Абакан",
    "1652":"ТЧЭ-1 Боготол","1653":"ТЧЭ-1 Боготол","1654":"ТЧЭ-1 Боготол","1655":"ТЧЭ-1 Боготол","1656":"ТЧЭ-1 Боготол","1657":"ТЧЭ-1 Боготол","1658":"ТЧЭ-1 Боготол","1659":"ТЧЭ-1 Боготол","1660":"ТЧЭ-1 Боготол","1661":"ТЧЭ-1 Боготол",
    "1662":"ТЧЭ-1 Боготол","1663":"ТЧЭ-1 Боготол","1664":"ТЧЭ-1 Боготол","1665":"ТЧЭ-1 Боготол","1666":"ТЧЭ-1 Боготол","1667":"ТЧЭ-1 Боготол","1668":"ТЧЭ-1 Боготол","1669":"ТЧЭ-1 Боготол","1670":"ТЧЭ-1 Боготол","1671":"ТЧЭ-1 Боготол",
    "1672":"ТЧЭ-1 Боготол","1673":"ТЧЭ-1 Боготол","1674":"ТЧЭ-1 Боготол","1675":"ТЧЭ-1 Боготол","1676":"ТЧЭ-1 Боготол","1677":"ТЧЭ-1 Боготол","1678":"ТЧЭ-1 Боготол","1679":"ТЧЭ-1 Боготол","1680":"ТЧЭ-1 Боготол","1681":"ТЧЭ-1 Боготол",
    "1682":"ТЧЭ-1 Боготол","1683":"ТЧЭ-1 Боготол","1684":"ТЧЭ-1 Боготол","1685":"ТЧЭ-1 Боготол","1686":"ТЧЭ-1 Боготол","1687":"ТЧЭ-1 Боготол","1688":"ТЧЭ-1 Боготол","1689":"ТЧЭ-1 Боготол","1690":"ТЧЭ-1 Боготол","1691":"ТЧЭ-1 Боготол",
    "1692":"ТЧЭ-1 Боготол"
  },
  "4ЭС5К": {
    "40":"ТЧЭ-8 Смоляниново","41":"ТЧЭ-8 Смоляниново","42":"ТЧЭ-5 Карталы","43":"ТЧЭ-8 Смоляниново","44":"ТЧЭ-8 Смоляниново","45":"ТЧЭ-8 Смоляниново","46":"ТЧЭ-8 Смоляниново","47":"ТЧЭ-8 Смоляниново","48":"ТЧЭ-8 Смоляниново","49":"ТЧЭ-8 Смоляниново",
    "50":"ТЧЭ-8 Смоляниново","51":"ТЧЭ-8 Смоляниново","52":"ТЧЭ-8 Смоляниново","53":"ТЧЭ-8 Смоляниново","54":"ТЧЭ-8 Смоляниново","55":"ТЧЭ-8 Смоляниново","56":"ТЧЭ-8 Смоляниново","57":"ТЧЭ-8 Смоляниново","58":"ТЧЭ-8 Смоляниново","59":"ТЧЭ-8 Смоляниново",
    "60":"ТЧЭ-8 Смоляниново","61":"ТЧЭ-8 Смоляниново","62":"ТЧЭ-8 Смоляниново","63":"ТЧЭ-8 Смоляниново","64":"ТЧЭ-8 Смоляниново","65":"ТЧЭ-8 Смоляниново","66":"ТЧЭ-8 Смоляниново","67":"ТЧЭ-8 Смоляниново","68":"ТЧЭ-8 Смоляниново","69":"ТЧЭ-8 Смоляниново",
    "70":"ТЧЭ-8 Смоляниново","71":"ТЧЭ-8 Смоляниново","72":"ТЧЭ-8 Смоляниново","73":"ТЧЭ-8 Смоляниново","74":"ТЧЭ-8 Смоляниново","75":"ТЧЭ-8 Смоляниново","76":"ТЧЭ-8 Смоляниново","77":"ТЧЭ-8 Смоляниново","78":"ТЧЭ-8 Смоляниново","79":"ТЧЭ-8 Смоляниново",
    "80":"ТЧЭ-8 Смоляниново","81":"ТЧЭ-8 Смоляниново","82":"ТЧЭ-8 Смоляниново","83":"ТЧЭ-8 Смоляниново","84":"ТЧЭ-8 Смоляниново","85":"ТЧЭ-8 Смоляниново","86":"ТЧЭ-8 Смоляниново","87":"ТЧЭ-8 Смоляниново"
  }
};

const DEPOT_PLACES = {
            "ТЧЭ-10 Карасук": ["СЛД-9 КАРАСУК", "АЛТАЙСКАЯ", "АРТЫШТА", "ИРТЫШСКОЕ"],
            "ТЧЭ-11 Тимашевская": ["СЛД-10 ТИМАШЕВСК-КАВ", "СЛД-24 САЛЬСК-ГРУЗОВОЕ", "СЛД-6 ПЕТРОВВАЛЬСКОЕ"],
            "ТЧЭ-7 Петров Вал": ["СЛД-10 ТИМАШЕВСК-КАВ", "СЛД-24 САЛЬСК-ГРУЗОВОЕ", "СЛД-6 ПЕТРОВВАЛЬСКОЕ"],
            "ТЧЭ-5 Кандалакша": ["СЛД-27 КАНДАЛАКША", "СЛД-34 Красноуфимск-Уральский"],
            "ТЧЭ-5 Карталы": ["СЛД-25 АРКАИМ"],
            "ТЧЭ-14 Сальск": ["СЛД-10 ТИМАШЕВСК-КАВ", "СЛД-24 САЛЬСК-ГРУЗОВОЕ", "СЛД-6 ПЕТРОВВАЛЬСКОЕ"],
            "ТЧЭ-9 Лянгасово": ["СЛД-27 КАНДАЛАКША", "СЛД-30 ЛЯНГАСОВО-ЗАП", "СЛД-34 Красноуфимск-Уральский"],
            "ТЧЭ-3 Чита": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК"
            ],
            "ТЧЭ-7 Абакан": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-1 Боготол": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-8 Смоляниново": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-2 Хабаровск-2": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-2 Красноярск": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-11 Белогорск": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-9 Вихоревка": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-7 Улан-Удэ": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-5 Иркутск": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-3 Иланская": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-12 С-Байкальск": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ],
            "ТЧЭ-2 Нижнеудинск": ["СЛД-32 ДАЛЬНЕВОСТОЧНОЕ", "СЛД-21 МАГДАГАЧИ", "СЛД-19 РАЗДОЛЬНОЕ", "СЛД-17 ЧИТА",
                "СЛД-61 КАРЫМСКАЯ", "СЛД-24 ТАЙШЕТ", "СЛД-25 СЕВЕРОБАЙКАЛЬСК", "СЛД-22 НИЖНЕУДИНСКОЕ",
                "СЛД-9 КАНСК-ИЛАНСКИЙ", "СЛД-10 АБАКАН", "СЛД-11 БОГОТОЛ-СИБ", "МЕЖДУРЕЧЕНСК", "МАРИИНСК",
                "ИРКУТСК", "СЛД-38 Приморское"
            ]
        };

/* ========================================================================
   ЭТАЛОННЫЕ ДАННЫЕ ПРОБЕГА (MILEAGE_DATA) — скопированы из комплексного чек-листа
   ======================================================================== */
const MILEAGE_DATA = {
  "2ЭС5К_243": 1489262,
  "2ЭС5К_244": 1375568,
  "2ЭС5К_245": 1442978,
  "2ЭС5К_246": 1261753,
  "2ЭС5К_247": 1409436,
  "2ЭС5К_248": 1485963,
  "2ЭС5К_249": 1541198,
  "2ЭС5К_250": 1463390,
  "2ЭС5К_251": 1320196,
  "2ЭС5К_252": 1490410,
  "2ЭС5К_253": 1303097,
  "2ЭС5К_254": 1382606,
  "2ЭС5К_255": 1467920,
  "2ЭС5К_256": 1375667,
  "2ЭС5К_257": 1474236,
  "2ЭС5К_258": 1454033,
  "2ЭС5К_259": 1414463,
  "2ЭС5К_260": 1385713,
  "2ЭС5К_261": 1515685,
  "2ЭС5К_262": 1377349,
  "2ЭС5К_263": 1336788,
  "2ЭС5К_264": 1489558,
  "2ЭС5К_265": 1359429,
  "2ЭС5К_266": 1330042,
  "2ЭС5К_267": 1325530,
  "2ЭС5К_268": 1413974,
  "2ЭС5К_269": 1288907,
  "2ЭС5К_270": 1363545,
  "2ЭС5К_271": 1334650,
  "2ЭС5К_272": 1415107,
  "2ЭС5К_273": 1462487,
  "2ЭС5К_274": 911056,
  "2ЭС5К_275": 867230,
  "2ЭС5К_276": 1611049,
  "2ЭС5К_277": 1580751,
  "2ЭС5К_278": 1035179,
  "2ЭС5К_279": 959478,
  "2ЭС5К_280": 1473774,
  "2ЭС5К_281": 1695643,
  "2ЭС5К_282": 1695637,
  "2ЭС5К_283": 1472503,
  "2ЭС5К_284": 1663000,
  "2ЭС5К_285": 1662996,
  "2ЭС5К_286": 908459,
  "2ЭС5К_287": 817153,
  "2ЭС5К_288": 893275,
  "2ЭС5К_289": 820068,
  "2ЭС5К_290": 820168,
  "2ЭС5К_291": 812570,
  "2ЭС5К_292": 926982,
  "2ЭС5К_293": 719524,
  "2ЭС5К_294": 1023924,
  "2ЭС5К_295": 700263,
  "2ЭС5К_296": 1033955,
  "2ЭС5К_297": 1315822,
  "2ЭС5К_298": 1060538,
  "2ЭС5К_299": 1332858,
  "2ЭС5К_300": 1295418,
  "2ЭС5К_301": 1306657,
  "2ЭС5К_302": 814704,
  "2ЭС5К_303": 648000,
  "2ЭС5К_304": 671341,
  "2ЭС5К_305": 760246,
  "2ЭС5К_306": 857326,
  "2ЭС5К_307": 1251675,
  "2ЭС5К_308": 739821,
  "2ЭС5К_309": 1030731,
  "2ЭС5К_310": 1075129,
  "2ЭС5К_311": 1071576,
  "2ЭС5К_312": 928321,
  "2ЭС5К_313": 913875,
  "2ЭС5К_314": 887806,
  "2ЭС5К_315": 1275330,
  "2ЭС5К_316": 1280060,
  "2ЭС5К_317": 1299346,
  "2ЭС5К_318": 1275320,
  "2ЭС5К_319": 1199222,
  "2ЭС5К_320": 1280161,
  "2ЭС5К_321": 1327145,
  "2ЭС5К_322": 1180085,
  "2ЭС5К_323": 1098539,
  "2ЭС5К_324": 1119425,
  "2ЭС5К_325": 1256815,
  "2ЭС5К_326": 1307637,
  "2ЭС5К_327": 1176623,
  "2ЭС5К_328": 1219937,
  "2ЭС5К_329": 1225896,
  "2ЭС5К_330": 1320586,
  "2ЭС5К_331": 1299992,
  "2ЭС5К_332": 1305972,
  "2ЭС5К_333": 1259031,
  "2ЭС5К_334": 1117409,
  "2ЭС5К_335": 1242016,
  "2ЭС5К_336": 1202951,
  "2ЭС5К_337": 1255303,
  "2ЭС5К_338": 1249067,
  "2ЭС5К_339": 1254983,
  "2ЭС5К_340": 1198595,
  "2ЭС5К_341": 1119626,
  "2ЭС5К_342": 1151587,
  "2ЭС5К_343": 1211600,
  "2ЭС5К_344": 1239939,
  "2ЭС5К_345": 1102979,
  "2ЭС5К_346": 1068362,
  "2ЭС5К_347": 1410454,
  "2ЭС5К_348": 1287923,
  "2ЭС5К_349": 1143637,
  "2ЭС5К_350": 1278721,
  "2ЭС5К_351": 1210276,
  "2ЭС5К_352": 1257055,
  "2ЭС5К_353": 1262131,
  "2ЭС5К_354": 1442543,
  "2ЭС5К_355": 1253277,
  "2ЭС5К_356": 1264831,
  "2ЭС5К_357": 1099106,
  "2ЭС5К_358": 1201130,
  "2ЭС5К_359": 1172586,
  "2ЭС5К_360": 1427396,
  "2ЭС5К_361": 1322305,
  "2ЭС5К_362": 1301225,
  "2ЭС5К_363": 1177001,
  "2ЭС5К_364": 1171004,
  "2ЭС5К_365": 1232317,
  "2ЭС5К_366": 1433207,
  "2ЭС5К_367": 1207206,
  "2ЭС5К_368": 1250979,
  "2ЭС5К_369": 1180238,
  "2ЭС5К_370": 1233602,
  "2ЭС5К_371": 1257505,
  "2ЭС5К_372": 1226995,
  "2ЭС5К_373": 1232710,
  "2ЭС5К_374": 1072326,
  "2ЭС5К_375": 1334304,
  "2ЭС5К_376": 1227860,
  "2ЭС5К_377": 1268481,
  "2ЭС5К_378": 1234512,
  "2ЭС5К_379": 1150475,
  "2ЭС5К_380": 1435918,
  "2ЭС5К_381": 1224530,
  "2ЭС5К_382": 1177531,
  "2ЭС5К_383": 1170893,
  "2ЭС5К_384": 1129268,
  "2ЭС5К_385": 1162667,
  "2ЭС5К_386": 1161967,
  "2ЭС5К_387": 1250236,
  "2ЭС5К_388": 1223982,
  "2ЭС5К_389": 1153703,
  "2ЭС5К_390": 1125848,
  "2ЭС5К_391": 1161221,
  "2ЭС5К_392": 1215878,
  "2ЭС5К_393": 1219541,
  "2ЭС5К_394": 1157454,
  "2ЭС5К_395": 914211,
  "2ЭС5К_396": 1080103,
  "2ЭС5К_397": 1203834,
  "2ЭС5К_398": 1090095,
  "2ЭС5К_399": 1194199,
  "2ЭС5К_400": 1180207,
  "2ЭС5К_401": 1162919,
  "2ЭС5К_402": 1097769,
  "2ЭС5К_403": 1101084,
  "2ЭС5К_404": 1174110,
  "2ЭС5К_405": 1087424,
  "2ЭС5К_406": 1083227,
  "2ЭС5К_407": 1143920,
  "2ЭС5К_408": 1118941,
  "2ЭС5К_409": 1149649,
  "2ЭС5К_410": 1159137,
  "2ЭС5К_411": 1059305,
  "2ЭС5К_412": 1150845,
  "2ЭС5К_413": 1001838,
  "2ЭС5К_414": 1110803,
  "2ЭС5К_415": 940568,
  "2ЭС5К_416": 938740,
  "2ЭС5К_417": 908463,
  "2ЭС5К_418": 846063,
  "2ЭС5К_419": 917069,
  "2ЭС5К_420": 735002,
  "2ЭС5К_421": 693007,
  "2ЭС5К_422": 694158,
  "2ЭС5К_423": 745353,
  "2ЭС5К_424": 682759,
  "2ЭС5К_425": 677091,
  "2ЭС5К_426": 593485,
  "2ЭС5К_427": 692381,
  "2ЭС5К_428": 723875,
  "2ЭС5К_429": 737461,
  "2ЭС5К_430": 750954,
  "2ЭС5К_431": 729857,
  "2ЭС5К_432": 784632,
  "2ЭС5К_433": 1119799,
  "2ЭС5К_434": 1042117,
  "2ЭС5К_435": 1015602,
  "2ЭС5К_436": 1096124,
  "2ЭС5К_437": 896376,
  "2ЭС5К_438": 1014877,
  "2ЭС5К_439": 1279135,
  "2ЭС5К_440": 1349479,
  "2ЭС5К_441": 1355374,
  "2ЭС5К_442": 1191120,
  "2ЭС5К_443": 1336754,
  "2ЭС5К_444": 1348171,
  "2ЭС5К_445": 1288884,
  "2ЭС5К_446": 1322569,
  "2ЭС5К_447": 1232029,
  "2ЭС5К_448": 1345848,
  "2ЭС5К_449": 1307451,
  "2ЭС5К_450": 1312259,
  "2ЭС5К_451": 1329697,
  "2ЭС5К_452": 1356663,
  "2ЭС5К_453": 1269028,
  "2ЭС5К_454": 1329268,
  "2ЭС5К_455": 1288770,
  "2ЭС5К_456": 1289352,
  "2ЭС5К_457": 1302154,
  "2ЭС5К_458": 1300631,
  "2ЭС5К_459": 1323478,
  "2ЭС5К_460": 1349492,
  "2ЭС5К_461": 1337940,
  "2ЭС5К_462": 1282436,
  "2ЭС5К_463": 1333809,
  "2ЭС5К_464": 1276821,
  "2ЭС5К_465": 1289716,
  "2ЭС5К_466": 1340528,
  "2ЭС5К_467": 1288402,
  "2ЭС5К_468": 1330594,
  "2ЭС5К_469": 1281913,
  "2ЭС5К_470": 1353305,
  "2ЭС5К_471": 1271198,
  "2ЭС5К_472": 1315445,
  "2ЭС5К_473": 1303894,
  "2ЭС5К_474": 1302875,
  "2ЭС5К_475": 1317335,
  "2ЭС5К_476": 1308202,
  "2ЭС5К_477": 1133087,
  "2ЭС5К_478": 1328095,
  "2ЭС5К_479": 1226091,
  "2ЭС5К_480": 1283543,
  "2ЭС5К_481": 1313997,
  "2ЭС5К_482": 1307373,
  "2ЭС5К_483": 1232763,
  "2ЭС5К_484": 1287088,
  "2ЭС5К_485": 1338739,
  "2ЭС5К_486": 1261901,
  "2ЭС5К_487": 1278250,
  "2ЭС5К_488": 1242660,
  "2ЭС5К_489": 1301243,
  "2ЭС5К_490": 1235899,
  "2ЭС5К_491": 1258769,
  "2ЭС5К_492": 1238528,
  "2ЭС5К_493": 1274761,
  "2ЭС5К_494": 1213568,
  "2ЭС5К_495": 1236977,
  "2ЭС5К_496": 1225643,
  "2ЭС5К_497": 1240348,
  "2ЭС5К_498": 1194435,
  "2ЭС5К_499": 1087527,
  "2ЭС5К_500": 1088272,
  "2ЭС5К_501": 1253176,
  "2ЭС5К_502": 1157657,
  "2ЭС5К_503": 1226548,
  "2ЭС5К_504": 1259365,
  "2ЭС5К_505": 1123132,
  "2ЭС5К_506": 1248459,
  "2ЭС5К_507": 1210795,
  "2ЭС5К_508": 1220752,
  "2ЭС5К_509": 1149344,
  "2ЭС5К_510": 1055778,
  "2ЭС5К_511": 1133486,
  "2ЭС5К_512": 1192920,
  "2ЭС5К_513": 1200804,
  "2ЭС5К_514": 626751,
  "2ЭС5К_515": 284497,
  "2ЭС5К_516": 258909,
  "2ЭС5К_517": 445032,
  "2ЭС5К_518": 669467,
  "2ЭС5К_519": 664851,
  "2ЭС5К_520": 665170,
  "2ЭС5К_521": 616000,
  "2ЭС5К_522": 604564,
  "2ЭС5К_523": 590262,
  "2ЭС5К_524": 535630,
  "2ЭС5К_525": 508659,
  "2ЭС5К_526": 556927,
  "2ЭС5К_527": 501465,
  "2ЭС5К_528": 464468,
  "2ЭС5К_529": 528494,
  "2ЭС5К_530": 478287,
  "2ЭС5К_531": 471761,
  "2ЭС5К_532": 541360,
  "2ЭС5К_533": 525256,
  "2ЭС5К_534": 631450,
  "2ЭС5К_535": 488901,
  "2ЭС5К_536": 570973,
  "2ЭС5К_537": 469073,
  "2ЭС5К_538": 481576,
  "2ЭС5К_539": 534482,
  "2ЭС5К_540": 570016,
  "2ЭС5К_541": 664245,
  "2ЭС5К_542": 452008,
  "2ЭС5К_543": 664740,
  "2ЭС5К_544": 432577,
  "2ЭС5К_545": 675715,
  "2ЭС5К_546": 235487,
  "2ЭС5К_547": 484134,
  "2ЭС5К_548": 490820,
  "2ЭС5К_549": 527636,
  "2ЭС5К_550": 504603,
  "2ЭС5К_551": 451238,
  "2ЭС5К_552": 585659,
  "2ЭС5К_553": 449995,
  "2ЭС5К_554": 459967,
  "2ЭС5К_555": 292554,
  "2ЭС5К_556": 291217,
  "2ЭС5К_557": 295993,
  "2ЭС5К_558": 287851,
  "2ЭС5К_559": 285357,
  "2ЭС5К_560": 285691,
  "2ЭС5К_561": 279763,
  "2ЭС5К_562": 282315,
  "2ЭС5К_563": 295030,
  "2ЭС5К_564": 288224,
  "2ЭС5К_565": 204682,
  "2ЭС5К_566": 114500,
  "2ЭС5К_567": 212957,
  "2ЭС5К_568": 340314,
  "2ЭС5К_569": 496080,
  "2ЭС5К_570": 460728,
  "2ЭС5К_571": 454819,
  "2ЭС5К_572": 481764,
  "2ЭС5К_573": 489535,
  "2ЭС5К_574": 416086,
  "2ЭС5К_575": 474678,
  "2ЭС5К_576": 479662,
  "2ЭС5К_577": 458136,
  "2ЭС5К_578": 421354,
  "2ЭС5К_579": 411902,
  "2ЭС5К_580": 403174,
  "2ЭС5К_581": 438551,
  "2ЭС5К_582": 411882,
  "2ЭС5К_583": 422549,
  "2ЭС5К_584": 470948,
  "2ЭС5К_585": 436695,
  "2ЭС5К_586": 447999,
  "2ЭС5К_587": 481853,
  "2ЭС5К_588": 427439,
  "2ЭС5К_589": 444021,
  "2ЭС5К_590": 215171,
  "2ЭС5К_591": 565188,
  "2ЭС5К_592": 603426,
  "2ЭС5К_593": 617625,
  "2ЭС5К_594": 619010,
  "2ЭС5К_595": 605409,
  "2ЭС5К_596": 586010,
  "2ЭС5К_597": 574628,
  "2ЭС5К_598": 603109,
  "2ЭС5К_599": 604564,
  "2ЭС5К_600": 587042,
  "2ЭС5К_601": 593402,
  "2ЭС5К_602": 624852,
  "2ЭС5К_603": 600674,
  "2ЭС5К_604": 541435,
  "2ЭС5К_605": 570800,
  "2ЭС5К_606": 586704,
  "2ЭС5К_607": 588878,
  "2ЭС5К_608": 559997,
  "2ЭС5К_609": 544621,
  "2ЭС5К_610": 502357,
  "2ЭС5К_611": 536230,
  "2ЭС5К_612": 482083,
  "2ЭС5К_613": 552204,
  "2ЭС5К_614": 514309,
  "2ЭС5К_615": 496218,
  "2ЭС5К_616": 509664,
  "2ЭС5К_617": 432662,
  "2ЭС5К_618": 511445,
  "2ЭС5К_619": 529716,
  "2ЭС5К_620": 524441,
  "2ЭС5К_621": 314251,
  "2ЭС5К_622": 299177,
  "2ЭС5К_623": 280538,
  "2ЭС5К_624": 268701,
  "2ЭС5К_625": 315797,
  "2ЭС5К_626": 301291,
  "2ЭС5К_627": 312162,
  "2ЭС5К_628": 254952,
  "2ЭС5К_629": 302929,
  "2ЭС5К_630": 324914,
  "2ЭС5К_631": 291167,
  "2ЭС5К_632": 279055,
  "2ЭС5К_633": 320151,
  "2ЭС5К_634": 280317,
  "2ЭС5К_635": 274930,
  "2ЭС5К_636": 309148,
  "2ЭС5К_637": 270803,
  "2ЭС5К_638": 256628,
  "2ЭС5К_639": 272046,
  "2ЭС5К_640": 269538,
  "2ЭС5К_641": 279331,
  "2ЭС5К_642": 297953,
  "2ЭС5К_643": 271074,
  "2ЭС5К_644": 307657,
  "2ЭС5К_645": 259548,
  "2ЭС5К_646": 287485,
  "2ЭС5К_647": 65607,
  "2ЭС5К_648": 273763,
  "2ЭС5К_649": 201469,
  "2ЭС5К_650": 270723,
  "2ЭС5К_651": 275575,
  "2ЭС5К_652": 275247,
  "2ЭС5К_653": 275332,
  "2ЭС5К_654": 274806,
  "2ЭС5К_655": 274903,
  "2ЭС5К_656": 275346,
  "2ЭС5К_657": 272494,
  "2ЭС5К_658": 265578,
  "2ЭС5К_659": 265623,
  "2ЭС5К_660": 260700,
  "2ЭС5К_661": 224101,
  "2ЭС5К_662": 274760,
  "2ЭС5К_663": 249165,
  "2ЭС5К_664": 231120,
  "2ЭС5К_665": 225528,
  "2ЭС5К_666": 248334,
  "2ЭС5К_667": 237532,
  "2ЭС5К_668": 250189,
  "2ЭС5К_669": 249401,
  "2ЭС5К_670": 257656,
  "2ЭС5К_671": 231250,
  "2ЭС5К_672": 241589,
  "2ЭС5К_673": 188019,
  "2ЭС5К_674": 225074,
  "2ЭС5К_675": 221673,
  "2ЭС5К_676": 195356,
  "2ЭС5К_677": 204445,
  "2ЭС5К_678": 215611,
  "2ЭС5К_679": 252206,
  "2ЭС5К_680": 263459,
  "2ЭС5К_681": 243339,
  "2ЭС5К_682": 233280,
  "2ЭС5К_683": 223739,
  "2ЭС5К_684": 242553,
  "2ЭС5К_685": 211199,
  "2ЭС5К_686": 248261,
  "2ЭС5К_687": 214637,
  "2ЭС5К_688": 250507,
  "2ЭС5К_689": 218735,
  "2ЭС5К_690": 251200,
  "2ЭС5К_691": 245772,
  "2ЭС5К_692": 235717,
  "2ЭС5К_693": 236850,
  "2ЭС5К_694": 258062,
  "2ЭС5К_695": 222369,
  "2ЭС5К_696": 234140,
  "2ЭС5К_697": 226627,
  "2ЭС5К_698": 254714,
  "2ЭС5К_699": 367732,
  "2ЭС5К_700": 302685,
  "2ЭС5К_701": 327268,
  "2ЭС5К_702": 376786,
  "2ЭС5К_703": 356212,
  "2ЭС5К_704": 347781,
  "2ЭС5К_705": 386393,
  "2ЭС5К_706": 361638,
  "2ЭС5К_707": 376507,
  "2ЭС5К_708": 344287,
  "2ЭС5К_709": 372673,
  "2ЭС5К_710": 345822,
  "2ЭС5К_711": 371035,
  "2ЭС5К_712": 373399,
  "2ЭС5К_713": 355397,
  "2ЭС5К_714": 347174,
  "2ЭС5К_715": 348047,
  "2ЭС5К_716": 330094,
  "2ЭС5К_717": 357996,
  "2ЭС5К_718": 266817,
  "2ЭС5К_719": 322321,
  "2ЭС5К_720": 351310,
  "2ЭС5К_721": 339683,
  "2ЭС5К_722": 326862,
  "2ЭС5К_723": 350983,
  "2ЭС5К_724": 355079,
  "2ЭС5К_725": 336823,
  "2ЭС5К_726": 309992,
  "2ЭС5К_727": 326351,
  "2ЭС5К_728": 329802,
  "2ЭС5К_729": 333225,
  "2ЭС5К_730": 319326,
  "2ЭС5К_731": 317351,
  "2ЭС5К_732": 311655,
  "2ЭС5К_733": 304218,
  "2ЭС5К_734": 323330,
  "2ЭС5К_735": 327594,
  "2ЭС5К_736": 325565,
  "2ЭС5К_737": 334213,
  "2ЭС5К_738": 325123,
  "2ЭС5К_739": 326522,
  "2ЭС5К_740": 315772,
  "2ЭС5К_741": 331222,
  "2ЭС5К_742": 326184,
  "2ЭС5К_743": 285411,
  "2ЭС5К_744": 305810,
  "2ЭС5К_745": 318201,
  "2ЭС5К_746": 312527,
  "2ЭС5К_747": 265478,
  "2ЭС5К_748": 305205,
  "2ЭС5К_749": 297936,
  "2ЭС5К_750": 266739,
  "2ЭС5К_751": 229043,
  "2ЭС5К_752": 242345,
  "2ЭС5К_753": 258495,
  "2ЭС5К_754": 165091,
  "2ЭС5К_755": 160988,
  "2ЭС5К_756": 176487,
  "2ЭС5К_757": 145380,
  "2ЭС5К_758": 163735,
  "2ЭС5К_759": 154577,
  "2ЭС5К_760": 172934,
  "2ЭС5К_761": 153968,
  "2ЭС5К_762": 131657,
  "2ЭС5К_763": 143227,
  "2ЭС5К_764": 137951,
  "2ЭС5К_765": 157387,
  "2ЭС5К_766": 82749,
  "2ЭС5К_767": 146317,
  "2ЭС5К_768": 129864,
  "2ЭС5К_769": 147753,
  "2ЭС5К_770": 129698,
  "2ЭС5К_771": 125815,
  "2ЭС5К_772": 132235,
  "2ЭС5К_773": 113860,
  "2ЭС5К_774": 114756,
  "2ЭС5К_775": 102464,
  "2ЭС5К_776": 110187,
  "2ЭС5К_777": 128111,
  "2ЭС5К_778": 114522,
  "2ЭС5К_779": 106648,
  "2ЭС5К_780": 94258,
  "2ЭС5К_781": 97608,
  "2ЭС5К_782": 94720,
  "2ЭС5К_783": 97593,
  "2ЭС5К_784": 88242,
  "2ЭС5К_785": 103697,
  "2ЭС5К_786": 99507,
  "2ЭС5К_787": 93164,
  "2ЭС5К_788": 95323,
  "2ЭС5К_789": 99022,
  "2ЭС5К_790": 76917,
  "2ЭС5К_791": 99302,
  "2ЭС5К_792": 104034,
  "2ЭС5К_793": 92905,
  "2ЭС5К_794": 102462,
  "2ЭС5К_795": 78918,
  "2ЭС5К_796": 94612,
  "2ЭС5К_797": 102999,
  "2ЭС5К_798": 97996,
  "2ЭС5К_799": 60471,
  "2ЭС5К_800": 53502,
  "2ЭС5К_801": 51396,
  "2ЭС5К_802": 56999,
  "2ЭС5К_803": 62701,
  "2ЭС5К_804": 60010,
  "2ЭС5К_805": 57211,
  "2ЭС5К_806": 47651,
  "2ЭС5К_807": 52100,
  "2ЭС5К_808": 58008,
  "2ЭС5К_809": 60955,
  "2ЭС5К_810": 68902,
  "2ЭС5К_811": 55621,
  "2ЭС5К_812": 49393,
  "2ЭС5К_813": 54704,
  "2ЭС5К_814": 55663,
  "2ЭС5К_815": 57582,
  "2ЭС5К_816": 65056,
  "2ЭС5К_817": 58853,
  "2ЭС5К_818": 49923,
  "2ЭС5К_819": 63508,
  "2ЭС5К_820": 11522,
  "2ЭС5К_821": 36227,
  "2ЭС5К_822": 67429,
  "2ЭС5К_823": 55206,
  "2ЭС5К_824": 51884,
  "2ЭС5К_825": 63556,
  "2ЭС5К_826": 37088,
  "2ЭС5К_827": 37320,
  "2ЭС5К_828": 45301,
  "2ЭС5К_829": 18737,
  "2ЭС5К_830": 24809,
  "3ЭС5К_814": 1932638,
  "3ЭС5К_815": 1955730,
  "3ЭС5К_816": 1883938,
  "3ЭС5К_817": 1624288,
  "3ЭС5К_818": 1880857,
  "3ЭС5К_819": 1764998,
  "3ЭС5К_820": 1855142,
  "3ЭС5К_821": 1927610,
  "3ЭС5К_822": 1866520,
  "3ЭС5К_823": 1821371,
  "3ЭС5К_824": 1977661,
  "3ЭС5К_825": 1945378,
  "3ЭС5К_826": 1888290,
  "3ЭС5К_827": 1898010,
  "3ЭС5К_828": 1949334,
  "3ЭС5К_829": 1813437,
  "3ЭС5К_830": 1873779,
  "3ЭС5К_831": 1818472,
  "3ЭС5К_832": 1874122,
  "3ЭС5К_833": 1846018,
  "3ЭС5К_834": 1840579,
  "3ЭС5К_835": 1890309,
  "3ЭС5К_836": 1779685,
  "3ЭС5К_837": 1799618,
  "3ЭС5К_838": 1811771,
  "3ЭС5К_839": 1510212,
  "3ЭС5К_840": 1472436,
  "3ЭС5К_841": 1484185,
  "3ЭС5К_842": 1405206,
  "3ЭС5К_843": 1481921,
  "3ЭС5К_844": 1455961,
  "3ЭС5К_845": 1415147,
  "3ЭС5К_846": 1465042,
  "3ЭС5К_847": 1431396,
  "3ЭС5К_848": 1480992,
  "3ЭС5К_849": 1448025,
  "3ЭС5К_850": 1459659,
  "3ЭС5К_851": 1442470,
  "3ЭС5К_852": 1416342,
  "3ЭС5К_853": 1346579,
  "3ЭС5К_854": 1372837,
  "3ЭС5К_855": 1215526,
  "3ЭС5К_856": 1417220,
  "3ЭС5К_857": 1377398,
  "3ЭС5К_858": 1436592,
  "3ЭС5К_859": 1344669,
  "3ЭС5К_860": 1361827,
  "3ЭС5К_861": 1264890,
  "3ЭС5К_862": 1425758,
  "3ЭС5К_863": 1369488,
  "3ЭС5К_864": 1379369,
  "3ЭС5К_865": 1424538,
  "3ЭС5К_866": 1428575,
  "3ЭС5К_867": 1377288,
  "3ЭС5К_868": 1555444,
  "3ЭС5К_869": 1457512,
  "3ЭС5К_870": 1438627,
  "3ЭС5К_871": 1486349,
  "3ЭС5К_872": 1463496,
  "3ЭС5К_873": 1445339,
  "3ЭС5К_874": 1459825,
  "3ЭС5К_875": 1457325,
  "3ЭС5К_876": 879349,
  "3ЭС5К_877": 830448,
  "3ЭС5К_878": 874120,
  "3ЭС5К_879": 879064,
  "3ЭС5К_880": 874230,
  "3ЭС5К_881": 847553,
  "3ЭС5К_882": 831829,
  "3ЭС5К_883": 906848,
  "3ЭС5К_884": 964343,
  "3ЭС5К_885": 956193,
  "3ЭС5К_886": 1362410,
  "3ЭС5К_887": 1356800,
  "3ЭС5К_888": 1337077,
  "3ЭС5К_889": 1336227,
  "3ЭС5К_890": 1341009,
  "3ЭС5К_891": 1304787,
  "3ЭС5К_892": 1300044,
  "3ЭС5К_893": 1317605,
  "3ЭС5К_894": 1377573,
  "3ЭС5К_895": 1331426,
  "3ЭС5К_896": 1444253,
  "3ЭС5К_897": 1456910,
  "3ЭС5К_898": 1477726,
  "3ЭС5К_899": 1430373,
  "3ЭС5К_900": 1452081,
  "3ЭС5К_901": 1468730,
  "3ЭС5К_902": 1523487,
  "3ЭС5К_905": 1381664,
  "3ЭС5К_906": 1470171,
  "3ЭС5К_907": 1491015,
  "3ЭС5К_908": 1414774,
  "3ЭС5К_909": 1417571,
  "3ЭС5К_910": 1428787,
  "3ЭС5К_911": 1366059,
  "3ЭС5К_912": 1394260,
  "3ЭС5К_913": 1436046,
  "3ЭС5К_914": 1431818,
  "3ЭС5К_915": 1415133,
  "3ЭС5К_916": 1407900,
  "3ЭС5К_917": 1413250,
  "3ЭС5К_918": 1391528,
  "3ЭС5К_919": 1344802,
  "3ЭС5К_920": 1377615,
  "3ЭС5К_921": 1342064,
  "3ЭС5К_922": 1407275,
  "3ЭС5К_923": 1368212,
  "3ЭС5К_924": 1359440,
  "3ЭС5К_925": 1384491,
  "3ЭС5К_926": 1341152,
  "3ЭС5К_927": 1376046,
  "3ЭС5К_928": 1431907,
  "3ЭС5К_929": 1317004,
  "3ЭС5К_930": 1360133,
  "3ЭС5К_931": 1381358,
  "3ЭС5К_932": 1293828,
  "3ЭС5К_933": 1381826,
  "3ЭС5К_934": 1379270,
  "3ЭС5К_935": 1376298,
  "3ЭС5К_936": 1372139,
  "3ЭС5К_937": 1357033,
  "3ЭС5К_938": 1331827,
  "3ЭС5К_939": 1310405,
  "3ЭС5К_940": 1311383,
  "3ЭС5К_941": 1086888,
  "3ЭС5К_942": 1372999,
  "3ЭС5К_943": 1363790,
  "3ЭС5К_944": 1376501,
  "3ЭС5К_945": 1351060,
  "3ЭС5К_946": 1373170,
  "3ЭС5К_947": 1305335,
  "3ЭС5К_948": 1404062,
  "3ЭС5К_949": 1291045,
  "3ЭС5К_950": 1272332,
  "3ЭС5К_951": 1349135,
  "3ЭС5К_952": 1327481,
  "3ЭС5К_953": 1365386,
  "3ЭС5К_954": 1334219,
  "3ЭС5К_955": 1369377,
  "3ЭС5К_956": 1381220,
  "3ЭС5К_957": 1368614,
  "3ЭС5К_958": 1383745,
  "3ЭС5К_959": 1368700,
  "3ЭС5К_960": 1348510,
  "3ЭС5К_961": 1326528,
  "3ЭС5К_962": 1316843,
  "3ЭС5К_963": 1371690,
  "3ЭС5К_964": 1318364,
  "3ЭС5К_965": 1321660,
  "3ЭС5К_966": 1362753,
  "3ЭС5К_967": 1335146,
  "3ЭС5К_968": 1334365,
  "3ЭС5К_969": 1291153,
  "3ЭС5К_970": 1347797,
  "3ЭС5К_971": 1321892,
  "3ЭС5К_972": 1360812,
  "3ЭС5К_973": 1281101,
  "3ЭС5К_974": 1329844,
  "3ЭС5К_975": 1347318,
  "3ЭС5К_976": 1349909,
  "3ЭС5К_977": 1311856,
  "3ЭС5К_978": 1346258,
  "3ЭС5К_979": 1323507,
  "3ЭС5К_980": 1360165,
  "3ЭС5К_981": 1365342,
  "3ЭС5К_982": 1322125,
  "3ЭС5К_983": 1340166,
  "3ЭС5К_984": 1298799,
  "3ЭС5К_985": 1307306,
  "3ЭС5К_986": 1335115,
  "3ЭС5К_987": 1290229,
  "3ЭС5К_988": 1334266,
  "3ЭС5К_989": 1313762,
  "3ЭС5К_990": 1328632,
  "3ЭС5К_991": 1309824,
  "3ЭС5К_992": 1316154,
  "3ЭС5К_993": 1341633,
  "3ЭС5К_994": 1316961,
  "3ЭС5К_995": 1290029,
  "3ЭС5К_996": 1334131,
  "3ЭС5К_997": 1286894,
  "3ЭС5К_998": 1280889,
  "3ЭС5К_999": 1315748,
  "3ЭС5К_1000": 1217992,
  "3ЭС5К_1006": 1225006,
  "3ЭС5К_1007": 1239265,
  "3ЭС5К_1008": 1289899,
  "3ЭС5К_1009": 1312568,
  "3ЭС5К_1010": 1261482,
  "3ЭС5К_1011": 1184583,
  "3ЭС5К_1012": 1324904,
  "3ЭС5К_1013": 1268674,
  "3ЭС5К_1014": 1095949,
  "3ЭС5К_1015": 1224475,
  "3ЭС5К_1016": 1296213,
  "3ЭС5К_1017": 1325551,
  "3ЭС5К_1018": 1243150,
  "3ЭС5К_1019": 1286223,
  "3ЭС5К_1020": 989715,
  "3ЭС5К_1021": 1289199,
  "3ЭС5К_1022": 1274243,
  "3ЭС5К_1023": 1267421,
  "3ЭС5К_1024": 1249122,
  "3ЭС5К_1025": 1264162,
  "3ЭС5К_1026": 1260970,
  "3ЭС5К_1027": 1255232,
  "3ЭС5К_1028": 1236405,
  "3ЭС5К_1029": 1239663,
  "3ЭС5К_1030": 1296635,
  "3ЭС5К_1031": 1278363,
  "3ЭС5К_1032": 1240188,
  "3ЭС5К_1033": 1200498,
  "3ЭС5К_1034": 1207581,
  "3ЭС5К_1035": 1236658,
  "3ЭС5К_1036": 1182871,
  "3ЭС5К_1037": 1205145,
  "3ЭС5К_1038": 1258039,
  "3ЭС5К_1039": 1207689,
  "3ЭС5К_1040": 1255081,
  "3ЭС5К_1041": 1171943,
  "3ЭС5К_1042": 1227719,
  "3ЭС5К_1043": 1104256,
  "3ЭС5К_1044": 1205660,
  "3ЭС5К_1045": 1251458,
  "3ЭС5К_1046": 1021839,
  "3ЭС5К_1047": 1212271,
  "3ЭС5К_1048": 1194222,
  "3ЭС5К_1049": 1126500,
  "3ЭС5К_1050": 1194183,
  "3ЭС5К_1051": 1192935,
  "3ЭС5К_1052": 1269425,
  "3ЭС5К_1053": 1189609,
  "3ЭС5К_1054": 1162719,
  "3ЭС5К_1055": 1181380,
  "3ЭС5К_1056": 1199332,
  "3ЭС5К_1057": 1116531,
  "3ЭС5К_1058": 1261159,
  "3ЭС5К_1059": 1224617,
  "3ЭС5К_1060": 1112329,
  "3ЭС5К_1061": 1102190,
  "3ЭС5К_1062": 1184589,
  "3ЭС5К_1063": 1204439,
  "3ЭС5К_1064": 1084269,
  "3ЭС5К_1065": 1109749,
  "3ЭС5К_1066": 1105405,
  "3ЭС5К_1067": 1161673,
  "3ЭС5К_1068": 1194554,
  "3ЭС5К_1069": 1098368,
  "3ЭС5К_1070": 1160443,
  "3ЭС5К_1071": 1123008,
  "3ЭС5К_1072": 1128157,
  "3ЭС5К_1073": 1135510,
  "3ЭС5К_1074": 1194866,
  "3ЭС5К_1075": 1200798,
  "3ЭС5К_1076": 1192195,
  "3ЭС5К_1077": 1174316,
  "3ЭС5К_1078": 1148329,
  "3ЭС5К_1079": 1190374,
  "3ЭС5К_1080": 1118412,
  "3ЭС5К_1081": 1195213,
  "3ЭС5К_1082": 1156893,
  "3ЭС5К_1083": 1169194,
  "3ЭС5К_1084": 1209251,
  "3ЭС5К_1085": 1150121,
  "3ЭС5К_1086": 1133013,
  "3ЭС5К_1087": 1104544,
  "3ЭС5К_1088": 1124855,
  "3ЭС5К_1089": 1185222,
  "3ЭС5К_1090": 1089611,
  "3ЭС5К_1091": 1153157,
  "3ЭС5К_1092": 1173838,
  "3ЭС5К_1093": 1195500,
  "3ЭС5К_1094": 1148342,
  "3ЭС5К_1095": 1150721,
  "3ЭС5К_1096": 1165990,
  "3ЭС5К_1097": 1117478,
  "3ЭС5К_1098": 1102596,
  "3ЭС5К_1099": 1127629,
  "3ЭС5К_1100": 1136592,
  "3ЭС5К_1101": 1142128,
  "3ЭС5К_1102": 1096587,
  "3ЭС5К_1103": 1158473,
  "3ЭС5К_1104": 1099385,
  "3ЭС5К_1105": 1147522,
  "3ЭС5К_1106": 1122990,
  "3ЭС5К_1107": 1102954,
  "3ЭС5К_1108": 1143338,
  "3ЭС5К_1109": 1091190,
  "3ЭС5К_1110": 1097623,
  "3ЭС5К_1111": 1090917,
  "3ЭС5К_1112": 1101493,
  "3ЭС5К_1113": 1140926,
  "3ЭС5К_1114": 1116557,
  "3ЭС5К_1115": 1093965,
  "3ЭС5К_1116": 1130718,
  "3ЭС5К_1117": 1124623,
  "3ЭС5К_1118": 1111878,
  "3ЭС5К_1119": 1114551,
  "3ЭС5К_1120": 1091771,
  "3ЭС5К_1121": 1099925,
  "3ЭС5К_1122": 1103487,
  "3ЭС5К_1123": 1115223,
  "3ЭС5К_1124": 1097029,
  "3ЭС5К_1125": 1119181,
  "3ЭС5К_1126": 1087243,
  "3ЭС5К_1127": 1081823,
  "3ЭС5К_1128": 1094714,
  "3ЭС5К_1129": 1092522,
  "3ЭС5К_1130": 1061446,
  "3ЭС5К_1131": 415885,
  "3ЭС5К_1132": 418561,
  "3ЭС5К_1133": 402445,
  "3ЭС5К_1134": 402729,
  "3ЭС5К_1135": 408292,
  "3ЭС5К_1136": 374406,
  "3ЭС5К_1137": 390026,
  "3ЭС5К_1138": 384566,
  "3ЭС5К_1139": 385525,
  "3ЭС5К_1140": 381274,
  "3ЭС5К_1141": 365086,
  "3ЭС5К_1142": 380684,
  "3ЭС5К_1143": 358856,
  "3ЭС5К_1144": 372058,
  "3ЭС5К_1145": 1041444,
  "3ЭС5К_1146": 1052939,
  "3ЭС5К_1147": 841174,
  "3ЭС5К_1148": 1079876,
  "3ЭС5К_1149": 1084648,
  "3ЭС5К_1150": 1041082,
  "3ЭС5К_1151": 1076260,
  "3ЭС5К_1152": 1041365,
  "3ЭС5К_1153": 1018040,
  "3ЭС5К_1154": 1047067,
  "3ЭС5К_1155": 1041344,
  "3ЭС5К_1156": 1054551,
  "3ЭС5К_1157": 996566,
  "3ЭС5К_1158": 1025980,
  "3ЭС5К_1159": 1083793,
  "3ЭС5К_1160": 1010036,
  "3ЭС5К_1161": 1095544,
  "3ЭС5К_1162": 1023509,
  "3ЭС5К_1163": 1070503,
  "3ЭС5К_1164": 1049767,
  "3ЭС5К_1165": 1026146,
  "3ЭС5К_1166": 1053979,
  "3ЭС5К_1167": 1046548,
  "3ЭС5К_1168": 1064747,
  "3ЭС5К_1169": 1037492,
  "3ЭС5К_1170": 1019589,
  "3ЭС5К_1171": 1066059,
  "3ЭС5К_1172": 1016238,
  "3ЭС5К_1173": 1060971,
  "3ЭС5К_1174": 1073748,
  "3ЭС5К_1175": 1055392,
  "3ЭС5К_1176": 1057391,
  "3ЭС5К_1177": 990908,
  "3ЭС5К_1178": 1057613,
  "3ЭС5К_1179": 1067035,
  "3ЭС5К_1180": 1013995,
  "3ЭС5К_1181": 1046764,
  "3ЭС5К_1182": 1015693,
  "3ЭС5К_1183": 1003456,
  "3ЭС5К_1184": 1023082,
  "3ЭС5К_1185": 993052,
  "3ЭС5К_1186": 1030528,
  "3ЭС5К_1187": 1021185,
  "3ЭС5К_1188": 1001653,
  "3ЭС5К_1189": 1016233,
  "3ЭС5К_1190": 1003095,
  "3ЭС5К_1191": 1030149,
  "3ЭС5К_1192": 1018817,
  "3ЭС5К_1193": 1052781,
  "3ЭС5К_1194": 1023661,
  "3ЭС5К_1195": 1002275,
  "3ЭС5К_1196": 988810,
  "3ЭС5К_1197": 1000329,
  "3ЭС5К_1198": 966406,
  "3ЭС5К_1199": 1006987,
  "3ЭС5К_1200": 1023462,
  "3ЭС5К_1201": 1025663,
  "3ЭС5К_1202": 1028546,
  "3ЭС5К_1203": 962555,
  "3ЭС5К_1204": 1018900,
  "3ЭС5К_1205": 1028558,
  "3ЭС5К_1206": 1014944,
  "3ЭС5К_1207": 1007767,
  "3ЭС5К_1208": 993299,
  "3ЭС5К_1209": 1026755,
  "3ЭС5К_1210": 1000838,
  "3ЭС5К_1211": 1014204,
  "3ЭС5К_1212": 1010800,
  "3ЭС5К_1213": 1008154,
  "3ЭС5К_1214": 737029,
  "3ЭС5К_1215": 1025475,
  "3ЭС5К_1216": 991697,
  "3ЭС5К_1217": 976578,
  "3ЭС5К_1218": 1003890,
  "3ЭС5К_1219": 1009820,
  "3ЭС5К_1220": 1018899,
  "3ЭС5К_1221": 1020314,
  "3ЭС5К_1222": 1007178,
  "3ЭС5К_1223": 989519,
  "3ЭС5К_1224": 1000552,
  "3ЭС5К_1225": 1000016,
  "3ЭС5К_1226": 996649,
  "3ЭС5К_1227": 1001576,
  "3ЭС5К_1228": 989374,
  "3ЭС5К_1229": 984749,
  "3ЭС5К_1230": 993680,
  "3ЭС5К_1231": 981186,
  "3ЭС5К_1232": 1005717,
  "3ЭС5К_1233": 989943,
  "3ЭС5К_1234": 995969,
  "3ЭС5К_1235": 972045,
  "3ЭС5К_1236": 1001028,
  "3ЭС5К_1237": 982560,
  "3ЭС5К_1238": 951758,
  "3ЭС5К_1239": 971603,
  "3ЭС5К_1240": 936767,
  "3ЭС5К_1241": 990081,
  "3ЭС5К_1242": 962403,
  "3ЭС5К_1243": 920181,
  "3ЭС5К_1244": 933835,
  "3ЭС5К_1245": 888624,
  "3ЭС5К_1246": 916887,
  "3ЭС5К_1247": 921875,
  "3ЭС5К_1248": 944079,
  "3ЭС5К_1249": 902573,
  "3ЭС5К_1250": 927862,
  "3ЭС5К_1251": 857593,
  "3ЭС5К_1252": 967948,
  "3ЭС5К_1253": 925338,
  "3ЭС5К_1254": 905450,
  "3ЭС5К_1255": 926180,
  "3ЭС5К_1256": 909873,
  "3ЭС5К_1257": 937109,
  "3ЭС5К_1258": 906688,
  "3ЭС5К_1259": 902227,
  "3ЭС5К_1260": 918969,
  "3ЭС5К_1261": 852166,
  "3ЭС5К_1262": 872575,
  "3ЭС5К_1263": 892154,
  "3ЭС5К_1264": 909148,
  "3ЭС5К_1265": 865753,
  "3ЭС5К_1266": 873460,
  "3ЭС5К_1267": 887359,
  "3ЭС5К_1268": 875680,
  "3ЭС5К_1269": 875497,
  "3ЭС5К_1270": 916684,
  "3ЭС5К_1271": 887845,
  "3ЭС5К_1272": 844212,
  "3ЭС5К_1273": 856809,
  "3ЭС5К_1274": 816592,
  "3ЭС5К_1275": 885520,
  "3ЭС5К_1276": 902124,
  "3ЭС5К_1277": 851071,
  "3ЭС5К_1278": 925194,
  "3ЭС5К_1279": 877803,
  "3ЭС5К_1280": 900969,
  "3ЭС5К_1281": 518321,
  "3ЭС5К_1282": 883775,
  "3ЭС5К_1283": 881413,
  "3ЭС5К_1284": 858971,
  "3ЭС5К_1285": 870696,
  "3ЭС5К_1286": 872784,
  "3ЭС5К_1287": 881189,
  "3ЭС5К_1288": 891962,
  "3ЭС5К_1289": 892689,
  "3ЭС5К_1290": 868342,
  "3ЭС5К_1291": 886358,
  "3ЭС5К_1292": 866585,
  "3ЭС5К_1293": 861715,
  "3ЭС5К_1294": 906578,
  "3ЭС5К_1295": 875176,
  "3ЭС5К_1296": 843018,
  "3ЭС5К_1297": 848129,
  "3ЭС5К_1298": 820592,
  "3ЭС5К_1299": 851466,
  "3ЭС5К_1300": 850029,
  "3ЭС5К_1301": 862844,
  "3ЭС5К_1302": 833910,
  "3ЭС5К_1303": 886148,
  "3ЭС5К_1304": 861447,
  "3ЭС5К_1305": 852899,
  "3ЭС5К_1306": 860140,
  "3ЭС5К_1307": 887987,
  "3ЭС5К_1308": 817620,
  "3ЭС5К_1309": 879460,
  "3ЭС5К_1310": 869840,
  "3ЭС5К_1311": 885989,
  "3ЭС5К_1312": 859380,
  "3ЭС5К_1313": 860978,
  "3ЭС5К_1314": 863888,
  "3ЭС5К_1315": 817737,
  "3ЭС5К_1316": 877149,
  "3ЭС5К_1317": 834275,
  "3ЭС5К_1318": 847215,
  "3ЭС5К_1319": 849276,
  "3ЭС5К_1320": 833477,
  "3ЭС5К_1321": 864221,
  "3ЭС5К_1322": 829665,
  "3ЭС5К_1323": 839931,
  "3ЭС5К_1324": 816616,
  "3ЭС5К_1325": 856127,
  "3ЭС5К_1326": 848418,
  "3ЭС5К_1327": 857483,
  "3ЭС5К_1328": 856189,
  "3ЭС5К_1329": 874460,
  "3ЭС5К_1330": 836569,
  "3ЭС5К_1331": 828485,
  "3ЭС5К_1332": 879018,
  "3ЭС5К_1333": 782035,
  "3ЭС5К_1334": 842549,
  "3ЭС5К_1335": 859840,
  "3ЭС5К_1336": 821408,
  "3ЭС5К_1337": 842004,
  "3ЭС5К_1338": 804589,
  "3ЭС5К_1339": 823089,
  "3ЭС5К_1340": 846113,
  "3ЭС5К_1341": 806991,
  "3ЭС5К_1342": 828230,
  "3ЭС5К_1343": 819269,
  "3ЭС5К_1344": 814077,
  "3ЭС5К_1345": 803400,
  "3ЭС5К_1346": 764799,
  "3ЭС5К_1347": 795026,
  "3ЭС5К_1348": 819921,
  "3ЭС5К_1349": 817362,
  "3ЭС5К_1350": 821303,
  "3ЭС5К_1351": 774939,
  "3ЭС5К_1352": 771489,
  "3ЭС5К_1353": 776766,
  "3ЭС5К_1354": 774064,
  "3ЭС5К_1355": 830717,
  "3ЭС5К_1356": 739445,
  "3ЭС5К_1357": 784797,
  "3ЭС5К_1358": 844121,
  "3ЭС5К_1359": 785609,
  "3ЭС5К_1360": 813366,
  "3ЭС5К_1361": 790822,
  "3ЭС5К_1362": 773694,
  "3ЭС5К_1363": 798406,
  "3ЭС5К_1364": 751676,
  "3ЭС5К_1365": 762414,
  "3ЭС5К_1366": 790923,
  "3ЭС5К_1367": 728387,
  "3ЭС5К_1368": 801832,
  "3ЭС5К_1369": 763865,
  "3ЭС5К_1371": 780397,
  "3ЭС5К_1372": 806105,
  "3ЭС5К_1373": 786866,
  "3ЭС5К_1374": 666305,
  "3ЭС5К_1375": 817018,
  "3ЭС5К_1376": 742938,
  "3ЭС5К_1377": 708413,
  "3ЭС5К_1378": 733870,
  "3ЭС5К_1379": 764943,
  "3ЭС5К_1380": 771160,
  "3ЭС5К_1381": 776983,
  "3ЭС5К_1382": 757204,
  "3ЭС5К_1383": 754209,
  "3ЭС5К_1384": 755146,
  "3ЭС5К_1385": 731475,
  "3ЭС5К_1386": 754055,
  "3ЭС5К_1387": 751161,
  "3ЭС5К_1388": 770508,
  "3ЭС5К_1389": 762312,
  "3ЭС5К_1390": 709098,
  "3ЭС5К_1391": 633482,
  "3ЭС5К_1392": 694305,
  "3ЭС5К_1393": 753875,
  "3ЭС5К_1394": 745863,
  "3ЭС5К_1395": 731467,
  "3ЭС5К_1396": 738015,
  "3ЭС5К_1397": 733474,
  "3ЭС5К_1398": 741653,
  "3ЭС5К_1399": 718596,
  "3ЭС5К_1400": 737759,
  "3ЭС5К_1401": 733804,
  "3ЭС5К_1402": 741479,
  "3ЭС5К_1403": 706966,
  "3ЭС5К_1404": 739615,
  "3ЭС5К_1405": 698701,
  "3ЭС5К_1406": 546805,
  "3ЭС5К_1407": 725970,
  "3ЭС5К_1408": 731328,
  "3ЭС5К_1409": 683595,
  "3ЭС5К_1410": 684480,
  "3ЭС5К_1411": 751567,
  "3ЭС5К_1412": 755531,
  "3ЭС5К_1413": 703575,
  "3ЭС5К_1414": 676266,
  "3ЭС5К_1415": 715379,
  "3ЭС5К_1416": 709468,
  "3ЭС5К_1417": 698628,
  "3ЭС5К_1418": 649250,
  "3ЭС5К_1419": 716994,
  "3ЭС5К_1420": 724858,
  "3ЭС5К_1421": 671771,
  "3ЭС5К_1422": 644583,
  "3ЭС5К_1423": 658507,
  "3ЭС5К_1424": 679367,
  "3ЭС5К_1425": 683129,
  "3ЭС5К_1426": 678581,
  "3ЭС5К_1427": 703183,
  "3ЭС5К_1428": 698429,
  "3ЭС5К_1429": 657884,
  "3ЭС5К_1430": 600534,
  "3ЭС5К_1431": 667779,
  "3ЭС5К_1432": 640654,
  "3ЭС5К_1433": 639073,
  "3ЭС5К_1434": 651095,
  "3ЭС5К_1435": 694730,
  "3ЭС5К_1436": 634520,
  "3ЭС5К_1437": 673567,
  "3ЭС5К_1438": 657442,
  "3ЭС5К_1439": 646508,
  "3ЭС5К_1440": 667323,
  "3ЭС5К_1441": 669493,
  "3ЭС5К_1442": 646933,
  "3ЭС5К_1443": 633375,
  "3ЭС5К_1444": 652618,
  "3ЭС5К_1445": 640523,
  "3ЭС5К_1446": 635506,
  "3ЭС5К_1447": 642514,
  "3ЭС5К_1448": 612056,
  "3ЭС5К_1449": 638216,
  "3ЭС5К_1450": 620606,
  "3ЭС5К_1451": 638012,
  "3ЭС5К_1452": 614010,
  "3ЭС5К_1453": 584225,
  "3ЭС5К_1454": 610762,
  "3ЭС5К_1455": 641309,
  "3ЭС5К_1456": 606052,
  "3ЭС5К_1457": 606830,
  "3ЭС5К_1458": 619739,
  "3ЭС5К_1459": 611850,
  "3ЭС5К_1460": 586970,
  "3ЭС5К_1461": 584153,
  "3ЭС5К_1462": 573469,
  "3ЭС5К_1463": 557796,
  "3ЭС5К_1464": 616338,
  "3ЭС5К_1465": 582253,
  "3ЭС5К_1466": 573821,
  "3ЭС5К_1467": 606300,
  "3ЭС5К_1468": 580755,
  "3ЭС5К_1469": 579009,
  "3ЭС5К_1470": 566908,
  "3ЭС5К_1471": 547399,
  "3ЭС5К_1472": 541762,
  "3ЭС5К_1473": 538114,
  "3ЭС5К_1474": 616818,
  "3ЭС5К_1475": 591225,
  "3ЭС5К_1476": 587126,
  "3ЭС5К_1477": 584256,
  "3ЭС5К_1478": 580793,
  "3ЭС5К_1479": 574133,
  "3ЭС5К_1480": 588169,
  "3ЭС5К_1481": 607974,
  "3ЭС5К_1482": 556662,
  "3ЭС5К_1483": 532172,
  "3ЭС5К_1484": 533843,
  "3ЭС5К_1485": 559593,
  "3ЭС5К_1486": 560341,
  "3ЭС5К_1487": 536879,
  "3ЭС5К_1488": 543229,
  "3ЭС5К_1489": 599609,
  "3ЭС5К_1490": 551832,
  "3ЭС5К_1491": 572924,
  "3ЭС5К_1492": 552155,
  "3ЭС5К_1493": 573526,
  "3ЭС5К_1494": 585178,
  "3ЭС5К_1495": 547145,
  "3ЭС5К_1496": 532521,
  "3ЭС5К_1497": 520162,
  "3ЭС5К_1498": 573201,
  "3ЭС5К_1499": 548486,
  "3ЭС5К_1500": 566475,
  "3ЭС5К_1501": 578160,
  "3ЭС5К_1502": 549475,
  "3ЭС5К_1503": 552863,
  "3ЭС5К_1504": 549932,
  "3ЭС5К_1505": 567759,
  "3ЭС5К_1506": 551835,
  "3ЭС5К_1507": 568389,
  "3ЭС5К_1508": 561347,
  "3ЭС5К_1509": 563375,
  "3ЭС5К_1510": 535773,
  "3ЭС5К_1511": 541284,
  "3ЭС5К_1512": 551774,
  "3ЭС5К_1513": 541381,
  "3ЭС5К_1514": 539746,
  "3ЭС5К_1515": 521718,
  "3ЭС5К_1516": 529098,
  "3ЭС5К_1517": 511293,
  "3ЭС5К_1518": 530636,
  "3ЭС5К_1519": 528562,
  "3ЭС5К_1520": 528676,
  "3ЭС5К_1521": 515072,
  "3ЭС5К_1522": 508108,
  "3ЭС5К_1523": 523578,
  "3ЭС5К_1524": 526675,
  "3ЭС5К_1525": 486772,
  "3ЭС5К_1526": 502091,
  "3ЭС5К_1527": 438795,
  "3ЭС5К_1528": 496535,
  "3ЭС5К_1529": 497448,
  "3ЭС5К_1530": 492164,
  "3ЭС5К_1531": 479333,
  "3ЭС5К_1532": 501592,
  "3ЭС5К_1533": 499789,
  "3ЭС5К_1534": 476245,
  "3ЭС5К_1535": 517518,
  "3ЭС5К_1536": 502559,
  "3ЭС5К_1537": 486255,
  "3ЭС5К_1538": 494655,
  "3ЭС5К_1539": 479787,
  "3ЭС5К_1540": 470745,
  "3ЭС5К_1541": 460014,
  "3ЭС5К_1542": 461734,
  "3ЭС5К_1543": 466015,
  "3ЭС5К_1544": 473543,
  "3ЭС5К_1545": 455638,
  "3ЭС5К_1546": 468021,
  "3ЭС5К_1547": 464918,
  "3ЭС5К_1548": 462003,
  "3ЭС5К_1549": 477688,
  "3ЭС5К_1550": 450357,
  "3ЭС5К_1551": 431875,
  "3ЭС5К_1552": 452945,
  "3ЭС5К_1553": 449577,
  "3ЭС5К_1554": 453120,
  "3ЭС5К_1555": 446472,
  "3ЭС5К_1556": 446328,
  "3ЭС5К_1557": 443594,
  "3ЭС5К_1558": 397613,
  "3ЭС5К_1559": 452184,
  "3ЭС5К_1560": 427739,
  "3ЭС5К_1561": 421291,
  "3ЭС5К_1562": 434123,
  "3ЭС5К_1563": 408940,
  "3ЭС5К_1564": 427343,
  "3ЭС5К_1565": 428429,
  "3ЭС5К_1566": 458697,
  "3ЭС5К_1567": 532883,
  "3ЭС5К_1568": 504747,
  "3ЭС5К_1569": 502066,
  "3ЭС5К_1570": 513101,
  "3ЭС5К_1571": 512440,
  "3ЭС5К_1572": 513352,
  "3ЭС5К_1573": 527160,
  "3ЭС5К_1574": 516440,
  "3ЭС5К_1575": 521564,
  "3ЭС5К_1576": 336354,
  "3ЭС5К_1577": 339510,
  "3ЭС5К_1578": 350384,
  "3ЭС5К_1579": 351131,
  "3ЭС5К_1580": 342099,
  "3ЭС5К_1581": 345755,
  "3ЭС5К_1582": 351796,
  "3ЭС5К_1583": 361833,
  "3ЭС5К_1584": 358898,
  "3ЭС5К_1585": 352278,
  "3ЭС5К_1586": 340393,
  "3ЭС5К_1587": 368606,
  "3ЭС5К_1588": 339187,
  "3ЭС5К_1589": 341559,
  "3ЭС5К_1590": 329196,
  "3ЭС5К_1591": 330382,
  "3ЭС5К_1592": 326779,
  "3ЭС5К_1593": 342273,
  "3ЭС5К_1594": 312680,
  "3ЭС5К_1595": 316042,
  "3ЭС5К_1596": 298624,
  "3ЭС5К_1597": 293886,
  "3ЭС5К_1598": 309932,
  "3ЭС5К_1599": 295627,
  "3ЭС5К_1600": 310039,
  "3ЭС5К_1601": 298868,
  "3ЭС5К_1602": 292334,
  "3ЭС5К_1603": 283748,
  "3ЭС5К_1604": 286079,
  "3ЭС5К_1605": 254154,
  "3ЭС5К_1606": 261848,
  "3ЭС5К_1607": 250611,
  "3ЭС5К_1608": 269800,
  "3ЭС5К_1609": 257339,
  "3ЭС5К_1610": 261625,
  "3ЭС5К_1611": 253104,
  "3ЭС5К_1612": 263370,
  "3ЭС5К_1613": 260548,
  "3ЭС5К_1614": 240477,
  "3ЭС5К_1615": 245553,
  "3ЭС5К_1616": 248106,
  "3ЭС5К_1617": 233092,
  "3ЭС5К_1618": 232415,
  "3ЭС5К_1619": 236759,
  "3ЭС5К_1620": 236390,
  "3ЭС5К_1621": 224844,
  "3ЭС5К_1622": 226842,
  "3ЭС5К_1623": 202790,
  "3ЭС5К_1624": 187746,
  "3ЭС5К_1625": 202038,
  "3ЭС5К_1626": 206410,
  "3ЭС5К_1627": 196321,
  "3ЭС5К_1628": 198615,
  "3ЭС5К_1629": 179274,
  "3ЭС5К_1630": 170923,
  "3ЭС5К_1631": 164470,
  "3ЭС5К_1632": 172583,
  "3ЭС5К_1633": 190405,
  "3ЭС5К_1634": 168003,
  "3ЭС5К_1635": 174665,
  "3ЭС5К_1636": 157207,
  "3ЭС5К_1637": 178855,
  "3ЭС5К_1638": 162542,
  "3ЭС5К_1639": 153956,
  "3ЭС5К_1640": 153509,
  "3ЭС5К_1641": 166941,
  "3ЭС5К_1642": 160867,
  "3ЭС5К_1643": 154061,
  "3ЭС5К_1644": 129910,
  "3ЭС5К_1645": 142010,
  "3ЭС5К_1646": 135643,
  "3ЭС5К_1647": 128711,
  "3ЭС5К_1648": 132519,
  "3ЭС5К_1649": 136770,
  "3ЭС5К_1650": 137633,
  "3ЭС5К_1651": 124010,
  "3ЭС5К_1652": 95057,
  "3ЭС5К_1653": 105304,
  "3ЭС5К_1654": 101372,
  "3ЭС5К_1655": 103237,
  "3ЭС5К_1656": 101367,
  "3ЭС5К_1657": 109891,
  "3ЭС5К_1658": 96199,
  "3ЭС5К_1659": 86884,
  "3ЭС5К_1660": 93599,
  "3ЭС5К_1661": 97697,
  "3ЭС5К_1662": 91776,
  "3ЭС5К_1663": 97125,
  "3ЭС5К_1664": 83064,
  "3ЭС5К_1665": 94152,
  "3ЭС5К_1666": 90784,
  "3ЭС5К_1667": 77933,
  "3ЭС5К_1668": 80696,
  "3ЭС5К_1669": 71722,
  "3ЭС5К_1670": 72187,
  "3ЭС5К_1671": 68589,
  "3ЭС5К_1672": 64323,
  "3ЭС5К_1673": 64955,
  "3ЭС5К_1674": 58165,
  "3ЭС5К_1675": 61494,
  "3ЭС5К_1676": 55207,
  "3ЭС5К_1677": 54412,
  "3ЭС5К_1678": 45881,
  "3ЭС5К_1679": 44941,
  "3ЭС5К_1680": 52176,
  "3ЭС5К_1681": 48915,
  "3ЭС5К_1682": 42120,
  "3ЭС5К_1683": 39295,
  "3ЭС5К_1684": 36690,
  "3ЭС5К_1685": 38318,
  "3ЭС5К_1686": 28965,
  "3ЭС5К_1687": 29977,
  "3ЭС5К_1688": 30487,
  "3ЭС5К_1689": 21500,
  "3ЭС5К_1690": 23208,
  "3ЭС5К_1691": 22387,
  "3ЭС5К_1692": 17749,
  "3ЭС5К_1693": 9894,
  "3ЭС5К_1694": 11874,
  "3ЭС5К_1695": 12537,
  "3ЭС5К_1696": 13544,
  "4ЭС5К_4": 1304805,
  "4ЭС5К_33": 750713,
  "4ЭС5К_34": 872985,
  "4ЭС5К_35": 870033,
  "4ЭС5К_36": 364180,
  "4ЭС5К_37": 865346,
  "4ЭС5К_38": 187975,
  "4ЭС5К_39": 430521,
  "4ЭС5К_40": 751573,
  "4ЭС5К_41": 716617,
  "4ЭС5К_42": 398391,
  "4ЭС5К_43": 599541,
  "4ЭС5К_44": 368432,
  "4ЭС5К_45": 567669,
  "4ЭС5К_46": 595860,
  "4ЭС5К_47": 585619,
  "4ЭС5К_48": 566301,
  "4ЭС5К_49": 535846,
  "4ЭС5К_50": 545717,
  "4ЭС5К_51": 544915,
  "4ЭС5К_52": 538623,
  "4ЭС5К_53": 533977,
  "4ЭС5К_54": 528722,
  "4ЭС5К_55": 499516,
  "4ЭС5К_56": 497533,
  "4ЭС5К_57": 497029,
  "4ЭС5К_58": 490583,
  "4ЭС5К_59": 517357,
  "4ЭС5К_60": 478551,
  "4ЭС5К_61": 499954,
  "4ЭС5К_62": 480877,
  "4ЭС5К_63": 490876,
  "4ЭС5К_64": 481279,
  "4ЭС5К_65": 456112,
  "4ЭС5К_66": 461355,
  "4ЭС5К_67": 473274,
  "4ЭС5К_68": 438660,
  "4ЭС5К_69": 427031,
  "4ЭС5К_70": 427865,
  "4ЭС5К_71": 403495,
  "4ЭС5К_72": 380923,
  "4ЭС5К_73": 407401,
  "4ЭС5К_74": 385553,
  "4ЭС5К_75": 365849,
  "4ЭС5К_76": 354457,
  "4ЭС5К_77": 342513,
  "4ЭС5К_78": 341518,
  "4ЭС5К_79": 317568,
  "4ЭС5К_80": 331068,
  "4ЭС5К_81": 310416,
  "4ЭС5К_82": 265077,
  "4ЭС5К_83": 267445,
  "4ЭС5К_84": 257846,
  "4ЭС5К_85": 258945,
  "4ЭС5К_86": 22480,
  "4ЭС5К_87": 8004
};

/* ========================================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ПРОБЕГОМ
   ======================================================================== */
function getMileageFromData(type, number) {
    if (!type || !number) return null;
    const key = type + '_' + number;
    return MILEAGE_DATA[key] || null;
}

function isValidMileage(mileageStr, type, number) {
    const val = parseInt(mileageStr, 10);
    if (isNaN(val) || val < 0) return false;
    const tableVal = getMileageFromData(type, number);
    if (tableVal !== null) {
        return val >= tableVal;
    } else {
        return val > 0;
    }
}

function getMileageError(mileageStr, type, number) {
    const val = parseInt(mileageStr, 10);
    if (isNaN(val) || val < 0) return 'Введите корректное число (≥ 0)';
    const tableVal = getMileageFromData(type, number);
    if (tableVal !== null) {
        if (val < tableVal) return \`Пробег должен быть ≥ \${tableVal} км (по данным завода)\`;
        return null;
    } else {
        if (val <= 0) return 'Пробег должен быть больше 0 (данные отсутствуют)';
        return null;
    }
}

function kzcNumbersForType(type) {
  if (!type || !LOCOMOTIVE_DATA[type]) return [];
  return Object.keys(LOCOMOTIVE_DATA[type]).sort((a,b)=>{
    const na=parseInt(a,10), nb=parseInt(b,10);
    if (!isNaN(na) && !isNaN(nb) && na!==nb) return na-nb;
    return a.localeCompare(b);
  });
}

function kzcRecord(type, number) {
  if (!type || !number || !LOCOMOTIVE_DATA[type]) return null;
  const depot = LOCOMOTIVE_DATA[type][number];
  if (!depot) return null;
  const places = (typeof LOCOMOTIVE_PLACES !== 'undefined' && LOCOMOTIVE_PLACES[type + '|' + number]) ? [LOCOMOTIVE_PLACES[type + '|' + number]] : (DEPOT_PLACES[depot] || []);
  return { depot, places };
}

const LOCOMOTIVE_TYPES = Object.keys(LOCOMOTIVE_DATA);

/* ========================================================================
   ФУНКЦИИ ДЛЯ РАБОТЫ С СЕКЦИЯМИ
   ======================================================================== */
function getMaxSectionsForType(type) {
  if (type === '2ЭС5К') return 2;
  if (type === '3ЭС5К') return 3;
  if (type === '4ЭС5К') return 4;
  return 4;
}
function getDefaultSectionsCount(type) { return getMaxSectionsForType(type); }
function getSections(type) {
  const count = getDefaultSectionsCount(type);
  const sections = [];
  for (let i = 1; i <= count; i++) {
    let typeName = '';
    if (i <= 2) typeName = 'кабина';
    else typeName = 'бустер';
    sections.push({ label: \`Секция №\${i}\`, typeName: typeName });
  }
  return sections;
}

/* ========================================================================
   ОПРЕДЕЛЕНИЯ ОБОРУДОВАНИЯ – ТОЛЬКО ГИДРОДЕМПФЕР (с фото)
   ======================================================================== */
function f(key, label, type, options, ok, hint, extra) {
  return Object.assign({ key, label, type, options, ok, hint }, extra || {});
}
function sel(key, label, options, ok, hint) { return f(key, label, 'select', options, ok, hint, { photo: true }); }
function sel1(key, label, options, ok, hint) { return f(key, label, 'select', options, ok, hint, { calc: false, photo: true }); }
function txt(key, label, hint, extra) { return f(key, label, 'text', null, null, hint, Object.assign({ photo: true }, extra || {})); }

let EQUIPMENT = [];
let sections = [];
let ALL_POSSIBLE_TYPES = [];

function getSectionsCount(type) { return getDefaultSectionsCount(type); }

function buildEquipment(type) {
  EQUIPMENT = [];
  ALL_POSSIBLE_TYPES = [];
  if (!type || type === '') return;
  sections = getSections(type).map(s => s.label);

  const allBlocks = ['677-1','677-1','677-3','677-3','677-3','677-3','678','678','678','678'];
  ALL_POSSIBLE_TYPES = Array.from(new Set(allBlocks)).sort();

  EQUIPMENT.push({
    id: 'gidro',
    title: 'Гидродемпфер',
    fields: [
      txt('zav', 'Заводской № неисправного ГД', 'Введите номер'),
      sel('f1', 'Наличие запотеваний', ['Да','Нет'], ['Нет'], 'Без течи'),
      sel('state', 'Состояние', ['Исправен','Неисправен'], ['Исправен'], 'Выбрать состояние'),
      sel1('f2', 'Причина браковки', ['Течь масла','Механическое повреждение','Не соответствует ТУ (ТР-250)']),
      sel1('f3', 'Соответствие характеристик на стенде', ['Соответствует','Не соответствует','Не проводилось']),
      sel1('f4', 'Способ устранения', ['Ревизия на стенде','Замена на новый','Не проводилось']),
      txt('f5', 'Проведённые работы', 'Указать работы (только при ревизии)'),
    ],
    instances() {
      const out = [];
      const blocks = allBlocks;
      const telezhki = ['1','2'];
      for (const sec of sections) {
        for (const telezhka of telezhki) {
          for (const blk of blocks) {
            out.push({ section: sec, group: 'Тележка ' + telezhka, block: blk });
          }
        }
      }
      return out;
    }
  });
}

/* ========================================================================
   СОСТОЯНИЕ / ХРАНЕНИЕ
   ======================================================================== */
let LS_KEY = 'checklist_hydro_v1';
let STATE = { 
  general: { 
    type: '', 
    selectedSections: [],    // пусто = ничего не выбрано
    selectedTelezhki: [],    // пусто = ничего не выбрано
    selectedTypes: [],       // пусто = ничего не выбрано
    notice: '',
    date: '',
    number: '',
    depot: '',
    place: '',
    mileage: ''
  }, 
  values: {}, 
  selected: [],
  changeLog: []
};

if (typeof __EMBEDDED_STATE !== 'undefined' && __EMBEDDED_STATE) {
  STATE = __EMBEDDED_STATE;
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      STATE = Object.assign({ 
        general: { 
          type: '', 
          selectedSections: [],
          selectedTelezhki: [],
          selectedTypes: [],
          notice: '',
          date: '',
          number: '',
          depot: '',
          place: '',
          mileage: ''
        }, 
        values: {}, 
        selected: [],
        changeLog: []
      }, parsed);
      if (!STATE.general.selectedTelezhki) STATE.general.selectedTelezhki = [];
      if (!STATE.general.selectedTypes) STATE.general.selectedTypes = [];
      if (!STATE.general.selectedSections) STATE.general.selectedSections = [];
    }
  } catch (e) { console.warn('Не удалось загрузить сохранённые данные', e); }
}
var __psOrigLoad=loadState;
loadState=function(){var prev=STATE;var r=__psOrigLoad.apply(this,arguments);
  try{if(prev&&prev!==STATE&&prev.values&&STATE&&STATE.values){for(var iid in prev.values){var o=prev.values[iid];if(!o)continue;for(var k in o){if(k.slice(-6)==='_photo'&&o[k]){if(!STATE.values[iid])STATE.values[iid]={};if(!STATE.values[iid][k])STATE.values[iid][k]=o[k];}}}}}catch(e){}
  __psRestore();return r;};

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



function fullClearState() { __psClear();
  localStorage.removeItem(LS_KEY);
  STATE = { 
    general: { 
      type: '', 
      selectedSections: [],
      selectedTelezhki: [],
      selectedTypes: [],
      notice: '',
      date: '',
      number: '',
      depot: '',
      place: '',
      mileage: ''
    }, 
    values: {}, 
    selected: [],
    changeLog: []
  };
  buildEquipment('');
  STATE.selected = [];
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 1600);
}

/* ========================================================================
   ФУНКЦИИ ДЛЯ ФОТО (из комплексного чек-листа)
   ======================================================================== */
function compressImage(file, maxSize, quality, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      let width = img.width;
      let height = img.height;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updatePhotoRequirementForField(iid, fieldKey, card) {
  if (!card) card = document.querySelector(\`.card-item[data-iid="\${CSS.escape(iid)}"]\`);
  if (!card) return;
  const row = card.querySelector(\`.field-row[data-field-key="\${fieldKey}"]\`);
  if (!row) return;
  const photoArea = row.querySelector('.photo-area');
  if (!photoArea) return;
  const btns = photoArea.querySelectorAll('.photo-btn');
  const val = getVal(iid, fieldKey);
  const photoData = getVal(iid, fieldKey + '_photo');

  let required = false;
  if (fieldKey === 'f1') {
    required = (val === 'Да'); // мигает при "Да"
  } else if (fieldKey === 'state') {
    required = (val === 'Неисправен');
  } else if (fieldKey === 'f2') {
    required = (val && val !== '' && val !== '— выбрать');
  } else if (fieldKey === 'f3') {
    required = (val && val !== '' && val !== '— выбрать' && val !== 'Не проводилось');
  } else {
    required = false;
  }

  btns.forEach(btn => {
    btn.classList.toggle('photo-required', required && !photoData);
    btn.title = required && !photoData ? 'Требуется фото' : 'Добавить фото';
  });
}

function addPhotoSupport(row, field, iid) {
  const photoKey = field.key + '_photo';
  const photoData = getVal(iid, photoKey);

  const photoWrap = document.createElement('div');
  photoWrap.className = 'photo-area';

  const preview = document.createElement('img');
  preview.className = 'photo-preview';
  preview.style.display = photoData ? 'block' : 'none';
  preview.alt = 'Фото';

  const cameraInput = document.createElement('input');
  cameraInput.type = 'file';
  cameraInput.accept = 'image/*';
  cameraInput.capture = 'environment';
  cameraInput.style.display = 'none';

  const galleryInput = document.createElement('input');
  galleryInput.type = 'file';
  galleryInput.accept = 'image/*';
  galleryInput.style.display = 'none';

  const cameraBtn = document.createElement('button');
  cameraBtn.className = 'photo-btn';
  cameraBtn.textContent = '📸 Сделать фото';

  const galleryBtn = document.createElement('button');
  galleryBtn.className = 'photo-btn';
  galleryBtn.textContent = '🖼️ Выбрать из галереи';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'photo-delete';
  deleteBtn.textContent = '✕';
  deleteBtn.style.display = photoData ? 'inline-block' : 'none';

  if (photoData) {
    preview.src = photoData;
  }

  function handleFile(file) {
    if (!file) return;
    cameraBtn.textContent = '⏳';
    cameraBtn.disabled = true;
    galleryBtn.disabled = true;
    compressImage(file, 800, 0.7, function(compressedDataUrl) {
      setVal(iid, photoKey, compressedDataUrl);
      preview.src = compressedDataUrl;
      preview.style.display = 'block';
      deleteBtn.style.display = 'inline-block';
      requestAnimationFrame(() => {
        cameraBtn.textContent = '📸 Сделать фото';
        cameraBtn.disabled = false;
        galleryBtn.disabled = false;
        updatePhotoRequirementForField(iid, field.key);
        showToast('Фото прикреплено');
        updateStats();
      });
    });
  }

  cameraBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cameraInput.click();
  });

  galleryBtn.addEventListener('click', (e) => {
    e.preventDefault();
    galleryInput.click();
  });

  cameraInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) handleFile(file);
    this.value = '';
  });

  galleryInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) handleFile(file);
    this.value = '';
  });

  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setVal(iid, photoKey, '');
    preview.src = '';
    preview.style.display = 'none';
    deleteBtn.style.display = 'none';
    requestAnimationFrame(() => {
      updatePhotoRequirementForField(iid, field.key);
      showToast('Фото удалено');
      updateStats();
    });
  });

  photoWrap.appendChild(preview);
  photoWrap.appendChild(cameraBtn);
  photoWrap.appendChild(galleryBtn);
  photoWrap.appendChild(deleteBtn);
  photoWrap.appendChild(cameraInput);
  photoWrap.appendChild(galleryInput);
  row.appendChild(photoWrap);

  setTimeout(() => {
    updatePhotoRequirementForField(iid, field.key);
  }, 50);
}

/* ========================================================================
   РЕНДЕР: ОБЩИЕ ДАННЫЕ + ВЫБОР СЕКЦИЙ + ТЕЛЕЖЕК (ТИПЫ ВЫНЕСЕНЫ) + ВАЛИДАЦИЯ ПРОБЕГА
   ======================================================================== */
function fillSelectOptions(select, options, currentVal, placeholderText) {
  select.innerHTML = '';
  const blank = document.createElement('option');
  blank.value = '';
  blank.textContent = placeholderText || '— выберите —';
  select.appendChild(blank);
  for (const o of options) {
    const op = document.createElement('option');
    op.value = o;
    op.textContent = o;
    select.appendChild(op);
  }
  select.value = (currentVal !== undefined && currentVal !== null && options.includes(currentVal)) ? currentVal : '';
}

function refreshChain(changedKey) {
  const type = STATE.general.type || '';
  const number = STATE.general.number || '';
  if (changedKey === 'type') {
    STATE.general.number = '';
    STATE.general.depot = '';
    STATE.general.place = '';
  }
  if (changedKey === 'number') {
    const rec = kzcRecord(type, number);
    STATE.general.depot = rec ? rec.depot : '';
    STATE.general.place = '';
  }
}

function computeAutoNotice() {
  const mileage = parseInt(STATE.general.mileage) || 0;
  if (mileage >= 300000) return 'Нет';
  for (const iid in STATE.values) {
    const row = STATE.values[iid];
    if (row.state === 'Неисправен' && row.f2 && row.f2 !== '') {
      return 'Да';
    }
  }
  return 'Нет';
}

function getNoticeValue() {
  if (STATE.general.notice && STATE.general.notice !== '') {
    return STATE.general.notice;
  }
  return computeAutoNotice();
}

function renderGeneral() {
  const grid = document.getElementById('generalGrid');
  grid.innerHTML = '';
  const type = STATE.general.type || '';
  const number = STATE.general.number || '';
  const rec = kzcRecord(type, number);

  // Дата
  const dateWrap = document.createElement('div');
  dateWrap.className = 'field';
  const dateLabel = document.createElement('label');
  dateLabel.textContent = 'Дата осмотра';
  dateWrap.appendChild(dateLabel);
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = STATE.general.date || '';
  dateInput.addEventListener('input', () => { STATE.general.date = dateInput.value; saveState(true); updateStats(); });
  dateInput.addEventListener('change', () => { STATE.general.date = dateInput.value; saveState(true); updateStats(); });
  dateWrap.appendChild(dateInput);
  grid.appendChild(dateWrap);

  // Тип
  const typeWrap = document.createElement('div');
  typeWrap.className = 'field';
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Тип электровоза';
  typeWrap.appendChild(typeLabel);
  const typeSelect = document.createElement('select');
  fillSelectOptions(typeSelect, LOCOMOTIVE_TYPES, type, '— выберите тип —');
  typeSelect.addEventListener('change', function() {
    const val = this.value;
    STATE.general.type = val;
    refreshChain('type');
    document.getElementById('locomotiveTypeTag').textContent = val || '—';
    buildEquipment(val);
    STATE.selected = EQUIPMENT.map(e => e.id);
    STATE.general.selectedTypes = [];
    STATE.general.selectedTelezhki = [];
    STATE.general.selectedSections = [];
    STATE.general.notice = '';
    saveState(true);
    renderGeneral();
    renderTypePicker();
    renderEquip();
    if (val) showToast('Тип электровоза изменён на ' + val);
    else showToast('Выберите тип электровоза');
  });
  typeWrap.appendChild(typeSelect);
  grid.appendChild(typeWrap);

  // Номер
  const numWrap = document.createElement('div');
  numWrap.className = 'field';
  const numLabel = document.createElement('label');
  numLabel.textContent = 'Номер электровоза';
  numWrap.appendChild(numLabel);
  const numInput = document.createElement('input');
  numInput.type = 'text';
  numInput.placeholder = 'Введите номер электровоза (с 2024 г.)';
  numInput.value = number;
  numInput.disabled = !type;
  numInput.classList.add('number-input');
  const errorHint = document.createElement('div');
  errorHint.className = 'error-hint';
  errorHint.textContent = __regHint();
  numWrap.appendChild(numInput);
  numWrap.appendChild(errorHint);

  function validateNumber() {
    const val = numInput.value.trim();
    if (val === '') {
      STATE.general.number = '';
      refreshChain('number');
      saveState(true);
      renderGeneral();
      updateStats();
      numInput.classList.remove('error');
      errorHint.classList.remove('show');
      return true;
    }
    const validNumbers = kzcNumbersForType(type);
    if (!validNumbers.includes(val)) {
      numInput.classList.add('error');
      errorHint.classList.add('show');
      return false;
    } else {
      STATE.general.number = val;
      refreshChain('number');
      saveState(true);
      renderGeneral();
      updateStats();
      numInput.classList.remove('error');
      errorHint.classList.remove('show');
      return true;
    }
  }

  numInput.addEventListener('blur', function(e) {
    const valid = validateNumber();
    if (!valid) {
      setTimeout(() => this.focus(), 0);
    }
  });
  numInput.addEventListener('input', function() {
    this.classList.remove('error');
    errorHint.classList.remove('show');
  });
  numInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.blur();
    }
  });
  if (!type) {
    const hint = document.createElement('div');
    hint.className = 'hint-lock';
    hint.textContent = 'Сначала выберите тип электровоза';
    numWrap.appendChild(hint);
  }
  grid.appendChild(numWrap);

  // Приписка
  const depotWrap = document.createElement('div');
  depotWrap.className = 'field';
  const depotLabel = document.createElement('label');
  depotLabel.textContent = 'Приписка электровоза';
  depotWrap.appendChild(depotLabel);
  const depotInput = document.createElement('input');
  depotInput.type = 'text';
  depotInput.value = rec ? rec.depot : '';
  depotInput.readOnly = true;
  depotInput.classList.add('auto-filled');
  depotWrap.appendChild(depotInput);
  grid.appendChild(depotWrap);

  // Место осмотра
  const placeWrap = document.createElement('div');
  placeWrap.className = 'field';
  const placeLabel = document.createElement('label');
  placeLabel.textContent = 'Место осмотра';
  placeWrap.appendChild(placeLabel);
  const placeSelect = document.createElement('select');
  let places = [];
  if (rec && rec.depot && DEPOT_PLACES[rec.depot]) {
    places = (rec.places && rec.places.length) ? rec.places : DEPOT_PLACES[rec.depot];
  }
  fillSelectOptions(placeSelect, places, STATE.general.place || '', rec ? '— выберите место —' : '— сначала выберите номер —');
  placeSelect.disabled = !rec;
  placeSelect.addEventListener('change', function() {
    STATE.general.place = this.value;
    saveState(true);
    updateStats();
    renderGeneral();
  });
  placeWrap.appendChild(placeSelect);
  grid.appendChild(placeWrap);

  // Пробег с валидацией (как в комплексном)
  const mileWrap = document.createElement('div');
  mileWrap.className = 'field';
  const mileLabel = document.createElement('label');
  mileLabel.textContent = 'Пробег электровоза от постройки, км';
  mileWrap.appendChild(mileLabel);
  const mileInput = document.createElement('input');
  mileInput.type = 'text';
  mileInput.value = STATE.general.mileage || '';
  mileInput.placeholder = 'Введите пробег (только цифры)';
  const isReady = type && rec && (STATE.general.place || '');
  mileInput.disabled = !isReady;

  const mileError = document.createElement('div');
  mileError.className = 'error-hint';
  mileError.style.display = 'none';
  mileError.style.marginTop = '2px';
  mileWrap.appendChild(mileError);

  function validateMileageInput() {
    const val = mileInput.value.trim();
    if (val === '') {
      mileInput.classList.remove('error');
      mileError.style.display = 'none';
      return true;
    }
    const typeVal = STATE.general.type;
    const numberVal = STATE.general.number;
    if (!typeVal || !numberVal) {
      mileInput.classList.remove('error');
      mileError.style.display = 'none';
      return true;
    }
    const err = getMileageError(val, typeVal, numberVal);
    if (err) {
      mileInput.classList.add('error');
      mileError.textContent = err;
      mileError.style.display = 'block';
      return false;
    } else {
      mileInput.classList.remove('error');
      mileError.style.display = 'none';
      return true;
    }
  }

  mileInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    STATE.general.mileage = this.value;
    validateMileageInput();
    if (!STATE.general.notice) {
      STATE.general.notice = computeAutoNotice();
    }
    saveState(true);
    updateStats();
  });
  mileInput.addEventListener('blur', function() {
    validateMileageInput();
    STATE.general.mileage = this.value;
    if (!STATE.general.notice) {
      STATE.general.notice = computeAutoNotice();
    }
    saveState(true);
    updateStats();
  });
  mileInput.addEventListener('change', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    STATE.general.mileage = this.value;
    validateMileageInput();
    if (!STATE.general.notice) {
      STATE.general.notice = computeAutoNotice();
    }
    saveState(true);
    updateStats();
  });
  mileInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.blur();
    }
  });

  mileWrap.appendChild(mileInput);
  if (!isReady) {
    const hint = document.createElement('div');
    hint.className = 'hint-lock';
    if (!type) hint.textContent = 'Сначала выберите тип и номер электровоза';
    else if (!rec) hint.textContent = 'Введите корректный номер электровоза';
    else if (!STATE.general.place) hint.textContent = 'Выберите место осмотра';
    mileWrap.appendChild(hint);
  } else {
    if (STATE.general.mileage) {
      setTimeout(validateMileageInput, 10);
    }
  }
  grid.appendChild(mileWrap);

  // Уведомление поставщика
  const noticeWrap = document.createElement('div');
  noticeWrap.className = 'field';
  const noticeLabel = document.createElement('label');
  noticeLabel.textContent = 'Уведомление поставщика, добавление записи в УНГУ (до 300 тыс.км)';
  noticeWrap.appendChild(noticeLabel);
  const noticeSelect = document.createElement('select');
  noticeSelect.id = 'globalNoticeSelect';
  noticeSelect.classList.add('auto-filled');
  const optYes = document.createElement('option');
  optYes.value = 'Да';
  optYes.textContent = 'Да';
  const optNo = document.createElement('option');
  optNo.value = 'Нет';
  optNo.textContent = 'Нет';
  noticeSelect.appendChild(optYes);
  noticeSelect.appendChild(optNo);
  const initialNotice = getNoticeValue();
  noticeSelect.value = initialNotice;
  if (!STATE.general.notice) STATE.general.notice = initialNotice;
  noticeSelect.addEventListener('change', function() {
    STATE.general.notice = this.value;
    saveState(true);
    updateStats();
  });
  noticeWrap.appendChild(noticeSelect);
  grid.appendChild(noticeWrap);

  document.getElementById('locomotiveTypeTag').textContent = type || '—';
  renderSectionsSelection();
  renderTypePicker();
}

function renderSectionsSelection() {
  const container = document.getElementById('sectionsSelection');
  const type = STATE.general.type || '';
  container.innerHTML = '';
  if (!type) {
    container.innerHTML = '<div style="color:var(--ink-dim);font-size:12px;">Выберите тип электровоза для выбора секций</div>';
    return;
  }

  const sectionObjects = getSections(type);
  const selected = STATE.general.selectedSections || [];

  const labelSec = document.createElement('div');
  labelSec.style.cssText = 'font-size:11.5px;color:var(--ink-dim);font-weight:600;margin-bottom:8px;';
  labelSec.textContent = 'Выберите секции для осмотра';
  container.appendChild(labelSec);

  const chipsSec = document.createElement('div');
  chipsSec.className = 'picker';

  const allSecChip = document.createElement('div');
  const allLabels = sectionObjects.map(s => s.label);
  const allSelected = (selected.length === allLabels.length);
  allSecChip.className = 'chip' + (allSelected ? ' active' : '');
  allSecChip.innerHTML = \`<span>Все</span>\`;
  allSecChip.onclick = function() {
    if (selected.length === allLabels.length) {
      STATE.general.selectedSections = [];
    } else {
      STATE.general.selectedSections = allLabels.slice();
    }
    saveState(true);
    renderSectionsSelection();
    renderEquip();
    updateStats();
  };
  chipsSec.appendChild(allSecChip);

  for (const s of sectionObjects) {
    const chip = document.createElement('div');
    const isActive = selected.includes(s.label);
    chip.className = 'chip' + (isActive ? ' active' : '');
    const typeName = s.typeName ? \` (\${s.typeName})\` : '';
    chip.innerHTML = \`<span>\${s.label}\${typeName}</span>\`;
    chip.onclick = function() {
      const idx = selected.indexOf(s.label);
      if (idx >= 0) {
        selected.splice(idx, 1);
      } else {
        selected.push(s.label);
      }
      STATE.general.selectedSections = selected;
      saveState(true);
      renderSectionsSelection();
      renderEquip();
      updateStats();
    };
    chipsSec.appendChild(chip);
  }
  container.appendChild(chipsSec);

  const telLabel = document.createElement('div');
  telLabel.style.cssText = 'font-size:11.5px;color:var(--ink-dim);font-weight:600;margin:12px 0 6px;';
  telLabel.textContent = 'Тележки:';
  container.appendChild(telLabel);

  const telGroup = document.createElement('div');
  telGroup.className = 'picker';
  const allTel = ['1','2'].filter(function(x){return (typeof __nrAllowed==='function')?__nrAllowed('tel',[__nrN('Тележка '+x)]):true;});
  const selectedTel = STATE.general.selectedTelezhki || [];

  const allTelChip = document.createElement('div');
  const allTelSelected = (selectedTel.length === allTel.length);
  allTelChip.className = 'chip' + (allTelSelected ? ' active' : '');
  allTelChip.textContent = 'Все';
  allTelChip.onclick = function() {
    if (selectedTel.length === allTel.length) {
      STATE.general.selectedTelezhki = [];
    } else {
      STATE.general.selectedTelezhki = allTel.slice();
    }
    saveState(true);
    renderSectionsSelection();
    renderEquip();
    updateStats();
  };
  telGroup.appendChild(allTelChip);

  allTel.forEach(t => {
    const chip = document.createElement('div');
    const isActive = selectedTel.includes(t);
    chip.className = 'chip' + (isActive ? ' active' : '');
    chip.textContent = 'Тележка ' + t;
    chip.onclick = function() {
      const idx = selectedTel.indexOf(t);
      if (idx >= 0) {
        selectedTel.splice(idx, 1);
      } else {
        selectedTel.push(t);
      }
      STATE.general.selectedTelezhki = selectedTel;
      saveState(true);
      renderSectionsSelection();
      renderEquip();
      updateStats();
    };
    telGroup.appendChild(chip);
  });
  container.appendChild(telGroup);
}

/* ========================================================================
   РЕНДЕР: ВЫБОР ТИПОВ ГИДРОДЕМПФЕРОВ
   ======================================================================== */
function renderTypePicker() {
  const container = document.getElementById('typePicker');
  const type = STATE.general.type || '';
  container.innerHTML = '';
  if (!type) {
    container.innerHTML = '<div style="color:var(--ink-dim);font-size:12px;">Выберите тип электровоза для выбора типов гидродемпферов</div>';
    return;
  }

  const allTypes = ALL_POSSIBLE_TYPES;
  if (allTypes.length === 0) {
    container.innerHTML = '<div style="color:var(--ink-dim);font-size:12px;">Типы гидродемпферов не найдены</div>';
    return;
  }

  const selected = STATE.general.selectedTypes || [];

  const label = document.createElement('div');
  label.style.cssText = 'font-size:11.5px;color:var(--ink-dim);font-weight:600;margin-bottom:8px;';
  label.textContent = 'Выберите типы гидродемпферов для отображения';
  container.appendChild(label);

  const chipsWrapper = document.createElement('div');
  chipsWrapper.className = 'picker';

  const allChip = document.createElement('div');
  const allSelected = (selected.length === allTypes.length);
  allChip.className = 'chip' + (allSelected ? ' active' : '');
  allChip.innerHTML = \`<span>Все</span>\`;
  allChip.onclick = function() {
    if (selected.length === allTypes.length) {
      STATE.general.selectedTypes = [];
    } else {
      STATE.general.selectedTypes = allTypes.slice();
    }
    saveState(true);
    renderTypePicker();
    renderEquip();
    updateStats();
  };
  chipsWrapper.appendChild(allChip);

  for (const t of allTypes) {
    const chip = document.createElement('div');
    const isActive = selected.includes(t);
    chip.className = 'chip' + (isActive ? ' active' : '');
    chip.innerHTML = \`<span>\${t}</span>\`;
    chip.onclick = function() {
      const idx = selected.indexOf(t);
      if (idx >= 0) {
        selected.splice(idx, 1);
      } else {
        selected.push(t);
      }
      STATE.general.selectedTypes = selected;
      saveState(true);
      renderTypePicker();
      renderEquip();
      updateStats();
    };
    chipsWrapper.appendChild(chip);
  }
  container.appendChild(chipsWrapper);
}

/* ========================================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЯМИ
   ======================================================================== */
// ★★★ ИСПРАВЛЕНО: iid теперь включает idx, но idx стабилен, т.к. instances() всегда возвращает все комбинации ★★★
function instId(eqId, inst, idx) {
  return [eqId, inst.section, inst.group || '', inst.block || '', inst.sub || '', idx].join('|');
}
function getVal(iid, key) { return (STATE.values[iid] && STATE.values[iid][key]) || ''; }
function setVal(iid, key, val) {
  if (!STATE.values[iid]) STATE.values[iid] = {};
  STATE.values[iid][key] = val;
  try {
    if (!Array.isArray(STATE.changeLog)) STATE.changeLog = [];
    STATE.changeLog.push({ t: Date.now(), user: (typeof currentUser !== 'undefined' ? currentUser : ''), iid, key, val: key.endsWith('_photo') ? (val ? '[фото]' : '[фото удалено]') : val });
    if (STATE.changeLog.length > 500) STATE.changeLog.splice(0, STATE.changeLog.length - 500);
  } catch (e) {}
  saveState(true);
  updateStats();
}

function getMileage() { return parseInt(STATE.general.mileage) || 0; }
function getGuarantee() {
  return getMileage() < 300000 ? 'Да' : 'Нет';
}

function updateFieldsVisibility(iid, card) {
  if (!card) return;
  const stateVal = getVal(iid, 'state');
  const isFault = (stateVal === 'Неисправен');
  const controls = card._controls;
  if (!controls) return;

  const fields = ['f2','f3','f4','zav'];
  fields.forEach(fk => {
    const el = controls[fk];
    if (el) {
      el.disabled = !isFault;
      if (!isFault) {
        el.value = '';
        setVal(iid, fk, '');
      }
    }
  });

  const f4Val = getVal(iid, 'f4');
  const isReviziya = (f4Val === 'Ревизия на стенде');
  const f5El = controls.f5;
  if (f5El) {
    const enabled = isFault && isReviziya;
    f5El.disabled = !enabled;
    if (!enabled) {
      f5El.value = '';
      setVal(iid, 'f5', '');
    }
  }

  // Обновляем требования фото
  ['f1','state','f2','f3','zav','f4','f5'].forEach(fk => {
    updatePhotoRequirementForField(iid, fk, card);
  });

  if (!STATE.general.notice) {
    STATE.general.notice = computeAutoNotice();
    updateGlobalNotice();
  }
}

function updateGlobalNotice() {
  const noticeSelect = document.getElementById('globalNoticeSelect');
  if (!noticeSelect) return;
  let val = STATE.general.notice;
  if (!val) {
    val = computeAutoNotice();
    STATE.general.notice = val;
  }
  if (noticeSelect.value !== val) {
    noticeSelect.value = val;
  }
}

/* ========================================================================
   ФУНКЦИЯ ДЛЯ ВЫЧИСЛЕНИЯ ФЛАГА НАЛИЧИЯ НЕСООТВЕТСТВИЙ (только по состоянию)
   ======================================================================== */
function computeFlag(eq, iid) {
  const state = getVal(iid, 'state');
  if (state === 'Неисправен') return { state: 'bad', label: 'Да' };
  if (state === 'Исправен') return { state: 'ok', label: 'Нет' };
  return { state: 'na', label: 'Нет' };
}

/* ========================================================================
   СОЗДАНИЕ КАРТОЧКИ
   ======================================================================== */
function createCardElement(eq, inst, idx) {
  const iid = instId(eq.id, inst, idx);
  const card = document.createElement('div');
  card.className = 'card-item';
  card.dataset.iid = iid;

  const typeDiv = document.createElement('div');
  typeDiv.className = 'block-type';
  typeDiv.textContent = 'Тип гидродемпфера: ' + inst.block;
  card.appendChild(typeDiv);

  // Наличие запотеваний
  const rowF1 = document.createElement('div');
  rowF1.className = 'field-row';
  rowF1.dataset.fieldKey = 'f1';
  const labelF1 = document.createElement('label');
  labelF1.textContent = 'Наличие запотеваний';
  rowF1.appendChild(labelF1);
  const f1Select = document.createElement('select');
  const f1Options = ['','Да','Нет'];
  f1Options.forEach(opt => {
    const op = document.createElement('option');
    op.value = opt;
    op.textContent = opt || '— выбрать —';
    f1Select.appendChild(op);
  });
  f1Select.value = getVal(iid, 'f1') || '';
  f1Select.addEventListener('change', function() {
    setVal(iid, 'f1', this.value);
    updatePhotoRequirementForField(iid, 'f1', card);
  });
  rowF1.appendChild(f1Select);
  card.appendChild(rowF1);

  // Состояние
  const rowState = document.createElement('div');
  rowState.className = 'field-row';
  rowState.dataset.fieldKey = 'state';
  const labelState = document.createElement('label');
  labelState.textContent = 'Состояние';
  rowState.appendChild(labelState);
  const stateSelect = document.createElement('select');
  const stateOptions = ['','Исправен','Неисправен'];
  stateOptions.forEach(opt => {
    const op = document.createElement('option');
    op.value = opt;
    op.textContent = opt || '— выбрать —';
    stateSelect.appendChild(op);
  });
  const savedState = getVal(iid, 'state');
  if (savedState && (savedState === 'Исправен' || savedState === 'Неисправен')) {
    stateSelect.value = savedState;
  } else {
    stateSelect.value = 'Исправен';
    setVal(iid, 'state', 'Исправен');
  }
  stateSelect.addEventListener('change', function() {
    setVal(iid, 'state', this.value);
    updateFieldsVisibility(iid, card);
    updateStats();
    updatePhotoRequirementForField(iid, 'state', card);
  });
  rowState.appendChild(stateSelect);
  card.appendChild(rowState);

  // Причина браковки
  const rowF2 = document.createElement('div');
  rowF2.className = 'field-row';
  rowF2.dataset.fieldKey = 'f2';
  const labelF2 = document.createElement('label');
  labelF2.textContent = 'Причина браковки';
  rowF2.appendChild(labelF2);
  const f2Select = document.createElement('select');
  const f2Options = ['','Течь масла','Механическое повреждение','Не соответствует ТУ (ТР-250)'];
  f2Options.forEach(opt => {
    const op = document.createElement('option');
    op.value = opt;
    op.textContent = opt || '— выбрать —';
    f2Select.appendChild(op);
  });
  f2Select.value = getVal(iid, 'f2') || '';
  f2Select.disabled = true;
  f2Select.addEventListener('change', function() {
    setVal(iid, 'f2', this.value);
    if (!STATE.general.notice) {
      STATE.general.notice = computeAutoNotice();
      updateGlobalNotice();
    }
    updatePhotoRequirementForField(iid, 'f2', card);
  });
  rowF2.appendChild(f2Select);
  card.appendChild(rowF2);

  // Соответствие характеристик на стенде
  const rowF3 = document.createElement('div');
  rowF3.className = 'field-row';
  rowF3.dataset.fieldKey = 'f3';
  const labelF3 = document.createElement('label');
  labelF3.textContent = 'Соответствие характеристик на стенде';
  rowF3.appendChild(labelF3);
  const f3Select = document.createElement('select');
  const f3Options = ['','Соответствует','Не соответствует','Не проводилось'];
  f3Options.forEach(opt => {
    const op = document.createElement('option');
    op.value = opt;
    op.textContent = opt || '— выбрать —';
    f3Select.appendChild(op);
  });
  f3Select.value = getVal(iid, 'f3') || '';
  f3Select.disabled = true;
  f3Select.addEventListener('change', function() {
    setVal(iid, 'f3', this.value);
    updatePhotoRequirementForField(iid, 'f3', card);
  });
  rowF3.appendChild(f3Select);
  card.appendChild(rowF3);

  // Заводской №
  const rowZav = document.createElement('div');
  rowZav.className = 'field-row';
  rowZav.dataset.fieldKey = 'zav';
  const labelZav = document.createElement('label');
  labelZav.textContent = 'Заводской № неисправного ГД';
  rowZav.appendChild(labelZav);
  const zavInput = document.createElement('input');
  zavInput.type = 'text';
  zavInput.value = getVal(iid, 'zav') || '';
  zavInput.placeholder = 'Введите №';
  zavInput.disabled = true;
  zavInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9\\-\\.]/g, '');
    setVal(iid, 'zav', this.value);
  });
  zavInput.addEventListener('blur', function() {
    setVal(iid, 'zav', this.value);
  });
  rowZav.appendChild(zavInput);
  card.appendChild(rowZav);

  // Способ устранения
  const rowF4 = document.createElement('div');
  rowF4.className = 'field-row';
  rowF4.dataset.fieldKey = 'f4';
  const labelF4 = document.createElement('label');
  labelF4.textContent = 'Способ устранения';
  rowF4.appendChild(labelF4);
  const f4Select = document.createElement('select');
  const f4Options = ['','Ревизия на стенде','Замена на новый','Не проводилось'];
  f4Options.forEach(opt => {
    const op = document.createElement('option');
    op.value = opt;
    op.textContent = opt || '— выбрать —';
    f4Select.appendChild(op);
  });
  f4Select.value = getVal(iid, 'f4') || '';
  f4Select.disabled = true;
  f4Select.addEventListener('change', function() {
    setVal(iid, 'f4', this.value);
    updateFieldsVisibility(iid, card);
  });
  rowF4.appendChild(f4Select);
  card.appendChild(rowF4);

  // Проведённые работы
  const rowF5 = document.createElement('div');
  rowF5.className = 'field-row';
  rowF5.dataset.fieldKey = 'f5';
  const labelF5 = document.createElement('label');
  labelF5.textContent = 'Проведённые работы';
  rowF5.appendChild(labelF5);
  const f5Input = document.createElement('input');
  f5Input.type = 'text';
  f5Input.value = getVal(iid, 'f5') || '';
  f5Input.disabled = true;
  f5Input.placeholder = '—';
  f5Input.addEventListener('input', function() {
    setVal(iid, 'f5', this.value);
  });
  rowF5.appendChild(f5Input);
  card.appendChild(rowF5);

  card._controls = {
    f1: f1Select,
    state: stateSelect,
    f2: f2Select,
    f3: f3Select,
    zav: zavInput,
    f4: f4Select,
    f5: f5Input
  };
  card._iid = iid;

  updateFieldsVisibility(iid, card);

  // Добавляем фото для полей, у которых photo: true
  eq.fields.forEach(field => {
    if (field.photo) {
      const row = card.querySelector(\`.field-row[data-field-key="\${field.key}"]\`);
      if (row) addPhotoSupport(row, field, iid);
    }
  });

  return card;
}

/* ========================================================================
   РЕНДЕР: КАРТОЧКИ (с учётом новых правил: пустые массивы = ничего не показывать)
   ======================================================================== */
function renderEquip() {
  const root = document.getElementById('equipRoot');
  root.innerHTML = '';
  if (!STATE.general.type) {
    root.innerHTML = \`<div class="select-type-message"><span class="icon">🚆</span><div class="title">Выберите тип электровоза</div><div class="sub">Для отображения чек-листа необходимо выбрать тип электровоза в разделе «Общие данные»</div></div>\`;
    updateStats();
    return;
  }
  const active = EQUIPMENT.filter(e => STATE.selected.includes(e.id));
  if (active.length === 0) {
    root.innerHTML = \`<div class="card" style="margin-top:22px;color:var(--ink-dim);text-align:center;">Нет доступных узлов для проверки.</div>\`;
    updateStats();
    return;
  }

  const selectedSections = STATE.general.selectedSections || [];
  const allSections = getSections(STATE.general.type).map(s => s.label);
  const sectionsToShow = selectedSections.length ? selectedSections : [];
  const selectedTypes = STATE.general.selectedTypes || [];
  const selectedTelezhki = STATE.general.selectedTelezhki || [];

  if (sectionsToShow.length === 0 || selectedTelezhki.length === 0 || selectedTypes.length === 0) {
    root.innerHTML = \`<div class="select-type-message"><span class="icon">📋</span><div class="title">Выберите параметры</div><div class="sub">Чтобы начать осмотр, выберите секции, тележки и типы гидродемпферов выше</div></div>\`;
    updateStats();
    return;
  }

  for (const eq of active) {
    const wrap = document.createElement('div');
    wrap.className = 'equip';

    const eh = document.createElement('div');
    eh.className = 'eh';
    let totalVisible = 0;
    const allInstances = eq.instances(); // все возможные комбинации
    allInstances.forEach((inst, idx) => {
      // фильтруем по выбранным секциям, тележкам, типам
      if (!sectionsToShow.includes(inst.section)) return;
      if (selectedTypes.length && !selectedTypes.includes(inst.block)) return;
      if (selectedTelezhki.length && !selectedTelezhki.includes(inst.group.replace('Тележка ','').trim())) return;
      totalVisible++;
    });
    eh.innerHTML = \`<h2>\${eq.title}</h2><span class="badge">\${totalVisible} поз.</span>\`;
    wrap.appendChild(eh);

    // Группируем по секции и тележке, но только те, которые попадают под фильтр
    const groups = {};
    allInstances.forEach((inst, idx) => {
      if (!sectionsToShow.includes(inst.section)) return;
      if (selectedTypes.length && !selectedTypes.includes(inst.block)) return;
      if (selectedTelezhki.length && !selectedTelezhki.includes(inst.group.replace('Тележка ','').trim())) return;
      const key = inst.section + '|' + inst.group;
      if (!groups[key]) groups[key] = [];
      groups[key].push({ inst, idx });
    });

    const sortedSections = sectionsToShow.filter(s => {
      for (const key of Object.keys(groups)) {
        if (key.startsWith(s + '|')) return true;
      }
      return false;
    });

    for (const sec of sortedSections) {
      const secHeader = document.createElement('div');
      secHeader.className = 'section-header';
      secHeader.textContent = sec;
      wrap.appendChild(secHeader);

      const telKeys = Object.keys(groups).filter(k => k.startsWith(sec + '|'));
      telKeys.sort((a,b) => {
        const numA = parseInt(a.split('|')[1].replace('Тележка ',''), 10);
        const numB = parseInt(b.split('|')[1].replace('Тележка ',''), 10);
        return numA - numB;
      });

      for (const key of telKeys) {
        const telLabel = key.split('|')[1];
        const telHeader = document.createElement('div');
        telHeader.className = 'group-header';
        telHeader.textContent = telLabel;
        wrap.appendChild(telHeader);

        const items = groups[key];
        for (const item of items) {
          const card = createCardElement(eq, item.inst, item.idx);
          wrap.appendChild(card);
        }
      }
    }

    root.appendChild(wrap);
  }

  updateStats();
}

/* ========================================================================
   СТАТИСТИКА (считаем как в комплексном: только обязательные поля)
   ======================================================================== */
function updateStats() {
  // Единый подсчёт (с учётом обязательных фото) — тот же, что у computeStats()
  const __s = computeStats();
  const totalInstances = __s.totalInstances, okInstances = __s.okInstances, badInstances = __s.badInstances, percent = __s.percent;

  document.getElementById('statTotal').textContent = totalInstances;
  document.getElementById('statOk').textContent = okInstances;
  document.getElementById('statBad').textContent = badInstances;
  document.getElementById('statFilled').textContent = percent + '%';
  const bar = document.getElementById('statProgressFill');
  if (bar) bar.style.width = percent + '%';

  // Обновляем кнопку экспорта
  updateExportButtons();

  // Обновляем уведомление поставщика
  if (!STATE.general.notice) {
    STATE.general.notice = computeAutoNotice();
    updateGlobalNotice();
  } else {
    updateGlobalNotice();
  }
  updateFindBadge();
}

function updateExportButtons() {
  const photoBtn = document.getElementById('btnExportWithPhotos');
  if (!photoBtn) return;
  const filledEl = document.getElementById('statFilled');
  const percentText = filledEl.textContent;
  const percent = parseInt(percentText) || 0;
  const enabled = (currentUser === 'admin' || percent === 100);
  photoBtn.disabled = !enabled;
  if (enabled) {
    photoBtn.title = 'Экспорт с фото доступен';
    photoBtn.style.opacity = '1';
    photoBtn.style.pointerEvents = 'auto';
  } else {
    photoBtn.title = 'Для экспорта необходимо заполнить чек-лист на 100% (сейчас ' + percent + '%)';
    photoBtn.style.opacity = '0.4';
    photoBtn.style.pointerEvents = 'none';
  }
}

/* ========================================================================
   ЭКСПОРТ / ИМПОРТ JSON
   ======================================================================== */
function exportJson() {
  saveState(true);
  const data = JSON.parse(JSON.stringify(STATE));
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const typeVal = STATE.general.type || 'без_серии';
  const numberVal = STATE.general.number || '';
  const baseName = typeVal + (numberVal ? '_' + numberVal : '') + '_гидродемпферы';
  const safeBase = baseName.replace(/[\\/\\\\:*?"<>|]/g, '_');
  a.download = safeBase + '.json';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✅ JSON экспортирован');
}

function importJson() {
  document.getElementById('jsonFileInput').click();
}

function handleJsonFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const json = JSON.parse(e.target.result);
      if (typeof json !== 'object' || !json.general || typeof json.values !== 'object') {
        throw new Error('Неверный формат JSON');
      }
      STATE = json;
      if (!Array.isArray(STATE.general.selectedSections)) STATE.general.selectedSections = [];
      if (!Array.isArray(STATE.general.selectedTelezhki)) STATE.general.selectedTelezhki = [];
      if (!Array.isArray(STATE.general.selectedTypes)) STATE.general.selectedTypes = [];
      if (!Array.isArray(STATE.selected)) STATE.selected = [];
      saveState(true);
      const type = STATE.general.type || '';
      buildEquipment(type);
      renderGeneral();
      renderEquip();
      updateStats();
      showToast('✅ JSON загружен, данные восстановлены');
    } catch (err) {
      showToast('⚠️ Ошибка загрузки JSON: ' + err.message);
      console.error(err);
    }
  };
  reader.onerror = function() {
    showToast('⚠️ Ошибка чтения файла');
  };
  reader.readAsText(file);
}
function computeStats() {
  // ---- Общие поля ----
  let filledGeneral = 0;
  const generalFields = ['date', 'type', 'number', 'depot', 'place', 'mileage'];
  for (const f of generalFields) {
    if (f === 'mileage') {
      const val = STATE.general.mileage || '';
      if (val !== '') {
        const type = STATE.general.type;
        const number = STATE.general.number;
        if (isValidMileage(val, type, number)) filledGeneral++;
      }
    } else {
      if (STATE.general[f] && STATE.general[f] !== '') filledGeneral++;
    }
  }

  let totalInstances = 0, okInstances = 0, badInstances = 0;
  let allFieldsCount = 0, filledFieldsCount = 0;

  const type = STATE.general.type || '';
  if (type) {
    const selectedSections = STATE.general.selectedSections || [];
    const allSections = getSections(type).map(s => s.label);
    const sectionsToShow = selectedSections.length ? selectedSections : [];
    const selectedTypes = STATE.general.selectedTypes || [];
    const selectedTelezhki = STATE.general.selectedTelezhki || [];
    const active = EQUIPMENT.filter(e => STATE.selected.includes(e.id));

    for (const eq of active) {
      const allInstances = eq.instances();
      allInstances.forEach((inst, idx) => {
        if (sectionsToShow.length && !sectionsToShow.includes(inst.section)) return;
        if (selectedTypes.length && !selectedTypes.includes(inst.block)) return;
        if (selectedTelezhki.length && !selectedTelezhki.includes(inst.group.replace('Тележка ','').trim())) return;
        totalInstances++;
        const iid = instId(eq.id, inst, idx);
        const state = getVal(iid, 'state');
        const isFault = (state === 'Неисправен');
        if (state === 'Исправен') okInstances++;
        if (isFault) badInstances++;

        const requiredFields = ['f1', 'state'];
        if (isFault) {
          requiredFields.push('f2', 'f3', 'f4', 'zav');
          const f4Val = getVal(iid, 'f4');
          if (f4Val === 'Ревизия на стенде') requiredFields.push('f5');
        }

        for (const fk of requiredFields) {
          allFieldsCount++;
          const val = getVal(iid, fk);
          if (val && val !== '' && val !== '— выбрать') filledFieldsCount++;

          // Фото обязательно для f1/state/f2/f3 — те же условия, что в updatePhotoRequirementForField
          let photoRequired = false;
          if (fk === 'f1') photoRequired = (val === 'Да');
          else if (fk === 'state') photoRequired = (val === 'Неисправен');
          else if (fk === 'f2') photoRequired = !!(val && val !== '' && val !== '— выбрать');
          else if (fk === 'f3') photoRequired = !!(val && val !== '' && val !== '— выбрать' && val !== 'Не проводилось');
          if (photoRequired) {
            allFieldsCount++;
            const photoData = getVal(iid, fk + '_photo');
            if (photoData) filledFieldsCount++;
          }
        }
      });
    }
  }

  const totalFields = generalFields.length + allFieldsCount;
  const filledTotal = filledGeneral + filledFieldsCount;
  const percent = totalFields ? Math.floor(100 * filledTotal / totalFields) : 0;

  return {
    percent,
    totalInstances,
    okInstances,
    badInstances,
    filledTotal,
    totalFields
  };
}
/* ========================================================================
   ЭКСПОРТ С ФОТО (с проверкой валидности пробега)
   ======================================================================== */
async function exportWithPhotos() { try{await __psReady();}catch(e){}
  try {
    if (currentUser !== 'admin') {
      const stats = computeStats();
      if (stats.percent < 100) {
        showToast('⚠️ Экспорт доступен только при 100% заполнении чек-листа');
        return;
      }
    }

    const type = STATE.general.type || '';
    const number = STATE.general.number || '';
    const mileage = STATE.general.mileage || '';
    if (!isValidMileage(mileage, type, number)) {
      const err = getMileageError(mileage, type, number);
      showToast('⚠️ Некорректный пробег: ' + (err || ''));
      return;
    }

    if (typeof ExcelJS === 'undefined') {
      showToast('⚠️ Библиотека ExcelJS не загружена. Проверьте подключение к интернету.');
      return;
    }

    if (!type) {
      showToast('⚠️ Сначала выберите тип электровоза');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Чек-лист гидродемпферов';
    const wsData = workbook.addWorksheet('Данные');
    const wsPhotos = workbook.addWorksheet('Фотографии');
    const wsSummary = workbook.addWorksheet('Сводная');
    const MAX_OPS_COLUMNS = 30;
    let opsOverflowCount = 0;
    const summaryIssues = [];

    const commonHeaders = [
      'Дата осмотра', 'Место осмотра', 'Приписка эл-за', 'Серия эл-за',
      'Номер эл-за', 'Пробег эл-за', 'Уведомление поставщика, добавление записи в УНГУ',
      'Узел', 'Деталь', 'СЕКЦИЯ', 'БЛОК', 'СХ. №', 'Заводской №'
    ];

    let dataOpsHeaders = [];
    for (let i = 1; i <= MAX_OPS_COLUMNS; i++) {
      dataOpsHeaders.push(\`Контрольная операция \${i}\`);
      dataOpsHeaders.push(\`Соответствие контроля \${i}\`);
    }
    const dataHeaders = [...commonHeaders, ...dataOpsHeaders];
    wsData.addRow(dataHeaders);

    let photoOpsHeaders = [];
    for (let i = 1; i <= MAX_OPS_COLUMNS; i++) {
      photoOpsHeaders.push(\`Контрольная операция \${i}\`);
      photoOpsHeaders.push(\`Фото \${i}\`);
    }
    const photoHeaders = [...commonHeaders, ...photoOpsHeaders];
    wsPhotos.addRow(photoHeaders);

    const noticeValue = getNoticeValue();
    const active = EQUIPMENT.filter(e => STATE.selected.includes(e.id));
    const selectedSections = STATE.general.selectedSections || [];
    const allSections = getSections(type).map(s => s.label);
    const sectionsToShow = selectedSections.length ? selectedSections : allSections;
    const selectedTypes = STATE.general.selectedTypes || [];
    const selectedTelezhki = STATE.general.selectedTelezhki || [];

    for (const eq of active) {
      const allInstances = eq.instances();
      for (const inst of allInstances) {
        const idx = allInstances.indexOf(inst);
        if (!sectionsToShow.includes(inst.section)) continue;
        if (selectedTypes.length && !selectedTypes.includes(inst.block)) continue;
        if (selectedTelezhki.length && !selectedTelezhki.includes(inst.group.replace('Тележка ','').trim())) continue;
        const iid = instId(eq.id, inst, idx);

        const commonData = [
          STATE.general.date || '',
          STATE.general.place || '',
          STATE.general.depot || '',
          STATE.general.type || '',
          STATE.general.number || '',
          STATE.general.mileage || '',
          noticeValue,
          eq.title,
          '',
          inst.section,
          inst.block || inst.section,
          '',
          getVal(iid, 'zav') || ''
        ];

        const fields = eq.fields.filter(f => f.key !== 'zav');
        const opsData = [];
        const opsPhotos = [];
        for (const field of fields) {
          const val = getVal(iid, field.key) || '';
          const photoKey = field.key + '_photo';
          const photoData = getVal(iid, photoKey) || '';
          opsData.push({ label: field.label, value: val });
          opsPhotos.push({ label: field.label, photo: photoData });
        }
        const flag = computeFlag(eq, iid);
        opsData.push({ label: 'Наличие выявленных несоответствий', value: flag.label });
        opsPhotos.push({ label: 'Наличие выявленных несоответствий', photo: '' });

        if (flag.state === 'bad') {
          summaryIssues.push({ node: eq.title, section: inst.section, place: inst.block || inst.section, comment: flag.label });
        }
        if (opsData.length > MAX_OPS_COLUMNS) {
          opsOverflowCount++;
          console.warn('Превышен лимит колонок экспорта (' + MAX_OPS_COLUMNS + ') для узла "' + eq.title + '", секция ' + inst.section + '. Часть проверок не попадёт в файл.');
        }

        const rowData = [...commonData];
        for (let i = 0; i < MAX_OPS_COLUMNS; i++) {
          if (i < opsData.length) {
            rowData.push(opsData[i].label);
            rowData.push(opsData[i].value);
          } else {
            rowData.push('');
            rowData.push('');
          }
        }
        wsData.addRow(rowData);

        const rowPhoto = [...commonData];
        for (let i = 0; i < MAX_OPS_COLUMNS; i++) {
          if (i < opsPhotos.length) {
            rowPhoto.push(opsPhotos[i].label);
            rowPhoto.push('');
          } else {
            rowPhoto.push('');
            rowPhoto.push('');
          }
        }
        const rowPhotoObj = wsPhotos.addRow(rowPhoto);
        const rowPhotoIndex = rowPhotoObj.number;

        for (let i = 0; i < MAX_OPS_COLUMNS && i < opsPhotos.length; i++) {
          const photoData = opsPhotos[i].photo;
          if (photoData && photoData.startsWith('data:image')) {
            const colIndex = 13 + 2 * i + 1;
            const base64Data = photoData.split(',')[1];
            const mime = photoData.match(/data:(image\\/\\w+);/)?.[1] || 'image/png';
            const extension = mime.split('/')[1] || 'png';
            const imageId = workbook.addImage({
              base64: base64Data,
              extension: extension,
            });
            wsPhotos.addImage(imageId, {
              tl: { col: colIndex, row: rowPhotoIndex - 1 },
              ext: { width: 100, height: 100 },
            });
            rowPhotoObj.height = 105;
          }
        }
      }
    }

    for (let i = 0; i < MAX_OPS_COLUMNS; i++) {
      const colIdx = 13 + 2 * i + 1;
      wsPhotos.getColumn(colIdx).width = 25;
    }

    const stats = computeStats();
    wsSummary.addRow(['Сводная информация по чек-листу']);
    wsSummary.addRow(['Электровоз', (STATE.general.type || '') + ' № ' + (STATE.general.number || '')]);
    wsSummary.addRow(['Дата осмотра', STATE.general.date || '']);
    wsSummary.addRow(['Всего проверенных позиций', stats.totalInstances]);
    wsSummary.addRow(['Без замечаний', stats.okInstances]);
    wsSummary.addRow(['С замечаниями', stats.badInstances]);
    wsSummary.addRow(['Заполнено полей, %', stats.percent]);
    wsSummary.addRow([]);
    wsSummary.addRow(['Узел', 'Секция', 'Место/деталь', 'Замечание']);
    if (summaryIssues.length === 0) {
      wsSummary.addRow(['Несоответствий не выявлено']);
    } else {
      for (const issue of summaryIssues) {
        wsSummary.addRow([issue.node, issue.section, issue.place, issue.comment]);
      }
    }
    wsSummary.getColumn(1).width = 30;
    wsSummary.getColumn(2).width = 14;
    wsSummary.getColumn(3).width = 30;
    wsSummary.getColumn(4).width = 40;

    if (opsOverflowCount > 0) {
      showToast('⚠️ У ' + opsOverflowCount + ' позици(й) больше ' + MAX_OPS_COLUMNS + ' проверок — часть данных не попала в файл (см. консоль)');
    }

    const wsHistory = workbook.addWorksheet('История изменений');
    wsHistory.addRow(['Дата и время', 'Пользователь', 'Позиция', 'Поле', 'Значение']);
    const changeLog = Array.isArray(STATE.changeLog) ? STATE.changeLog : [];
    if (changeLog.length === 0) {
      wsHistory.addRow(['Журнал изменений пуст']);
    } else {
      for (const entry of changeLog) {
        const dt = new Date(entry.t);
        const dtStr = isNaN(dt.getTime()) ? '' : dt.toLocaleString('ru-RU');
        wsHistory.addRow([dtStr, entry.user || '', entry.iid || '', entry.key || '', entry.val !== undefined ? String(entry.val) : '']);
      }
    }
    wsHistory.getColumn(1).width = 20;
    wsHistory.getColumn(2).width = 12;
    wsHistory.getColumn(3).width = 25;
    wsHistory.getColumn(4).width = 20;
    wsHistory.getColumn(5).width = 35;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = STATE.general.date || 'без_даты';
    const typeVal = STATE.general.type || 'без_серии';
    const numberVal = STATE.general.number || 'без_номера';
    const baseName = \`\${date}_\${typeVal}_\${numberVal}_Чек-лист_Гидродемпферы\`;
    const safeBase = baseName.replace(/[\\/\\\\:*?"<>|]/g, '_');
    a.download = safeBase + '.xlsx';
                let __tmhExcelCloudSaved = false;
        try {
          const __saveCloud = window.parent && window.parent.__TMH_SAVE_CLOUD_BACKUP_CONTEXT;
          const __getContext = window.__TMH_GET_CLOUD_BACKUP_CONTEXT;
          if (typeof __saveCloud !== 'function' || typeof __getContext !== 'function') throw new Error('Облачное сохранение чек-листа не подключено');
          const __cloudResult = await __saveCloud(__getContext());
          __tmhExcelCloudSaved = true;
          console.info('Excel export cloud backup completed', { id: __cloudResult.row.id, revision: __cloudResult.row.revision });
        } catch (__cloudError) {
          console.error('Excel export cloud backup failed', __cloudError);
        }
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    showToast(__tmhExcelCloudSaved ? '☁️ Excel сохранён в облако и загружен' : '⚠️ Excel скачан, но не сохранён в облако. Проверьте вход и подключение.');
  } catch (e) {
    console.error(e);
    showToast('⚠️ Ошибка при экспорте: ' + e.message);
  }
}

/* ========================================================================
   СОХРАНЕНИЕ КАК ФАЙЛ
   ======================================================================== */
function saveAsHtmlFile() {
  loadState();
  const type = STATE.general.type || '';
  const number = STATE.general.number || '';
  const mileage = STATE.general.mileage || '';
  if (!isValidMileage(mileage, type, number)) {
    const err = getMileageError(mileage, type, number);
    showToast('⚠️ Некорректный пробег: ' + (err || ''));
    return;
  }
  saveState(true);

  let htmlContent = '<!DOCTYPE html>\\n' + document.documentElement.outerHTML;
  const stateJson = JSON.stringify(STATE).replace(/<\\//g, '<\\\\/');
  const embeddedScript = \`<script id="__embedded_state">\\nwindow.__EMBEDDED_STATE = \${stateJson};\\n<\\/script>\\n\`;
  htmlContent = htmlContent.replace(/<script[^>]*>\\s*(?:const\\s+|var\\s+|window\\.)__EMBEDDED_STATE[\\s\\S]*?<\\/script>\\s*/g, '');
  const headCloseTag = '</head>';
  const headCloseIndex = htmlContent.indexOf(headCloseTag);
  if (headCloseIndex !== -1) {
    htmlContent = htmlContent.slice(0, headCloseIndex) + embeddedScript + htmlContent.slice(headCloseIndex);
  } else {
    const bodyCloseTag = '</body>';
    const bodyCloseIndex = htmlContent.indexOf(bodyCloseTag);
    if (bodyCloseIndex !== -1) {
      htmlContent = htmlContent.slice(0, bodyCloseIndex) + embeddedScript + htmlContent.slice(bodyCloseIndex);
    }
  }
  const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const typeVal = STATE.general.type || 'без_серии';
  const numberVal = STATE.general.number || '';
  const baseName = typeVal + (numberVal ? '_' + numberVal : '');
  const safeBase = baseName.replace(/[\\/\\\\:*?"<>|]/g, '_');
  a.download = 'чек-лист_гидродемпферы_' + safeBase + '.html';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✅ Файл сохранён');
}

/* ========================================================================
   ДИАЛОГ ВЫБОРА "ПРОДОЛЖИТЬ / НОВЫЙ"
   ======================================================================== */
let dialogShown = false;

async function showContinueDialogOrStart() {
  if (!window.__TMH_STORAGE_UID) { __tmhShowLoginModal(); return; }
  if (dialogShown) return;
  let hasSaved = localStorage.getItem(LS_KEY) !== null;
            const api = typeof __getTMHAuthApi === 'function' ? __getTMHAuthApi() : null;
            if (api && api.isOfflineVaultUnlocked?.() && typeof api.hasOfflineChecklist === 'function') {
                hasSaved = hasSaved || await api.hasOfflineChecklist(LS_KEY);
            }
  if (typeof __EMBEDDED_STATE !== 'undefined' && __EMBEDDED_STATE) {
    startApp(false);
    return;
  }
  if (hasSaved) {
    document.getElementById('continueDialog').style.display = 'flex';
    dialogShown = true;
  } else {
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
async function startApp(useNew) {
  if (useNew) {
    fullClearState();
  } else {
    const restored = await __tmhRestoreActiveOfflineState();
    if (!restored) {
      if (!STATE.general.type && !localStorage.getItem(LS_KEY)) fullClearState();
      else loadState();
    }
  }
  const type = STATE.general.type || '';
  buildEquipment(type);
  if (STATE.selected.length === 0 && type) STATE.selected = EQUIPMENT.map(e => e.id);
  if (!STATE.general.selectedTelezhki) STATE.general.selectedTelezhki = [];
  if (!STATE.general.selectedTypes) STATE.general.selectedTypes = [];
  if (!STATE.general.selectedSections) STATE.general.selectedSections = [];
  if (!STATE.general.notice) STATE.general.notice = computeAutoNotice();
  renderGeneral();
  renderEquip();
  updateStats();
  document.getElementById('continueDialog').style.display = 'none';
  dialogShown = true;
  updateExportButtons();
}

/* ========================================================================
   ТЕМЫ / ИНИЦИАЛИЗАЦИЯ
   ======================================================================== */
const THEME_KEY = 'checklist_theme_v1';
const THEME_VALUES = ['tmh','standard','dark'];
function applyTheme(theme) {
  const t = THEME_VALUES.includes(theme) ? theme : 'tmh';
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('#themeSwitch button').forEach(b => {
    b.classList.toggle('active', b.dataset.themeValue === t);
  });
  try { localStorage.setItem(THEME_KEY, t); } catch(e) {}
}
function initThemeSwitch() {
  document.querySelectorAll('#themeSwitch button').forEach(b => {
    b.addEventListener('click', () => applyTheme(b.dataset.themeValue));
  });
  let saved = 'tmh';
  try { saved = localStorage.getItem(THEME_KEY) || 'tmh'; } catch(e) {}
  applyTheme(saved);
}

/* ========================================================================
   ПОИСК НЕЗАПОЛНЕННЫХ ПОЛЕЙ
   ======================================================================== */
function getUnfilledElements() {
  const list = [];
  document.querySelectorAll('#generalGrid select, #generalGrid input').forEach(c => {
    if (c.disabled || c.readOnly) return;
    if (!c.value || c.value === '') list.push({ el: c.closest('.field') || c, focus: c });
  });
  document.querySelectorAll('#equipRoot select, #equipRoot input[type="text"]').forEach(c => {
    if (c.disabled) return;
    if (c.offsetParent === null) return;
    if (!c.value || c.value === '' || c.value === '— выбрать') list.push({ el: c.closest('.field-row') || c.closest('.frow') || c.closest('.field') || c, focus: c });
  });
  // Строки с ответом, но без обязательного фото — та же формула, что в updatePhotoRequirementForField
  document.querySelectorAll('#equipRoot .field-row[data-field-key]').forEach(row => {
    if (row.offsetParent === null) return;
    const card = row.closest('.card-item[data-iid]');
    if (!card) return;
    const iid = card.dataset.iid;
    const fk = row.dataset.fieldKey;
    const val = getVal(iid, fk);
    const photoData = getVal(iid, fk + '_photo');
    let required = false;
    if (fk === 'f1') required = (val === 'Да');
    else if (fk === 'state') required = (val === 'Неисправен');
    else if (fk === 'f2') required = !!(val && val !== '' && val !== '— выбрать');
    else if (fk === 'f3') required = !!(val && val !== '' && val !== '— выбрать' && val !== 'Не проводилось');
    if (required && !photoData) list.push({ el: row, focus: null });
  });
  return list;
}
function countUnfilled() { return getUnfilledElements().length; }
function updateFindBadge() {
  const badge = document.getElementById('findBadge');
  if (!badge) return;
  const n = countUnfilled();
  if (n > 0) { badge.textContent = n; badge.style.display = 'inline-block'; }
  else { badge.style.display = 'none'; }
}
function expandCollapsedForRow(row) {
  let parent = row.parentElement;
  while (parent) {
    if (parent.classList && parent.classList.contains('sec-body') && parent.classList.contains('collapsed')) {
      parent.classList.remove('collapsed');
      const h = parent.previousElementSibling;
      if (h) { const ic = h.querySelector('.sec-toggle-icon'); if (ic) ic.classList.remove('collapsed'); }
    }
    parent = parent.parentElement;
  }
}
function findAndScrollToUnfilled() {
  document.querySelectorAll('.frow.unfilled-highlight,.field.unfilled-highlight,.field-row.unfilled-highlight').forEach(el => el.classList.remove('unfilled-highlight'));
  if (!STATE.general.type) {
    showToast('⚠️ Сначала выберите тип электровоза');
    const ts = document.querySelector('#generalGrid select');
    if (ts) { ts.focus(); ts.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return;
  }
  const list = getUnfilledElements();
  if (list.length === 0) { showToast('✅ Все данные заполнены!'); updateFindBadge(); return; }
  const { el, focus } = list[0];
  expandCollapsedForRow(el);
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('unfilled-highlight');
    setTimeout(() => { if (focus && !focus.disabled) { try { focus.focus({ preventScroll: true }); } catch (e) {} } }, 450);
    setTimeout(() => { el.classList.remove('unfilled-highlight'); }, 4000);
  });
  const rem = list.length;
  if (rem > 1) showToast(\`Переход к незаполненному полю. Осталось: \${rem - 1}\`);
  else showToast('Переход к последнему незаполненному полю');
}

async function init() {
  const hasAuth = await checkAuth();
  if (!hasAuth) {
    __tmhShowLoginModal();
  } else {
    showContinueDialogOrStart();
  }

  document.getElementById('loginBtn').onclick = async function() {
    const login = document.getElementById('loginInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const error = document.getElementById('loginError');
    if (!login || !password) { error.textContent = 'Заполните все поля'; error.classList.add('show'); return; }
    if (await doLogin(login, password)) {
      error.classList.remove('show');
      showContinueDialogOrStart();
    } else {
      error.textContent = 'Неверный логин или пароль';
      error.classList.add('show');
    }
  };
  document.getElementById('loginInput').onkeypress = function(e) { if (e.key === 'Enter') document.getElementById('loginBtn').click(); };
  document.getElementById('passwordInput').onkeypress = function(e) { if (e.key === 'Enter') document.getElementById('loginBtn').click(); };
  document.getElementById('logoutBtn').onclick = doLogout;

  document.getElementById('continueBtn').onclick = function() {
    loadState();
    startApp(false);
  };
  document.getElementById('newBtn').onclick = async function() {
    const api = __getTMHAuthApi();
    if (api && typeof api.beginNewOfflineChecklistInstance === 'function' && window.__TMH_STORAGE_UID) {
      try { await api.beginNewOfflineChecklistInstance(LS_KEY); }
      catch (error) { showToast('Не удалось создать новый чек-лист: ' + (error.message || error)); return; }
    }
    fullClearState();
    startApp(true);
  };

  document.getElementById('btnSave').onclick = () => saveState();
  document.getElementById('btnSaveHtml').onclick = saveAsHtmlFile;
  document.getElementById('btnExportWithPhotos').onclick = exportWithPhotos;
  document.getElementById('btnExportJson').onclick = exportJson;
  document.getElementById('btnImportJson').onclick = importJson;
  document.getElementById('jsonFileInput').onchange = function(e) {
    const file = this.files[0];
    if (file) {
      handleJsonFile(file);
      this.value = '';
    }
  };
  document.getElementById('btnPrint').onclick = () => window.print();
  document.getElementById('btnFindUnfilled').onclick = findAndScrollToUnfilled;
  document.getElementById('btnReset').onclick = () => {
    if (confirm('Очистить все данные чек-листа? Это действие необратимо.')) {
      fullClearState();
      renderGeneral();
      renderEquip();
      showToast('Все данные очищены');
    }
  };

  const scrollBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) scrollBtn.classList.add('visible');
    else scrollBtn.classList.remove('visible');
  });
  scrollBtn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  window.addEventListener('beforeunload', function() { saveState(true); });
  setInterval(() => saveState(true), 20000);

  initThemeSwitch();
}

init();
<\/script>
</body>
</html>`;
