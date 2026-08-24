# Vellum — Architecture

Vellum is a Manifest V3 Chrome extension that replaces the background and colour
scheme of `claude.ai`, `chatgpt.com` and `chat.openai.com` with one of 250
hand-written canvas animations. Everything renders locally; there is no analytics,
no telemetry and no account system beyond a licence key.

Version documented here: **1.9.0**.

---

## 1. The four processes

A Chrome extension is not one program. Vellum is four contexts that only talk to
each other through `chrome.runtime` messages and `chrome.storage`:

| Context | File | Lifetime | Job |
|---|---|---|---|
| Service worker | `background.js` | Woken by events, killed when idle | Owns state. Entitlement, licensing, company codes, trial clock, broadcasting theme changes. |
| Content script | `content/inject.js` | Per tab, per page load | Owns pixels. Injects CSS, creates the canvas, runs the animation engine, repairs the host page. |
| Popup | `popup/popup.html` + `.js` | While the toolbar popup is open | The theme browser: sections, search, favourites, preview, speed slider. |
| Options page | `options/options.html` + `.js` | A normal tab | Account: checkout, licence key, company code, custom background upload, help. |

Plus two static onboarding tabs: `welcome/welcome.html` (opened on install) and
`welcome/trial-ended.html` (opened once, when the trial lapses).

```
        ┌────────────┐  SET_THEME / VERIFY_LICENSE / GET_STATE  ┌───────────────┐
        │   popup    │ ───────────────────────────────────────► │               │
        └────────────┘                                          │  background   │
        ┌────────────┐  VERIFY_COMPANY_CODE / SET_THEME / …      │ service worker│
        │  options   │ ───────────────────────────────────────► │               │
        └────────────┘                                          └───────┬───────┘
                                                                        │
                                        chrome.storage.sync (state)      │ THEME_CHANGED
                                        chrome.storage.local (image)     │ (tabs.sendMessage)
                                                                        ▼
                                                             ┌────────────────────┐
                    claude.ai / chatgpt.com  ◄────────────────│  content/inject.js │
                    (CSS vars, <canvas>, dock canvas)          └────────────────────┘
```

There is deliberately **no** shared module system — MV3 content scripts are
classic scripts, so each context carries its own copy of the theme list. Section 6
covers the consistency cost that buys.

---

## 2. State

All persistent state lives in `chrome.storage.sync` (roams with the Chrome
profile), except the user's uploaded image, which is far past sync's per-item
quota and lives in `chrome.storage.local`.

`DEFAULTS` in `background.js`:

| Key | Meaning |
|---|---|
| `activeTheme` | Theme id, or the two synthetic ids `__company` / `__custom` |
| `pro` | Paid or company-unlocked |
| `licenseKey`, `activationId` | Polar licence + this device's activation |
| `unlockedThemes` | Mirror of the entitled catalogue (informational; nothing gates on it today) |
| `installedAt` | Trial clock origin |
| `companyCode`, `companyConfig` | B2B branding, fetched from a remote JSON |
| `trialWasActive`, `trialEndPromptShown` | So the end-of-trial page shows exactly once |
| `themesApplied`, `reviewPromptShown` | Review-nudge heuristics |
| `proGraceUntil` | Dunning grace deadline after a failed renewal |
| `favourites` | Theme ids, newest first (written by the popup) |
| `themeSpeed` | 0.10–1.0 global animation speed |
| `customBg` *(storage.local)* | `{ data, colors, fit, drift, alpha, name }` |

`GET_STATE` is the single read path. It does not just return storage — it
**derives** entitlement on every call, and repairs state as a side effect:

1. Compute trial status from `installedAt` (7 days).
2. `entitled = pro || trialActive || hasCompanyConfig`.
3. If not entitled and a Pro theme is applied → force `activeTheme = 'default'` and
   broadcast that to every open tab.
4. Surface `graceActive` / `graceDaysLeft` so the popup can warn before access ends.
5. Open the trial-ended page once, deduped per worker lifetime via `globalThis`.

