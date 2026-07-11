/* legacy inline script #6 id="anon" */

/* ===== V96 FINAL: kleinen alten Cursor-Dot wirklich löschen ===== */
(function(){
  const namedSelector = [
    '.cursor','.cursor-dot','.cursor-ring','.cursor-follower','.cursor-circle','.cursor-glow',
    '.custom-cursor','.custom-cursor-dot','.custom-cursor-ring',
    '.mouse','.mouse-dot','.mouse-ring','.mouse-follower',
    '.pointer','.pointer-ring','.pointer-dot',
    '.cursor__dot','.cursor__ring','.cursor__ball','.cursor__circle',
    '#cursor','#cursorDot','#cursorRing','#cursorFollower','#cursorCircle',
    '#customCursor','#customCursorDot','#customCursorRing',
    '#mouse','#mouseDot','#mouseRing','#pointer','#pointerRing','#pointerDot',
    '[data-cursor]','[data-cursor-dot]','[data-cursor-ring]'
  ].join(',');

  function isOldCursorElement(el){
    if(!el || el === document.body || el === document.documentElement) return false;

    const cs = getComputedStyle(el);
    const cls = String(el.className || '').toLowerCase();
    const id = String(el.id || '').toLowerCase();

    if(/cursor|mouse|pointer/.test(cls + ' ' + id)) return true;

    const fixed = cs.position === 'fixed';
    const noPointer = cs.pointerEvents === 'none';
    const w = el.getBoundingClientRect().width;
    const h = el.getBoundingClientRect().height;
    const small = w >= 3 && w <= 130 && h >= 3 && h <= 130;
    const round = cs.borderRadius.includes('%') || parseFloat(cs.borderRadius) >= 8;
    const visual = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                   cs.backgroundImage !== 'none' ||
                   cs.boxShadow !== 'none' ||
                   (cs.borderStyle !== 'none' && cs.borderWidth !== '0px');

    // Das trifft genau alte Cursor-Dots/Ringe, aber nicht normale UI.
    return fixed && noPointer && small && round && visual;
  }

  function removeOldCursor(){
    document.querySelectorAll(namedSelector).forEach(el => el.remove());

    document.querySelectorAll('body *').forEach(el => {
      if(isOldCursorElement(el)) el.remove();
    });
  }

  function start(){
    removeOldCursor();

    // Falls ein altes Cursor-Script den Dot wieder anhängt, löschen wir ihn sofort erneut.
    const observer = new MutationObserver(removeOldCursor);
    observer.observe(document.body, {childList:true, subtree:true});

    window.addEventListener('mousemove', removeOldCursor, {passive:true});
    window.addEventListener('pointermove', removeOldCursor, {passive:true});

    [50,150,300,700,1200,2000].forEach(t => setTimeout(removeOldCursor, t));
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start, {once:true});
  }else{
    start();
  }
})();
