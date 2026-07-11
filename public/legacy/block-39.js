/* legacy inline script #39 id="v45-hero-hover-guard" */

(function(){
  function init(){
    if(!window.gsap) return;
    var heroType=document.querySelector('#heroType');
    if(!heroType || window.__v45HeroHoverGuard) return;
    window.__v45HeroHoverGuard=true;

    var flower=heroType.querySelector('.hero-flower-trigger');
    if(flower){
      flower.addEventListener('mouseenter',function(){
        gsap.to('#heroType .hero-flower svg',{scale:1.42,filter:'drop-shadow(0 0 14px rgba(249,205,46,.85))',duration:.35,ease:'back.out(2)',overwrite:'auto'});
      });
      flower.addEventListener('mouseleave',function(){
        gsap.to('#heroType .hero-flower svg',{scale:1.05,filter:'drop-shadow(0 0 0 rgba(0,0,0,0))',duration:.45,ease:'power2.out',overwrite:'auto'});
      });
    }

    heroType.querySelectorAll('.hero-lightning, .hero-t-flip-wrapper').forEach(function(el){
      el.addEventListener('mouseenter',function(){
        gsap.to('#heroType .hero-lightning svg',{scale:1.22,rotation:10,duration:.18,yoyo:true,repeat:1,ease:'power2.out',overwrite:'auto'});
      });
    });

    var eye=heroType.querySelector('.hero-eye-wrapper');
    if(eye){
      eye.addEventListener('mouseenter',function(){
        gsap.to('#heroType .hero-eye-bg',{scaleY:.18,duration:.11,yoyo:true,repeat:1,transformOrigin:'center center',overwrite:'auto'});
      });
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