---

## 3. Entitlement, licensing and the trial

### Trial (7 days)

`installedAt` starts the clock. Because a reinstall would reset extension storage,
the content script also writes a `vellum_trial_started` timestamp into the
**site's** `localStorage` on claude.ai / chatgpt.com. That storage survives an
uninstall, so `TRIAL_MARKER` can pull `installedAt` *earlier* on reinstall.

The marker is deliberately one-directional and fail-open: it can only move the
trial start backwards, and a missing, blocked or garbage marker behaves exactly
like a fresh install. Nothing is ever transmitted.

### Licence keys (Polar.sh)

Checkout URLs are in `options/options.js` and `welcome/welcome.js`. Validation
never talks to Polar directly — it goes through a Cloudflare Worker
(`LICENSE_API`) that injects the Polar org id server-side, so no org secret ships
in the extension. Three endpoints: `POST /activate`, `POST /validate`,
`POST /deactivate`.

`VERIFY_LICENSE` branches on whether an `activationId` already exists: first run
activates (and requires a returned `id` — a 422 error body must never grant Pro),
subsequent runs validate.

### Revalidation and dunning grace

A subscription can be cancelled after activation, so an alarm
(`vellum-revalidate`, every 12 h, plus `onStartup` and `onInstalled`) re-checks.
The status handling is asymmetric on purpose:

- `200 granted` → Pro on, `proGraceUntil` cleared, `unlockedThemes` refreshed.
  This is also the auto-recovery path for a customer who fixed their card.
- `403` → explicitly not granted.
- `404` / `5xx` / network failure → **ambiguous, keep Pro** and retry next cycle.
  An outage must never lock out a paying customer.

When not granted, Vellum does not cut access. It opens a **14-day grace window**
(`GRACE_DAYS`), because the usual cause is a card retry in flight rather than a
cancellation. Only when the window expires does it downgrade — and even then it
*keeps* the key, so a later successful payment restores Pro automatically.
Opening the popup while in grace triggers an immediate re-check rather than
waiting up to 12 h.

### Company / team codes (B2B)

A code resolves to `{COMPANY_CONFIG_BASE}/{CODE}.json` — a static file on a
worker. `normalizeCompanyConfig()` accepts either shape:

```jsonc
{ "company": "Acme Corp",
  "colors": { "bg":"#0a0a0a", "surface":"#141414", "accent":"#ff5500",
              "text":"#ffffff", "border":"#222222" },
  "logo": "https://acme.example/logo.png",   // optional
  "style": "network" | "artwork",             // optional animated style
  "art":   { "url": "…", "artAlpha": 1, "drift": 9 } }
```

…or `{ company, backgrounds: [ … ] }` for several branded backgrounds the user can
switch between. The code *is* the entitlement: applying one sets `pro: true`.

The config is re-fetched on the same 12 h tick, so an admin can change colours,
art or logo by editing the worker alone — no store release, nobody re-enters the
code. That refresh fails safe in every direction: network error, 404, malformed
JSON or a config with no usable background all leave the stored copy untouched, so
a bad deploy can never strand a user on no theme at all.

### Where the gate actually is

The popup's lock icons are UX only. The real gate is in the `SET_THEME` handler in
the service worker: it recomputes entitlement and rewrites the theme to `default`
if a gated id (`ALL_PRO` or `__custom`) is requested without entitlement. A
hand-crafted message cannot persist a Pro theme.

---

## 4. Rendering

### `applyTheme(themeId)` → `applyThemeInner(themeId, theme)`

`applyTheme` resolves the two synthetic ids first — `__company` reads
`companyConfig` from sync, `__custom` reads `customBg` from local and adapts it
into an `artwork`-style theme — then everything funnels into `applyThemeInner`.

`applyThemeInner` tears down completely before it builds: removes the old
`<style>`, cancels the RAF, removes the canvas, and runs every hook pushed onto
`window._vellumCleanup` (resize listeners, timers, observers, the dock loop).
Every engine that adds a listener is responsible for pushing its own undo.

