import { NUTRI_CHIPS } from './data.js';

const panelOverlay = document.getElementById('panelOverlay');
const panelBg = document.getElementById('panelBg');
const panelEyebrow = document.getElementById('panelEyebrow');
const panelTitle = document.getElementById('panelTitle');
const panelSub = document.getElementById('panelSub');
const panelTagline = document.getElementById('panelTagline');
const chips = document.getElementById('chips');

export function openPanel(flavor){
  panelBg.style.backgroundImage = `url(${flavor.tex})`;
  panelEyebrow.textContent = `Flavor ${flavor.order}`;
  panelTitle.textContent = flavor.title;
  panelSub.textContent = flavor.sub;
  panelTagline.textContent = flavor.tagline;
  chips.innerHTML = '';
  NUTRI_CHIPS.forEach(c => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.textContent = c;
    chips.appendChild(el);
  });
  panelOverlay.classList.add('show');
}

export function closePanel(){
  panelOverlay.classList.remove('show');
}

document.getElementById('panelClose').addEventListener('click', closePanel);
panelOverlay.addEventListener('click', (e) => { if (e.target === panelOverlay) closePanel(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
