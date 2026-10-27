// Run with Node.js: node tools/test_admin.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
for (const file of ['adm/vendor/json5.min.js', 'adm/format.js', 'adm/config.js']) {
  context.window = context;
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}
const plain = value => JSON.parse(JSON.stringify(value));
const format = context.FPCLAdminFormat;
const config = context.FPCLAdminConfig({repo:'example/site', branch:'main', base_url:'https://auth.example.com'});
for (const collection of config.collections) for (const entry of collection.files) {
  const original = fs.readFileSync(path.join(root, entry.file), 'utf8');
  const baseline = vm.createContext({window:{}});
  vm.runInContext('window.FPCL = {}; var FPCL = window.FPCL;\n' + original, baseline);
  const parsed = format.fromFile(original);
  assert.deepEqual(plain(parsed), plain(baseline.FPCL));
  assert.deepEqual(Object.keys(parsed).sort(), plain(entry.fields.map(f => f.name)).sort());
  const serialized = format.toFile(parsed);
  assert.deepEqual(plain(format.fromFile(serialized)), plain(parsed));
  const rendered = vm.createContext({window:{}});
  vm.runInContext('var FPCL = window.FPCL = {};\n' + serialized, rendered);
  assert.deepEqual(plain(rendered.FPCL), plain(parsed));
  // Lists may be emptied; single blocks (settings, professor, equipment pages) stay as they are.
  const empty = Object.fromEntries(Object.keys(parsed).map(key => [key, Array.isArray(parsed[key]) ? [] : parsed[key]]));
  assert.deepEqual(plain(format.fromFile(format.toFile(empty))), plain(empty));
  console.log(entry.file, Object.fromEntries(Object.entries(parsed).map(([k,v]) => [k, Array.isArray(v) ? v.length : 'block'])), 'round-trip OK');
}
const sample = {photos:[{title:'Quote " and ]; and [ brackets / 한글', date:'2026-10-27', text:'<test>', images:['/images/photo/uploads/test.jpg']}]};
assert.deepEqual(plain(format.fromFile(format.toFile(sample))), sample);
assert.throws(() => format.fromFile('FPCL.photos = [invalid];'));
assert.throws(() => format.toFile({photos:[], unexpected:[]}));
assert.throws(() => format.toFile({photos:[{title:'test',date:'invalid',images:[]}]}));
console.log('Empty lists, Unicode, nested arrays, malformed data and executable output checks passed.');
