// Vellum background service worker

const ALL_FREE = ['default','graphite','sage','oat','slate','drift','carbon','plum','mocha','ember','fog','pine','breathing','driftclouds','linen','tide','dusk','ash','moss','snake','paddle','skyline','snowglobe','hexgrid','merge','equalizer','moonphases','torchlight','inkdrop','biobay','hazard'];
const ALL_PRO  = ['sakura','aurora','midnight','matrix','forest','synthwave','inferno','galaxy','glacier','vapor','velvet','ocean','neon','cosmos','dino','stardust','constellation','rainfall','fireflies','lava','nebula','storm','mountains','lantern','vortex','origami','halo','twilight','petal','supernova','raindrop','northern','embers','snowfall','bokeh','meteor','abyss','plasma','sandstorm','prism','blackhole','jellyfish','glitch','koi','lightning','kaleidoscope','eclipse','coral','sunset','candlelight','outrun','liquidmarble','aquarium','lavalamp','silk','wisp','meadow','phoenix','forge','plankton','lumina','hologram','crt','dustmotes','autumn','waterfall','starfall','comet','ripple','bloom','frost','flappy','chomp','stacker','invaders','asteroid','bricks','sweeper','cascade','neonalley','traffic','subway','rooftop','crosswalk','harbour','streetlamp','billboard','metromap','skyscraper','nightdrive','halloween','pumpkin','fireplace','fireworks','lunar','valentine','blossom','easter','beach','harvest','wintersky','tessellation','penrose','spirograph','isometric','moire','truchet','voronoi','sierpinski','mandala','lissajous','fold','hopper','crawler','intercept','squadron','ascent','blast','whack','keys','helix','slither','sequence','waveform','vinyl','cassette','spectrum','sonar','scope','metronome','wormhole','saturn','solarsystem','milkyway','satellite','bamboo','dunes','redwood','lilypond','butterfly','mushroom','vines','hurricane','hail','heatwave','rainbow','monsoon','bonfire','wildfire','sparks','cabinet','vhs','pixelrain','gameboy','papergrain','slowwave','singleline','fade','contour','staticnoise','smoke','fluid','metaballs','refraction','shatter','lanternfloat','moths','deepsea','godray','rainwindow','nightcity','netrunner','chromed','braindance','glyphs','trace','datastream','overload','corpo','ripperdoc','blackwall','torii','giza','ringworld','heaven','onyx','zen','ukiyo','teahouse','turntable','meterbridge','patchbay','stack','reels','keybed','murmuration','girih','datacenter','frostwork','coals','virga','pulsar','kelp','quasicrystal','windchime','laundry','thunderhead','apollonian','hilbert','sentry','decrypt','foundry','flare','icicles','garland','onsen','strings','loom','contrail'];
const ALL_THEMES = [...ALL_FREE, ...ALL_PRO];

// License checks go through your own Cloudflare Worker (vellum-license-worker),
// which injects the Polar org id server-side — so it's never shipped in the
// extension. TODO: replace with the URL `wrangler deploy` gives you.
const LICENSE_API = 'https://vellum-license.gameitorium35.workers.dev';

// Opened when someone uninstalls — a 1-question Google Form so you learn why.
const UNINSTALL_FEEDBACK_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc_o_w_VFExsg91zsxVHtyG4lERXLJmwejY19hG9MJBdW0lmg/viewform';

// ── COMPANY / TEAM CODES (B2B) ──────────────────────────────
// Each company code resolves to a JSON config hosted at:
//   {COMPANY_CONFIG_BASE}/{CODE}.json
// Host these as static files (Cloudflare Pages, GitHub Pages, S3, Netlify…).
// Example config file (ACME2026.json):
//   { "company": "Acme Corp",
//     "colors": { "bg":"#0a0a0a","surface":"#141414","accent":"#ff5500","text":"#ffffff","border":"#222222" },
//     "logo": "https://acme.example/logo.png" }   // logo is optional
// Static host serving {COMPANY_CONFIG_BASE}/{CODE}.json
const COMPANY_CONFIG_BASE = 'https://weathered-pond-d21a.gameitorium35.workers.dev';

