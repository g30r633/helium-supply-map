#!/usr/bin/env python3
"""Generate the social-preview (Open Graph) image for the helium map.
Output: assets/og-preview.png at 1200x630 (LinkedIn/Twitter recommended size).
Run: python3 scripts/make-og-image.py
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (15, 20, 25)
PANEL = (31, 39, 51)
TEXT = (231, 236, 242)
MUTED = (151, 163, 180)
GREEN = (63, 178, 127)
AMBER = (242, 177, 52)
BLUE = (78, 161, 255)
RED = (255, 77, 77)

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)

f_eyebrow = font("DejaVuSans-Bold.ttf", 24)
f_title   = font("DejaVuSans-Bold.ttf", 78)
f_stat    = font("DejaVuSans-Bold.ttf", 52)
f_sub     = font("DejaVuSans.ttf", 28)
f_legend  = font("DejaVuSans-Bold.ttf", 22)
f_foot    = font("DejaVuSans.ttf", 20)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Subtle radial glow top-left
glow = Image.new("RGB", (W, H), BG)
gd = ImageDraw.Draw(glow)
for r in range(420, 0, -8):
    a = int(18 * (r / 420))
    gd.ellipse([ -120 - r//3, -160 - r//3, 360 + r, 300 + r],
               fill=(BG[0]+a//3, BG[1]+a//2, BG[2]+a))
img = Image.blend(img, glow, 0.5)
d = ImageDraw.Draw(img)

# ---- Right-side abstract network graphic (evokes the map) ----
def dot(x, y, color, rad, ring=True):
    if ring:
        d.ellipse([x-rad-3, y-rad-3, x+rad+3, y+rad+3], outline=(255,255,255), width=2)
    d.ellipse([x-rad, y-rad, x+rad, y+rad], fill=color)

# nodes: (x, y, color)
choke = (980, 300)
sources = [(770, 170, GREEN), (760, 430, GREEN)]
demand  = [(1080, 150, BLUE), (1110, 330, BLUE), (1050, 470, BLUE), (820, 520, AMBER)]

# active flows (blue-ish) from sources to demand
for sx, sy, _ in sources:
    for dx, dy, _ in demand[:2]:
        d.line([sx, sy, dx, dy], fill=(120, 200, 255), width=2)

# disrupted flows through choke (red dashed)
def dashed(p1, p2, color, width=4, dash=14, gap=10):
    x1, y1 = p1; x2, y2 = p2
    dist = math.hypot(x2-x1, y2-y1)
    steps = int(dist // (dash+gap))
    for i in range(steps+1):
        s = i*(dash+gap)/dist
        e = min((i*(dash+gap)+dash)/dist, 1)
        d.line([x1+(x2-x1)*s, y1+(y2-y1)*s, x1+(x2-x1)*e, y1+(y2-y1)*e],
               fill=color, width=width)

for dx, dy, _ in demand[:3]:
    dashed(choke, (dx, dy), RED)

# disruption ring around choke
for rr in (70, 54):
    d.ellipse([choke[0]-rr, choke[1]-rr, choke[0]+rr, choke[1]+rr], outline=(255,77,77,80), width=2)

for sx, sy, c in sources: dot(sx, sy, c, 14)
for dx, dy, c in demand: dot(dx, dy, c, 11)
# choke marker (red square X)
cx, cy = choke
d.rounded_rectangle([cx-20, cy-20, cx+20, cy+20], radius=6, fill=RED, outline=(255,255,255), width=3)
d.line([cx-9, cy-9, cx+9, cy+9], fill=(255,255,255), width=4)
d.line([cx-9, cy+9, cx+9, cy-9], fill=(255,255,255), width=4)

# ---- Left text block ----
M = 70
# eyebrow with glowing dot
d.ellipse([M, 70, M+18, 88], fill=BLUE)
d.text((M+30, 67), "GLOBAL HELIUM SUPPLY CHAIN  ·  2026", font=f_eyebrow, fill=MUTED)

d.text((M, 120), "The Helium", font=f_title, fill=TEXT)
d.text((M, 200), "Bottleneck", font=f_title, fill=TEXT)

# headline stat
d.text((M, 320), "~33% of global supply", font=f_stat, fill=RED)
d.text((M, 380), "is offline", font=f_stat, fill=TEXT)

d.text((M, 452), "Strait of Hormuz closed  ·  Qatar offline since March 2026", font=f_sub, fill=MUTED)

# legend row
ly = 540
items = [("Extraction", GREEN), ("Producers", AMBER), ("Demand", BLUE), ("Chokepoint", RED)]
lx = M
for label, color in items:
    d.ellipse([lx, ly+3, lx+18, ly+21], fill=color, outline=(255,255,255), width=2)
    d.text((lx+28, ly), label, font=f_legend, fill=TEXT)
    lx += 32 + d.textlength(label, font=f_legend) + 40

os.makedirs("assets", exist_ok=True)
img.save("assets/og-preview.png", "PNG")
print("wrote assets/og-preview.png", img.size)
