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
  function cleanUp(){
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

  // Six original image files of the SAME silver-dial T165 watch.
  // No AI campaign crops, no photos of another model in this gallery.
  const details=[
    {src:'photos/18fe6ae6-4a29-4dc0-8d65-cc1778fe42e7_T165-807-11-031-00_shadow.webp',title:'Face and dial',copy:'A clear, original front view of the silver sunray dial and steel bracelet.'},
    {src:'photos/12c575c7-63db-45a2-ae88-c6c508d803e1_T165-807-11-031-00_DETAIL-1.webp',title:'Angled profile',copy:'The same watch from three-quarters, showing its case shape and polished crown.'},
    {src:'photos/6b4b0080-be96-4b53-8c2c-f77f7a4262d8_T165-807-11-031-00_PROFIL.webp',title:'Case thickness',copy:'Side-on product view showing the profile and case thickness.'},
    {src:'photos/6853ef90-43a8-4a32-a9ed-c2c19d94be48_T605-052-046_ZOOM.png',title:'Steel bracelet',copy:'Original close detail of the stainless-steel bracelet and links.'},
    {src:'photos/e1117cc6-8547-46d1-bcde-6483c651b190_T165-807-11-031-00_DETAIL-2.png',title:'Caseback and movement',copy:'The reverse of the same watch, showing its exhibition caseback.'},
    {src:'photos/ec886d8a-dbc7-4550-a886-63dd99111bd0_T165-807-11-031-00_WRIST.webp',title:'On the wrist',copy:'Original wrist photograph for judging the timepiece’s proportions.'}
  ];
  details.forEach(d=>{const preload=new Image();preload.src=d.src;});
  const img=$('[data-detail-image]');
  let di=0;
  function changeDetail(d){
    di=(d+details.length)%details.length;
    const o=details[di];
    img.style.opacity='0';img.style.transform='scale(1.045)';
    later(()=>{img.src=o.src;img.alt=`Silver-dial Tissot — ${o.title}`;img.style.opacity='1';img.style.transform='scale(1)'},190);
    $('[data-detail-index]').textContent=`0${di+1} / 0${details.length}`;
    $('[data-detail-heading]').textContent=o.title;
    $('[data-detail-copy]').textContent=o.copy;
  }
  $('[data-detail-prev]')?.addEventListener('click',()=>changeDetail(di-1));
  $('[data-detail-next]')?.addEventListener('click',()=>changeDetail(di+1));
  const detailStage=$('.detail-essay__stage');
  detailStage?.addEventListener('keydown',e=>{if(e.key==='ArrowRight')changeDetail(di+1);if(e.key==='ArrowLeft')changeDetail(di-1);});
})();
