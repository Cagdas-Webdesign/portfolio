/* legacy inline script #34 id="v31-system-grad-fix" */

(function(){
  var svg = document.querySelector('#portfolio-nested-offers .v31-board-lines');
  if(!svg) return;
  var ns='http://www.w3.org/2000/svg';
  if(!svg.querySelector('defs')){
    var defs=document.createElementNS(ns,'defs');
    var grad=document.createElementNS(ns,'linearGradient');
    grad.setAttribute('id','v31Grad');grad.setAttribute('x1','0');grad.setAttribute('x2','1');
    [['0','#64d2ff'],['0.5','#ffffff'],['1','#bf5af2']].forEach(function(s){var st=document.createElementNS(ns,'stop');st.setAttribute('offset',s[0]);st.setAttribute('stop-color',s[1]);grad.appendChild(st);});
    defs.appendChild(grad);svg.prepend(defs);
  }
})();
