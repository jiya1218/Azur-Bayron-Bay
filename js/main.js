/**
 * AZUR BYRON BAY — MAIN INTERACTIVE SCRIPT
 * Handling luxury interactions, video players, mobile app drawer & bottom sheets
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileDrawer();
  initDirectBookingRedirects();
  initBottomSheet();
  initVideoModals();
  initFloorPlanModal();
  initHeroMedia();
  initPanoramicHero();
  initContactForms();
  initSmoothScroll();
});

/* ==========================================================================
   STICKY HEADER SCROLL DETECTION
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header || header.classList.contains('header-light-page')) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (!toggleBtn || !drawer || !overlay) return;

  function toggleDrawer(open) {
    const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    toggleBtn.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  toggleBtn.addEventListener('click', () => toggleDrawer());
  overlay.addEventListener('click', () => toggleDrawer(false));

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => toggleDrawer(false));
  });
}

/* ==========================================================================
   DIRECT ONLINE BOOKING REDIRECT
   Target: Azur Villas Byron Bay Direct Booking Engine
   ========================================================================== */
const AZUR_DIRECT_BOOKING_URL = 'https://book-directonline.com/properties/azurvillasbyronbaydirect?locale=en&referrer=canvas&items[0][adults]=2&items[0][children]=0&items[0][infants]=0&currency=AUD&checkInDate=2026-09-26&checkOutDate=2026-09-27&trackPage=yes';
window.AZUR_DIRECT_BOOKING_URL = AZUR_DIRECT_BOOKING_URL;

function getDirectBookingUrl(params = {}) {
  try {
    const url = new URL(AZUR_DIRECT_BOOKING_URL);
    if (params.checkin) url.searchParams.set('checkInDate', params.checkin);
    if (params.checkout) url.searchParams.set('checkOutDate', params.checkout);
    if (params.guests) url.searchParams.set('items[0][adults]', params.guests);
    return url.toString();
  } catch (e) {
    return AZUR_DIRECT_BOOKING_URL;
  }
}
window.getDirectBookingUrl = getDirectBookingUrl;

function openDirectBooking(params = {}) {
  const targetUrl = getDirectBookingUrl(params);
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}
window.openDirectBooking = openDirectBooking;

