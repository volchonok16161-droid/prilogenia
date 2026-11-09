// Lazily loaded standalone HTML source for the BI checklist mode.
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
    <title>Чек-лист — ПО МСУД-015</title>
    <script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js">
    <\/script>
    <script>
        (function() {
            try {
                var t = localStorage.getItem('checklist_theme_v1');
                if (t !== 'tmh' && t !== 'standard' && t !== 'dark') t = 'tmh';
                document.documentElement.setAttribute('data-theme', t);
            } catch (e) {
                document.documentElement.setAttribute('data-theme', 'tmh');
            }
        })();
    <\/script>
    <style>
        /* ===== СТИЛИ (полный набор) ===== */
        :root {
            --bg: #eef4fb;
            --panel: #ffffff;
            --panel2: #f2f7fc;
            --line: #cfe0f0;
            --ink: #16324f;
            --ink-dim: #6d84a0;
            --amber: #2f7dd6;
            --amber-dim: #1a5bb8;
            --ok: #1f9d55;
            --bad: #d1453b;
            --info: #2f7dd6;
            --gold: #d4a017;
            --gold-light: #f9f0d0;
            --mono: 'JetBrains Mono', 'Consolas', monospace;
            --sans: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }
        html[data-theme="tmh"] {
            --bg: #f0f6fc;
            --panel: #ffffff;
            --panel2: #e8f2fb;
            --line: #c6def2;
            --ink: #0c2f52;
            --ink-dim: #5c7a99;
            --amber: #0a5eb0;
            --amber-dim: #083f78;
            --ok: #1f9d55;
            --bad: #d1453b;
            --info: #1a86d9;
        }
        html[data-theme="tmh"] .topbar {
            background: linear-gradient(180deg, #0a5eb0, #0c4a8c 92%);
            border-bottom: 2px solid #083058;
        }
        html[data-theme="tmh"] .topbar .brand .title-block h1 {
            color: #ffffff;
        }
        html[data-theme="tmh"] .topbar .brand .title-block small {
            color: #cfe4f7;
        }
        html[data-theme="tmh"] .topbar .brand .tag {
            background: #ffffff;
            color: #0a5eb0;
        }
        html[data-theme="tmh"] .topbar .brand .logo-block .tmh-logo .tmh {
            color: #ffffff;
        }
        html[data-theme="tmh"] .topbar .brand .logo-block .tmh-logo .tmh-sub {
            color: #cfe4f7;
        }
        html[data-theme="tmh"] .topbar .brand .logo-block .nevz-logo .nevz {
            color: #ffffff;
        }
        html[data-theme="tmh"] .topbar .brand .logo-block .nevz-logo .nevz-sub {
            color: #cfe4f7;
        }
        html[data-theme="tmh"] .topbar .brand .logo-block .divider {
            background: #ffffff40;
        }
        html[data-theme="tmh"] .stat {
            color: #cfe4f7;
            border-left-color: #ffffff30;
        }
        html[data-theme="tmh"] .stat b {
            color: #ffffff;
        }
        html[data-theme="tmh"] .stat.bad b {
            color: #ffd6d1;
        }
        html[data-theme="tmh"] .stat.ok b {
            color: #c9f5da;
        }
        html[data-theme="tmh"] .user-info {
            color: #cfe4f7;
            border-left-color: #ffffff30;
        }
        html[data-theme="tmh"] .user-info .role {
            color: #ffffff;
        }
        html[data-theme="tmh"] .user-info .logout-btn {
            border-color: #ffffff40;
            color: #cfe4f7;
        }
        html[data-theme="tmh"] .user-info .logout-btn:hover {
            border-color: #ffd6d1;
            color: #ffd6d1;
        }
        html[data-theme="tmh"] .theme-switch {
            border-color: #ffffff40;
            background: #ffffff1a;
        }
        html[data-theme="tmh"] .theme-switch button {
            color: #cfe4f7;
        }
        html[data-theme="tmh"] .theme-switch button.active {
            background: #ffffff;
            color: #0a5eb0;
        }
        html[data-theme="tmh"] body {
            background: linear-gradient(180deg, #e4f0fb, #f5fafd 520px);
        }
        html[data-theme="tmh"] .card {
            border-color: #b9d7f0;
        }
        html[data-theme="tmh"] .field input,
        html[data-theme="tmh"] .field select {
            border-color: #b9d7f0;
        }
        html[data-theme="tmh"] .picker-wrap {
            border-color: #b9d7f0;
        }
        html[data-theme="tmh"] .chip {
            background: #e6f1fb;
            border-color: #b9d7f0;
            color: #456a8c;
        }
        html[data-theme="tmh"] .chip .n {
            background: #0a5eb01f;
            color: #0a5eb0;
        }
        html[data-theme="tmh"] .chip.active {
            background: var(--amber);
            color: #ffffff;
            border-color: var(--amber);
            box-shadow: 0 2px 12px rgba(10, 94, 176, 0.6);
        }
        html[data-theme="tmh"] .chip.active .n {
            background: #ffffff30;
            color: #ffffff;
        }
        html[data-theme="tmh"] .equip {
            border-color: #b9d7f0;
            box-shadow: 0 2px 10px #0a5eb012;
        }
        html[data-theme="tmh"] .equip>.eh {
            background: linear-gradient(90deg, #0a5eb0, #0c4a8c 120%);
            border-bottom-color: #083058;
        }
        html[data-theme="tmh"] .equip>.eh h2 {
            color: #ffffff;
        }
        html[data-theme="tmh"] .equip>.eh .badge {
            color: #cfe4f7;
        }
        html[data-theme="tmh"] .sec+.sec {
            border-top-color: #c6def2;
        }
        html[data-theme="tmh"] .sec h3 {
            color: #0a5eb0;
        }
        html[data-theme="tmh"] .grp .gh {
            color: #3f6690;
        }
        html[data-theme="tmh"] .inst {
            background: #f2f8fd;
            border-color: #c6def2;
        }
        html[data-theme="tmh"] .inst .ih .lbl {
            color: #0c2f52;
        }
        html[data-theme="tmh"] .pill.na {
            background: #dcebf8;
            color: #456a8c;
        }
        html[data-theme="tmh"] .frow select,
        html[data-theme="tmh"] .frow input[type=text] {
            border-color: #c6def2;
        }
        html[data-theme="tmh"] .frow.auto .val {
            border-color: #c6def2;
        }
        html[data-theme="tmh"] .footbar {
            background: #eaf3fbee;
            border-top-color: #b9d7f0;
            box-shadow: 0 -2px 14px #0a5eb01a;
        }
        html[data-theme="tmh"] button.btn {
            border-color: #b9d7f0;
        }
        html[data-theme="tmh"] .select-type-message {
            border-color: #0a5eb0;
            background: #eef6fc;
        }
        html[data-theme="tmh"] .modal {
            border-color: #0a5eb0;
        }
        html[data-theme="tmh"] ::selection {
            background: #0a5eb0;
            color: #fff;
        }
        html[data-theme="tmh"] .mk84-warning {
            background: #fce8e6;
            border-left-color: #d1453b;
        }
        html[data-theme="tmh"] .sec-wrapper .sec-header {
            background: var(--panel2);
            border-bottom: 1px solid var(--line);
        }
        html[data-theme="tmh"] .sec-wrapper .sec-header .sec-toggle-icon {
            color: var(--amber);
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
        html[data-theme="dark"] {
            --bg: #12181f;
            --panel: #1a222c;
            --panel2: #212b37;
            --line: #2c3a48;
            --ink: #e8edf2;
            --ink-dim: #8ea0b0;
            --amber: #3f8ce0;
            --amber-dim: #1d5f9c;
            --ok: #3fae6a;
            --bad: #d9553f;
            --info: #3f8ce0;
        }
        html[data-theme="dark"] .topbar {
            background: linear-gradient(180deg, #0d1218, #141b23 90%);
        }
        html[data-theme="dark"] .topbar .brand .logo-block .nevz-logo .nevz {
            color: var(--ink);
        }
        html[data-theme="dark"] .topbar .brand .logo-block .tmh-logo .tmh-sub,
        html[data-theme="dark"] .topbar .brand .logo-block .nevz-logo .nevz-sub {
            color: #9fb3c6;
        }
        html[data-theme="dark"] .chip .n {
            background: #ffffff14;
        }
        html[data-theme="dark"] .chip.active .n {
            background: #ffffff30;
        }
        html[data-theme="dark"] .inst {
            background: #161d25;
        }
        html[data-theme="dark"] .pill.na {
            background: #2c3a48;
            color: var(--ink-dim);
        }
        html[data-theme="dark"] .pill.ok {
            background: #173425;
            color: var(--ok);
        }
        html[data-theme="dark"] .pill.bad {
            background: #3a1f1a;
            color: var(--bad);
        }
        html[data-theme="dark"] .frow {
            border-top-color: #ffffff0c;
        }
        html[data-theme="dark"] .footbar {
            background: #0d1218ee;
            box-shadow: 0 -2px 12px #00000040;
        }
        html[data-theme="dark"] .toast {
            color: #0d1a12;
        }
        html[data-theme="dark"] .theme-switch {
            background: var(--panel2);
        }
        html[data-theme="dark"] ::selection {
            background: var(--amber-dim);
            color: #fff;
        }
        html[data-theme="dark"] .mk84-warning {
            background: #3a1f1a;
            border-left-color: #d9553f;
        }
        html[data-theme="dark"] .sec-wrapper .sec-header {
            background: var(--panel2);
            border-bottom: 1px solid var(--line);
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
        .theme-switch {
            display: flex;
            align-items: center;
            gap: 2px;
            border: 1px solid var(--line);
            border-radius: 20px;
            padding: 2px;
            background: var(--panel2);
            margin-left: 14px;
        }
        .theme-switch button {
            font-family: var(--sans);
            font-size: 11px;
            font-weight: 600;
            border: none;
            background: transparent;
            color: var(--ink-dim);
            padding: 6px 12px;
            border-radius: 16px;
            cursor: pointer;
            transition: .15s;
        }
        .theme-switch button.active {
            background: var(--amber);
            color: #ffffff;
        }
        .theme-switch button:not(.active):hover {
            color: var(--ink);
        }
        * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }
        html,
        body {
            margin: 0;
            padding: 0;
            background: var(--bg);
            color: var(--ink);
            font-family: var(--sans);
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
        }
        body {
            padding-bottom: 120px;
            max-width: 100vw;
        }
        button,
        .chip,
        select,
        input {
            touch-action: manipulation;
        }
        ::selection {
            background: var(--amber-dim);
            color: #fff;
        }
        .red-after {
            color: red;
        }
        .topbar {
            position: relative;
            z-index: 50;
            background: linear-gradient(180deg, #ffffff, #dceafc 90%);
            border-bottom: 2px solid var(--amber-dim);
            padding: 10px 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        .topbar .brand {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-right: auto;
        }
        .topbar .brand .logo-block {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .topbar .brand .logo-block .tmh-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 1.1;
        }
        .topbar .brand .logo-block .tmh-logo .tmh {
            font-family: var(--mono);
            font-weight: 700;
            font-size: 18px;
            letter-spacing: .05em;
            color: #2f7dd6;
        }
        .topbar .brand .logo-block .tmh-logo .tmh-sub {
            font-size: 7px;
            font-weight: 600;
            color: #6d84a0;
            letter-spacing: .08em;
            text-transform: uppercase;
        }
        .topbar .brand .logo-block .divider {
            width: 2px;
            height: 40px;
            background: var(--line);
        }
        .topbar .brand .logo-block .nevz-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 1.15;
        }
        .topbar .brand .logo-block .nevz-logo .nevz {
            font-family: var(--mono);
            font-weight: 700;
            font-size: 14px;
            letter-spacing: .05em;
            color: #16324f;
        }
        .topbar .brand .logo-block .nevz-logo .nevz-sub {
            font-size: 6.5px;
            font-weight: 600;
            color: #6d84a0;
            letter-spacing: .06em;
            text-transform: uppercase;
            text-align: center;
        }
        .topbar .brand .tag {
            font-family: var(--mono);
            font-weight: 700;
            font-size: 13px;
            letter-spacing: .12em;
            color: var(--bg);
            background: var(--amber);
            padding: 4px 8px;
            border-radius: 3px;
        }
        .topbar .brand .title-block h1 {
            font-size: 15px;
            margin: 0;
            font-weight: 600;
            color: var(--ink);
        }
        .topbar .brand .title-block small {
            display: block;
            color: var(--ink-dim);
            font-size: 11px;
            margin-top: 1px;
        }
        .stat {
            font-family: var(--mono);
            font-size: 12px;
            color: var(--ink-dim);
            border-left: 1px solid var(--line);
            padding-left: 14px;
        }
        .stat b {
            display: block;
            font-size: 18px;
            color: var(--ink);
            font-weight: 700;
            line-height: 1.1;
        }
        .stat.bad b {
            color: var(--bad);
        }
        .stat.ok b {
            color: var(--ok);
        }
        .stat-bar {
            position: sticky;
            top: 0;
            z-index: 55;
            display: flex;
            align-items: center;
            gap: 0;
            background: var(--panel);
            border-bottom: 1px solid var(--line);
            box-shadow: 0 2px 10px rgba(10, 42, 77, 0.10);
            padding: 5px 12px;
            padding-top: max(5px, env(safe-area-inset-top));
            padding-left: max(12px, env(safe-area-inset-left));
            padding-right: max(12px, env(safe-area-inset-right));
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        .stat-bar::-webkit-scrollbar {
            display: none;
        }
        .mini-stat {
            display: flex;
            align-items: baseline;
            gap: 5px;
            flex-shrink: 0;
            padding: 3px 11px;
            border-right: 1px solid var(--line);
            white-space: nowrap;
        }
        .mini-stat:last-of-type {
            border-right: none;
        }
        .mini-stat b {
            font-family: var(--mono);
            font-weight: 700;
            font-size: 14.5px;
            color: var(--ink);
        }
        .mini-stat span {
            font-size: 10px;
            color: var(--ink-dim);
            text-transform: uppercase;
            letter-spacing: .03em;
        }
        .mini-stat.ok b {
            color: var(--ok);
        }
        .mini-stat.bad b {
            color: var(--bad);
        }
        .mini-stat.fill {
            margin-left: auto;
            padding-right: 0;
        }
        .mini-stat.fill b {
            color: var(--amber);
        }
        .mini-progress {
            position: absolute;
            left: 0;
            right: 0;
            bottom: -1px;
            height: 2px;
            background: var(--line);
        }
        .mini-progress-fill {
            height: 100%;
            width: 0%;
            background: var(--amber);
            transition: width .25s ease;
        }
        .btnrow {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        button.btn {
            font-family: var(--sans);
            font-size: 12.5px;
            font-weight: 600;
            background: var(--panel2);
            color: var(--ink);
            border: 1px solid var(--line);
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: .15s;
        }
        button.btn:hover {
            border-color: var(--amber);
            color: var(--amber);
        }
        button.btn.primary {
            background: var(--amber);
            color: #ffffff;
            border-color: var(--amber);
        }
        button.btn.primary:hover {
            background: #5b9ce8;
            color: #ffffff;
        }
        button.btn.danger:hover {
            border-color: var(--bad);
            color: var(--bad);
        }
        button.btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        .wrap {
            max-width: 1180px;
            margin: 0 auto;
            padding: 22px 20px 0;
        }
        .section-title {
            font-family: var(--mono);
            font-size: 11px;
            letter-spacing: .14em;
            text-transform: uppercase;
            color: var(--amber);
            margin: 34px 0 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section-title::after {
            content: "";
            flex: 1;
            height: 1px;
            background: var(--line);
        }
        .card {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 18px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 14px;
        }
        .field {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .field label {
            font-size: 11.5px;
            color: var(--ink-dim);
            font-weight: 600;
        }
        .field input,
        .field select {
            background: var(--panel2);
            border: 1px solid var(--line);
            color: var(--ink);
            padding: 9px 10px;
            border-radius: 6px;
            font-size: 13.5px;
            font-family: var(--sans);
        }
        .field input:focus,
        .field select:focus {
            outline: none;
            border-color: var(--amber);
        }
        .field input:disabled,
        .field select:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            background: var(--line);
        }
        .field select.auto-filled {
            background: var(--panel2);
            color: var(--ink);
            font-weight: 600;
        }
        .field .hint-lock {
            font-size: 11px;
            color: var(--ink-dim);
            margin-top: 2px;
        }
        .picker {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .chip {
            font-size: 12.5px;
            padding: 8px 13px;
            border-radius: 20px;
            border: 1px solid var(--line);
            background: var(--panel2);
            color: var(--ink-dim);
            cursor: pointer;
            user-select: none;
            transition: .15s;
            display: flex;
            align-items: center;
            gap: 7px;
        }
        .chip .n {
            font-family: var(--mono);
            font-size: 10.5px;
            background: #0a2a4d14;
            padding: 1px 6px;
            border-radius: 8px;
        }
        .chip.active {
            background: var(--amber);
            color: #ffffff;
            border-color: var(--amber);
            font-weight: 600;
        }
        .chip.active .n {
            background: #ffffff30;
        }
        .chip:hover {
            border-color: var(--amber);
        }
        .equip {
            margin-top: 22px;
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 10px;
            overflow: hidden;
        }
        .equip>.eh {
            padding: 14px 18px;
            background: var(--panel2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--line);
        }
        .equip>.eh h2 {
            font-size: 14.5px;
            margin: 0;
            font-weight: 700;
        }
        .equip>.eh .badge {
            font-family: var(--mono);
            font-size: 11px;
            color: var(--ink-dim);
        }
        .sec {
            padding: 16px 18px;
        }
        .sec+.sec {
            border-top: 1px dashed var(--line);
        }
        .sec h3 {
            font-size: 11px;
            letter-spacing: .1em;
            text-transform: uppercase;
            color: var(--info);
            margin: 0 0 12px;
            font-family: var(--mono);
        }
        .grp {
            margin-bottom: 16px;
        }
        .grp .gh {
            font-size: 12px;
            color: var(--ink-dim);
            margin-bottom: 8px;
            font-weight: 600;
        }
        .inst {
            border: 1px solid var(--line);
            border-left: 3px solid var(--line);
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 10px;
            background: #f7fafd;
            transition: .2s;
        }
        .inst.flag-ok {
            border-left-color: var(--ok);
        }
        .inst.flag-bad {
            border-left-color: var(--bad);
        }
        .inst .ih {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            gap: 10px;
            flex-wrap: wrap;
        }
        .inst .ih .lbl {
            font-family: var(--mono);
            font-size: 12.5px;
            color: var(--ink);
            font-weight: 700;
        }
        .inst .ih .sub {
            font-size: 11px;
            color: var(--ink-dim);
        }
        .pill {
            font-family: var(--mono);
            font-size: 10.5px;
            font-weight: 700;
            padding: 3px 9px;
            border-radius: 20px;
            letter-spacing: .03em;
        }
        .pill.na {
            background: #e2ecf7;
            color: var(--ink-dim);
        }
        .pill.ok {
            background: #e1f7ea;
            color: var(--ok);
        }
        .pill.bad {
            background: #fce8e6;
            color: var(--bad);
        }
        .frow {
            display: grid;
            grid-template-columns: minmax(200px, 1.4fr) minmax(160px, 1fr);
            gap: 10px 16px;
            align-items: start;
            padding: 6px 0;
            border-top: 1px solid #0a2a4d12;
        }
        .frow:first-of-type {
            border-top: none;
        }
        .frow .flabel {
            font-size: 12.5px;
            color: var(--ink);
            padding-top: 8px;
            line-height: 1.35;
        }
        .frow .flabel .hint {
            display: block;
            font-size: 11px;
            color: var(--ink-dim);
            font-weight: 400;
            margin-top: 4px;
            padding: 4px 8px;
            background: var(--panel2);
            border-radius: 4px;
            border-left: 3px solid var(--amber);
        }
        .frow select,
        .frow input[type=text] {
            width: 100%;
            background: var(--panel2);
            border: 1px solid var(--line);
            color: var(--ink);
            padding: 8px 9px;
            border-radius: 6px;
            font-size: 13px;
            font-family: var(--sans);
            transition: border-color 0.2s, background 0.2s;
        }
        .frow select:focus,
        .frow input:focus {
            outline: none;
            border-color: var(--amber);
        }
        .frow select:disabled,
        .frow input[type=text]:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            background: var(--line);
        }
        /* Подсветка выбора */
        .frow-ok select {
            border-color: var(--ok) !important;
            background: #e1f7ea;
        }
        .frow-bad select {
            border-color: var(--bad) !important;
            background: #fce8e6;
        }
        .frow.auto .flabel {
            color: var(--amber);
            font-weight: 600;
        }
        .frow.auto .val {
            padding: 8px 10px;
            border-radius: 6px;
            font-family: var(--mono);
            font-size: 12.5px;
            font-weight: 700;
            background: var(--panel2);
            border: 1px solid var(--line);
        }
        .frow.auto .val.bad {
            color: var(--bad);
            border-color: var(--bad);
        }
        .frow.auto .val.ok {
            color: var(--ok);
            border-color: var(--ok);
        }
        .frow.auto .val.na {
            color: var(--ink-dim);
        }
        .mk84-warning {
            display: none;
            color: var(--bad);
            font-size: 12px;
            font-weight: 600;
            margin-top: 4px;
            padding: 6px 10px;
            background: #fce8e6;
            border-radius: 4px;
            border-left: 3px solid var(--bad);
            grid-column: 1 / -1;
        }
        html[data-theme="dark"] .mk84-warning {
            background: #3a1f1a;
            border-left-color: #d9553f;
        }
        .inst.mk84-detected {
            border-left-color: var(--bad) !important;
            background: var(--panel2);
        }
        .inst.mk84-detected .ih .lbl::after {
            content: " ⚠️ МК-84";
            color: var(--bad);
            font-weight: 700;
        }
        .photo-area {
            margin-top: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
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
            white-space: nowrap;
        }
        .photo-btn:hover {
            border-color: var(--amber);
        }
        .photo-btn.photo-required {
            border-color: var(--bad);
            background: #ffe0db;
            animation: blink-border 1s infinite;
        }
        @keyframes blink-border {
            0% {
                border-color: var(--bad);
                box-shadow: 0 0 0 0 rgba(209, 69, 59, 0.4);
            }
            50% {
                border-color: #ff0000;
                box-shadow: 0 0 0 6px rgba(209, 69, 59, 0);
            }
            100% {
                border-color: var(--bad);
                box-shadow: 0 0 0 0 rgba(209, 69, 59, 0.4);
            }
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
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
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
            .scroll-top-btn {
                display: none !important;
            }
            .sec-body.collapsed {
                display: block !important;
            }
            .sec-header {
                display: none !important;
            }
        }
        .footbar {
            position: relative;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 40;
            background: #ffffffee;
            backdrop-filter: blur(6px);
            border-top: 1px solid var(--line);
            box-shadow: 0 -2px 12px #0a2a4d10;
            padding: 10px 20px;
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .toast {
            position: fixed;
            bottom: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--ok);
            color: #0d1a12;
            font-weight: 700;
            font-size: 12.5px;
            padding: 9px 16px;
            border-radius: 8px;
            opacity: 0;
            pointer-events: none;
            transition: .25s;
            z-index: 60;
        }
        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(-6px);
        }
        @media (max-width:640px) {
            .frow {
                grid-template-columns: 1fr;
            }
            .topbar {
                padding: 8px 12px;
                gap: 8px;
            }
            .topbar .brand {
                gap: 8px;
            }
            .topbar .brand .logo-block .nevz-logo .nevz-sub {
                display: none;
            }
            .topbar .brand .logo-block .tmh-logo .tmh-sub {
                display: none;
            }
            .topbar .brand .logo-block .divider {
                height: 26px;
            }
            .topbar .brand .title-block h1 {
                font-size: 12.5px;
            }
            .topbar .brand .title-block small {
                font-size: 9.5px;
            }
            .theme-switch {
                margin-left: 0;
            }
            .mini-stat {
                padding: 3px 8px;
            }
            .mini-stat b {
                font-size: 13px;
            }
            .mini-stat span {
                font-size: 9px;
            }
            .field input,
            .field select,
            .frow select,
            .frow input[type=text] {
                font-size: 16px;
                padding: 10px 10px;
            }
            button.btn {
                min-height: 44px;
                padding: 10px 14px;
            }
            .chip {
                min-height: 40px;
                padding: 9px 14px;
            }
            .theme-switch button {
                min-height: 36px;
                padding: 8px 10px;
            }
            .field input,
            .field select,
            .frow select {
                min-height: 44px;
            }
            .footbar {
                padding: 8px 10px;
                padding-bottom: max(8px, env(safe-area-inset-bottom));
                gap: 8px;
            }
            .footbar .btn {
                flex: 1 1 auto;
                min-width: 0;
            }
            .wrap {
                padding: 16px 12px 0;
            }
            .card {
                padding: 14px;
            }
            .section-title {
                margin: 24px 0 8px;
            }
            .sec-header {
                font-size: 13px;
                padding: 10px 14px;
            }
            .scroll-top-btn {
                bottom: 75px;
                right: 12px;
                width: 42px;
                height: 42px;
                font-size: 20px;
            }
        }
        @media (max-width:380px) {
            .topbar .brand .tag {
                font-size: 11px;
                padding: 3px 6px;
            }
            .mini-stat {
                padding: 3px 6px;
            }
        }
        .select-type-message {
            margin-top: 22px;
            background: var(--panel);
            border: 2px solid var(--amber);
            border-radius: 10px;
            padding: 40px 20px;
            text-align: center;
            color: var(--ink-dim);
        }
        .select-type-message .icon {
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
        }
        .select-type-message .title {
            font-size: 20px;
            font-weight: 600;
            color: var(--amber);
            margin-bottom: 8px;
        }
        .select-type-message .sub {
            font-size: 14px;
            color: var(--ink-dim);
        }
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(4px);
            display: none;
        }
        .modal {
            background: var(--panel);
            border: 2px solid var(--amber);
            border-radius: 12px;
            padding: 35px 40px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .modal h2 {
            margin: 0 0 8px 0;
            color: var(--amber);
            font-size: 24px;
        }
        .modal p {
            color: var(--ink-dim);
            margin-bottom: 24px;
            font-size: 14px;
        }
        .modal .field {
            margin-bottom: 16px;
        }
        .modal .field label {
            display: block;
            font-size: 12px;
            color: var(--ink-dim);
            font-weight: 600;
            margin-bottom: 4px;
        }
        .modal .field input {
            width: 100%;
            background: var(--panel2);
            border: 1px solid var(--line);
            color: var(--ink);
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 14px;
            margin-top: 0;
        }
        .modal .field input:focus {
            outline: none;
            border-color: var(--amber);
        }
        .modal .btn-row {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .modal .btn-row button {
            flex: 1;
            padding: 10px 16px;
        }
        .modal .error {
            color: var(--bad);
            font-size: 13px;
            margin-top: 8px;
            display: none;
            text-align: center;
        }
        .modal .error.show {
            display: block;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--ink-dim);
            border-left: 1px solid var(--line);
            padding-left: 14px;
        }
        .user-info .role {
            font-weight: 600;
            color: var(--amber);
        }
        .user-info .role.dim {
            color: var(--ink-dim);
        }
        .user-info .logout-btn {
            background: none;
            border: 1px solid var(--line);
            color: var(--ink-dim);
            padding: 3px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            font-family: var(--sans);
        }
        .user-info .logout-btn:hover {
            border-color: var(--bad);
            color: var(--bad);
        }
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
            <div class="title-block"><h1>Чек-лист проверки ПО МСУД-015 при выполнении ТО-2,ТР-50,ТР-250,ТР-500</h1><small>Проверка установленной защиты системного диска</small></div>
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
        <div class="section-title">Проверка ПО МСУД-015</div>
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
    <div class="toast" id="toast"></div>

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

    <!-- Модалка выбора "Продолжить / Новый" -->
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
            updateStats();
        }

        /* ========================================================================
           ДАННЫЕ ИЗ КЖЦ (база номеров) — полный список из Excel
           ======================================================================== */
        const LOCOMOTIVE_DATA = {
            "2ЭС5К": {
                "591": "ТЧЭ-10 Карасук",
                "592": "ТЧЭ-10 Карасук",
                "593": "ТЧЭ-10 Карасук",
                "594": "ТЧЭ-10 Карасук",
                "595": "ТЧЭ-10 Карасук",
                "596": "ТЧЭ-10 Карасук",
                "597": "ТЧЭ-10 Карасук",
                "598": "ТЧЭ-10 Карасук",
                "599": "ТЧЭ-10 Карасук",
                "600": "ТЧЭ-10 Карасук",
                "601": "ТЧЭ-10 Карасук",
                "602": "ТЧЭ-10 Карасук",
                "603": "ТЧЭ-10 Карасук",
                "604": "ТЧЭ-10 Карасук",
                "605": "ТЧЭ-10 Карасук",
                "606": "ТЧЭ-10 Карасук",
                "607": "ТЧЭ-10 Карасук",
                "608": "ТЧЭ-10 Карасук",
                "609": "ТЧЭ-10 Карасук",
                "610": "ТЧЭ-10 Карасук",
                "611": "ТЧЭ-10 Карасук",
                "612": "ТЧЭ-10 Карасук",
                "613": "ТЧЭ-10 Карасук",
                "614": "ТЧЭ-10 Карасук",
                "615": "ТЧЭ-10 Карасук",
                "616": "ТЧЭ-10 Карасук",
                "617": "ТЧЭ-10 Карасук",
                "618": "ТЧЭ-10 Карасук",
                "619": "ТЧЭ-10 Карасук",
                "620": "ТЧЭ-10 Карасук",
                "621": "ТЧЭ-11 Тимашевская",
                "622": "ТЧЭ-11 Тимашевская",
                "623": "ТЧЭ-11 Тимашевская",
                "624": "ТЧЭ-11 Тимашевская",
                "625": "ТЧЭ-11 Тимашевская",
                "626": "ТЧЭ-11 Тимашевская",
                "627": "ТЧЭ-11 Тимашевская",
                "628": "ТЧЭ-11 Тимашевская",
                "629": "ТЧЭ-11 Тимашевская",
                "630": "ТЧЭ-11 Тимашевская",
                "631": "ТЧЭ-11 Тимашевская",
                "632": "ТЧЭ-11 Тимашевская",
                "633": "ТЧЭ-11 Тимашевская",
                "634": "ТЧЭ-11 Тимашевская",
                "635": "ТЧЭ-11 Тимашевская",
                "636": "ТЧЭ-11 Тимашевская",
                "637": "ТЧЭ-11 Тимашевская",
                "638": "ТЧЭ-11 Тимашевская",
                "639": "ТЧЭ-11 Тимашевская",
                "640": "ТЧЭ-11 Тимашевская",
                "641": "ТЧЭ-11 Тимашевская",
                "642": "ТЧЭ-11 Тимашевская",
                "643": "ТЧЭ-11 Тимашевская",
                "644": "ТЧЭ-11 Тимашевская",
                "645": "ТЧЭ-11 Тимашевская",
                "646": "ТЧЭ-11 Тимашевская",
                "647": "ТЧЭ-11 Тимашевская",
                "648": "ТЧЭ-11 Тимашевская",
                "649": "ТЧЭ-11 Тимашевская",
                "650": "ТЧЭ-11 Тимашевская",
                "651": "ТЧЭ-11 Тимашевская",
                "652": "ТЧЭ-11 Тимашевская",
                "653": "ТЧЭ-7 Петров Вал",
                "654": "ТЧЭ-7 Петров Вал",
                "655": "ТЧЭ-7 Петров Вал",
                "656": "ТЧЭ-7 Петров Вал",
                "657": "ТЧЭ-7 Петров Вал",
                "658": "ТЧЭ-7 Петров Вал",
                "659": "ТЧЭ-7 Петров Вал",
                "660": "ТЧЭ-7 Петров Вал",
                "661": "ТЧЭ-7 Петров Вал",
                "662": "ТЧЭ-7 Петров Вал",
                "663": "ТЧЭ-7 Петров Вал",
                "664": "ТЧЭ-7 Петров Вал",
                "665": "ТЧЭ-7 Петров Вал",
                "666": "ТЧЭ-7 Петров Вал",
                "667": "ТЧЭ-7 Петров Вал",
                "668": "ТЧЭ-7 Петров Вал",
                "669": "ТЧЭ-7 Петров Вал",
                "670": "ТЧЭ-7 Петров Вал",
                "671": "ТЧЭ-7 Петров Вал",
                "672": "ТЧЭ-7 Петров Вал",
                "673": "ТЧЭ-5 Кандалакша",
                "674": "ТЧЭ-5 Кандалакша",
                "675": "ТЧЭ-5 Кандалакша",
                "676": "ТЧЭ-5 Кандалакша",
                "677": "ТЧЭ-5 Кандалакша",
                "678": "ТЧЭ-5 Кандалакша",
                "679": "ТЧЭ-5 Кандалакша",
                "680": "ТЧЭ-5 Кандалакша",
                "681": "ТЧЭ-5 Кандалакша",
                "682": "ТЧЭ-5 Кандалакша",
                "683": "ТЧЭ-5 Кандалакша",
                "684": "ТЧЭ-5 Кандалакша",
                "685": "ТЧЭ-5 Кандалакша",
                "686": "ТЧЭ-5 Кандалакша",
                "687": "ТЧЭ-5 Кандалакша",
                "688": "ТЧЭ-5 Кандалакша",
                "689": "ТЧЭ-7 Петров Вал",
                "690": "ТЧЭ-7 Петров Вал",
                "691": "ТЧЭ-7 Петров Вал",
                "692": "ТЧЭ-7 Петров Вал",
                "693": "ТЧЭ-11 Тимашевская",
                "694": "ТЧЭ-11 Тимашевская",
                "695": "ТЧЭ-11 Тимашевская",
                "696": "ТЧЭ-11 Тимашевская",
                "697": "ТЧЭ-11 Тимашевская",
                "698": "ТЧЭ-11 Тимашевская",
                "699": "ТЧЭ-10 Карасук",
                "700": "ТЧЭ-10 Карасук",
                "701": "ТЧЭ-10 Карасук",
                "702": "ТЧЭ-10 Карасук",
                "703": "ТЧЭ-10 Карасук",
                "704": "ТЧЭ-10 Карасук",
                "705": "ТЧЭ-10 Карасук",
                "706": "ТЧЭ-10 Карасук",
                "707": "ТЧЭ-10 Карасук",
                "708": "ТЧЭ-10 Карасук",
                "709": "ТЧЭ-10 Карасук",
                "710": "ТЧЭ-10 Карасук",
                "711": "ТЧЭ-10 Карасук",
                "712": "ТЧЭ-10 Карасук",
                "713": "ТЧЭ-10 Карасук",
                "714": "ТЧЭ-10 Карасук",
                "715": "ТЧЭ-10 Карасук",
                "716": "ТЧЭ-10 Карасук",
                "717": "ТЧЭ-10 Карасук",
                "718": "ТЧЭ-10 Карасук",
                "719": "ТЧЭ-10 Карасук",
                "720": "ТЧЭ-10 Карасук",
                "721": "ТЧЭ-10 Карасук",
                "722": "ТЧЭ-10 Карасук",
                "723": "ТЧЭ-10 Карасук",
                "724": "ТЧЭ-10 Карасук",
                "725": "ТЧЭ-10 Карасук",
                "726": "ТЧЭ-10 Карасук",
                "727": "ТЧЭ-10 Карасук",
                "728": "ТЧЭ-10 Карасук",
                "729": "ТЧЭ-10 Карасук",
                "730": "ТЧЭ-10 Карасук",
                "731": "ТЧЭ-10 Карасук",
                "732": "ТЧЭ-10 Карасук",
                "733": "ТЧЭ-10 Карасук",
                "734": "ТЧЭ-10 Карасук",
                "735": "ТЧЭ-10 Карасук",
                "736": "ТЧЭ-10 Карасук",
                "737": "ТЧЭ-10 Карасук",
                "738": "ТЧЭ-10 Карасук",
                "739": "ТЧЭ-10 Карасук",
                "740": "ТЧЭ-10 Карасук",
                "741": "ТЧЭ-10 Карасук",
                "742": "ТЧЭ-10 Карасук",
                "743": "ТЧЭ-10 Карасук",
                "744": "ТЧЭ-10 Карасук",
                "745": "ТЧЭ-10 Карасук",
                "746": "ТЧЭ-10 Карасук",
                "747": "ТЧЭ-10 Карасук",
                "748": "ТЧЭ-10 Карасук",
                "749": "ТЧЭ-10 Карасук",
                "750": "ТЧЭ-10 Карасук",
                "751": "ТЧЭ-10 Карасук",
                "752": "ТЧЭ-10 Карасук",
                "753": "ТЧЭ-10 Карасук",
                "754": "ТЧЭ-11 Тимашевская",
                "755": "ТЧЭ-11 Тимашевская",
                "756": "ТЧЭ-11 Тимашевская",
                "757": "ТЧЭ-11 Тимашевская",
                "758": "ТЧЭ-11 Тимашевская",
                "759": "ТЧЭ-11 Тимашевская",
                "760": "ТЧЭ-11 Тимашевская",
                "761": "ТЧЭ-11 Тимашевская",
                "762": "ТЧЭ-11 Тимашевская",
                "763": "ТЧЭ-11 Тимашевская",
                "764": "ТЧЭ-11 Тимашевская",
                "765": "ТЧЭ-11 Тимашевская",
                "766": "ТЧЭ-11 Тимашевская",
                "767": "ТЧЭ-11 Тимашевская",
                "768": "ТЧЭ-11 Тимашевская",
                "769": "ТЧЭ-11 Тимашевская",
                "770": "ТЧЭ-11 Тимашевская",
                "771": "ТЧЭ-11 Тимашевская",
                "772": "ТЧЭ-5 Карталы",
                "773": "ТЧЭ-5 Карталы",
                "774": "ТЧЭ-5 Карталы",
                "775": "ТЧЭ-5 Карталы",
                "776": "ТЧЭ-5 Карталы",
                "777": "ТЧЭ-5 Карталы",
                "778": "ТЧЭ-5 Карталы",
                "779": "ТЧЭ-5 Карталы",
                "780": "ТЧЭ-5 Карталы",
                "781": "ТЧЭ-5 Карталы",
                "782": "ТЧЭ-7 Петров Вал",
                "783": "ТЧЭ-7 Петров Вал",
                "784": "ТЧЭ-7 Петров Вал",
                "785": "ТЧЭ-7 Петров Вал",
                "786": "ТЧЭ-7 Петров Вал",
                "787": "ТЧЭ-7 Петров Вал",
                "788": "ТЧЭ-7 Петров Вал",
                "789": "ТЧЭ-7 Петров Вал",
                "790": "ТЧЭ-7 Петров Вал",
                "791": "ТЧЭ-7 Петров Вал",
                "792": "ТЧЭ-7 Петров Вал",
                "793": "ТЧЭ-7 Петров Вал",
                "794": "ТЧЭ-7 Петров Вал",
                "795": "ТЧЭ-7 Петров Вал",
                "796": "ТЧЭ-7 Петров Вал",
                "797": "ТЧЭ-7 Петров Вал",
                "798": "ТЧЭ-7 Петров Вал",
                "799": "ТЧЭ-14 Сальск",
                "800": "ТЧЭ-14 Сальск",
                "801": "ТЧЭ-14 Сальск",
                "802": "ТЧЭ-14 Сальск",
                "803": "ТЧЭ-14 Сальск",
                "804": "ТЧЭ-14 Сальск",
                "805": "ТЧЭ-14 Сальск",
                "806": "ТЧЭ-14 Сальск",
                "807": "ТЧЭ-14 Сальск",
                "808": "ТЧЭ-14 Сальск",
                "809": "ТЧЭ-14 Сальск",
                "810": "ТЧЭ-14 Сальск",
                "811": "ТЧЭ-14 Сальск",
                "812": "ТЧЭ-14 Сальск",
                "813": "ТЧЭ-14 Сальск",
                "814": "ТЧЭ-14 Сальск",
                "815": "ТЧЭ-14 Сальск",
                "816": "ТЧЭ-14 Сальск",
                "817": "ТЧЭ-14 Сальск",
                "818": "ТЧЭ-14 Сальск",
                "819": "ТЧЭ-9 Лянгасово",
                "820": "ТЧЭ-9 Лянгасово",
                "821": "ТЧЭ-9 Лянгасово",
                "822": "ТЧЭ-9 Лянгасово",
                "823": "ТЧЭ-9 Лянгасово",
                "824": "ТЧЭ-9 Лянгасово",
                "825": "ТЧЭ-9 Лянгасово",
                "826": "ТЧЭ-9 Лянгасово",
                "827": "ТЧЭ-9 Лянгасово",
                "828": "ТЧЭ-9 Лянгасово",
                "829": "ТЧЭ-9 Лянгасово",
                "830": "ТЧЭ-9 Лянгасово"
            },
            "3ЭС5К": {
                "1515": "ТЧЭ-3 Чита",
                "1516": "ТЧЭ-3 Чита",
                "1517": "ТЧЭ-3 Чита",
                "1518": "ТЧЭ-3 Чита",
                "1519": "ТЧЭ-3 Чита",
                "1520": "ТЧЭ-3 Чита",
                "1521": "ТЧЭ-3 Чита",
                "1522": "ТЧЭ-3 Чита",
                "1523": "ТЧЭ-3 Чита",
                "1524": "ТЧЭ-3 Чита",
                "1525": "ТЧЭ-7 Абакан",
                "1526": "ТЧЭ-7 Абакан",
                "1527": "ТЧЭ-7 Абакан",
                "1528": "ТЧЭ-7 Абакан",
                "1529": "ТЧЭ-7 Абакан",
                "1530": "ТЧЭ-7 Абакан",
                "1531": "ТЧЭ-7 Абакан",
                "1532": "ТЧЭ-7 Абакан",
                "1533": "ТЧЭ-7 Абакан",
                "1534": "ТЧЭ-7 Абакан",
                "1535": "ТЧЭ-7 Абакан",
                "1536": "ТЧЭ-7 Абакан",
                "1537": "ТЧЭ-7 Абакан",
                "1538": "ТЧЭ-7 Абакан",
                "1539": "ТЧЭ-7 Абакан",
                "1540": "ТЧЭ-7 Абакан",
                "1541": "ТЧЭ-7 Абакан",
                "1542": "ТЧЭ-7 Абакан",
                "1543": "ТЧЭ-7 Абакан",
                "1544": "ТЧЭ-7 Абакан",
                "1545": "ТЧЭ-7 Абакан",
                "1546": "ТЧЭ-7 Абакан",
                "1547": "ТЧЭ-7 Абакан",
                "1548": "ТЧЭ-7 Абакан",
                "1549": "ТЧЭ-7 Абакан",
                "1550": "ТЧЭ-7 Абакан",
                "1551": "ТЧЭ-7 Абакан",
                "1552": "ТЧЭ-7 Абакан",
                "1553": "ТЧЭ-7 Абакан",
                "1554": "ТЧЭ-7 Абакан",
                "1555": "ТЧЭ-7 Абакан",
                "1556": "ТЧЭ-7 Абакан",
                "1557": "ТЧЭ-7 Абакан",
                "1558": "ТЧЭ-7 Абакан",
                "1559": "ТЧЭ-7 Абакан",
                "1560": "ТЧЭ-7 Абакан",
                "1561": "ТЧЭ-7 Абакан",
                "1562": "ТЧЭ-7 Абакан",
                "1563": "ТЧЭ-7 Абакан",
                "1564": "ТЧЭ-7 Абакан",
                "1565": "ТЧЭ-7 Абакан",
                "1566": "ТЧЭ-10 Карасук",
                "1567": "ТЧЭ-10 Карасук",
                "1568": "ТЧЭ-10 Карасук",
                "1569": "ТЧЭ-10 Карасук",
                "1570": "ТЧЭ-10 Карасук",
                "1571": "ТЧЭ-10 Карасук",
                "1572": "ТЧЭ-10 Карасук",
                "1573": "ТЧЭ-10 Карасук",
                "1574": "ТЧЭ-10 Карасук",
                "1575": "ТЧЭ-10 Карасук",
                "1576": "ТЧЭ-7 Абакан",
                "1577": "ТЧЭ-7 Абакан",
                "1578": "ТЧЭ-7 Абакан",
                "1579": "ТЧЭ-7 Абакан",
                "1580": "ТЧЭ-7 Абакан",
                "1581": "ТЧЭ-7 Абакан",
                "1582": "ТЧЭ-7 Абакан",
                "1583": "ТЧЭ-7 Абакан",
                "1584": "ТЧЭ-7 Абакан",
                "1585": "ТЧЭ-7 Абакан",
                "1586": "ТЧЭ-7 Абакан",
                "1587": "ТЧЭ-7 Абакан",
                "1588": "ТЧЭ-7 Абакан",
                "1589": "ТЧЭ-7 Абакан",
                "1590": "ТЧЭ-7 Абакан",
                "1591": "ТЧЭ-7 Абакан",
                "1592": "ТЧЭ-7 Абакан",
                "1593": "ТЧЭ-7 Абакан",
                "1594": "ТЧЭ-7 Абакан",
                "1595": "ТЧЭ-7 Абакан",
                "1596": "ТЧЭ-7 Абакан",
                "1597": "ТЧЭ-7 Абакан",
                "1598": "ТЧЭ-7 Абакан",
                "1599": "ТЧЭ-7 Абакан",
                "1600": "ТЧЭ-7 Абакан",
                "1601": "ТЧЭ-7 Абакан",
                "1602": "ТЧЭ-7 Абакан",
                "1603": "ТЧЭ-7 Абакан",
                "1604": "ТЧЭ-7 Абакан",
                "1605": "ТЧЭ-7 Абакан",
                "1606": "ТЧЭ-7 Абакан",
                "1607": "ТЧЭ-7 Абакан",
                "1608": "ТЧЭ-7 Абакан",
                "1609": "ТЧЭ-7 Абакан",
                "1610": "ТЧЭ-7 Абакан",
                "1611": "ТЧЭ-7 Абакан",
                "1612": "ТЧЭ-7 Абакан",
                "1613": "ТЧЭ-7 Абакан",
                "1614": "ТЧЭ-7 Абакан",
                "1615": "ТЧЭ-7 Абакан",
                "1616": "ТЧЭ-7 Абакан",
                "1617": "ТЧЭ-7 Абакан",
                "1618": "ТЧЭ-7 Абакан",
                "1619": "ТЧЭ-7 Абакан",
                "1620": "ТЧЭ-7 Абакан",
                "1621": "ТЧЭ-7 Абакан",
                "1622": "ТЧЭ-7 Абакан",
                "1623": "ТЧЭ-7 Абакан",
                "1624": "ТЧЭ-7 Абакан",
                "1625": "ТЧЭ-7 Абакан",
                "1626": "ТЧЭ-7 Абакан",
                "1627": "ТЧЭ-7 Абакан",
                "1628": "ТЧЭ-7 Абакан",
                "1629": "ТЧЭ-7 Абакан",
                "1630": "ТЧЭ-7 Абакан",
                "1631": "ТЧЭ-7 Абакан",
                "1632": "ТЧЭ-7 Абакан",
                "1633": "ТЧЭ-7 Абакан",
                "1634": "ТЧЭ-7 Абакан",
                "1635": "ТЧЭ-7 Абакан",
                "1636": "ТЧЭ-7 Абакан",
                "1637": "ТЧЭ-7 Абакан",
                "1638": "ТЧЭ-7 Абакан",
                "1639": "ТЧЭ-7 Абакан",
                "1640": "ТЧЭ-7 Абакан",
                "1641": "ТЧЭ-7 Абакан",
                "1642": "ТЧЭ-7 Абакан",
                "1643": "ТЧЭ-7 Абакан",
                "1644": "ТЧЭ-7 Абакан",
                "1645": "ТЧЭ-7 Абакан",
                "1646": "ТЧЭ-7 Абакан",
                "1647": "ТЧЭ-7 Абакан",
                "1648": "ТЧЭ-7 Абакан",
                "1649": "ТЧЭ-7 Абакан",
                "1650": "ТЧЭ-7 Абакан",
                "1651": "ТЧЭ-7 Абакан",
                "1652": "ТЧЭ-1 Боготол",
                "1653": "ТЧЭ-1 Боготол",
                "1654": "ТЧЭ-1 Боготол",
                "1655": "ТЧЭ-1 Боготол",
                "1656": "ТЧЭ-1 Боготол",
                "1657": "ТЧЭ-1 Боготол",
                "1658": "ТЧЭ-1 Боготол",
                "1659": "ТЧЭ-1 Боготол",
                "1660": "ТЧЭ-1 Боготол",
                "1661": "ТЧЭ-1 Боготол",
                "1662": "ТЧЭ-1 Боготол",
                "1663": "ТЧЭ-1 Боготол",
                "1664": "ТЧЭ-1 Боготол",
                "1665": "ТЧЭ-1 Боготол",
                "1666": "ТЧЭ-1 Боготол",
                "1667": "ТЧЭ-1 Боготол",
                "1668": "ТЧЭ-1 Боготол",
                "1669": "ТЧЭ-1 Боготол",
                "1670": "ТЧЭ-1 Боготол",
                "1671": "ТЧЭ-1 Боготол",
                "1672": "ТЧЭ-1 Боготол",
                "1673": "ТЧЭ-1 Боготол",
                "1674": "ТЧЭ-1 Боготол",
                "1675": "ТЧЭ-1 Боготол",
                "1676": "ТЧЭ-1 Боготол",
                "1677": "ТЧЭ-1 Боготол",
                "1678": "ТЧЭ-1 Боготол",
                "1679": "ТЧЭ-1 Боготол",
                "1680": "ТЧЭ-1 Боготол",
                "1681": "ТЧЭ-1 Боготол",
                "1682": "ТЧЭ-1 Боготол",
                "1683": "ТЧЭ-1 Боготол",
                "1684": "ТЧЭ-1 Боготол",
                "1685": "ТЧЭ-1 Боготол",
                "1686": "ТЧЭ-1 Боготол",
                "1687": "ТЧЭ-1 Боготол",
                "1688": "ТЧЭ-1 Боготол",
                "1689": "ТЧЭ-1 Боготол",
                "1690": "ТЧЭ-1 Боготол",
                "1691": "ТЧЭ-1 Боготол",
                "1692": "ТЧЭ-1 Боготол"
            },
            "4ЭС5К": {
                "65": "ТЧЭ-8 Смоляниново",
                "66": "ТЧЭ-8 Смоляниново",
                "67": "ТЧЭ-8 Смоляниново",
                "68": "ТЧЭ-8 Смоляниново",
                "69": "ТЧЭ-8 Смоляниново",
                "70": "ТЧЭ-8 Смоляниново",
                "71": "ТЧЭ-8 Смоляниново",
                "72": "ТЧЭ-8 Смоляниново",
                "73": "ТЧЭ-8 Смоляниново",
                "74": "ТЧЭ-8 Смоляниново",
                "75": "ТЧЭ-8 Смоляниново",
                "76": "ТЧЭ-8 Смоляниново",
                "77": "ТЧЭ-8 Смоляниново",
                "78": "ТЧЭ-8 Смоляниново",
                "79": "ТЧЭ-8 Смоляниново",
                "80": "ТЧЭ-8 Смоляниново",
                "81": "ТЧЭ-8 Смоляниново",
                "82": "ТЧЭ-8 Смоляниново",
                "83": "ТЧЭ-8 Смоляниново",
                "84": "ТЧЭ-8 Смоляниново",
                "85": "ТЧЭ-8 Смоляниново",
                "86": "ТЧЭ-8 Смоляниново"
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


        const LOCOMOTIVE_TYPES = Object.keys(LOCOMOTIVE_DATA);

        function kzcNumbersForType(type) {
            if (!type || !LOCOMOTIVE_DATA[type]) return [];
            return Object.keys(LOCOMOTIVE_DATA[type]).sort((a, b) => {
                const na = parseInt(a, 10),
                    nb = parseInt(b, 10);
                if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
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

        /* ========================================================================
           ОПРЕДЕЛЕНИЕ ОБОРУДОВАНИЯ (ПО МСУД-015) — только один блок
           ======================================================================== */
        let EQUIPMENT = [];

        function getMaxSectionsForType(type) {
            if (type === '2ЭС5К') return 2;
            if (type === '3ЭС5К') return 2;
            if (type === '4ЭС5К') return 2;
            return 0;
        }

        function getSections(type) {
            const count = getMaxSectionsForType(type);
            const sections = [];
            for (let i = 1; i <= count; i++) {
                let typeName = '';
                if (i <= 2) typeName = 'кабина';
                else typeName = 'бустер';
                sections.push({ label: \`Секция №\${i}\`, typeName: typeName });
            }
            return sections;
        }

        function buildEquipment(type) {
            EQUIPMENT = [];
            if (!type) return;

            // Одно оборудование для ПО МСУД-015
            EQUIPMENT.push({
                id: 'msud',
                title: 'ПО МСУД-015',
                getFields: function(position) {
                    return [{
                        key: 'zashchita_disks',
                        label: 'Наличие установленной защиты системного диска',
                        options: ['Да', 'Нет'],
                        ok: ['Да'],
                        hint: 'На локомотиве при запуске БИ после загрузки ОС до момента запуска рабочего ПО в верхней части экрана БИ не выводится надпись красным цветом «Защита системного диска отключена» (как на рисунке, в случае отключенной защиты системного диска).',
                        photo: true
                    }];
                },
                instances: function() {
                    const sections = getSections(type);
                    return sections.map(s => ({ section: s.label }));
                }
            });
        }

        /* ========================================================================
           СОСТОЯНИЕ / ХРАНЕНИЕ
           ======================================================================== */
        let LS_KEY = 'checklist_msud_v1';
        let STATE = {
            general: { type: '', number: '', date: '', depot: '', place: '', mileage: '' },
            values: {},
            selectedSections: [],
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
                        general: { type: '', number: '', date: '', depot: '', place: '', mileage: '' },
                        values: {},
                        selectedSections: [],
                        changeLog: []
                    }, parsed);
                    if (!Array.isArray(STATE.selectedSections)) STATE.selectedSections = [];
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

/* ===== Проверка пробега по таблице (как в комплексном чек-листе) ===== */
function getMileageFromData(type,number){if(!type||!number)return null;if(typeof MILEAGE_DATA==='undefined')return null;return MILEAGE_DATA[type+'_'+number]||null;}
function isValidMileage(mileageStr,type,number){var val=parseInt(mileageStr,10);if(isNaN(val)||val<0)return false;var t=getMileageFromData(type,number);if(t!==null)return val>=t;return val>0;}
function getMileageError(mileageStr,type,number){var val=parseInt(mileageStr,10);if(isNaN(val)||val<0)return 'Введите корректное число (≥ 0)';var t=getMileageFromData(type,number);if(t!==null){if(val<t)return 'Пробег должен быть ≥ '+t+' км (по данным завода)';return null;}if(val<=0)return 'Пробег должен быть больше 0 (данные отсутствуют)';return null;}

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
                general: { type: '', number: '', date: '', depot: '', place: '', mileage: '' },
                values: {},
                selectedSections: [],
                changeLog: []
            };
            buildEquipment('');
        }

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.classList.add('show');
            clearTimeout(showToast._t);
            showToast._t = setTimeout(() => t.classList.remove('show'), 1600);
        }

        /* ========================================================================
           РЕНДЕР: ОБЩИЕ ДАННЫЕ (с валидацией номера и автозаполнением)
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
            select.value = (currentVal !== undefined && currentVal !== null && options.includes(currentVal)) ? currentVal :
            '';
        }

        function refreshChain(changedKey) {
            const type = STATE.general.type || '';
            const number = STATE.general.number || '';
            if (changedKey === 'type') {
                STATE.general.number = '';
                STATE.general.depot = '';
                STATE.general.place = '';
                STATE.selectedSections = [];
            }
            if (changedKey === 'number') {
                const rec = kzcRecord(type, number);
                STATE.general.depot = rec ? rec.depot : '';
                STATE.general.place = '';
            }
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
            dateInput.addEventListener('input', () => { STATE.general.date = dateInput.value;
                saveState(true);
                updateStats(); });
            dateInput.addEventListener('change', () => { STATE.general.date = dateInput.value;
                saveState(true);
                updateStats(); });
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
                saveState(true);
                renderGeneral();
                renderEquip();
                updateStats();
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
            numInput.placeholder = 'Введите номер электровоза';
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
                    const __numChanged = (STATE.general.number !== val);
                    STATE.general.number = val;
                    if (__numChanged) refreshChain('number'); // сброс приписки/места только при реальной смене номера
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

            // Приписка (только для чтения)
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
            fillSelectOptions(placeSelect, places, STATE.general.place || '', rec ? '— выберите место —' :
                '— сначала выберите номер —');
            placeSelect.disabled = !rec;
            placeSelect.addEventListener('change', function() {
                STATE.general.place = this.value;
                saveState(true);
                updateStats();
                renderGeneral();
            });
            placeWrap.appendChild(placeSelect);
            grid.appendChild(placeWrap);

            // Пробег
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
            const mileErr = document.createElement('div');
            mileErr.className = 'error-hint';
            mileErr.style.display = 'none';
            function __mileCheck() {
                const v = mileInput.value, t = STATE.general.type, n = STATE.general.number;
                const err = (v && t && n) ? getMileageError(v, t, n) : null;
                mileInput.classList.toggle('error', !!err);
                mileInput.dataset.mileInvalid = err ? '1' : '';
                mileErr.textContent = err || '';
                mileErr.style.display = err ? 'block' : 'none';
            }
            mileInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
                STATE.general.mileage = this.value;
                __mileCheck();
                saveState(true);
                updateStats();
            });
            mileInput.addEventListener('change', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
                STATE.general.mileage = this.value;
                __mileCheck();
                saveState(true);
                updateStats();
            });
            mileWrap.appendChild(mileInput);
            mileWrap.appendChild(mileErr);
            __mileCheck();
            if (!isReady) {
                const hint = document.createElement('div');
                hint.className = 'hint-lock';
                if (!type) hint.textContent = 'Сначала выберите тип и номер электровоза';
                else if (!rec) hint.textContent = 'Введите корректный номер электровоза';
                else if (!STATE.general.place) hint.textContent = 'Выберите место осмотра';
                mileWrap.appendChild(hint);
            }
            grid.appendChild(mileWrap);

            document.getElementById('locomotiveTypeTag').textContent = type || '—';
            renderSectionsSelection();
        }

        /* ========================================================================
           РЕНДЕР: ВЫБОР СЕКЦИЙ
           ======================================================================== */
        function renderSectionsSelection() {
            const container = document.getElementById('sectionsSelection');
            const type = STATE.general.type || '';
            if (!type) {
                container.innerHTML =
                    '<div style="color:var(--ink-dim);font-size:12px;">Выберите тип электровоза для выбора секций</div>';
                return;
            }

            const sectionObjects = getSections(type);
            const selected = STATE.selectedSections || [];

            container.innerHTML = '';
            const label = document.createElement('div');
            label.style.cssText = 'font-size:11.5px;color:var(--ink-dim);font-weight:600;margin-bottom:8px;';
            label.textContent = 'Выберите секции для осмотра';
            container.appendChild(label);

            const chipsWrapper = document.createElement('div');
            chipsWrapper.className = 'picker';

            const allChip = document.createElement('div');
            const allSelected = selected.length === sectionObjects.length;
            allChip.className = 'chip' + (allSelected ? ' active' : '');
            allChip.innerHTML = \`<span>Все</span>\`;
            allChip.onclick = function() {
                if (allSelected) {
                    STATE.selectedSections = [];
                } else {
                    STATE.selectedSections = sectionObjects.map(s => s.label);
                }
                saveState(true);
                renderSectionsSelection();
                renderEquip();
                updateStats();
            };
            chipsWrapper.appendChild(allChip);

            for (const s of sectionObjects) {
                const chip = document.createElement('div');
                const isActive = selected.includes(s.label);
                chip.className = 'chip' + (isActive ? ' active' : '');
                const typeName = s.typeName ? \` (\${s.typeName})\` : '';
                chip.innerHTML = \`<span>\${s.label}\${typeName}</span>\`;
                chip.onclick = function() {
                    const idx = STATE.selectedSections.indexOf(s.label);
                    if (idx >= 0) {
                        STATE.selectedSections.splice(idx, 1);
                    } else {
                        STATE.selectedSections.push(s.label);
                    }
                    saveState(true);
                    renderSectionsSelection();
                    renderEquip();
                    updateStats();
                };
                chipsWrapper.appendChild(chip);
            }
            container.appendChild(chipsWrapper);
        }

        /* ========================================================================
           ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЯМИ И ФОТО
           ======================================================================== */
        function instId(eqId, inst, idx) {
            return [eqId, inst.section].join('|');
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

        function computeFlag(eq, iid) {
            let anyFilled = false;
            let hasBad = false;
            const inst = eq.instances().find((_, idx) => instId(eq.id, _, idx) === iid);
            if (!inst) return { state: 'na', label: 'Нет' };
            const fields = eq.getFields(inst.position);
            for (const field of fields) {
                const val = getVal(iid, field.key);
                if (val && val !== '') {
                    anyFilled = true;
                    if (val === 'Нет') {
                        hasBad = true;
                    }
                }
            }
            if (!anyFilled) return { state: 'na', label: 'Нет' };
            return hasBad ? { state: 'bad', label: 'Да' } : { state: 'ok', label: 'Нет' };
        }

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
            if (!card) card = document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);
            if (!card) return;
            const row = card.querySelector(\`.frow[data-field-key="\${fieldKey}"]\`);
            if (!row) return;
            const photoArea = row.querySelector('.photo-area');
            if (!photoArea) return;
            const btns = photoArea.querySelectorAll('.photo-btn');
            const val = getVal(iid, fieldKey);
            const photoData = getVal(iid, fieldKey + '_photo');
            const required = !!(val && val !== '' && !photoData);
            btns.forEach(btn => {
                btn.classList.toggle('photo-required', required);
                btn.title = required ? 'Требуется фото' : 'Добавить фото';
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

        function fieldRow(eq, inst, iid, field) {
            const row = document.createElement('div');
            row.className = 'frow';
            row.dataset.fieldKey = field.key;
            const lbl = document.createElement('div');
            lbl.className = 'flabel';
            lbl.innerHTML = field.label + (field.hint ? \`<span class="hint">\${field.hint}</span>\` : '');
            row.appendChild(lbl);

            const control = document.createElement('select');
            const blank = document.createElement('option');
            blank.value = '';
            blank.textContent = '— выбрать —';
            control.appendChild(blank);
            for (const o of field.options) {
                const op = document.createElement('option');
                op.value = o;
                op.textContent = o;
                control.appendChild(op);
            }
            const savedValue = getVal(iid, field.key);
            control.value = savedValue;

            if (savedValue === 'Да') row.classList.add('frow-ok');
            else if (savedValue === 'Нет') row.classList.add('frow-bad');

            control.addEventListener('change', function() {
                const val = this.value;
                setVal(iid, field.key, val);
                row.classList.remove('frow-ok', 'frow-bad');
                if (val === 'Да') row.classList.add('frow-ok');
                else if (val === 'Нет') row.classList.add('frow-bad');
                updatePhotoRequirementForField(iid, field.key);
                refreshInstance(eq, inst, iid);
                updateStats();
            });

            const controlWrap = document.createElement('div');
            controlWrap.style.display = 'grid';
            controlWrap.style.gridTemplateColumns = '1fr';
            controlWrap.appendChild(control);
            row.appendChild(controlWrap);

            addPhotoSupport(row, field, iid);

            return row;
        }

        function buildInstanceCard(eq, inst, idx) {
            const iid = instId(eq.id, inst, idx);
            const card = document.createElement('div');
            card.className = 'inst';
            card.dataset.iid = iid;
            const head = document.createElement('div');
            head.className = 'ih';
            const lblParts = [\`\${inst.section}\`];
            const lbl = document.createElement('div');
            lbl.innerHTML = \`<span class="lbl">\${lblParts.join(' · ')}</span>\`;
            head.appendChild(lbl);
            const pill = document.createElement('span');
            pill.className = 'pill na';
            pill.textContent = '—';
            head.appendChild(pill);
            card.appendChild(head);

            const fields = eq.getFields(inst.position);
            for (const field of fields) {
                card.appendChild(fieldRow(eq, inst, iid, field));
            }

            const autoRow = document.createElement('div');
            autoRow.className = 'frow auto';
            const autoLbl = document.createElement('div');
            autoLbl.className = 'flabel';
            autoLbl.textContent = 'Наличие выявленных несоответствий';
            const autoVal = document.createElement('div');
            autoVal.className = 'val na';
            autoVal.textContent = '—';
            autoRow.appendChild(autoLbl);
            autoRow.appendChild(autoVal);
            card.appendChild(autoRow);
            card._pill = pill;
            card._autoVal = autoVal;
            refreshInstance(eq, inst, iid, card);
            return card;
        }

        function refreshInstance(eq, inst, iid, card) {
            card = card || document.querySelector(\`.inst[data-iid="\${CSS.escape(iid)}"]\`);
            if (!card) return;
            const flag = computeFlag(eq, iid);
            card.classList.remove('flag-ok', 'flag-bad');
            card._pill.className = 'pill ' + flag.state;
            card._pill.textContent = flag.label;
            card._autoVal.className = 'val ' + flag.state;
            card._autoVal.textContent = flag.label;
            if (flag.state === 'ok') card.classList.add('flag-ok');
            if (flag.state === 'bad') card.classList.add('flag-bad');
            updateStats();
        }

        /* ========================================================================
           РЕНДЕР ОБОРУДОВАНИЯ (только выбранные секции)
           ======================================================================== */
        function renderEquip() {
            const root = document.getElementById('equipRoot');
            const type = STATE.general.type || '';

            if (!type) {
                root.innerHTML =
                    \`<div class="select-type-message"><span class="icon">🚆</span><div class="title">Укажите тип электровоза</div><div class="sub">Для отображения чек-листа необходимо заполнить тип электровоза в разделе «Общие данные»</div></div>\`;
                updateStats();
                return;
            }

            const selectedSections = STATE.selectedSections || [];
            const allSections = getSections(type).map(s => s.label);

            if (selectedSections.length === 0) {
                root.innerHTML =
                    \`<div class="select-type-message"><span class="icon">📋</span><div class="title">Выберите секции</div><div class="sub">Сначала выберите секции для осмотра</div></div>\`;
                updateStats();
                return;
            }

            const active = EQUIPMENT.filter(e => true);
            if (active.length === 0) {
                root.innerHTML =
                    \`<div class="card" style="margin-top:22px;color:var(--ink-dim);text-align:center;">Нет оборудования для отображения.</div>\`;
                updateStats();
                return;
            }

            const sectionsToShow = selectedSections.length > 0 ? selectedSections : allSections;
            root.innerHTML = '';

            for (const eq of active) {
                const wrap = document.createElement('div');
                wrap.className = 'equip';
                const eh = document.createElement('div');
                eh.className = 'eh';
                const totalVisible = eq.instances().filter(inst =>
                    sectionsToShow.includes(inst.section)
                ).length;
                eh.innerHTML = \`<h2>\${eq.title}</h2><span class="badge">\${totalVisible} сек.</span>\`;
                wrap.appendChild(eh);

                const instances = eq.instances();
                const bySection = {};
                instances.forEach((inst, idx) => {
                    if (!sectionsToShow.includes(inst.section)) return;
                    bySection[inst.section] = bySection[inst.section] || [];
                    bySection[inst.section].push({ inst, idx });
                });

                const sectionNames = Object.keys(bySection);
                const accordionStateKey = \`accordion_\${eq.id}\`;
                let accordionState = {};
                try {
                    const saved = localStorage.getItem(accordionStateKey);
                    if (saved) accordionState = JSON.parse(saved);
                } catch (e) {}
                if (Object.keys(accordionState).length === 0) {
                    sectionNames.forEach((name) => { accordionState[name] = true; });
                }

                for (const sectionName of sectionNames) {
                    const items = bySection[sectionName];
                    const wrapper = document.createElement('div');
                    wrapper.className = 'sec-wrapper';

                    const header = document.createElement('div');
                    header.className = 'sec-header';
                    const isOpen = accordionState[sectionName] !== false;
                    const icon = document.createElement('span');
                    icon.className = 'sec-toggle-icon' + (isOpen ? '' : ' collapsed');
                    icon.textContent = '▼';
                    header.innerHTML = \`<span>\${sectionName}</span>\`;
                    header.appendChild(icon);
                    wrapper.appendChild(header);

                    const body = document.createElement('div');
                    body.className = 'sec-body' + (isOpen ? '' : ' collapsed');
                    body.dataset.sectionName = sectionName;
                    const secEl = document.createElement('div');
                    secEl.className = 'sec';
                    const h3 = document.createElement('h3');
                    h3.textContent = sectionName;
                    secEl.appendChild(h3);

                    for (const it of items) {
                        secEl.appendChild(buildInstanceCard(eq, it.inst, it.idx));
                    }

                    body.appendChild(secEl);
                    wrapper.appendChild(body);

                    header.addEventListener('click', function(e) {
                        const bodyEl = this.nextElementSibling;
                        const iconEl = this.querySelector('.sec-toggle-icon');
                        const isNowCollapsed = bodyEl.classList.toggle('collapsed');
                        iconEl.classList.toggle('collapsed', isNowCollapsed);
                        accordionState[sectionName] = !isNowCollapsed;
                        localStorage.setItem(accordionStateKey, JSON.stringify(accordionState));
                        updateStats();
                    });
                    wrap.appendChild(wrapper);
                }
                root.appendChild(wrap);
            }
            updateStats();
        }

        /* ========================================================================
           СТАТИСТИКА
           ======================================================================== */
        function computeStats() {
            const generalFields = ['date', 'type', 'number', 'depot', 'place', 'mileage'];
            let filledGeneral = 0;
            for (const f of generalFields) { if (f === 'mileage') { if (STATE.general.mileage && isValidMileage(STATE.general.mileage, STATE.general.type, STATE.general.number)) filledGeneral++; } else if (STATE.general[f] && STATE.general[f] !== '') filledGeneral++; }

            let totalInstances = 0,
                okInstances = 0,
                badInstances = 0;
            let allFieldsCount = 0,
                filledFieldsCount = 0;
            const type = STATE.general.type || '';
            if (type) {
                const active = EQUIPMENT.filter(e => true);
                const selectedSections = STATE.selectedSections || [];
                const allSections = getSections(type).map(s => s.label);
                const sectionsToShow = selectedSections.length > 0 ? selectedSections : allSections;
                for (const eq of active) {
                    const instances = eq.instances();
                    for (const inst of instances) {
                        if (!sectionsToShow.includes(inst.section)) continue;
                        totalInstances++;
                        const idx = instances.indexOf(inst);
                        const iid = instId(eq.id, inst, idx);
                        const flag = computeFlag(eq, iid);
                        if (flag.state === 'ok') okInstances++;
                        if (flag.state === 'bad') badInstances++;
                        const fields = eq.getFields(inst.position);
                        for (const f of fields) {
                            allFieldsCount++;
                            const val = getVal(iid, f.key);
                            if (val && val !== '') filledFieldsCount++;
                            if (f.photo) {
                                const photoRequired = !!(val && val !== '');
                                if (photoRequired) {
                                    allFieldsCount++;
                                    const photoData = getVal(iid, f.key + '_photo');
                                    if (photoData) filledFieldsCount++;
                                }
                            }
                        }
                    }
                }
            }

            const totalFields = generalFields.length + allFieldsCount;
            const filledTotal = filledGeneral + filledFieldsCount;
            const percent = totalFields ? Math.floor(100 * filledTotal / totalFields) : 0;

            return {
                totalInstances,
                okInstances,
                badInstances,
                allFieldsCount,
                filledFieldsCount,
                filledGeneral,
                totalFields,
                filledTotal,
                percent
            };
        }

        function updateStats() {
            const stats = computeStats();
            document.getElementById('statTotal').textContent = stats.totalInstances;
            document.getElementById('statOk').textContent = stats.okInstances;
            document.getElementById('statBad').textContent = stats.badInstances;
            document.getElementById('statFilled').textContent = stats.percent + '%';
            const bar = document.getElementById('statProgressFill');
            if (bar) bar.style.width = stats.percent + '%';

            const exportBtn = document.getElementById('btnExport');
            if (currentUser === 'admin') {
                exportBtn.disabled = false;
                exportBtn.title = 'Администратор: экспорт доступен всегда';
            } else {
                if (stats.percent >= 100) {
                    exportBtn.disabled = false;
                    exportBtn.title = 'Чек-лист заполнен на 100%, экспорт разрешён';
                } else {
                    exportBtn.disabled = true;
                    exportBtn.title = 'Экспорт доступен только при 100% заполнении (сейчас ' + stats.percent + '%)';
                }
            }
            updateFindBadge();
        }

        /* ========================================================================
           ЭКСПОРТ (с фото) — имя файла по шаблону
           ======================================================================== */
        async function exportWithPhotos() { try{await __psReady();}catch(e){}
            try { const __ml = STATE.general.mileage || ''; if (!isValidMileage(__ml, STATE.general.type || '', STATE.general.number || '')) { showToast('⚠️ Некорректный пробег: ' + (getMileageError(__ml, STATE.general.type || '', STATE.general.number || '') || '')); return; }
                if (currentUser !== 'admin') {
                    const stats = computeStats();
                    if (stats.percent < 100) {
                        showToast('⚠️ Экспорт доступен только при 100% заполнении чек-листа');
                        return;
                    }
                }

                if (typeof ExcelJS === 'undefined') {
                    showToast('⚠️ Библиотека ExcelJS не загружена. Проверьте подключение к интернету.');
                    return;
                }

                const type = STATE.general.type || '';
                if (!type) {
                    showToast('⚠️ Сначала выберите тип электровоза');
                    return;
                }

                const workbook = new ExcelJS.Workbook();
                workbook.creator = 'Чек-лист ПО МСУД-015';
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

                const dataOpsHeaders = [];
                for (let i = 1; i <= MAX_OPS_COLUMNS; i++) {
                    dataOpsHeaders.push(\`Контрольная операция \${i}\`);
                    dataOpsHeaders.push(\`Соответствие контроля \${i}\`);
                }
                wsData.addRow([...commonHeaders, ...dataOpsHeaders]);

                const photoOpsHeaders = [];
                for (let i = 1; i <= MAX_OPS_COLUMNS; i++) {
                    photoOpsHeaders.push(\`Контрольная операция \${i}\`);
                    photoOpsHeaders.push(\`Фото \${i}\`);
                }
                wsPhotos.addRow([...commonHeaders, ...photoOpsHeaders]);

                const selectedSections = STATE.selectedSections || [];
                const allSections = getSections(type).map(s => s.label);
                const sectionsToShow = selectedSections.length > 0 ? selectedSections : allSections;
                const active = EQUIPMENT.filter(e => true);

                for (const eq of active) {
                    const instances = eq.instances();
                    for (const inst of instances) {
                        if (!sectionsToShow.includes(inst.section)) continue;
                        const idx = instances.indexOf(inst);
                        const iid = instId(eq.id, inst, idx);
                        const fields = eq.getFields(inst.position);

                        const commonData = [
                            STATE.general.date || '',
                            STATE.general.place || '',
                            STATE.general.depot || '',
                            STATE.general.type || '',
                            STATE.general.number || '',
                            STATE.general.mileage || '',
                            '',
                            eq.title,
                            '',
                            inst.section,
                            inst.section,
                            '',
                            ''
                        ];

                        const ops = [];
                        for (const field of fields) {
                            const val = getVal(iid, field.key) || '';
                            const photoVal = getVal(iid, field.key + '_photo') || '';
                            ops.push({ label: field.label, value: val, photo: photoVal });
                        }
                        const flag = computeFlag(eq, iid);
                        ops.push({ label: 'Наличие выявленных несоответствий', value: flag.label, photo: '' });

                        if (flag.state === 'bad') {
                            summaryIssues.push({ node: eq.title, section: inst.section, place: '', comment: flag.label });
                        }
                        if (ops.length > MAX_OPS_COLUMNS) {
                            opsOverflowCount++;
                            console.warn('Превышен лимит колонок экспорта (' + MAX_OPS_COLUMNS + ') для узла "' + eq.title + '", секция ' + inst.section + '. Часть проверок не попадёт в файл.');
                        }

                        const rowData = [...commonData];
                        for (let i = 0; i < MAX_OPS_COLUMNS; i++) {
                            if (i < ops.length) {
                                rowData.push(ops[i].label);
                                rowData.push(ops[i].value);
                            } else {
                                rowData.push('');
                                rowData.push('');
                            }
                        }
                        wsData.addRow(rowData);

                        const rowPhoto = [...commonData];
                        for (let i = 0; i < MAX_OPS_COLUMNS; i++) {
                            if (i < ops.length) {
                                rowPhoto.push(ops[i].label);
                                rowPhoto.push('');
                            } else {
                                rowPhoto.push('');
                                rowPhoto.push('');
                            }
                        }
                        const rowPhotoObj = wsPhotos.addRow(rowPhoto);
                        const rowPhotoIndex = rowPhotoObj.number;

                        for (let i = 0; i < MAX_OPS_COLUMNS && i < ops.length; i++) {
                            const photoData = ops[i].photo;
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
                const baseName = \`\${date}_\${typeVal}_\${numberVal}_Чек-лист_МСУД-015\`;
                const safeBase = baseName.replace(/[\\/\\\\:*?"<>|]/g, '_');
                a.download = safeBase + '.xlsx';
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

                a.href = url;
                a.click();
                URL.revokeObjectURL(url);
                showToast(__tmhExcelCloudSaved ? '☁️ Резервная копия чек-листа и фото сохранена в облако; Excel скачан' : '⚠️ Excel скачан, но облачная копия чек-листа не обновлена. Проверьте вход и подключение.');
            } catch (e) {
                console.error(e);
                showToast('⚠️ Ошибка при экспорте: ' + e.message);
            }
        }

        /* ========================================================================
           СОХРАНЕНИЕ КАК ФАЙЛ (HTML) — имя по шаблону
           ======================================================================== */
        function saveAsHtmlFile() {
            saveState(true);
            const htmlContent = document.documentElement.outerHTML;
            const stateJson = JSON.stringify(STATE);
            const embeddedScript = \`<script>\\nconst __EMBEDDED_STATE = \${stateJson};\\n<\\/script>\\n\`;
            let newHtml = htmlContent;
            const headCloseTag = '</head>';
            const headCloseIndex = newHtml.indexOf(headCloseTag);
            if (headCloseIndex !== -1) {
                newHtml = newHtml.slice(0, headCloseIndex) + embeddedScript + newHtml.slice(headCloseIndex);
            } else {
                const bodyCloseTag = '</body>';
                const bodyCloseIndex = newHtml.indexOf(bodyCloseTag);
                if (bodyCloseIndex !== -1) {
                    newHtml = newHtml.slice(0, bodyCloseIndex) + embeddedScript + newHtml.slice(bodyCloseIndex);
                }
            }
            const blob = new Blob([newHtml], { type: 'text/html; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            const date = STATE.general.date || 'без_даты';
            const typeVal = STATE.general.type || 'без_серии';
            const numberVal = STATE.general.number || 'без_номера';
            const baseName = \`\${date}_\${typeVal}_\${numberVal}_Чек-лист_МСУД-015\`;
            const safeBase = baseName.replace(/[\\/\\\\:*?"<>|]/g, '_');
            a.download = safeBase + '.html';

            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('✅ Файл сохранён');
        }

        /* ========================================================================
           ДИАЛОГ "ПРОДОЛЖИТЬ / НОВЫЙ"
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
            // Автоматически подставить приписку при загрузке
            const type = STATE.general.type || '';
            const number = STATE.general.number || '';
            const rec = kzcRecord(type, number);
            if (rec) {
                STATE.general.depot = rec.depot;
                // место осмотра сохраняем, если оно допустимо для этой приписки
                const __okPlaces = ((rec.places && rec.places.length) ? rec.places : (typeof DEPOT_PLACES !== 'undefined' && DEPOT_PLACES[rec.depot])) || [];
                if (STATE.general.place && !__okPlaces.includes(STATE.general.place)) STATE.general.place = '';
            }
            buildEquipment(type);
            renderGeneral();
            renderEquip();
            updateStats();
            document.getElementById('continueDialog').style.display = 'none';
            dialogShown = true;
        }

        /* ========================================================================
           ТЕМЫ / ИНИЦИАЛИЗАЦИЯ
           ======================================================================== */
        const THEME_KEY = 'checklist_theme_v1';
        const THEME_VALUES = ['tmh', 'standard', 'dark'];

        function applyTheme(theme) {
            const t = THEME_VALUES.includes(theme) ? theme : 'tmh';
            document.documentElement.setAttribute('data-theme', t);
            document.querySelectorAll('#themeSwitch button').forEach(b => {
                b.classList.toggle('active', b.dataset.themeValue === t);
            });
            try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
        }

        function initThemeSwitch() {
            document.querySelectorAll('#themeSwitch button').forEach(b => {
                b.addEventListener('click', () => applyTheme(b.dataset.themeValue));
            });
            let saved = 'tmh';
            try { saved = localStorage.getItem(THEME_KEY) || 'tmh'; } catch (e) {}
            applyTheme(saved);
        }

        /* ========================================================================
           ЭКСПОРТ / ИМПОРТ JSON
           ======================================================================== */
        function exportJson() {
            saveState(true);
            const data = JSON.parse(JSON.stringify(STATE));
            let includePhotos = false;
            if (typeof hasAnyPhotos === 'function' && hasAnyPhotos()) {
                includePhotos = confirm('📷 Обнаружены фотографии.\\n\\nВключить их в JSON-файл?\\n\\n• ОК — с фото (большой файл, только для личного архива)\\n• Отмена — без фото (компактный файл, подходит для передачи разработчику)');
                if (!includePhotos) {
                    for (const iid in data.values) { if (data.values[iid]) { for (const k in data.values[iid]) { if (k.endsWith('_photo')) delete data.values[iid][k]; } } }
                }
            }
            data._meta = { version: 2, checklist: 'bi', exportedAt: new Date().toISOString(), withPhotos: includePhotos };
            const json = JSON.stringify(data);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const tv = STATE.general.type || 'без_серии';
            const nv = STATE.general.number || '';
            const baseName = tv + (nv ? '_' + nv : '') + '_БИ' + (includePhotos ? '_с_фото' : '_без_фото');
            const sb = baseName.replace(/[\\/\\\\:*?"<>|]/g, '_');
            a.download = sb + '.json';
            a.href = url; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            showToast('✅ JSON экспортирован' + (includePhotos ? ' (с фото)' : ' (компактный)'));
        }
        function importJson() { document.getElementById('jsonFileInput').click(); }
        function handleJsonFile(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const json = JSON.parse(e.target.result);
                    if (typeof json !== 'object' || !json.general || typeof json.values !== 'object') throw new Error('Неверный формат JSON');
                    STATE = json; delete STATE._meta;
                    if (!Array.isArray(STATE.selectedSections)) STATE.selectedSections = [];
                    if (!Array.isArray(STATE.selected)) STATE.selected = [];
                    saveState(true);
                    const type = STATE.general.type || '';
                    buildEquipment(type);
                    renderGeneral();
                    if (typeof renderSectionsSelection === 'function') renderSectionsSelection();
                    renderEquip();
                    updateStats();
                    showToast('✅ JSON загружен, данные восстановлены');
                } catch (err) {
                    showToast('⚠️ Ошибка загрузки JSON: ' + err.message);
                    console.error(err);
                }
            };
            reader.onerror = function() { showToast('⚠️ Ошибка чтения файла'); };
            reader.readAsText(file);
        }

        /* ========================================================================
           ПОИСК НЕЗАПОЛНЕННЫХ ПОЛЕЙ
           ======================================================================== */
        function getUnfilledElements() {
            const list = [];
            document.querySelectorAll('#generalGrid select, #generalGrid input').forEach(c => {
                if (c.disabled || c.readOnly) return;
                if (!c.value || c.value === '' || (c.dataset && c.dataset.mileInvalid === '1')) list.push({ el: c.closest('.field') || c, focus: c });
            });
            document.querySelectorAll('#equipRoot select, #equipRoot input[type="text"]').forEach(c => {
                if (c.disabled) return;
                if (c.offsetParent === null) return;
                if (!c.value || c.value === '') list.push({ el: c.closest('.frow') || c.closest('.field-row') || c.closest('.field') || c, focus: c });
            });
            document.querySelectorAll('#equipRoot .frow[data-field-key]').forEach(row => {
                if (row.offsetParent === null) return;
                if (!row.querySelector('.photo-area')) return;
                const card = row.closest('.inst[data-iid]');
                if (!card) return;
                const iid = card.dataset.iid;
                const fieldKey = row.dataset.fieldKey;
                const val = getVal(iid, fieldKey);
                const photoData = getVal(iid, fieldKey + '_photo');
                const required = !!(val && val !== '' && !photoData);
                if (required) list.push({ el: row, focus: null });
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
                if (__tmhIsEmbeddedRuntime()) {
                    var pendingModal = document.getElementById('loginModal');
                    if (pendingModal) pendingModal.style.display = 'none';
                    var pending = document.createElement('div');
                    pending.id = 'tmhParentAuthPending';
                    pending.textContent = 'Ожидаем подтверждение авторизации основной страницы. Повторный вход здесь отключён.';
                    pending.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:var(--bg,#fff);color:var(--ink,#222);font:16px/1.5 system-ui;z-index:99999;';
                    document.body.appendChild(pending);
      // Resume when the parent publishes its verified session after our first wait.
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
            } else {
                showContinueDialogOrStart();
            }

            document.getElementById('loginBtn').onclick = async function() {
                const login = document.getElementById('loginInput').value.trim();
                const password = document.getElementById('passwordInput').value;
                const error = document.getElementById('loginError');
                if (!login || !password) { error.textContent = 'Заполните все поля';
                    error.classList.add('show'); return; }
                if (await doLogin(login, password)) {
                    error.classList.remove('show');
                    if(new URLSearchParams(window.location.search).get('openChecklist')){const __restoreButton=document.getElementById('tmhNativeCloudRestoreBtn');if(__restoreButton)__restoreButton.click();else showToast('Кнопка восстановления облачной записи недоступна');}
                    else showContinueDialogOrStart();
                } else {
                    error.textContent = 'Неверный логин или пароль';
                    error.classList.add('show');
                }
            };
            document.getElementById('loginInput').onkeypress = function(e) { if (e.key === 'Enter') document.getElementById(
                    'loginBtn').click(); };
            document.getElementById('passwordInput').onkeypress = function(e) { if (e.key === 'Enter') document.getElementById(
                    'loginBtn').click(); };
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
            document.getElementById('btnExport').onclick = exportWithPhotos;
            document.getElementById('btnExportJson').onclick = exportJson;
            document.getElementById('btnImportJson').onclick = importJson;
            document.getElementById('jsonFileInput').onchange = function(e) {
                if (e.target.files && e.target.files[0]) { handleJsonFile(e.target.files[0]); e.target.value = ''; }
            };
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
