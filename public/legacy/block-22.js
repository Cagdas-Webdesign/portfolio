/* legacy inline script #22 id="v73-dom-polish" */

(function(){
  function patchTexts(){
    document.querySelectorAll('#stats .stat-v73')[0]?.querySelector('em') && (document.querySelectorAll('#stats .stat-v73')[0].querySelector('em').textContent='Jahre WordPress');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', patchTexts); else patchTexts();
})();
