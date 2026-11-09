/* VESPER editorial triptych: three synchronized slices of one original image per watch. */
(() => {
  'use strict';
  const q=(s)=>document.querySelector(s);
  const qa=(s)=>[...document.querySelectorAll(s)];
  const names=[
    {id:'001',name:'Emerald Chrono XL',heading:'Emerald<br>Chrono XL',text:'A vivid sunray-green dial, crisp Arabic numerals and a substantial stainless-steel bracelet.',color:'#315d4c'},
    {id:'002',name:'Ocean Seastar 1000',heading:'Ocean<br>Seastar 1000',text:'A deep blue gradient dial, a bold diver’s bezel and a confident steel silhouette.',color:'#244d82'},
    {id:'003',name:'Crimson Supersport',heading:'Crimson<br>Supersport',text:'A black chronograph dial, flashes of red and a stitched leather strap.',color:'#773347'}
  ];
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage=q('[data-showcase-stage]');
  const sets=qa('[data-set]');
  const choices=qa('[data-showcase-choice]');
  const section=q('#showcase');
  if(!stage||!section) return;
  let active=0, paused=false, interacting=false, inView=false, timer=null, progressStart=0, interval=4800, resumeTimer=null;
  const progress=q('[data-showcase-progress]');
  const counter=q('[data-showcase-counter]');
  const pause=q('[data-showcase-pause]');
  const choiceArea=q('.showcase-choices');
  // The entire active triptych changes together. All slices of each set were
  // cut from the same full photograph, preserving the pixel alignment.
  function select(n, byUser=false) {
    n=(n+names.length)%names.length;
    if(byUser) {interacting=true; clearTimeout(resumeTimer); resumeTimer=setTimeout(()=>{interacting=false;resetTimer();},5500);}
    if(n===active){resetTimer();return;}
    active=n;
    sets.forEach((el,i)=>{el.classList.toggle('is-current',i===n);el.setAttribute('aria-hidden',String(i!==n));});
    choices.forEach((el,i)=>{el.classList.toggle('is-current',i===n);el.setAttribute('aria-pressed',String(i===n));});
    counter.textContent=`0${n+1} / 0${names.length}`;
    section.style.setProperty('--active-watch-tint',names[n].color);
    resetTimer();
  }
  function resetTimer(){progressStart=performance.now();if(progress)progress.style.transform='scaleX(0)';}
  function frame(now){
    if(inView&&!document.hidden&&!paused&&!interacting&&!reduce){
      const elapsed=now-progressStart;
      if(progress) progress.style.transform=`scaleX(${Math.min(1,elapsed/interval)})`;
      if(elapsed>=interval)select(active+1);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  const observer=new IntersectionObserver(es=>{
    inView=es[0].isIntersecting;
    if(inView)resetTimer();
  },{threshold:.15});observer.observe(section);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)resetTimer();});
  if(reduce) {paused=true;pause.textContent='Autoplay off';pause.disabled=true;}
  choices.forEach(btn=>{
    const index=Number(btn.dataset.showcaseChoice);
    btn.addEventListener('mouseenter',()=>select(index,true));
    btn.addEventListener('focus',()=>select(index,true));
    btn.addEventListener('click',()=>select(index,true));
  });
  choiceArea?.addEventListener('mouseleave',()=>{clearTimeout(resumeTimer);interacting=false;resetTimer();});
  pause?.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Play':'Pause';resetTimer();});
  const openProduct=(n)=>{
    const lot=names[n].id;
    // Reuse the application's existing product-file route.
    location.hash=`lot-${lot}`;
    // Existing code listens to hashchange; if not, dispatch it manually.
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };
  q('[data-showcase-explore]')?.addEventListener('click',()=>openProduct(active));
  // Hovering the collage itself moves to the next watch (once per entry).
  // All three slices switch together. Touch and keyboard provide equivalent control.
  stage.addEventListener('pointerenter', e => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') select(active + 1, true);
  });
  stage.addEventListener('click', e => {
    if (e.detail !== 0) select(active + 1, true);
  });
  stage.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(active + 1, true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); select(active + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); select(active - 1, true); }
  });
  // Touch swipe switches the watch without accidentally navigating.
  let x=null;
  stage.addEventListener('touchstart',e=>{x=e.touches[0].clientX;},{passive:true});
  stage.addEventListener('touchend',e=>{if(x===null)return;const dx=e.changedTouches[0].clientX-x;if(Math.abs(dx)>45)select(active+(dx<0?1:-1),true);x=null;},{passive:true});

})();
