// ── THEME CATALOG ──────────────────────────────────────
// Single source of truth: id, display name, number, section, and free flag.
const THEMES = [
  { id:'default', name:'Default', num:'001', section:'minimal', free:true },
  { id:'graphite', name:'Graphite', num:'002', section:'minimal', free:true },
  { id:'sage', name:'Sage', num:'003', section:'minimal', free:true },
  { id:'oat', name:'Oat', num:'004', section:'minimal', free:true },
  { id:'slate', name:'Slate', num:'005', section:'minimal', free:true },
  { id:'drift', name:'Drift', num:'006', section:'minimal', free:true },
  { id:'carbon', name:'Carbon', num:'007', section:'minimal', free:true },
  { id:'plum', name:'Plum', num:'008', section:'abstract', free:true },
  { id:'mocha', name:'Mocha', num:'009', section:'minimal', free:true },
  { id:'ember', name:'Ember', num:'010', section:'fire', free:true },
  { id:'fog', name:'Fog', num:'011', section:'weather', free:true },
  { id:'pine', name:'Pine', num:'012', section:'nature', free:true },
  { id:'sakura', name:'Sakura', num:'013', section:'nature' },
  { id:'aurora', name:'Aurora', num:'014', section:'space' },
  { id:'midnight', name:'Midnight', num:'015', section:'space' },
  { id:'matrix', name:'Matrix', num:'016', section:'retro' },
  { id:'forest', name:'Forest', num:'017', section:'nature' },
  { id:'synthwave', name:'Synthwave', num:'018', section:'retro' },
  { id:'inferno', name:'Inferno', num:'019', section:'fire' },
  { id:'galaxy', name:'Galaxy', num:'020', section:'space' },
  { id:'glacier', name:'Glacier', num:'021', section:'nature' },
  { id:'vapor', name:'Vapor', num:'022', section:'retro' },
  { id:'velvet', name:'Velvet', num:'023', section:'abstract' },
  { id:'ocean', name:'Ocean', num:'024', section:'nature' },
  { id:'neon', name:'Neon', num:'025', section:'retro' },
  { id:'cosmos', name:'Cosmos', num:'026', section:'space' },
  { id:'dino', name:'Dino', num:'027', section:'retro' },
  { id:'stardust', name:'Stardust', num:'028', section:'space' },
  { id:'constellation', name:'Constel.', num:'029', section:'space' },
  { id:'rainfall', name:'Rainfall', num:'030', section:'weather' },
  { id:'fireflies', name:'Fireflies', num:'031', section:'ambient' },
  { id:'lava', name:'Lava', num:'032', section:'fire' },
  { id:'nebula', name:'Nebula', num:'033', section:'space' },
  { id:'storm', name:'Storm', num:'034', section:'weather' },
  { id:'mountains', name:'Mountains', num:'035', section:'nature' },
  { id:'lantern', name:'Lantern', num:'036', section:'fire' },
  { id:'vortex', name:'Vortex', num:'037', section:'abstract' },
  { id:'origami', name:'Origami', num:'038', section:'abstract' },
  { id:'halo', name:'Halo', num:'039', section:'abstract' },
  { id:'twilight', name:'Twilight', num:'040', section:'weather' },
  { id:'petal', name:'Petal', num:'041', section:'nature' },
  { id:'supernova', name:'Supernova', num:'042', section:'space' },
  { id:'raindrop', name:'Raindrop', num:'043', section:'weather' },
  { id:'northern', name:'Northern', num:'044', section:'space' },
  { id:'embers', name:'Embers', num:'045', section:'fire' },
  { id:'snowfall', name:'Snowfall', num:'046', section:'weather' },
  { id:'bokeh', name:'Bokeh', num:'047', section:'abstract' },
  { id:'meteor', name:'Meteor', num:'048', section:'space' },
  { id:'abyss', name:'Abyss', num:'049', section:'ambient' },
  { id:'plasma', name:'Plasma', num:'050', section:'abstract' },
  { id:'sandstorm', name:'Sandstorm', num:'051', section:'nature' },
  { id:'prism', name:'Prism', num:'052', section:'abstract' },
  { id:'blackhole', name:'Black Hole', num:'053', section:'space', isNew:true },
  { id:'jellyfish', name:'Jellyfish', num:'054', section:'ambient', isNew:true },
  { id:'glitch', name:'Glitch', num:'055', section:'retro', isNew:true },
  { id:'koi', name:'Koi Pond', num:'056', section:'ambient', isNew:true },
  { id:'lightning', name:'Lightning', num:'057', section:'weather', isNew:true },
  { id:'kaleidoscope', name:'Kaleido.', num:'058', section:'abstract', isNew:true },
  { id:'eclipse', name:'Eclipse', num:'059', section:'space', isNew:true },
  { id:'coral', name:'Coral Reef', num:'060', section:'nature', isNew:true },
  { id:'sunset', name:'Sunset', num:'061', section:'weather', isNew:true },
  { id:'candlelight', name:'Candlelight', num:'062', section:'fire', isNew:true },
  { id:'outrun', name:'Outrun', num:'063', section:'retro', isNew:true },
  { id:'breathing', name:'Breathing', num:'064', section:'minimal', free:true, isNew:true },
  { id:'liquidmarble', name:'Marble', num:'065', section:'abstract', isNew:true },
  { id:'aquarium', name:'Aquarium', num:'066', section:'ambient', isNew:true },
  { id:'driftclouds', name:'Clouds', num:'067', section:'weather', free:true, isNew:true },
  { id:'lavalamp', name:'Lava Lamp', num:'068', section:'abstract', isNew:true },
  { id:'silk', name:'Silk', num:'069', section:'abstract', isNew:true },
  { id:'wisp', name:'Wisp', num:'070', section:'ambient', isNew:true },
  { id:'meadow', name:'Meadow', num:'071', section:'nature', isNew:true },
  { id:'phoenix', name:'Phoenix', num:'072', section:'fire', isNew:true },
  { id:'forge', name:'Forge', num:'073', section:'fire', isNew:true },
  { id:'plankton', name:'Plankton', num:'074', section:'ambient', isNew:true },
  { id:'lumina', name:'Lumina', num:'075', section:'ambient', isNew:true },
  { id:'hologram', name:'Hologram', num:'076', section:'retro', isNew:true },
  { id:'crt', name:'CRT', num:'077', section:'retro', isNew:true },
  { id:'dustmotes', name:'Dust', num:'078', section:'minimal', isNew:true },
  { id:'autumn', name:'Autumn', num:'079', section:'nature', isNew:true },
  { id:'waterfall', name:'Waterfall', num:'080', section:'nature', isNew:true },
  { id:'linen', name:'Linen', num:'081', section:'minimal', free:true, isNew:true },
  { id:'tide', name:'Tide', num:'082', section:'nature', free:true, isNew:true },
  { id:'dusk', name:'Dusk', num:'083', section:'weather', free:true, isNew:true },
  { id:'ash', name:'Ash', num:'084', section:'minimal', free:true, isNew:true },
  { id:'moss', name:'Moss', num:'085', section:'nature', free:true, isNew:true },
  { id:'starfall', name:'Starfall', num:'086', section:'space', isNew:true },
  { id:'comet', name:'Comet', num:'087', section:'space', isNew:true },
  { id:'ripple', name:'Ripple', num:'088', section:'abstract', isNew:true },
  { id:'bloom', name:'Bloom', num:'089', section:'abstract', isNew:true },
  { id:'frost', name:'Frost', num:'090', section:'weather', isNew:true },
  { id:'flappy', name:'Flappy', num:'091', section:'retro', isNew:true },
  { id:'chomp', name:'Chomp', num:'092', section:'retro', isNew:true },
  { id:'snake', name:'Snake', num:'093', section:'retro', free:true, isNew:true },
  { id:'stacker', name:'Stacker', num:'094', section:'retro', isNew:true },
  { id:'paddle', name:'Paddle', num:'095', section:'retro', free:true, isNew:true },
  { id:'invaders', name:'Invaders', num:'096', section:'retro', isNew:true },
  { id:'asteroid', name:'Asteroid', num:'097', section:'retro', isNew:true },
  { id:'bricks', name:'Bricks', num:'098', section:'retro', isNew:true },
  { id:'sweeper', name:'Sweeper', num:'099', section:'retro', isNew:true },
  { id:'cascade', name:'Cascade', num:'100', section:'retro', isNew:true },
  { id:'neonalley', name:'Neon Alley', num:'101', section:'city', isNew:true },
  { id:'skyline', name:'Skyline', num:'102', section:'city', free:true, isNew:true },
  { id:'traffic', name:'Traffic', num:'103', section:'city', isNew:true },
  { id:'subway', name:'Subway', num:'104', section:'city', isNew:true },
  { id:'rooftop', name:'Rooftop', num:'105', section:'city', isNew:true },
  { id:'crosswalk', name:'Crosswalk', num:'106', section:'city', isNew:true },
  { id:'harbour', name:'Harbour', num:'107', section:'city', isNew:true },
  { id:'streetlamp', name:'Streetlamp', num:'108', section:'city', isNew:true },
  { id:'billboard', name:'Billboard', num:'109', section:'city', isNew:true },
  { id:'metromap', name:'Metro Map', num:'110', section:'city', isNew:true },
  { id:'skyscraper', name:'Skyscraper', num:'111', section:'city', isNew:true },
  { id:'nightdrive', name:'Night Drive', num:'112', section:'city', isNew:true },
  { id:'halloween', name:'Halloween', num:'113', section:'seasonal', isNew:true },
  { id:'pumpkin', name:'Pumpkin', num:'114', section:'seasonal', isNew:true },
  { id:'snowglobe', name:'Snowglobe', num:'115', section:'seasonal', free:true, isNew:true },
  { id:'fireplace', name:'Fireplace', num:'116', section:'seasonal', isNew:true },
  { id:'fireworks', name:'Fireworks', num:'117', section:'seasonal', isNew:true },
  { id:'lunar', name:'Lunar Year', num:'118', section:'seasonal', isNew:true },
  { id:'valentine', name:'Valentine', num:'119', section:'seasonal', isNew:true },
  { id:'blossom', name:'Blossom', num:'120', section:'seasonal', isNew:true },
  { id:'easter', name:'Easter', num:'121', section:'seasonal', isNew:true },
  { id:'beach', name:'Beach', num:'122', section:'seasonal', isNew:true },
  { id:'harvest', name:'Harvest', num:'123', section:'seasonal', isNew:true },
  { id:'wintersky', name:'Winter Sky', num:'124', section:'seasonal', isNew:true },
  { id:'tessellation', name:'Tessellate', num:'125', section:'geometric', isNew:true },
  { id:'penrose', name:'Penrose', num:'126', section:'geometric', isNew:true },
  { id:'spirograph', name:'Spirograph', num:'127', section:'geometric', isNew:true },
  { id:'isometric', name:'Isometric', num:'128', section:'geometric', isNew:true },
  { id:'moire', name:'Moiré', num:'129', section:'geometric', isNew:true },
  { id:'truchet', name:'Truchet', num:'130', section:'geometric', isNew:true },
  { id:'voronoi', name:'Voronoi', num:'131', section:'geometric', isNew:true },
  { id:'hexgrid', name:'Hex Grid', num:'132', section:'geometric', free:true, isNew:true },
  { id:'sierpinski', name:'Sierpinski', num:'133', section:'geometric', isNew:true },
  { id:'mandala', name:'Mandala', num:'134', section:'geometric', isNew:true },
  { id:'lissajous', name:'Lissajous', num:'135', section:'geometric', isNew:true },
  { id:'fold', name:'Fold', num:'136', section:'geometric', isNew:true },
  { id:'hopper', name:'Hopper', num:'137', section:'retro', isNew:true },
  { id:'crawler', name:'Crawler', num:'138', section:'retro', isNew:true },
  { id:'intercept', name:'Intercept', num:'139', section:'retro', isNew:true },
  { id:'squadron', name:'Squadron', num:'140', section:'retro', isNew:true },
  { id:'ascent', name:'Ascent', num:'141', section:'retro', isNew:true },
  { id:'merge', name:'Merge', num:'142', section:'retro', free:true, isNew:true },
  { id:'blast', name:'Blast', num:'143', section:'retro', isNew:true },
  { id:'whack', name:'Whack', num:'144', section:'retro', isNew:true },
  { id:'keys', name:'Keys', num:'145', section:'retro', isNew:true },
  { id:'helix', name:'Helix', num:'146', section:'retro', isNew:true },
  { id:'slither', name:'Slither', num:'147', section:'retro', isNew:true },
  { id:'sequence', name:'Sequence', num:'148', section:'retro', isNew:true },
  { id:'equalizer', name:'Equalizer', num:'149', section:'audio', free:true, isNew:true },
  { id:'waveform', name:'Waveform', num:'150', section:'audio', isNew:true },
  { id:'vinyl', name:'Vinyl', num:'151', section:'audio', isNew:true },
  { id:'cassette', name:'Cassette', num:'152', section:'audio', isNew:true },
  { id:'spectrum', name:'Spectrum', num:'153', section:'audio', isNew:true },
  { id:'sonar', name:'Sonar', num:'154', section:'audio', isNew:true },
  { id:'scope', name:'Scope', num:'155', section:'audio', isNew:true },
  { id:'metronome', name:'Metronome', num:'156', section:'audio', isNew:true },
  { id:'wormhole', name:'Wormhole', num:'157', section:'space', isNew:true },
  { id:'saturn', name:'Saturn', num:'158', section:'space', isNew:true },
  { id:'solarsystem', name:'Solar Sys.', num:'159', section:'space', isNew:true },
  { id:'milkyway', name:'Milky Way', num:'160', section:'space', isNew:true },
  { id:'satellite', name:'Satellite', num:'161', section:'space', isNew:true },
  { id:'moonphases', name:'Moon', num:'162', section:'space', free:true, isNew:true },
  { id:'bamboo', name:'Bamboo', num:'163', section:'nature', isNew:true },
  { id:'dunes', name:'Dunes', num:'164', section:'nature', isNew:true },
  { id:'redwood', name:'Redwood', num:'165', section:'nature', isNew:true },
  { id:'lilypond', name:'Lily Pond', num:'166', section:'nature', isNew:true },
  { id:'butterfly', name:'Butterfly', num:'167', section:'nature', isNew:true },
  { id:'mushroom', name:'Mushroom', num:'168', section:'nature', isNew:true },
  { id:'vines', name:'Vines', num:'169', section:'nature', isNew:true },
  { id:'hurricane', name:'Hurricane', num:'170', section:'weather', isNew:true },
  { id:'hail', name:'Hail', num:'171', section:'weather', isNew:true },
  { id:'heatwave', name:'Heatwave', num:'172', section:'weather', isNew:true },
  { id:'rainbow', name:'Rainbow', num:'173', section:'weather', isNew:true },
  { id:'monsoon', name:'Monsoon', num:'174', section:'weather', isNew:true },
  { id:'bonfire', name:'Bonfire', num:'175', section:'fire', isNew:true },
  { id:'torchlight', name:'Torchlight', num:'176', section:'fire', free:true, isNew:true },
  { id:'wildfire', name:'Wildfire', num:'177', section:'fire', isNew:true },
  { id:'sparks', name:'Sparks', num:'178', section:'fire', isNew:true },
  { id:'cabinet', name:'Cabinet', num:'179', section:'retro', isNew:true },
  { id:'vhs', name:'VHS', num:'180', section:'retro', isNew:true },
  { id:'pixelrain', name:'Pixel Rain', num:'181', section:'retro', isNew:true },
  { id:'gameboy', name:'Gameboy', num:'182', section:'retro', isNew:true },
  { id:'papergrain', name:'Paper', num:'183', section:'minimal', isNew:true },
  { id:'slowwave', name:'Slow Wave', num:'184', section:'minimal', isNew:true },
  { id:'singleline', name:'Line', num:'185', section:'minimal', isNew:true },
  { id:'fade', name:'Fade', num:'186', section:'minimal', isNew:true },
  { id:'contour', name:'Contour', num:'187', section:'minimal', isNew:true },
  { id:'staticnoise', name:'Static', num:'188', section:'minimal', isNew:true },
  { id:'inkdrop', name:'Ink Drop', num:'189', section:'abstract', free:true, isNew:true },
  { id:'smoke', name:'Smoke', num:'190', section:'abstract', isNew:true },
  { id:'fluid', name:'Fluid', num:'191', section:'abstract', isNew:true },
  { id:'metaballs', name:'Metaballs', num:'192', section:'abstract', isNew:true },
  { id:'refraction', name:'Refraction', num:'193', section:'abstract', isNew:true },
  { id:'shatter', name:'Shatter', num:'194', section:'abstract', isNew:true },
  { id:'lanternfloat', name:'Lanterns', num:'195', section:'ambient', isNew:true },
  { id:'moths', name:'Moths', num:'196', section:'ambient', isNew:true },
  { id:'deepsea', name:'Deep Sea', num:'197', section:'ambient', isNew:true },
  { id:'biobay', name:'Bio Bay', num:'198', section:'ambient', free:true, isNew:true },
  { id:'godray', name:'God Rays', num:'199', section:'ambient', isNew:true },
  { id:'rainwindow', name:'Rain Window', num:'200', section:'ambient', isNew:true },
  { id:'nightcity', name:'Night City', num:'201', section:'cyber', isNew:true },
  { id:'netrunner', name:'Netrunner', num:'202', section:'cyber', isNew:true },
  { id:'hazard', name:'Hazard', num:'203', section:'cyber', free:true, isNew:true },
  { id:'chromed', name:'Chromed', num:'204', section:'cyber', isNew:true },
  { id:'braindance', name:'Braindance', num:'205', section:'cyber', isNew:true },
  { id:'glyphs', name:'Glyphs', num:'206', section:'cyber', isNew:true },
  { id:'trace', name:'Trace', num:'207', section:'cyber', isNew:true },
  { id:'datastream', name:'Datastream', num:'208', section:'cyber', isNew:true },
  { id:'overload', name:'Overload', num:'209', section:'cyber', isNew:true },
  { id:'corpo', name:'Corpo', num:'210', section:'cyber', isNew:true },
  { id:'ripperdoc', name:'Ripperdoc', num:'211', section:'cyber', isNew:true },
  { id:'blackwall', name:'Blackwall', num:'212', section:'cyber', isNew:true },
  { id:'torii', name:'Torii', num:'213', section:'city', isNew:true },
  { id:'giza', name:'Giza', num:'214', section:'city', isNew:true },
  { id:'ringworld', name:'Ringworld', num:'215', section:'space', isNew:true },
  { id:'heaven', name:'Heaven', num:'216', section:'ambient', isNew:true },
  { id:'onyx', name:'Onyx', num:'217', section:'minimal', isNew:true },
  { id:'zen', name:'Zen', num:'218', section:'city', isNew:true },
  { id:'ukiyo', name:'Ukiyo', num:'219', section:'city', isNew:true },
  { id:'teahouse', name:'Teahouse', num:'220', section:'city', isNew:true },
  { id:'turntable', name:'Turntable', num:'221', section:'audio', isNew:true },
  { id:'meterbridge', name:'Meter Bridge', num:'222', section:'audio', isNew:true },
  { id:'patchbay', name:'Patch Bay', num:'223', section:'audio', isNew:true },
  { id:'stack', name:'Stack', num:'224', section:'audio', isNew:true },
  { id:'reels', name:'Reels', num:'225', section:'audio', isNew:true },
  { id:'keybed', name:'Keybed', num:'226', section:'audio', isNew:true },
  { id:'murmuration', name:'Murmuration', num:'227', section:'nature', isNew:true },
  { id:'girih', name:'Girih', num:'228', section:'geometric', isNew:true },
  { id:'datacenter', name:'Data Center', num:'229', section:'cyber', isNew:true },
  { id:'frostwork', name:'Frostwork', num:'230', section:'seasonal', isNew:true },
  { id:'coals', name:'Coals', num:'231', section:'fire', isNew:true },
  { id:'virga', name:'Virga', num:'232', section:'weather', isNew:true },
  { id:'pulsar', name:'Pulsar', num:'233', section:'space', isNew:true },
  { id:'kelp', name:'Kelp', num:'234', section:'nature', isNew:true },
  { id:'quasicrystal', name:'Quasicrystal', num:'235', section:'geometric', isNew:true },
  { id:'windchime', name:'Windchime', num:'236', section:'ambient', isNew:true },
  { id:'laundry', name:'Laundry', num:'237', section:'city', isNew:true },
  { id:'thunderhead', name:'Thunderhead', num:'238', section:'weather', isNew:true },
  { id:'apollonian', name:'Apollonian', num:'239', section:'geometric', isNew:true },
  { id:'hilbert', name:'Hilbert', num:'240', section:'geometric', isNew:true },
  { id:'sentry', name:'Sentry', num:'241', section:'cyber', isNew:true },
  { id:'decrypt', name:'Decrypt', num:'242', section:'cyber', isNew:true },
  { id:'foundry', name:'Foundry', num:'243', section:'fire', isNew:true },
  { id:'flare', name:'Flare', num:'244', section:'fire', isNew:true },
  { id:'icicles', name:'Icicles', num:'245', section:'seasonal', isNew:true },
  { id:'garland', name:'Garland', num:'246', section:'seasonal', isNew:true },
  { id:'onsen', name:'Onsen', num:'247', section:'ambient', isNew:true },
  { id:'strings', name:'Strings', num:'248', section:'audio', isNew:true },
  { id:'loom', name:'Loom', num:'249', section:'abstract', isNew:true },
  { id:'contrail', name:'Contrail', num:'250', section:'weather', isNew:true },
];

