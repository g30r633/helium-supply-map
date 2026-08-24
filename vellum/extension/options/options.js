// Vellum options/account page

// ══════════════════════════════════════════════════════════
//  CHECKOUT URLS — Replace with your Polar.sh checkout URLs
//  1. Go to polar.sh and create two products (monthly + lifetime)
//  2. Copy the checkout URLs and paste them below
// ══════════════════════════════════════════════════════════
const CHECKOUT_URLS = {
  monthly:  'https://buy.polar.sh/polar_cl_QANRl7HONQ42F6ZHVVmEyHpVYuAhm2COwBaAP2aATom',
  lifetime: 'https://buy.polar.sh/polar_cl_wDJKnigy05JN0MxQ3q2zJTsPnElxKxnQ6ikdI3vvlGV'
};

let state = { activeTheme: 'default', pro: false, licenseKey: null };

// ── INIT ──────────────────────────────────────────
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (s) => {
  if (s) { state = s; render(); }
});

// Hash navigation
setTimeout(() => {
  const hash = location.hash.replace('#', '');
  const el = hash && document.getElementById(hash);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}, 300);

// ── RENDER ────────────────────────────────────────
function render() {
  if (state.pro) {
    document.body.classList.add('pro');
    document.getElementById('badge-text').textContent = 'Pro';
    document.getElementById('badge').classList.add('pro');
  } else if (state.trialActive) {
    document.body.classList.add('trial');
    document.getElementById('badge-text').textContent = state.trialDaysLeft + 'd trial';
    document.getElementById('badge').classList.add('trial');
  }
  document.body.classList.toggle('company',
    !!(state.companyConfig && state.companyConfig.colors));
  renderCompany();
}

function renderCompany() {
  const cfg = state.companyConfig;
  const active = cfg && cfg.colors;
  document.getElementById('company-form').style.display = active ? 'none' : 'block';
  document.getElementById('company-active').style.display = active ? 'block' : 'none';
  if (!active) return;

  document.getElementById('company-name').textContent = cfg.company || 'Your company';

  // Multi-background picker — only when the company ships more than one
  const picker = document.getElementById('company-bg-picker');
  const list = document.getElementById('company-bg-list');
  const backgrounds = Array.isArray(cfg.backgrounds) ? cfg.backgrounds : [];
  if (backgrounds.length > 1) {
    picker.style.display = 'block';
    list.innerHTML = '';
    backgrounds.forEach((bg, i) => {
      const c = bg.colors || {};
      const el = document.createElement('div');
      el.className = 'bg-opt' + (i === cfg.activeIndex ? ' active' : '');
      el.style.background = `linear-gradient(135deg, ${c.bg || '#111'}, ${c.accent || c.surface || '#333'})`;
      el.innerHTML = `<span>${bg.name || ('Background ' + (i + 1))}</span>`;
      el.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'SET_COMPANY_BG', index: i }, (res) => {
          if (res && res.ok) {
            cfg.activeIndex = res.index;
            list.querySelectorAll('.bg-opt').forEach((n, j) => n.classList.toggle('active', j === res.index));
            const m = document.getElementById('company-active-msg');
            m.textContent = 'Background applied.'; m.className = 'msg ok';
          }
        });
      });
      list.appendChild(el);
    });
  } else {
    picker.style.display = 'none';
  }
}

// ── CHECKOUT ──────────────────────────────────────
document.getElementById('buy-monthly').addEventListener('click', () => {
  window.open(CHECKOUT_URLS.monthly, '_blank');
});

document.getElementById('buy-lifetime').addEventListener('click', () => {
  window.open(CHECKOUT_URLS.lifetime, '_blank');
});

// ── LICENSE KEY ───────────────────────────────────
const input = document.getElementById('key-input');
const msg = document.getElementById('key-msg');

document.getElementById('btn-activate').addEventListener('click', activate);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') activate(); });

