/* legacy inline script #41 id="v58-user-request-final-scripts" */

(function(){
  if(window.__v58UserRequestedFixes) return;
  window.__v58UserRequestedFixes = true;

  function refreshTriggers(){
    if(window.ScrollTrigger){
      clearTimeout(window.__v58StA);
      clearTimeout(window.__v58StB);
      window.__v58StA = setTimeout(function(){ window.ScrollTrigger.refresh(); }, 90);
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
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var val = node.nodeValue;
      var next = val
        .replace(/\s*[–—]+\s*/g, ' ')
        .replace(/([A-Za-zÄÖÜäöüß0-9])\s*-\s*([A-Za-zÄÖÜäöüß0-9])/g, '$1 $2')
        .replace(/\s{2,}/g, ' ');
      if(next !== val) node.nodeValue = next;
    });

    if(document.title){
      document.title = document.title
        .replace(/\s*[–—]+\s*/g, ' ')
        .replace(/([A-Za-zÄÖÜäöüß0-9])\s*-\s*([A-Za-zÄÖÜäöüß0-9])/g, '$1 $2')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
  }

  function centerFlowCircleLabel(){
    document.querySelectorAll('#social-lottie .pu-connect strong').forEach(function(el){
      el.textContent = 'dein Unternehmen';
    });
  }

  function runV58Fixes(){
    centerFlowCircleLabel();
    cleanVisibleText();
    refreshTriggers();
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

  window.addEventListener('resize', function(){
    clearTimeout(window.__v58Resize);
    window.__v58Resize = setTimeout(function(){
      centerFlowCircleLabel();
      refreshTriggers();
    }, 160);
  }, {passive:true});
})();
