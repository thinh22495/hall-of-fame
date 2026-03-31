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

/** Số hex cell mỗi row theo viewport */
function getHexPerRow() {
  if (window.innerWidth <= 560) return 2;
  if (window.innerWidth <= 900) return 3;
  return 4;
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
    <div class="hof-card-inner">
      <div class="hof-accent-strip">
        <span class="hof-accent-num">10</span>
        <span class="hof-accent-label">YEARS</span>
      </div>
      <div class="hof-content">
        <div class="hof-topbar">
          <span class="hof-logo">VHEC</span>
          <span class="hof-badge">${badgeText}</span>
        </div>
        <div class="hof-separator"></div>
        <div class="hof-center">
          <div class="hof-avatar">${initials}</div>
          <div class="hof-name">${escHtml(entry.name)}</div>
          <span class="hof-role-badge">${escHtml(entry.role)}</span>
          <div class="hof-meta">
            <span>${t('card.joinedLabel')} ${entry.year}</span>
            <span class="hof-sep">·</span>
            <span>${years} ${t('card.yearsLabel')}</span>
          </div>
        </div>
        <div class="hof-milestone">
          <span class="hof-milestone-label">D\u1EA4U \u1EA4N C\u00C1 NH\u00C2N</span>
          <span class="hof-quote-icon">\u201C</span>
          <div class="hof-milestone-text">${escHtml(entry.milestone)}</div>
        </div>
        ${entry.thank_you ? `<div class="hof-thankyou"><span class="hof-thankyou-label">L\u1EDCi nh\u1EAFn</span>${escHtml(entry.thank_you)}</div>` : ''}
        <div class="hof-ornament">\u2500\u2500 \u2726 \u2500\u2500</div>
        <div class="hof-footer">
          <div class="hof-footer-main">${t('card.footer')}</div>
          <div class="hof-timestamp">${fmtDate(entry.created_at)}</div>
        </div>
      </div>
    </div>
  `;

  // Hiển thị section
  const section = document.getElementById('hof-section');
  section.hidden = false;
  section.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Lưu entry hiện tại cho các nút action
  section.dataset.entryId = entry.id;

  // Phóng confetti liên tục cho đến khi user click/scroll
  setTimeout(() => launchConfettiLoop(), 300);
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
 * Thêm hex cell vào cuối grid, tạo row mới nếu cần.
 * @param {HTMLElement} grid
 * @param {Object} entry
 * @param {number} [animIdx]
 */
function _addHexCellToGrid(grid, entry, animIdx) {
  const perRow = getHexPerRow();
  const rows = grid.querySelectorAll('.hex-row');
  let lastRow = rows[rows.length - 1];

  if (!lastRow || lastRow.children.length >= perRow) {
    const rowIdx = rows.length;
    lastRow = document.createElement('div');
    lastRow.className = `hex-row${rowIdx % 2 !== 0 ? ' hex-row-offset' : ''}`;
    // Hàng trên có z-index cao hơn → render đè lên hàng dưới
    // Tạo hiệu ứng tổ ong: hàng dưới chỉ hiện trong khoảng trống tam giác của hàng trên
    lastRow.style.zIndex = 500 - rowIdx;
    grid.appendChild(lastRow);
  }

  const cell = buildMiniCard(entry);
  if (animIdx !== undefined) {
    cell.style.animationDelay = `${Math.min(animIdx * 0.05, 0.6)}s`;
  }
  lastRow.appendChild(cell);
}

/**
 * Render danh sách hex cell vào wall grid.
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
  entries.forEach((entry, i) => {
    _addHexCellToGrid(grid, entry, i);
  });
  updateWallCount(entries.length, total);
}

/**
 * Tạo DOM element hex cell cho wall.
 */
function buildMiniCard(entry) {
  const group    = entry.role_group || ROLE_GROUP_MAP[entry.role] || 'tech';
  const color    = entry.avatar_color || GROUP_COLOR[group];
  const initials = getInitials(entry.name);
  const years    = calcYears(entry.year);

  const cell = document.createElement('div');
  cell.className = 'hex-cell';
  cell.dataset.id = entry.id;
  cell.style.setProperty('--card-color', color);
  cell.style.setProperty('--card-color-rgb', HEX_RGB_MAP[color] || '0,212,255');

  cell.innerHTML = `
    <div class="hex-outer">
      <div class="hex-inner">
        <div class="hex-content">
          <div class="hex-avatar">${initials}</div>
          <div class="hex-name">${escHtml(entry.name)}</div>
          <div class="hex-role">${escHtml(entry.role)}</div>
          <div class="hex-year">${t('wall.yearFrom')} ${entry.year}</div>
        </div>
      </div>
    </div>
  `;

  cell.addEventListener('click', () => openModal(entry));

  return cell;
}

/**
 * Prepend card mới lên đầu wall (sau khi submit).
 */
function appendCardToWall(entry) {
  const empty = document.getElementById('wallEmpty');
  empty.hidden = true;

  _wallEntries.unshift(entry);
  _wallTotal++;

  // Re-render để giữ đúng thứ tự row offset
  renderThankYouWall(_wallEntries, _wallTotal);

  // Highlight card vừa thêm
  requestAnimationFrame(() => {
    const card = document.querySelector(`.hex-cell[data-id="${entry.id}"]`);
    if (card) card.classList.add('new-card');
  });
}

/**
 * Scroll tới và highlight card trong wall.
 */
function highlightCard(id) {
  const card = document.querySelector(`.hex-cell[data-id="${id}"]`);
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
        _addHexCellToGrid(grid, entry);
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
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:20px">
        <div class="hof-avatar" style="width:72px;height:72px;font-size:1.5rem;background:${color};box-shadow:0 0 0 3px #0d1a2e,0 0 0 5px rgba(var(--card-color-rgb),0.5),0 0 20px rgba(var(--card-color-rgb),0.4)">${initials}</div>
        <div style="flex:1;min-width:0">
          <div class="hof-name" style="font-size:1.3rem">${escHtml(entry.name)}</div>
          <div class="hof-meta" style="margin-top:6px">
            <span class="hof-role-badge">${escHtml(entry.role)}</span>
            <span class="hof-sep">·</span>
            <span>${t('card.joinedLabel')} ${entry.year}</span>
            <span class="hof-sep">·</span>
            <span>${years} ${t('card.yearsLabel')}</span>
          </div>
        </div>
      </div>
      <div class="hof-milestone" style="text-align:left;margin-top:0;margin-bottom:12px">
        <span class="hof-milestone-label">D\u1EA4U \u1EA4N C\u00C1 NH\u00C2N</span>
        <span class="hof-quote-icon">\u201C</span>
        <div class="hof-milestone-text">${escHtml(entry.milestone)}</div>
      </div>
      ${entry.thank_you ? `<div class="hof-thankyou"><span class="hof-thankyou-label">L\u1EDCi nh\u1EAFn</span>${escHtml(entry.thank_you)}</div>` : ''}
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
