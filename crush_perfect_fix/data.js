// Shared flavor data used by both the hero carousel (hero.js) and the
// flavor-showcase / footer sections (app.js).
export const FLAVORS = [
  {
    id: 'pom', order: '01', file: 'assets/pom.glb', tex: 'assets/textures/pom.jpg',
    title: 'POMEGRANATE', sub: 'Fuel Your Passion',
    tagline: 'Deep pomegranate energy with a bold, tart finish.',
    accent: '#d1234f', accent2: '#d4af37',
  },
  {
    id: 'red', order: '02', file: 'assets/red.glb', tex: 'assets/textures/red.jpg',
    title: 'RED FRUIT', sub: 'Fuel Your Passion',
    tagline: 'Cherry, raspberry & blackberry collide in a dark, punchy blend.',
    accent: '#e2314a', accent2: '#1a0000',
  },
  {
    id: 'pinkblue', order: '03', file: 'assets/pinkblue.glb', tex: 'assets/textures/pinkblue.jpg',
    title: 'PINK + BLUE', sub: 'Power Your Day',
    tagline: 'The signature CRUSH blend — two colors, one charge.',
    accent: '#ff2d95', accent2: '#1e6fff',
  },
  {
    id: 'blue', order: '04', file: 'assets/blue.glb', tex: 'assets/textures/blue.jpg',
    title: 'BLUE RASPBERRY', sub: 'Fuel Your Passion',
    tagline: 'Icy blue raspberry with a sharp, electric bite.',
    accent: '#2f8fe0', accent2: '#032b52',
  },
  {
    id: 'tropic', order: '05', file: 'assets/tropic.glb', tex: 'assets/textures/tropic.jpg',
    title: 'TROPICAL PASSION', sub: 'Fuel Your Passion',
    tagline: 'Passionfruit, hibiscus & citrus under a tropical sun.',
    accent: '#ff7a1a', accent2: '#ff2d78',
  },
];

export const NUTRI_CHIPS = ['0 SUGAR', '10 CAL', '8.4 FL OZ', 'NATURALLY FLAVORED'];

export const PILLARS = [
  { label: 'Energy Boost', desc: 'A clean, fast lift — no crash tacked on at the end.', icon: 'bolt' },
  { label: 'Focus Enhanced', desc: 'Dialed-in clarity for whatever you’re chasing.', icon: 'target' },
  { label: 'Hydration Support', desc: 'Electrolytes built in, not bolted on.', icon: 'drop' },
];