const SECTIONS = [
  { id:'fav',      label:'Favourites' },
  { id:'new',      label:'New' },
  { id:'all',      label:'All' },
  { id:'free',     label:'Free', freeOnly:true },   // only shown to non-entitled users
  { id:'space',    label:'Space' },
  { id:'city',     label:'City' },
  { id:'cyber',    label:'Cyber' },
  { id:'seasonal', label:'Seasonal' },
  { id:'nature',   label:'Nature' },
  { id:'weather',  label:'Weather' },
  { id:'fire',     label:'Fire' },
  { id:'retro',    label:'Retro' },
  { id:'minimal',  label:'Minimal' },
  { id:'abstract', label:'Abstract' },
  { id:'ambient',  label:'Ambient' },
  { id:'geometric', label:'Geometric' },
  { id:'audio',    label:'Audio' },
];

const PRO_THEMES = THEMES.filter(t => !t.free && t.id !== 'default').map(t => t.id);
const THEME_NAMES = Object.fromEntries(THEMES.map(t => [t.id, t.name]));
const PREVIEW_DURATION = 3000;

let state = { activeTheme: 'default', pro: false, trialActive: false, trialDaysLeft: 0 };
let activeSection = 'all';
let favourites = [];          // theme ids, newest first, persisted to chrome.storage.sync
let query = '';               // current search text, lower-cased
let previewTimer = null;
let previewing = false;
let originalTheme = null;

