/* legacy inline script #23 id="v74-nested-tabs-script" */

(function(){
  if(window.__v74NestedTabs) return;
  window.__v74NestedTabs = true;
  function initNestedTabs(){
    const section = document.querySelector('#portfolio-nested-offers');
    if(!section) return;
    const tabs = Array.from(section.querySelectorAll('.nested-tab'));
    const panels = Array.from(section.querySelectorAll('.nested-panel'));
    const shell = section.querySelector('.nested-shell');
    function activate(key){
      tabs.forEach(tab => {
        const active = tab.dataset.tab === key;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.panel === key));
      if(shell) shell.dataset.active = key;
    }
    tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.tab)));
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNestedTabs);
  else initNestedTabs();
})();
