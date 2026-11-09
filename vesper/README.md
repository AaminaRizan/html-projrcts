# Vesper: watch shop website

Open `index.html` in a browser. Keep all files in the same folder.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | Design: "Blued Steel" palette, the tray, the file, the lamp |
| `script.js` | Behaviour: lamp, to-scale tray, file, loupe, condition pins, true size |
| `stock.js` | **The only file you need to edit**: shop settings and every watch |
| `photos/` | Put your watch photos here |

## What's in this version

Three Tissot watches from your photos, already cut out of their backgrounds
(`photos/*.webp`, transparent) and measured so they sit to scale on the tray.

## Before publishing

1. In `stock.js`, set `SHOP.name`, `whatsapp` (e.g. `94771234567`), `email`, `city` and `hours`.
2. In `stock.js`, check every line marked `CHECK`: prices (now "Price on request"),
   what's included, and the reference numbers.
3. Rename the shop in `<title>` in `index.html` if you change the name.

## Adding your photos

For each watch:

1. Save the overhead photo in `photos/`, e.g. `photos/datejust-top.jpg`.
2. In that watch's entry in `stock.js`, set `photos.top: "photos/datejust-top.jpg"`.
3. Set `photos.caseRatio`: the case's width divided by the photo's width.
   If the round case is 900 px wide in a 2000 px photo, use `0.45`.
   This is what keeps every watch to scale on the tray.
4. Add other views to `photos.gallery` (angled shot, dial close-up, clasp, caseback, box).
5. Move the condition `pins` so they sit on the real marks: `x` and `y` are percentages
   from the left and top of the overhead photo.

**Photo tips:** camera straight above, same height for every watch, same dark background,
soft window light from one side, no flash, at least 2000 px, no retouching.
Cover or blur serial numbers. Use your own photos, not brand press images.

The placeholder drawings are only there until your photos arrive. They have no logos on purpose.

## Midnight Atelier upgrade (November 2026)

This edition preserves the existing real Tissot stock, product details, interactive lamp, magnifier, inspection notes, and true-size viewer. It adds:

- A more dramatic Midnight Atelier hero and polished silver styling
- Ivory editorial philosophy and campaign sections, plus a strong closing statement
- Entrance animations, scroll-based reveal, progress indicator, and hover details
- Mobile menu with proper expanded state
- Live collection search by brand, model, reference, or description
- A working saved-watch shortlist stored locally in the browser
- Saved-watch drawer with remove and reopen-product actions
- Reduced-motion accommodations

### How to run

Open `index.html` in a modern browser, or use `python -m http.server 8000` in the `vesper/` directory and browse to `http://localhost:8000`.

### Before putting this online

This is a working **front-end watch dealer showcase with an enquiry flow**, not an operational payment-enabled e-commerce backend. The included inventory is *Tissot*, not a fictional original watch brand. Do not change the makers on the existing images. To launch an original watch brand, supply original watch photography, real model/specification data, stock and prices.

**Required:** Replace placeholder WhatsApp number and email in `stock.js`; verify every stock reference, item description, condition and included accessories; set genuine prices. To accept payments, add a properly secured commerce backend, inventory reservations, tax/shipping handling, payment provider, order management, and policies. Never ship a fake checkout.

### Files changed

- `index.html`: new editorial sections and shortlist markup
- `styles.css`: Midnight Atelier design and responsive animation layer
- `script.js`: dynamic search and watch event integration
- `experience.js`: animations, progress, mobile navigation and saved-watch state
- `stock.js`: original uploaded inventory preserved


## V3 — Cinematic showroom (November 2026)

- SVG watch-dial intro: second hand aligns to 12, then an expanding **circular page reveal**. Visitors can skip; repeats within a browser session skip automatically; reduced-motion users skip automatically.
- Modern Manrope typography; removed italic display headlines, chrome/silver-gradient buttons and floating hero watch animation.
- Full-bleed green-watch campaign image, faint background VESPER lettering, and functional three-watch selection with arrow keys/buttons and mobile touch swipe.
- Interactive 4-frame detail gallery; editorial wristwatch lifestyle panel.
- Product drawer, loupe, scale-calibrated viewing, collection filters, saved list and enquiry remain.
- Does **not** include a real checkout: current stock prices and contact fields are placeholders.
- Campaign and some lifestyle images are *conceptual/generated*: the details may not exactly match actual Tissot references. Do not use those images as evidence of an item's exact appearance or condition. Use verified photographs on product detail pages.

New `showroom.js` owns the watch-dial introduction, circular reveal and image navigation.

Important: manually inspect the desktop and mobile view before publishing; a full graphical browser pass was blocked in this environment.


## V4 changes
- Removed overline, right-side scroll prompt and bottom hero selector.
- Unified all website typography to Inter.
- Gallery uses exclusively green Tissot Chrono XL photography; new `vesper-detail-*.webp` are cropped from the original featured watch images.
- Enquiry-based buying and original inspection features remain unchanged.


## V5 refinement
- Font: Manrope across all screens, dialogs and controls.
- Hero: removed the eyebrow, vertical scroll indicator and bottom selector.
- Opening: real expanding circular clip-path on the homepage, layered ABOVE the intro. Intro runs once per tab/session; use a private window to replay. Respects reduced-motion.
- Detail gallery: uses six supplied, original photos of one silver-dial T165 watch (front, angle, side, bracelet, caseback, wrist). This is **not** the green Chrono XL featured in the hero; captions are explicit to avoid confusing inventory. No invented crops or generated photos used there.
