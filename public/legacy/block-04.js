/* legacy inline script #4 id="anon" */

/* ===== V94: alte Cursor-Elemente entfernen, neue CSS-Maus behalten ===== */
(function(){
  function removeOldCursor(){
    const selectors = [
      '.cursor','.cursor-dot','.cursor-ring','.cursor-follower','.cursor-circle','.cursor-glow',
      '.mouse','.mouse-dot','.mouse-ring','.pointer-ring','.pointer-dot',
      '#cursor','#cursorDot','#cursorRing','#cursorFollower','#cursorCircle',
      '#mouse','#mouseDot','#mouseRing','[data-cursor]'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(el => el.remove());
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', removeOldCursor, {once:true});
  }else{
    removeOldCursor();
  }

  const observer = new MutationObserver(removeOldCursor);
  observer.observe(document.documentElement, {childList:true, subtree:true});
})();