Then it writes one large `<style id="vellum-styles">` that:

- Overrides Claude's design tokens (`--bg-000` … `--bg-400`, text, border, accent).
- Sets `#vellum-canvas` as a fixed, `z-index:0`, `pointer-events:none` layer.
- Elevates top-level containers above the canvas.
- Themes the send button, links, selection and scrollbars.
- Styles the preview toast.
- Appends a **ChatGPT-only** block (`chatgptDock`) — see below.

Finally: `startAnimation()`, optional company logo injection, and the dock canvas
for animated themes.

### The canvas

One full-viewport `<canvas id="vellum-canvas">` sized from
`documentElement.clientWidth/Height` (excludes scrollbars, so the buffer never
stretches). Three guards keep it alive in a React SPA:

1. A `resize` listener, plus a re-measure on the next frame and again at 350 ms,
   because applying a theme mid-session changes layout and can add/remove a
   scrollbar after the first measurement.
2. A `MutationObserver` on `<body>` that re-appends the canvas if React strips it
   (ChatGPT's `?mweb_fallback` layout does exactly this). The RAF loop keeps
   drawing to the detached canvas, so re-attaching restores it live.
3. A `MutationObserver` on `location.href` re-applies the theme 400 ms after a
   client-side route change.

### The dock canvas

The composer sits in the same scroll layer as the messages, so the animated
background cannot simply be revealed behind it — message text would bleed through.
Instead a second small canvas is inserted as the composer's first child (above
messages, behind the input) and each frame copies the matching screen-region of
the main canvas with `drawImage(canvas, r.left, r.top, w, h, 0, 0, w, h)`. The
strip therefore matches the moving background 1:1.

Details that matter: the host gets `isolation:isolate` and, if it computes to
`position:static`, `position:relative` (recorded in `dataset.vellumPos` so teardown
only undoes what Vellum set) — without a containing block the absolute canvas
escapes to a distant ancestor and adds a stray scrollbar. The top edge is faded out
with a `destination-out` gradient across the host's own `padding-top`, so text
dissolves as it reaches the box instead of being cut by a hard line.

Still themes (a company config with no `style`) skip all of this and use a solid
dock fill instead, which matches exactly.

### Self-heal and elevation

Claude and ChatGPT ship a handful of page-chrome colours as literal hex rather
than tokens — the header scrim, the composer fade, the selected sidebar row. No
variable override can reach those, so `vellumSweep()` hunts them directly.

The property that makes a sweep like this safe is **exact colour matching**: an
element is only touched when its computed background is one of six known literals
(`VELLUM_CHROME`). A theme colour, a message bubble or a code block never matches,
so it cannot silently flatten content the way a broad "kill opaque backgrounds"
rule would. Interactive and content surfaces (`VELLUM_KEEP`) are exempt even when
they do match, elements under 120×16 px are skipped, and the walk has a hard
ceiling of 4000 nodes.

`vellumElevate()` is the companion: `z-index` does nothing on a static element, so
still-static `body > div` / `body > main` get `position:relative`. It reads the
computed position first, so anything already absolute or fixed keeps its own
positioning and stays out of flow — putting it back in flow is what created
phantom scroll room in an earlier approach.

Both run after the theme lands (600 ms, 2000 ms), on any DOM mutation (debounced
250 ms) and after route changes.

### Excluded pages

`isExcludedPage()` matches `/codex` paths. On those Vellum strips itself entirely
and re-applies automatically when you leave.

---

## 5. Speed (`vellumDt`)

The slider does not drop or blend frames. Every engine multiplies its own movement
by the global `vellumDt`, so a frame carries a *fraction of a step* — real slow
motion, every frame rendered and every frame different. The earlier approach could
only choose between showing a frame twice (judder — measured at 89 repeats in 119
frames at quarter speed) or cross-dissolving (a fixed ghost at every setting).

