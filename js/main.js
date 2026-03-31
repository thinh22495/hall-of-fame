/* ── Main: Init & Event Listeners ── */
// Lưu ý: _wallEntries, _wallTotal, _wallPage, _wallFilters được khai báo trong render.js

let _editingId     = null;   // ID entry đang được chỉnh sửa
let _selectedColor = '#00d4ff';

document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. Khởi tạo ──
  initSupabase();
  await initI18n();
  initParticles();
  initWallStars();
  initCountdown();
  initAllCountUps();

  // Tải số thành viên cho Stats bar
  (async () => {
    try {
      const count = await countEntries();
      const el = document.getElementById('memberCount');
      if (el && count > 0) {
        el.dataset.target = count;
        el.dataset.suffix = '+';
        initCountUp(el, count, 1800, '+');
      }
    } catch {}
  })();

  // Tải wall
  await loadWall();

  // ── 2. Hero CTAs ──
  document.getElementById('ctaCreate')?.addEventListener('click', () => {
    // Reset form về chế độ thêm mới
    _editingId = null;
    document.getElementById('hofForm')?.reset();
    document.querySelectorAll('.color-swatch').forEach((s, i) => s.classList.toggle('active', i === 0));
    _selectedColor = '#00d4ff';
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('ctaWall')?.addEventListener('click', () => {
    document.getElementById('wall-section').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('emptyCtaBtn')?.addEventListener('click', () => {
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  });

  // ── 3. Đổi ngôn ngữ ──
  document.getElementById('langToggle')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-option');
    if (!btn) return;
    loadLang(btn.dataset.lang);
  });

  // ── 4. Nhạc nền ──
  const audio  = document.getElementById('bgMusic');
  const btnMus = document.getElementById('musicToggle');

  audio.volume = 0.5;
  let _played = false;

  async function playMusic() {
    if (_played) return;
    _played = true;
    await audio.play();
    btnMus.classList.add('playing');
    document.getElementById('musicHint')?.remove();
  }

  // Đăng ký lắng nghe tương tác ngay từ đầu (không delay)
  function _onFirstInteract() {
    document.removeEventListener('click',      _onFirstInteract, true);
    document.removeEventListener('touchstart', _onFirstInteract, true);
    document.removeEventListener('keydown',    _onFirstInteract, true);
    playMusic().catch(() => {});
  }
  document.addEventListener('click',      _onFirstInteract, { capture: true });
  document.addEventListener('touchstart', _onFirstInteract, { capture: true });
  document.addEventListener('keydown',    _onFirstInteract, { capture: true });

  // Hiện badge gợi ý sau 1.5s nếu chưa có tương tác
  setTimeout(() => {
    if (_played) return;
    const hint = document.createElement('div');
    hint.id = 'musicHint';
    hint.textContent = '🎵';
    hint.style.cssText = `
      position:fixed;bottom:80px;right:24px;z-index:9999;
      background:rgba(0,212,255,0.12);border:1px solid rgba(0,212,255,0.35);
      color:#00d4ff;font-size:.78rem;padding:7px 14px;border-radius:999px;
      backdrop-filter:blur(8px);pointer-events:none;
      animation:fadeInUp .4s ease both;
    `;
    document.body.appendChild(hint);
  }, 1500);

  // Nút bật/tắt thủ công
  btnMus?.addEventListener('click', async () => {
    if (audio.paused) {
      _played = false;
      await playMusic().catch(() => {});
    } else {
      audio.pause();
      btnMus.classList.remove('playing');
    }
  });

  // ── 5. Avatar color picker ──
  document.getElementById('colorPicker')?.addEventListener('click', (e) => {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    _selectedColor = swatch.dataset.color;
  });

  // ── 6. Form submit ──
  const form      = document.getElementById('hofForm');
  const submitBtn = document.getElementById('submitBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    btnText.hidden = true;
    btnLoading.hidden = false;

    const role = document.getElementById('iRole').value;
    const data = {
      name:         document.getElementById('iName').value.trim(),
      role,
      role_group:   ROLE_GROUP_MAP[role] || 'tech',
      year:         parseInt(document.getElementById('iYear').value, 10),
      milestone:    document.getElementById('iMilestone').value.trim(),
      thank_you:    document.getElementById('iThankYou').value.trim(),
      avatar_color: _selectedColor,
    };

    try {
      let entry;
      if (_editingId) {
        entry = await updateEntry(_editingId, data);
        // Cập nhật hex cell trong wall
        const existing = document.querySelector(`.hex-cell[data-id="${_editingId}"]`);
        if (existing) existing.replaceWith(buildMiniCard(entry));
        // Cập nhật trong _wallEntries
        const idx = _wallEntries.findIndex(e => e.id === _editingId);
        if (idx !== -1) _wallEntries[idx] = entry;
        _editingId = null;
      } else {
        entry = await saveEntry(data);
        appendCardToWall(entry);
      }
      renderHallOfFameCard(entry);
      showToast(t('toast.saved'), 'success');
      // Reset form
      form.reset();
      document.querySelectorAll('.color-swatch').forEach((s, i) => s.classList.toggle('active', i === 0));
      _selectedColor = '#00d4ff';
    } catch (err) {
      console.error('[main] save error:', err);
      showToast(t('toast.saveError'), 'error');
    } finally {
      submitBtn.disabled = false;
      btnText.hidden = false;
      btnLoading.hidden = true;
    }
  });

  // ── 7. HOF Card action buttons ──
  document.getElementById('btnDownload')?.addEventListener('click', downloadCard);

  document.getElementById('btnShare')?.addEventListener('click', () => {
    const id = document.getElementById('hof-section').dataset.entryId;
    shareEntry(_wallEntries.find(e => e.id === id) || {});
  });

  document.getElementById('btnEdit')?.addEventListener('click', () => {
    const id = document.getElementById('hof-section').dataset.entryId;
    _fillFormForEdit(id);
  });

  document.getElementById('btnViewWall')?.addEventListener('click', () => {
    const id = document.getElementById('hof-section').dataset.entryId;
    document.getElementById('wall-section').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => highlightCard(id), 600);
  });

  // ── 8. Wall: Filter & Sort & Search ──
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      setWallFilter({ group: pill.dataset.group });
    });
  });

  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    setWallFilter({ sort: e.target.value });
  });

  let _searchTimer;
  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => setWallFilter({ search: e.target.value }), 300);
  });

  // ── 9. Re-render hex grid khi đổi breakpoint ──
  let _hexBreakpoint = _getHexBP();
  function _getHexBP() {
    return window.innerWidth <= 560 ? 'sm' : window.innerWidth <= 900 ? 'md' : 'lg';
  }
  window.addEventListener('resize', () => {
    const bp = _getHexBP();
    if (bp !== _hexBreakpoint) { _hexBreakpoint = bp; loadWall(); }
  });

  // ── 10. Modal ──
  document.getElementById('modal')?.addEventListener('click', async (e) => {
    // Click overlay → đóng
    if (e.target === e.currentTarget) { closeModal(); return; }

    // Nút đóng
    if (e.target.id === 'modalClose') { closeModal(); return; }

    // Actions trong modal (edit/delete)
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    const id     = actionEl.dataset.id;
    if (action === 'edit-modal')   { closeModal(); _fillFormForEdit(id); }
    if (action === 'delete-modal') { closeModal(); await _handleDelete(id); }
  });

  // Escape → đóng modal, focus trap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      const modal = document.getElementById('modal');
      if (modal.hidden) return;
      const focusable = [...modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')];
      if (focusable.length < 2) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
});

