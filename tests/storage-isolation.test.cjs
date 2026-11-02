'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(new URL('../index.html', 'file://' + __filename), 'utf8');

function occurrences(source, needle) {
  return source.split(needle).length - 1;
}

test('storage namespace is derived from a validated Supabase UUID', () => {
  const start = html.indexOf('function __tmhApplyUserStorageScope(uid) {');
  assert.notEqual(start, -1, 'scope helper must exist');
  const end = html.indexOf('\n}\n', start);
  assert.notEqual(end, -1, 'scope helper must have a closing brace');
  const helper = html.slice(start, end + 2);
  const context = { window: {}, LS_KEY: 'checklist_tt_v1' };
  vm.createContext(context);
  vm.runInContext(helper, context);

  context.__tmhApplyUserStorageScope('11111111-1111-4111-8111-111111111111');
  assert.equal(context.LS_KEY, 'checklist_tt_v1::user:11111111-1111-4111-8111-111111111111');
  assert.equal(context.window.__TMH_STORAGE_UID, '11111111-1111-4111-8111-111111111111');
  assert.equal(context.window.__TMH_STORAGE_LOCKED, false);

  context.__tmhApplyUserStorageScope('22222222-2222-4222-8222-222222222222');
  assert.equal(context.LS_KEY, 'checklist_tt_v1::user:22222222-2222-4222-8222-222222222222');
  assert.throws(() => context.__tmhApplyUserStorageScope('not-a-uuid'), /UUID пользователя Supabase/);
});

test('all five embedded/application copies bind scope to Supabase identity', () => {
  assert.equal(occurrences(html, 'function __tmhApplyUserStorageScope(uid)'), 5);
  assert.equal(occurrences(html, '__tmhApplyUserStorageScope(identity.user.id)'), 5);
  assert.equal(occurrences(html, '__tmhApplyUserStorageScope(result.user.id)'), 5);
});

test('all five save paths are blocked before login and after logout', () => {
  assert.equal(occurrences(html, 'if(!window.__TMH_STORAGE_UID||window.__TMH_STORAGE_LOCKED)return false;'), 5);
});

test('all five app copies observe auth changes in other tabs', () => {
  assert.equal(occurrences(html, 'function __tmhInstallAuthWatcher(api)'), 5);
  assert.equal(occurrences(html, '__tmhInstallAuthWatcher(api);'), 5);
  assert.equal(occurrences(html, "event === 'SIGNED_OUT'"), 5);
  assert.equal(occurrences(html, "event === 'SIGNED_IN'"), 5);
});

test('photo keys are prefixed by the same scoped LS_KEY namespace', () => {
  assert.equal(occurrences(html, "out[LS_KEY+'::'+iid+'::'+k]=o[k]"), 4);
  assert.equal(occurrences(html, "var prefix=LS_KEY+'::';"), 8);
  assert.match(html, /function photoDbKey\(namespace,iid,photoKey\)\{return namespace\+'::'\+iid\+'::'\+photoKey;\}/);
});

test('legacy storage identifiers remain present for non-destructive retention', () => {
  for (const key of [
    'checklist_tt_v1',
    'checklist_msud_v1',
    'checklist_hydro_v1',
    'checklist_2es5k_v1',
    'checklist_housings_v4',
  ]) assert.ok(html.includes(key), key + ' must remain in source');
});
