/* =========================================================
   VESPER — script
   - The lamp: a pool of light that follows the cursor; steel and crystal turn toward it.
   - The tray: every watch drawn to scale (mm × px-per-mm).
   - The file: loupe, condition pins, history, specs, WhatsApp enquiry.
   - True size: calibrate with a bank card, see the case at its real size.
   No libraries. Edit stock.js, not this file, to change the shop.
   ========================================================= */
(() => {
  "use strict";

  const SHOP = window.SHOP || {};
  const STOCK = (window.STOCK || []).map(w => ({ photos: { top: "", caseRatio: .44, gallery: [] }, pins: [], history: [], specs: {}, ...w }));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reducedMQ = matchMedia("(prefers-reduced-motion: reduce)");
  const fineMQ = matchMedia("(hover: hover) and (pointer: fine)");

  const GRADES = {
    "New": "Brand new, with the maker's packaging.",
    "Unworn": "Never on a wrist. Stickers often still on.",
    "Excellent": "Hairlines visible only under a loupe.",
    "Very good": "Light wear you can see at an angle.",
    "Good": "Honest marks of daily wear. All shown."
  };

  const price = w => w.status === "sold"
    ? (w.soldNote || "Sold")
    : (w.price == null || w.price === "")
      ? "Price on request"
      : `${SHOP.currency || ""} ${Number(w.price).toLocaleString("en-US")}`.trim();
  const priceNum = (w, dir) => (w.price == null ? (dir > 0 ? Infinity : -Infinity) : w.price);
  const metaLine = w => [`No. ${w.lot}`, w.ref && `Ref. ${w.ref}`, w.year, `${w.mm} mm`].filter(Boolean).join(" · ");
  const title = w => `${w.brand} ${w.model}`;

  /* ---------- shop settings into the page ---------- */
  $$("[data-shop-name]").forEach(el => (el.textContent = SHOP.name || "VESPER"));
  $$("[data-shop-city]").forEach(el => (el.textContent = SHOP.city || ""));
  $$("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));
  document.title = `${(SHOP.name || "Vesper").replace(/^\w/, c => c)} — ${SHOP.tagline || "Fine watches"}`;

  const waLink = text => `https://wa.me/${SHOP.whatsapp || ""}?text=${encodeURIComponent(text)}`;
  $$("[data-whatsapp]").forEach(a => (a.href = waLink(`Hello ${SHOP.name}, I'd like to arrange a viewing.`)));
  $$("[data-email]").forEach(a => (a.href = `mailto:${SHOP.email || ""}`));

  /* =========================================================
     RENDERING
     ========================================================= */
  function placeholderHTML(w) {
    const r = w.render || {};
    const cls = [
      "pw",
      `band-${r.band || "oyster"}`,
      `bezel-${r.bezel || "smooth"}`,
      `tex-${r.texture || "sunburst"}`,
      r.chrono ? "chrono" : ""
    ].join(" ");
    const idx = Array.from({ length: 12 }, (_, i) =>
      (r.chrono && (i === 3 || i === 6 || i === 9)) ? "" :
      `<div class="pw__idx${i === 0 ? " is-12" : ""}" style="--i:${i}"></div>`).join("");
    const subs = r.chrono ? `<div class="pw__sub pw__sub--l"></div><div class="pw__sub pw__sub--b"></div><div class="pw__sub pw__sub--r"></div>` : "";
    return `
      <div class="${cls}" style="--dial:${esc(r.dial || "#2E4F80")};--bezel-color:${esc(r.bezelColor || "#1D3A66")}" aria-hidden="true">
        <div class="pw__band pw__band--top"></div><div class="pw__band pw__band--bottom"></div>
        <div class="pw__lug pw__lug--tl"></div><div class="pw__lug pw__lug--tr"></div>
        <div class="pw__lug pw__lug--bl"></div><div class="pw__lug pw__lug--br"></div>
        <div class="pw__crown"></div>
        <div class="pw__case"></div>
        <div class="pw__bezel"></div>
        <div class="pw__dial">
          ${subs}${idx}
          <div class="pw__hand pw__hand--h"></div>
          <div class="pw__hand pw__hand--m"></div>
          <div class="pw__hand pw__hand--s"></div>
          <div class="pw__cap"></div>
        </div>
        <div class="pw__crystal"></div>
      </div>`;
  }

  // dCss = CSS length for the case diameter
  function mediaHTML(w, dCss, src) {
    const photo = src ?? w.photos.top;
    const inner = photo
      ? `<img class="media__img" src="${esc(photo)}" alt="${esc(title(w))}, photographed from above" style="--ratio:${w.photos.caseRatio || .44}" loading="lazy" draggable="false">`
      : placeholderHTML(w);
    return `<div class="media" style="--d:${dCss}">${inner}</div>`;
  }

  /* ---------- the tray ---------- */
  const trayEl = $("[data-tray]");
  const tray = $(".tray");
  const forSale = STOCK.filter(w => w.status !== "sold");
  const brands = ["All", ...new Set(forSale.map(w => w.brand))];
  let brand = "All";
  let sort = "lot";
  let searchTerm = "";
  const searchBox = $("[data-search]");
  if (searchBox) searchBox.addEventListener("input", e => { searchTerm = e.target.value.trim().toLowerCase(); renderTray(); });

  $("[data-brands]").innerHTML = brands.map(b =>
    `<button class="chip" type="button" aria-pressed="${b === "All"}" data-brand="${esc(b)}">${esc(b)}</button>`).join("");
  if (brands.length <= 2) $("[data-brands]").hidden = false;   // one brand: no need for chips
  $("[data-brands]").addEventListener("click", e => {
    const b = e.target.closest("[data-brand]");
    if (!b) return;
    brand = b.dataset.brand;
    $$("[data-brand]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    renderTray();
  });
  $("[data-sort]").addEventListener("change", e => { sort = e.target.value; renderTray(); });

  function renderTray() {
    let list = forSale.filter(w => (brand === "All" || w.brand === brand) && (!searchTerm || `${w.brand} ${w.model} ${w.ref || ""} ${w.summary || ""}`.toLowerCase().includes(searchTerm)));
    const by = {
      "lot": (a, b) => a.lot.localeCompare(b.lot),
      "price-asc": (a, b) => priceNum(a, 1) - priceNum(b, 1),
      "price-desc": (a, b) => priceNum(b, -1) - priceNum(a, -1),
      "size": (a, b) => a.mm - b.mm
    }[sort];
    list = [...list].sort(by);
    $("[data-count]").textContent = list.length;
    trayEl.innerHTML = list.length ? list.map(w => `
      <li>
        <button class="lot" type="button" data-open="${esc(w.lot)}" aria-label="No. ${esc(w.lot)}, ${esc(title(w))}, ${esc(w.mm)} millimetres, ${esc(price(w))}">
          ${mediaHTML(w, `calc(${w.mm}px * var(--scale))`)}
          ${w.status === "reserved" ? `<span class="lot__badge badge badge--reserved">Reserved</span>` : ""}
          <span class="lot__meta">
            <span class="lot__no silver">No. ${esc(w.lot)} · ${esc(w.mm)} mm</span>
            <span class="lot__name">${esc(w.brand)}<small>${esc(w.model)}</small></span>
            <span class="lot__price">${esc(price(w))}</span>
          </span>
        </button>
      </li>`).join("") : `<li class="tray__empty">Nothing from ${esc(brand)} on the tray right now.</li>`;
    refreshLampTargets();
  }
  trayEl.addEventListener("click", e => { const b = e.target.closest("[data-open]"); if (b) openFile(b.dataset.open); });

  function setScale() {
    const base = SHOP.scale || 5.2;
    const w = innerWidth;
    const s = w < 480 ? base * .6 : w < 900 ? base * .78 : base;
    tray.style.setProperty("--scale", s.toFixed(2));
  }

  /* ---------- hero ---------- */
  let heroLot = STOCK.find(w => w.featured && w.status !== "sold") || forSale[0];
  const heroBtn = $("[data-hero]");
  const heroPiece = $(".hero__piece");
  function renderHero() {
    if (!heroLot) return;
    const box = heroPiece.getBoundingClientRect();
    const d = Math.round(Math.min(box.height * .4, box.width * .62, 360));
    heroBtn.innerHTML = mediaHTML(heroLot, d + "px");
    heroBtn.dataset.open = heroLot.lot;
    $("[data-hero-caption]").innerHTML =
      `No. ${esc(heroLot.lot)} · ${esc(title(heroLot))}<br>${[heroLot.ref && "Ref. " + esc(heroLot.ref), heroLot.year, heroLot.mm + " mm"].filter(Boolean).join(" · ")}<br><span class="silver">${esc(price(heroLot))}</span>`;
    refreshLampTargets();
  }
  heroBtn.addEventListener("click", () => openFile(heroBtn.dataset.open));
  document.addEventListener('vesper:hero-select', e => {
    const next=STOCK.find(w=>w.lot===e.detail.lot && w.status!=='sold');
    if(!next) return;
    heroLot=next;renderHero();
  });

  /* ---------- archive ---------- */
  const sold = STOCK.filter(w => w.status === "sold");
  if (!sold.length) {                       // nothing sold yet: hide the archive and its link
    $("#archive").hidden = true;
    $$('a[href="#archive"]').forEach(a => (a.hidden = true));
  }
  $("[data-archive]").innerHTML = sold.map(w => `
    <li class="archive__item">
      ${mediaHTML(w, `${Math.round(w.mm * 3)}px`)}
      <p>${esc(title(w))}</p>
      <p class="mono">No. ${esc(w.lot)} · ${esc(w.soldNote || "Sold")}</p>
    </li>`).join("");

  /* =========================================================
     THE LAMP
     ========================================================= */
  const zones = $$(".lamp-zone").map(el => ({
    el, x: 0, y: 0, tx: 0, ty: 0, inside: false, visible: true, pws: []
  }));
  function refreshLampTargets() { zones.forEach(z => (z.pws = $$(".pw", z.el))); }

  function defaultTarget(z) {
    const r = z.el.getBoundingClientRect();
    if (z.el.classList.contains("hero")) {
      const p = heroPiece.getBoundingClientRect();
      return [p.left - r.left + p.width * .42, p.top - r.top + p.height * .38];
    }
    if (!fineMQ.matches) {   // touch: the lamp follows the middle of the screen as you scroll
      return [r.width / 2, clamp(innerHeight * .45 - r.top, 0, r.height)];
    }
    return [r.width * .5, r.height * .4];
  }

  zones.forEach(z => {
    [z.x, z.y] = [z.tx, z.ty] = defaultTarget(z);
    z.el.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const r = z.el.getBoundingClientRect();
      z.tx = e.clientX - r.left; z.ty = e.clientY - r.top; z.inside = true;
    });
    z.el.addEventListener("pointerleave", () => { z.inside = false; });
  });
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    const z = zones.find(q => q.el === en.target); if (z) z.visible = en.isIntersecting;
  }));
  zones.forEach(z => io.observe(z.el));

  function lampFrame() {
    const k = reducedMQ.matches ? 1 : .14;
    for (const z of zones) {
      if (!z.visible) continue;
      if (!z.inside) [z.tx, z.ty] = defaultTarget(z);
      z.x += (z.tx - z.x) * k;
      z.y += (z.ty - z.y) * k;
      z.el.style.setProperty("--lx", z.x.toFixed(1) + "px");
      z.el.style.setProperty("--ly", z.y.toFixed(1) + "px");

      // Steel and crystal turn toward the lamp
      const zr = z.el.getBoundingClientRect();
      const lx = zr.left + z.x, ly = zr.top + z.y;
      for (const pw of z.pws) {
        const r = pw.getBoundingClientRect();
        if (!r.width) continue;
        const dx = lx - (r.left + r.width / 2), dy = ly - (r.top + r.height / 2);
        const ang = Math.atan2(dx, -dy) * 180 / Math.PI;      // clockwise from 12 o'clock
        pw.style.setProperty("--ang", ang.toFixed(1) + "deg");
        pw.style.setProperty("--gx", clamp(50 + dx / r.width * 30, 18, 82).toFixed(1) + "%");
        pw.style.setProperty("--gy", clamp(50 + dy / r.height * 30, 16, 80).toFixed(1) + "%");
      }
    }
    requestAnimationFrame(lampFrame);
  }

  /* =========================================================
     THE FILE
     ========================================================= */
  const fileDlg = $("[data-file]");
  const stagebox = $("[data-stagebox]");
  const stageMedia = $("[data-file-media]");
  const pinsEl = $("[data-pins]");
  const loupe = $("[data-loupe]");
  const loupeInner = $(".loupe__inner", loupe);
  let current = null;
  let currentView = 0;

  function views(w) { return [w.photos.top, ...(w.photos.gallery || [])].filter(Boolean); }

  function renderStage() {
    const w = current;
    const v = views(w);
    const box = stagebox.getBoundingClientRect();
    const src = v[currentView];
    if (src && currentView > 0) {
      // gallery photo: show it whole
      stageMedia.innerHTML = `<img class="stage-photo" src="${esc(src)}" alt="${esc(title(w))}, view ${currentView + 1}" draggable="false">`;
      pinsEl.innerHTML = "";
    } else {
      const d = Math.round(box.width * .58);
      stageMedia.innerHTML = mediaHTML(w, d + "px");
      renderPins(w);
    }
    layoutPins();
    $$("[data-view]").forEach(t => t.setAttribute("aria-pressed", String(+t.dataset.view === currentView)));
    zones.forEach(z => { if (z.el === stagebox) z.pws = $$(".pw", stagebox); });
    loupeInner.innerHTML = "";
  }

  // Pins sit in % of the real photo when there is one, otherwise of the viewer
  function layoutPins() {
    const img = $(".media__img", stageMedia);
    const reset = () => Object.assign(pinsEl.style, { left: "0", top: "0", width: "100%", height: "100%" });
    if (!img) return reset();
    const place = () => {
      const sr = stagebox.getBoundingClientRect(), ir = img.getBoundingClientRect();
      Object.assign(pinsEl.style, {
        left: ir.left - sr.left + "px", top: ir.top - sr.top + "px",
        width: ir.width + "px", height: ir.height + "px"
      });
    };
    img.complete ? place() : img.addEventListener("load", place, { once: true });
  }

  function renderPins(w) {
    pinsEl.innerHTML = w.pins.map((p, i) => `
      <button class="pin" type="button" style="left:${p.x}%;top:${p.y}%;--n:${i}" aria-label="Condition note ${i + 1}">
        ${i + 1}<span class="pin__note">${esc(p.note)}</span>
      </button>`).join("");
  }
  pinsEl.addEventListener("click", e => {
    const p = e.target.closest(".pin"); if (!p) return;
    $$(".pin", pinsEl).forEach(x => x.classList.toggle("is-open", x === p && !x.classList.contains("is-open")));
  });

  function openFile(lotNo) {
    const w = STOCK.find(x => x.lot === lotNo);
    if (!w) return;
    current = w;
    currentView = 0;
    $("[data-file-lot]").textContent = metaLine(w);
    $("[data-file-title]").innerHTML = `${esc(w.brand)} <em>${esc(w.model)}</em>`;
    $("[data-file-summary]").textContent = w.summary || "";
    $("[data-file-price]").textContent = price(w);
    const st = $("[data-file-status]");
    st.textContent = w.status;
    st.className = `badge mono badge--${w.status}`;
    $("[data-file-grade]").textContent = w.grade || "—";
    $("[data-file-grade-def]").textContent = GRADES[w.grade] || "";
    $("[data-pin-list]").innerHTML = w.pins.length
      ? w.pins.map((p, i) => `<li><span class="mono">${String(i + 1).padStart(2, "0")}</span><span>${esc(p.note)}</span></li>`).join("")
      : `<li><span class="mono">—</span><span>No marks worth noting.</span></li>`;
    $("[data-history]").innerHTML = w.history.map(h => `<li><span class="mono">${esc(h.when)}</span><span>${esc(h.what)}</span></li>`).join("");
    $("[data-history]").hidden = !w.history.length;
    $("[data-history-title]").hidden = !w.history.length;
    const specs = Object.fromEntries(Object.entries(
      { Reference: w.ref, Year: w.year, "Case size": `${w.mm} mm`, ...w.specs, Included: w.included }
    ).filter(([, v]) => v != null && v !== ""));
    $("[data-specs]").innerHTML = Object.entries(specs).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
    $("[data-file-enquire]").href = waLink(`Hello ${SHOP.name}, I'm interested in No. ${w.lot}: ${title(w)}${w.ref ? ` (Ref. ${w.ref})` : ""}. Is it still available?`);
    $("[data-file-enquire]").toggleAttribute("hidden", w.status === "sold");
    $("[data-stage-hint]").textContent = w.pins.length ? "Hover to inspect · Tap a pin to read it" : "Hover or press to inspect";

    const v = views(w);
    $("[data-thumbs]").innerHTML = v.length > 1
      ? v.map((src, i) => `<button class="thumb" type="button" data-view="${i}" aria-label="View ${i + 1}" aria-pressed="${i === 0}" style="background-image:url('${esc(src)}')"></button>`).join("")
      : "";

    if (!fileDlg.open) fileDlg.showModal();
    document.dispatchEvent(new CustomEvent("vesper:product", { detail: { lot: w.lot } }));
    renderStage();
    if (location.hash !== `#lot-${w.lot}`) history.replaceState(null, "", `#lot-${w.lot}`);
  }
  $("[data-thumbs]").addEventListener("click", e => {
    const t = e.target.closest("[data-view]"); if (!t) return;
    currentView = +t.dataset.view; renderStage();
  });
  $("[data-close-file]").addEventListener("click", () => fileDlg.close());
  fileDlg.addEventListener("click", e => { if (e.target === fileDlg) fileDlg.close(); });
  fileDlg.addEventListener("close", () => {
    if (location.hash.startsWith("#lot-")) history.replaceState(null, "", "#tray");
  });

  /* ---------- loupe: a magnified clone of what's under the cursor ---------- */
  const ZOOM = 2.6;
  function moveLoupe(e) {
    const media = stageMedia.firstElementChild;
    if (!media || e.target.closest(".pin")) { loupe.classList.remove("is-on"); return; }
    const sr = stagebox.getBoundingClientRect();
    const mr = media.getBoundingClientRect();
    const x = e.clientX - sr.left, y = e.clientY - sr.top;
    if (!loupeInner.firstElementChild) {
      const clone = media.cloneNode(true);
      clone.style.width = mr.width + "px";
      clone.style.height = mr.height + "px";
      if (clone.classList.contains("media")) clone.style.setProperty("--d", getComputedStyle(media).getPropertyValue("--d"));
      loupeInner.appendChild(clone);
    }
    const R = loupe.offsetWidth / 2;
    const mx = e.clientX - mr.left, my = e.clientY - mr.top;
    loupe.style.left = x + "px";
    loupe.style.top = y + "px";
    loupeInner.style.transform = `translate(${R - mx * ZOOM}px, ${R - my * ZOOM}px) scale(${ZOOM})`;
    loupe.classList.add("is-on");
  }
  stagebox.addEventListener("pointermove", e => {
    if (e.pointerType === "mouse" || e.buttons) moveLoupe(e);
  });
  stagebox.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") moveLoupe(e); });
  ["pointerleave", "pointerup", "pointercancel"].forEach(t =>
    stagebox.addEventListener(t, e => { if (t === "pointerleave" || e.pointerType !== "mouse") loupe.classList.remove("is-on"); }));

  /* =========================================================
     TRUE SIZE
     ========================================================= */
  const tsDlg = $("[data-truesize]");
  const card = $("[data-card]");
  const cardRange = $("[data-card-range]");
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }
  };
  const saved = parseFloat(store.get("vesper:cardPx"));
  if (saved) cardRange.value = saved;
  const syncCard = () => card.style.setProperty("--w", cardRange.value + "px");
  cardRange.addEventListener("input", syncCard);
  syncCard();
  const step = name => $$("[data-step]", tsDlg).forEach(s => (s.hidden = s.dataset.step !== name));

  $("[data-open-truesize]").addEventListener("click", () => {
    if (store.get("vesper:cardPx")) { showTrue(); step("watch"); } else step("calibrate");
    tsDlg.showModal();
  });
  function showTrue() {
    if (!current) return;
    const pxPerMm = +cardRange.value / 85.6;
    const d = (current.mm * pxPerMm).toFixed(1) + "px";
    $("[data-ts-title]").textContent = `This is ${current.mm} mm.`;
    $("[data-ts-stage]").innerHTML = mediaHTML(current, d);
    const pw = $("[data-ts-stage] .pw");
    if (pw) pw.style.setProperty("--ang", "135deg");
  }
  $("[data-show-true]").addEventListener("click", () => {
    store.set("vesper:cardPx", cardRange.value);
    showTrue();
    step("watch");
  });
  $("[data-recalibrate]").addEventListener("click", () => step("calibrate"));
  $("[data-close-truesize]").addEventListener("click", () => tsDlg.close());
  tsDlg.addEventListener("click", e => { if (e.target === tsDlg) tsDlg.close(); });

  /* =========================================================
     OPEN STATUS + TIME-OF-DAY LIGHT
     ========================================================= */
  function shopNow() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: SHOP.timeZone || undefined, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day, hour: +get("hour") + +get("minute") / 60 };
  }
  const pad = h => `${String(h).padStart(2, "0")}:00`;
  function updateStatus() {
    const h = SHOP.hours || { open: 10, close: 19, days: [1, 2, 3, 4, 5, 6] };
    const { day, hour } = shopNow();
    const open = h.days.includes(day) && hour >= h.open && hour < h.close;
    const el = $("[data-open-status]");
    el.textContent = open ? `Open now · until ${pad(h.close)}` : `Closed · opens ${pad(h.open)}`;
    el.classList.toggle("is-open", open);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const ds = h.days.map(d => dayNames[d]);
    $("[data-hours]").textContent = `${ds[0]}–${ds[ds.length - 1]} · ${pad(h.open)}–${pad(h.close)}`;

    // The room is a touch lighter in the afternoon, darkest at night.
    const local = new Date().getHours() + new Date().getMinutes() / 60;
    const lift = Math.max(0, Math.sin(((local - 6) / 12) * Math.PI));
    const mixHex = (a, b, t) => "#" + [1, 3, 5].map(i => {
      const x = parseInt(a.slice(i, i + 2), 16), y = parseInt(b.slice(i, i + 2), 16);
      return Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
    }).join("");
    const bg = mixHex("#0B0E13", "#131A25", lift * .85);
    document.documentElement.style.setProperty("--bg", bg);
    const meta = $('meta[name="theme-color"]'); if (meta) meta.content = bg;
  }

  /* =========================================================
     START
     ========================================================= */
  setScale();
  renderTray();
  renderHero();
  updateStatus();
  setInterval(updateStatus, 60000);

  let rT = 0;
  addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => { setScale(); renderHero(); if (fileDlg.open && current) renderStage(); }, 150);
  });

  const fromHash = () => { const m = location.hash.match(/^#lot-(.+)$/); if (m) openFile(decodeURIComponent(m[1])); };
  addEventListener("hashchange", fromHash);
  fromHash();

  if (!document.body.classList.contains("no-lamp")) requestAnimationFrame(lampFrame);
})();