function activate() {
  const key = input.value.trim();
  if (!key || key.length < 8) {
    msg.textContent = 'Please paste your license key from the purchase email.';
    msg.className = 'msg err';
    return;
  }
  msg.textContent = 'Verifying…';
  msg.className = 'msg';

  chrome.runtime.sendMessage({ type: 'VERIFY_LICENSE', key }, (res) => {
    if (res && res.ok) {
      msg.textContent = 'Activated. Welcome to Pro.';
      msg.className = 'msg ok';
      setTimeout(() => location.reload(), 1000);
    } else {
      msg.textContent = (res && res.error) || 'Could not verify. Check your key.';
      msg.className = 'msg err';
    }
  });
}

// ── SIGN OUT ──────────────────────────────────────
const signoutBtn = document.getElementById('btn-signout');
if (signoutBtn) {
  signoutBtn.addEventListener('click', () => {
    if (!confirm('Sign out of Pro? You can reactivate with your key.')) return;
    chrome.runtime.sendMessage({ type: 'SIGN_OUT' }, () => location.reload());
  });
}

// ── REFRESH LICENSE ───────────────────────────────
const refreshBtn = document.getElementById('btn-refresh-license');
if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    const m = document.getElementById('refresh-msg');
    m.textContent = 'Checking with the licensing server…';
    m.className = 'msg';
    chrome.runtime.sendMessage({ type: 'REFRESH_LICENSE' }, (res) => {
      if (res && res.ok && res.status === 'granted') {
        m.textContent = 'License is active. You’re all set.';
        m.className = 'msg ok';
      } else if (res && res.ok && res.status === 'revoked') {
        m.textContent = 'This license is no longer active. Reverting to Free…';
        m.className = 'msg err';
        setTimeout(() => location.reload(), 1400);
      } else {
        m.textContent = (res && res.error) || 'Could not check the license. Try again.';
        m.className = 'msg err';
      }
    });
  });
}

// ── COMPANY / TEAM CODE ───────────────────────────
const companyInput = document.getElementById('company-input');
const companyMsg = document.getElementById('company-msg');

document.getElementById('btn-company').addEventListener('click', applyCompany);
companyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyCompany(); });

function applyCompany() {
  const code = companyInput.value.trim();
  if (!code || code.length < 4) {
    companyMsg.textContent = 'Enter the company code from your workplace.';
    companyMsg.className = 'msg err';
    return;
  }
  companyMsg.textContent = 'Checking code…';
  companyMsg.className = 'msg';

  chrome.runtime.sendMessage({ type: 'VERIFY_COMPANY_CODE', code }, (res) => {
    if (res && res.ok) {
      companyMsg.textContent = 'Applied — welcome, ' + (res.company || 'team') + '.';
      companyMsg.className = 'msg ok';
      setTimeout(() => location.reload(), 1000);
    } else {
      companyMsg.textContent = (res && res.error) || 'Could not apply this code.';
      companyMsg.className = 'msg err';
    }
  });
}

document.getElementById('btn-company-reapply').addEventListener('click', () => {
  const activeMsg = document.getElementById('company-active-msg');
  activeMsg.textContent = 'Checking for updates…';
  activeMsg.className = 'msg';
  // Pull the config down again first — this button used to re-apply the copy already
  // in storage, which meant an admin's edits could never reach anyone.
  chrome.runtime.sendMessage({ type: 'REFRESH_COMPANY' }, (r) => {
    chrome.runtime.sendMessage({ type: 'SET_THEME', theme: '__company' }, () => {
      activeMsg.textContent = (r && r.ok && r.changed)
        ? 'Updated to the latest company background.'
        : 'Company background reapplied (already up to date).';
      activeMsg.className = 'msg ok';
      if (r && r.ok && r.changed) setTimeout(() => location.reload(), 900);
    });
  });
});

document.getElementById('btn-company-remove').addEventListener('click', () => {
  if (!confirm('Remove your company background? This also reverts you to the default theme.')) return;
  chrome.runtime.sendMessage({ type: 'REMOVE_COMPANY' }, () => location.reload());
});

// ── YOUR OWN BACKGROUND ────────────────────────────────
// A Pro feature that turns the catalogue from a fixed list into "anything you want".
// The picture is downscaled and re-encoded before storing: originals off a phone are
// routinely 4-8MB and storage.local has a 10MB budget for everything.
const CBG_MAX = 2560;          // longest edge kept; plenty for any display
const CBG_QUALITY = 0.86;