const TRIAL_DAYS = 7;
const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

// Dunning grace. A failed card payment makes Polar stop reporting "granted" while it
// is still retrying — cutting the customer off immediately would punish someone whose
// payment is about to succeed. Hold Pro for this long after the first failed check,
// then downgrade. Recovery at any point clears it.
const GRACE_DAYS = 14;
const GRACE_MS = GRACE_DAYS * 24 * 60 * 60 * 1000;

const DEFAULTS = {
  activeTheme: 'default',
  pro: false,
  licenseKey: null,
  activationId: null,
  unlockedThemes: ALL_FREE,
  installedAt: null,
  companyCode: null,
  companyConfig: null,
  trialWasActive: false,      // user has experienced the trial at least once
  trialEndPromptShown: false, // the "trial ended" page has been shown once
  themesApplied: 0,           // how many times a theme was applied (review trigger)
  reviewPromptShown: false,   // the review nudge has been shown/dismissed once
  proGraceUntil: null         // set when a payment check first fails; Pro held until then
};

function broadcastTheme(theme) {
  chrome.tabs.query({ url: ['https://claude.ai/*','https://chatgpt.com/*','https://chat.openai.com/*'] }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { type: 'THEME_CHANGED', theme }).catch(() => {});
    });
  });
}

function getTrialStatus(installedAt) {
  if (!installedAt) return { trialActive: false, trialDaysLeft: 0 };
  const elapsed = Date.now() - installedAt;
  if (elapsed < TRIAL_MS) {
    const daysLeft = Math.ceil((TRIAL_MS - elapsed) / (24 * 60 * 60 * 1000));
    return { trialActive: true, trialDaysLeft: daysLeft };
  }
  return { trialActive: false, trialDaysLeft: 0 };
}

chrome.runtime.onInstalled.addListener(async (details) => {
  const existing = await chrome.storage.sync.get(Object.keys(DEFAULTS));
  const merged = { ...DEFAULTS, ...existing };
  if (!merged.installedAt) merged.installedAt = Date.now();
  // If user had 'paper' selected (now removed), reset to default
  if (merged.activeTheme === 'paper') merged.activeTheme = 'default';
  await chrome.storage.sync.set(merged);
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome/welcome.html') });
  }
  ensureRevalidationAlarm();
  revalidateLicense();
  chrome.runtime.setUninstallURL(UNINSTALL_FEEDBACK_URL);
});

// ── LICENSE RE-VALIDATION ───────────────────────────────────
// Monthly subscriptions can be cancelled. Once a key is activated we must keep
// re-checking it with Polar and revoke Pro if it's no longer granted — but stay
// Pro through outages/ambiguous errors so a paying customer is never wrongly
// locked out by a transient failure.
const REVALIDATE_ALARM = 'vellum-revalidate';

function ensureRevalidationAlarm() {
  chrome.alarms.create(REVALIDATE_ALARM, { periodInMinutes: 720 }); // every 12h
}

// Normalise a company JSON into the shape the rest of the extension expects.
// Shared by first-time verification and by the refresh below — they used to be the
// same logic written twice, which is exactly how the two drift apart.
// Supports either { company, colors, logo } or { company, backgrounds: [...] }.
function normalizeCompanyConfig(config, activeIndex) {
  let backgrounds = [];
  if (config && Array.isArray(config.backgrounds)) {
    backgrounds = config.backgrounds
      .map((b, i) => ({ name: b.name || ('Background ' + (i + 1)), colors: b.colors,
                        logo: b.logo || null, style: b.style || null, art: b.art || null }))
      .filter(b => b.colors && b.colors.bg);
  } else if (config && config.colors && config.colors.bg) {
    backgrounds = [{ name: config.name || config.company || 'Background', colors: config.colors,
                     logo: config.logo || null, style: config.style || null, art: config.art || null }];
  }
  if (!backgrounds.length) return null;
  // keep the background the user picked, unless the company removed it
  const i = Math.max(0, Math.min(backgrounds.length - 1, activeIndex | 0));
  const active = backgrounds[i];
  return {
    company: (config && config.company) || 'Your company',
    backgrounds,
    activeIndex: i,
    colors: active.colors,   // mirror the active background for the content script
    logo: active.logo,
    style: active.style || null,
    art: active.art || null
  };
}

