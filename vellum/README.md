# Vellum

250 hand-built animated backgrounds and dark modes for **Claude** and **ChatGPT**.
A Manifest V3 Chrome extension. Everything renders locally on a canvas — no
telemetry, no tracking, no account beyond a licence key.

- 250 themes: **31 free**, **219 Pro**, across 14 categories
- Live preview, favourites, catalogue-wide search, a global speed control
- Your own image as a background (Pro)
- Company/team codes for branded backgrounds, configured remotely

Current version: **1.9.0**

## Layout

```
vellum/
├── extension/        the extension itself — load this folder unpacked
│   ├── manifest.json
│   ├── background.js         service worker: state, entitlement, licensing
│   ├── content/inject.js     CSS injection + 250 canvas engines (~23.5k lines)
│   ├── popup/                theme browser
│   ├── options/              account, company code, custom background
│   ├── welcome/              install and end-of-trial pages
│   └── icons/
├── ARCHITECTURE.md   how the whole thing fits together — start here
├── docs/
│   ├── THEMES.md            the catalogue, sections, free/Pro split
│   ├── LICENSING.md         trial, Polar, grace periods, company codes
│   └── ADDING-A-THEME.md    the five registries a new theme touches
└── scripts/
    ├── verify.js     cross-check the five theme registries
    └── build.sh      produce a Web Store zip
```

## Run it locally

1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → select `vellum/extension`
3. Open `claude.ai` or `chatgpt.com`, click the Vellum icon, pick a theme

Reload the extension from `chrome://extensions` after editing `background.js` or
the manifest. Editing `content/inject.js` only needs a page refresh; editing the
popup only needs the popup reopened.

## Checks and packaging

```bash
node vellum/scripts/verify.js     # all five theme registries agree
bash vellum/scripts/build.sh      # → dist/vellum-<version>.zip
```

`verify.js` is the one that matters. A theme id lives in five separate places
because MV3 content scripts are classic scripts and cannot share a module, so a
half-added theme is the most likely way to break the catalogue — it fails loudly
instead.

## Backend

Two services sit behind the extension, neither of which is in this repo:

- **Licence worker** (`vellum-license.gameitorium35.workers.dev`) — a Cloudflare
  Worker fronting Polar.sh with `/activate`, `/validate`, `/deactivate`. It
  injects the Polar org id server-side so no secret ships in the extension.
- **Company config host** (`weathered-pond-d21a.gameitorium35.workers.dev`) —
  serves `{CODE}.json` as a static file. See `docs/LICENSING.md` for the schema.

Checkout URLs (Polar) are in `extension/options/options.js` and
`extension/welcome/welcome.js`.

## Where to start reading

`ARCHITECTURE.md` §1 for the four processes, then §4 for how a theme actually
reaches the screen, then §5 for the speed system — that one is the least obvious
part of the codebase and the reason the animations behave under a slider at all.
