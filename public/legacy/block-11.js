/* legacy inline script #11 id="anon" */

(function(){
  function initCertHeaderClear(){
    if(!window.ScrollTrigger || window.__certHeaderClearV145) return;
    window.__certHeaderClearV145 = true;
    const cert = document.getElementById('certified-social-media-manager');
    if(!cert) return;
    ScrollTrigger.create({
      trigger: cert,
      start: 'top 18%',
      end: 'bottom 12%',
      onEnter: () => document.body.classList.add('cert-focus'),
      onEnterBack: () => document.body.classList.add('cert-focus'),
      onLeave: () => document.body.classList.remove('cert-focus'),
      onLeaveBack: () => document.body.classList.remove('cert-focus')
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => setTimeout(initCertHeaderClear, 120));
  } else {
    setTimeout(initCertHeaderClear, 120);
  }
})();
