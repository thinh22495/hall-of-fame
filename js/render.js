/* ── Render: HOF Card, Wall, Modal, Skeleton ── */

// ── Helpers ──

/** Lấy initials từ tên (tối đa 2 chữ) */
function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');
}

/** Tính số năm cống hiến từ năm gia nhập */
function calcYears(joinYear) {
  return new Date().getFullYear() - parseInt(joinYear, 10);
}

/** Set CSS custom properties màu card */
function applyCardColor(el, color) {
  el.style.setProperty('--card-color', color);
  el.style.setProperty('--card-color-rgb', HEX_RGB_MAP[color] || '0,212,255');
}

/** Format ngày giờ */
function fmtDate(isoString) {
  try {
    return new Date(isoString).toLocaleString('vi-VN', {
      day:'2-digit', month:'2-digit', year:'numeric',
      hour:'2-digit', minute:'2-digit'
    });
  } catch { return ''; }
}

// ── Hall of Fame Card ──

/**
 * Render và hiển thị Hall of Fame card sau submit.
 * @param {Object} entry
 */
function renderHallOfFameCard(entry) {
  const group = entry.role_group || ROLE_GROUP_MAP[entry.role] || 'tech';
  const color = entry.avatar_color || GROUP_COLOR[group];
  const years = calcYears(entry.year);
  const initials = getInitials(entry.name);
  const badgeText = t('card.badge');

  const card = document.getElementById('hof-card');
  applyCardColor(card, color);

  card.innerHTML = `
    <div class="hof-badge">${badgeText}</div>
    <div class="hof-identity">
      <div class="hof-avatar">${initials}</div>
      <div class="hof-name-group">
        <div class="hof-name">${escHtml(entry.name)}</div>
        <div class="hof-meta">
          <span class="hof-role-badge">${escHtml(entry.role)}</span>
          <span class="hof-sep">·</span>
          <span>${t('card.joinedLabel')} ${entry.year}</span>
          <span class="hof-sep">·</span>
          <span>${years} ${t('card.yearsLabel')}</span>
        </div>
      </div>
    </div>
    <div class="hof-milestone">
      <span class="hof-quote-icon">"</span>
      <div class="hof-milestone-text">${escHtml(entry.milestone)}</div>
    </div>
    ${entry.thank_you ? `<div class="hof-thankyou">${escHtml(entry.thank_you)}</div>` : ''}
    <div class="hof-footer">
      <div class="hof-footer-main">${t('card.footer')}</div>
      <div class="hof-timestamp">${fmtDate(entry.created_at)}</div>
    </div>
  `;

  // Hiển thị section
  const section = document.getElementById('hof-section');
  section.hidden = false;
  section.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Lưu entry hiện tại cho các nút action
  section.dataset.entryId = entry.id;

  // Phóng confetti
  setTimeout(() => launchConfetti(), 300);
}

// ── Thank You Wall ──

/** State wall */
let _wallEntries    = [];
let _wallTotal      = 0;
let _wallPage       = 0;
let _wallFilters    = { group: 'all', sort: 'newest', search: '' };
let _wallLoading    = false;
let _wallObserver   = null;

/**
 * Render skeleton cards trong khi load.
 * @param {number} n
 */
function renderSkeletons(n = 6) {
  const grid = document.getElementById('wallGrid');
  grid.innerHTML = Array(n).fill(0).map(() => `
    <div class="skeleton">
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text">
          <div class="skeleton-line" style="width:70%"></div>
          <div class="skeleton-line" style="width:45%;margin-top:6px"></div>
        </div>
      </div>
      <div class="skeleton-line" style="width:100%"></div>
      <div class="skeleton-line" style="width:85%"></div>
      <div class="skeleton-line" style="width:60%;margin-top:4px"></div>
    </div>
  `).join('');
}

/**
 * Tải và render toàn bộ wall (reset state).
 */