function entitled() {
  return !!(state.pro || state.trialActive || (state.companyConfig && state.companyConfig.colors));
}

chrome.runtime.sendMessage({ type: 'GET_STATE' }, (s) => {
  if (s) { state = s; paint(); maybeShowBilling(); maybeShowReview(); }
});

// ── BILLING GRACE WARNING ─────────────────────────────
// Shown while a renewal has failed but Pro is still being honoured, so the customer
// can fix their card before access actually ends.
function maybeShowBilling() {
  if (!state.graceActive) return;
  const b = document.getElementById('billing-banner');
  const d = document.getElementById('grace-days');
  if (d) d.textContent = state.graceDaysLeft;
  if (b) b.classList.add('show');
}
const billingGo = document.getElementById('billing-go');
if (billingGo) billingGo.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://polar.sh/purchases' });
});

// ── REVIEW NUDGE ──────────────────────────────────────
function maybeShowReview() {
  if (!state.installedAt || state.reviewPromptShown) return;
  if (state.companyConfig && state.companyConfig.colors) return; // skip B2B/team users
  const days = (Date.now() - state.installedAt) / 86400000;
  if (days < 3 && (state.themesApplied || 0) < 10) return;       // not yet engaged
  const b = document.getElementById('review-banner');
  if (b) b.classList.add('show');
}
const reviewGo = document.getElementById('review-go');
if (reviewGo) reviewGo.addEventListener('click', () => {
  chrome.storage.sync.set({ reviewPromptShown: true });
  chrome.tabs.create({ url: 'https://chromewebstore.google.com/detail/pnpplaegcahgbndhahihciknencicpjn/reviews' });
  document.getElementById('review-banner').classList.remove('show');
});
const reviewX = document.getElementById('review-x');
if (reviewX) reviewX.addEventListener('click', () => {
  chrome.storage.sync.set({ reviewPromptShown: true });
  document.getElementById('review-banner').classList.remove('show');
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0]?.url || '';
  const dot = document.getElementById('site-dot');
  const name = document.getElementById('site-name');
  if (url.includes('claude.ai')) {
    name.textContent = 'Claude — connected'; dot.classList.add('active');
  } else if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) {
    name.textContent = 'ChatGPT — connected'; dot.classList.add('active');
  } else {
    name.textContent = 'Open Claude or ChatGPT';
  }
});

