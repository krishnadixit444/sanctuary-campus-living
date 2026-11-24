/**
 * Sanctuary Living - Main Application Logic & Interactive Simulators
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Three.js Scenes
  let campusScene = null;
  let roomScene = null;
  let securityScene = null;

  if (window.Campus3D && document.getElementById('hero-campus-canvas')) {
    campusScene = new Campus3D('hero-campus-canvas');
  }

  if (window.RoomConfigurator3D && document.getElementById('room-configurator-canvas')) {
    roomScene = new RoomConfigurator3D('room-configurator-canvas');
  }

  if (window.SecurityTactical3D && document.getElementById('security-tactical-canvas')) {
    securityScene = new SecurityTactical3D('security-tactical-canvas');
  }

  // --- HERO LIGHTING TOGGLE ---
  const heroLightBtns = document.querySelectorAll('.hero-light-btn');
  heroLightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      heroLightBtns.forEach(b => b.classList.remove('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/50'));
      btn.classList.add('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/50');
      const mode = btn.dataset.mode;
      if (campusScene) campusScene.setLightingMode(mode);
    });
  });

  // --- 3D ROOM CONFIGURATOR TIER SWITCHER ---
  const tierPricing = {
    single: {
      name: 'Single Deluxe Suite',
      base: 14500,
      mess: 3200,
      utilities: 800,
      deposit: 0,
      desc: 'Private en-suite bathroom, ergonomic study station, acoustic isolation paneling, and queen bed.'
    },
    double: {
      name: 'Double Shared Studio',
      base: 9800,
      mess: 3200,
      utilities: 650,
      deposit: 0,
      desc: 'Dual twin beds with acoustic privacy divider, dual study desks, twin wardrobes, and balcony view.'
    },
    triple: {
      name: 'Triple Community Pod',
      base: 6900,
      mess: 3200,
      utilities: 500,
      deposit: 0,
      desc: 'Integrated loft & bunk pods, shared study hub, maximum spatial efficiency, covered by 15% rent support fund.'
    }
  };

  let activeTier = 'single';
  let isSupportFundApplied = false;

  const tierButtons = document.querySelectorAll('.tier-btn');
  tierButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tierButtons.forEach(b => {
        b.classList.remove('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300', 'active-tier');
        b.classList.add('border-slate-800', 'text-slate-400');
      });
      btn.classList.add('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300', 'active-tier');
      btn.classList.remove('border-slate-800', 'text-slate-400');

      activeTier = btn.dataset.tier;
      if (roomScene) roomScene.loadTierFurniture(activeTier);
      updatePricingDisplay();
    });
  });

  // Room Lighting Ambiance Buttons
  const roomLightBtns = document.querySelectorAll('.room-light-btn');
  roomLightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roomLightBtns.forEach(b => b.classList.remove('bg-cyan-500/30', 'text-cyan-300', 'border-cyan-400'));
      btn.classList.add('bg-cyan-500/30', 'text-cyan-300', 'border-cyan-400');
      const mode = btn.dataset.lighting;
      if (roomScene) roomScene.setLightingMode(mode);
    });
  });

  // Rent Support Fund Toggle
  const supportFundCheckbox = document.getElementById('support-fund-toggle');
  if (supportFundCheckbox) {
    supportFundCheckbox.addEventListener('change', (e) => {
      isSupportFundApplied = e.target.checked;
      updatePricingDisplay();
    });
  }

  function updatePricingDisplay() {
    const data = tierPricing[activeTier];
    if (!data) return;

    let baseRent = data.base;
    let discount = 0;
    if (isSupportFundApplied) {
      discount = Math.round(baseRent * 0.15); // 15% PPM Rent Support Fund
    }

    const netBase = baseRent - discount;
    const totalMonthly = netBase + data.mess + data.utilities;
    const semesterTotal = totalMonthly * 5; // 5 months per academic semester

    // Update DOM
    const nameElem = document.getElementById('tier-title');
    if (nameElem) nameElem.textContent = data.name;

    const descElem = document.getElementById('tier-description');
    if (descElem) descElem.textContent = data.desc;

    const baseElem = document.getElementById('price-base');
    if (baseElem) {
      baseElem.innerHTML = isSupportFundApplied
        ? `<span class="line-through text-slate-500 mr-2">₹${baseRent.toLocaleString()}</span> ₹${netBase.toLocaleString()}/mo`
        : `₹${baseRent.toLocaleString()}/mo`;
    }

    const messElem = document.getElementById('price-mess');
    if (messElem) messElem.textContent = `₹${data.mess.toLocaleString()}/mo`;

    const utilElem = document.getElementById('price-utilities');
    if (utilElem) utilElem.textContent = `₹${data.utilities.toLocaleString()}/mo`;

    const totalMonthlyElem = document.getElementById('price-total-monthly');
    if (totalMonthlyElem) totalMonthlyElem.textContent = `₹${totalMonthly.toLocaleString()}/mo`;

    const totalSemesterElem = document.getElementById('price-total-semester');
    if (totalSemesterElem) totalSemesterElem.textContent = `₹${semesterTotal.toLocaleString()}`;

    const discountBadge = document.getElementById('support-fund-badge');
    if (discountBadge) {
      if (isSupportFundApplied) {
        discountBadge.classList.remove('hidden');
        discountBadge.textContent = `-₹${discount.toLocaleString()} (15% PPM Subsidy)`;
      } else {
        discountBadge.classList.add('hidden');
      }
    }
  }

  // --- PILLAR 1: HYGIENE QR SCANNER & 48H SLA SIMULATOR ---
  const scanQrBtn = document.getElementById('btn-scan-qr');
  const qrModal = document.getElementById('qr-modal');
  const closeQrModal = document.getElementById('close-qr-modal');

  if (scanQrBtn && qrModal) {
    scanQrBtn.addEventListener('click', () => {
      qrModal.classList.remove('hidden');
    });
  }

  if (closeQrModal && qrModal) {
    closeQrModal.addEventListener('click', () => {
      qrModal.classList.add('hidden');
    });
  }

  // SLA Maintenance Ticket Logger
  const ticketForm = document.getElementById('maintenance-ticket-form');
  const ticketFeed = document.getElementById('ticket-feed');

  if (ticketForm && ticketFeed) {
    ticketForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const issueType = document.getElementById('ticket-category').value;
      const roomNum = document.getElementById('ticket-room').value || 'A-304';
      const desc = document.getElementById('ticket-desc').value || 'Immediate attention required';

      const ticketCard = document.createElement('div');
      ticketCard.className = 'glass-panel p-4 rounded-xl border border-cyan-500/30 animate-pulse-once';
      ticketCard.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="sla-pill sla-pill-amber">ACTIVE SLA: 48h 00m</span>
            <span class="text-xs text-slate-400">Room ${roomNum}</span>
          </div>
          <span class="text-xs font-mono text-cyan-400">#TK-${Math.floor(1000 + Math.random() * 9000)}</span>
        </div>
        <h5 class="text-white text-sm font-semibold">${issueType}</h5>
        <p class="text-xs text-slate-300 mt-1">${desc}</p>
        <div class="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <span class="text-slate-400">Assigned: On-site Facilities Team</span>
          <span class="text-emerald-400 font-semibold flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> In Progress
          </span>
        </div>
      `;

      ticketFeed.prepend(ticketCard);
      ticketForm.reset();
      showToast('Ticket logged successfully! 48-Hour SLA countdown initiated.');
    });
  }

  // --- PILLAR 3: SOS EMERGENCY SIMULATOR ---
  const triggerSosBtn = document.getElementById('btn-trigger-sos');
  const sosStatusBanner = document.getElementById('sos-status-banner');
  const sosCountdown = document.getElementById('sos-countdown');
  let sosTimer = null;

  if (triggerSosBtn) {
    triggerSosBtn.addEventListener('click', () => {
      if (securityScene) {
        securityScene.triggerSOSSimulation();
      }

      if (sosStatusBanner) {
        sosStatusBanner.classList.remove('hidden');
      }

      let secondsLeft = 600; // 10 minutes guarantee (600s)
      if (sosCountdown) {
        if (sosTimer) clearInterval(sosTimer);
        sosTimer = setInterval(() => {
          secondsLeft--;
          const mins = Math.floor(secondsLeft / 60);
          const secs = secondsLeft % 60;
          sosCountdown.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          if (secondsLeft <= 0) {
            clearInterval(sosTimer);
            sosCountdown.textContent = '00:00 - Response Team On Scene';
          }
        }, 1000);
      }

      showToast('EMERGENCY SOS ALERT BROADCAST: Response Team Dispatched. Guaranteed arrival < 10 mins.');
    });
  }

  // --- PILLAR 4: DAILY MEAL REBATE CALCULATOR ---
  const rebateDaysInput = document.getElementById('rebate-days');
  const rebateResultElem = document.getElementById('rebate-result');
  const dailyMessRate = 120; // Daily allocated mess rate (INR)

  function calculateRebate() {
    if (!rebateDaysInput || !rebateResultElem) return;
    const days = Math.max(0, Math.min(30, parseInt(rebateDaysInput.value) || 0));
    const totalRefund = days * dailyMessRate;
    rebateResultElem.innerHTML = `
      <div class="text-2xl font-bold text-emerald-400">₹${totalRefund.toLocaleString()}</div>
      <div class="text-xs text-slate-400 mt-1">Automatic credit to student digital wallet at month end (${days} days @ ₹120/day)</div>
    `;
  }

  if (rebateDaysInput) {
    rebateDaysInput.addEventListener('input', calculateRebate);
    calculateRebate();
  }

  // --- PPM ROADMAP TABS ---
  const phaseTabs = document.querySelectorAll('.phase-tab');
  const phaseContents = document.querySelectorAll('.phase-content');

  phaseTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      phaseTabs.forEach(t => {
        t.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-400');
        t.classList.add('border-slate-800', 'text-slate-400');
      });
      tab.classList.add('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-400');
      tab.classList.remove('border-slate-800', 'text-slate-400');

      const target = tab.dataset.phase;
      phaseContents.forEach(content => {
        if (content.id === `content-${target}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });

  // --- PILOT BOOKING APPLICATION FORM ---
  const bookingForm = document.getElementById('pilot-booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const applicantName = document.getElementById('book-name').value;
      const applicantRole = document.getElementById('book-role').value;
      const applicantTier = document.getElementById('book-tier').value;

      showToast(`Application Received! Priority intake ID #SANCTUARY-${Math.floor(10000 + Math.random() * 90000)} generated for ${applicantName}.`);
      bookingForm.reset();
    });
  }

  // --- TOAST NOTIFICATION UTILITY ---
  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-slate-900/95 border border-cyan-400 text-white text-sm shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-12 opacity-0 flex items-center gap-3';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
      <span>${message}</span>
    `;

    toast.classList.remove('translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-12', 'opacity-0');
    }, 4500);
  }

  // Initial pricing calculation
  updatePricingDisplay();
});
