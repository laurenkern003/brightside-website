/* Brightside Cleaning NWA — site scripts (no dependencies, ~4KB) */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header state on scroll + mobile CTA bar ---- */
  var header = document.querySelector('.site-header');
  var mobileCta = document.querySelector('.mobile-cta');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (mobileCta) mobileCta.classList.toggle('is-visible', y > window.innerHeight * 0.7);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    doc.classList.toggle('nav-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (open) { var first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && doc.classList.contains('nav-open')) { setMenu(false); toggle.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 900 && doc.classList.contains('nav-open')) setMenu(false); });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Images: fade out broken placeholders gracefully ---- */
  document.querySelectorAll('.media img').forEach(function (img) {
    function fail() { img.classList.add('is-missing'); }
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') fail();
    img.addEventListener('error', fail);
  });

  /* ---- Smooth FAQ accordion (progressive enhancement on <details>) ---- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var summary = item.querySelector('summary');
    var body = item.querySelector('.faq-item__body');
    if (!summary || !body || reduceMotion) return;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (item.open) {
        body.animate([{ height: body.offsetHeight + 'px' }, { height: '0px' }], { duration: 450, easing: 'cubic-bezier(.25,.46,.3,1)' })
          .onfinish = function () { item.open = false; };
      } else {
        item.open = true;
        body.animate([{ height: '0px' }, { height: body.offsetHeight + 'px' }], { duration: 550, easing: 'cubic-bezier(.25,.46,.3,1)' });
      }
    });
  });

  /* ---- Conversion tracking: estimate & call clicks (works once Google Analytics / gtag is added) ---- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta], [data-call], [data-apply]');
    if (!el || typeof window.gtag !== 'function') return;
    if (el.hasAttribute('data-apply')) {
      window.gtag('event', 'apply_click', { cta_location: el.getAttribute('data-apply'), page_path: window.location.pathname, transport_type: 'beacon' });
      return;
    }
    var isCall = el.hasAttribute('data-call');
    window.gtag('event', isCall ? 'phone_call_click' : 'estimate_request_click', {
      cta_location: el.getAttribute(isCall ? 'data-call' : 'data-cta'),
      page_path: window.location.pathname,
      transport_type: 'beacon'
    });
  });

  /* ---- Service checklists: filter by room ---- */
  document.querySelectorAll('[data-checklist]').forEach(function (cl) {
    var chips = cl.querySelectorAll('.cl-chip');
    var rooms = cl.querySelectorAll('.cl-room');
    cl.classList.add('is-interactive');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var room = chip.getAttribute('data-room');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        cl.classList.toggle('is-filtered', room !== 'all');
        rooms.forEach(function (r) {
          var show = room === 'all' || r.getAttribute('data-room') === room;
          r.hidden = !show;
          if (show && !reduceMotion) r.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.25,.46,.3,1)' });
        });
      });
    });
  });

  /* ---- Compare table: differences first, toggle to all tasks ---- */
  document.querySelectorAll('[data-compare]').forEach(function (wrap) {
    var bar = wrap.previousElementSibling;
    var btn = bar && bar.querySelector('.cmp-toggle');
    var count = bar && bar.querySelector('.cmp-count');
    if (!btn) return;
    bar.classList.add('is-interactive');
    function set(diffOnly) {
      wrap.classList.toggle('is-diff', diffOnly);
      btn.textContent = btn.getAttribute(diffOnly ? 'data-diff-label' : 'data-all-label');
      btn.setAttribute('aria-pressed', String(!diffOnly));
      count.textContent = count.getAttribute(diffOnly ? 'data-diff' : 'data-all');
    }
    set(true);
    btn.addEventListener('click', function () { set(!wrap.classList.contains('is-diff')); });
  });

  /* ---- Footer year ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