// ── RENDER ─────────────────────────────────────────────
function paint() {
  renderStatus();
  renderSidebar();
  renderGrid();
  renderCustomBgRow();   // no-op unless the user has saved one
}

function renderStatus() {
  const statusText = document.getElementById('status-text');
  const statusEl = document.getElementById('status');
  const upgradeBtn = document.getElementById('upgrade');
  document.body.classList.remove('pro', 'trial');
  statusEl.classList.remove('pro', 'trial');

  if (state.companyConfig && state.companyConfig.colors) {
    document.body.classList.add('pro');
    statusText.textContent = state.companyConfig.company || 'Company';
    statusEl.classList.add('pro');
    document.getElementById('company-section').style.display = 'block';
    renderCompanyButtons();
    return;
  }
  document.getElementById('company-section').style.display = 'none';

  if (state.pro) {
    document.body.classList.add('pro');
    statusText.textContent = 'Pro';
    statusEl.classList.add('pro');
  } else if (state.trialActive) {
    document.body.classList.add('trial');
    statusText.textContent = state.trialDaysLeft + 'd trial';
    statusEl.classList.add('trial');
    upgradeBtn.innerHTML = 'Keep Pro after trial <span class="upgrade-price">' + state.trialDaysLeft + ' days left</span>';
  }
}

