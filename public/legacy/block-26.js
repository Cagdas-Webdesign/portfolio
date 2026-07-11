/* legacy inline script #26 id="ai-portfolio-assistant-script" */

(function(){
  if(window.__aiPortfolioAssistantLoaded) return;
  window.__aiPortfolioAssistantLoaded = true;

  const WORKER_URL = "https://portfolio-ai-assistant.troll5566.workers.dev/";
  const widget = document.getElementById("aiAssistantWidget");
  if(!widget) return;

  const toggle = widget.querySelector(".ai-chat-toggle");
  const closeBtn = widget.querySelector(".ai-chat-close");
  const form = document.getElementById("aiChatForm");
  const input = document.getElementById("aiChatInput");
  const messages = document.getElementById("aiChatMessages");
  const sendBtn = form ? form.querySelector("button") : null;
  const openButtons = document.querySelectorAll(".ai-open-chat");
  const suggestions = widget.querySelectorAll(".ai-chat-suggestion");
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
  function scrollMessages(){ if(messages) messages.scrollTop = messages.scrollHeight; }
  function addMessage(text, type){
    const msg = document.createElement("div");
    msg.className = "ai-chat-message " + type;
    msg.textContent = text;
    messages.appendChild(msg);
    scrollMessages();
    return msg;
  }
  function addLoading(){
    const msg = document.createElement("div");
    msg.className = "ai-chat-message bot loading";
    msg.innerHTML = "<i></i><i></i><i></i>";
    messages.appendChild(msg);
    scrollMessages();
    return msg;
  }
  async function askAssistant(question){
    const response = await fetch(WORKER_URL, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:question})
    });
    let data = null;
    try{ data = await response.json(); }catch(error){ data = null; }
    if(!response.ok){
      console.error("AI assistant worker error:", data);
      return "Gerade gibt es ein technisches Problem mit dem Assistenten.";
    }
    return data && data.answer ? data.answer : "Keine Antwort erhalten.";
  }
  async function submitQuestion(question){
    const text = (question || "").trim();
    if(!text) return;
    openChat(false);
    if(promptSlider && window.innerWidth > 920){
      promptSlider.classList.add("is-collapsed");
    }
    addMessage(text, "user");
    if(input) input.value = "";
    const loading = addLoading();
    if(sendBtn) sendBtn.disabled = true;
    if(input) input.disabled = true;
    try{
      const answer = await askAssistant(text);
      loading.remove();
      addMessage(answer, "bot");
    }catch(error){
      console.error(error);
      loading.remove();
      addMessage("Gerade gibt es ein technisches Problem. Versuch es gleich nochmal.", "bot");
    }finally{
      if(sendBtn) sendBtn.disabled = false;
      if(input) input.disabled = false;
      if(input) input.focus();
    }
  }

  if(toggle) toggle.addEventListener("click", () => widget.classList.contains("is-open") ? closeChat() : openChat(true));
  if(closeBtn) closeBtn.addEventListener("click", closeChat);
  openButtons.forEach(btn => btn.addEventListener("click", () => openChat(true)));
  suggestions.forEach(btn => btn.addEventListener("click", () => submitQuestion(btn.textContent || "")));
  if(form) form.addEventListener("submit", function(event){ event.preventDefault(); submitQuestion(input ? input.value : ""); });
  document.addEventListener("keydown", function(event){ if(event.key === "Escape" && widget.classList.contains("is-open")) closeChat(); });
})();
