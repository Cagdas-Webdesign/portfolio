/* legacy inline script #36 id="v61-no-hero-diamond-runtime" */

(function(){
  function killDiamond(){
    document.querySelectorAll('#heroType .hero-star').forEach(function(el){
      if(window.gsap){ window.gsap.killTweensOf(el); }
      el.remove();
    });
    document.querySelectorAll('#heroType .hero-premium-dot').forEach(function(el){
      el.style.display='block';
      el.style.opacity='1';
      el.style.visibility='visible';
    });
  }
  killDiamond();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',killDiamond,{once:true});
  window.addEventListener('load',killDiamond,{once:true});
  setTimeout(killDiamond,80);
  setTimeout(killDiamond,500);
})();
