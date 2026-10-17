/* legacy inline script #8 id="anon" */

(function(){
  /* Performance (2026-10-15): Gehoert zur entfernten Plattform-Section
     (#social-lottie / #platform-row-prelude). Ohne sie loeste dieser Block nur
     noch komplette ScrollTrigger-Refreshes aus — beim Laden und bei jedem
     resize (iOS: Adressleiste beim Scrollen). */
  if(!document.getElementById('social-lottie') && !document.getElementById('platform-row-prelude')) return;
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function ease(t){ t = clamp(t,0,1); return t*t*(3-2*t); }

  function waitForGsap(fn){
    if(window.gsap && window.ScrollTrigger){ fn(); }
    else { setTimeout(function(){ waitForGsap(fn); }, 80); }
  }

  function initPlatformPreludeV12(){
    var section = document.getElementById('platform-row-prelude');
    var wrap = document.getElementById('prCardsWrap');
    var cards = Array.prototype.slice.call(document.querySelectorAll('#platform-row-prelude .pc-row-card'));
    if(!section || !wrap || !cards.length) return;

    ScrollTrigger.getAll().forEach(function(st){ if(st.trigger === section) st.kill(); });

    function apply(progress){
      var down = ease((progress - .28) / .42);
      var fade = ease((progress - .82) / .14);

      gsap.set(wrap, {
        y: down * window.innerHeight * (window.innerWidth < 760 ? .40 : .34),
        scale: 1 - down * .06 - fade * .08,
        opacity: 1 - fade,
        force3D: true
      });

      cards.forEach(function(card, i){
        var float = (1 - down);
        var individual = ease((progress - (.38 + i*.018)) / .34);
        gsap.set(card, {
          x: Math.sin(i*.95 + progress*6) * (window.innerWidth < 760 ? 8 : 14) * float
             + Math.sin(i*1.3) * (window.innerWidth < 760 ? 18 : 34) * individual,
          y: Math.cos(i*.75 + progress*5) * (window.innerWidth < 760 ? 6 : 10) * float
             + Math.cos(i*.9) * (window.innerWidth < 760 ? 12 : 22) * individual,
          rotation: (i%2 ? -2 : 2) * float + (i%2 ? -5 : 5) * individual,
          opacity: 1 - fade,
          scale: 1 - fade*.1,
          force3D: true
        });
      });
    }

    apply(0);

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: .9,
      invalidateOnRefresh: true,
      onUpdate: function(self){ apply(self.progress); },
      onRefresh: function(self){ apply(self.progress); }
    });
  }

  function initConnectV12(){
    var section = document.getElementById('social-lottie');
    if(!section || !section.classList.contains('platform-connect-v5')) return;
    var stage = document.getElementById('pcStage');
    var svg = document.getElementById('pcLines');
    var connect = document.getElementById('pcConnect');
    var cards = Array.prototype.slice.call(document.querySelectorAll('#social-lottie .pcard'));
    if(!stage || !svg || !connect || !cards.length) return;

    ScrollTrigger.getAll().forEach(function(st){ if(st.trigger === section) st.kill(); });

    function positions(){
      var w = stage.clientWidth || window.innerWidth;
      var h = stage.clientHeight || window.innerHeight;
      var mobile = w < 760;
      var cx = w / 2;
      var cy = h * .50;
      var cw = cards[0].offsetWidth || (mobile ? 132 : 160);
      var ch = cards[0].offsetHeight || (mobile ? 66 : 72);

      var start = [];
      var cols = mobile ? 2 : 5;
      var gapX = mobile ? Math.min(150, w*.38) : Math.min(190, w*.135);
      var gapY = mobile ? 78 : 100;
      cards.forEach(function(card,i){
        var r = Math.floor(i/cols);
        var c = i % cols;
        var rows = Math.ceil(cards.length/cols);
        var items = (r === rows-1) ? cards.length - r*cols : cols;
        var rowW = (items-1)*gapX;
        start[i] = {
          x: cx - rowW/2 + c*gapX - cw/2,
          y: h*(mobile ? .20 : .18) + (r-(rows-1)/2)*gapY - ch/2,
          s: mobile ? .86 : .82,
          r: i%2 ? -5 : 5
        };
      });

      var orbitD = [[-330,-124],[-126,-214],[126,-214],[330,-124],[330,124],[126,214],[-126,214],[-330,124],[-222,0],[222,0]];
      var orbitM = [[-122,-122],[0,-178],[122,-122],[138,-42],[122,42],[58,152],[-58,152],[-122,42],[-138,-42],[122,112]];
      var orbit = mobile ? orbitM : orbitD;
      var target = orbit.map(function(o){
        return {
          x: cx + o[0] - cw/2,
          y: cy + o[1] - ch/2,
          s: mobile ? .86 : .82,
          r: 0
        };
      });
      return {cx:cx, cy:cy, start:start, target:target};
    }

    function centerOf(card){
      var s = gsap.getProperty(card,'scale') || 1;
      return {
        x: (gsap.getProperty(card,'x') || 0) + (card.offsetWidth || 140) * s / 2,
        y: (gsap.getProperty(card,'y') || 0) + (card.offsetHeight || 66) * s / 2
      };
    }

    function curve(a,b){
      var dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1;
      var mx=(a.x+b.x)/2, my=(a.y+b.y)/2, bend=Math.min(46,d*.1);
      return 'M '+a.x.toFixed(1)+' '+a.y.toFixed(1)+' Q '+(mx+(-dy/d)*bend).toFixed(1)+' '+(my+(dx/d)*bend).toFixed(1)+' '+b.x.toFixed(1)+' '+b.y.toFixed(1);
    }

    function drawLines(amount, cx, cy){
      if(!svg) return;
      if(amount <= .02){ svg.innerHTML=''; return; }
      var w=stage.clientWidth || window.innerWidth, h=stage.clientHeight || window.innerHeight;
      svg.setAttribute('viewBox', '0 0 '+w+' '+h);
      var out = '';
      cards.forEach(function(card,i){
        var local = ease((amount - i*.04) / .58);
        if(local <= .01) return;
        var col = card.dataset.color || '#8ffff0';
        var d = curve(centerOf(card), {x:cx,y:cy});
        out += '<path d="'+d+'" stroke="'+col+'" stroke-opacity="'+(local*.70).toFixed(3)+'"></path>';
        if(local > .46){
          out += '<path class="pulse" d="'+d+'" stroke="'+col+'" stroke-opacity="'+(local*.45).toFixed(3)+'"></path>';
        }
      });
      svg.innerHTML = out;
    }

    var pos = positions();

    function apply(progress){
      pos = positions();

      var intro = ease(progress / .18);
      var move = ease((progress - .18) / .46);
      var line = ease((progress - .70) / .18);
      var glow = ease((progress - .86) / .10);

      gsap.set(connect, {
        left: pos.cx,
        top: pos.cy,
        xPercent: -50,
        yPercent: -50,
        opacity: intro,
        scale: .72 + intro*.25 + glow*.06,
        force3D: true
      });

      cards.forEach(function(card,i){
        var a = pos.start[i];
        var b = pos.target[i];
        var x = a.x + (b.x-a.x)*move;
        var y = a.y + (b.y-a.y)*move;
        gsap.set(card, {
          left: 0,
          top: 0,
          x: x,
          y: y,
          scale: a.s + (b.s-a.s)*move,
          rotation: a.r + (b.r-a.r)*move,
          opacity: 1,
          force3D: true,
          filter: 'brightness('+(1+glow*.12)+') saturate('+(1+glow*.16)+')'
        });
      });

      section.style.setProperty('--finishGlow', glow.toFixed(3));
      drawLines(line, pos.cx, pos.cy);
    }

    apply(0);

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: .9,
      invalidateOnRefresh: true,
      onUpdate: function(self){ apply(self.progress); },
      onRefresh: function(self){ apply(self.progress); }
    });
  }

  function boot(){
    if(window.__platformV12Booted) return;
    window.__platformV12Booted = true;
    gsap.registerPlugin(ScrollTrigger);
    initPlatformPreludeV12();
    initConnectV12();
    setTimeout(function(){ ScrollTrigger.refresh(); }, 250);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ waitForGsap(boot); });
  } else {
    waitForGsap(boot);
  }

  window.addEventListener('resize', function(){
    if(window.ScrollTrigger){
      clearTimeout(window.__platformV12Resize);
      window.__platformV12Resize = setTimeout(function(){ ScrollTrigger.refresh(); }, 180);
    }
  }, {passive:true});
})();
