/* legacy inline script #31 id="v25-apple-dark-split-tabs-script" */

(function(){
  function initAppleTabs(){
    const section = document.querySelector('#portfolio-nested-offers.ap-implementation-section');
    if(!section) return;
    const tabs = Array.from(section.querySelectorAll('.ap-tab'));
    const panels = Array.from(section.querySelectorAll('.ap-panel'));
    const activate = key => {
      tabs.forEach(tab => {
        const active = tab.dataset.apTab === key;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        if(active && window.matchMedia('(max-width: 920px)').matches){
          tab.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
        }
      });
      panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.apPanel === key));
    };
    tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.apTab)));
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAppleTabs);
  else initAppleTabs();
})();
