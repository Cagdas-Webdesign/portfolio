/* legacy inline script #21 id="v72-strong-connect-label" */

(function(){
  function fixConnect(){
    document.querySelectorAll('#social-lottie .pc-connect strong').forEach(function(el){
      el.textContent = 'dein Unternehmen';
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', fixConnect);
  } else {
    fixConnect();
  }
  setInterval(fixConnect, 900);
})();
