/* legacy inline script #33 id="v30-systems-svg-grad-fix" */

(function(){
  var svg = document.querySelector('#portfolio-nested-offers .v30-system-lines');
  if(!svg) return;
  if(!svg.querySelector('defs')){
    var ns='http://www.w3.org/2000/svg';
    var defs=document.createElementNS(ns,'defs');
    var grad=document.createElementNS(ns,'linearGradient');
    grad.setAttribute('id','v30LineGrad');
    grad.setAttribute('x1','0');grad.setAttribute('x2','1');
    [['0','#64d2ff'],['0.5','#ffffff'],['1','#bf5af2']].forEach(function(s){var st=document.createElementNS(ns,'stop');st.setAttribute('offset',s[0]);st.setAttribute('stop-color',s[1]);grad.appendChild(st);});
    defs.appendChild(grad);svg.prepend(defs);
  }
})();
