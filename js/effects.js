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

/** Tạo sao lấp lánh cho background wall section */
function initWallStars() {
  const container = document.getElementById('wallStars');
  if (!container) return;
  const colors = [
    { c: '#ffffff', g: '5px' },
    { c: '#00d4ff', g: '8px' },
    { c: '#a855f7', g: '8px' },
    { c: '#f59e0b', g: '6px' },
    { c: '#22c55e', g: '6px' },
  ];
  for (let i = 0; i < 400; i++) {
    const star = document.createElement('span');
    star.className = 'wall-star';
    const size  = Math.random() * 3 + 1;
    const pick  = colors[Math.floor(Math.random() * colors.length)];
    star.style.setProperty('--size',  `${size}px`);
    star.style.setProperty('--dur',   `${Math.random() * 5 + 2}s`);
    star.style.setProperty('--delay', `${Math.random() * 8}s`);
    star.style.setProperty('--color', pick.c);
    star.style.setProperty('--glow',  pick.g);
    star.style.left = `${Math.random() * 100}%`;
    star.style.top  = `${Math.random() * 100}%`;
    container.appendChild(star);
  }
}

// ── Confetti Presets ──

const _confettiColors = ['#00d4ff','#a855f7','#f59e0b','#22c55e','#f43f5e','#fb923c','#fff'];
let _lastPreset = -1;

let _confettiLoopTimer = null;
let _confettiLooping = false;

/** Phóng confetti với preset random (không lặp lại liên tiếp) */
function launchConfetti(preset) {
  if (!preset) {
    let next;
    do { next = Math.floor(Math.random() * CONFETTI_PRESETS.length); } while (next === _lastPreset);
    _lastPreset = next;
    preset = CONFETTI_PRESETS[next];
  }
  const container = document.getElementById('confettiContainer');

  // Khi không loop: xóa cũ trước, dọn sau 3.5s
  // Khi loop: chỉ append thêm, không xóa (để liên tục)
  if (!_confettiLooping) {
    container.innerHTML = '';
  }

  switch (preset) {
    case 'confetti':      _launchColorConfetti(container); break;
    case 'fireworks':     _launchFireworks(container);     break;
    case 'sparkle':       _launchSparkle(container);       break;
    case 'neon-burst':    _launchNeonBurst(container);     break;
  }

  if (!_confettiLooping) {
    setTimeout(() => { container.innerHTML = ''; }, 3500);
  }
}

/**
 * Bắn confetti lặp liên tục cùng 1 preset cho đến khi user tương tác (click/scroll).
 * @param {number} intervalMs - khoảng cách giữa mỗi lần bắn (mặc định 3s)
 */
function launchConfettiLoop(intervalMs = 3000) {
  stopConfettiLoop();
  _confettiLooping = true;

  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';

  // Chọn 1 preset random, giữ nguyên suốt loop
  let chosen;
  do { chosen = Math.floor(Math.random() * CONFETTI_PRESETS.length); } while (chosen === _lastPreset);
  _lastPreset = chosen;
  const preset = CONFETTI_PRESETS[chosen];

  // Bắn lần đầu
  launchConfetti(preset);

  // Lặp liên tục cùng preset
  _confettiLoopTimer = setInterval(() => {
    // Giới hạn DOM nodes để không lag (xóa cũ nếu quá nhiều)
    while (container.children.length > 400) {
      container.removeChild(container.firstChild);
    }
    launchConfetti(preset);
  }, intervalMs);

  // Dừng khi user click hoặc scroll
  function onInteract() {
    stopConfettiLoop();
    document.removeEventListener('click', onInteract, true);
    document.removeEventListener('scroll', onInteract, true);
    document.removeEventListener('wheel', onInteract, true);
    document.removeEventListener('touchstart', onInteract, true);
  }
  // Delay 800ms để không bắt click submit vừa rồi
  setTimeout(() => {
    document.addEventListener('click', onInteract, { capture: true });
    document.addEventListener('scroll', onInteract, { capture: true });
    document.addEventListener('wheel', onInteract, { capture: true });
    document.addEventListener('touchstart', onInteract, { capture: true });
  }, 800);
}

/** Dừng confetti loop và dọn dẹp */
function stopConfettiLoop() {
  if (_confettiLoopTimer) {
    clearInterval(_confettiLoopTimer);
    _confettiLoopTimer = null;
  }
  if (_confettiLooping) {
    _confettiLooping = false;
    const container = document.getElementById('confettiContainer');
    if (container) container.innerHTML = '';
  }
}

