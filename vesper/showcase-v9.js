/* VESPER 09 — magazine collage: smooth, deliberate hover selection. */
(()=>{
'use strict';
const root=document.querySelector('#showcase');if(!root)return;
const sets=[...root.querySelectorAll('.slice-set')];
const buttons=[...root.querySelectorAll('[data-showcase-choice]')];
const label=root.querySelector('[data-magazine-name]');
const copy=root.querySelector('[data-magazine-copy]');
const counter=root.querySelector('[data-showcase-counter]');
const stage=root.querySelector('[data-showcase-stage]');
const explore=root.querySelector('[data-showcase-explore]');
const watches=[
 {id:'001',name:'Emerald',model:'Chrono XL',text:'Green sunray dial. Stainless steel. Considered in every detail.',tint:'#315d4c'},
 {id:'002',name:'Ocean',model:'Seastar 1000',text:'Ocean-blue gradient. A confident silhouette, built for exploration.',tint:'#315a91'},
 {id:'003',name:'Crimson',model:'Supersport Chrono',text:'A black dial, red accents and a beautifully restrained edge.',tint:'#7a3041'}
];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let active=0,view=false,hovered=false,focus=false,cycle=null,hoverDelay=null,copyDelay=null;
function activate(index){
 index=(index+watches.length)%watches.length;
 if(index===active)return;
 active=index;
 sets.forEach((set,i)=>{set.classList.toggle('is-current',i===index);set.setAttribute('aria-hidden',String(i!==index));});
 buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
 root.style.setProperty('--active-watch-tint',watches[index].tint);
 if(label&&copy){label.classList.add('is-changing');copy.classList.add('is-changing');clearTimeout(copyDelay);copyDelay=setTimeout(()=>{label.innerHTML=`${watches[index].name}<br>${watches[index].model}`;copy.textContent=watches[index].text;label.classList.remove('is-changing');copy.classList.remove('is-changing');},reduce?0:180);}
 if(counter)counter.textContent=`0${index+1} / 03`;
}
function stopCycle(){clearTimeout(cycle);cycle=null;}
function beginCycle(){stopCycle();if(reduce||!view||hovered||focus||document.hidden)return;cycle=setTimeout(()=>{activate(active+1);beginCycle()},5700)}
function scheduleSelection(index){clearTimeout(hoverDelay);hoverDelay=setTimeout(()=>activate(index),120)}
buttons.forEach((button,index)=>{
 button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen'){hovered=true;stopCycle();scheduleSelection(index)}});
 button.addEventListener('focus',()=>{focus=true;stopCycle();activate(index)});
 button.addEventListener('click',()=>{clearTimeout(hoverDelay);activate(index);beginCycle()});
});
stage.addEventListener('pointerleave',()=>{clearTimeout(hoverDelay);hovered=false;beginCycle()});
stage.addEventListener('focusout',e=>{if(!stage.contains(e.relatedTarget)){focus=false;beginCycle()}});
let touchX=null;
stage.addEventListener('touchstart',e=>touchX=e.touches[0].clientX,{passive:true});
stage.addEventListener('touchend',e=>{if(touchX==null)return;let dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>45)activate(active+(dx<0?1:-1));touchX=null;beginCycle()},{passive:true});
explore?.addEventListener('click',()=>{location.hash=`lot-${watches[active].id}`;window.dispatchEvent(new HashChangeEvent('hashchange'))});
const observer=new IntersectionObserver(entries=>{view=entries[0].isIntersecting;beginCycle()},{threshold:.16});observer.observe(root);
document.addEventListener('visibilitychange',beginCycle);
})();
