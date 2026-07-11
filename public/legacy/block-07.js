/* legacy inline script #7 id="anon" */

/* ===== V101: GSAP pinned pure glow + progress bar ===== */
(function(){
  function initAICertGSAP(){
    const section = document.querySelector('.ai-cert-section');
    const shell = section && section.querySelector('.ai-cert-shell');
    const title = section && section.querySelector('.ai-cert-inner h2');
    if(!section || !shell || window.__aiCertGSAPV101) return;
    window.__aiCertGSAPV101 = true;

    function setVars(progress){
      const p = Math.max(0, Math.min(1, progress));
      /* Phase 3: Apple-Intelligence calm — one slow rotation instead of 3.7,
         softer wake-in, gentler breathing. */
      const appear = Math.max(0, Math.min(1, (p - 0.005) / 0.2));
      const alpha = appear * (0.72 + Math.sin(p * Math.PI) * 0.12);
      const rot = p * 360;
      const blur = 40 + Math.sin(p * Math.PI * 1.2) * 6;
      const scale = 1 + appear * 0.018;

      shell.style.setProperty('--smokeAlpha', alpha.toFixed(3));
      shell.style.setProperty('--smokeRot', rot.toFixed(2) + 'deg');
      shell.style.setProperty('--smokeBlur', blur.toFixed(2) + 'px');
      shell.style.setProperty('--smokeScale', scale.toFixed(4));
      shell.style.setProperty('--textHue', (p * 165).toFixed(2) + 'deg');
      shell.style.setProperty('--smoothShift', (p * 180).toFixed(2) + '%');
      shell.style.setProperty('--progress', (p * 100).toFixed(2) + '%');
    }

    if(window.gsap && window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      setVars(0);

      gsap.fromTo(title,
        {opacity:0, y:42, scale:.965, filter:'blur(12px)'},
        {
          opacity:1,
          y:0,
          scale:1,
          filter:'blur(0px)',
          duration:1.05,
          ease:'power3.out',
          scrollTrigger:{
            trigger:section,
            start:'top 72%',
            once:true
          }
        }
      );

      ScrollTrigger.create({
        trigger:section,
        start:'top top',
        end:() => (window.innerWidth < 760 ? '+=1650' : '+=2200'),
        pin:true,
        scrub:.9,
        anticipatePin:1,
        invalidateOnRefresh:true,
        onUpdate:self => setVars(self.progress)
      });
    }else{
      function calc(){
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const p = (vh * .85 - rect.top) / (rect.height + vh * .9);
        setVars(p);
      }
      window.addEventListener('scroll', calc, {passive:true});
      window.addEventListener('resize', calc, {passive:true});
      window.addEventListener('touchmove', calc, {passive:true});
      calc();
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAICertGSAP, {once:true});
  }else{
    initAICertGSAP();
  }
})();