async function loadWall() {
  if (_wallLoading) return;
  _wallLoading = true;
  _wallPage = 0;
  _wallEntries = [];

  renderSkeletons(6);
  document.getElementById('wallEmpty').hidden = true;

  try {
    const { entries, total } = await loadEntries({ ..._wallFilters, page: 0 });
    _wallEntries = entries;
    _wallTotal   = total;
    renderThankYouWall(_wallEntries, _wallTotal);
    updateWallCount(_wallEntries.length, _wallTotal);
    initInfiniteScroll();
  } catch (err) {
    console.error('[wall] loadWall error:', err);
    document.getElementById('wallGrid').innerHTML = '';
  } finally {
    _wallLoading = false;
  }
}

/**
 * Render danh sách mini-card vào wall grid.
 */
function renderThankYouWall(entries, total) {
  const grid  = document.getElementById('wallGrid');
  const empty = document.getElementById('wallEmpty');

  grid.innerHTML = '';

  if (!entries.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  entries.forEach(entry => {
    grid.appendChild(buildMiniCard(entry));
  });
  updateWallCount(entries.length, total);
}

/**
 * Tạo DOM element mini-card.
 */
function buildMiniCard(entry) {
  const group    = entry.role_group || ROLE_GROUP_MAP[entry.role] || 'tech';
  const color    = entry.avatar_color || GROUP_COLOR[group];
  const initials = getInitials(entry.name);
  const years    = calcYears(entry.year);
  const isMine   = isMyEntry(entry.id);

  const card = document.createElement('div');
  card.className = 'mini-card fade-in-up';
  card.dataset.id = entry.id;
  applyCardColor(card, color);

  card.innerHTML = `
    <div class="mc-header">
      <div class="mc-avatar">${initials}</div>
      <div class="mc-identity">
        <div class="mc-name">${escHtml(entry.name)}</div>
        <div class="mc-role-badge">${escHtml(entry.role)}</div>
        <span class="mc-year">${t('wall.yearFrom')} ${entry.year} · ${years} ${t('wall.yearServed')}</span>
      </div>
    </div>
    <button class="mc-menu-btn" aria-label="Menu" data-id="${entry.id}">···</button>
    <div class="mc-menu" id="menu-${entry.id}">
      <button class="mc-menu-item" data-action="view" data-id="${entry.id}">${t('wall.menuView')}</button>
      ${isMine ? `
        <button class="mc-menu-item" data-action="edit" data-id="${entry.id}">${t('wall.menuEdit')}</button>
        <button class="mc-menu-item danger" data-action="delete" data-id="${entry.id}">${t('wall.menuDelete')}</button>
      ` : ''}
    </div>
    <div class="mc-divider"></div>
    ${entry.thank_you
      ? `<div class="mc-thankyou">${escHtml(entry.thank_you)}</div>
         <div class="mc-milestone-small">✦ ${escHtml(entry.milestone)}</div>`
      : `<div class="mc-milestone">${escHtml(entry.milestone)}</div>`
    }
  `;

  // Click card body → open modal (không click menu)
  card.addEventListener('click', (e) => {
    if (e.target.closest('.mc-menu-btn') || e.target.closest('.mc-menu')) return;
    openModal(entry);
  });

  return card;
}

/**
 * Prepend card mới lên đầu wall (sau khi submit).
 */
function appendCardToWall(entry) {
  const grid  = document.getElementById('wallGrid');
  const empty = document.getElementById('wallEmpty');
  empty.hidden = true;

  const card = buildMiniCard(entry);
  card.classList.add('new-card');
  grid.prepend(card);

  _wallEntries.unshift(entry);
  _wallTotal++;
  updateWallCount(_wallEntries.length, _wallTotal);
}

/**
 * Scroll tới và highlight card trong wall.
 */
function highlightCard(id) {
  const card = document.querySelector(`.mini-card[data-id="${id}"]`);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.add('new-card');
  setTimeout(() => card.classList.remove('new-card'), 2500);
}

/**
 * Cập nhật counter "Hiển thị X / Y dấu ấn"
 */
function updateWallCount(shown, total) {
  const el = document.getElementById('wallCount');
  if (!el) return;
  el.textContent = `${t('wall.countLabel')} ${shown} ${t('wall.countOf')} ${total} ${t('wall.countSuffix')}`;
}

// ── Infinite Scroll ──

function initInfiniteScroll() {
  if (_wallObserver) _wallObserver.disconnect();
  const sentinel = document.getElementById('wallSentinel');
  _wallObserver = new IntersectionObserver(async (entries) => {
    if (!entries[0].isIntersecting) return;
    if (_wallLoading) return;
    if (_wallEntries.length >= _wallTotal) return;

    _wallPage++;
    _wallLoading = true;
    try {
      const { entries: more } = await loadEntries({ ..._wallFilters, page: _wallPage });
      const grid = document.getElementById('wallGrid');
      more.forEach(entry => {
        _wallEntries.push(entry);
        grid.appendChild(buildMiniCard(entry));
      });
      updateWallCount(_wallEntries.length, _wallTotal);
    } finally {
      _wallLoading = false;
    }
  }, { threshold: 0.1 });
  _wallObserver.observe(sentinel);
}

// ── Filter wall ──

function setWallFilter(filters) {
  _wallFilters = { ..._wallFilters, ...filters };
  loadWall();
}

// ── Modal ──

let _focusableBefore = null;

/**
 * Mở modal xem đầy đủ entry.
 */
function openModal(entry) {
  const modal   = document.getElementById('modal');
  const content = document.getElementById('modalContent');

  const group    = entry.role_group || ROLE_GROUP_MAP[entry.role] || 'tech';
  const color    = entry.avatar_color || GROUP_COLOR[group];
  const initials = getInitials(entry.name);
  const years    = calcYears(entry.year);
  const isMine   = isMyEntry(entry.id);

  content.innerHTML = `
    <button class="modal-close" id="modalClose" aria-label="Đóng">✕</button>
    <div style="--card-color:${color};--card-color-rgb:${HEX_RGB_MAP[color]||'0,212,255'}">
      <div class="hof-identity" style="margin-bottom:20px">
        <div class="hof-avatar" style="background:${color};box-shadow:0 0 16px ${color}">${initials}</div>
        <div class="hof-name-group">
          <div class="hof-name">${escHtml(entry.name)}</div>
          <div class="hof-meta">
            <span class="hof-role-badge" style="background:rgba(var(--card-color-rgb),0.15);color:${color};border-color:rgba(var(--card-color-rgb),0.35)">${escHtml(entry.role)}</span>
            <span class="hof-sep">·</span>
            <span>${t('card.joinedLabel')} ${entry.year}</span>
            <span class="hof-sep">·</span>
            <span>${years} ${t('card.yearsLabel')}</span>
          </div>
        </div>
      </div>
      <div class="hof-milestone" style="border-left-color:${color};margin-bottom:16px">
        <span class="hof-quote-icon">"</span>
        <div class="hof-milestone-text">${escHtml(entry.milestone)}</div>
      </div>
      ${entry.thank_you ? `<div class="hof-thankyou">${escHtml(entry.thank_you)}</div>` : ''}
      <div class="hof-footer" style="margin-top:16px">
        <div class="hof-footer-main">${t('card.footer')}</div>
        <div class="hof-timestamp">${fmtDate(entry.created_at)}</div>
      </div>
      ${isMine ? `
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
          <button class="btn-action" data-action="edit-modal" data-id="${entry.id}" style="font-size:.82rem">✏️ ${t('card.edit')}</button>
          <button class="btn-action danger" data-action="delete-modal" data-id="${entry.id}" style="font-size:.82rem;color:var(--color-error)">🗑️ ${t('wall.menuDelete')}</button>
        </div>
      ` : ''}
    </div>
  `;

  _focusableBefore = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  // Focus đóng modal
  document.getElementById('modalClose').focus();
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.hidden = true;
  document.body.style.overflow = '';
  _focusableBefore?.focus();
}

// ── Escape HTML (bảo vệ XSS) ──
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#x27;');
}
