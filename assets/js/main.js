(function () {
  'use strict';

  // ===== Mobile Nav =====
  const sidebar = document.getElementById('sidebar');
  const navToggle = document.querySelector('.mobile-nav-toggle');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      const icon = navToggle.querySelector('i');
      icon.classList.toggle('bi-list');
      icon.classList.toggle('bi-x');
    });
  }

  // Close sidebar on nav link click (mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1200) {
        sidebar.classList.remove('open');
        const icon = navToggle.querySelector('i');
        icon.classList.add('bi-list');
        icon.classList.remove('bi-x');
      }
    });
  });

  // ===== Smooth Scroll =====
  document.querySelectorAll('.scrollto').forEach(el => {
    el.addEventListener('click', function (e) {
      const target = document.querySelector(this.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== Active Nav on Scroll =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link.scrollto');

  const setActiveNav = () => {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
      if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.hash === '#' + section.id) link.classList.add('active');
        });
      }
    });
  };

  window.addEventListener('scroll', setActiveNav);
  window.addEventListener('load', setActiveNav);

  // ===== Back to Top =====
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('active', window.scrollY > 100);
    });
    backToTop.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Typed.js =====
  const typedEl = document.querySelector('.typed');
  if (typedEl) {
    const items = typedEl.getAttribute('data-typed-items').split(',');
    new Typed('.typed', {
      strings: items,
      loop: true,
      typeSpeed: 80,
      backSpeed: 40,
      backDelay: 2000
    });
  }

  // ===== AOS =====
  window.addEventListener('load', () => {
    AOS.init({ duration: 700, easing: 'ease-out', once: true });
  });

  // ===== Portfolio Isotope =====
  window.addEventListener('load', () => {
    const portfolioContainer = document.querySelector('.portfolio-container');
    if (!portfolioContainer) return;

    const iso = new Isotope(portfolioContainer, {
      itemSelector: '.portfolio-item',
      layoutMode: 'fitRows',
      filter: '.filter-app'
    });

    document.querySelectorAll('#portfolio-flters li').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#portfolio-flters li').forEach(b => b.classList.remove('filter-active'));
        this.classList.add('filter-active');
        iso.arrange({ filter: this.getAttribute('data-filter') });
      });
    });
  });

  // ===== GLightbox =====
  window.addEventListener('load', () => {
    if (typeof GLightbox !== 'undefined') {
      GLightbox({ selector: '.portfolio-lightbox' });
    }
  });

})();
