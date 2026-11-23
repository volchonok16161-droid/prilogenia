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


test('custom operations use the native dropdown and standard inspection photo controls', () => {
  const html = embeddedSource();
  assert.match(html, /function fieldRow\(eq,inst,iid,field\)\{/);
  assert.match(html, /control=document\.createElement\('select'\)/);
  assert.match(html, /control\.addEventListener\('change',function\(\)/);
  assert.match(html, /if\(field\.photo\)addPhotoSupport\(row,field,eq,iid\)/);
  assert.match(html, /function refreshInstance\(eq,inst,iid,card\)/);
  assert.match(html, /function updatePhotoRequirementForField\(iid,fieldKey,card\)/);
  assert.match(html, /row\.classList\.toggle\('photo-required-field',required&&!pd\)/);
  assert.match(html, /Array\.isArray\(fl\.ok\)\?fl\.ok\.slice\(\):\[\]/);
  assert.doesNotMatch(html, /var __ceNativeFieldRow=fieldRow;/);
  assert.doesNotMatch(html, /\.ce-answer-grid/);
});

test('reference photo examples are part of compact OK/NOK buttons rather than standalone photos', () => {
  const marker = '<script id="__OKNOK_EXAMPLES_V1__">';
  const begin = markup.indexOf(marker);
  assert.ok(begin >= 0, 'Reference photo injector is present');
  const end = markup.indexOf('</script>', begin);
  const code = markup.slice(begin + marker.length, end);
  assert.doesNotThrow(() => new vm.Script(code));
  assert.match(code, /function makeBar\(row, key\)/);
  assert.match(code, /'✅ OK' : '❌ NOK'/);
  assert.match(code, /img\.className='oknok-thumb';/);
  assert.match(code, /b\.appendChild\(img\)/);
  assert.match(code, /l\.appendChild\(bar\)/);
  assert.match(code, /row\.__oknokBar && row\.__oknokBar\.isConnected/);
  assert.doesNotMatch(code, /function paintChoiceExamples/);
});

test('preview keeps the mobile header compact and retains the published form layout', () => {
  const html = embeddedSource();
  assert.match(markup, /Предпросмотр · черновик/);
  assert.match(markup, /#devPreview \.dv-bar\{display:grid;grid-template-columns:/);
  assert.match(html, /function addPhotoSupport\(row,field,eq,iid\)/);
  assert.match(html, /function computeFlag\(eq,iid\)/);
  assert.match(html, /card\.classList\.add\('flag-bad'\)/);
  assert.match(html, /row\.classList\.add\('frow-bad'\)/);
  assert.match(markup, /id="devPrevStatus"/);
  assert.match(markup, /__TMH_PREVIEW__/);
});

test('RТ-130 preview position count follows demo locomotive sections, not a missing operation', () => {
  const configuration = JSON.parse(fs.readFileSync(new URL('../oborudovanie.json', import.meta.url), 'utf8'));
  const rt = configuration.equipment.find(item => item.title === 'РТ-130');
  assert.ok(rt);
  assert.equal(rt.layout.blocks.length, 2);
  assert.match(markup, /general:\{type:'2ЭС5К'/);
  assert.match(embeddedSource(), /if\(type==='2ЭС5К'\)return 2;/);
  assert.equal(rt.layout.blocks.length * 2, 4);
});
