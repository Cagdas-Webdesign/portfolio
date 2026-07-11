/* legacy inline script #2 id="anon" */

/* ===== V72: Apple-style offside carousel, bigger right peek + smoother motion ===== */
(function(){
  function initAppleBring(){
    if(!window.gsap) return;
    const section=document.querySelector('.apple-bring-section');
    if(!section || window.__abSliderV72Ready) return;
    window.__abSliderV72Ready=true;

    const slider=section.querySelector('.ab-slider');
    const track=section.querySelector('.ab-track');
    const slides=Array.from(section.querySelectorAll('.ab-slide'));
    const dots=Array.from(section.querySelectorAll('.ab-dot'));
    const prev=section.querySelector('.ab-prev');
    const next=section.querySelector('.ab-next');
    let active=0;
    let tl=null;

    const looks=[
      {accent:'#00ffe7',bg:['rgba(0,255,231,.25)','rgba(123,97,255,.15)','rgba(255,45,120,.09)']},
      {accent:'#7b61ff',bg:['rgba(123,97,255,.25)','rgba(0,255,231,.10)','rgba(255,45,120,.11)']},
      {accent:'#ff2d78',bg:['rgba(255,45,120,.20)','rgba(123,97,255,.16)','rgba(0,255,231,.08)']},
      {accent:'#ff7a3d',bg:['rgba(255,122,61,.18)','rgba(0,255,231,.10)','rgba(123,97,255,.13)']}
    ];

    function mod(i){return (i+slides.length)%slides.length}

    function setLook(i){
      const look=looks[i] || looks[0];
      section.style.setProperty('--ab-accent',look.accent);
      slider.style.setProperty('--ab-accent',look.accent);
      slides.forEach(s=>s.style.setProperty('--ab-accent',look.accent));
      section.style.setProperty('--ab-bg1',look.bg[0]);
      section.style.setProperty('--ab-bg2',look.bg[1]);
      section.style.setProperty('--ab-bg3',look.bg[2]);
      dots.forEach((d,idx)=>d.classList.toggle('is-active',idx===i));
    }

    function positions(){
      const slideW=slides[0] ? slides[0].offsetWidth : 560;
      const gap=window.innerWidth<760 ? 18 : 24;
      return {
        activeX:0,
        nextX:slideW + gap,
        prevX:-(slideW + gap),
        farRight:(slideW + gap)*2,
        farLeft:-(slideW + gap)*2
      };
    }

    function stateFor(i,index){
      const p=positions();
      const nextIndex=mod(index+1);
      const prevIndex=mod(index-1);
      if(i===index) return {x:p.activeX,y:0,opacity:1,visibility:'visible',zIndex:30,scale:1};
      if(i===nextIndex) return {x:p.nextX,y:0,opacity:.86,visibility:'visible',zIndex:20,scale:.985};
      if(i===prevIndex) return {x:p.prevX,y:0,opacity:0,visibility:'hidden',zIndex:5,scale:.985};
      return {x:p.farRight,y:0,opacity:0,visibility:'hidden',zIndex:1,scale:.985};
    }

    function common(v,i,index){
      v.force3D=true;
      v.filter='none';
      v.clipPath='none';
      v.rotate=0;
      v.rotateY=0;
      v.pointerEvents=i===index?'auto':'none';
      return v;
    }

    function layout(index, instant, direction){
      const old=active;
      const nextIndex=mod(index);
      const dir=direction || (nextIndex===mod(old+1)?1:(nextIndex===mod(old-1)?-1:(nextIndex>old?1:-1)));
      active=nextIndex;
      setLook(active);

      if(tl) tl.kill();
      tl=gsap.timeline({defaults:{duration:instant?0:1.45,ease:'expo.out',overwrite:true}});

      const p=positions();

      slides.forEach((slide,i)=>{
        let target=stateFor(i,active);

        if(!instant && i===active){
          gsap.set(slide,{
            x:dir>0?p.nextX:p.prevX,
            y:0,
            opacity:1,
            visibility:'visible',
            zIndex:35,
            scale:.985,
            filter:'none',
            clipPath:'none',
            pointerEvents:'auto',
            force3D:true
          });
        }

        if(!instant && i===old && old!==active){
          target = dir>0
            ? {x:p.prevX,y:0,opacity:0,visibility:'hidden',zIndex:10,scale:.985}
            : {x:p.nextX,y:0,opacity:.86,visibility:'visible',zIndex:20,scale:.985};
        }

        tl.to(slide, common(target,i,active), 0);
      });
    }

    function go(i,dir){layout(i,false,dir)}

    prev.addEventListener('click',()=>go(active-1,-1));
    next.addEventListener('click',()=>go(active+1,1));
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i,i>active?1:-1)));

    let sx=0,sy=0;
    slider.addEventListener('touchstart',e=>{
      if(!e.touches[0]) return;
      sx=e.touches[0].clientX; sy=e.touches[0].clientY;
    },{passive:true});
    slider.addEventListener('touchend',e=>{
      if(!e.changedTouches[0]) return;
      const dx=e.changedTouches[0].clientX-sx;
      const dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)>42 && Math.abs(dx)>Math.abs(dy)*1.25){
        if(dx<0) go(active+1,1);
        else go(active-1,-1);
      }
    },{passive:true});

    window.addEventListener('resize',()=>layout(active,true,0),{passive:true});
    layout(0,true,0);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initAppleBring,{once:true});
  else initAppleBring();
})();
