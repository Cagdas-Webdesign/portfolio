/* legacy inline script #5 id="anon" */

/* ===== V95 FINAL: alte Custom-Cursor-Ringe hart entfernen ===== */
(function(){
  const selector = [
    '.cursor','.cursor-dot','.cursor-ring','.cursor-follower','.cursor-circle','.cursor-glow',
    '.custom-cursor','.custom-cursor-dot','.custom-cursor-ring',
    '.mouse','.mouse-dot','.mouse-ring','.mouse-follower',
    '.pointer','.pointer-ring','.pointer-dot',
    '#cursor','#cursorDot','#cursorRing','#cursorFollower','#cursorCircle',
    '#customCursor','#customCursorDot','#customCursorRing',
    '#mouse','#mouseDot','#mouseRing','#pointer','#pointerRing','#pointerDot',
    '[data-cursor]','[data-cursor-dot]','[data-cursor-ring]'
  ].join(',');

  function looksLikeOldCursor(el){
    if(!el || el === document.documentElement || el === document.body) return false;
    const cs = getComputedStyle(el);
    const cls = (el.className || '').toString().toLowerCase();
    const id = (el.id || '').toLowerCase();

    if(/cursor|mouse|pointer/.test(cls + ' ' + id)) return true;

    const fixed = cs.position === 'fixed';
    const none = cs.pointerEvents === 'none';
    const round = cs.borderRadius.includes('%') || parseFloat(cs.borderRadius) > 20;
    const small = el.offsetWidth > 6 && el.offsetWidth < 120 && el.offsetHeight > 6 && el.offsetHeight < 120;
    const high = Number(cs.zIndex) > 100 || cs.zIndex === 'auto';
    const hasRingBorder = cs.borderStyle !== 'none' && cs.borderWidth !== '0px';

    return fixed && none && round && small && high && hasRingBorder;
  }

  function removeOldCursor(){
    document.querySelectorAll(selector).forEach(el => el.remove());

    // Entfernt auch dynamisch erzeugte Kreis-Ringe ohne bekannte Klasse.
    document.querySelectorAll('body > div, body > span').forEach(el => {
      if(looksLikeOldCursor(el)) el.remove();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', removeOldCursor, {once:true});
  }else{
    removeOldCursor();
  }

  window.addEventListener('load', removeOldCursor, {once:true});
  setTimeout(removeOldCursor, 50);
  setTimeout(removeOldCursor, 300);
  setTimeout(removeOldCursor, 1000);

  new MutationObserver(removeOldCursor).observe(document.body || document.documentElement, {
    childList:true,
    subtree:true
  });
})();