// Re-fetch the company config so an admin can change colours, art, the logo or the
// number of backgrounds by editing the worker alone — no store release, and nobody
// has to re-enter the code. Without this the JSON is read exactly once, the day the
// code is entered, and is then frozen in that browser forever.
//
// Fails safe in every direction: a network error, a 404, malformed JSON or a config
// with no usable background all leave the stored copy untouched, so a bad deploy or
// an offline laptop can never strand someone on no theme at all.
function refreshCompanyConfig(done) {
  chrome.storage.sync.get(['companyCode', 'companyConfig', 'activeTheme'], (s) => {
    if (!s.companyCode) { if (done) done({ ok: false, reason: 'no code' }); return; }
    fetch(`${COMPANY_CONFIG_BASE}/${encodeURIComponent(s.companyCode)}.json`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)))
      .then(config => {
        const keep = (s.companyConfig && s.companyConfig.activeIndex) | 0;
        const next = normalizeCompanyConfig(config, keep);
        if (!next) return Promise.reject(new Error('no usable background'));
        const changed = JSON.stringify(next) !== JSON.stringify(s.companyConfig);
        if (!changed) { if (done) done({ ok: true, changed: false }); return; }
        chrome.storage.sync.set({
          companyConfig: next,
          pro: true,                 // the code is the entitlement; keep it in step
          unlockedThemes: ALL_THEMES
        }, () => {
          if (s.activeTheme === '__company') broadcastTheme('__company');
          if (done) done({ ok: true, changed: true });
        });
      })
      .catch(err => {
        console.warn('[Vellum] company config refresh failed, keeping the stored copy:', err.message);
        if (done) done({ ok: false, reason: err.message });
      });
  });
}

