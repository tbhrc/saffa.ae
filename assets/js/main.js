/* Saffa.ae — main.js */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Mobile Nav v0.2 — CSS-transition driven, backdrop, scroll-lock ──────── */
    const mobileBtn  = document.getElementById('mobile-menu-btn');
    const closeBtn   = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');

    /* Create backdrop element */
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
    }

    function openNav() {
      if (!mobileMenu) return;
      mobileMenu.classList.add('is-open');
      backdrop.classList.add('is-visible');
      document.body.classList.add('nav-open');
      if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('is-open');
      backdrop.classList.remove('is-visible');
      document.body.classList.remove('nav-open');
      if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
    }

    if (mobileBtn) mobileBtn.addEventListener('click', openNav);
    if (closeBtn)  closeBtn.addEventListener('click', closeNav);
    if (backdrop)  backdrop.addEventListener('click', closeNav);

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    /* Close when a nav link is tapped (SPA-like feel) */
    if (mobileMenu) {
      mobileMenu.querySelectorAll('.mobile-menu-link').forEach(function (link) {
        link.addEventListener('click', function () {
          setTimeout(closeNav, 80);
        });
      });
    }

    /* ── Active nav link ─────────────────────────────────────────────────────── */
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-link, .mobile-menu-link').forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const linkPath = href.replace(/\/$/, '') || '/';
      if (path === linkPath || (linkPath !== '/' && path.startsWith(linkPath))) {
        link.classList.add('active');
      }
    });

    /* ── Smooth scroll for anchor links ─────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    /* ── Measurement: event tracking hooks ──────────────────────────────────── */
    /* Fires window.saffa.track(event, props) — consumed by analytics snippet
       (Plausible custom events, GA4 gtag, etc.) when present.             */
    window.saffa = window.saffa || {};
    window.saffa.track = function (event, props) {
      /* Plausible */
      if (typeof window.plausible === 'function') {
        window.plausible(event, { props: props });
      }
      /* GA4 */
      if (typeof window.gtag === 'function') {
        window.gtag('event', event, props || {});
      }
    };

    /* Provider website clicks */
    document.querySelectorAll('a[data-track="provider-click"]').forEach(function (a) {
      a.addEventListener('click', function () {
        window.saffa.track('provider_click', { provider: a.dataset.provider || a.href });
      });
    });

    /* WhatsApp join clicks */
    document.querySelectorAll('a[href*="chat.whatsapp.com"], a[href*="wa.me"]').forEach(function (a) {
      a.addEventListener('click', function () {
        window.saffa.track('whatsapp_click', { url: a.href.split('?')[0] });
      });
    });

    /* Directory search performed */
    var heroSearch = document.getElementById('hero-search');
    if (heroSearch) {
      heroSearch.addEventListener('submit', function () {
        var q = (heroSearch.querySelector('input') || {}).value || '';
        window.saffa.track('search', { query: q.slice(0, 100) });
      });
    }

    /* ── Legacy .fade-in support ─────────────────────────────────────────────── */
    if ('IntersectionObserver' in window) {
      const els = document.querySelectorAll('.fade-in');
      const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      els.forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        obs.observe(el);
      });
    }

  }); /* end DOMContentLoaded */
})();
