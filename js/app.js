/* Helium Supply Chain Map (Leaflet app) */

const COLORS = {
  extraction: "#3fb27f",
  producer: "#f2b134",
  demand: "#4ea1ff",
  choke: "#ff4d4d"
};

const TYPE_LABEL = {
  extraction: "Extraction site",
  producer: "Producer / distributor",
  demand: "Demand centre"
};

const STATUS_LABEL = {
  online: "Operational",
  offline: "Offline since March 2026",
  dev: "In development"
};

// ---------- Map setup ----------
const map = L.map("map", {
  center: [28, 35],
  zoom: 3,
  minZoom: 2,
  maxZoom: 8,
  worldCopyJump: true,
  zoomControl: true
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
  maxZoom: 19
}).addTo(map);

// ---------- Layer groups ----------
const layers = {
  extraction: L.layerGroup().addTo(map),
  producer: L.layerGroup(), // off by default to reduce clutter
  demand: L.layerGroup().addTo(map),
  flows: L.layerGroup().addTo(map),
  choke: L.layerGroup().addTo(map)
};

const siteById = Object.fromEntries(SITES.map((s) => [s.id, s]));
function coordOf(ref) {
  if (Array.isArray(ref)) return ref;
  return siteById[ref].coords;
}

// ---------- Markers ----------
// Extraction markers are scaled by output (M m³/yr) so the US/Qatar dominance
// reads at a glance; diameter is proportional to sqrt(output) for area scaling.
function markerSize(site) {
  if (site.type !== "extraction") return 14;
  return site.output ? Math.max(12, Math.round(3 * Math.sqrt(site.output))) : 11;
}

function makeMarker(site) {
  const size = markerSize(site);
  const icon = L.divIcon({
    className: "",
    html: `<div class="he-marker ${site.type}" style="width:${size}px;height:${size}px"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });

  const marker = L.marker(site.coords, { icon, title: site.name });

  marker.bindPopup(
    `<b>${site.name}</b><br>${TYPE_LABEL[site.type]} · ${site.location}` +
      `<br><span class="popup-cta" data-id="${site.id}">View full details &rarr;</span>`
  );

  marker.on("click", () => showDetail(site));
  layers[site.type].addLayer(marker);
}

SITES.forEach(makeMarker);

// ---------- Flow lines ----------
FLOWS.forEach((flow) => {
  const pts = [coordOf(flow.from)];
  if (flow.via) pts.push(flow.via);
  pts.push(coordOf(flow.to));

  let style;
  if (flow.disrupted) {
    style = { color: COLORS.choke, weight: 3, opacity: 0.95, dashArray: "10 8", className: "flow-disrupted" };
  } else if (flow.backfill) {
    style = { color: COLORS.producer, weight: 2.5, opacity: 0.85, dashArray: "2 8", className: "" };
  } else {
    style = { color: "rgba(120,200,255,.7)", weight: 2, opacity: 0.6, dashArray: null, className: "" };
  }

  const line = L.polyline(pts, style);
  if (flow.note) line.bindTooltip(flow.note, { sticky: true });
  layers.flows.addLayer(line);

  // Directional arrowhead pointing from source to destination
  if (typeof L.polylineDecorator === "function") {
    const arrowColor = flow.disrupted ? COLORS.choke : flow.backfill ? COLORS.producer : "#8fd0ff";
    const decorator = L.polylineDecorator(line, {
      patterns: [
        {
          offset: "62%",
          repeat: 0,
          symbol: L.Symbol.arrowHead({
            pixelSize: 11,
            polygon: true,
            pathOptions: { stroke: false, fillOpacity: 0.95, color: arrowColor }
          })
        }
      ]
    });
    layers.flows.addLayer(decorator);
  }
});

// ---------- Chokepoint ----------
const chokeIcon = L.divIcon({
  className: "",
  html: `<div class="choke-icon" style="width:26px;height:26px">✕</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});
const chokeMarker = L.marker(CHOKEPOINT.coords, { icon: chokeIcon, zIndexOffset: 1000 })
  .bindPopup(`<b>${CHOKEPOINT.title}</b><br>${CHOKEPOINT.text}`)
  .bindTooltip(CHOKEPOINT.label, {
    permanent: true,
    direction: "top",
    offset: [0, -14],
    className: "choke-label"
  });
layers.choke.addLayer(chokeMarker);

// Disruption ring around the strait
layers.choke.addLayer(
  L.circle(CHOKEPOINT.coords, {
    radius: 220000,
    color: COLORS.choke,
    weight: 1.5,
    fillColor: COLORS.choke,
    fillOpacity: 0.12,
    dashArray: "6 6"
  })
);

// ---------- Layer toggle control ----------
const overlays = {
  '<span style="color:#3fb27f">●</span> Extraction sites': layers.extraction,
  '<span style="color:#f2b134">●</span> Producers / distributors': layers.producer,
  '<span style="color:#4ea1ff">●</span> Demand centres': layers.demand,
  "↝ Supply flow routes": layers.flows,
  '<span style="color:#ff4d4d">✕</span> Hormuz chokepoint': layers.choke
};
L.control.layers(null, overlays, { collapsed: false, position: "topright" }).addTo(map);

// ---------- Sidebar detail rendering ----------
const sidebar = document.getElementById("sidebar");
const defaultPane = document.getElementById("sidebar-default");
const detailPane = document.getElementById("sidebar-detail");
const detailContent = document.getElementById("detail-content");

function showDetail(site) {
  const statusClass =
    site.status === "offline" ? "offline" : site.status === "dev" ? "dev" : "online";

  detailContent.innerHTML = `
    <div class="detail-head">
      <span class="detail-tag ${site.type}">${TYPE_LABEL[site.type]}</span>
    </div>
    <h2>${site.name}</h2>
    <p class="detail-loc">${site.location}</p>
    <div class="detail-status ${statusClass}"><span class="dot"></span>${STATUS_LABEL[site.status]}</div>
    <p class="detail-desc">${site.role}</p>
    <ul class="detail-metrics">
      ${site.metrics
        .map((m) => `<li><span class="m-label">${m[0]}</span><span class="m-val">${m[1]}</span></li>`)
        .join("")}
    </ul>
  `;

  defaultPane.hidden = true;
  detailPane.hidden = false;

  // Ensure the panel is visible on mobile
  sidebar.classList.remove("collapsed");
  document.getElementById("map").classList.remove("expanded");
  sidebar.scrollTop = 0;

  map.flyTo(site.coords, Math.max(map.getZoom(), 4), { duration: 0.6 });
}

function showOverview() {
  detailPane.hidden = true;
  defaultPane.hidden = false;
}

document.getElementById("detail-back").addEventListener("click", showOverview);

// Popup "view details" link
map.on("popupopen", (e) => {
  const link = e.popup.getElement().querySelector(".popup-cta");
  if (link) {
    link.addEventListener("click", () => {
      const site = siteById[link.dataset.id];
      if (site) {
        map.closePopup();
        showDetail(site);
      }
    });
  }
});

// ---------- Mobile panel toggle ----------
document.getElementById("panel-toggle").addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  document.getElementById("map").classList.toggle("expanded");
  setTimeout(() => map.invalidateSize(), 250);
});

// Keep map sized correctly
window.addEventListener("resize", () => map.invalidateSize());
