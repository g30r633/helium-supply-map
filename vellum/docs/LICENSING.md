# Licensing, trial and company codes

Three ways to be entitled, checked in `background.js`:

```js
entitled = pro || trialActive || hasCompanyConfig
```

`pro` comes from a Polar licence key or a company code; `trialActive` is derived
from `installedAt`. The popup's lock icons are presentation only — the real gate
is the `SET_THEME` handler in the service worker, which rewrites a gated theme id
to `default` when the request is not entitled.

---

## The 7-day trial

`installedAt` is set on install and is the only input. `getTrialStatus()` returns
`{ trialActive, trialDaysLeft }`, and days-left is rounded up so the last partial
day still reads as a day.

### Why the trial survives a reinstall

Uninstalling clears extension storage, so a reinstall would hand out a fresh
trial. The content script therefore mirrors the trial start into the **site's**
`localStorage` under `vellum_trial_started` on claude.ai / chatgpt.com — storage
that belongs to the site and survives an uninstall.

On every page load the content script sends `TRIAL_MARKER` with whatever it found.
The handler is one-directional and fail-open by construction:

- A valid marker older than `installedAt` pulls `installedAt` **earlier** — this
  restores a trial that already happened.
- A missing, blocked, non-numeric, negative or future marker is ignored entirely,
  so it can never block a new user or shorten a legitimate trial.
- The response tells the content script to pin the site marker to the earliest
  known start date.

Nothing is transmitted anywhere. This is entirely local.

### End of trial

`trialWasActive` records that a trial genuinely ran. When it lapses and the user
is neither Pro nor company-unlocked, `welcome/trial-ended.html` opens exactly
once (`trialEndPromptShown`, plus a `globalThis` dedupe so one worker lifetime
cannot open two tabs). At the same time `GET_STATE` reverts any applied Pro theme
to `default` and broadcasts that to every open tab.

---

## Polar licence keys

Checkout URLs live in `options/options.js` and `welcome/welcome.js`
(`CHECKOUT_URLS.monthly` / `.lifetime`).

The extension never calls Polar directly. `LICENSE_API` points at a Cloudflare
Worker that injects the Polar organisation id server-side, so no org secret ships
in a file anyone can unzip.

| Endpoint | When |
|---|---|
| `POST /activate` `{ key, label }` | First activation on this device. Must return `{ id }` — anything else (e.g. a 422 validation body) must not grant Pro. |
| `POST /validate` `{ key, activation_id }` | Every check after that. |
| `POST /deactivate` `{ key, activation_id }` | Sign out, freeing the device slot. |

Device label is `vellum-<random>` so a customer can tell activations apart in
their Polar dashboard.

Errors surfaced to the user: `404` → "License key not found"; `403` on activate →
"Device limit reached. Deactivate another device first."

## Revalidation

A subscription can be cancelled after activation, so `chrome.alarms` runs
`vellum-revalidate` every 12 h, and revalidation also fires on `onInstalled` and
`onStartup`. It runs whenever a key is held — including after a downgrade, which
is what makes recovery automatic rather than something the customer has to
re-enter a key for.

Response handling is deliberately asymmetric:

| Response | Action |
|---|---|
| `200 { status: 'granted' }` | Pro on, `proGraceUntil` cleared, `unlockedThemes` refreshed to the current catalogue. |
| `403` | Treated as explicitly not granted → grace path below. |
| `404`, `5xx`, network failure | **Ambiguous. Keep Pro.** Retry next cycle. |

An outage must never lock out a paying customer, so ambiguity always resolves in
the customer's favour.

`unlockedThemes` is rewritten on every successful check, not only on the
transition into Pro: it was written from `ALL_THEMES` as it stood at the time, so
a subscriber from an older release otherwise carries a short list forever.
Nothing gates on it today — entitlement is `pro`/trial/company — but a stale list
is a trap for whoever does start reading it.

## Dunning grace (14 days)

When a check comes back not-granted, the usual cause is a failed card payment that
Polar is still retrying, not a cancellation. Cutting access immediately would
punish someone whose payment is about to succeed.

1. First failure → set `proGraceUntil = now + 14 days`. Pro stays on.
2. Inside the window → keep Pro. The popup shows a billing banner with days
   remaining and a link to `polar.sh/purchases`.
3. Recovery at any point → `granted` clears `proGraceUntil` and restores Pro.
4. Window expires → downgrade: `pro: false`, `unlockedThemes: ALL_FREE`, and any
   applied Pro theme reverts to `default`. **The key is kept**, so a later
   successful payment restores Pro on the next check with no user action.

Opening the popup while in grace triggers an immediate revalidation instead of
waiting up to 12 h — opening the popup is the natural thing to do right after
fixing a card. The manual **Refresh** button in the options page honours exactly
the same grace rules: it can never cut someone off early or wipe their key.

---

## Company / team codes

A code resolves to `{COMPANY_CONFIG_BASE}/{CODE}.json`, a static file. Any static
host works — Cloudflare Pages/Workers, GitHub Pages, S3, Netlify. The code *is*
the entitlement: applying one sets `pro: true` and unlocks the full catalogue
alongside the branded background.

### Config schema

Single background:

```json
{
  "company": "Acme Corp",
  "colors": {
    "bg": "#0a0a0a", "surface": "#141414", "accent": "#ff5500",
    "text": "#ffffff", "border": "#222222"
  },
  "logo": "https://acme.example/logo.png"
}
```

Several backgrounds the user can switch between:

```json
{
  "company": "Acme Corp",
  "backgrounds": [
    { "name": "Dark",    "colors": { "bg": "#0a0a0a", "accent": "#ff5500", "text": "#ffffff" } },
    { "name": "Network", "colors": { "bg": "#04121f", "accent": "#3aa0ff", "text": "#eaf4ff" },
      "style": "network" },
    { "name": "Hero",    "colors": { "bg": "#050b14", "accent": "#5ec8ff", "text": "#eaf4ff" },
      "style": "artwork",
      "art": { "url": "https://acme.example/hero.svg", "artAlpha": 1, "drift": 9 } }
  ]
}
```

Only `colors.bg` is required per background; `surface`, `accent`, `text` and
`border` fall back sensibly. `normalizeCompanyConfig()` accepts both shapes and
always produces the same internal form, with the active background mirrored onto
the top level for the content script.

`style` values: absent → flat fill; `"network"` → animated node/edge field;
`"artwork"` → composite a real image file (alias `"ledgebrook"` is kept so
already-deployed configs keep working).

### Artwork configs

`companyArtwork` draws the company's actual file rather than replaying its
primitives. Reproducing a hero by replaying its shapes gets close and is still
wrong — SVG masks, filters and gradient fills are not worth re-implementing when
the browser renders them perfectly — and pointing at the file makes artwork a
config concern, so a new company needs no extension release.

**The host must send `Access-Control-Allow-Origin`.** `crossOrigin` here is not
defensive: the dock canvas copies pixels from the main canvas, and a tainted
canvas throws on that read and takes the composer strip down with it.

### Refresh

The config is re-fetched on the same 12 h alarm, and by the **Check for updates**
button in the options page. That means an admin changes colours, art, the logo or
the number of backgrounds by editing the hosted JSON alone — no store release, and
nobody has to re-enter the code.

The refresh fails safe in every direction. A network error, a 404, malformed JSON,
or a config with no usable background all leave the stored copy untouched, so a
bad deploy or an offline laptop can never strand someone on no theme at all. The
user's chosen `activeIndex` is preserved unless the company removed that
background, in which case it clamps into range.
