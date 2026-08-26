/* Saffa.ae — main.js */
(function () {
  'use strict';

  /* ---- Mobile Nav ---- */
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const closeBtn  = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => mobileMenu.classList.add('open'));
  }
  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => mobileMenu.classList.remove('open'));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu) mobileMenu.classList.remove('open');
  });

  /* ---- Active nav link ---- */
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link, .mobile-menu-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const linkPath = href.replace(/\/$/, '') || '/';
    if (path === linkPath || (linkPath !== '/' && path.startsWith(linkPath))) {
      link.classList.add('active');
    }
  });

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- Intersection observer: fade-in sections ---- */
  if ('IntersectionObserver' in window) {
    const els = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }
})();
