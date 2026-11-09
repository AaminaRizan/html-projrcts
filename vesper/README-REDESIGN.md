# VESPER / Peach & Midnight Blue redesign

Open `index.html` in a browser. Use a local static server if your browser restricts file access.

## Updated
- Roadster photographic homepage hero using the supplied image.
- Three-slice editorial showcase: the Emerald, Ocean and Crimson assets were supplied in `showcase-images.zip`. Each watch's three slices came from the same full image, with exact matching source dimensions. Switch automatically every 4.8 seconds while in view, or on hover, focus or tap a watch selector. Autoplay can be paused. On touchscreens, swipe horizontally to change watches.
- `Look a little closer` displays the same triple-panel images with independent previous/next controls, descriptive text and links to the corresponding product listing.
- Deep navy #14243B and light peach #F6DED1 design treatment; DM Sans typography, flat peach buttons.
- Existing enquiry, collection, true-size watch inspection and saved-watch functionality retained.

## Notes
- The silk watch compositions are editorial image concepts, not verified photos of the physical inventory. Use original verified listing photos for condition and buying decisions.
- All listed prices remain unverified (`price: null`) and WhatsApp/email are placeholders in `stock.js`; no payment backend exists.
- A true visual browser check was not possible because the browser runtime blocked both local-file and loopback navigation. JavaScript syntax and static asset paths passed checks.
