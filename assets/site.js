/* FPCL site script. One file for every page.
   1) Builds the top menu and the footer (edit MENU and FOOTER below to change them on every page).
   2) Draws the lists kept in the data/ folder (publications, proceedings, members, photos).
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
  function url(path) { return /^(https?:|mailto:|#)/.test(path) ? path : ROOT + path; }
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

  // Bold the professor's name in author lists (J.H.Lee, J. H. Lee, with or without *).
  function boldPI(authors) {
    return String(authors).replace(/(J\.\s?H\.\s?Lee\*?)/g, '<b>$1</b>');
  }

  // Publications and proceedings, grouped by "group" and numbered from the total down to 1.
  function renderPubs(el, list) {
    var n = list.length;
    var html = '';
    var group = null;
    list.forEach(function (p) {
      if (p.group !== group) {
        if (group !== null) html += '</ol></section>';
        group = p.group;
        html += '<section><h2>' + esc(group) + '</h2><ol class="pubs">';
      }
      html += '<li class="pub"><span class="num">[' + (n--) + ']</span><span>' +
        boldPI(p.authors) + ', <span class="title">' + p.title + '</span>, <i>' + p.journal + '</i>' +
        (p.details ? ', ' + p.details : '') +
        (p.link ? ' <a class="link" href="' + esc(p.link) + '" target="_blank" rel="noopener">[Link]</a>' : '') +
        '</span></li>';
    });
    if (group !== null) html += '</ol></section>';
    el.outerHTML = '<p class="count">' + list.length + ' papers</p>' + html;
  }

  function renderMembers(el, list) {
    el.outerHTML = '<ul class="members">' + list.map(function (m) {
      var topics = (m.research || []).filter(Boolean);
      return '<li class="member">' +
        '<div class="photo"><img src="' + url(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy"></div>' +
        '<div><p class="name">' + esc(m.name) + '</p>' +
        '<dl class="facts"><dt>Position</dt><dd>' + esc(m.position) + '</dd>' +
        '<dt>Email</dt><dd>' + esc(m.email) + '</dd>' +
        '<dt>Period</dt><dd>' + esc(m.period) + '</dd></dl>' +
        (topics.length ? '<ul class="topics">' + topics.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
        '</div></li>';
    }).join('') + '</ul>';
  }

  function renderAlumni(el, list) {
    el.outerHTML = '<div class="table-wrap"><table class="plain"><thead><tr><th>Name</th><th>Degree</th><th>Period</th><th>Current position</th></tr></thead><tbody>' +
      list.map(function (a) {
        return '<tr><td>' + esc(a.name) + '</td><td class="nowrap">' + esc(a.degree) + '</td><td class="nowrap">' + esc(a.period) + '</td><td>' + esc(a.now) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function renderPhotos(el, list) {
    var html = '';
    var year = null;
    list.forEach(function (p) {
      var y = p.date.slice(0, 4);
      if (y !== year) {
        if (year !== null) html += '</div></section>';
        year = y;
        html += '<section><h2>' + y + '</h2><div class="posts">';
      }
      html += '<article class="post"><h3>' + esc(p.title) + '</h3>' +
        '<p class="meta"><time datetime="' + esc(p.date) + '">' + p.date.replace(/-/g, '.') + '</time>' + (p.text ? ' &middot; ' + esc(p.text) : '') + '</p>' +
        '<div class="imgs">' + (p.images || []).map(function (src) {
          return '<img src="' + url(src) + '" alt="' + esc(p.title) + '" loading="lazy">';
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

  function renderLists() {
    var D = window.FPCL;
    document.querySelectorAll('[data-list]').forEach(function (el) {
      var name = el.getAttribute('data-list');
      var list = D[name];
      if (!list) { el.textContent = 'List "' + name + '" not found. Check the data file.'; return; }
      var kind = el.getAttribute('data-kind');
      if (kind === 'pubs') renderPubs(el, list);
      else if (kind === 'members') renderMembers(el, list);
      else if (kind === 'alumni') renderAlumni(el, list);
      else if (kind === 'photos') renderPhotos(el, list);
      else if (kind === 'recent-photos') renderRecentPhotos(el, list, +(el.getAttribute('data-count') || 3));
    });
  }

  /* ===== 3. Gray box for images not added yet =================================== */

  function markMissing(img) {
    if (img.dataset.missing) return;
    img.dataset.missing = '1';
    var box = document.createElement('div');
    box.className = 'img-missing';
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

  buildHeader();
  buildSubnav();
  buildFooter();
  renderLists();
  watchImages();
})();
