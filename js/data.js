/* Helium supply-chain data — verified as of April 2026.
   Figures are approximate and intended for illustration. */

const SITES = [
  /* ---------------- EXTRACTION SITES / RESERVES ---------------- */
  {
    id: "us-labarge",
    name: "La Barge / Cliffside (United States)",
    type: "extraction",
    location: "Wyoming & Texas, USA",
    coords: [42.26, -110.20],
    status: "online",
    role: "Largest single helium-producing nation. ExxonMobil's Shute Creek plant at La Barge, Wyoming is the biggest individual source. The former US Federal Helium Reserve (Cliffside, near Amarillo, Texas) was sold in 2024 and is now operated by Messer.",
    metrics: [
      ["Annual output", "~81M m³/yr"],
      ["Global rank", "#1 producer"],
      ["Reserve status", "Federal Reserve privatised (Messer, 2024)"]
    ]
  },
  {
    id: "qatar-raslaffan",
    name: "Ras Laffan (Qatar)",
    type: "extraction",
    location: "Ras Laffan Industrial City, Qatar",
    coords: [25.90, 51.55],
    status: "offline",
    role: "World's largest helium export hub, refined as a byproduct of North Field LNG. Qatar's only export route is by sea through the Strait of Hormuz — now closed. The complex has been unable to ship product since March 2026.",
    metrics: [
      ["Share of global supply", "~33%"],
      ["2025 output", "~63M m³"],
      ["Status", "Offline since March 2026"],
      ["Export route", "Strait of Hormuz (closed)"]
    ]
  },
  {
    id: "algeria",
    name: "Arzew & Skikda (Algeria)",
    type: "extraction",
    location: "Arzew, Algeria",
    coords: [35.83, -0.32],
    status: "online",
    role: "Long-standing helium producer extracting from LNG streams on the Mediterranean coast. A key supplier to European markets and partially able to backfill lost Qatari volumes — though nowhere near enough.",
    metrics: [
      ["Role", "Major LNG-linked producer"],
      ["Primary market", "Europe"],
      ["Status", "Operational"]
    ]
  },
  {
    id: "russia-amur",
    name: "Amur Gas Processing Plant (Russia)",
    type: "extraction",
    location: "Svobodny, Amur Oblast, Russia",
    coords: [51.40, 128.10],
    status: "online",
    role: "Designed to become one of the world's largest helium sources, feeding Chinese demand via pipeline gas. Output exists but is largely walled off from Western markets under US/EU sanctions.",
    metrics: [
      ["Design capacity", "Among world's largest"],
      ["Market access", "Restricted — US/EU sanctions"],
      ["Primary buyer", "China"]
    ]
  },
  {
    id: "tanzania-rukwa",
    name: "Rukwa Basin (Tanzania)",
    type: "extraction",
    location: "Rukwa Basin, Tanzania",
    coords: [-8.00, 31.50],
    status: "dev",
    role: "Helium One Global's flagship project — a rare primary helium play (not an LNG byproduct) with high-concentration discoveries. In development; first commercial production would help diversify a dangerously concentrated market.",
    metrics: [
      ["Operator", "Helium One Global"],
      ["Type", "Primary helium (non-LNG)"],
      ["Status", "In development"]
    ]
  },
  {
    id: "canada-sask",
    name: "Saskatchewan (Canada)",
    type: "extraction",
    location: "Saskatchewan, Canada",
    coords: [49.90, -106.00],
    status: "dev",
    role: "Emerging cluster of small-scale primary helium projects with low-carbon credentials (nitrogen-hosted, no associated hydrocarbons). Growing but individually modest output.",
    metrics: [
      ["Type", "Primary helium projects"],
      ["Status", "Emerging / scaling up"],
      ["Note", "Low-carbon, nitrogen-hosted"]
    ]
  },
  {
    id: "south-africa",
    name: "Free State (South Africa)",
    type: "extraction",
    location: "Virginia, Free State, South Africa",
    coords: [-28.10, 26.90],
    status: "dev",
    role: "Renergen's Virginia Gas Project hosts some of the world's highest measured helium concentrations. An emerging source positioned to serve African and export markets.",
    metrics: [
      ["Operator", "Renergen"],
      ["Notable", "Very high He concentration"],
      ["Status", "Emerging producer"]
    ]
  },

  /* ---------------- PRODUCERS / DISTRIBUTORS ---------------- */
  {
    id: "linde",
    name: "Linde plc",
    type: "producer",
    location: "Global (HQ Woking, UK)",
    coords: [51.32, -0.56],
    status: "online",
    role: "World's largest industrial gas company and a dominant helium distributor. Operates sourcing, purification and global logistics — the firms that physically move and allocate helium to end users.",
    metrics: [
      ["Segment", "Industrial gases — #1"],
      ["Role", "Sourcing, purification, distribution"]
    ]
  },
  {
    id: "airproducts",
    name: "Air Products",
    type: "producer",
    location: "Allentown, Pennsylvania, USA",
    coords: [40.60, -75.49],
    status: "online",
    role: "Major US-based industrial gas producer and global helium supplier with significant North American sourcing positions.",
    metrics: [
      ["Base", "United States"],
      ["Role", "Producer & distributor"]
    ]
  },
  {
    id: "airliquide",
    name: "Air Liquide",
    type: "producer",
    location: "Paris, France",
    coords: [48.85, 2.35],
    status: "online",
    role: "French industrial gas major with global helium sourcing, liquefaction and distribution networks serving electronics and healthcare.",
    metrics: [
      ["Base", "France"],
      ["Role", "Producer & distributor"]
    ]
  },
  {
    id: "messer",
    name: "Messer",
    type: "producer",
    location: "Bad Soden, Germany",
    coords: [50.14, 8.50],
    status: "online",
    role: "Largest privately held industrial gas company. Acquired operatorship of the former US Federal Helium Reserve assets, giving it a notable position in the helium supply chain.",
    metrics: [
      ["Base", "Germany"],
      ["Notable", "Operates ex-US Federal Reserve assets"]
    ]
  },

  /* ---------------- DEMAND CENTRES ---------------- */
  {
    id: "tsmc",
    name: "TSMC — Semiconductor Fabs",
    type: "demand",
    location: "Hsinchu / Tainan, Taiwan",
    coords: [24.77, 120.99],
    status: "online",
    role: "World's leading chip foundry. Advanced semiconductor fabrication consumes large volumes of ultra-pure helium for cooling and as a carrier/purge gas. Supply tightness threatens leading-edge production schedules.",
    metrics: [
      ["Sector", "Semiconductors"],
      ["Industry demand", "20–25% of global He (→30% by 2030)"],
      ["Substitute", "None at advanced nodes"]
    ]
  },
  {
    id: "samsung",
    name: "Samsung — Fabs",
    type: "demand",
    location: "Pyeongtaek / Hwaseong, South Korea",
    coords: [37.00, 127.05],
    status: "online",
    role: "Major memory and logic chip manufacturer. Helium is essential for wafer cooling, leak detection and process atmospheres across its giant fabs.",
    metrics: [
      ["Sector", "Semiconductors (memory & logic)"],
      ["Region", "South Korea"]
    ]
  },
  {
    id: "skhynix",
    name: "SK hynix — Fabs",
    type: "demand",
    location: "Icheon, South Korea",
    coords: [37.27, 127.44],
    status: "online",
    role: "Leading memory (DRAM/NAND) producer dependent on a steady ultra-pure helium supply. Korean fabs are highly exposed to Asian helium logistics disrupted by the Hormuz closure.",
    metrics: [
      ["Sector", "Semiconductors (memory)"],
      ["Region", "South Korea"]
    ]
  },
  {
    id: "seagate",
    name: "Seagate — HDD Manufacturing",
    type: "demand",
    location: "Korat, Thailand",
    coords: [14.97, 102.10],
    status: "online",
    role: "High-capacity hard drives (10TB+) are hermetically sealed with helium to reduce drag and pack more platters. There is no substitute. 2026 production capacity is reported fully allocated under tight supply.",
    metrics: [
      ["Sector", "Helium-sealed HDDs (10TB+)"],
      ["Substitute", "None"],
      ["2026 capacity", "Fully allocated"]
    ]
  },
  {
    id: "westerndigital",
    name: "Western Digital — HDD Manufacturing",
    type: "demand",
    location: "Bang Pa-in, Thailand",
    coords: [14.23, 100.58],
    status: "online",
    role: "Co-leader in helium-sealed nearline drives for data centres. Sustained helium shortages directly constrain high-capacity storage output for cloud and AI infrastructure.",
    metrics: [
      ["Sector", "Helium-sealed HDDs (10TB+)"],
      ["Substitute", "None"],
      ["2026 capacity", "Fully allocated"]
    ]
  }
];

