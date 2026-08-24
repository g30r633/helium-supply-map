// Vellum welcome / onboarding page

const CHECKOUT_URLS = {
  monthly:  'https://buy.polar.sh/polar_cl_QANRl7HONQ42F6ZHVVmEyHpVYuAhm2COwBaAP2aATom',
  lifetime: 'https://buy.polar.sh/polar_cl_wDJKnigy05JN0MxQ3q2zJTsPnElxKxnQ6ikdI3vvlGV'
};

// All account links → options page
const acctUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
  ? chrome.runtime.getURL('options/options.html')
  : '../options/options.html';
['nav-account', 'account-link', 'account-link-2'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.href = acctUrl;
});

// Payment cards → Polar checkout
const monthlyCard = document.getElementById('w-monthly');
if (monthlyCard) monthlyCard.addEventListener('click', () => window.open(CHECKOUT_URLS.monthly, '_blank'));
const lifetimeCard = document.getElementById('w-lifetime');
if (lifetimeCard) lifetimeCard.addEventListener('click', () => window.open(CHECKOUT_URLS.lifetime, '_blank'));

// Theme swatch previews — a curated taste of the collection
const swatches = [
  { n: 'Sakura',    c: 'linear-gradient(135deg,#1a0f18,#4a2538)' },
  { n: 'Aurora',    c: 'linear-gradient(135deg,#050d1a,#1a4a4a 50%,#4a2a5a)' },
  { n: 'Synthwave', c: 'linear-gradient(180deg,#1a0a2e,#ff71ce 60%,#1a0218)' },
  { n: 'Northern',  c: 'linear-gradient(180deg,#020c08,#4ade80 40%,#081a10)' },
  { n: 'Embers',    c: 'linear-gradient(0deg,#ff7e3d,#140805)' },
  { n: 'Ocean',     c: 'linear-gradient(180deg,#051420,#06b6d4)' },
  { n: 'Galaxy',    c: 'radial-gradient(circle at 60% 40%,#4a3a8a,#050514)' },
  { n: 'Plasma',    c: 'radial-gradient(circle at 60% 40%,#f06ec8,#0a0614)' },
];
const grid = document.getElementById('swatches');
if (grid) {
  swatches.forEach(s => {
    const d = document.createElement('div');
    d.className = 'sw';
    d.style.background = s.c;
    d.innerHTML = `<span>${s.n}</span>`;
    grid.appendChild(d);
  });
}

// Subtle constellation particle field behind the hero
(function () {
  const cv = document.getElementById('welcome-canvas');
  if (!cv) return;
  const cx = cv.getContext('2d');
  let w, h, pts;
  function size() {
    w = cv.width = cv.offsetWidth;
    h = cv.height = cv.offsetHeight;
    const count = Math.min(60, Math.floor(w / 24));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.3 + 0.5
    }));
  }
  size();
  window.addEventListener('resize', size);
  function frame() {
    cx.clearRect(0, 0, w, h);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cx.fillStyle = 'rgba(212,165,116,0.5)'; cx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y);
          cx.strokeStyle = `rgba(212,165,116,${0.12 * (1 - dist / 120)})`;
          cx.lineWidth = 0.6; cx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
})();
