/* Vesper / Midnight Atelier experience layer. No external dependencies. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBar = $('.scroll-progress');
  let scrollScheduled = false;
  function updateScroll() {
    scrollScheduled = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (scrollBar) scrollBar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    document.body.classList.toggle('scrolled', scrollY > 60);
  }
  addEventListener('scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); }
  }, {passive:true});
  addEventListener('resize', updateScroll); updateScroll();

  // Entrance sequence and sectional storytelling. Elements remain visible if JS is disabled.
  document.body.classList.add('experience-ready');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }, {threshold:0.09, rootMargin:'0px 0px -35px 0px'});
    $$('.reveal, .section-head, .method__steps > li, .visit__head, .archive__head, .tray__list > li').forEach(el => observer.observe(el));
    const list = $('[data-tray]');
    if (list) new MutationObserver(() => $$('.tray__list > li').forEach(el=>observer.observe(el))).observe(list,{childList:true});
  } else $$('.reveal, .section-head, .method__steps > li, .visit__head, .archive__head').forEach(el=>el.classList.add('in-view'));

  // Accessible mobile navigation.
  const menuBtn = $('[data-menu-toggle]');
  const nav = $('#primary-nav');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
    menuBtn?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('a', nav).forEach(link => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if(e.key==='Escape') setMenu(false); });
  addEventListener('resize', () => { if(innerWidth>900) setMenu(false); });

  // Save-for-later only, deliberately not a checkout/cart: prices remain unverified.
  const STORAGE_KEY = 'vesper:saved-lots:v1';
  const stock = window.STOCK || [];
  let saved = [];
  try { const a=JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); saved=Array.isArray(a)?a.filter(x=>typeof x==='string'):[]; } catch {}
  const dlg = $('[data-shortlist]');
  const listEl = $('[data-shortlist-list]');
  const saveButton = $('[data-save-current]');
  let activeLot = null;
  const esc=s=>String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {} }
  function renderSaved() {
    $$('[data-saved-count]').forEach(el=>el.textContent=saved.length);
    if(saveButton) {
      const yes = saved.includes(activeLot);
      saveButton.setAttribute('aria-pressed', String(yes));
      saveButton.textContent = yes ? '♥ Saved' : '♡ Save watch';
    }
    if(!listEl) return;
    const items=saved.map(lot=>stock.find(w=>w.lot===lot)).filter(Boolean);
    listEl.innerHTML=items.length?items.map(w=>`<div class="shortlist__item"><img src="${esc(w.photos?.top||'')}" alt="${esc(w.brand+' '+w.model)}" loading="lazy"><div><span class="mono">LOT ${esc(w.lot)}</span><h3>${esc(w.brand)} ${esc(w.model)}</h3><p>${esc(w.mm)} mm · ${esc(w.status)}</p><button type="button" class="editorial-link" data-view-saved="${esc(w.lot)}">Explore details ↗</button></div><button type="button" class="shortlist__remove" data-remove-saved="${esc(w.lot)}" aria-label="Remove ${esc(w.brand+' '+w.model)}">×</button></div>`).join(''):'<p class="shortlist__empty">Your collection begins here. Open a watch and save the pieces you love.</p>';
  }
  document.addEventListener('vesper:product', e => { activeLot=e.detail.lot; renderSaved(); });
  saveButton?.addEventListener('click', () => {
    if(!activeLot) return;
    if(saved.includes(activeLot)) saved=saved.filter(l=>l!==activeLot);
    else saved.push(activeLot);
    persist();renderSaved();
  });
  $('[data-open-shortlist]')?.addEventListener('click', () => {renderSaved();dlg?.showModal();});
  $('[data-close-shortlist]')?.addEventListener('click', () => dlg?.close());
  dlg?.addEventListener('click', e => { if(e.target===dlg) dlg.close(); });
  listEl?.addEventListener('click', e=>{
    const remove=e.target.closest('[data-remove-saved]');
    if(remove) {saved=saved.filter(l=>l!==remove.dataset.removeSaved);persist();renderSaved();return;}
    const view=e.target.closest('[data-view-saved]');
    if(view) {dlg.close();location.hash=`lot-${encodeURIComponent(view.dataset.viewSaved)}`;}
  });
  renderSaved();
})();
