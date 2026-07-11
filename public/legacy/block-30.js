/* legacy inline script #30 id="v19-tabs-horizontal-scroll-helper" */

(function(){
  if(window.__v19NestedTabsScrollHelper) return;
  window.__v19NestedTabsScrollHelper = true;
  function init(){
    const section = document.querySelector('#portfolio-nested-offers');
    if(!section) return;
    section.querySelectorAll('.nested-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if(window.matchMedia && window.matchMedia('(max-width: 920px)').matches){
          setTimeout(() => tab.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'}), 40);
        }
      });
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
