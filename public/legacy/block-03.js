/* legacy inline script #3 id="anon" */

/* ===== V75: simpler stabiler Offset-Slider ===== */
(function(){
  function initFinalBring(){
    const section=document.querySelector('.final-bring-section');
    if(!section || window.__finalBringReady) return;
    window.__finalBringReady=true;

    const slides=Array.from(section.querySelectorAll('.fb-slide'));
    const dots=Array.from(section.querySelectorAll('.fb-dot'));
    const prev=section.querySelector('.fb-prev');
    const next=section.querySelector('.fb-next');
    let active=0;

    const themes=[
      {accent:'#24d6cf',bg:['rgba(36,214,207,.24)','rgba(95,124,255,.13)','rgba(217,107,255,.07)']},
      {accent:'#5f7cff',bg:['rgba(95,124,255,.24)','rgba(36,214,207,.10)','rgba(217,107,255,.10)']},
      {accent:'#ff8a57',bg:['rgba(255,138,87,.19)','rgba(95,124,255,.13)','rgba(36,214,207,.08)']},
      {accent:'#d96bff',bg:['rgba(217,107,255,.20)','rgba(95,124,255,.14)','rgba(36,214,207,.08)']}
    ];

    function mod(i){return (i+slides.length)%slides.length}

    function applyTheme(i){
      const t=themes[i] || themes[0];
      section.style.setProperty('--fb-accent',t.accent);
      requestAnimationFrame(()=>{
        section.style.setProperty('--fb-bg1',t.bg[0]);
        section.style.setProperty('--fb-bg2',t.bg[1]);
        section.style.setProperty('--fb-bg3',t.bg[2]);
        dots.forEach((d,idx)=>d.classList.toggle('is-active',idx===i));
      });
    }

    function render(i){
      active=mod(i);
      const nextIndex=mod(active+1);
      const prevIndex=mod(active-1);
      applyTheme(active);

      slides.forEach((slide,idx)=>{
        slide.classList.remove('is-active','is-next','is-prev');
        if(idx===active) slide.classList.add('is-active');
        else if(idx===nextIndex) slide.classList.add('is-next');
        else if(idx===prevIndex) slide.classList.add('is-prev');
      });
    }

    prev.addEventListener('click',()=>render(active-1));
    next.addEventListener('click',()=>render(active+1));
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>render(i)));

    let sx=0, sy=0;
    section.querySelector('.fb-slider').addEventListener('touchstart',e=>{
      if(!e.touches[0]) return;
      sx=e.touches[0].clientX;
      sy=e.touches[0].clientY;
    },{passive:true});
    section.querySelector('.fb-slider').addEventListener('touchend',e=>{
      if(!e.changedTouches[0]) return;
      const dx=e.changedTouches[0].clientX-sx;
      const dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)>42 && Math.abs(dx)>Math.abs(dy)*1.25){
        render(dx<0?active+1:active-1);
      }
    },{passive:true});

    render(0);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initFinalBring,{once:true});
  else initFinalBring();
})();
