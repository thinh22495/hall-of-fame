/* ── i18n: Đa ngôn ngữ ── */

let _translations = {};
let _currentLang = 'vi';

/** Load và áp dụng ngôn ngữ */
async function loadLang(lang) {
  try {
    const res = await fetch(`locales/${lang}.json`);
    if (!res.ok) throw new Error('not found');
    _translations = await res.json();
    _currentLang = lang;
    localStorage.setItem('vhec_lang', lang);
    applyLang();
    document.documentElement.lang = lang;
    // Hiển thị đúng nhãn: vi→VN, ja→JP
    const LANG_LABELS = { vi: 'VN', ja: 'JP' };
    document.getElementById('langLabel').textContent = LANG_LABELS[lang] || lang.toUpperCase();
  } catch {
    console.warn(`[i18n] Không tải được ngôn ngữ: ${lang}`);
  }
}

/** Áp dụng translations lên DOM qua data-i18n attributes */
function applyLang() {
  // text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = getNestedKey(_translations, key);
    if (val !== undefined) el.textContent = val;
  });
  // placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const val = getNestedKey(_translations, key);
    if (val !== undefined) el.placeholder = val;
  });
}

/** Lấy key lồng nhau: "hero.title" → translations.hero.title */
function getNestedKey(obj, keyPath) {
  return keyPath.split('.').reduce((acc, k) => acc?.[k], obj);
}

/** Lấy chuỗi dịch theo key (dùng trong JS) */
function t(key) {
  const val = getNestedKey(_translations, key);
  return val !== undefined ? val : key;
}

/** Khởi tạo: load ngôn ngữ từ localStorage hoặc browser */
async function initI18n() {
  const saved   = localStorage.getItem('vhec_lang');
  const browser = navigator.language?.startsWith('ja') ? 'ja' : 'vi';
  await loadLang(saved || browser);
}