function sectionList(id) {
  if (id === 'all') return THEMES;
  if (id === 'new') return THEMES.filter(t => t.isNew);
  if (id === 'free') return THEMES.filter(t => t.free);
  // keep the user's own ordering rather than catalogue order
  if (id === 'fav') return favourites.map(f => THEMES.find(t => t.id === f)).filter(Boolean);
  return THEMES.filter(t => t.section === id);
}

// Search looks across the whole catalogue, not just the section you happen to be in —
// that is what someone typing "koi" expects, wherever they are standing.
function searchList(q) {
  const label = Object.fromEntries(SECTIONS.map(s => [s.id, s.label.toLowerCase()]));
  const kw = keywordHits(q);
  const starts = [], contains = [];
  THEMES.forEach(t => {
    const name = t.name.toLowerCase();
    if (name.startsWith(q)) { starts.push(t); return; }
    if (name.includes(q) || t.id.includes(q) || (label[t.section] || '').includes(q) || kw.has(t.id)) contains.push(t);
  });
  return starts.concat(contains);   // exact-ish matches first
}

// Words people search for that appear in no theme name or section label.
const KEYWORDS = {
  japan: 'torii ukiyo zen teahouse sakura bamboo origami koi lilypond blossom petal',
  japanese: 'torii ukiyo zen teahouse sakura bamboo origami koi lilypond blossom petal',
  black: 'onyx carbon graphite midnight blackwall',
  oled: 'onyx carbon graphite midnight',
  amoled: 'onyx carbon graphite midnight',
  egypt: 'giza', egyptian: 'giza', pyramid: 'giza',
  angel: 'halo heaven', angelic: 'halo heaven',
  sea: 'ocean abyss deepsea coral aquarium ukiyo lilypond',
  water: 'ocean abyss deepsea coral aquarium waterfall rainfall raindrop lilypond',
  fish: 'koi lilypond aquarium coral deepsea',
  rain: 'rainfall rainwindow raindrop monsoon storm',
  chinese: 'lunar',
  christmas: 'snowfall wintersky frost',
  halloween: 'halloween pumpkin',
  game: 'flappy chomp stacker invaders asteroid bricks sweeper hopper whack slither',
  games: 'flappy chomp stacker invaders asteroid bricks sweeper hopper whack slither',
  music: 'waveform vinyl cassette spectrum scope metronome sonar',
  scifi: 'ringworld wormhole netrunner nightcity blackwall',
  purple: 'velvet plum galaxy vapor',
  gold: 'halo giza harvest',
};

