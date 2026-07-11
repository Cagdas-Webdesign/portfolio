/* legacy inline script #28 id="v108-slider-repair" */

(function(){
  function init(){
    var section = document.querySelector(".final-bring-section");
    if(!section) return;

    var slides = Array.prototype.slice.call(section.querySelectorAll(".fb-slide"));
    var dots = Array.prototype.slice.call(section.querySelectorAll(".fb-dot"));
    var prev = section.querySelector(".fb-prev");
    var next = section.querySelector(".fb-next");

    if(!slides.length || !prev || !next) return;

    var active = slides.findIndex(function(s){ return s.classList.contains("is-active"); });
    if(active < 0) active = 0;

    function apply(){
      slides.forEach(function(slide, i){
        slide.classList.remove("is-active","is-prev","is-next");
        if(i === active) slide.classList.add("is-active");
        else if(i === (active + 1) % slides.length) slide.classList.add("is-next");
        else if(i === (active - 1 + slides.length) % slides.length) slide.classList.add("is-prev");
      });

      dots.forEach(function(dot, i){
        dot.classList.toggle("is-active", i === active);
      });
    }

    function go(i){
      active = (i + slides.length) % slides.length;
      apply();
    }

    prev.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      go(active - 1);
    };

    next.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      go(active + 1);
    };

    dots.forEach(function(dot, i){
      dot.onclick = function(e){
        e.preventDefault();
        e.stopPropagation();
        go(i);
      };
    });

    var sx = 0, sy = 0, tracking = false;
    var slider = section.querySelector(".fb-slider") || section;

    slider.addEventListener("touchstart", function(e){
      if(!e.touches || !e.touches[0]) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      tracking = true;
    }, {passive:true});

    slider.addEventListener("touchend", function(e){
      if(!tracking || !e.changedTouches || !e.changedTouches[0]) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if(Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.15){
        if(dx < 0) go(active + 1);
        else go(active - 1);
      }
    }, {passive:true});

    apply();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
