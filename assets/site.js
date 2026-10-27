/* FPCL site script. One file for every page.
   1) Builds the top menu, the section list (under the title and at the right edge) and the footer
      (edit MENU and FOOTER below to change them on every page).
   2) Draws the content kept in the data/ folder (publications, proceedings, members, photos, home text,
      lectures, links, professor, equipment and research pages). All of it can also be edited at /admin.
   3) Shows a gray box in place of any image file that has not been added yet. */

window.FPCL = window.FPCL || {};

(function () {
  'use strict';

  /* ===== 1. Menu and footer ===================================================== */

  var MENU = [
    { label: 'Research', href: 'research/overview.html', sub: [
      ['Overview', 'research/overview.html'],
      ['Turbulent flow', 'research/turbulent-flow.html'],
      ['Numerical methods', 'research/numerical-methods.html'],
      ['Fluid-Structure Interaction (FSI) Problem', 'research/fsi.html'],
      ['Multi-phase flow', 'research/multiphase-flow.html'],
      ['CFD application', 'research/cfd-application.html']
    ] },
    { label: 'People', href: 'people/professor.html', sub: [
      ['Professor', 'people/professor.html'],
      ['Student', 'people/students.html'],
      ['Researcher', 'people/researchers.html'],
      ['Alumni', 'people/alumni.html']
    ] },
    { label: 'Publication', href: 'publications/international.html', sub: [
      ['International', 'publications/international.html'],
      ['Domestic', 'publications/domestic.html']
    ] },
    { label: 'Proceeding', href: 'proceedings/international.html', sub: [
      ['International', 'proceedings/international.html'],
      ['Domestic', 'proceedings/domestic.html']
    ] },
    { label: 'Photo', href: 'photo.html' },
    { label: 'Lectures', href: 'lectures.html' },
    { label: 'Equipment', href: 'equipment/servers.html', sub: [
      ['Server and workstation for numerical simulation', 'equipment/servers.html'],
      ['Commercial software (UNIST Supercomputing Center)', 'equipment/software.html'],
      ['Wind tunnel facility', 'equipment/wind-tunnel.html'],
      ['Equipment for flow visualization and measurement', 'equipment/measurement.html']
    ] },
    { label: 'Link', href: 'links.html' }
  ];

  var FOOTER = {
    name: 'Flow Physics and Control Laboratory (FPCL), UNIST',
    address: 'UNIST-gil 50, Ulsan 44919, Republic of Korea',
    tel: '+82-52-217-2350',
    fax: '+82-52-217-2459',
    email: 'jhlee06@unist.ac.kr'
  };

  /* ===== Helpers ================================================================ */

  var ROOT = document.documentElement.getAttribute('data-root') || '';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function url(path) { return /^(https?:|mailto:|#|\/)/.test(path) ? path : ROOT + path; }
  function here() {
    var p = location.pathname.replace(/\/index\.html$/, '/');
    return p;
  }
  function isCurrent(path) {
    var p = here();
    return p.slice(-path.length) === path;
  }

  function buildHeader() {
    var holder = document.getElementById('site-header');
    if (!holder) return;
    var items = MENU.map(function (m) {
      var cur = isCurrent(m.href) || (m.sub || []).some(function (s) { return isCurrent(s[1]); });
      var sub = m.sub ? '<ul class="sub">' + m.sub.map(function (s) {
        return '<li><a href="' + url(s[1]) + '">' + esc(s[0]) + '</a></li>';
      }).join('') + '</ul>' : '';
      return '<li' + (cur ? ' class="current"' : '') + '><a href="' + url(m.href) + '">' + esc(m.label) + '</a>' + sub + '</li>';
    }).join('');
    holder.outerHTML =
      '<header class="topbar" id="topbar"><div class="topbar-inner">' +
      '<a class="site-name" href="' + url('index.html') + '">Flow Physics and Control Lab.</a>' +
      '<button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
      '<nav class="nav" id="site-nav" aria-label="Main"><ul>' + items + '</ul></nav>' +
      '</div></header>';
    var bar = document.getElementById('topbar');
    var btn = document.getElementById('menu-btn');
    btn.addEventListener('click', function () {
      var open = bar.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
    });
  }

  function buildSubnav() {
    var holder = document.getElementById('subnav');
    if (!holder) return;
    var group = MENU.filter(function (m) {
      return (m.sub || []).some(function (s) { return isCurrent(s[1]); });
    })[0];
    if (!group) { holder.remove(); return; }
    holder.innerHTML = group.sub.map(function (s) {
      return '<a href="' + url(s[1]) + '"' + (isCurrent(s[1]) ? ' aria-current="page"' : '') + '>' + esc(s[0]) + '</a>';
    }).join('');
  }

  // The same section list, always shown at the right edge, with the headings of this page under the current item.
  // Runs after the data lists are drawn, so the year headings on the publication pages are included.
  // The arrow button above it folds the list down to dots and opens it back up; the choice is kept for the next pages.
  // A page whose section list has data-no-side (Research > Overview) gets no list at the right edge.
  function buildSideNav() {
    var subnav = document.getElementById('subnav');
    if (!subnav || subnav.hasAttribute('data-no-side')) return;
    var side = document.createElement('nav');
    side.className = 'side-nav';
    side.setAttribute('aria-label', 'Section shortcuts');
    side.innerHTML =
      '<button class="side-toggle" type="button" aria-controls="side-list">' +
      '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button><div class="side-list" id="side-list">' + subnav.innerHTML + '</div>';
    var box = side.querySelector('.side-list');
    var heads = pageHeadings();
    var current = box.querySelector('[aria-current="page"]');
    if (current && heads.length > 1) {
      var list = document.createElement('div');
      list.className = 'side-sub';
      list.innerHTML = heads.map(function (h) {
        var text = esc(h.textContent.trim());
        return '<a href="#' + h.id + '" title="' + text + '"><span>' + text + '</span></a>';
      }).join('');
      current.after(list);
      followHeadings(heads, list.children, box);
    }
    var btn = side.querySelector('.side-toggle');
    function setClosed(closed) {
      side.classList.toggle('closed', closed);
      btn.setAttribute('aria-expanded', closed ? 'false' : 'true');
      btn.setAttribute('aria-label', closed ? 'Show the names in the section list' : 'Fold the section list to dots');
      btn.title = closed ? 'Show names' : 'Show dots only';
    }
    var saved = null;
    try { saved = localStorage.getItem('fpcl-side-nav'); } catch (e) { /* storage blocked: start open */ }
    setClosed(saved === 'closed');
    btn.addEventListener('click', function () {
      var closed = !side.classList.contains('closed');
      setClosed(closed);
      try { localStorage.setItem('fpcl-side-nav', closed ? 'closed' : 'open'); } catch (e) { /* not remembered */ }
    });
    document.body.appendChild(side);
  }

  // The h2 headings of this page, each given an id to jump to. A heading that already has an id in the HTML
  // keeps it (links from Research > Overview point at those).
  function pageHeadings() {
    return [].filter.call(document.querySelectorAll('main h2'), function (h) {
      var text = h.textContent.trim();
      if (!text) return false;
      if (!h.id) {
        var base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
        var id = base, n = 2;
        while (document.getElementById(id)) id = base + '-' + n++;
        h.id = id;
      }
      return true;
    });
  }

  // Darkens the heading being read: the last one that has passed under the menu bar
  // (or the last one on the page once the bottom is reached). On a short screen where the side list
  // has to scroll, it keeps that heading in view.
  function followHeadings(heads, links, rail) {
    var waiting = false, last = -1;
    function update() {
      waiting = false;
      var active = -1;
      heads.forEach(function (h, i) { if (h.getBoundingClientRect().top < 120) active = i; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) active = heads.length - 1;
      [].forEach.call(links, function (a, i) { a.classList.toggle('active', i === active); });
      if (active !== last && active !== -1 && rail.scrollHeight > rail.clientHeight) {
        rail.scrollTop = links[active].offsetTop - rail.clientHeight / 2;
      }
      last = active;
    }
    addEventListener('scroll', function () {
      if (!waiting) { waiting = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // After a jump to a heading (a #link from another page or from the side list), pictures above it that load
  // late push it down. For a few seconds, put it back just under the menu bar, until the reader scrolls.
  function holdHeading() {
    var target = null, until = 0;
    function place() {
      if (!target || Date.now() > until) return;
      var gap = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      var off = target.getBoundingClientRect().top - gap;
      if (Math.abs(off) <= 2) return;
      var html = document.documentElement;
      html.style.scrollBehavior = 'auto'; // jump straight there instead of the usual smooth scroll
      scrollTo(0, scrollY + off);
      html.style.scrollBehavior = '';
    }
    function hold() {
      target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      until = Date.now() + 3000;
    }
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (type) {
      addEventListener(type, function () { until = 0; }, { passive: true });
    });
    addEventListener('hashchange', hold);
    // Pictures fire load or error (a missing one becomes a gray box right after), so wait a moment and re-place.
    ['load', 'error'].forEach(function (type) {
      document.addEventListener(type, function (e) { if (e.target.tagName === 'IMG') setTimeout(place, 0); }, true);
    });
    addEventListener('load', place);
    // On a reload the browser puts the page back where it was; leave it there.
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (!nav || nav.type !== 'reload') hold();
  }

  function buildFooter() {
    var holder = document.getElementById('site-footer');
    if (!holder) return;
    holder.outerHTML =
      '<footer><div class="footer-inner">' +
      '<strong>' + esc(FOOTER.name) + '</strong>' +
      '<span>' + esc(FOOTER.address) + '</span>' +
      '<span class="contact"><span>Tel ' + esc(FOOTER.tel) + '</span><span>Fax ' + esc(FOOTER.fax) +
      '</span><span>E-mail ' + esc(FOOTER.email) + '</span></span>' +
      '<span>&copy; FPCL, UNIST. All rights reserved.</span>' +
      '</div></footer>';
  }

  /* ===== 2. Lists drawn from the data/ folder =================================== */

  // Marks for the editing mode (assets/edit.js). data-item is an entry the editor can add, move or delete;
  // data-field is one value it can change in place (data-type: html allows <i>, <sub>, <sup>, <br>; image is a
  // picture; date and choice open a small form). data-region is a block whose lists the editor can add to.
  // Each holds the path into window.FPCL, such as "topics.2.blocks.1". Visitors never load the editor.
  function item(path) { return ' data-item="' + path + '"'; }
  function field(path, type) { return ' data-field="' + path + '"' + (type ? ' data-type="' + type + '"' : ''); }
  function region(path) { return ' data-region="' + path + '"'; }

  // Bold the professor's name in author lists (J.H.Lee, J. H. Lee, with or without *).
  function boldPI(authors) {
    return String(authors).replace(/(J\.\s?H\.\s?Lee\*?)/g, '<b>$1</b>');
  }

  // Publications and proceedings, grouped by "group" and numbered from the total down to 1.
  function renderPubs(el, list, key) {
    var n = list.length;
    var html = '';
    var group = null;
    list.forEach(function (p, i) {
      var at = key + '.' + i;
      if (p.group !== group) {
        if (group !== null) html += '</ol></section>';
        group = p.group;
        html += '<section><h2' + field(at + '.group', 'group') + '>' + esc(group) + '</h2><ol class="pubs">';
      }
      html += '<li class="pub"' + item(at) + '><span class="num">[' + (n--) + ']</span><span>' +
        '<span' + field(at + '.authors') + '>' + boldPI(p.authors) + '</span>, ' +
        '<span class="title"' + field(at + '.title', 'html') + '>' + p.title + '</span>, ' +
        '<i' + field(at + '.journal', 'html') + '>' + p.journal + '</i>' +
        (p.details ? ', <span' + field(at + '.details', 'html') + '>' + p.details + '</span>' : '') +
        (p.link ? ' <a class="link" href="' + esc(p.link) + '" target="_blank" rel="noopener">[Link]</a>' : '') +
        '</span></li>';
    });
    if (group !== null) html += '</ol></section>';
    el.outerHTML = '<p class="count"' + region(key) + '>' + list.length + ' papers</p>' + html;
  }

  // list holds [member, index in the data file] pairs, since a page may show only one position.
  function renderMembers(el, list, key) {
    el.outerHTML = '<ul class="members">' + list.map(function (pair) {
      var m = pair[0], at = key + '.' + pair[1];
      var topics = (m.research || []).map(function (t, j) { return [t, j]; }).filter(function (t) { return t[0]; });
      return '<li class="member"' + item(at) + '>' +
        '<div class="photo"><img src="' + url(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy"' + field(at + '.photo', 'image') + '></div>' +
        '<div><p class="name"' + field(at + '.name') + '>' + esc(m.name) + '</p>' +
        '<dl class="facts"><dt>Position</dt><dd' + field(at + '.position', 'choice') + '>' + esc(m.position) + '</dd>' +
        '<dt>Email</dt><dd' + field(at + '.email') + '>' + esc(m.email) + '</dd>' +
        '<dt>Period</dt><dd' + field(at + '.period') + '>' + esc(m.period) + '</dd></dl>' +
        (topics.length ? '<ul class="topics">' + topics.map(function (t) {
          return '<li' + item(at + '.research.' + t[1]) + field(at + '.research.' + t[1]) + '>' + esc(t[0]) + '</li>';
        }).join('') + '</ul>' : '') +
        '</div></li>';
    }).join('') + '</ul>';
  }

  function renderAlumni(el, list, key) {
    el.outerHTML = '<div class="table-wrap"' + region(key) + '><table class="plain"><thead><tr><th>Name</th><th>Degree</th><th>Period</th><th>Current position</th></tr></thead><tbody>' +
      list.map(function (a, i) {
        var at = key + '.' + i;
        return '<tr' + item(at) + '><td' + field(at + '.name') + '>' + esc(a.name) + '</td><td class="nowrap"' + field(at + '.degree') + '>' + esc(a.degree) +
          '</td><td class="nowrap"' + field(at + '.period') + '>' + esc(a.period) + '</td><td' + field(at + '.now') + '>' + esc(a.now) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function renderPhotos(el, list, key) {
    var html = '';
    var year = null;
    list.forEach(function (p, i) {
      var at = key + '.' + i;
      var y = p.date.slice(0, 4);
      if (y !== year) {
        if (year !== null) html += '</div></section>';
        year = y;
        html += '<section><h2>' + y + '</h2><div class="posts">';
      }
      html += '<article class="post"' + item(at) + '><h3' + field(at + '.title') + '>' + esc(p.title) + '</h3>' +
        '<p class="meta"><time datetime="' + esc(p.date) + '"' + field(at + '.date', 'date') + '>' + p.date.replace(/-/g, '.') + '</time>' +
        (p.text ? ' &middot; <span' + field(at + '.text') + '>' + esc(p.text) + '</span>' : '') + '</p>' +
        '<div class="imgs">' + (p.images || []).map(function (src, j) {
          return '<img src="' + url(src) + '" alt="' + esc(p.title) + '" loading="lazy"' + item(at + '.images.' + j) + field(at + '.images.' + j, 'image') + '>';
        }).join('') + '</div></article>';
    });
    if (year !== null) html += '</div></section>';
    el.outerHTML = html;
  }

  function renderRecentPhotos(el, list, count) {
    el.outerHTML = '<ul class="photo-list">' + list.slice(0, count).map(function (p) {
      return '<li><time datetime="' + esc(p.date) + '">' + p.date.replace(/-/g, '.') + '</time><a href="' + url('photo.html') + '">' + esc(p.title) + '</a></li>';
    }).join('') + '</ul>';
  }

  function renderHighlights(el, list, key) {
    el.innerHTML = list.map(function (slide, i) {
      var at = key + '.' + i;
      var authors = esc(slide.authors).replace(/Jae Hwa Lee/g, '<b>Jae Hwa Lee</b>');
      return '<li' + item(at) + '><div class="fig"><img src="' + esc(url(slide.image)) + '" alt="' + esc(slide.alt || slide.title) + '"' + field(at + '.image', 'image') + '></div>' +
        '<h3' + field(at + '.title') + '>' + esc(slide.title) + '</h3><p class="cite"><span' + field(at + '.authors') + '>' + authors + '</span>' +
        '<br><i' + field(at + '.journal') + '>' + esc(slide.journal) + '</i>' +
        (slide.details ? ', <span' + field(at + '.details') + '>' + esc(slide.details) + '</span>' : '') + '</p></li>';
    }).join('');
  }

  // Plain text with e-mail and web addresses made into links (the text is escaped first).
  function linkify(text) {
    return esc(text).replace(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(https?:\/\/[^\s<]*[^\s<.,;:)])/g, function (m, mail, web) {
      return mail ? '<a href="mailto:' + mail + '">' + mail + '</a>' :
        '<a href="' + web + '" target="_blank" rel="noopener">' + web + '</a>';
    });
  }

  // Home: the About paragraphs and the Notice box (data/home.js).
  function renderAbout(el, list, key) {
    el.outerHTML = '<div class="about"' + region(key) + '>' + list.map(function (p, i) {
      return '<p' + item(key + '.' + i) + field(key + '.' + i) + '>' + esc(p) + '</p>';
    }).join('') + '</div>';
  }
  function renderNotices(el, list, key) {
    el.outerHTML = list.map(function (n, i) {
      var at = key + '.' + i;
      return '<div' + item(at) + '><h3' + field(at + '.title') + '>' + esc(n.title) + '</h3><p' + field(at + '.text') + '>' + linkify(n.text) + '</p></div>';
    }).join('');
  }

  function renderLectures(el, list, key) {
    el.outerHTML = '<div class="table-wrap"' + region(key) + '><table class="plain"><thead><tr><th>Semester</th><th>Course</th></tr></thead><tbody>' +
      list.map(function (l, i) {
        var at = key + '.' + i;
        return '<tr' + item(at) + '><td class="nowrap"' + field(at + '.semester') + '>' + esc(l.semester) + '</td><td' + field(at + '.courses') + '>' + esc(l.courses) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function renderLinks(el, list, key) {
    el.outerHTML = list.map(function (g, i) {
      var at = key + '.' + i;
      return '<section' + item(at) + '><h2' + field(at + '.group') + '>' + esc(g.group) + '</h2><ul class="plain-list">' + g.items.map(function (l, j) {
        return '<li' + item(at + '.items.' + j) + '><a href="' + esc(l.url) + '" target="_blank" rel="noopener"' + field(at + '.items.' + j + '.title') + '>' + esc(l.title) + '</a></li>';
      }).join('') + '</ul></section>';
    }).join('');
  }

  // Professor page: the photo and contact block, then the CV sections (data/professor.js).
  function renderProfessor(el, p, key) {
    el.outerHTML = '<div class="prof"' + region(key) + '><div class="prof-photo"><img src="' + esc(url(p.photo)) + '" alt="' + esc(p.name) + '"' + field(key + '.photo', 'image') + '></div>' +
      '<div class="prof-info"><p class="prof-name"><strong' + field(key + '.name') + '>' + esc(p.name) + '</strong> <span' + field(key + '.degree') + '>' + esc(p.degree) + '</span></p>' +
      '<p' + field(key + '.position') + '>' + esc(p.position) + '</p><p' + field(key + '.department') + '>' + esc(p.department) + '</p>' +
      '<dl class="facts">' + (p.facts || []).map(function (f, i) {
        var at = key + '.facts.' + i;
        return '<dt' + field(at + '.label') + '>' + esc(f.label) + '</dt><dd' + item(at) + field(at + '.value') + '>' + esc(f.value) + '</dd>';
      }).join('') + '</dl></div></div>';
  }
  function renderCv(el, list, key) {
    el.outerHTML = list.map(function (s, i) {
      var at = key + '.' + i;
      return '<section' + item(at) + '><h2' + field(at + '.heading') + '>' + esc(s.heading) + '</h2><ul class="cv-list">' +
        s.items.map(function (text, j) {
          return '<li' + item(at + '.items.' + j) + field(at + '.items.' + j) + '>' + esc(text) + '</li>';
        }).join('') + '</ul></section>';
    }).join('');
  }

  // Equipment pages: the list (with its smaller lists) and the pictures. One picture fills the width;
  // several sit side by side (data/equipment.js).
  function renderEquipment(el, page, key) {
    var imgs = (page.images || []).map(function (i, k) {
      var at = key + '.images.' + k;
      return '<img src="' + esc(url(i.image)) + '" alt="' + esc(i.alt || '') + '" loading="lazy"' + item(at) + field(at + '.image', 'image') + '>';
    });
    el.outerHTML = '<ul class="plain-list"' + region(key) + '>' + page.items.map(function (i, j) {
      var at = key + '.items.' + j;
      var sub = (i.sub || []).length ? '<ul>' + i.sub.map(function (s, k) {
        return '<li' + item(at + '.sub.' + k) + field(at + '.sub.' + k) + '>' + esc(s) + '</li>';
      }).join('') + '</ul>' : '';
      return '<li' + item(at) + '><span' + field(at + '.text') + '>' + esc(i.text) + '</span>' + sub + '</li>';
    }).join('') + '</ul>' +
      (imgs.length === 1 ? '<figure class="wide-figure">' + imgs[0] + '</figure>' :
       imgs.length ? '<div class="fig-row">' + imgs.join('') + '</div>' : '');
  }

  // Research pages: each topic is a heading followed by paragraphs and figures in order (data/research/*.js).
  // Titles, paragraphs and captions may hold <i>, <sub>, <sup> and <br>, so they are used as written.
  function renderTopics(el, list, key) {
    el.outerHTML = list.map(function (t, i) {
      var at = key + '.' + i;
      return '<section class="topic"' + item(at) + '><h2' + (t.id ? ' id="' + esc(t.id) + '"' : '') + field(at + '.title', 'html') + '>' + t.title + '</h2>' +
        (t.blocks || []).map(function (b, j) {
          var bt = at + '.blocks.' + j;
          if (b.type === 'text') return '<p' + item(bt) + field(bt + '.text', 'html') + '>' + b.text + '</p>';
          return '<figure class="figure"' + item(bt) + '><div class="imgs">' + (b.images || []).map(function (src, k) {
            return '<img src="' + esc(url(src)) + '" alt="" loading="lazy"' + item(bt + '.images.' + k) + field(bt + '.images.' + k, 'image') + '>';
          }).join('') + '</div>' + (b.caption ? '<figcaption' + field(bt + '.caption', 'html') + '>' + b.caption + '</figcaption>' : '') + '</figure>';
        }).join('') + '</section>';
    }).join('');
  }

  function renderLists() {
    var D = window.FPCL;
    document.querySelectorAll('[data-list]').forEach(function (el) {
      var name = el.getAttribute('data-list');
      var list = D[name];
      if (!list) { el.textContent = 'List "' + name + '" not found. Check the data file.'; return; }
      var kind = el.getAttribute('data-kind');
      if (kind === 'pubs') renderPubs(el, list, name);
      else if (kind === 'highlights') renderHighlights(el, list, name);
      else if (kind === 'members') {
        var position = el.getAttribute('data-position');
        var members = list.map(function (member, i) { return [member, i]; }).filter(function (pair) {
          return !position || String(pair[0].position).split('(')[0].trim().toLowerCase() === position.toLowerCase();
        });
        renderMembers(el, members, name);
      }
      else if (kind === 'alumni') renderAlumni(el, list, name);
      else if (kind === 'photos') renderPhotos(el, list, name);
      else if (kind === 'recent-photos') renderRecentPhotos(el, list, +(el.getAttribute('data-count') || 3));
      else if (kind === 'about') renderAbout(el, list, name);
      else if (kind === 'notices') renderNotices(el, list, name);
      else if (kind === 'lectures') renderLectures(el, list, name);
      else if (kind === 'links') renderLinks(el, list, name);
      else if (kind === 'professor') renderProfessor(el, list, name);
      else if (kind === 'cv') renderCv(el, list, name);
      else if (kind === 'equipment') renderEquipment(el, list, name);
      else if (kind === 'topics') renderTopics(el, list, name);
    });
  }

  /* ===== 3. Gray box for images not added yet =================================== */

  function markMissing(img) {
    if (img.dataset.missing) return;
    img.dataset.missing = '1';
    var box = document.createElement('div');
    box.className = 'img-missing';
    ['data-item', 'data-field', 'data-type'].forEach(function (name) { // the editor can still replace it
      if (img.hasAttribute(name)) box.setAttribute(name, img.getAttribute(name));
    });
    var path = (img.getAttribute('src') || '').replace(ROOT, '');
    box.innerHTML = '<span>그림 추가 필요</span><code>' + esc(path) + '</code>';
    img.replaceWith(box);
  }
  function watchImages() {
    document.querySelectorAll('img').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) markMissing(img);
      else img.addEventListener('error', function () { markMissing(img); });
    });
  }

  /* ===== 4. Editing on the page itself =========================================== */

  // Someone signed in at /admin (the editor keeps the GitHub login in this browser) gets assets/edit.js.
  // Changes not saved yet, and files saved a moment ago that the public site has not caught up with,
  // are kept in this tab and drawn instead of the published data files.
  var EDITING = (function () {
    try {
      var user = JSON.parse(localStorage.getItem('decap-cms-user') || 'null');
      return !!(user && (user.token || user.access_token));
    } catch (e) { return false; }
  })();
  function pageDataFiles() {
    return [].map.call(document.querySelectorAll('script[src]'), function (s) {
      return s.getAttribute('src').replace(ROOT, '');
    }).filter(function (src) { return /^data\/.+\.js$/.test(src); });
  }
  function applyEdits() {
    if (!EDITING) return;
    var state = null;
    try { state = JSON.parse(sessionStorage.getItem('fpcl-edit') || 'null'); } catch (e) { /* nothing kept */ }
    if (!state || !state.files) return;
    pageDataFiles().forEach(function (file) {
      var kept = state.files[file];
      if (kept) Object.keys(kept.data).forEach(function (key) { window.FPCL[key] = kept.data[key]; });
    });
  }
  function loadEditor() {
    if (!EDITING) return;
    var s = document.createElement('script');
    s.src = ROOT + 'assets/edit.js';
    document.body.appendChild(s);
  }

  buildHeader();
  buildSubnav();
  buildFooter();
  applyEdits();
  renderLists();
  buildSideNav();
  holdHeading();
  watchImages();
  loadEditor();
})();
