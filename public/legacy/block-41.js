/* legacy inline script #41 id="v58-user-request-final-scripts" */

(function(){
  if(window.__v58UserRequestedFixes) return;
  window.__v58UserRequestedFixes = true;

  function refreshTriggers(){
    if(window.ScrollTrigger){
      /* Performance (2026-10-15): nur noch der spaete Refresh (420 ms) —
         der fruehe nach 90 ms war ein Zwischenzustand, den der spaete
         ohnehin ueberschreibt (je Refresh mehrere 100 ms auf dem iPhone). */
      clearTimeout(window.__v58StB);
      window.__v58StB = setTimeout(function(){ window.ScrollTrigger.refresh(); }, 420);
    }
  }

  function cleanVisibleText(){
    var root = document.body;
    if(!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode:function(node){
        if(!node || !node.parentNode) return NodeFilter.FILTER_REJECT;
        var tag = node.parentNode.nodeName;
        if(/^(SCRIPT|STYLE|NOSCRIPT|TITLE)$/.test(tag)) return NodeFilter.FILTER_REJECT;
        /* Woertlich zu haltende Teilbaeume (z. B. E-Mail-Adressen) ausnehmen. */
        if(node.parentElement && node.parentElement.closest('[data-keep-text]')) return NodeFilter.FILTER_REJECT;
        if(node.nodeValue.trim() === '') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [];
    var changed = false;
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var val = node.nodeValue;
      var next = val
        .replace(/\s*[–—]+\s*/g, ' ')
        .replace(/([A-Za-zÄÖÜäöüß0-9])\s*-\s*([A-Za-zÄÖÜäöüß0-9])/g, '$1 $2')
        .replace(/\s{2,}/g, ' ');
      if(next !== val){ node.nodeValue = next; changed = true; }
    });

    if(document.title){
      document.title = document.title
        .replace(/\s*[–—]+\s*/g, ' ')
        .replace(/([A-Za-zÄÖÜäöüß0-9])\s*-\s*([A-Za-zÄÖÜäöüß0-9])/g, '$1 $2')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    return changed;
  }

  function centerFlowCircleLabel(){
    document.querySelectorAll('#social-lottie .pu-connect strong').forEach(function(el){
      el.textContent = 'dein Unternehmen';
    });
  }

  /* Performance (2026-10-15): Refresh nur, wenn sich Text tatsaechlich
     geaendert hat (Umbrueche koennen Hoehen verschieben). Vorher 2 komplette
     Refreshes pro Lauf (Start, load, +450 ms, +1400 ms), je 430-510 ms
     Haupt-Thread im Mac-Emulator, meist ohne jede Aenderung. */
  function runV58Fixes(){
    centerFlowCircleLabel();
    if(cleanVisibleText()) refreshTriggers();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', runV58Fixes, {once:true});
  } else {
    runV58Fixes();
  }

  window.addEventListener('load', function(){
    runV58Fixes();
    setTimeout(runV58Fixes, 450);
    setTimeout(runV58Fixes, 1400);
  }, {once:true});

  /* Nur bei Breitenaenderung: iOS meldet beim Scrollen resize, wenn die
     Adressleiste ein-/ausfaehrt (nur die Hoehe aendert sich). Ein Refresh
     dann mitten in der Scrollbewegung ruckelt und setzt Szenen neu auf.
     ScrollTrigger behandelt solche Mobile-Resizes selbst. */
  var lastWidth = window.innerWidth;
  window.addEventListener('resize', function(){
    if(window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(window.__v58Resize);
    window.__v58Resize = setTimeout(function(){
      centerFlowCircleLabel();
      refreshTriggers();
    }, 160);
  }, {passive:true});
})();