let cbgDraft = null;           // { data, colors, fit, drift, alpha, name }

function cbgMsg(text, kind) {
  const el = document.getElementById('cbg-msg');
  if (!el) return;
  el.textContent = text || '';
  el.className = 'msg' + (kind ? ' ' + kind : '');
}

// Pull a palette out of the picture so the sidebar, composer and text sit WITH it
// rather than against it. Darkest common tone becomes the page, the most saturated
// becomes the accent, and text is picked for contrast against the page.
function cbgPalette(img) {
  const N = 64;
  const c = document.createElement('canvas');
  c.width = N; c.height = N;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, N, N);
  const d = x.getImageData(0, 0, N, N).data;

  let rs = 0, gs = 0, bs = 0, n = 0;
  let best = [140, 140, 150], bestScore = -1;
  const darks = [];
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    rs += r; gs += g; bs += b; n++;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx === 0 ? 0 : (mx - mn) / mx;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // an accent wants colour AND enough brightness to read as one
    const score = sat * Math.min(1, lum / 140);
    if (score > bestScore) { bestScore = score; best = [r, g, b]; }
    if (lum < 90) darks.push([r, g, b, lum]);
  }
  const avg = [rs / n, gs / n, bs / n];
  darks.sort((a, b2) => a[3] - b2[3]);
  // a fifth of the way into the dark tones: darker than average, but not the single
  // darkest pixel, which is usually noise or a border
  const pick = darks.length
    ? darks[Math.floor(darks.length * 0.2)]
    : [avg[0] * 0.25, avg[1] * 0.25, avg[2] * 0.25, 0];

  const hex = (r, g, b) => '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b2, t) => a.map((v, i) => v + (b2[i] - v) * t);

  const bgArr = mix([pick[0], pick[1], pick[2]], [0, 0, 0], 0.35);   // deepen so text reads
  const bgLum = 0.2126 * bgArr[0] + 0.7152 * bgArr[1] + 0.0722 * bgArr[2];
  const light = bgLum > 128;
  return {
    bg: hex(bgArr[0], bgArr[1], bgArr[2]),
    surface: hex.apply(null, mix(bgArr, light ? [0, 0, 0] : [255, 255, 255], 0.08)),
    border: hex.apply(null, mix(bgArr, light ? [0, 0, 0] : [255, 255, 255], 0.16)),
    accent: hex(best[0], best[1], best[2]),
    text: light ? '#12131a' : '#ecedf2'
  };
}

function cbgPaintSwatches(colors) {
  const wrap = document.getElementById('cbg-swatches');
  if (!wrap) return;
  wrap.innerHTML = ['bg', 'surface', 'border', 'accent', 'text']
    .filter(k => colors[k])
    .map(k => '<i title="' + k + ': ' + colors[k] + '" style="background:' + colors[k] + '"></i>')
    .join('');
}

function cbgShowEditor() {
  document.getElementById('cbg-editor').style.display = 'block';
  document.getElementById('cbg-drop-text').textContent = 'Choose a different image';
}