function keywordHits(q) {
  const hit = new Set();
  Object.keys(KEYWORDS).forEach(k => { if (k.indexOf(q) === 0) KEYWORDS[k].split(' ').forEach(id => hit.add(id)); });
  return hit;
}

function isFav(id) { return favourites.indexOf(id) !== -1; }

function toggleFav(id) {
  const i = favourites.indexOf(id);
  if (i === -1) favourites.unshift(id); else favourites.splice(i, 1);
  chrome.storage.sync.set({ favourites: favourites });
  renderSidebar();
  renderGrid();
}

function renderSidebar() {
  const el = document.getElementById('sections');
  if (!el) return;
  // The "Free" filter only means something to someone who doesn't own everything.
  const visible = SECTIONS.filter(s => !s.freeOnly || !entitled());
  el.innerHTML = visible.map(s => {
    const n = sectionList(s.id).length;
    const badge = s.id === 'new'
      ? '<span class="sec-new">NEW</span>'
      : '<span class="sec-count">' + n + '</span>';
    const label = s.id === 'fav' ? '\u2605 ' + s.label : s.label;
    return '<button class="section-btn' + (s.id === activeSection ? ' active' : '') +
           (s.id === 'free' ? ' is-free' : '') + (s.id === 'fav' ? ' is-fav' : '') +
           '" data-section="' + s.id + '">' + label + badge + '</button>';
  }).join('');
  el.querySelectorAll('.section-btn').forEach(b => b.addEventListener('click', () => {
    activeSection = b.dataset.section;
    clearSearch();          // picking a section means you are done searching
    renderSidebar();
    renderGrid();
  }));
}

