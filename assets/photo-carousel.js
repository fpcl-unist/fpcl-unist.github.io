/* Recent Photo carousel. Posts come from data/photos.js (editable through /adm/).
   Change data-interval on the Photo section in index.html; 5000 means 5 seconds. */
(function () {
  'use strict';
  var carousel = document.querySelector('.photo-carousel');
  if (!carousel) return;
  var list = carousel.querySelector('.photo-slides');
  var slides = Array.from(list.children);
  if (slides.length < 2) return;
  var current = 0, timer = null, hovered = false, focused = false;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var playing = !motion.matches;
  var interval = Math.max(2000, Number(carousel.dataset.interval) || 5000);
  var controls = document.createElement('div');
  controls.className = 'photo-controls';
  function button(label, text, action) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = text; b.setAttribute('aria-label', label);
    b.setAttribute('aria-controls', list.id);
    b.addEventListener('click', action);
    return b;
  }
  var previous = button('Previous photo post', '‹', function () { show(current - 1); });
  var next = button('Next photo post', '›', function () { show(current + 1); });
  var dots = document.createElement('div'); dots.className = 'photo-dots';
  var selectors = slides.map(function (slide, i) {
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
    var image = slide.querySelector('img');
    if (image) image.loading = 'eager';
    var dot = button('Show photo post ' + (i + 1), '', function () { show(i); });
    dots.appendChild(dot); return dot;
  });
  var count = document.createElement('span'); count.className = 'photo-counter';
  var toggle = button('Pause automatic slideshow', 'Pause', function () {
    playing = !playing; updatePlayback();
  });
  controls.append(previous, dots, next, count, toggle);
  carousel.insertBefore(controls, carousel.querySelector('.more'));
  carousel.classList.add('is-carousel');
  function schedule() {
    window.clearTimeout(timer);
    if (playing && !hovered && !focused && !document.hidden) {
      timer = window.setTimeout(function () { show(current + 1); }, interval);
    }
  }
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.hidden = i !== current;
      if (i === current) selectors[i].setAttribute('aria-current', 'true');
      else selectors[i].removeAttribute('aria-current');
    });
    count.textContent = (current + 1) + ' / ' + slides.length;
    schedule();
  }
  function updatePlayback() {
    toggle.textContent = playing ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', playing ? 'Pause automatic slideshow' : 'Play automatic slideshow');
    // Avoid announcing automatic changes while someone is reading the page.
    list.setAttribute('aria-live', playing ? 'off' : 'polite');
    schedule();
  }
  carousel.addEventListener('mouseenter', function () { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', function () { hovered = false; schedule(); });
  carousel.addEventListener('focusin', function () { focused = true; schedule(); });
  carousel.addEventListener('focusout', function (event) {
    if (!carousel.contains(event.relatedTarget)) { focused = false; schedule(); }
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', function () {
    if (motion.matches) { playing = false; updatePlayback(); }
  });
  show(0); updatePlayback();
})();