function cbgLoadFile(file) {
  if (!file) return;
  if (!/^image\//.test(file.type)) { cbgMsg('That is not an image file.', 'err'); return; }
  if (file.size > 20 * 1024 * 1024) { cbgMsg('That image is over 20MB - try a smaller one.', 'err'); return; }
  cbgMsg('Reading image...');
  const fr = new FileReader();
  fr.onerror = () => cbgMsg('Could not read that file.', 'err');
  fr.onload = () => {
    const img = new Image();
    img.onerror = () => cbgMsg('That image could not be decoded.', 'err');
    img.onload = () => {
      // SVG has no meaningful pixel size; keep the original so it stays vector-sharp
      const isVector = /^data:image\/svg/.test(fr.result);
      let data = fr.result;
      if (!isVector) {
        const scale = Math.min(1, CBG_MAX / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const webp = c.toDataURL('image/webp', CBG_QUALITY);
        // webp is not always smaller (tiny or already-optimised sources)
        data = webp.length < fr.result.length ? webp : fr.result;
      }
      const colors = cbgPalette(img);
      cbgDraft = {
        data: data,
        colors: colors,
        name: (file.name || '').replace(/\.[a-z0-9]+$/i, '').slice(0, 40) || 'Your background',
        fit: (cbgDraft && cbgDraft.fit) || 'cover',
        drift: cbgDraft ? cbgDraft.drift : 9,
        alpha: cbgDraft ? cbgDraft.alpha : 1
      };
      document.getElementById('cbg-preview').src = data;
      cbgShowEditor();
      cbgPaintSwatches(colors);
      const kb = Math.round(data.length / 1366);      // base64 chars -> rough KB
      cbgMsg('Ready - ' + img.width + ' x ' + img.height + ', about ' + kb + 'KB stored.', 'ok');
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

(function wireCustomBg() {
  const drop = document.getElementById('cbg-drop');
  if (!drop) return;
  const file = document.getElementById('cbg-file');
  const drift = document.getElementById('cbg-drift');
  const alpha = document.getElementById('cbg-alpha');

  file.addEventListener('change', () => cbgLoadFile(file.files && file.files[0]));
  ['dragenter', 'dragover'].forEach(e => drop.addEventListener(e, (ev) => {
    ev.preventDefault(); drop.classList.add('over');
  }));
  ['dragleave', 'drop'].forEach(e => drop.addEventListener(e, () => drop.classList.remove('over')));
  drop.addEventListener('drop', (ev) => {
    ev.preventDefault();
    cbgLoadFile(ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]);
  });

  document.getElementById('cbg-fit').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || !cbgDraft) return;
    cbgDraft.fit = b.dataset.fit;
    Array.prototype.forEach.call(ev.currentTarget.querySelectorAll('button'),
      x => x.classList.toggle('on', x === b));
  });

  drift.addEventListener('input', () => {
    document.getElementById('cbg-drift-v').textContent = drift.value + 'px';
    if (cbgDraft) cbgDraft.drift = +drift.value;
  });
  alpha.addEventListener('input', () => {
    document.getElementById('cbg-alpha-v').textContent = alpha.value + '%';
    if (cbgDraft) cbgDraft.alpha = +alpha.value / 100;
  });

  document.getElementById('cbg-apply').addEventListener('click', () => {
    if (!cbgDraft) { cbgMsg('Choose an image first.', 'err'); return; }
    cbgMsg('Saving...');
    chrome.storage.local.set({ customBg: cbgDraft }, () => {
      if (chrome.runtime.lastError) {
        cbgMsg('Could not save - the image may be too large. Try a smaller one.', 'err');
        return;
      }
      chrome.runtime.sendMessage({ type: 'SET_THEME', theme: '__custom' }, (r) => {
        const ok = r && r.applied === '__custom';
        cbgMsg(ok ? 'Applied. Open Claude or ChatGPT to see it.'
                  : 'Saved, but Pro is required to apply it.', ok ? 'ok' : 'err');
      });
    });
  });

  document.getElementById('cbg-remove').addEventListener('click', () => {
    chrome.storage.local.remove('customBg', () => {
      cbgDraft = null;
      document.getElementById('cbg-editor').style.display = 'none';
      document.getElementById('cbg-drop-text').textContent = 'Choose an image, or drop one here';
      chrome.runtime.sendMessage({ type: 'SET_THEME', theme: 'default' });
      cbgMsg('Removed.', 'ok');
    });
  });

  // restore whatever is already saved
  chrome.storage.local.get(['customBg'], (d) => {
    if (!d.customBg || !d.customBg.data) return;
    cbgDraft = d.customBg;
    document.getElementById('cbg-preview').src = cbgDraft.data;
    cbgShowEditor();
    cbgPaintSwatches(cbgDraft.colors || {});
    drift.value = cbgDraft.drift === undefined ? 9 : cbgDraft.drift;
    document.getElementById('cbg-drift-v').textContent = drift.value + 'px';
    alpha.value = Math.round((cbgDraft.alpha === undefined ? 1 : cbgDraft.alpha) * 100);
    document.getElementById('cbg-alpha-v').textContent = alpha.value + '%';
    Array.prototype.forEach.call(document.querySelectorAll('#cbg-fit button'),
      b => b.classList.toggle('on', b.dataset.fit === (cbgDraft.fit || 'cover')));
  });
})();
