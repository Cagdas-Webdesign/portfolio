/* legacy inline script #38 id="v43-hero-replay-on-scroll" */

(function(){
  function init(){
    if(!window.gsap) return;
    var hero = document.querySelector('#hero');
    var type = document.querySelector('#heroType');
    if(!hero || !type) return;

    var chars = Array.prototype.slice.call(type.querySelectorAll('.hero-type-char'));
    var actions = document.querySelector('#heroActions');
    var scrollhint = document.querySelector('#scrollhint');
    var replayTween = null;
    var lastReplay = 0;

    function replayHero(){
      var now = Date.now();
      if(now - lastReplay < 650) return;
      lastReplay = now;
      if(replayTween) replayTween.kill();

      gsap.killTweensOf(chars);
      gsap.set(type,{visibility:'visible'});
      gsap.set(chars,{
        opacity:0,
        x:function(){ return gsap.utils.random(-150,-70); },
        y:function(){ return gsap.utils.random(-28,28); },
        scale:.55,
        rotation:function(){ return gsap.utils.random(-36,36); },
        filter:'blur(10px)'
      });
      if(actions) gsap.set(actions,{opacity:0,y:20,scale:.985});
      if(scrollhint) gsap.set(scrollhint,{opacity:0});

      replayTween = gsap.timeline({defaults:{overwrite:'auto'}})
        .to(chars,{
          duration:1.08,
          opacity:1,
          x:0,
          y:0,
          scale:1,
          rotation:0,
          filter:'blur(0px)',
          ease:'back.out(1.45)',
          stagger:{each:.045,from:'start'},
          onComplete:function(){ gsap.set(chars,{clearProps:'filter'}); }
        })
        .to(actions,{opacity:1,y:0,scale:1,duration:.48,ease:'power3.out'},'-=.35')
        .to(scrollhint,{opacity:1,duration:.32,ease:'power2.out'},'-=.18');
    }

    // Beim Zurückscrollen in den Hero erneut wie beim Einstieg animieren.
    if(window.ScrollTrigger){
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top+=8',
        end: 'bottom top',
        onEnterBack: replayHero
      });
    }

    // Logo-Klick / direkt nach oben scrollen ebenfalls sauber abfangen.
    window.addEventListener('scroll', function(){
      if(window.scrollY < 8 && document.body.dataset.heroReplayAtTop !== '1'){
        document.body.dataset.heroReplayAtTop = '1';
        replayHero();
      }
      if(window.scrollY > 80){
        document.body.dataset.heroReplayAtTop = '0';
      }
    }, {passive:true});

    // Global verfügbar, falls später ein Button nach oben scrollt.
    window.replayHeroTypography = replayHero;
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
