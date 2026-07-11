/* legacy inline script #12 id="anon" */

(function(){
  function initCertHardHeaderOff(){
    if(window.__certHardHeaderOffV146) return;
    window.__certHardHeaderOffV146 = true;

    const cert = document.getElementById('certified-social-media-manager');
    if(!cert) return;

    function update(){
      const r = cert.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const active = r.top < vh * 0.72 && r.bottom > vh * 0.16;
      document.body.classList.toggle('cert-focus', active);
    }

    update();
    window.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update, {passive:true});
    window.addEventListener('orientationchange', () => setTimeout(update, 180), {passive:true});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initCertHardHeaderOff);
  } else {
    initCertHardHeaderOff();
  }
})();