function renderGrid() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;
  const sec = SECTIONS.find(s => s.id === activeSection) || SECTIONS[2];
  const searching = query.length > 0;
  const list = searching ? searchList(query) : sectionList(activeSection);
  const canUse = entitled();
  // Badges: free AND trial users keep the "Pro" tag (so trial users see what they're
  // paying for). Only paid Pro / team users hide them. Locked/dimmed = free users only.
  const owned = !!(state.pro || (state.companyConfig && state.companyConfig.colors));
  document.getElementById('grid-title').textContent = searching ? 'Search' : sec.label;
  const anyLocked = !canUse && list.some(t => !t.free && t.id !== 'default');
  document.getElementById('grid-count').textContent =
    list.length + (searching ? ' match' + (list.length === 1 ? '' : 'es') : ' theme' + (list.length === 1 ? '' : 's')) +
    (anyLocked ? ' · tap to preview' : '');

  if (!list.length) {
    grid.innerHTML = '<div class="grid-empty" id="grid-empty"></div>';
    // the query is user input, so it goes in as text and never as markup
    document.getElementById('grid-empty').textContent = searching
      ? 'No themes match \u201c' + query + '\u201d'
      : 'No favourites yet \u2014 hover any theme and tap the star.';
    return;
  }

  grid.innerHTML = list.map(t => {
    const isPro = !t.free && t.id !== 'default';
    const locked = isPro && !canUse;      // free users only → dimmed + preview
    const showBadge = isPro && !owned;    // free + trial show the Pro badge; paid/team don't
    const fav = isFav(t.id);
    return '<div class="theme' + (locked ? ' locked' : '') + (t.id === state.activeTheme ? ' active' : '') +
      '" data-theme="' + t.id + '">' +
      '<div class="theme-preview pv-' + t.id + '"></div>' +
      '<button class="theme-fav' + (fav ? ' on' : '') + '" data-fav="' + t.id + '"' +
      ' title="' + (fav ? 'Remove from favourites' : 'Add to favourites') + '">' +
      (fav ? '\u2605' : '\u2606') + '</button>' +
      (showBadge ? '<span class="theme-pro">Pro</span>' : '') +
      '<span class="theme-label">' + t.name + '<span class="theme-num">' + t.num + '</span></span>' +
      '</div>';
  }).join('');

  grid.querySelectorAll('.theme').forEach(el => el.addEventListener('click', () => onThemeClick(el.dataset.theme)));
  // the star must not also select or preview the theme underneath it
  grid.querySelectorAll('.theme-fav').forEach(el => el.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFav(el.dataset.fav);
  }));
}

function onThemeClick(id) {
  if (previewing) return;
  const t = THEMES.find(x => x.id === id);
  const isPro = t && !t.free && id !== 'default';
  if (isPro && !entitled()) { startPreview(id); return; }
  setTheme(id);
}

function setTheme(id) {
  state.activeTheme = id;
  chrome.runtime.sendMessage({ type: 'SET_THEME', theme: id });
  document.querySelectorAll('.theme').forEach(t => {
    t.classList.toggle('active', t.dataset.theme === id);
    t.classList.remove('previewing');
  });
  document.querySelectorAll('#company-bg-row .company-btn').forEach(n => n.classList.remove('active'));
}

function startPreview(themeId) {
  if (previewing) return;
  previewing = true;
  originalTheme = state.activeTheme;
  chrome.runtime.sendMessage({ type: 'SET_THEME', theme: themeId, preview: true });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'SHOW_PREVIEW_TOAST',
        themeName: THEME_NAMES[themeId] || themeId
      }).catch(() => {});
    }
  });
  const banner = document.getElementById('preview-banner');
  const fill = banner.querySelector('.preview-progress-fill');
  document.getElementById('preview-name').textContent = THEME_NAMES[themeId] || themeId;
  banner.classList.remove('show');
  if (fill) { fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = ''; }
  void banner.offsetWidth;
  banner.classList.add('show');
  document.querySelectorAll('.theme').forEach(t => {
    t.classList.toggle('previewing', t.dataset.theme === themeId);
    t.classList.remove('active');
  });
  previewTimer = setTimeout(() => endPreview(), PREVIEW_DURATION);
}

function endPreview() {
  if (!previewing) return;
  previewing = false;
  clearTimeout(previewTimer);
  chrome.runtime.sendMessage({ type: 'SET_THEME', theme: originalTheme, preview: true });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: 'HIDE_PREVIEW_TOAST' }).catch(() => {});
  });
  document.getElementById('preview-banner').classList.remove('show');
  document.querySelectorAll('.theme').forEach(t => {
    t.classList.remove('previewing');
    t.classList.toggle('active', t.dataset.theme === originalTheme);
  });
  const btn = document.getElementById('upgrade');
  btn.classList.remove('flash');
  void btn.offsetWidth;
  btn.classList.add('flash');
}

function renderCompanyButtons() {
  const cfg = state.companyConfig;
  const row = document.getElementById('company-bg-row');
  if (!cfg || !row) return;
  const bgs = (Array.isArray(cfg.backgrounds) && cfg.backgrounds.length)
    ? cfg.backgrounds : [{ name: cfg.company || 'Company' }];
  const multi = bgs.length > 1;
  const onCompany = state.activeTheme === '__company';
  row.innerHTML = '';
  bgs.forEach((bg, i) => {
    const btn = document.createElement('button');
    btn.className = 'company-btn' + (onCompany && (cfg.activeIndex || 0) === i ? ' active' : '');
    btn.textContent = multi ? (bg.name || ('Background ' + (i + 1)))
                            : ((bg.name || cfg.company || 'Company') + ' background');
    btn.addEventListener('click', () => {
      if (previewing) return;
      state.activeTheme = '__company';
      cfg.activeIndex = i;
      chrome.runtime.sendMessage({ type: 'SET_COMPANY_BG', index: i });
      document.querySelectorAll('.theme').forEach(t => t.classList.remove('active'));
      row.querySelectorAll('.company-btn').forEach((n, j) => n.classList.toggle('active', j === i));
    });
    row.appendChild(btn);
  });
}

