/* legacy inline script #25 id="v76-nested-real-icons" */

(function(){
  if(window.__v76NestedRealIcons) return;
  window.__v76NestedRealIcons = true;

  const icons = {
    plugin: `
      <svg class="nested-svg-icon" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M15 7h10v6c0 1.5 1.2 2.7 2.7 2.7S30.4 14.5 30.4 13h4.1v10h-5.8c-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7h5.8v4.6H15v-5.7c0-1.5-1.2-2.7-2.7-2.7S9.6 25.8 9.6 27.3V33H5V20h5.9c1.5 0 2.7-1.2 2.7-2.7s-1.2-2.7-2.7-2.7H5V7h10z"/>
        <circle class="pulse-dot" cx="20" cy="20" r="2.2"/>
      </svg>`,
    shop: `
      <svg class="nested-svg-icon" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M8 9h4l3.2 16.4h13.7l3.2-11.2H15"/>
        <circle cx="17" cy="31" r="2.6"/>
        <circle cx="29" cy="31" r="2.6"/>
        <path d="M18 18h12"/>
        <circle class="pulse-dot" cx="31" cy="14" r="2.1"/>
      </svg>`,
    systems: `
      <svg class="nested-svg-icon" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="9" cy="20" r="4.5"/>
        <circle cx="31" cy="10" r="4.5"/>
        <circle cx="31" cy="30" r="4.5"/>
        <path d="M13.3 18.2 26.7 11.8M13.3 21.8l13.4 6.4"/>
        <circle class="pulse-dot" cx="20" cy="20" r="2"/>
      </svg>`
  };

  function apply(){
    document.querySelectorAll('.nested-tab').forEach(tab => {
      const orb = tab.querySelector('.tab-orb');
      if(!orb) return;
      const key = tab.dataset.tab;
      if(icons[key]) orb.innerHTML = icons[key];
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
