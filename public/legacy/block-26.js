/* legacy inline script #26 id="ai-portfolio-assistant-script" */

(function(){
  if(window.__aiPortfolioAssistantLoaded) return;
  window.__aiPortfolioAssistantLoaded = true;

  /* Nachrichtenversand, Quick Prompts und RAG-Anbindung liegen in
     src/components/AiAssistantWidget.jsx (Worker + Turnstile). Hier bleiben
     nur Oeffnen/Schliessen und der Prompt-Slider. */
  const widget = document.getElementById("aiAssistantWidget");
  if(!widget) return;

  const toggle = widget.querySelector(".ai-chat-toggle");
  const closeBtn = widget.querySelector(".ai-chat-close");
  const input = document.getElementById("aiChatInput");
  const openButtons = document.querySelectorAll(".ai-open-chat");
  const promptSlider = widget.querySelector(".ai-prompt-slider");
  const promptTrack = widget.querySelector(".ai-prompt-track");
  const promptDots = widget.querySelectorAll(".ai-prompt-dot");
  const promptPrev = widget.querySelector(".ai-prompt-prev");
  const promptNext = widget.querySelector(".ai-prompt-next");
  const promptPull = widget.querySelector(".ai-prompt-pull");

  function setPromptSlide(index){
    if(!promptTrack || !promptDots.length) return;
    const next = index === 1 ? 1 : 0;
    promptTrack.setAttribute("data-active-slide", String(next));
    promptDots.forEach(function(dot){
      dot.classList.toggle("is-active", dot.getAttribute("data-slide") === String(next));
    });
  }
  promptDots.forEach(function(dot){
    dot.addEventListener("click", function(){
      setPromptSlide(Number(dot.getAttribute("data-slide") || "0"));
    });
  });

  function getPromptSlide(){
    if(!promptTrack) return 0;
    return promptTrack.getAttribute("data-active-slide") === "1" ? 1 : 0;
  }
  if(promptPrev){
    promptPrev.addEventListener("click", function(){
      setPromptSlide(getPromptSlide() === 0 ? 1 : 0);
    });
  }
  if(promptNext){
    promptNext.addEventListener("click", function(){
      setPromptSlide(getPromptSlide() === 0 ? 1 : 0);
    });
  }
  if(promptPull && promptSlider){
    promptPull.addEventListener("click", function(){
      promptSlider.classList.toggle("is-collapsed");
    });
  }

  function openChat(focusInput){
    widget.classList.add("is-open");
    if(focusInput && input) setTimeout(() => input.focus(), 180);
  }
  function closeChat(){ widget.classList.remove("is-open"); }

  if(toggle) toggle.addEventListener("click", () => widget.classList.contains("is-open") ? closeChat() : openChat(true));
  if(closeBtn) closeBtn.addEventListener("click", closeChat);
  openButtons.forEach(btn => btn.addEventListener("click", () => openChat(true)));
  document.addEventListener("keydown", function(event){ if(event.key === "Escape" && widget.classList.contains("is-open")) closeChat(); });
})();
