/* =========================================================
   SHOP SETTINGS + STOCK
   This is the only file you need to edit to run the shop.
   ---------------------------------------------------------
   Before publishing, check every field marked CHECK:
   prices, what's included, and the reference numbers.
   ========================================================= */

window.SHOP = {
  name: "VESPER",                       // shop name (wordmark)
  tagline: "Fine watches, honestly described.",
  city: "Kandy, Sri Lanka",
  whatsapp: "94XXXXXXXXX",              // CHECK: international format, no + or spaces
  email: "hello@example.com",           // CHECK
  currency: "LKR",
  timeZone: "Asia/Colombo",
  hours: { open: 10, close: 19, days: [1, 2, 3, 4, 5, 6] }, // Mon–Sat, 10:00–19:00
  scale: 5.2                            // px per mm on the tray (desktop). Keeps every watch to scale.
};

/* ---------------------------------------------------------
   One object per watch.

   price        → a number (e.g. 185000), or null to show "Price on request"
   photos.top   → the main photo (transparent background works best)
   photos.caseRatio → case diameter ÷ photo width (0–1). Keeps photos to scale.
   photos.gallery → extra photos for the file (angled, caseback, clasp, box)
   pins         → condition notes in % over the main photo: { x, y, note }
   history      → lines for "The file": { when, what }
   status       → "available" | "reserved" | "sold"
   grade        → "New" | "Unworn" | "Excellent" | "Very good" | "Good"
   --------------------------------------------------------- */

window.STOCK = [
  {
    lot: "001", featured: true,
    brand: "Tissot", model: "Chrono XL Classic",
    ref: "T116.617.11.092.00",           // CHECK against the box/warranty card
    year: null, mm: 45,
    price: null,                          // CHECK: add your price, e.g. 185000
    status: "available",
    grade: "New",
    included: "Box and warranty card",    // CHECK
    summary: "Green sunray dial with Arabic numerals, three sub-dials and a date at 4. Steel bracelet.",
    photos: { top: "photos/chrono-xl-green.webp", caseRatio: 0.886, gallery: [] },
    pins: [],
    history: [],
    specs: {
      Movement: "Swiss quartz chronograph",
      Case: "Stainless steel",
      Crystal: "Sapphire",
      "Water resistance": "100 m",
      Bracelet: "Stainless steel"
    }
  },
  {
    lot: "002",
    brand: "Tissot", model: "Seastar 1000 Chronograph",
    ref: "T120.417.11.041.01",           // CHECK
    year: null, mm: 45.5,
    price: null,                          // CHECK
    status: "available",
    grade: "New",
    included: "Box and warranty card",    // CHECK
    summary: "Blue gradient dial, black unidirectional diver's bezel, 300 m water resistance. Steel bracelet.",
    photos: { top: "photos/seastar-1000-blue.webp", caseRatio: 0.906, gallery: [] },
    pins: [],
    history: [],
    specs: {
      Movement: "Swiss quartz chronograph",
      Case: "Stainless steel",
      Bezel: "Unidirectional, 60-minute scale",
      Crystal: "Sapphire",
      "Water resistance": "300 m",
      Bracelet: "Stainless steel"
    }
  },
  {
    lot: "003",
    brand: "Tissot", model: "Supersport Chrono",
    ref: "T125.617.16.051.00",           // CHECK
    year: null, mm: 45.5,
    price: null,                          // CHECK
    status: "available",
    grade: "New",
    included: "Box and warranty card",    // CHECK
    summary: "Black dial with red chronograph hands, tachymeter bezel, black leather strap with white stitching.",
    photos: { top: "photos/supersport-black.webp", caseRatio: 0.884, gallery: [] },
    pins: [],
    history: [],
    specs: {
      Movement: "Swiss quartz chronograph",
      Case: "Stainless steel",
      Bezel: "Tachymeter",
      Crystal: "Sapphire",
      "Water resistance": "100 m",
      Strap: "Black leather"
    }
  }
];
