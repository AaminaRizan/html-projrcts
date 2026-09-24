# CRUSH — full site

A dark, chrome, spotlit product site for the CRUSH energy drink cans (Pomegranate, Red Fruit, Pink + Blue, Blue Raspberry, Tropical Passion).

## Pages / sections

1. **Hero** — an infinite 3D carousel of all 5 real can models, spotlit against black.
   - **Grab the centered can and drag it** to spin it in place — a real "pick it up and turn it" interaction. Tap it (no drag) to open its detail panel.
   - Drag empty space (or use the arrow buttons, or drag the progress dot) to page between flavors — it loops forever, there's no first/last flavor to dead-end on.
   - Side cans recede, dim and blur slightly (depth-of-field style) to keep focus on the center can.
   - The condensation "puddle" plane baked into each `.glb` had no real material on it (it rendered as a flat, ghostly card, not a puddle) — it's hidden now, replaced with a crafted glossy puddle sprite under each can. The camera also looks down at a steeper angle than the first pass so the puddle actually reads as an ellipse instead of disappearing edge-on.
2. **Flavors** — a scroll-revealed showcase row per flavor (label art + name + tagline + nutrition chips); clicking a flavor image opens the same detail panel as the hero.
3. **Story** — brand statement + the three pillars (Energy Boost / Focus Enhanced / Hydration Support) pulled from the can labels.
4. **Footer** — nav, socials, legal placeholders.

## Running it locally

Browsers block ES module imports and 3D model loading (`fetch`) over `file://`, so you need to serve the folder over local HTTP — you can't just double-click `index.html`.

From inside this folder, run **one** of these, then open the printed URL:

```bash
# Python (usually preinstalled on Mac/Linux)
python3 -m http.server 8000

# Node
npx serve .

# VS Code
# Right-click index.html → "Open with Live Server"
```

Then visit `http://localhost:8000` (or whatever port/URL your tool prints).

## Notes

- Requires an internet connection on first load — it pulls Three.js from a CDN (jsdelivr) and the Space Grotesk/Inter fonts from Google Fonts, rather than bundling them, to keep the project lightweight. For a fully offline build, vendor `three` r160 + the `GLTFLoader`/`RoomEnvironment` addons locally and swap the `importmap` in `index.html`, and self-host the fonts.
- All copy (flavor names, taglines, nutrition chips, pillar descriptions) lives in one place — `data.js` — so you can edit real copy without touching any HTML/JS logic.
- The hero's accent color (progress bar, puck glow, chrome bolt emissive) shifts to match whichever flavor is centered.

## Structure

```
index.html    page markup (hero, flavors, story, footer)
style.css     all styling
data.js       flavor copy + nutrition chips + brand pillars (edit content here)
hero.js       Three.js hero carousel (scene, lighting, drag/click interaction)
panel.js      shared flavor detail panel (used by hero + flavor showcase)
app.js        flavor showcase / pillars rendering + scroll reveal + footer year
assets/*.glb          your 5 can models
assets/textures/*.jpg downsized label art (flavor showcase images + detail panel background)
```
