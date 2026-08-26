/* Saffa.ae — motion.js
   Hero entrance sequence, scroll reveals, parallax, reduced-motion support.
   CSS transitions do the heavy lifting; this JS only drives timing + observation.
*/
(function () {
  'use strict';

  /* Signal synchronously that JS motion is available.
     CSS uses .js-motion [data-hero-reveal] { opacity:0 } — without this class,
     hero content stays visible even if this script fails or is slow on mobile. */
  document.documentElement.classList.add('js-motion');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero entrance sequence ─────────────────────────────────────────────── */
  function runHeroEntrance() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    if (prefersReduced) {
      hero.querySelectorAll('[data-hero-reveal]').forEach(el => el.classList.add('hero-visible'));
      return;
    }

    const layers = hero.querySelectorAll('[data-hero-reveal]');
    layers.forEach((el, i) => {
      const delay = parseInt(el.dataset.heroReveal || '0', 10);
      setTimeout(() => el.classList.add('hero-visible'), delay);
    });

    /* Hero image parallax on scroll — desktop only */
    if (window.innerWidth >= 768) {
      const heroImg = hero.querySelector('.hero-bg-img');
      if (heroImg) {
        window.addEventListener('scroll', function () {
          const scrolled = window.pageYOffset;
          if (scrolled < window.innerHeight * 1.5) {
            heroImg.style.transform = `translateY(${scrolled * 0.18}px)`;
          }
        }, { passive: true });
      }
    }
  }

  /* ── Section reveal via IntersectionObserver ────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-stagger');
    if (!els.length) return;

    if (prefersReduced) {
      els.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.classList.contains('reveal-stagger')) {
            el.querySelectorAll('[data-stagger]').forEach(function (child) {
              const delay = parseInt(child.dataset.stagger || '0', 10);
              setTimeout(() => child.classList.add('revealed'), delay);
            });
            el.classList.add('revealed');
          } else {
            el.classList.add('revealed');
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  /* ── Gold arc subtle drift ──────────────────────────────────────────────── */
  function initGoldArc() {
    const arc = document.querySelector('.hero-gold-arcs');
    if (!arc || prefersReduced) return;

    let tick = 0;
    function drift() {
      tick += 0.003;
      const x = Math.sin(tick) * 6;
      const y = Math.cos(tick * 0.7) * 4;
      arc.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(drift);
    }
    requestAnimationFrame(drift);
  }

  /* ── Community group swipe rail ─────────────────────────────────────────── */
  function initSwipeRail() {
    const rails = document.querySelectorAll('.wa-swipe-rail');
    rails.forEach(function (rail) {
      let isDown = false, startX = 0, scrollLeft = 0;
      rail.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - rail.offsetLeft; scrollLeft = rail.scrollLeft; });
      rail.addEventListener('mouseleave', () => { isDown = false; });
      rail.addEventListener('mouseup', () => { isDown = false; });
      rail.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - rail.offsetLeft;
        rail.scrollLeft = scrollLeft - (x - startX) * 1.5;
      });
    });
  }

  /* ── Init ───────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    runHeroEntrance();
    initReveal();
    initGoldArc();
    initSwipeRail();
  });
})();