/* Strait of Hormuz chokepoint */
const CHOKEPOINT = {
  coords: [26.57, 56.25],
  label: "Strait of Hormuz — CLOSED",
  title: "Strait of Hormuz",
  text: "The sole maritime export route for Qatari helium. Its closure has taken roughly <b>27–30% of global helium supply</b> offline since <b>March 2026</b>. With no overland alternative, Qatar's ~33% production share cannot reach world markets."
};

/* Flow lines: [fromId or coords, toId or coords]. disrupted routes pass through Hormuz. */
const FLOWS = [
  // Active routes (US & Algeria feeding global demand)
  { from: "us-labarge", to: "tsmc", disrupted: false },
  { from: "us-labarge", to: "seagate", disrupted: false },
  { from: "algeria", to: "airliquide", disrupted: false },
  { from: "us-labarge", to: "airproducts", disrupted: false },
  { from: "russia-amur", to: "skhynix", disrupted: false, note: "sanction-restricted" },

  // Disrupted Qatari routes — drawn through the Strait of Hormuz
  { from: "qatar-raslaffan", via: [26.57, 56.25], to: "tsmc", disrupted: true },
  { from: "qatar-raslaffan", via: [26.57, 56.25], to: "samsung", disrupted: true },
  { from: "qatar-raslaffan", via: [26.57, 56.25], to: "skhynix", disrupted: true },
  { from: "qatar-raslaffan", via: [26.57, 56.25], to: "westerndigital", disrupted: true }
];
