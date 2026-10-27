/* Converts the existing data files without evaluating JavaScript. */
(function (root) {
  'use strict';
  var groups = [
    ['journalsInternational', 'journalsDomestic'],
    ['proceedingsInternational', 'proceedingsDomestic'],
    ['photos'],
    ['students', 'researchers', 'alumni'],
    ['highlightSettings', 'highlights']
  ];
  function check(value) {
    var keys = Object.keys(value);
    if (!groups.some(function (group) {
      return group.length === keys.length && group.every(function (key) {
        return keys.includes(key) && (key === 'highlightSettings' ?
          value[key] && typeof value[key] === 'object' && !Array.isArray(value[key]) : Array.isArray(value[key]));
      });
    })) throw new Error('데이터 항목이 맞지 않습니다. 저장을 중단했습니다.');
    keys.forEach(function (key) {
      if (key === 'highlightSettings') {
        if (!Number.isInteger(value[key].interval) || value[key].interval < 2000 || value[key].interval > 60000) {
          throw new Error('슬라이드 전환 시간은 2000~60000 밀리초로 입력해 주세요.');
        }
        return;
      }
      value[key].forEach(function (item) {
        var member = ['students', 'researchers', 'alumni'].includes(key);
        if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item[member ? 'name' : 'title'] !== 'string') {
          throw new Error('게시물 제목 또는 형식을 확인해 주세요.');
        }
        if (member) {
          var required = key === 'alumni' ? ['degree', 'period'] : ['position', 'email', 'period', 'photo'];
          if (!required.every(function (field) { return typeof item[field] === 'string'; }) ||
              (key !== 'alumni' && item.research != null && (!Array.isArray(item.research) || !item.research.every(function (topic) { return typeof topic === 'string'; })))) {
            throw new Error('구성원의 학위·직책·이메일·기간·사진·연구주제를 확인해 주세요.');
          }
          if (key === 'students' && !['Ph.D. Student', 'Combined M.S./Ph.D. Student', 'M.S. Student'].includes(item.position.split('(')[0].trim())) {
            throw new Error('학생 과정은 Ph.D., Combined M.S./Ph.D., M.S. 중에서 선택해 주세요.');
          }
        } else if (key === 'highlights') {
          if (!['image', 'authors', 'journal'].every(function (field) { return typeof item[field] === 'string'; })) {
            throw new Error('슬라이드의 이미지·저자·저널을 확인해 주세요.');
          }
        } else if (key === 'photos') {
          if (typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Array.isArray(item.images) || !item.images.every(function (p) { return typeof p === 'string'; })) {
            throw new Error('사진 게시물의 날짜와 사진 목록을 확인해 주세요.');
          }
        } else if (!['group', 'authors', 'journal'].every(function (field) { return typeof item[field] === 'string'; })) {
          throw new Error('논문·발표의 연도, 저자, 저널/학회명을 확인해 주세요.');
        }
      });
    });
    return value;
  }
  var format = {
    fromFile: function (text) {
      var result = {};
      var pattern = /^FPCL\.(\w+)\s*=\s*(?=[\[{])/gm;
      var match;
      while ((match = pattern.exec(text))) {
        var start = pattern.lastIndex, end = start, depth = 0, quote = '', comment = '';
        for (; end < text.length; end++) {
          var c = text[end], next = text[end + 1];
          if (comment === '//') { if (c === '\n') comment = ''; continue; }
          if (comment === '/*') { if (c === '*' && next === '/') { comment = ''; end++; } continue; }
          if (quote) {
            if (c === '\\') end++;
            else if (c === quote) quote = '';
            continue;
          }
          if (c === '/' && (next === '/' || next === '*')) { comment = c + next; end++; continue; }
          if (c === '"' || c === "'") { quote = c; continue; }
          if (c === '[' || c === '{') depth++;
          if ((c === ']' || c === '}') && --depth === 0) break;
        }
        if (end === text.length) throw new Error('데이터의 끝을 찾을 수 없습니다.');
        if (Object.prototype.hasOwnProperty.call(result, match[1])) throw new Error('중복 데이터 항목');
        Object.defineProperty(result, match[1], { value: root.JSON5.parse(text.slice(start, end + 1)), enumerable: true });
        pattern.lastIndex = end + 1;
      }
      return check(result);
    },
    toFile: function (value) {
      check(value);
      return 'window.FPCL = window.FPCL || {};\n\n' +
        '/* Managed through /adm/. Newest items first; order is preserved. */\n' +
        Object.keys(value).map(function (key) {
          return 'FPCL.' + key + ' = ' + JSON.stringify(value[key], null, 2) + ';\n';
        }).join('\n');
    }
  };
  root.FPCLAdminFormat = format;
})(typeof window !== 'undefined' ? window : globalThis);
