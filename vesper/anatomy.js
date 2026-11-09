(() => {
  const section = document.querySelector('[data-anatomy]');
  if (!section) return;
  const assembly = section.querySelector('[data-anatomy-assembly]');
  const viewport = section.querySelector('.anatomy__viewport');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let spread = 0;
  let raf = null;
  function setSpread(value){
    spread = Math.max(0, Math.min(1, Number(value)));
    assembly.style.setProperty('--spread', String(spread));
    section.style.setProperty('--spread', String(spread));
  }
  function tweenTo(target){
    cancelAnimationFrame(raf);
    if (reduceMotion) { setSpread(target); return; }
    const start = spread; const end = Math.max(0, Math.min(1, target));
    const t0 = performance.now(); const duration = 650;
    function frame(now){
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setSpread(start + (end - start) * eased);
      if (p < 1) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }
  viewport?.addEventListener('pointerenter', () => tweenTo(1));
  viewport?.addEventListener('pointerleave', () => tweenTo(0));
  viewport?.addEventListener('click', () => tweenTo(spread > 0.7 ? 0 : 1));
  if (!reduceMotion && 'IntersectionObserver' in window && viewport) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        setSpread(0);
      }
    }, { threshold: 0.35 });
    observer.observe(viewport);
  }
  setSpread(0);
})();