document.getElementById('upgrade').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html#upgrade') });
});
document.getElementById('link-account').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
});
document.getElementById('link-help').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html#help') });
});

const shotLink = document.getElementById('link-screenshot');
if (shotLink) shotLink.addEventListener('click', () => {
  const orig = shotLink.textContent;
  shotLink.textContent = 'Capturing…';
  chrome.runtime.sendMessage({ type: 'CAPTURE' }, (res) => {
    if (res && res.ok && res.dataUrl) {
      const a = document.createElement('a');
      a.href = res.dataUrl;
      a.download = 'vellum-' + Date.now() + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      shotLink.textContent = 'Saved ✓';
    } else {
      shotLink.textContent = 'Open Claude/ChatGPT';
    }
    setTimeout(() => { shotLink.textContent = orig; }, 1500);
  });
});

// ── YOUR OWN BACKGROUND (quick apply) ──────────────────
// A one-click row in the popup so applying it does not mean a trip to Options.
// Only rendered when one is actually saved, so nothing is advertised that is not there.
function renderCustomBgRow() {
  const row = document.getElementById("company-bg-row");
  if (!row) return;
  chrome.storage.local.get(["customBg"], (d) => {
    const cb = d.customBg;
    if (!cb || !cb.data) return;
    const el = document.createElement("div");
    el.className = "bg-opt" + (state.activeTheme === "__custom" ? " active" : "");
    el.style.cssText = "background-image:url(" + cb.data + ");background-size:cover;background-position:center";
    el.innerHTML = '<span>' + (cb.name || "Your background") + '</span>';
    el.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "SET_THEME", theme: "__custom" }, () => {
        state.activeTheme = "__custom";
        renderGrid();
        renderCustomBgRow();
      });
    });
    row.innerHTML = "";
    row.appendChild(el);
    row.style.display = "grid";
  });
}

// ── SEARCH ─────────────────────────────────────────────
const searchEl = document.getElementById('search');
const searchWrap = document.getElementById('search-wrap');
const searchClear = document.getElementById('search-clear');

function clearSearch() {
  query = '';
  if (searchEl) searchEl.value = '';
  if (searchWrap) searchWrap.classList.remove('has-query');
}

if (searchEl) {
  searchEl.placeholder = 'Search ' + THEMES.length + ' themes…';
  searchEl.addEventListener('input', () => {
    query = searchEl.value.trim().toLowerCase();
    searchWrap.classList.toggle('has-query', query.length > 0);
    renderGrid();
  });
  searchEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { clearSearch(); renderGrid(); searchEl.blur(); }
  });
}
if (searchClear) {
  searchClear.addEventListener('click', () => { clearSearch(); renderGrid(); searchEl.focus(); });
}

// ── FAVOURITES ─────────────────────────────────────────
chrome.storage.sync.get({ favourites: [] }, (r) => {
  // drop anything that is no longer in the catalogue, so a renamed or removed theme
  // cannot leave a dead entry sitting in the sidebar count forever
  const known = new Set(THEMES.map(t => t.id));
  const clean = (r.favourites || []).filter(id => known.has(id));
  favourites = clean;
  if (clean.length !== (r.favourites || []).length) chrome.storage.sync.set({ favourites: clean });
  renderSidebar();
  renderGrid();
});

window.addEventListener('beforeunload', () => {
  if (previewing) {
    chrome.runtime.sendMessage({ type: 'SET_THEME', theme: originalTheme, preview: true });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: 'HIDE_PREVIEW_TOAST' }).catch(() => {});
    });
  }
});

// ── THEME SPEED ────────────────────────────────────────
// Lives in the popup rather than the account page because it is a per-session thing
// people reach for often. Sits on the site row, which already had empty space to the
// right of the hostname, so it costs no height and never pushes the theme grid down.
// 100% is the theme's intended pace, not its raw authored speed - see VELLUM_BASE.
(function wireSpeed() {
  const range = document.getElementById('speed-range');
  if (!range) return;
  const out = document.getElementById('speed-val');
  chrome.storage.sync.get({ themeSpeed: 1 }, (d) => {
    const raw = Math.round((d.themeSpeed || 1) * 100);
    const pct = Math.max(+range.min, Math.min(100, raw));
    range.value = pct; out.textContent = pct + '%';
    if (pct !== raw) chrome.storage.sync.set({ themeSpeed: pct / 100 });
  });
  let save = null;
  range.addEventListener('input', () => {
    out.textContent = range.value + '%';
    clearTimeout(save);
    // debounced: the content script rebuilds the animation on each change, and a drag
    // fires this continuously
    save = setTimeout(() => {
      chrome.storage.sync.set({ themeSpeed: +range.value / 100 });
    }, 200);
  });
})();
