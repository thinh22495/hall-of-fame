/* ── Share & Download ── */

/**
 * Chụp Hall of Fame card thành PNG và tải xuống.
 */
async function downloadCard() {
  const card = document.getElementById('hof-card');
  if (!card) return;

  const btn = document.getElementById('btnDownload');
  btn.disabled = true;

  try {
    // html2canvas phải load từ CDN trước
    if (typeof html2canvas === 'undefined') {
      // Lazy-load CDN
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    // Tạm tắt animation để capture sạch
    card.style.animation = 'none';

    const canvas = await html2canvas(card, {
      backgroundColor: '#050a14',
      scale: 2,
      useCORS: true,
      logging: false,
      width: card.scrollWidth,
      height: card.scrollHeight,
    });

    // Restore animation
    card.style.animation = '';

    const name = card.querySelector('.hof-name')?.textContent?.trim() || 'VHEC';
    const year = new Date().getFullYear();
    const link = document.createElement('a');
    link.download = `VHEC-10Years-${name}-${year}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast(t('toast.downloaded'), 'success');
  } catch (err) {
    console.error('[share] download error:', err);
    showToast(t('toast.saveError'), 'error');
  } finally {
    btn.disabled = false;
  }
}

/**
 * Chia sẻ entry qua navigator.share hoặc clipboard.
 * @param {Object} entry
 */
async function shareEntry(entry) {
  const shareText = t('share.text');
  const title = 'VHEC 10 Years Together';

  if (navigator.share) {
    try {
      await navigator.share({ title, text: shareText, url: location.href });
    } catch (err) {
      if (err.name !== 'AbortError') _copyToClipboard(shareText);
    }
  } else {
    _copyToClipboard(shareText);
  }
}

function _copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(t('toast.copied'), 'success'))
      .catch(() => _fallbackCopy(text));
  } else {
    _fallbackCopy(text);
  }
}

function _fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  showToast(t('toast.copied'), 'success');
}
