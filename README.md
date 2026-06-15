# The Helium Bottleneck: Global Supply Chain Map (2026)

An interactive single-page web app visualising the global helium supply chain
and the **2026 Strait of Hormuz disruption** that has taken roughly **27–30% of
global helium supply** offline since March 2026.

![Helium supply chain map](https://img.shields.io/badge/Leaflet.js-map-brightgreen) ![No API key](https://img.shields.io/badge/API_key-not_required-blue)

## Features

- **Interactive world map** (Leaflet.js, dark CARTO basemap, no API key needed) showing:
  - **Extraction sites / reserves:** US (La Barge, Wyoming; ex-Federal Helium Reserve / Cliffside, now Messer-operated), Qatar (Ras Laffan), Algeria, Russia (Amur GPP), Tanzania (Rukwa Basin / Helium One), Canada and South Africa.
  - **Producers / distributors** (toggle layer): Linde, Air Products, Air Liquide, Messer.
  - **Demand centres:** TSMC, Samsung, SK hynix semiconductor fabs and Seagate / Western Digital helium-sealed HDD manufacturing.
- **Highlighted chokepoint:** the Strait of Hormuz is emphasised with a pulsing marker, disruption ring and annotation explaining the supply impact.
- **Click interactions:** markers open a popup, and "view full details" loads a sidebar with role, production share and current status.
- **Flow lines:** static + animated lines from extraction sites to demand centres; disrupted Qatari routes are drawn in dashed red through the Strait of Hormuz.
- **Legend** distinguishing extraction sites, producers, demand centres, the chokepoint and flow types.
- **About-this-bottleneck panel** explaining why helium can't be stockpiled and why disruptions take years to resolve.
- **Clean, mobile-responsive** design suitable for sharing.

## Run locally

It's all static files, just serve the folder:

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000
```

Or open `index.html` directly in a browser.

## Deploy

Works as-is on **GitHub Pages**, **Netlify** or **Vercel** with no build step.

- **GitHub Pages:** push to your repo, then Settings → Pages → deploy from branch (root).
- **Netlify / Vercel:** point at the repo; no build command, publish directory `.`.

## File structure

```
index.html              # markup, panels, legend, social-preview tags
css/style.css           # styling & responsive layout
js/data.js              # supply-chain data (edit figures here)
js/app.js               # Leaflet map, markers, flows, interactions
assets/og-preview.png   # 1200x630 social-preview (Open Graph) image
scripts/make-og-image.py# regenerates the preview image (python3 + Pillow)
```

### Social preview

`index.html` includes Open Graph / Twitter tags so the link renders as a card
with a thumbnail when shared (e.g. on LinkedIn). The `og:url` and `og:image`
tags use absolute URLs pointing at
`https://g30r633.github.io/helium-supply-map/`. **Update these if you deploy
to a different domain**, otherwise the preview image won't resolve.

Regenerate the preview image after a design change with:

```bash
pip install Pillow
python3 scripts/make-og-image.py
```

## Data notes

Figures are approximate and **verified as of April 2026**, for illustration:

| Metric | Value |
| --- | --- |
| Total global production (2025) | ~190M m³ |
| US output (largest producer) | ~81M m³/yr |
| Qatar share of global supply | ~33% (~63M m³ in 2025), **offline since March 2026** |
| Supply disrupted by Hormuz closure | ~27–30% |
| Semiconductor demand | 20–25% of global helium (projected ~30% by 2030) |
| Helium-sealed HDDs (10TB+) | No substitute; Seagate/WD 2026 capacity fully allocated |

Edit `js/data.js` to update sites, statuses or flow routes.