function revalidateLicense() {
  chrome.storage.sync.get(['pro', 'licenseKey', 'activationId', 'activeTheme', 'companyConfig', 'proGraceUntil'], (s) => {
    // Re-validate whenever we hold a key — including after a downgrade, so that a
    // customer who fixes their card is restored automatically on the next check
    // instead of having to re-enter the key by hand.
    if (!s.licenseKey || !s.activationId) return;
    if (s.companyConfig && s.companyConfig.colors) return;

    fetch(`${LICENSE_API}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: s.licenseKey, activation_id: s.activationId })
    })
    .then(res => {
      if (res.ok) return res.json();          // 200 → trust the status field
      if (res.status === 403) return { status: 'revoked' }; // explicitly not granted
      return null;                            // 404 / 5xx → ambiguous, keep Pro (grace)
    })
    .then(data => {
      if (!data) return;                      // ambiguous — keep Pro, retry next cycle

      if (data.status === 'granted') {
        // Valid. Clear any dunning grace, and restore Pro if a previous failure had
        // downgraded them — this is the auto-recovery path once a card goes through.
        const w = {};
        if (!s.pro) w.pro = true;
        // Always refresh the unlocked list, not just on the transition into Pro. It is
        // written from ALL_THEMES at the time it ran, so a subscriber from an older
        // release carries a shorter list than the catalogue. Nothing gates on it today
        // (entitlement is pro/trial/company), but a stale list is a trap waiting for
        // whoever does start reading it.
        w.unlockedThemes = ALL_THEMES;
        if (s.proGraceUntil) w.proGraceUntil = null;
        if (Object.keys(w).length) {
          chrome.storage.sync.set(w, () => console.log('[Vellum] License valid — Pro restored.'));
        }
        return;
      }

      // Not granted. This is usually a failed payment that Polar is still retrying,
      // not a cancellation — so start a grace window rather than cutting them off.
      const now = Date.now();
      if (!s.proGraceUntil) {
        chrome.storage.sync.set({ proGraceUntil: now + GRACE_MS }, () => {
          console.log('[Vellum] Payment issue — Pro held for ' + GRACE_DAYS + ' days.');
        });
        return;
      }
      if (now < s.proGraceUntil) return;       // still inside the window — keep Pro

      // Grace expired. Downgrade, but KEEP the key so a later successful payment
      // restores Pro automatically on the next check.
      const writes = { pro: false, unlockedThemes: ALL_FREE, proGraceUntil: null };
      if (ALL_PRO.includes(s.activeTheme)) writes.activeTheme = 'default';
      chrome.storage.sync.set(writes, () => {
        if (writes.activeTheme === 'default') broadcastTheme('default');
        console.log('[Vellum] Grace period ended — Pro revoked.');
      });
    })
    .catch(() => { /* network failure → keep Pro, retry next cycle */ });
  });
}

chrome.runtime.onStartup.addListener(() => {
  ensureRevalidationAlarm();
  revalidateLicense();
  refreshCompanyConfig();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REVALIDATE_ALARM) {
    revalidateLicense();
    refreshCompanyConfig();          // same 12h tick, no extra alarm
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.type === 'GET_STATE') {
    chrome.storage.sync.get(Object.keys(DEFAULTS), (state) => {
      const trial = getTrialStatus(state.installedAt);
      const hasCompany = !!(state.companyConfig && state.companyConfig.colors);
      const entitled = state.pro || trial.trialActive || hasCompany;
      const writes = {};

      // Remember the user actually experienced a trial (for the end-of-trial prompt)
      if (trial.trialActive && !state.trialWasActive) {
        state.trialWasActive = true;
        writes.trialWasActive = true;
      }

      if (entitled) {
        if (trial.trialActive && !state.pro && !hasCompany) state.unlockedThemes = ALL_THEMES;
      } else {
        // Trial over and not Pro/company — enforce the lock.
        state.unlockedThemes = ALL_FREE;
        // If a Pro theme is still applied, revert it everywhere.
        if (ALL_PRO.includes(state.activeTheme)) {
          state.activeTheme = 'default';
          writes.activeTheme = 'default';
          broadcastTheme('default');
        }
      }

      state.trialActive = trial.trialActive;
      state.trialDaysLeft = trial.trialDaysLeft;

      // Billing grace — surfaced so the popup can warn them before access ends.
      state.graceActive = false;
      state.graceDaysLeft = 0;
      if (state.proGraceUntil && state.pro && !hasCompany) {
        const left = state.proGraceUntil - Date.now();
        if (left > 0) {
          state.graceActive = true;
          state.graceDaysLeft = Math.max(1, Math.ceil(left / (24 * 60 * 60 * 1000)));
        }
      }

      // One-time "your trial ended" page, only for genuine trial users.
      const showEndPrompt = state.trialWasActive && !trial.trialActive &&
                            !state.pro && !hasCompany && !state.trialEndPromptShown;
      if (showEndPrompt && !globalThis._trialPromptOpened) {
        globalThis._trialPromptOpened = true;   // dedupe within this worker lifetime
        state.trialEndPromptShown = true;
        writes.trialEndPromptShown = true;
        chrome.tabs.create({ url: chrome.runtime.getURL('welcome/trial-ended.html') });
      }

      if (Object.keys(writes).length) chrome.storage.sync.set(writes);

      // If a renewal is failing, re-check now rather than waiting up to 12h for the
      // alarm — so a customer who has just paid sees Pro restored almost immediately
      // (opening the popup is the natural thing to do after fixing a card).
      if (state.graceActive) revalidateLicense();

      sendResponse(state);
    });
    return true;
  }

  if (msg.type === 'CAPTURE') {
    // Capture the visible tab. Works via the activeTab permission that's granted
    // when the user opens the popup — no broad host permission needed.
    chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        sendResponse({ ok: false, error: (chrome.runtime.lastError && chrome.runtime.lastError.message) || 'capture failed' });
        return;
      }
      sendResponse({ ok: true, dataUrl });
    });
    return true;
  }

  if (msg.type === 'START_TRIAL') {
    chrome.storage.sync.get(['installedAt'], (data) => {
      if (!data.installedAt) {
        chrome.storage.sync.set({ installedAt: Date.now() }, () => sendResponse({ ok: true }));
      } else {
        sendResponse({ ok: true });
      }
    });
    return true;
  }

  // ── TRIAL MARKER ──────────────────────────────────────
  // The content script keeps a timestamp in localStorage on claude.ai / chatgpt.com.
  // That storage belongs to the SITE, so it survives uninstalling the extension —
  // which stops a reinstall from granting a fresh trial. Nothing is ever transmitted.
  //
  // Fail-open by design: the marker can only pull the trial start EARLIER (restoring a
  // trial that already happened). A missing/garbage marker never blocks a new user.
  if (msg.type === 'TRIAL_MARKER') {
    chrome.storage.sync.get(['installedAt'], (data) => {
      const m = msg.marker;
      const marker = (typeof m === 'number' && isFinite(m) && m > 0 && m <= Date.now()) ? m : null;
      let installedAt = data.installedAt || Date.now();

      if (marker && marker < installedAt) {
        installedAt = marker;                       // a previous install already trialed
        chrome.storage.sync.set({ installedAt });
      } else if (!data.installedAt) {
        chrome.storage.sync.set({ installedAt });
      }
      // Keep the site-side marker pinned to the earliest known start date.
      sendResponse({ ok: true, writeMarker: installedAt });
    });
    return true;
  }

  if (msg.type === 'SET_THEME') {
    const broadcast = broadcastTheme;

    if (msg.preview) {
      // Store the original theme and start auto-revert timer
      if (!globalThis._previewTimer) {
        // Save what theme to revert to
        chrome.storage.sync.get(['activeTheme'], (data) => {
          globalThis._previewOriginal = data.activeTheme || 'default';
        });
      } else {
        clearTimeout(globalThis._previewTimer);
      }

      broadcast(msg.theme);

      // Auto-revert after 3.2s (slightly longer than popup animation)
      // This fires even if popup closes
      globalThis._previewTimer = setTimeout(() => {
        const original = globalThis._previewOriginal || 'default';
        broadcast(original);
        // Tell content script to hide toast
        chrome.tabs.query({ url: ['https://claude.ai/*','https://chatgpt.com/*','https://chat.openai.com/*'] }, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { type: 'HIDE_PREVIEW_TOAST' }).catch(() => {});
          });
        });
        globalThis._previewTimer = null;
        globalThis._previewOriginal = null;
      }, 3200);

      sendResponse({ ok: true, preview: true });
    } else {
      // Cancel any running preview timer
      if (globalThis._previewTimer) {
        clearTimeout(globalThis._previewTimer);
        globalThis._previewTimer = null;
        globalThis._previewOriginal = null;
      }
      chrome.storage.sync.get(['themesApplied', 'pro', 'installedAt', 'companyConfig'], (s) => {
        // Server-side entitlement gate. The popup's check is UX only — this is what
        // actually stops a hand-crafted SET_THEME from persisting a Pro theme.
        const trial = getTrialStatus(s.installedAt);
        const hasCompany = !!(s.companyConfig && s.companyConfig.colors);
        const entitled = s.pro || trial.trialActive || hasCompany;
        // __custom is the user's own uploaded background — a Pro feature, so it is
        // gated on the same entitlement as any Pro theme rather than on the theme list.
        const gated = ALL_PRO.includes(msg.theme) || msg.theme === '__custom';
        const theme = (!entitled && gated) ? 'default' : msg.theme;
        chrome.storage.sync.set({ activeTheme: theme, themesApplied: (s.themesApplied || 0) + 1 }, () => {
          broadcast(theme);
          sendResponse({ ok: true, applied: theme });
        });
      });
    }
    return true;
  }

  if (msg.type === 'VERIFY_LICENSE') {
    const key = (msg.key || '').trim();
    if (!key || key.length < 8) {
      sendResponse({ ok: false, error: 'Please enter a valid license key' });
      return true;
    }

    chrome.storage.sync.get(['activationId'], (stored) => {

      if (stored.activationId) {
        // Already activated — validate with activation_id
        fetch(`${LICENSE_API}/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, activation_id: stored.activationId })
        })
        .then(res => {
          if (res.status === 404) throw { userError: 'License key not found' };
          return res.json();
        })
        .then(data => {
          console.log('[Vellum] Validation response:', data);
          if (data.status === 'granted') {
            // Fresh activation clears any billing warning left over from a previous
            // failed renewal, so re-entering a key fully resets the account state.
            chrome.storage.sync.set({ pro: true, licenseKey: key, unlockedThemes: ALL_THEMES, proGraceUntil: null },
              () => sendResponse({ ok: true }));
          } else {
            chrome.storage.sync.set({ pro: false, licenseKey: null, activationId: null, unlockedThemes: ALL_FREE },
              () => sendResponse({ ok: false, error: 'License ' + (data.status || 'invalid') }));
          }
        })
        .catch(err => {
          console.error('[Vellum] Validation error:', err);
          if (err.userError) { sendResponse({ ok: false, error: err.userError }); return; }
          sendResponse({ ok: true });
        });

      } else {
        // First time — activate on this device
        const label = 'vellum-' + Math.random().toString(36).slice(2, 10);

        fetch(`${LICENSE_API}/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, label })
        })
        .then(res => {
          if (res.status === 404) throw { userError: 'License key not found' };
          if (res.status === 403) throw { userError: 'Device limit reached. Deactivate another device first.' };
          return res.json();
        })
        .then(data => {
          console.log('[Vellum] Activation response:', data);
          // A genuine activation always returns an activation id. Anything else
          // (e.g. a 422 error JSON) must NOT grant Pro.
          if (!data || !data.id) {
            const error = (data && (data.detail && data.detail[0] && data.detail[0].msg)) ||
                          (data && data.error) ||
                          'Could not activate this key. Double-check it and try again.';
            sendResponse({ ok: false, error });
            return;
          }
          chrome.storage.sync.set({
            pro: true,
            licenseKey: key,
            activationId: data.id,
            unlockedThemes: ALL_THEMES
          }, () => sendResponse({ ok: true }));
        })
        .catch(err => {
          console.error('[Vellum] Activation error:', err);
          if (err.userError) { sendResponse({ ok: false, error: err.userError }); return; }
          sendResponse({ ok: false, error: 'Could not reach server. Check your connection.' });
        });
      }
    });

    return true;
  }

  if (msg.type === 'REFRESH_LICENSE') {
    chrome.storage.sync.get(['licenseKey', 'activationId', 'activeTheme', 'companyConfig', 'proGraceUntil'], (s) => {
      if (s.companyConfig && s.companyConfig.colors) { sendResponse({ ok: true, status: 'company' }); return; }
      if (!s.licenseKey || !s.activationId) { sendResponse({ ok: false, error: 'No license on this device to refresh.' }); return; }

      fetch(`${LICENSE_API}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: s.licenseKey, activation_id: s.activationId })
      })
      .then(res => {
        if (res.ok) return res.json();
        if (res.status === 403) return { status: 'revoked' };
        throw new Error('network');           // 404 / 5xx → don't change anything
      })
      .then(data => {
        if (data && data.status === 'granted') {
          // Paid / recovered: restore Pro and clear the billing warning in one go.
          chrome.storage.sync.set({ pro: true, unlockedThemes: ALL_THEMES, proGraceUntil: null },
            () => sendResponse({ ok: true, status: 'granted' }));
          return;
        }
        // Not granted. Honour the same dunning grace as the background check —
        // clicking Refresh must never cut someone off early or wipe their key.
        const now = Date.now();
        if (!s.proGraceUntil) {
          chrome.storage.sync.set({ proGraceUntil: now + GRACE_MS },
            () => sendResponse({ ok: true, status: 'grace', daysLeft: GRACE_DAYS }));
          return;
        }
        if (now < s.proGraceUntil) {
          const daysLeft = Math.max(1, Math.ceil((s.proGraceUntil - now) / (24 * 60 * 60 * 1000)));
          sendResponse({ ok: true, status: 'grace', daysLeft });
          return;
        }
        const writes = { pro: false, unlockedThemes: ALL_FREE, proGraceUntil: null };
        if (ALL_PRO.includes(s.activeTheme)) writes.activeTheme = 'default';
        chrome.storage.sync.set(writes, () => {
          if (writes.activeTheme === 'default') broadcastTheme('default');
          sendResponse({ ok: true, status: 'revoked' });
        });
      })
      .catch(() => sendResponse({ ok: false, error: 'Could not reach the licensing server. Try again.' }));
    });
    return true;
  }

  if (msg.type === 'SIGN_OUT') {
    chrome.storage.sync.get(['licenseKey', 'activationId'], (stored) => {
      const done = () => {
        chrome.storage.sync.set({
          pro: false,
          licenseKey: null,
          activationId: null,
          unlockedThemes: ALL_FREE
        }, () => sendResponse({ ok: true }));
      };

      if (stored.licenseKey && stored.activationId) {
        fetch(`${LICENSE_API}/deactivate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: stored.licenseKey, activation_id: stored.activationId })
        })
        .then(() => done())
        .catch(() => done());
      } else {
        done();
      }
    });
    return true;
  }

  if (msg.type === 'VERIFY_COMPANY_CODE') {
    const code = (msg.code || '').trim();
    if (!code || code.length < 4) {
      sendResponse({ ok: false, error: 'Enter a valid company code' });
      return true;
    }

    fetch(`${COMPANY_CONFIG_BASE}/${encodeURIComponent(code)}.json`, { cache: 'no-store' })
      .then(res => {
        if (res.status === 404) throw { userError: 'Code not found. Check it and try again.' };
        if (!res.ok) throw { userError: 'Could not verify code (server error).' };
        return res.json();
      })
      .then(config => {
        const companyConfig = normalizeCompanyConfig(config, 0);
        if (!companyConfig) {
          throw { userError: 'This code is misconfigured. Contact your admin.' };
        }
        const backgrounds = companyConfig.backgrounds;
        chrome.storage.sync.set({
          companyCode: code,
          companyConfig,
          pro: true,                 // company code also unlocks all Pro themes
          unlockedThemes: ALL_THEMES,
          activeTheme: '__company'
        }, () => {
          broadcastTheme('__company');
          sendResponse({ ok: true, company: companyConfig.company, count: backgrounds.length });
        });
      })
      .catch(err => {
        console.error('[Vellum] Company code error:', err);
        if (err.userError) { sendResponse({ ok: false, error: err.userError }); return; }
        sendResponse({ ok: false, error: 'Could not reach server. Check your connection.' });
      });

    return true;
  }

  if (msg.type === 'REFRESH_COMPANY') {
    refreshCompanyConfig((r) => sendResponse(r || { ok: false }));
    return true;
  }

  if (msg.type === 'SET_COMPANY_BG') {
    chrome.storage.sync.get(['companyConfig'], ({ companyConfig }) => {
      if (!companyConfig || !Array.isArray(companyConfig.backgrounds)) {
        sendResponse({ ok: false });
        return;
      }
      const i = Math.max(0, Math.min(companyConfig.backgrounds.length - 1, msg.index | 0));
      const active = companyConfig.backgrounds[i];
      companyConfig.activeIndex = i;
      companyConfig.colors = active.colors;
      companyConfig.logo = active.logo;
      companyConfig.style = active.style || null;
      companyConfig.art = active.art || null;
      chrome.storage.sync.set({ companyConfig, activeTheme: '__company' }, () => {
        broadcastTheme('__company');
        sendResponse({ ok: true, index: i });
      });
    });
    return true;
  }

  if (msg.type === 'REMOVE_COMPANY') {
    chrome.storage.sync.set({
      companyCode: null,
      companyConfig: null,
      activeTheme: 'default'
    }, () => {
      broadcastTheme('default');
      sendResponse({ ok: true });
    });
    return true;
  }
});
