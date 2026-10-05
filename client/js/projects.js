/* ============================================================
   NP Construction — projects.js
   Handles: portfolio filter, lightbox
============================================================ */

// ─── Filter ───────────────────────────────────────────────────
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    projectCards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        card.classList.remove('hidden');
        // Re-trigger animation
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = '';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// Footer filter links
document.querySelectorAll('[data-filter-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const filter = link.getAttribute('data-filter-link');
    const btn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    if (btn) {
      btn.click();
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});

// ─── Lightbox ─────────────────────────────────────────────────
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose  = document.getElementById('lightboxClose');

const openLightbox = (imgSrc, name, location) => {
  lightboxImg.src = imgSrc;
  lightboxImg.alt = name;
  lightboxCaption.textContent = `${name} — ${location}`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
};

const closeLightbox = () => {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
};

// Open on project card click
projectCards.forEach(card => {
  card.addEventListener('click', () => {
    const imgSrc   = card.getAttribute('data-img');
    const name     = card.getAttribute('data-name');
    const location = card.getAttribute('data-location');
    // Use the actual rendered image src if available (handles onerror fallback)
    const img = card.querySelector('.project-img');
    openLightbox(img ? img.src : imgSrc, name, location);
  });
  // Keyboard accessibility
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View ${card.getAttribute('data-name')}`);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
  });
});

// Close on button
lightboxClose?.addEventListener('click', closeLightbox);

// Close on backdrop click
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox?.classList.contains('open')) closeLightbox();
});
