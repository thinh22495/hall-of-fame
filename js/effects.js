/* ── Effects: Particles, Confetti, CountUp, Toast ── */

// ── Star Particles ──

/** Tạo 50 ngôi sao CSS trong hero background */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 60;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    const size = Math.random() * 2.5 + 1;
    star.style.setProperty('--size', `${size}px`);
    star.style.setProperty('--dur', `${Math.random() * 4 + 2}s`);
    star.style.setProperty('--delay', `${Math.random() * 5}s`);
    star.style.left = `${Math.random() * 100}%`;
    star.style.top  = `${Math.random() * 100}%`;
    container.appendChild(star);
  }
}

// ── Confetti Presets ──

const _confettiColors = ['#00d4ff','#a855f7','#f59e0b','#22c55e','#f43f5e','#fb923c','#fff'];
let _lastPreset = -1;

/** Phóng confetti với preset random (không lặp lại liên tiếp) */
function launchConfetti(preset) {
  if (!preset) {
    let next;
    do { next = Math.floor(Math.random() * CONFETTI_PRESETS.length); } while (next === _lastPreset);
    _lastPreset = next;
    preset = CONFETTI_PRESETS[next];
  }
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';

  switch (preset) {
    case 'confetti':      _launchColorConfetti(container); break;
    case 'fireworks':     _launchFireworks(container);     break;
    case 'sparkle':       _launchSparkle(container);       break;
    case 'falling-stars': _launchFallingStars(container);  break;
    case 'neon-burst':    _launchNeonBurst(container);     break;
  }

  // Dọn dẹp sau 3.5s
  setTimeout(() => { container.innerHTML = ''; }, 3500);
}

/** Confetti: hạt màu sắc rơi xuống */
function _launchColorConfetti(container) {
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:absolute;
      width:${Math.random()*8+4}px;
      height:${Math.random()*8+4}px;
      background:${_confettiColors[Math.floor(Math.random()*_confettiColors.length)]};
      border-radius:${Math.random()>0.5?'50%':'2px'};
      left:${Math.random()*100}%;
      top:-20px;
      animation: confettiFall ${Math.random()*2+1.5}s ${Math.random()*1}s ease-in forwards;
      opacity: 0.9;
    `;
    container.appendChild(el);
  }
}

/** Fireworks: burst radial từ nhiều điểm */
function _launchFireworks(container) {
  const origins = [[30,40],[70,35],[50,55],[20,60],[80,45]];
  origins.forEach(([ox, oy]) => {
    for (let i = 0; i < 12; i++) {
      const angle = (360 / 12) * i;
      const dist = Math.random() * 120 + 60;
      const rad = angle * Math.PI / 180;
      const dx = Math.cos(rad) * dist;
      const dy = Math.sin(rad) * dist;
      const el = document.createElement('div');
      const color = _confettiColors[Math.floor(Math.random()*_confettiColors.length)];
      el.style.cssText = `
        position:absolute;
        width:6px; height:6px;
        border-radius:50%;
        background:${color};
        box-shadow: 0 0 6px ${color};
        left:${ox}%; top:${oy}%;
        --dx:${dx}px; --dy:${dy}px;
        animation: fireworkBurst ${Math.random()*0.4+0.8}s ease-out forwards;
      `;
      container.appendChild(el);
    }
  });
}

/** Sparkle: glitter gold float up */
function _launchSparkle(container) {
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    const dx = (Math.random()-0.5) * 200;
    const dy = (Math.random()-0.5) * 200;
    const size = Math.random()*10+4;
    el.textContent = ['✦','★','✸','✺','✻'][Math.floor(Math.random()*5)];
    el.style.cssText = `
      position:absolute;
      font-size:${size}px;
      color:${['#f59e0b','#fcd34d','#fef08a','#fff'][Math.floor(Math.random()*4)]};
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      --dx:${dx}px; --dy:${dy}px;
      animation: sparkleFloat ${Math.random()*1+0.8}s ${Math.random()*0.5}s ease-out forwards;
      text-shadow: 0 0 8px #f59e0b;
    `;
    container.appendChild(el);
  }
}

/** Falling Stars: sao băng chéo */
function _launchFallingStars(container) {
  for (let i = 0; i < 15; i++) {
    const el = document.createElement('div');
    const dx = Math.random()*300+100;
    const dy = Math.random()*200+100;
    el.style.cssText = `
      position:absolute;
      width:${Math.random()*60+30}px;
      height:2px;
      background:linear-gradient(90deg,transparent,#fff,var(--color-cyan,#00d4ff));
      border-radius:2px;
      left:${Math.random()*80}%;
      top:${Math.random()*70}%;
      --dx:${dx}px; --dy:${dy}px;
      animation: fallingStarSlide ${Math.random()*0.6+0.6}s ${Math.random()*0.8}s ease-in-out forwards;
    `;
    container.appendChild(el);
  }
}

/** Neon Burst: ring glow neon từ center HOF card */
function _launchNeonBurst(container) {
  const colors = ['#00d4ff','#a855f7','#f59e0b'];
  colors.forEach((color, i) => {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;
      left:50%; top:50%;
      width:${80 + i*60}px; height:${80 + i*60}px;
      border: 2px solid ${color};
      border-radius:50%;
      box-shadow: 0 0 20px ${color}, inset 0 0 20px ${color}40;
      animation: neonRing ${0.8 + i*0.3}s ${i*0.15}s ease-out forwards;
      pointer-events:none;
    `;
    container.appendChild(el);
  });
}

// ── Count Up ──

/**
 * Animate count-up cho một element.
 * @param {HTMLElement} el - element chứa số
 * @param {number} target - giá trị đích
 * @param {number} duration - ms
 * @param {string} suffix - hậu tố (+, ...)
 */
function initCountUp(el, target, duration = 1800, suffix = '') {
  if (!el || target <= 0) return;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const value = Math.round(eased * target);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/** Khởi tạo count-up cho tất cả stat-num khi vào viewport */
function initAllCountUps() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      if (!isNaN(target) && target > 0) initCountUp(el, target, 1800, suffix);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-target]').forEach(el => observer.observe(el));
}

// ── Toast ──

/**
 * Hiển thị toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ── Countdown ──

/** Cập nhật đồng hồ đếm ngược tới ngày kỷ niệm */
function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;

  function update() {
    const now  = new Date();
    const diff = ANNIVERSARY_DATE - now;

    if (diff <= 0) {
      el.innerHTML = `<div class="countdown-done">${t('hero.countdownDone')}</div>`;
      return;
    }

    const days  = Math.floor(diff / 864e5);
    const hours = Math.floor((diff % 864e5) / 36e5);
    const mins  = Math.floor((diff % 36e5) / 6e4);
    const secs  = Math.floor((diff % 6e4) / 1e3);

    el.innerHTML = `
      <div class="countdown-item"><span class="countdown-val">${String(days).padStart(2,'0')}</span><span class="countdown-lbl">${t('hero.countdownDays')}</span></div>
      <div class="countdown-item"><span class="countdown-val">${String(hours).padStart(2,'0')}</span><span class="countdown-lbl">${t('hero.countdownHours')}</span></div>
      <div class="countdown-item"><span class="countdown-val">${String(mins).padStart(2,'0')}</span><span class="countdown-lbl">${t('hero.countdownMins')}</span></div>
      <div class="countdown-item"><span class="countdown-val">${String(secs).padStart(2,'0')}</span><span class="countdown-lbl">${t('hero.countdownSecs')}</span></div>
    `;
  }

  update();
  setInterval(update, 1000);
}