/** Confetti: hạt màu sắc rơi xuống – phủ toàn màn hình */
function _launchColorConfetti(container) {
  for (let i = 0; i < 150; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 10 + 4;
    el.style.cssText = `
      position:fixed;
      width:${size}px;
      height:${size}px;
      background:${_confettiColors[Math.floor(Math.random()*_confettiColors.length)]};
      border-radius:${Math.random()>0.5?'50%':'2px'};
      left:${Math.random()*100}%;
      top:-20px;
      animation: confettiFall ${Math.random()*2.5+1.5}s ${Math.random()*1.5}s ease-in forwards;
      opacity: ${Math.random()*0.4+0.6};
      z-index:9998;
      pointer-events:none;
    `;
    container.appendChild(el);
  }
}

/** Fireworks: burst radial từ nhiều điểm – phủ toàn màn hình */
function _launchFireworks(container) {
  const origins = [
    [15,20],[50,15],[85,25],
    [25,50],[50,45],[75,55],
    [20,75],[50,80],[80,70],
    [40,30],[60,65]
  ];
  origins.forEach(([ox, oy]) => {
    for (let i = 0; i < 16; i++) {
      const angle = (360 / 16) * i + Math.random() * 10;
      const dist = Math.random() * 160 + 80;
      const rad = angle * Math.PI / 180;
      const dx = Math.cos(rad) * dist;
      const dy = Math.sin(rad) * dist;
      const el = document.createElement('div');
      const color = _confettiColors[Math.floor(Math.random()*_confettiColors.length)];
      const size = Math.random() * 4 + 4;
      el.style.cssText = `
        position:fixed;
        width:${size}px; height:${size}px;
        border-radius:50%;
        background:${color};
        box-shadow: 0 0 8px ${color}, 0 0 16px ${color}80;
        left:${ox}%; top:${oy}%;
        --dx:${dx}px; --dy:${dy}px;
        animation: fireworkBurst ${Math.random()*0.5+0.8}s ease-out forwards;
        z-index:9998;
        pointer-events:none;
      `;
      container.appendChild(el);
    }
  });
}

/** Sparkle: glitter gold float up – phủ toàn màn hình */
function _launchSparkle(container) {
  for (let i = 0; i < 100; i++) {
    const el = document.createElement('div');
    const dx = (Math.random()-0.5) * 300;
    const dy = (Math.random()-0.5) * 300;
    const size = Math.random()*14+6;
    const symbols = ['✦','★','✸','✺','✻','⭐','✨'];
    el.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    const colors = ['#f59e0b','#fcd34d','#fef08a','#fff','#00d4ff','#a855f7'];
    const color = colors[Math.floor(Math.random()*colors.length)];
    el.style.cssText = `
      position:fixed;
      font-size:${size}px;
      color:${color};
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      --dx:${dx}px; --dy:${dy}px;
      animation: sparkleFloat ${Math.random()*1.2+0.8}s ${Math.random()*0.8}s ease-out forwards;
      text-shadow: 0 0 10px ${color}, 0 0 20px ${color}60;
      z-index:9998;
      pointer-events:none;
    `;
    container.appendChild(el);
  }
}

/** Neon Burst: ring glow neon từ nhiều vị trí – phủ toàn màn hình */
function _launchNeonBurst(container) {
  const colors = ['#00d4ff','#a855f7','#f59e0b','#22c55e','#f43f5e','#fb923c'];
  // Nhiều vị trí nổ phủ khắp viewport
  const origins = [
    [50,50],[20,30],[80,25],[30,70],[75,75],
    [10,50],[90,50],[50,15],[50,85]
  ];
  origins.forEach(([ox, oy], oi) => {
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const el = document.createElement('div');
      const color = colors[(oi + i) % colors.length];
      const baseSize = 60 + i * 50;
      el.style.cssText = `
        position:fixed;
        left:${ox}%; top:${oy}%;
        width:${baseSize}px; height:${baseSize}px;
        border: 2px solid ${color};
        border-radius:50%;
        box-shadow: 0 0 24px ${color}, inset 0 0 24px ${color}40;
        animation: neonRing ${0.8 + i*0.3}s ${oi*0.1 + i*0.15}s ease-out forwards;
        pointer-events:none;
        z-index:9998;
      `;
      container.appendChild(el);
    }
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
