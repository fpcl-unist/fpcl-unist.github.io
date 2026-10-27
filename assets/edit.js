/* FPCL editing on the page itself. site.js loads this only for someone signed in at /admin (the GitHub login
   is kept in this browser), so visitors never see it.
   - "편집" at the bottom turns it on. Click a text to change it; click a picture to replace it.
   - Pointing at an entry shows a small bar: move it up or down, copy it, add a new one, open its details
     (links, dates, picture descriptions and other values not shown as text) or delete it. On a picture the
     bar also turns it a quarter turn left or right.
   - "저장" commits each changed data file to GitHub, after checking that nobody changed it in the meantime.
   - "로그아웃" forgets the login in this browser.
     The data format and its checks are the ones the /admin screen uses (adm/format.js, adm/config.js).
   Unsaved changes stay in this browser tab (sessionStorage "fpcl-edit") until they are saved or dropped. */
(function () {
  'use strict';

  var ROOT = document.documentElement.getAttribute('data-root') || '';
  var STORE = 'fpcl-edit';
  var D = window.FPCL;
  var user = {};
  try { user = JSON.parse(localStorage.getItem('decap-cms-user') || '{}') || {}; } catch (e) { /* not signed in */ }
  var token = user.token || user.access_token;
  if (!token || !D) return;

  var repo, branch, format, config;
  var files = {};    // data file on this page -> { keys, published, label }
  var keyFile = {};  // FPCL key -> its data file
  var state = load();
  var reloading = false;

  /* ---------- Small helpers ---------- */

  function load() {
    var empty = { on: false, files: {}, uploads: [] };
    try { return Object.assign(empty, JSON.parse(sessionStorage.getItem(STORE) || '{}')); } catch (e) { return empty; }
  }
  function store() {
    try { sessionStorage.setItem(STORE, JSON.stringify(state)); }
    catch (e) { toast('브라우저 저장 공간이 부족해 변경을 보관하지 못했어요. 바로 저장해 주세요.', true); }
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }
  function script(src) {
    return new Promise(function (resolve, reject) {
      var s = el('script', { src: ROOT + src });
      s.onload = resolve;
      s.onerror = function () { reject(new Error(src + '를 불러오지 못했어요.')); };
      document.head.appendChild(s);
    });
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function reload() { reloading = true; location.reload(); }

  /* ---------- Paths into window.FPCL ("topics.2.blocks.1") ---------- */

  function steps(path) { return path.split('.').map(function (s) { return /^\d+$/.test(s) ? +s : s; }); }
  function get(path) { return steps(path).reduce(function (o, k) { return o == null ? o : o[k]; }, D); }
  function put(path, value) {
    var p = steps(path), last = p.pop();
    p.reduce(function (o, k) { return o[k]; }, D)[last] = value;
    touch(p.length ? p[0] : last);
  }
  function parentOf(path) {
    var p = steps(path), index = p.pop();
    return { listPath: p.join('.'), list: get(p.join('.')), index: index };
  }

  // The /admin field description for the value at a path: its label, widget, options, sub-fields.
  function topDef(key) {
    var found = null;
    config.collections.forEach(function (c) {
      c.files.forEach(function (f) { f.fields.forEach(function (d) { if (d.name === key) found = d; }); });
    });
    return found;
  }
  function itemDef(listDef, value) {
    if (!listDef) return null;
    if (listDef.types) {
      var key = listDef.typeKey || 'type';
      return listDef.types.filter(function (t) { return value && t.name === value[key]; })[0] || null;
    }
    if (listDef.fields) return { widget: 'object', fields: listDef.fields, label: listDef.label_singular || listDef.label };
    return listDef.field || { widget: 'string', label: listDef.label_singular || listDef.label };
  }
  function defAt(path) {
    var p = steps(path), d = topDef(p[0]), v = D[p[0]];
    for (var i = 1; i < p.length && d; i++) {
      v = v == null ? v : v[p[i]];
      d = typeof p[i] === 'number' ? itemDef(d, v) : (d.fields || []).filter(function (f) { return f.name === p[i]; })[0];
    }
    return d;
  }
  // A new entry: required text shows its label in brackets so it is easy to spot and replace.
  function blank(d, sibling) {
    if (!d) return '(새 항목)';
    if (d.widget === 'list') return [];
    if (d.widget === 'object' || d.fields) {
      var o = {};
      (d.fields || []).forEach(function (f) {
        if (f.name === 'group' && sibling) o.group = sibling.group;
        else if (f.name === 'caption') o.caption = '(그림 설명)';
        else if (f.required !== false || f.widget === 'list') o[f.name] = blank(f);
      });
      return o;
    }
    if (d.widget === 'select') return d.options[0];
    if (d.widget === 'datetime') return today();
    if (d.widget === 'number') return d.default || 0;
    if (d.widget === 'image') return '';
    return '(' + (d.label || '새 항목') + ')';
  }
  function typed(t) { var o = blank({ fields: t.fields }); o.type = t.name; return o; }

  /* ---------- Kept changes ---------- */

  function touch(key) {
    var file = keyFile[key];
    if (!file) return;
    var f = state.files[file] || (state.files[file] = { base: clone(files[file].published) });
    f.data = {};
    files[file].keys.forEach(function (k) { f.data[k] = D[k]; });
    store();
    refreshBar();
  }
  function dirty(file) { var f = state.files[file]; return !!f && !same(f.data, f.base); }
  function dirtyFiles() { return Object.keys(state.files).filter(function (file) { return files[file] && dirty(file); }); }

  /* ---------- GitHub ---------- */

  function b64(text) {
    var bin = '';
    new TextEncoder().encode(text).forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function unb64(text) {
    var bin = atob(text.replace(/\s/g, ''));
    return new TextDecoder().decode(Uint8Array.from(bin, function (c) { return c.charCodeAt(0); }));
  }
  async function api(method, path, body) {
    var res = await fetch('https://api.github.com/repos/' + repo + '/' + path, {
      method: method, cache: 'no-store',
      headers: { Authorization: 'token ' + token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 401) throw new Error('로그인이 만료됐어요. /admin에서 다시 로그인한 뒤 저장해 주세요. 바꾼 내용은 이 탭에 남아 있어요.');
    if (!res.ok) {
      var detail = await res.json().catch(function () { return {}; });
      throw new Error('GitHub에 저장하지 못했어요 (' + res.status + (detail.message ? ': ' + detail.message : '') + ').');
    }
    return res.json();
  }

  async function save() {
    var list = dirtyFiles();
    if (!list.length) { toast('저장할 변경이 없어요.'); return; }
    busy(true);
    var saved = 0;
    try {
      for (var i = 0; i < list.length; i++) {
        var file = list[i], f = state.files[file], label = files[file].label;
        var text = format.toFile(f.data); // stops here if a value has the wrong form
        var latest = await api('GET', 'contents/' + file + '?ref=' + encodeURIComponent(branch));
        var current = format.fromFile(unb64(latest.content));
        if (!same(current, f.base) && !same(current, f.data) &&
            !confirm(label + ': 다른 곳(관리 화면 등)에서 먼저 고친 내용이 있어요.\n\n확인: 내가 바꾼 내용으로 덮어쓰기\n취소: 이 파일은 저장하지 않기')) continue;
        if (!same(current, f.data)) {
          await api('PUT', 'contents/' + file, {
            message: 'Update ' + label + ' (사이트 화면에서 편집)', content: b64(text), sha: latest.sha, branch: branch
          });
        }
        f.base = clone(f.data);
        store();
        saved++;
      }
      if (saved) toast('저장했어요. 공개 사이트에는 1~2분 뒤 반영돼요.');
    } catch (e) {
      toast(e.message, true);
    }
    busy(false);
    refreshBar();
  }

  /* ---------- Pictures ---------- */

  function pick(multiple) {
    return new Promise(function (resolve) {
      var input = el('input', { type: 'file', accept: 'image/*' });
      input.multiple = !!multiple;
      input.addEventListener('change', function () { resolve([].slice.call(input.files)); });
      input.click();
    });
  }
  // Big photos are made 1600 px wide before upload; GIF (animation) and SVG are left as they are.
  function shrink(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return Promise.resolve(file);
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(img.src);
        if (img.naturalWidth <= 2000) { resolve(file); return; }
        var canvas = el('canvas');
        canvas.width = 1600;
        canvas.height = Math.round(img.naturalHeight * 1600 / img.naturalWidth);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        var type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(function (blob) { resolve(blob || file); }, type, 0.85);
      };
      img.onerror = function () { resolve(file); };
      img.src = URL.createObjectURL(file);
    });
  }
  function blobBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result).split(',')[1]); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  async function upload(file) {
    var blob = await shrink(file);
    var ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg' })[blob.type] ||
      (file.name.split('.').pop() || 'jpg').toLowerCase();
    var base = file.name.replace(/\.[^.]*$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';
    var stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    var path = 'images/uploads/' + stamp + '-' + base + '.' + ext;
    toast('사진을 올리는 중이에요…');
    await api('PUT', 'contents/' + path, {
      message: 'Upload ' + path + ' (사이트 화면에서 편집)', content: await blobBase64(blob), branch: branch
    });
    state.uploads.push(path);
    store();
    return { path: path, preview: URL.createObjectURL(blob) };
  }
  // A picture uploaded a moment ago is not on the public site yet; show it straight from GitHub meanwhile.
  function showUploads() {
    document.querySelectorAll('.img-missing[data-type="image"]').forEach(function (box) {
      var path = get(box.getAttribute('data-field'));
      if (!path || state.uploads.indexOf(path) === -1) return;
      var img = el('img', { src: 'https://raw.githubusercontent.com/' + repo + '/' + branch + '/' + path, alt: '' });
      ['data-item', 'data-field', 'data-type'].forEach(function (a) { if (box.hasAttribute(a)) img.setAttribute(a, box.getAttribute(a)); });
      box.replaceWith(img);
    });
  }
  // Turns a picture a quarter turn (turn 1 = clockwise, -1 = counterclockwise) as it appears on the page,
  // and uploads the result as a new file. GIF (the animation would be lost) and SVG are not turned.
  async function rotateImage(target, turn) {
    var path = target.getAttribute('data-field'), current = get(path) || '';
    if (target.tagName !== 'IMG') { toast('아직 사진이 없어요. 사진을 클릭해 먼저 올려 주세요.'); return; }
    if (/\.(gif|svg)$/i.test(current)) { toast('GIF와 SVG는 돌릴 수 없어요. 돌린 파일을 만들어 사진을 바꿔 주세요.', true); return; }
    try {
      toast('사진을 돌리는 중이에요…');
      var blob = await fetch(target.currentSrc || target.src).then(function (r) {
        if (!r.ok) throw new Error('사진을 불러오지 못했어요.');
        return r.blob();
      });
      var picture = await createImageBitmap(blob); // as shown, with the camera's orientation applied
      var canvas = el('canvas');
      canvas.width = picture.height;
      canvas.height = picture.width;
      var ctx = canvas.getContext('2d');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(turn * Math.PI / 2);
      ctx.drawImage(picture, -picture.width / 2, -picture.height / 2);
      var type = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
      var turned = await new Promise(function (resolve) { canvas.toBlob(resolve, type, 0.92); });
      var base = (current.split('/').pop() || 'photo').replace(/\.[^.]*$/, '').replace(/^\d{14}-/, '').replace(/(-rotated)+$/, '');
      var up = await upload(new File([turned], base + '-rotated.' + (type === 'image/png' ? 'png' : 'jpg'), { type: type }));
      put(path, up.path);
      target.src = up.preview;
      toast('사진을 돌렸어요. "저장"을 눌러야 페이지에 반영돼요.');
    } catch (e) { toast(e.message, true); }
  }
  function rotateButtons(node) {
    return [
      button('↺', '왼쪽으로 돌리기', function () { rotateImage(node, -1); }),
      button('↻', '오른쪽으로 돌리기', function () { rotateImage(node, 1); })
    ];
  }
  async function replaceImage(target) {
    var picked = await pick(false);
    if (!picked.length) return;
    try {
      var up = await upload(picked[0]);
      put(target.getAttribute('data-field'), up.path);
      var img = target.tagName === 'IMG' ? target : el('img', { alt: '' });
      if (img !== target) {
        ['data-item', 'data-field', 'data-type'].forEach(function (a) { if (target.hasAttribute(a)) img.setAttribute(a, target.getAttribute(a)); });
        target.replaceWith(img);
      }
      img.src = up.preview;
      toast('사진을 바꿨어요. "저장"을 눌러야 페이지에 반영돼요.');
    } catch (e) { toast(e.message, true); }
  }
  // Adds pictures to a list of pictures (plain paths, or entries with an image field such as equipment photos).
  async function addImages(listPath, index) {
    var picked = await pick(true);
    if (!picked.length) return;
    var d = itemDef(defAt(listPath), null);
    var imageField = d && d.fields ? d.fields.filter(function (f) { return f.widget === 'image'; })[0] : null;
    try {
      for (var i = 0; i < picked.length; i++) {
        var up = await upload(picked[i]);
        var entry = up.path;
        if (imageField) { entry = blank(d); entry[imageField.name] = up.path; }
        get(listPath).splice(index + i, 0, entry);
      }
      touch(steps(listPath)[0]);
      reload();
    } catch (e) { toast(e.message, true); }
  }
  function isImageList(listDef) {
    var d = itemDef(listDef, null);
    return !!d && (d.widget === 'image' || (!!d.fields && d.fields.some(function (f) { return f.widget === 'image'; }) &&
      d.fields.every(function (f) { return f.widget === 'image' || f.required === false; })));
  }

  /* ---------- Text in place ---------- */

  var ALLOWED = ['I', 'B', 'EM', 'STRONG', 'SUB', 'SUP', 'BR'];
  function clean(html) {
    var box = el('div');
    box.innerHTML = html;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 1) {
          walk(c);
          if (ALLOWED.indexOf(c.tagName) === -1) c.replaceWith.apply(c, [].slice.call(c.childNodes));
          else [].slice.call(c.attributes).forEach(function (a) { c.removeAttribute(a.name); });
        } else if (c.nodeType !== 3) c.remove();
      });
    })(box);
    return box.innerHTML.replace(/&nbsp;| /g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  }
  function editable(field) {
    var type = field.getAttribute('data-type') || 'text';
    if (['image', 'date', 'choice'].indexOf(type) !== -1) return;
    if (type === 'html') field.contentEditable = 'true';
    else { try { field.contentEditable = 'plaintext-only'; } catch (e) { field.contentEditable = 'true'; } }
    field.spellcheck = false;
  }
  var groupRun = {};
  function onFocus(e) {
    var field = e.target.closest && e.target.closest('[data-type="group"]');
    if (!field) return;
    // A year heading on the publication pages names every paper under it.
    var path = field.getAttribute('data-field'), p = steps(path), list = D[p[0]], old = list[p[1]].group, run = [];
    for (var j = p[1]; j < list.length && list[j].group === old; j++) run.push(p[0] + '.' + j + '.group');
    groupRun[path] = run;
  }
  function onInput(e) {
    var field = e.target.closest && e.target.closest('[data-field]');
    if (!field || !field.isContentEditable) return;
    var path = field.getAttribute('data-field'), type = field.getAttribute('data-type') || 'text';
    var value = type === 'html' ? clean(field.innerHTML) : field.innerText.replace(/\s+/g, ' ').trim();
    if (type === 'group') (groupRun[path] || [path]).forEach(function (p) { put(p, value); });
    else put(path, value);
  }
  function onKey(e) {
    var field = e.target.closest && e.target.closest('[data-field]');
    if (!field || !field.isContentEditable || e.key !== 'Enter') return;
    e.preventDefault();
    if (e.shiftKey && field.getAttribute('data-type') === 'html') document.execCommand('insertLineBreak');
    else field.blur();
  }
  function onPaste(e) {
    var field = e.target.closest && e.target.closest('[data-field]');
    if (!field || !field.isContentEditable) return;
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').replace(/\s+/g, ' '));
  }

  /* ---------- Entry bar: move, copy, add, details, delete ---------- */

  var tools = el('div', { id: 'fpcl-tools', hidden: '' });
  var target = null, hideTimer = null;

  function button(label, title, action, danger) {
    var b = el('button', { type: 'button', title: title }, label);
    if (danger) b.className = 'danger';
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); action(); });
    return b;
  }
  function childButtons(path, d) {
    var out = [];
    (d && d.fields || []).forEach(function (f) {
      if (f.widget !== 'list') return;
      var listPath = path + '.' + f.name;
      if (f.types) {
        f.types.forEach(function (t) {
          out.push(button('+ ' + t.label, t.label + ' 추가 (맨 끝에)', function () {
            var list = get(listPath) || (put(listPath, []), get(listPath));
            list.push(typed(t));
            touch(steps(path)[0]);
            if (t.fields.some(function (x) { return x.name === 'images'; })) addImages(listPath + '.' + (list.length - 1) + '.images', 0);
            else reload();
          }));
        });
      } else if (isImageList(f)) {
        out.push(button('+ ' + (f.label_singular || '사진'), '사진 추가 (맨 끝에)', function () {
          if (!get(listPath)) put(listPath, []);
          addImages(listPath, get(listPath).length);
        }));
      } else {
        out.push(button('+ ' + (f.label_singular || f.label), (f.label_singular || f.label) + ' 추가 (맨 끝에)', function () {
          if (!get(listPath)) put(listPath, []);
          get(listPath).push(blank(itemDef(f, null)));
          touch(steps(path)[0]);
          reload();
        }));
      }
    });
    return out;
  }
  function hasDetails(d) {
    return !!d && (d.fields || []).some(function (f) { return f.widget !== 'list' && f.widget !== 'object'; });
  }
  function itemTools(path) {
    var where = parentOf(path), list = where.list, i = where.index;
    var listDef = defAt(where.listPath), d = itemDef(listDef, list[i]);
    var out = [];
    if (i > 0) out.push(button('▲', '위로', function () { swap(where, i - 1); }));
    if (i < list.length - 1) out.push(button('▼', '아래로', function () { swap(where, i + 1); }));
    out.push(button('복제', '바로 아래에 같은 항목 추가', function () {
      list.splice(i + 1, 0, clone(list[i])); touch(steps(path)[0]); reload();
    }));
    if (listDef && listDef.types) {
      listDef.types.forEach(function (t) {
        out.push(button('+ ' + t.label, '바로 아래에 ' + t.label + ' 추가', function () {
          list.splice(i + 1, 0, typed(t)); touch(steps(path)[0]);
          if (t.fields.some(function (x) { return x.name === 'images'; })) addImages(where.listPath + '.' + (i + 1) + '.images', 0);
          else reload();
        }));
      });
    } else if (isImageList(listDef)) {
      out.push(button('+ 사진', '바로 뒤에 사진 추가', function () { addImages(where.listPath, i + 1); }));
    } else {
      out.push(button('+ 새로', '바로 아래에 빈 항목 추가', function () {
        list.splice(i + 1, 0, blank(d, list[i])); touch(steps(path)[0]); reload();
      }));
    }
    out = out.concat(childButtons(path, d));
    if (hasDetails(d)) out.push(button('세부', '세부 정보 (링크, 날짜, 설명 등)', function () { details(path); }));
    out.push(button('삭제', '이 항목 삭제', function () {
      if (!confirm('이 항목을 지울까요? (저장해야 사이트에 반영돼요)')) return;
      list.splice(i, 1); touch(steps(path)[0]); reload();
    }, true));
    return out;
  }
  function regionTools(path) {
    var value = get(path), d = defAt(path);
    if (Array.isArray(value)) {
      return [button('+ 맨 위에 추가', '맨 위에 빈 항목 추가', function () {
        value.unshift(blank(itemDef(d, value[0]), value[0])); touch(steps(path)[0]); reload();
      })];
    }
    var out = childButtons(path, d);
    if (hasDetails(d)) out.push(button('세부', '세부 정보', function () { details(path); }));
    return out;
  }
  function swap(where, j) {
    var list = where.list, i = where.index, t = list[i];
    list[i] = list[j]; list[j] = t;
    touch(steps(where.listPath)[0]);
    reload();
  }
  function showTools(node) {
    clearTimeout(hideTimer);
    if (target === node) return;
    if (target) target.classList.remove('fpcl-target');
    target = node;
    target.classList.add('fpcl-target');
    // A picture gets turn buttons; one that is a list entry (photo board, figures) also gets the entry tools.
    var picture = node.getAttribute('data-type') === 'image';
    var list = node.hasAttribute('data-item') ? itemTools(node.getAttribute('data-item')) :
      picture ? [button('사진 바꾸기', '새 사진 올리기', function () { replaceImage(node); })] : regionTools(node.getAttribute('data-region'));
    tools.replaceChildren.apply(tools, picture ? rotateButtons(node).concat(list) : list);
    tools.hidden = false;
    var r = node.getBoundingClientRect();
    var top = r.top + scrollY - tools.offsetHeight - 4;
    if (r.top - tools.offsetHeight < 64) top = r.top + scrollY + 4; // under the sticky menu bar: put it inside
    tools.style.top = Math.max(0, top) + 'px';
    tools.style.left = Math.max(scrollX + 4, r.right + scrollX - tools.offsetWidth) + 'px';
  }
  function hideTools() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (target) target.classList.remove('fpcl-target');
      target = null;
      tools.hidden = true;
    }, 350);
  }
  tools.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
  tools.addEventListener('mouseleave', hideTools);

  /* ---------- Details form (values not shown as text) ---------- */

  function details(path, focusName) {
    var value = get(path), d = defAt(path);
    var fields = (d && d.fields || []).filter(function (f) { return f.widget !== 'list' && f.widget !== 'object'; });
    var dialog = el('dialog', { class: 'fpcl-dialog' });
    var form = el('form', { method: 'dialog' });
    form.appendChild(el('h2', {}, (d.label || '항목') + ' · 세부 정보'));
    var inputs = {};
    fields.forEach(function (f) {
      var row = el('label', { class: 'fpcl-row' });
      row.appendChild(el('span', {}, f.label + (f.required === false && !/\(선택\)/.test(f.label) ? ' (선택)' : '')));
      var input;
      if (f.widget === 'select') {
        input = el('select');
        f.options.forEach(function (o) { input.appendChild(el('option', { value: o }, o)); });
      } else if (f.widget === 'text') input = el('textarea', { rows: '3' });
      else if (f.widget === 'datetime') input = el('input', { type: 'date' });
      else if (f.widget === 'number') input = el('input', { type: 'number' });
      else input = el('input', { type: 'text' });
      input.value = value[f.name] == null ? '' : value[f.name];
      row.appendChild(input);
      if (f.widget === 'image') {
        row.appendChild(button('파일 선택', '새 사진 올리기', async function () {
          var picked = await pick(false);
          if (!picked.length) return;
          try { input.value = (await upload(picked[0])).path; toast('사진을 올렸어요. "적용"을 눌러 주세요.'); }
          catch (e) { toast(e.message, true); }
        }));
      }
      if (f.hint) row.appendChild(el('small', {}, f.hint));
      inputs[f.name] = input;
      form.appendChild(row);
    });
    var actions = el('div', { class: 'fpcl-actions' });
    actions.appendChild(button('닫기', '바꾸지 않고 닫기', function () { dialog.close(); }));
    actions.appendChild(button('적용', '바꾼 값 적용', function () {
      fields.forEach(function (f) {
        var v = inputs[f.name].value;
        if (f.widget === 'number') v = Number(v);
        else v = v.trim();
        if (v === '' && f.required === false) delete value[f.name];
        else value[f.name] = v;
      });
      dialog.close();
      touch(steps(path)[0]);
      reload();
    }));
    form.appendChild(actions);
    dialog.appendChild(form);
    dialog.addEventListener('close', function () { dialog.remove(); });
    document.body.appendChild(dialog);
    dialog.showModal();
    var first = inputs[focusName] || form.querySelector('input, select, textarea');
    if (first) first.focus();
  }

  /* ---------- Bottom bar ---------- */

  var bar = el('div', { id: 'fpcl-bar' });
  var status = el('span', { class: 'fpcl-status' });
  var toastBox = el('div', { id: 'fpcl-toast', hidden: '' });
  var toastTimer = null;
  function toast(message, error) {
    toastBox.textContent = message;
    toastBox.className = error ? 'error' : '';
    toastBox.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastBox.hidden = true; }, error ? 9000 : 4500);
  }
  function busy(on) {
    bar.querySelectorAll('button').forEach(function (b) { b.disabled = on; });
    if (on) status.textContent = '저장하는 중…';
  }
  function refreshBar() {
    if (!state.on) return;
    var list = dirtyFiles();
    status.textContent = list.length ? '저장 안 된 변경: ' + list.map(function (f) { return files[f].label; }).join(', ') : '바뀐 내용 없음';
    bar.classList.toggle('dirty', !!list.length);
  }
  // Signing out forgets the GitHub login in this browser (the same one /admin uses), so the page goes back
  // to what visitors see. Changes not saved yet are dropped.
  function logout() {
    if (dirtyFiles().length && !confirm('저장하지 않은 변경이 있어요. 버리고 로그아웃할까요?')) return;
    try { localStorage.removeItem('decap-cms-user'); } catch (e) { /* nothing kept */ }
    try { sessionStorage.removeItem(STORE); } catch (e) { /* nothing kept */ }
    reload();
  }
  function buildBar() {
    bar.replaceChildren();
    if (!state.on) {
      bar.className = 'off';
      bar.appendChild(button('✎ 편집', '이 페이지를 화면에서 바로 고치기', function () { state.on = true; store(); enable(); }));
      bar.appendChild(button('로그아웃', '이 브라우저에서 로그아웃', logout));
      return;
    }
    bar.className = '';
    bar.appendChild(el('strong', {}, '편집 중'));
    bar.appendChild(status);
    bar.appendChild(button('저장', '바꾼 내용을 GitHub에 저장', save));
    bar.appendChild(button('되돌리기', '저장하지 않은 변경 버리기', function () {
      if (!dirtyFiles().length) { toast('되돌릴 변경이 없어요.'); return; }
      if (!confirm('저장하지 않은 변경을 모두 버릴까요?')) return;
      dirtyFiles().forEach(function (f) { state.files[f].data = clone(state.files[f].base); });
      store();
      reload();
    }));
    bar.appendChild(button('끝내기', '편집 모드 끄기', function () {
      if (dirtyFiles().length && !confirm('저장하지 않은 변경이 있어요. 버리고 편집을 끝낼까요?')) return;
      dirtyFiles().forEach(function (f) { state.files[f].data = clone(state.files[f].base); });
      state.on = false;
      store();
      reload();
    }));
    var admin = el('a', { href: ROOT + 'adm/', title: '폼으로 편집하는 관리 화면' }, '관리 화면');
    bar.appendChild(admin);
    bar.appendChild(button('로그아웃', '이 브라우저에서 로그아웃', logout));
    refreshBar();
  }

  /* ---------- Turning it on ---------- */

  function enable() {
    document.documentElement.classList.add('fpcl-editing');
    document.querySelectorAll('main [data-field]').forEach(editable);
    // Hold the Research Highlights slideshow still while editing.
    document.querySelectorAll('.highlight-controls button').forEach(function (b) { if (b.textContent === 'Pause') b.click(); });
    showUploads();
    buildBar();
  }

  document.addEventListener('focusin', function (e) { if (state.on) onFocus(e); });
  document.addEventListener('input', function (e) { if (state.on) onInput(e); });
  document.addEventListener('keydown', function (e) { if (state.on) onKey(e); });
  document.addEventListener('paste', function (e) { if (state.on) onPaste(e); });
  document.addEventListener('mouseover', function (e) {
    if (!state.on || tools.contains(e.target)) return;
    var node = e.target.closest && e.target.closest('main [data-type="image"], main [data-item], main [data-region]');
    if (node) showTools(node);
    else if (target) hideTools();
  });
  document.addEventListener('click', function (e) {
    if (!state.on || !e.target.closest || e.target.closest('#fpcl-tools, #fpcl-bar, .fpcl-dialog')) return;
    if (!e.target.closest('main')) return;
    var field = e.target.closest('[data-field]');
    var type = field && field.getAttribute('data-type');
    if (type === 'image') { e.preventDefault(); replaceImage(field); return; }
    if (type === 'date' || type === 'choice') {
      e.preventDefault();
      var entry = field.closest('[data-item], [data-region]');
      if (entry) details(entry.getAttribute('data-item') || entry.getAttribute('data-region'), steps(field.getAttribute('data-field')).pop());
      return;
    }
    if (e.target.closest('a')) e.preventDefault(); // links inside the content are text to edit here
  }, true);
  document.addEventListener('error', function (e) {
    if (state.on && e.target.tagName === 'IMG') setTimeout(showUploads, 0);
  }, true);
  addEventListener('beforeunload', function (e) {
    if (state.on && !reloading && dirtyFiles().length) { e.preventDefault(); e.returnValue = ''; }
  });

  var style = el('style');
  style.textContent = [
    '.fpcl-editing main [data-field] { outline: 1px dashed transparent; outline-offset: 2px; border-radius: 2px; }',
    '.fpcl-editing main [data-field]:hover { outline-color: #8fbfea; }',
    '.fpcl-editing main [contenteditable]:focus { outline: 2px solid #137ed8; background: #fffbea; }',
    '.fpcl-editing main [data-type="image"], .fpcl-editing main [data-type="date"], .fpcl-editing main [data-type="choice"] { cursor: pointer; }',
    '.fpcl-editing main [data-type="image"]:hover { outline: 2px solid #137ed8; }',
    '.fpcl-editing main a { cursor: text; }',
    '.fpcl-target { box-shadow: 0 0 0 2px rgba(19, 126, 216, .22); border-radius: 4px; }',
    '#fpcl-tools { position: absolute; z-index: 40; display: flex; flex-wrap: wrap; gap: 2px; max-width: 520px; padding: 3px; background: #fff;',
    '  border: 1px solid #d5dbe2; border-radius: 7px; box-shadow: 0 6px 18px rgba(30, 40, 55, .14); font: 12px/1 system-ui, sans-serif; }',
    '#fpcl-tools[hidden] { display: none; }',
    '#fpcl-tools button { border: 0; background: transparent; padding: 6px 8px; border-radius: 5px; color: #2c3035; font: inherit; cursor: pointer; white-space: nowrap; }',
    '#fpcl-tools button:hover { background: #eef5fc; color: #137ed8; }',
    '#fpcl-tools button.danger:hover { background: #fdecea; color: #c0392b; }',
    '#fpcl-bar { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 45; display: flex; align-items: center; gap: 8px;',
    '  max-width: calc(100vw - 32px); padding: 7px 8px 7px 16px; background: #1f2a36; color: #fff; border-radius: 999px;',
    '  box-shadow: 0 8px 24px rgba(20, 30, 45, .28); font: 13px/1.3 system-ui, sans-serif; }',
    '#fpcl-bar.off { padding: 0; background: transparent; box-shadow: none; }',
    '#fpcl-bar strong { white-space: nowrap; }',
    '#fpcl-bar .fpcl-status { color: #b9c4d0; max-width: 360px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '#fpcl-bar.dirty .fpcl-status { color: #ffd479; }',
    '#fpcl-bar button, #fpcl-bar a { border: 0; border-radius: 999px; padding: 7px 13px; background: #33465a; color: #fff; font: inherit; cursor: pointer; white-space: nowrap; }',
    '#fpcl-bar button:hover, #fpcl-bar a:hover { background: #137ed8; color: #fff; }',
    '#fpcl-bar button:disabled { opacity: .5; cursor: default; }',
    '#fpcl-bar.off button { background: #1f2a36; box-shadow: 0 6px 18px rgba(20, 30, 45, .28); padding: 9px 16px; }',
    '#fpcl-toast { position: fixed; left: 50%; bottom: 70px; transform: translateX(-50%); z-index: 46; max-width: min(560px, calc(100vw - 32px));',
    '  padding: 10px 16px; background: #fff; color: #2c3035; border: 1px solid #d5dbe2; border-radius: 8px;',
    '  box-shadow: 0 6px 18px rgba(30, 40, 55, .16); font: 13px/1.5 system-ui, sans-serif; }',
    '#fpcl-toast.error { border-color: #e6a5a0; color: #a8322a; }',
    '#fpcl-toast[hidden] { display: none; }',
    '.fpcl-dialog { width: min(520px, calc(100vw - 32px)); border: 1px solid #d5dbe2; border-radius: 10px; padding: 20px 22px;',
    '  box-shadow: 0 16px 40px rgba(20, 30, 45, .25); font: 14px/1.5 system-ui, sans-serif; color: #2c3035; }',
    '.fpcl-dialog::backdrop { background: rgba(20, 30, 45, .35); }',
    '.fpcl-dialog h2 { margin: 0 0 14px; padding: 0; border: 0; font-size: 17px; }',
    '.fpcl-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }',
    '.fpcl-row span { font-weight: 600; font-size: 13px; }',
    '.fpcl-row small { color: #687079; font-size: 12px; }',
    '.fpcl-row input, .fpcl-row select, .fpcl-row textarea { font: inherit; padding: 7px 9px; border: 1px solid #c9d1da; border-radius: 6px; }',
    '.fpcl-row button { align-self: flex-start; border: 1px solid #c9d1da; background: #fff; border-radius: 6px; padding: 5px 10px; font: inherit; cursor: pointer; }',
    '.fpcl-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; }',
    '.fpcl-actions button { border: 1px solid #c9d1da; background: #fff; border-radius: 6px; padding: 7px 16px; font: inherit; cursor: pointer; }',
    '.fpcl-actions button:last-child { background: #137ed8; border-color: #137ed8; color: #fff; }'
  ].join('\n');

  async function init() {
    try {
      await script('adm/vendor/json5.min.js');
      await script('adm/format.js');
      await script('adm/config.js');
      format = window.FPCLAdminFormat;
      var connection = await fetch(ROOT + 'adm/connection.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
      repo = connection.repo;
      branch = connection.branch || 'main';
      config = window.FPCLAdminConfig(connection);
      var pageFiles = [].map.call(document.querySelectorAll('script[src]'), function (s) { return s.getAttribute('src').replace(ROOT, ''); })
        .filter(function (src) { return /^data\/.+\.js$/.test(src); });
      for (var i = 0; i < pageFiles.length; i++) {
        var file = pageFiles[i];
        var published = format.fromFile(await fetch(ROOT + file, { cache: 'no-store' }).then(function (r) { return r.text(); }));
        var entry = null, owner = null;
        config.collections.forEach(function (c) { c.files.forEach(function (f) { if (f.file === file) { entry = f; owner = c; } }); });
        files[file] = {
          keys: Object.keys(published), published: published,
          label: entry ? (owner.files.length > 1 ? owner.label.split(' · ')[0] + ' · ' + entry.label.replace(/ 편집$/, '') : owner.label) : file
        };
        files[file].keys.forEach(function (k) { keyFile[k] = file; });
        // Once the public site shows a saved file, stop drawing the copy kept in this tab.
        var kept = state.files[file];
        if (kept && same(kept.data, kept.base) && same(kept.data, published)) delete state.files[file];
      }
      store();
    } catch (e) {
      console.error(e);
      return;
    }
    if (!Object.keys(files).length) return; // nothing on this page comes from a data file (Research > Overview)
    document.head.appendChild(style);
    document.body.append(tools, bar, toastBox);
    if (state.on) enable(); else buildBar();
  }
  init();
})();
