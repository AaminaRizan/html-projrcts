import { FLAVORS, NUTRI_CHIPS, PILLARS } from './data.js';
import { openPanel } from './panel.js';

/* ---------------- Flavor showcase ---------------- */
const flavorList = document.getElementById('flavorList');
FLAVORS.forEach((f, i) => {
  const row = document.createElement('div');
  row.className = 'flavorRow reveal';
  row.innerHTML = `
    <div class="flavorMedia">
      <img src="${f.tex}" alt="CRUSH ${f.title} can label" loading="lazy" />
    </div>
    <div class="flavorInfo">
      <div class="flavorOrder">${f.order} / 05</div>
      <div class="flavorTitle">${f.title}</div>
      <div class="flavorTagline">${f.tagline}</div>
      <div class="flavorChips">${NUTRI_CHIPS.map(c => `<span class="chip">${c}</span>`).join('')}</div>
    </div>
  `;
  row.querySelector('.flavorMedia').style.cursor = 'pointer';
  row.querySelector('.flavorMedia').addEventListener('click', () => openPanel(f));
  flavorList.appendChild(row);
});

/* ---------------- Pillars ---------------- */
const ICONS = {
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor"/>',
  target: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
  drop: '<path d="M12 2C12 2 5 11 5 15.5A7 7 0 0 0 19 15.5C19 11 12 2 12 2Z" fill="currentColor"/>',
};
const pillarsEl = document.getElementById('pillars');
PILLARS.forEach((p, i) => {
  const card = document.createElement('div');
  card.className = `pillar reveal reveal-delay-${i+1}`;
  card.innerHTML = `
    <svg viewBox="0 0 24 24">${ICONS[p.icon]}</svg>
    <h3>${p.label}</h3>
    <p>${p.desc}</p>
  `;
  pillarsEl.appendChild(card);
});

/* ---------------- Scroll reveal ---------------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------------- Footer year ---------------- */
document.getElementById('year').textContent = `© ${new Date().getFullYear()} CRUSH Beverage Co.`;
