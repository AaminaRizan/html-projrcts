/* VESPER — cinematic intro, hero collection and detail editorial. No 3D, no external JS dependency. */
(() => {
  'use strict';
  const $=(s,ctx=document)=>ctx.querySelector(s);
  const $$=(s,ctx=document)=>[...ctx.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro=$('[data-intro]');
  const site=$('[data-site-reveal]');
  const markers=$('[data-dial-markers]');
  const N='http://www.w3.org/2000/svg';
  for(let i=0;i<60;i++){
    const tick=document.createElementNS(N,'line');
    const major=i%5===0;
    tick.setAttribute('x1','140');tick.setAttribute('x2','140');
    tick.setAttribute('y1',major?'37':'30');tick.setAttribute('y2','25');
    tick.setAttribute('stroke',major?'#d1d7d9':'#5e666a');
    tick.setAttribute('stroke-width',major?'2.2':'.8');
    tick.setAttribute('transform',`rotate(${i*6} 140 140)`);
    markers.append(tick);
  }
  const hand=$('[data-second-hand]');
  const skip=$('[data-skip-intro]');
  let finished=false;
  let timers=[];
  const later=(f,ms)=>{const t=setTimeout(f,ms);timers.push(t);return t;};
  // The homepage is the circular reveal layer, ABOVE the dark intro backdrop.
  // This creates a visible growing window into the real page, not a fade hiding the effect.
  let cleaned=false;
  function cleanUp(){
    if(cleaned) return;
    cleaned=true;
    document.documentElement.classList.remove('vesper-intro-pending');
    site.classList.remove('site-reveal--opening');
    site.style.clipPath='';
    intro?.remove();
    document.body.classList.remove('intro-active');
    document.documentElement.classList.remove('intro-lock');
    window.scrollTo(0,0);
  }
  function finish(instant=false){
    if(finished) return;
    finished=true;
    timers.forEach(clearTimeout);
    try{sessionStorage.setItem('vesper:intro-seen','1');}catch{}
    if(instant || !site.animate) { cleanUp();return; }
    // Calculate diagonal radius to reveal the farthest corner on any screen size.
    const radius=Math.ceil(Math.hypot(innerWidth,innerHeight));
    site.classList.add('site-reveal--opening');
    site.style.clipPath='circle(0px at 50% 50%)';
    intro.classList.add('intro--opening');
    const anim=site.animate([
      {clipPath:'circle(0px at 50% 50%)'},
      {clipPath:`circle(${radius}px at 50% 50%)`}
    ],{duration:1250,easing:'cubic-bezier(.66,0,.15,1)',fill:'forwards'});
    anim.finished.then(cleanUp).catch(cleanUp);
    // Failure protection independent of the animation Promise.
    setTimeout(cleanUp,1700);
  }
  const seen=(()=>{try{return sessionStorage.getItem('vesper:intro-seen')==='1';}catch{return false;}})();
  if(reduce||seen||location.hash.startsWith('#lot-')) { finish(true); }
  else {
    document.body.classList.add('intro-active');
    document.documentElement.classList.add('intro-lock');
    hand.style.transform='rotate(-300deg)';
    later(()=>{
      hand.style.transition='transform 1.30s cubic-bezier(.24,.66,.1,1)';
      hand.style.transform='rotate(0deg)';
    },240);
    later(()=>intro.classList.add('intro--aligned'),1520);
    later(()=>finish(false),1800);
  }
  skip?.addEventListener('click',()=>finish(true));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!finished)finish(true);});

  // Hero stays focused on the featured Chrono XL. The removed carousel has no hidden controls.
  $('[data-hero-open]')?.addEventListener('click',()=>document.querySelector('[data-hero]')?.click());

})();
