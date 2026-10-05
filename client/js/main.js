/* ============================================================
   NP Construction — main.js
   Handles: navbar, counter animation, scroll animations,
            back-to-top, hamburger menu
============================================================ */

// ─── Navbar: Sticky on scroll ────────────────────────────────
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
  // Trigger once on load
  header.classList.toggle('scrolled', window.scrollY > 50);
}

// ─── Hamburger Menu ──────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navCta    = document.getElementById('navCta');

if (hamburger && navLinks) {
  const toggleMenu = () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    if (navCta) navCta.classList.toggle('open');
  };

  hamburger.addEventListener('click', toggleMenu);
  hamburger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
  });

  // Close on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      if (navCta) navCta.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      if (navCta) navCta.classList.remove('open');
    }
  });
}

// ─── Counter Animation ───────────────────────────────────────
const animateCounter = (el, target, duration = 1800) => {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current.toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
};

// Observe stat numbers and trigger when visible
const statNumbers = document.querySelectorAll('.stat-number[data-target]');
if (statNumbers.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));
}

// ─── Scroll Animations ───────────────────────────────────────
const animatedEls = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
if (animatedEls.length) {
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Staggered delay for grid children
        const delay = entry.target.closest('.services-grid, .why-grid, .team-grid, .testimonials-grid, .projects-grid')
          ? (Array.from(entry.target.parentElement.children).indexOf(entry.target)) * 80
          : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animatedEls.forEach(el => scrollObserver.observe(el));
}

// ─── Back to Top ─────────────────────────────────────────────
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── Active Nav Link (on same-page hash or current page) ─────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) link.classList.add('active');
});
