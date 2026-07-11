/* legacy inline script #29 id="user-gsap-hero-typography-v16-fixed" */

(function(){
  if(window.__userHeroTypographyV15) return;
  window.__userHeroTypographyV15 = true;

  function initUserHeroTypography(){
    if(!window.gsap) return;
    var container = document.getElementById('heroType');
    if(!container) return;

    var chars = container.querySelectorAll('.hero-type-char');
    gsap.set(container, { visibility:'visible' });

    gsap.fromTo(chars,
      {
        opacity:0,
        x:-150,
        y:function(){ return gsap.utils.random(-30,30); },
        scale:.5,
        rotation:function(){ return gsap.utils.random(-45,45); },
        filter:'blur(10px)'
      },
      {
        duration:1.2,
        opacity:1,
        x:0,
        y:0,
        scale:1,
        rotation:0,
        filter:'blur(0px)',
        ease:'back.out(1.5)',
        stagger:{ each:.05, from:'start' },
        onComplete:function(){
          gsap.set(chars,{ clearProps:'filter,will-change' });
          startShowcase();
        }
      }
    );

    function startShowcase(){
      gsap.to('#heroType .hero-star', { rotation:360, duration:10, repeat:-1, ease:'linear', transformOrigin:'center center' });
      gsap.to('#heroType .hero-star', { scale:1.2, duration:.6, repeat:-1, yoyo:true, ease:'power1.inOut' });

      setInterval(function(){
        gsap.to('#heroType .hero-eye-pupil, #heroType .hero-eye-glint', {
          x:gsap.utils.random(-14,14),
          y:gsap.utils.random(-8,8),
          duration:.2,
          ease:'power2.out'
        });
      },1500);

      gsap.set('#heroType .hero-eye-bg', { transformOrigin:'center center' });
      function blinkEye(){
        gsap.to('#heroType .hero-eye-bg', { scaleY:.1, duration:.1, yoyo:true, repeat:1 });
        gsap.delayedCall(gsap.utils.random(2,5), blinkEye);
      }
      blinkEye();

      container.querySelectorAll('.hero-i-wrapper').forEach(function(iNode, index){
        if(!iNode.querySelector('.hero-star')) return;
        var stem = iNode.querySelector('.hero-i-stem');
        var dot = iNode.querySelector('.hero-i-dot-positioner');
        function toss(){
          var tl = gsap.timeline({ onComplete:function(){ gsap.delayedCall(gsap.utils.random(5,10), toss); } });
          tl.to(stem, { scaleY:.6, duration:.2, ease:'power2.inOut' })
            .to(dot, { y:'.08em', duration:.2, ease:'power2.inOut' }, '<')
            .to(stem, { scaleY:1.15, duration:.25, ease:'back.out(2)' })
            .to(dot, { y:'-.4em', duration:.35, ease:'circ.out' }, '<')
            .to(iNode, { rotationY:'+=360', duration:.6, ease:'power1.inOut' }, '-=.2')
            .to(stem, { scaleY:1, duration:.3, ease:'bounce.out' }, '+=.1')
            .to(dot, { y:0, duration:.3, ease:'bounce.out' }, '<');
        }
        gsap.delayedCall(index * 2 + 2, toss);
      });

      var initTL = gsap.timeline({ onComplete:function(){ gsap.delayedCall(gsap.utils.random(4,7), flipTLoop); } });
      initTL.to('#heroType .hero-lightning svg', { scale:1.2, rotation:10, yoyo:true, repeat:3, duration:.08 }, '+=.3')
        .to('#heroType .hero-t-flip-inner', { scaleX:0, duration:.25, ease:'power2.in' }, '+=.3')
        .set('#heroType .hero-t-back', { visibility:'hidden' })
        .set('#heroType .hero-t-front', { visibility:'visible' })
        .to('#heroType .hero-t-flip-inner', { scaleX:1, duration:.25, ease:'power2.out' });

      function flipTLoop(){
        var loopTL = gsap.timeline({ onComplete:function(){ gsap.delayedCall(gsap.utils.random(4,7), flipTLoop); } });
        loopTL.to('#heroType .hero-t-flip-inner', { scaleX:0, duration:.25, ease:'power2.in' })
          .set('#heroType .hero-t-front', { visibility:'hidden' })
          .set('#heroType .hero-t-back', { visibility:'visible' })
          .to('#heroType .hero-t-flip-inner', { scaleX:1, duration:.25, ease:'power2.out' })
          .to('#heroType .hero-lightning svg', { scale:1.2, rotation:10, yoyo:true, repeat:3, duration:.08 }, '+=.1')
          .to({}, { duration:1.2 })
          .to('#heroType .hero-t-flip-inner', { scaleX:0, duration:.25, ease:'power2.in' })
          .set('#heroType .hero-t-back', { visibility:'hidden' })
          .set('#heroType .hero-t-front', { visibility:'visible' })
          .to('#heroType .hero-t-flip-inner', { scaleX:1, duration:.25, ease:'power2.out' });
      }
      function morphWLoop(){ return; }
      // W-to-crown morph removed: W remains a normal W.


      gsap.set('#heroType .hero-flower-outer, #heroType .hero-flower-inner', { transformOrigin:'50% 50%', svgOrigin:'50 50' });
      gsap.set('#heroType .hero-flower svg', { transformOrigin:'50% 50%' });
      var outerAnim = gsap.to('#heroType .hero-flower-outer', { rotation:360, duration:14, repeat:-1, ease:'linear' });
      var innerAnim = gsap.to('#heroType .hero-flower-inner', { rotation:-360, duration:10, repeat:-1, ease:'linear' });
      var breathAnim = gsap.to('#heroType .hero-flower svg', { scale:1.05, duration:2, yoyo:true, repeat:-1, ease:'sine.inOut' });

      var flowerTrigger = container.querySelector('.hero-flower-trigger');
      if(flowerTrigger){
        flowerTrigger.addEventListener('mouseenter', function(){
          gsap.to('#heroType .hero-flower svg', { scale:1.45, filter:'drop-shadow(0px 0px 12px rgba(249, 205, 46, 0.8))', duration:.5, ease:'back.out(2)', overwrite:'auto' });
          gsap.to([outerAnim, innerAnim], { timeScale:4, duration:.5 });
        });
        flowerTrigger.addEventListener('mouseleave', function(){
          gsap.to('#heroType .hero-flower svg', { scale:1.05, filter:'drop-shadow(0px 0px 0px rgba(0,0,0,0))', duration:.6, ease:'power2.out', overwrite:'auto', onComplete:function(){ breathAnim.restart(); } });
          gsap.to([outerAnim, innerAnim], { timeScale:1, duration:1 });
        });
      }

      chars.forEach(function(char){
        if(char.classList.contains('hero-icon-char') || char.textContent.trim() === '') return;
        var hoverColor = '#0ae448';
        var txt = char.textContent.trim().toUpperCase();
        if(txt === 'W' || char.closest('.hero-w-morph-wrapper')) hoverColor = '#FFD700';
        else if(char.classList.contains('hero-flower-wrapper') || char.closest('.hero-flower-wrapper')) hoverColor = '#FFD700';
        else if(char.classList.contains('hero-star-wrapper') || char.closest('.hero-star-wrapper')) hoverColor = '#FF4B4B';
        char.addEventListener('mouseenter', function(){
          gsap.to(char, { scale:1.25, y:'-.15em', color:hoverColor, duration:.2, ease:'back.out(3)' });
        });
        char.addEventListener('mouseleave', function(){
          gsap.to(char, { scale:1, y:0, color:'#F5F5F5', duration:.4, ease:'power2.out' });
        });
      });
    }
  }

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(initUserHeroTypography);
  }else{
    window.addEventListener('load', initUserHeroTypography);
  }
})();