// ── Local helpers ──

/** Điền form với data entry để chỉnh sửa */
function _fillFormForEdit(id) {
  // Tìm entry từ wall state hoặc localStorage
  const entry = _wallEntries.find(e => e.id === id)
    || lsGetEntries().find(e => e.id === id);
  if (!entry) return;

  document.getElementById('iName').value      = entry.name      || '';
  document.getElementById('iRole').value      = entry.role      || '';
  document.getElementById('iYear').value      = entry.year      || '';
  document.getElementById('iMilestone').value = entry.milestone || '';
  document.getElementById('iThankYou').value  = entry.thank_you || '';

  // Đặt màu avatar
  const color = entry.avatar_color || '#00d4ff';
  _selectedColor = color;
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === color);
  });

  _editingId = id;
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}

/** Xóa entry sau confirm */
async function _handleDelete(id) {
  if (!confirm(t('wall.deleteConfirm'))) return;
  try {
    await deleteEntry(id);
    const hexCard = document.querySelector(`.hex-cell[data-id="${id}"]`);
    if (hexCard) {
      const row = hexCard.closest('.hex-row');
      hexCard.remove();
      if (row && row.children.length === 0) row.remove();
    }
    // Cập nhật state trong render.js
    const idx = _wallEntries.findIndex(e => e.id === id);
    if (idx !== -1) _wallEntries.splice(idx, 1);
    _wallTotal = Math.max(0, _wallTotal - 1);
    updateWallCount(_wallEntries.length, _wallTotal);
    showToast(t('toast.deleted'), 'success');
    if (!_wallEntries.length) document.getElementById('wallEmpty').hidden = false;
  } catch {
    showToast(t('toast.deleteError'), 'error');
  }
}

// ── Validation ──

function validateForm() {
  let valid = true;
  const name      = document.getElementById('iName').value.trim();
  const role      = document.getElementById('iRole').value;
  const year      = parseInt(document.getElementById('iYear').value, 10);
  const milestone = document.getElementById('iMilestone').value.trim();

  // Helper
  const setErr = (id, groupId, msg) => {
    const el = document.getElementById(id);
    const group = document.getElementById(groupId)?.closest('.form-group');
    el.textContent = msg;
    group?.classList.toggle('has-error', !!msg);
  };

  if (name.length < 2) {
    setErr('errName', 'iName', t('form.errName')); valid = false;
  } else { setErr('errName', 'iName', ''); }

  if (!role) {
    setErr('errRole', 'iRole', t('form.errRole')); valid = false;
  } else { setErr('errRole', 'iRole', ''); }

  if (isNaN(year) || year < YEAR_MIN || year > YEAR_MAX) {
    setErr('errYear', 'iYear', t('form.errYear')); valid = false;
  } else { setErr('errYear', 'iYear', ''); }

  if (milestone.length < 20) {
    setErr('errMilestone', 'iMilestone', t('form.errMilestone')); valid = false;
  } else { setErr('errMilestone', 'iMilestone', ''); }

  return valid;
}
