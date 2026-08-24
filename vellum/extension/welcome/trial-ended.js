// Vellum — end-of-trial choice page

// Continue with Pro → open the account/upgrade page
document.getElementById('btn-pro').addEventListener('click', () => {
  const url = (chrome?.runtime?.getURL)
    ? chrome.runtime.getURL('options/options.html#upgrade')
    : '../options/options.html#upgrade';
  window.location.href = url;
});

// Stay free → close this tab
document.getElementById('btn-free').addEventListener('click', () => {
  if (chrome?.tabs?.getCurrent) {
    chrome.tabs.getCurrent((tab) => {
      if (tab && tab.id != null) chrome.tabs.remove(tab.id);
      else window.close();
    });
  } else {
    window.close();
  }
});

// Subtle constellation field, matching the welcome page
(function () {
  const cv = document.getElementById('bg-canvas');
  if (!cv) return;
  const cx = cv.getContext('2d');
  let w, h, pts;
  function size() {
    w = cv.width = cv.offsetWidth;
    h = cv.height = cv.offsetHeight;
    const count = Math.min(60, Math.floor(w / 26));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
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
