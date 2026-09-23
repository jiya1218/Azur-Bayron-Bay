/**
 * AZUR BYRON BAY — BOOKING & INQUIRY ENGINE
 * Dynamic date selection, guest counters, room types, stay calculation
 */

document.addEventListener('DOMContentLoaded', () => {
  initBookingDates();
  initGuestSteppers();
  initRoomCalculators();
});

// Rates guide (AUD per night approx)
const RATES = {
  'beach-house': { name: '4BR Beach House + The Pass', price: 1250, minNights: 2, maxGuests: 10 },
  'meraki-condo': { name: '3BR Meraki Condo', price: 850, minNights: 2, maxGuests: 7 },
  'poolside-suite': { name: '1BR Poolside Suite (Sea Breeze / Tallows / The Wreck / Wategos)', price: 340, minNights: 1, maxGuests: 2 },
  'entire-estate': { name: 'Entire Azur Estate (Up to 22 Guests)', price: 2900, minNights: 3, maxGuests: 22 }
};

/* ==========================================================================
   INITIALIZE DATES (Defaults: tomorrow to +3 days)
   ========================================================================== */
function initBookingDates() {
  const checkinInputs = document.querySelectorAll('input[name="checkin"], #sheet-checkin');
  const checkoutInputs = document.querySelectorAll('input[name="checkout"], #sheet-checkout');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const defaultOut = new Date(today);
  defaultOut.setDate(defaultOut.getDate() + 4);

  const formatDate = (d) => d.toISOString().split('T')[0];

  checkinInputs.forEach(input => {
    input.min = formatDate(tomorrow);
    if (!input.value) input.value = formatDate(tomorrow);
  });

  checkoutInputs.forEach(input => {
    input.min = formatDate(tomorrow);
    if (!input.value) input.value = formatDate(defaultOut);
  });

  // Sync checkin and checkout changes
  checkinInputs.forEach(input => {
    input.addEventListener('change', () => {
      const inDate = new Date(input.value);
      const minOut = new Date(inDate);
      minOut.setDate(minOut.getDate() + 1);

      checkoutInputs.forEach(outInput => {
        outInput.min = formatDate(minOut);
        if (new Date(outInput.value) <= inDate) {
          outInput.value = formatDate(minOut);
        }
      });
      updateStaySummaries();
    });
  });

  checkoutInputs.forEach(input => {
    input.addEventListener('change', updateStaySummaries);
  });
}

/* ==========================================================================
   GUEST STEPPERS (+ / - buttons)
   ========================================================================== */
function initGuestSteppers() {
  const stepperWraps = document.querySelectorAll('.guest-stepper-wrap');

  stepperWraps.forEach(wrap => {
    const decBtn = wrap.querySelector('.stepper-dec');
    const incBtn = wrap.querySelector('.stepper-inc');
    const valSpan = wrap.querySelector('.stepper-value');
    const hiddenInput = wrap.querySelector('input[type="hidden"]');
    const min = parseInt(wrap.dataset.min || 1, 10);
    const max = parseInt(wrap.dataset.max || 22, 10);

    let currentVal = parseInt(valSpan ? valSpan.innerText : 1, 10);

    function updateVal(newVal) {
      currentVal = Math.max(min, Math.min(max, newVal));
      if (valSpan) valSpan.innerText = currentVal;
      if (hiddenInput) hiddenInput.value = currentVal;
      updateStaySummaries();
    }

    if (decBtn) {
      decBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateVal(currentVal - 1);
      });
    }

    if (incBtn) {
      incBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateVal(currentVal + 1);
      });
    }
  });
}

/* ==========================================================================
   STAY SUMMARY & REAL-TIME ESTIMATE
   ========================================================================== */
function initRoomCalculators() {
  const roomSelects = document.querySelectorAll('#sheet-room-select, select[name="room_type"]');
  roomSelects.forEach(select => {
    select.addEventListener('change', updateStaySummaries);
  });
  updateStaySummaries();
}

function updateStaySummaries() {
  const checkinInput = document.querySelector('#sheet-checkin') || document.querySelector('input[name="checkin"]');
  const checkoutInput = document.querySelector('#sheet-checkout') || document.querySelector('input[name="checkout"]');
  const roomSelect = document.querySelector('#sheet-room-select') || document.querySelector('select[name="room_type"]');
  const summaryBox = document.querySelector('.sheet-summary-box');

  if (!checkinInput || !checkoutInput || !roomSelect || !summaryBox) return;

  const inDate = new Date(checkinInput.value);
  const outDate = new Date(checkoutInput.value);
  const diffTime = Math.abs(outDate - inDate);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const selectedKey = roomSelect.value;
  const rateInfo = RATES[selectedKey] || RATES['beach-house'];

  const estTotal = nights * rateInfo.price;

  const nightsEl = summaryBox.querySelector('.sum-nights');
  const rateEl = summaryBox.querySelector('.sum-rate');
  const totalEl = summaryBox.querySelector('.sum-total');

  if (nightsEl) nightsEl.innerText = `${nights} Night${nights > 1 ? 's' : ''}`;
  if (rateEl) rateEl.innerText = `$${rateInfo.price.toLocaleString()} AUD / night`;
  if (totalEl) totalEl.innerText = `$${estTotal.toLocaleString()} AUD (Estimated)`;
}
