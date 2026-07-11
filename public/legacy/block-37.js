/* legacy inline script #37 id="v66-system-story-full-redesign-script" */

(function(){
  if(window.__v66SystemStory || !window.gsap || !window.ScrollTrigger) return;
  var section=document.querySelector('#system-story-v64.system-story-v66');
  if(!section) return;
  window.__v66SystemStory=true;
  gsap.registerPlugin(ScrollTrigger);

  var mm=gsap.matchMedia();

  function setBase(scope){
    gsap.set(scope.querySelectorAll('.v66-in-left'),{x:-90,opacity:0});
    gsap.set(scope.querySelectorAll('.v66-in-right'),{x:90,opacity:0});
    gsap.set(scope.querySelectorAll('.v66-in-up'),{y:56,opacity:0});
    gsap.set(scope.querySelectorAll('.v66-in-pop'),{scale:.82,opacity:0,transformOrigin:'50% 50%'});
    gsap.set(scope.querySelectorAll('.v66-in-spin'),{scale:.6,rotation:-110,opacity:0,transformOrigin:'50% 50%'});
  }

  mm.add('(min-width: 900px)', function(){
    var track=section.querySelector('.v66-track');
    var panels=gsap.utils.toArray(section.querySelectorAll('.v66-panel'));
    setBase(section);
    var tl=gsap.timeline({
      defaults:{ease:'none'},
      scrollTrigger:{
        trigger:section,
        start:'top top',
        end:function(){return '+=' + (window.innerWidth * (panels.length - 1) * 1.2);},
        scrub:1,
        pin:true,
        invalidateOnRefresh:true
      }
    });

    /* Phase 2 fix: xPercent was relative to the 300vw track (3x overshoot,
       ending in a black void). Travel exactly to the last panel instead;
       invalidateOnRefresh recomputes this on resize. */
    tl.to(track,{x:function(){return -(track.scrollWidth - window.innerWidth);},duration:1},0);

    tl.to('.v66-panel--intro .v66-in-up',{y:0,opacity:1,stagger:.03,duration:.12,ease:'power2.out'},0.02)
      .to('.v66-panel--intro .v66-in-pop',{scale:1,opacity:1,stagger:.03,duration:.1,ease:'back.out(1.6)'},0.03)
      .to('.v66-panel--intro .v66-in-spin',{scale:1,rotation:0,opacity:1,duration:.12,ease:'back.out(1.5)'},0.04)
      .to('.v66-panel--intro .v66-in-right',{x:0,opacity:1,stagger:.04,duration:.12,ease:'power2.out'},0.05);

    tl.to('.v66-panel--words .v66-in-left',{x:0,opacity:1,stagger:.05,duration:.12,ease:'power2.out'},0.34)
      .to('.v66-panel--words .v66-in-right',{x:0,opacity:1,stagger:.05,duration:.12,ease:'power2.out'},0.38)
      .to('.v66-panel--words .v66-in-pop',{scale:1,opacity:1,stagger:.05,duration:.12,ease:'back.out(1.5)'},0.36)
      .to('.v66-panel--words .v66-in-spin',{scale:1,rotation:0,opacity:1,duration:.14,ease:'back.out(1.5)'},0.39);

    tl.to('.v66-panel--final .v66-in-left',{x:0,opacity:1,duration:.12,ease:'power2.out'},0.69)
      .to('.v66-panel--final .v66-in-spin',{scale:1,rotation:0,opacity:1,duration:.14,ease:'back.out(1.5)'},0.72)
      .to('.v66-panel--final .v66-in-up',{y:0,opacity:1,stagger:.04,duration:.12,ease:'power2.out'},0.74);

    return function(){
      ScrollTrigger.getAll().forEach(function(st){ if(st.trigger===section) st.kill(); });
    };
  });

  mm.add('(max-width: 899px)', function(){
    section.querySelectorAll('.v66-panel').forEach(function(panel){
      setBase(panel);
      gsap.timeline({
        scrollTrigger:{trigger:panel,start:'top 80%',toggleActions:'play none none reverse'}
      })
      .to(panel.querySelectorAll('.v66-in-up'),{y:0,opacity:1,stagger:.04,duration:.55,ease:'power3.out'},0)
      .to(panel.querySelectorAll('.v66-in-left'),{x:0,opacity:1,stagger:.04,duration:.55,ease:'power3.out'},0.06)
      .to(panel.querySelectorAll('.v66-in-right'),{x:0,opacity:1,stagger:.04,duration:.55,ease:'power3.out'},0.08)
      .to(panel.querySelectorAll('.v66-in-pop'),{scale:1,opacity:1,stagger:.04,duration:.52,ease:'back.out(1.45)'},0.04)
      .to(panel.querySelectorAll('.v66-in-spin'),{scale:1,rotation:0,opacity:1,stagger:.04,duration:.62,ease:'back.out(1.45)'},0.1);
    });
  });
})();
