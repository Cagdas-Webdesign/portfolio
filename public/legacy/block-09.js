/* legacy inline script #9 id="anon" */

(function(){
  function waitForGsap(fn){
    if(window.gsap && window.ScrollTrigger) fn();
    else setTimeout(function(){waitForGsap(fn)},80);
  }
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function ease(t){t=clamp(t,0,1);return t*t*(3-2*t);}
  function initPlatformUnifiedV14(){
    var section=document.getElementById('social-lottie');
    if(!section || !section.classList.contains('platform-unified-v14') || window.__platformUnifiedV14) return;
    window.__platformUnifiedV14=true;

    gsap.registerPlugin(ScrollTrigger);

    var stage=document.getElementById('puStage');
    var svg=document.getElementById('puLines');
    var connect=document.getElementById('puConnect');
    var head=document.getElementById('puHead');
    var cards=Array.prototype.slice.call(document.querySelectorAll('#social-lottie .pcard'));
    if(!stage || !svg || !connect || !cards.length) return;

    function lerp(a,b,t){return a+(b-a)*t;}
    function getPositions(){
      var w=stage.clientWidth||window.innerWidth;
      var h=stage.clientHeight||window.innerHeight;
      var mobile=w<760;
      var cw=cards[0].offsetWidth || (mobile?118:160);
      var ch=cards[0].offsetHeight || (mobile?58:74);
      var cx=w/2;
      var cy=h*(mobile?0.60:0.58);

      var cols=mobile?2:5;
      var gapX=mobile?Math.min(150,w*0.39):Math.min(208,w*0.145);
      var gapY=mobile?78:108;
      var rows=Math.ceil(cards.length/cols);
      var startTop=h*(mobile?0.37:0.40);

      var row=[];
      cards.forEach(function(card,i){
        var r=Math.floor(i/cols);
        var c=i%cols;
        var items=(r===rows-1)?cards.length-r*cols:cols;
        var rowW=(items-1)*gapX;
        row[i]={
          x:cx-rowW/2+c*gapX-cw/2,
          y:startTop+(r-(rows-1)/2)*gapY-ch/2,
          r:0,
          s:mobile?0.88:0.86
        };
      });

      var orbit=mobile
        ? [[-122,-114],[0,-168],[122,-114],[146,-22],[132,88],[68,170],[-68,170],[-132,88],[-146,-22],[0,232]]
        : [[-326,-156],[-170,-244],[32,-264],[238,-198],[350,-46],[314,144],[150,238],[-54,254],[-254,170],[-350,2]];

      var target=orbit.map(function(o){
        return {
          x:cx+o[0]-cw/2,
          y:cy+o[1]-ch/2,
          r:0,
          s:mobile?0.88:0.86
        };
      });

      return {w:w,h:h,cx:cx,cy:cy,row:row,target:target};
    }

    function center(card){
      var s=Number(gsap.getProperty(card,'scale'))||1;
      return {
        x:(Number(gsap.getProperty(card,'x'))||0)+(card.offsetWidth||140)*s/2,
        y:(Number(gsap.getProperty(card,'y'))||0)+(card.offsetHeight||64)*s/2
      };
    }

    function curve(a,b){
      var dx=b.x-a.x;
      var bend=Math.max(26,Math.min(84,Math.abs(dx)*0.28));
      var dir=dx>=0?1:-1;
      var c1x=a.x + dx*0.34;
      var c1y=a.y;
      var c2x=b.x - bend*dir;
      var c2y=b.y;
      return 'M '+a.x.toFixed(1)+' '+a.y.toFixed(1)+' C '+c1x.toFixed(1)+' '+c1y.toFixed(1)+' '+c2x.toFixed(1)+' '+c2y.toFixed(1)+' '+b.x.toFixed(1)+' '+b.y.toFixed(1);
    }

    function drawLines(amount,cx,cy){
      if(!svg) return;
      if(amount <= 0.01){ svg.innerHTML=''; return; }
      var w=stage.clientWidth||window.innerWidth;
      var h=stage.clientHeight||window.innerHeight;
      svg.setAttribute('viewBox','0 0 '+w+' '+h);
      var out='';
      cards.forEach(function(card){
        var col=card.dataset.color||'#8ffff0';
        var d=curve(center(card),{x:cx,y:cy});
        out += '<path d="'+d+'" stroke="'+col+'" stroke-opacity="'+(0.18 + amount*0.58).toFixed(3)+'"></path>';
      });
      svg.innerHTML=out;
    }

    function apply(p){
      var pos=getPositions();
      var assemble=ease((p-0.12)/0.42);
      var connectIn=ease((p-0.42)/0.14);
      var lineIn=ease((p-0.52)/0.18);
      var titleFade=ease((p-0.22)/0.14);

      cards.forEach(function(card,i){
        var a=pos.row[i], b=pos.target[i];
        gsap.set(card,{
          x:lerp(a.x,b.x,assemble),
          y:lerp(a.y,b.y,assemble),
          rotation:0,
          scale:lerp(a.s,b.s,assemble),
          opacity:1,
          clearProps:'filter',
          force3D:true
        });
      });

      gsap.set(connect,{
        left:pos.cx,
        top:pos.cy,
        xPercent:-50,
        yPercent:-50,
        opacity:connectIn,
        scale:0.84 + connectIn*0.16,
        force3D:true
      });

      if(head){
        gsap.set(head,{opacity:1-titleFade,y:-16*titleFade});
      }

      drawLines(lineIn,pos.cx,pos.cy);
    }

    apply(0);
    ScrollTrigger.getAll().forEach(function(st){ if(st.trigger===section) st.kill(); });
    ScrollTrigger.create({
      trigger:section,
      start:'top top',
      end:'bottom bottom',
      scrub:0.6,
      invalidateOnRefresh:true,
      onUpdate:function(self){ apply(self.progress); },
      onRefresh:function(self){ apply(self.progress); }
    });

    setTimeout(function(){ ScrollTrigger.refresh(); },220);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){waitForGsap(initPlatformUnifiedV14)});
  }else{
    waitForGsap(initPlatformUnifiedV14);
  }
  window.addEventListener('resize',function(){
    if(window.ScrollTrigger){
      clearTimeout(window.__puV14Resize);
      window.__puV14Resize=setTimeout(function(){ScrollTrigger.refresh()},180);
    }
  },{passive:true});
})();
