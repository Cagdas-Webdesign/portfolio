/* legacy inline script #19 id="v70-connect-copy-fix" */

(function(){
  function applyV70(){
    var connectLabel = document.querySelector('#social-lottie .pc-connect strong');
    if(connectLabel){
      connectLabel.textContent = 'dein Unternehmen';
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyV70);
  } else {
    applyV70();
  }
})();
