/* legacy inline script #32 id="v28-apple-switch-tabs-motion" */

(function(){
  function initV28(){
    const section=document.querySelector('#portfolio-nested-offers');
    if(!section) return;
    const shell=section.querySelector('.ap-tabs-shell');
    const tabs=[...section.querySelectorAll('.ap-tab')];
    const panels=[...section.querySelectorAll('.ap-panel')];
    if(!shell||!tabs.length) return;
    let lastIndex=Math.max(0,tabs.findIndex(t=>t.classList.contains('is-active')));
    function moveIndicator(tab){
      if(!tab) return;
      shell.style.setProperty('--ap-pill-x', tab.offsetLeft+'px');
      shell.style.setProperty('--ap-pill-w', tab.offsetWidth+'px');
    }
    function animatePanel(panel,dir){
      if(!panel) return;
      const copy=[...panel.querySelectorAll('.ap-eyebrow,.ap-copy-card h3,.ap-copy-card p,.ap-chip-row')];
      const visual=panel.querySelector('.ap-visual-card');
      if(window.gsap){
        gsap.killTweensOf(copy.concat(visual? [visual] : []));
        gsap.fromTo(copy,{opacity:0,x:dir*34,filter:'blur(8px)'},{opacity:1,x:0,filter:'blur(0px)',duration:.62,ease:'power3.out',stagger:.055,clearProps:'filter'});
        if(visual) gsap.fromTo(visual,{opacity:.62,x:dir*22,scale:.985},{opacity:1,x:0,scale:1,duration:.72,ease:'power3.out'});
      }
    }
    function afterActivate(key){
      const active=tabs.find(t=>t.dataset.apTab===key)||tabs[0];
      const newIndex=tabs.indexOf(active);
      const dir=newIndex>=lastIndex?1:-1;
      lastIndex=newIndex;
      moveIndicator(active);
      const panel=panels.find(p=>p.dataset.apPanel===key);
      animatePanel(panel,dir);
      if(active && window.matchMedia('(max-width: 920px)').matches){
        active.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
      }
    }
    tabs.forEach(tab=>{
      tab.addEventListener('click',()=>requestAnimationFrame(()=>afterActivate(tab.dataset.apTab)));
    });
    window.addEventListener('resize',()=>moveIndicator(tabs.find(t=>t.classList.contains('is-active'))||tabs[0]),{passive:true});
    requestAnimationFrame(()=>moveIndicator(tabs.find(t=>t.classList.contains('is-active'))||tabs[0]));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initV28); else initV28();
})();