function initDirectBookingRedirects() {
  const directSelectors = [
    '.btn-book-top',
    '.btn-aloha-book',
    '.app-dock-book-btn',
    '.booking-bar-mobile-trigger',
    '.btn-check-rates',
    '.room-card-actions a[href*="book-directonline.com"]',
    '[data-booking-direct]'
  ].join(', ');

  const triggers = document.querySelectorAll(directSelectors);

  triggers.forEach(el => {
    el.addEventListener('click', (e) => {
      // Gather any chosen dates or guest numbers from availability bar
      const barCheckin = document.querySelector('#bar-checkin')?.value || document.querySelector('#sheet-checkin')?.value;
      const barCheckout = document.querySelector('#bar-checkout')?.value || document.querySelector('#sheet-checkout')?.value;
      const barGuests = document.querySelector('#bar-guests')?.value || document.querySelector('input[name="guests_count"]')?.value;

      const dynamicUrl = getDirectBookingUrl({
        checkin: barCheckin,
        checkout: barCheckout,
        guests: barGuests
      });

      if (el.tagName && el.tagName.toLowerCase() === 'a') {
        el.href = dynamicUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      } else {
        e.preventDefault();
        window.open(dynamicUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });
}

/* ==========================================================================
   MOBILE APP SLIDE-UP BOTTOM SHEET (BOOKING & INQUIRY)
   ========================================================================== */
function initBottomSheet() {
  const sheet = document.querySelector('.bottom-sheet-modal');
  const backdrop = document.querySelector('.bottom-sheet-backdrop');
  const closeBtns = document.querySelectorAll('.sheet-close-btn, .close-sheet-trigger');
  const openTriggers = document.querySelectorAll('.open-inquiry-modal, [data-open-sheet]');
  const handleBar = document.querySelector('.sheet-drag-handle-bar');

  if (!sheet || !backdrop) return;

  window.openBookingSheet = function(roomName = '') {
    sheet.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (roomName) {
      const roomSelect = sheet.querySelector('#sheet-room-select');
      if (roomSelect) {
        for (let i = 0; i < roomSelect.options.length; i++) {
          if (roomSelect.options[i].text.toLowerCase().includes(roomName.toLowerCase())) {
            roomSelect.selectedIndex = i;
            break;
          }
        }
      }
    }
  };

  window.closeBookingSheet = function() {
    sheet.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  openTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const room = btn.dataset.room || '';
      window.openBookingSheet(room);
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => window.closeBookingSheet());
  });

  backdrop.addEventListener('click', () => window.closeBookingSheet());

  // Swipe-down to dismiss gesture for native app feel
  if (handleBar) {
    let startY = 0;
    let currentY = 0;

    handleBar.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    handleBar.addEventListener('touchmove', (e) => {
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 0) {
        sheet.style.transform = `translateY(${diff}px)`;
      }
    }, { passive: true });

    handleBar.addEventListener('touchend', () => {
      const diff = currentY - startY;
      if (diff > 80) {
        window.closeBookingSheet();
      }
      sheet.style.transform = '';
      startY = 0;
      currentY = 0;
    });
  }
}

/* ==========================================================================
   CINEMATIC VIDEO MODAL
   ========================================================================== */
function initVideoModals() {
  const modal = document.querySelector('#video-modal');
  const player = document.querySelector('#video-modal-player');
  const triggers = document.querySelectorAll('[data-video-src]');
  const unmuteBtn = document.querySelector('#video-unmute-overlay-btn');

  if (!modal || !player) return;

  function showUnmuteButton() {
    if (unmuteBtn) unmuteBtn.style.display = 'inline-flex';
  }

  function hideUnmuteButton() {
    if (unmuteBtn) unmuteBtn.style.display = 'none';
  }

  if (unmuteBtn) {
    unmuteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      player.muted = false;
      hideUnmuteButton();
    });
  }

  function tryPlay() {
    player.muted = false;
    var playPromise = player.play();
    if (playPromise !== undefined) {
      playPromise.catch(function(err) {
        console.warn('Unmuted autoplay prevented, playing muted:', err);
        player.muted = true;
        showUnmuteButton();
        player.play().catch(function(e) {
          console.warn('Autoplay failed:', e);
        });
      });
    }
  }

  function openVideo(src) {
    if (!src) return;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    hideUnmuteButton();

    if (player.src !== src && !player.src.endsWith(encodeURI(src)) && !player.src.endsWith(src)) {
      player.src = src;
      player.load();
    }

    tryPlay();
  }

  function closeVideo() {
    modal.classList.remove('open');
    player.pause();
    player.currentTime = 0;
    hideUnmuteButton();
    document.body.style.overflow = '';
  }

  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      var btn = e.target.closest('[data-video-src]');
      var src = btn ? btn.getAttribute('data-video-src') : trigger.getAttribute('data-video-src');
      if (src) openVideo(src);
    });
  });

  modal.addEventListener('click', function(e) {
    if (e.target === modal || e.target.closest('.modal-close-btn')) {
      closeVideo();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeVideo();
    }
  });
}

/* ==========================================================================
   FLOOR PLAN LIGHTBOX
   ========================================================================== */
function initFloorPlanModal() {
  const planModal = document.querySelector('#floorplan-modal');
  const triggers = document.querySelectorAll('.open-floorplan-modal');

  if (!planModal) return;

  function openFloorPlan() {
    planModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeFloorPlan() {
    planModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openFloorPlan();
    });
  });

  planModal.addEventListener('click', (e) => {
    if (e.target === planModal || e.target.closest('.modal-close-btn')) {
      closeFloorPlan();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && planModal.classList.contains('open')) {
      closeFloorPlan();
    }
  });
}

/* ==========================================================================
   HERO MEDIA CONTROLS (Video Sound & Slider Switcher)
   ========================================================================== */
