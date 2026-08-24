# Adding a theme

A theme id has to appear in **five** places. MV3 content scripts are classic
scripts and cannot import a shared module, so the catalogue is duplicated by
necessity — which makes a half-added theme the most common way to break Vellum.
Run `node scripts/verify.js` when you are done; it checks all five and fails
loudly.

Say you are adding `driftwood`, a Pro theme, as number 251.

## 1. `extension/background.js` — entitlement

Append the id to `ALL_PRO` (or `ALL_FREE`). This list is the authority on what
exists, and it is what the `SET_THEME` gate reads.

```js
const ALL_PRO = [ …, 'contrail', 'driftwood' ];
```

## 2. `extension/content/inject.js` — the palette

Add an entry to the `THEMES` map. Five colours, all required:

```js
driftwood: { name: 'Driftwood', pro: true,
  colors: { bg:'#12100d', surface:'#1b1815', accent:'#c8a882',
            text:'#e8e0d4', border:'#262119' } },
```

`bg` is the page, `surface` is the sidebar and composer, `accent` is links and the
send button, `text` is body copy, `border` is dividers and scrollbars. These
become CSS variable overrides — they are not read by the animation, which paints
whatever it likes.

## 3. `extension/content/inject.js` — the engine

Write the function, then register it in the `fns` dispatch table inside
`startAnimation()`. Follow the house contract:

```js
function driftwood(cv, cx) {
  let W = 0, H = 0, t = 0, pieces;

  function build() {                       // seed, and re-seed on any size change
    W = cv.width; H = cv.height;
    pieces = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H, sp: 0.2 + Math.random() * 0.4
    }));
  }
  build();

  function f() {
    if (cv.width !== W || cv.height !== H) build();

    cx.fillStyle = 'rgba(18,16,13,' + vellumFade(0.14) + ')';   // trail fade
    cx.fillRect(0, 0, W, H);

    pieces.forEach(p => {
      p.y += p.sp * vellumDt;                                    // motion × dt
      if (p.y > H) p.y = -10;
      cx.fillRect(p.x, p.y, 2, 2);
    });

    t += vellumDt;
    raf = requestAnimationFrame(f);         // module-level `raf`, not a local
  }
  f();
}
```

Five rules, all load-bearing:

1. **Every motion is multiplied by `vellumDt`.** That is the entire speed system.
   A hard-coded step ignores the slider and desyncs from everything else on screen.
2. **Trail fades go through `vellumFade(a)`.** A per-frame fade compounds far more
   often at low `dt`; `vellumFade` corrects for that and clamps above the 8-bit
   rounding floor so trails still clear.
3. **Assign to the module-level `raf`.** `applyThemeInner` cancels exactly that
   handle when the theme changes. A local handle leaks a running loop.
   (The one exception in the codebase is the preview toast's own countdown, which
   deliberately uses a local handle so it cannot cancel the theme.)
4. **Re-seed on resize** by comparing `cv.width/height` against your cached `W/H`.
5. **Any listener, timer or observer registers an undo** on
   `window._vellumCleanup`:

   ```js
   const onMove = (e) => { … };
   window.addEventListener('mousemove', onMove);
   if (!window._vellumCleanup) window._vellumCleanup = [];
   window._vellumCleanup.push(() => window.removeEventListener('mousemove', onMove));
   ```

Then register it:

```js
const fns = {
  …,
  icicles, garland, onsen, strings, loom, contrail,
  driftwood
};
```

If your function name has to differ from the theme id, alias it the way the calm
engines do: `graphite: graphiteVoid`.

## 4. `extension/popup/popup.js` — the catalogue entry

```js
{ id:'driftwood', name:'Driftwood', num:'251', section:'nature', isNew:true },
```

- `name` is what the grid shows — keep it short, the tile is narrow. Long names
  are abbreviated in the existing catalogue (`Constel.`, `Kaleido.`, `Solar Sys.`).
- `num` must continue the run with no gaps. `verify.js` checks 001..N.
- `section` must be one of the existing section ids in `SECTIONS`.
- Add `free:true` for a free theme — and it must agree with which list you put it
  in back in step 1.
- `isNew:true` puts it under the **New** section.

If people would search for it by a word that appears nowhere in its name or
section, add it to `KEYWORDS` in the same file.

## 5. `extension/popup/popup.html` — the grid swatch

A CSS gradient that reads as the theme at 60×40 px, next to the other `.pv-`
rules:

```css
.pv-driftwood { background: linear-gradient(135deg, #12100d, #c8a882); }
```

## Then

```bash
node scripts/verify.js
```

Reload the extension at `chrome://extensions`, refresh a Claude or ChatGPT tab and
check it at 100% *and* at 10% on the speed slider — the low end is where a missing
`vellumDt` or a raw trail fade shows up immediately.

If the theme runs noticeably busier than the rest of the catalogue at 100%, give
it an entry in `VELLUM_BASE` rather than slowing the engine down by hand: 100% is
meant to be "the pace this theme should run at", and the slider scales from there.