```
vellumDt = vellumSpeed × vellumBase
```

- `vellumSpeed` — the slider, clamped to 0.10–1.0, read from `themeSpeed` in sync
  storage and updated live through `chrome.storage.onChanged`.
- `vellumBase` — a per-theme constant from `VELLUM_BASE`, set when the theme
  starts. Measured at 1280×800, a typical theme scores 0.3–1.6 on frame-to-frame
  change and a handful score 5–18 (moire is roughly 25× busier than koi). Those
  are not fast settings, they are engines whose authored speed was never reined
  in. So **100% means "the speed this theme should run at"**, and anything not
  listed runs exactly as authored.

### `vellumFade(a)` — the trail-fade correction

Canvas trail fades are applied once per *frame*, so at a low `dt` they compound far
more often per unit of world time: trails thin out while heads stay fully
repainted (matrix went blobby, fireworks went sparse). The naive correction
`1 - (1-a)^dt` keeps trail length constant per unit of world time, but canvas is
8-bit and a fill under roughly 0.10 alpha rounds its decrement to zero — 0.11 at
15% speed becomes 0.017, the trail never clears and every frame accumulates.

So `vellumFade` takes the corrected value but never goes under a `0.12` floor and
never fades faster than the engine already does at full speed:

```js
Math.max(Math.min(a, 0.12), 1 - Math.pow(1 - a, vellumDt))
```

Engines whose fade already sits near the floor are left alone.

---

## 6. The theme catalogue

**250 themes: 31 free, 219 Pro.** A theme id appears in five places, and all five
must agree — `scripts/verify.js` checks this, and `docs/ADDING-A-THEME.md` walks
through it.

| Where | What it holds |
|---|---|
| `background.js` → `ALL_FREE` / `ALL_PRO` | Entitlement. This is the authority. |
| `content/inject.js` → `THEMES` | The 5-colour palette (`bg`, `surface`, `accent`, `text`, `border`). |
| `content/inject.js` → engine fn + `fns` dispatch | The animation itself. |
| `popup/popup.js` → `THEMES` | Display name, catalogue number, section, `free`, `isNew`. |
| `popup/popup.html` → `.pv-<id>` | The CSS gradient swatch shown in the grid. |

Sections: Favourites, New, All, Free (hidden once entitled), Space, City, Cyber,
Seasonal, Nature, Weather, Fire, Retro, Minimal, Abstract, Ambient, Geometric,
Audio.

### Engine shape

Every engine is `function name(cv, cx)` — canvas element, 2D context — and follows
the same contract:

```js
function example(cv, cx) {
  let W = 0, H = 0, t = 0, things;
  function build() { W = cv.width; H = cv.height; /* seed state */ }
  build();
  function f() {
    if (cv.width !== W || cv.height !== H) build();   // re-seed on resize
    cx.fillStyle = 'rgba(0,0,0,' + vellumFade(0.11) + ')';
    cx.fillRect(0, 0, W, H);
    things.forEach(p => { p.y += p.speed * vellumDt; });   // every motion × dt
    t += vellumDt;
    raf = requestAnimationFrame(f);                   // module-level `raf`
  }
  f();
}
```

Rules that hold across all 250: motion is multiplied by `vellumDt`, trail fades go
through `vellumFade`, the RAF handle is assigned to the module-level `raf` (so
`applyThemeInner` can cancel it), a size change re-seeds via `build()`, and any
listener registers an undo on `window._vellumCleanup`.

Shared helpers for the calm/minimal engines: `pool()` (a drifting radial light
source), `grainTile()` / `grainPass()` (one baked tile of sensor grain blitted at a
moving offset — animated grain regenerated per frame is far too expensive),
`vellumTick()` and `vellumPush()`.

### Two synthetic themes

- `__company` → `companyBackground()`, which dispatches on `style`:
  `network` → `companyNetwork()`, `artwork` (alias `ledgebrook`) →
  `companyArtwork()`, anything else → a flat fill.
