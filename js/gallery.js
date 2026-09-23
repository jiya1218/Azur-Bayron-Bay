/**
 * AZUR BYRON BAY — GALLERY & LIGHTBOX ENGINE
 * Category filtering, responsive masonry/grid, touch-swipe lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFilter();
  initGalleryLightbox();
});

function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        const category = item.dataset.category || '';
        if (filter === 'all' || category.includes(filter)) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

function initGalleryLightbox() {
  const lightbox = document.querySelector('#gallery-lightbox');
  const imgEl = document.querySelector('#lightbox-img');
  const titleEl = document.querySelector('#lightbox-title');
  const countEl = document.querySelector('#lightbox-count');
  const prevBtn = document.querySelector('#lightbox-prev');
  const nextBtn = document.querySelector('#lightbox-next');
  const closeBtn = document.querySelector('#lightbox-close');

  const items = Array.from(document.querySelectorAll('.gallery-item-trigger'));
  if (!lightbox || !items.length) return;

  let currentIndex = 0;

  function showImage(index) {
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    currentIndex = index;

    const item = items[currentIndex];
    const src = item.getAttribute('data-full-src') || item.querySelector('img').src;
    const title = item.getAttribute('data-title') || '';

    imgEl.style.opacity = '0';
    setTimeout(() => {
      imgEl.src = src;
      imgEl.onload = () => {
        imgEl.style.opacity = '1';
      };
      if (titleEl) titleEl.innerText = title;
      if (countEl) countEl.innerText = `${currentIndex + 1} / ${items.length}`;
    }, 150);
  }

  function openLightbox(index) {
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    showImage(index);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach((item, idx) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  // Mobile Touch Swipe Navigation
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (diff > 50) {
      showImage(currentIndex - 1); // Swipe Right -> Prev
    } else if (diff < -50) {
      showImage(currentIndex + 1); // Swipe Left -> Next
    }
  }, { passive: true });
}
