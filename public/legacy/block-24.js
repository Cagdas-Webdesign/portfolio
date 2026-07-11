/* legacy inline script #24 id="v75-nested-hover-mouse" */

(function(){
  const tabs = document.querySelectorAll('.nested-tab');
  tabs.forEach(tab => {
    tab.addEventListener('pointermove', e => {
      const r = tab.getBoundingClientRect();
      tab.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      tab.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });
})();
