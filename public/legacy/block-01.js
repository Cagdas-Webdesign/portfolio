/* legacy inline script #1 id="anon" */

/* ===== V67: single-controller carousel, no text overlap ===== */
(function(){
  function initBring(){
    if(!window.gsap) return;
    const section=document.querySelector('#experience.bring-section');
    if(!section || window.__v67BringReady) return;
    window.__v67BringReady=true;

    if(window.ScrollTrigger){
      ScrollTrigger.getAll().forEach(function(st){
        const trg=st.trigger || (st.vars && st.vars.trigger);
        if((typeof trg==='string' && trg==='#experience') || trg===section){
          st.kill();
        }
      });
    }

    const panel=section.querySelector('.bring-stack');
    const cards=Array.from(section.querySelectorAll('.bring-card'));
    const dots=Array.from(section.querySelectorAll('.bring-dot'));
    const prev=section.querySelector('.bring-arrow.prev');
    const next=section.querySelector('.bring-arrow.next');

    const accents=[
      {a:'rgba(0,255,231,.24)',b:'rgba(123,97,255,.16)',c:'rgba(255,45,120,.10)',solid:'#00ffe7'},
      {a:'rgba(123,97,255,.24)',b:'rgba(0,255,231,.12)',c:'rgba(255,45,120,.13)',solid:'#7b61ff'},
      {a:'rgba(255,45,120,.20)',b:'rgba(123,97,255,.18)',c:'rgba(0,255,231,.10)',solid:'#ff2d78'},
      {a:'rgba(255,122,61,.20)',b:'rgba(0,255,231,.13)',c:'rgba(123,97,255,.17)',solid:'#ff7a3d'}
    ];

    let active=0;
    let tl=null;

    function mod(i){ return (i + cards.length) % cards.length; }

    function applyAccent(index){
      const acc=accents[index] || accents[0];
      section.style.setProperty('--bringGlowA',acc.a);
      section.style.setProperty('--bringGlowB',acc.b);
      section.style.setProperty('--bringGlowC',acc.c);
      panel.style.setProperty('--panelAccent',acc.solid);
      dots.forEach(function(dot,i){ dot.classList.toggle('is-active', i===index); });
    }

    function getPositions(){
      const panelW=panel.clientWidth || 800;
      const cardW=cards[0] ? cards[0].offsetWidth : panelW-96;
      const peek=window.innerWidth < 760 ? 48 : 58;
      const nextX=panelW - peek; // only a clean edge of next card is visible
      const prevX=-(cardW + 26);
      const farX=panelW + cardW + 80;
      return {nextX,prevX,farX};
    }

    function varsFor(i,index){
      const nextIndex=mod(index+1);
      const prevIndex=mod(index-1);
      const pos=getPositions();

      if(i===index){
        return {x:0,y:0,scale:1,opacity:1,zIndex:60,visibility:'visible'};
      }
      if(i===nextIndex){
        return {x:pos.nextX,y:0,scale:1,opacity:.82,zIndex:20,visibility:'visible'};
      }
      if(i===prevIndex){
        return {x:pos.prevX,y:0,scale:1,opacity:0,zIndex:5,visibility:'hidden'};
      }
      return {x:pos.farX,y:0,scale:1,opacity:0,zIndex:1,visibility:'hidden'};
    }

    function layout(index, instant){
      if(!cards.length) return;
      active=mod(index);
      applyAccent(active);

      if(tl) tl.kill();
      tl=gsap.timeline({defaults:{duration:instant?0:1.05,ease:'power4.out',overwrite:true}});

      cards.forEach(function(card,i){
        card.classList.toggle('is-active',i===active);
        const v=varsFor(i,active);
        v.rotate=0;
        v.rotateY=0;
        v.filter='none';
        v.clipPath='none';
        v.pointerEvents=i===active?'auto':'none';
        v.force3D=true;
        tl.to(card,v,0);
      });
    }

    function go(index){ layout(index,false); }

    if(prev) prev.addEventListener('click',function(){ go(active-1); });
    if(next) next.addEventListener('click',function(){ go(active+1); });
    dots.forEach(function(dot,i){ dot.addEventListener('click',function(){ go(i); }); });

    let sx=0, sy=0;
    panel.addEventListener('touchstart',function(e){
      if(!e.touches || !e.touches[0]) return;
      sx=e.touches[0].clientX;
      sy=e.touches[0].clientY;
    },{passive:true});
    panel.addEventListener('touchend',function(e){
      if(!e.changedTouches || !e.changedTouches[0]) return;
      const dx=e.changedTouches[0].clientX-sx;
      const dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)>42 && Math.abs(dx)>Math.abs(dy)*1.25){
        go(dx<0?active+1:active-1);
      }
    },{passive:true});

    window.addEventListener('resize',function(){ layout(active,true); },{passive:true});
    layout(0,true);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initBring,{once:true});
  }else{
    initBring();
  }
})();