- `__custom` → the user's uploaded image, run through `companyArtwork()`.

`companyArtwork` composites a real image file rather than replaying its
primitives — masks, filters and gradient fills are not worth re-implementing when
the browser renders them perfectly, and it makes artwork a *config* concern rather
than a release concern. `crossOrigin` is mandatory rather than defensive: the dock
canvas copies pixels from the main canvas, and a tainted canvas throws on that
read and kills the composer strip.

---

## 7. The popup

- **Sections + search.** Search spans the whole catalogue regardless of the section
  you are standing in, matching name-prefix first, then name/id/section-label
  substrings, then a `KEYWORDS` map for words that appear in no theme name
  (`japan`, `oled`, `scifi`, `christmas`, `games`, `purple`…). The query is
  inserted with `textContent`, never as markup.
- **Favourites.** Stored in sync, newest first, pruned on load against the live
  catalogue so a removed theme cannot leave a dead sidebar count.
- **Preview.** Clicking a locked theme applies it for 3 s. The revert timer lives
  in the *service worker*, not the popup, so closing the popup mid-preview still
  reverts. `beforeunload` also fires an immediate revert.
- **The preview toast** countdown bar is driven in JS, not CSS keyframes: Claude
  ships `prefers-reduced-motion` rules that complete keyframes instantly, which is
  why the bar animated on ChatGPT and not on Claude. A width change is not an
  animation.
- **Badges.** Free *and* trial users see the "Pro" tag (trial users should see what
  they are paying for); paid and team users do not. Only free users get the dimmed
  lock state.
- **Speed slider** sits on the site row, which already had empty space, so it costs
  no height. Writes are debounced 200 ms.
- **Screenshot** goes through `CAPTURE` → `chrome.tabs.captureVisibleTab`, which
  works off the `activeTab` grant the popup already has — no broad host permission.
- **Banners.** Billing grace (with a link to Polar purchases) and a review nudge
  that only appears after 3 days *or* 10 theme applications, never for team users,
  and only once.

---

## 8. The options page

Account (checkout, licence key, refresh, sign out), company code, help — plus the
custom background uploader.

The uploader downscales to a 2560 px longest edge and re-encodes to WebP at 0.86
quality, keeping whichever of WebP/original is smaller, because phone originals
are routinely 4–8 MB against a 10 MB `storage.local` budget. SVG is passed through
untouched so it stays vector-sharp.

`cbgPalette()` samples the image at 64×64 and derives a five-colour palette so the
sidebar, composer and text sit *with* the picture: the page colour comes from a
fifth of the way into the dark tones (darker than average, but not the single
darkest pixel, which is usually noise or a border) and is then deepened 35 % toward
black so text reads; the accent is the pixel scoring highest on saturation × 
brightness; text is picked for contrast against the resulting page colour.

---

## 9. Permissions

| Permission | Why |
|---|---|
| `storage` | All state above. |
| `activeTab` | Screenshot capture, granted by the popup click. |
| `alarms` | The 12 h licence/company revalidation tick. |
| `host_permissions` | The three chat hosts, plus the licence worker and the company-config worker. |

Content scripts run at `document_idle` on the three chat hosts. `icons/*` is the
only web-accessible resource.

---

## 10. Failure modes, by design

| Situation | Behaviour |
|---|---|
| Licence server down / 5xx / offline | Keep Pro, retry in 12 h. |
| Payment failing | 14-day grace, warned in the popup, auto-restored on recovery. |
| Grace expired | Downgrade, but keep the key so recovery is automatic. |
| Company config 404 / malformed / bad deploy | Keep the stored copy; never strand the user. |
| Trial marker missing, blocked or corrupt | Behave like a fresh install (fail open). |
| React strips the canvas | MutationObserver re-appends it; the loop never stopped. |
| Site storage blocked | Trial still works, just without reinstall protection. |
| A page adds a new hard-coded chrome colour | Sweep catches it if it is in `VELLUM_CHROME`; otherwise it needs a new literal. |