function initHeroMedia() {
  const heroVideo = document.querySelector('.hero-video');
  const heroSlider = document.querySelector('.hero-slider');
  const soundToggle = document.querySelector('#hero-sound-toggle');
  const viewToggle = document.querySelector('#hero-view-toggle');

  if (soundToggle && heroVideo) {
    soundToggle.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      const isMuted = heroVideo.muted;
      soundToggle.innerHTML = isMuted 
        ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
      soundToggle.setAttribute('title', isMuted ? 'Unmute Video' : 'Mute Video');
      showToast(isMuted ? 'Sound muted' : 'Sound enabled');
    });
  }

  // Hero Slider animation cycle
  if (heroSlider) {
    const slides = heroSlider.querySelectorAll('.slider-slide');
    if (slides.length > 1) {
      let currentIdx = 0;
      setInterval(() => {
        if (!heroSlider.classList.contains('active')) return;
        slides[currentIdx].classList.remove('current');
        currentIdx = (currentIdx + 1) % slides.length;
        slides[currentIdx].classList.add('current');
      }, 5000);
    }

    if (viewToggle) {
      viewToggle.addEventListener('click', () => {
        const isSliderActive = heroSlider.classList.contains('active');
        if (isSliderActive) {
          heroSlider.classList.remove('active');
          if (heroVideo) {
            heroVideo.style.opacity = '1';
            heroVideo.play().catch(() => {});
          }
          viewToggle.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
          viewToggle.setAttribute('title', 'Switch to Photo Slideshow');
          showToast('Switched to Property Cinematic Video');
        } else {
          heroSlider.classList.add('active');
          if (heroVideo) {
            heroVideo.style.opacity = '0';
            heroVideo.pause();
          }
          viewToggle.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
          viewToggle.setAttribute('title', 'Switch to Video Tour');
          showToast('Switched to Photo Gallery');
        }
      });
    }
  }
}

/* ==========================================================================
   ALOHA PANORAMIC HERO CAROUSEL
   ========================================================================== */
function initPanoramicHero() {
  const track = document.getElementById('panoramic-track');
  const prevBtn = document.getElementById('panoramic-prev');
  const nextBtn = document.getElementById('panoramic-next');

  if (!track) return;

  const panels = Array.from(track.querySelectorAll('.panoramic-panel'));
  if (panels.length === 0) return;

  function getCurrentIndex() {
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    panels.forEach((panel, i) => {
      const panelCenter = panel.offsetLeft + panel.offsetWidth / 2;
      const distance = Math.abs(trackCenter - panelCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    return closestIndex;
  }

  function scrollToPanel(index) {
    if (index < 0) {
      index = panels.length - 1;
    } else if (index >= panels.length) {
      index = 0;
    }
    const targetPanel = panels[index];
    if (targetPanel) {
      targetPanel.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const current = getCurrentIndex();
      scrollToPanel(current - 1);
      resetAutoTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const current = getCurrentIndex();
      scrollToPanel(current + 1);
      resetAutoTimer();
    });
  }

  let autoTimer = null;
  function startAutoTimer() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (track.matches(':hover')) return;
      const modal = document.querySelector('#video-modal');
      if (modal && modal.classList.contains('open')) return;
      const current = getCurrentIndex();
      scrollToPanel(current + 1);
    }, 5000);
  }

  function resetAutoTimer() {
    startAutoTimer();
  }

  startAutoTimer();

  track.addEventListener('mouseenter', () => {
    if (autoTimer) clearInterval(autoTimer);
  });
  track.addEventListener('mouseleave', () => {
    startAutoTimer();
  });
}

/* ==========================================================================
   CONTACT & INQUIRY FORMS
   ========================================================================== */
function initContactForms() {
  const forms = document.querySelectorAll('.inquiry-form, .contact-page-form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending Inquiry...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
        form.reset();
        if (window.closeBookingSheet) window.closeBookingSheet();
        showToast('Thank you! Your inquiry has been sent to our Azur Byron Bay concierge.');
      }, 700);
    });
  });
}

/* ==========================================================================
   TOAST NOTIFICATION HELPER
   ========================================================================== */
let toastTimeout;
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
window.showToast = showToast;

/* ==========================================================================
   SMOOTH SCROLLING FOR IN-PAGE ANCHORS
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = 80;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}
