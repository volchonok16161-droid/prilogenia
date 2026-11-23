import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const markup = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function embeddedSource() {
  const marker = 'const EMBED_CHECKLIST_HTML=';
  const start = markup.indexOf(marker);
  assert.ok(start >= 0, 'Checklist HTML source must exist');
  const begin = start + marker.length;
  const ending = '</html>' + String.fromCharCode(96);
  const end = markup.indexOf(ending + ';', begin);
  assert.ok(end > begin, 'Checklist HTML template must terminate');
  return vm.runInNewContext(markup.slice(begin, end + ending.length));
}

function checkInlineScriptSyntax(html) {
  const scripts = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match, checked = 0;
  while ((match = scripts.exec(html))) {
    if (/\bsrc\s*=|\btype\s*=\s*["']module/i.test(match[1]) || !match[2].trim()) continue;
    assert.doesNotThrow(() => new vm.Script(match[2]), 'Inline checklist script must parse');
    checked++;
  }
  assert.ok(checked >= 3, 'Expected checklist scripts must be present');
  return checked;
}

test('host script embeds a syntactically valid checklist form and cloud bridge', () => {
  const index = markup.indexOf('const EMBED_TT_HTML=');
  const start = markup.lastIndexOf('<script>', index);
  const end = markup.indexOf('</script>', index);
  assert.ok(start >= 0 && end > index);
  assert.doesNotThrow(() => new vm.Script(markup.slice(start + '<script>'.length, end)));
  assert.match(markup.slice(end - 9000, end), /function __tmhAttachCloudBackup\(source, mode\)/);
});

test('published checklist HTML can be created and all inline scripts parse', () => {
  const html = embeddedSource();
  assert.match(html, /function buildInstanceCard\(eq,inst,idx\)/);
  checkInlineScriptSyntax(html);
});

test('isolated 1:1 preview patches match and keep generated JavaScript valid', () => {
  let html = embeddedSource();
  const replacements = [
    ['async function checkAuth() {', 'async function checkAuth() { if(window.__TMH_PREVIEW__){currentUser="admin";updateUserUI();return true;}'],
    ['try{localStorage.setItem(MODE_KEY,MODE);}catch(e){}', 'if(!window.__TMH_PREVIEW__){try{localStorage.setItem(MODE_KEY,MODE);}catch(e){}}'],
    ['function loadState(){try{const raw=localStorage.getItem(LS_KEY);', 'function loadState(){if(window.__TMH_PREVIEW__)return;try{const raw=localStorage.getItem(LS_KEY);'],
    ['function fullClearState(){', 'function fullClearState(){if(window.__TMH_PREVIEW__)return;'],
    ['function saveState(silent){', 'function saveState(silent){if(window.__TMH_PREVIEW__)return true;'],
    ['function __psSync(){', 'function __psSync(){if(window.__TMH_PREVIEW__)return Promise.resolve(true);'],
    ['function __psFlagOn(){', 'function __psFlagOn(){if(window.__TMH_PREVIEW__)return false;'],
    ['function __psRestore(){', 'function __psRestore(){if(window.__TMH_PREVIEW__)return Promise.resolve(false);'],
  ];
  for (const [before, after] of replacements) {
    assert.equal(html.split(before).length - 1, 1, 'Missing or duplicated preview patch: ' + before);
    html = html.replace(before, after);
  }
  const modeChoice = 'if(window.parent&&window.parent!==window&&window.parent.__EMBEDDED_MODE__){';
  assert.equal(html.split(modeChoice).length - 1, 1, 'Mode override must appear only once');
  html = html.replace(modeChoice,
    'if(window.__TMH_PREVIEW__&&window.__EMBEDDED_MODE){m=window.__EMBEDDED_MODE;}else ' + modeChoice);
  checkInlineScriptSyntax(html);
});

test('custom answers render photo actions inside selected tiles without clearing the choice', () => {
  const html = embeddedSource();
  assert.match(html, /var __ceNativeFieldRow=fieldRow;/);
  assert.match(html, /tile\.appendChild\(controls\)/);
  assert.match(html, /if\(area\)area\.addEventListener\('click',function\(ev\)\{ev\.stopPropagation\(\);\}\)/);
  assert.match(html, /Array\.isArray\(fl\.ok\)\?fl\.ok\.slice\(\):\[\]/);
  assert.match(markup, /id="devPrevStatus"/);
});

test('reference photos are inserted inside custom answer buttons, not shown as duplicate OK/NOK bars', () => {
  const marker = '<script id="__OKNOK_EXAMPLES_V1__">';
  const begin = markup.indexOf(marker);
  assert.ok(begin >= 0, 'Reference photo injector is present');
  const end = markup.indexOf('</script>', begin);
  const code = markup.slice(begin + marker.length, end);
  assert.doesNotThrow(() => new vm.Script(code));
  assert.match(code, /function paintChoiceExamples\(row,key\)/);
  assert.match(code, /tile\.insertBefore\(ref,controls\)/);
  assert.match(code, /row\.querySelector\('\.ce-answer-grid'\)/);
  assert.match(code, /row\.__oknokBar\.remove\(\)/);
  assert.match(code, /ev\.preventDefault\(\);ev\.stopPropagation\(\)/);
  assert.match(code, /if\(ref\.textContent!==placeholder\)ref\.textContent=placeholder/);
});
