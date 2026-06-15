#!/usr/bin/env python3
"""Generate a PNG favicon fallback (assets/favicon.png, 180x180).
Run: python3 scripts/make-favicon.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

S = 180
img = Image.new("RGB", (S, S), (15, 20, 25))
d = ImageDraw.Draw(img)

# radial-ish glow (top-left) by stacking translucent ellipses
glow = Image.new("RGB", (S, S), (15, 20, 25))
gd = ImageDraw.Draw(glow)
for r in range(150, 0, -6):
    a = int(40 * (r / 150))
    gd.ellipse([60 - r, 40 - r, 60 + r, 40 + r],
               fill=(15 + a // 2, 20 + a, 25 + a + 20))
img = Image.blend(img, glow, 0.6)
d = ImageDraw.Draw(img)

font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 92)
text = "He"
bbox = d.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
d.text(((S - tw) / 2 - bbox[0], (S - th) / 2 - bbox[1]), text, font=font, fill=(78, 161, 255))

os.makedirs("assets", exist_ok=True)
img.save("assets/favicon.png", "PNG")
print("wrote assets/favicon.png", img.size)
