/* legacy inline script #20 id="v71-connect-observer-fix" */

(function(){
  function applyConnectLabel(){
    document.querySelectorAll('#social-lottie .pc-connect strong').forEach(function(el){
      if(el.textContent.trim() !== 'dein Unternehmen'){
        el.textContent = 'dein Unternehmen';
      }
    });
  }
  function init(){
    applyConnectLabel();
    var root = document.querySelector('#social-lottie');
    if(root && 'MutationObserver' in window){
      var mo = new MutationObserver(function(){ applyConnectLabel(); });
      mo.observe(root, {childList:true, subtree:true, characterData:true});
    }
    setTimeout(applyConnectLabel, 300);
    setTimeout(applyConnectLabel, 1200);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
