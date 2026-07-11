/* legacy inline script #27 id="ai-desktop-outside-click-close-v85" */

(function(){
  if(window.__aiDesktopOutsideCloseLoaded) return;
  window.__aiDesktopOutsideCloseLoaded = true;

  var widget = document.getElementById("aiAssistantWidget");
  if(!widget) return;

  document.addEventListener("pointerdown", function(event){
    if(window.innerWidth <= 920) return;
    if(!widget.classList.contains("is-open")) return;
    if(widget.contains(event.target)) return;
    var opener = event.target && event.target.closest ? event.target.closest(".ai-open-chat") : null;
    if(opener) return;
    widget.classList.remove("is-open");
  });
})();
