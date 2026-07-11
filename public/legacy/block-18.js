/* legacy inline script #18 id="v68-speaker-badge-script" */

(function(){
  if(window.__v68SpeakerBadgeRestored) return;
  window.__v68SpeakerBadgeRestored = true;

  function injectBadge(){
    const badge = document.getElementById('platformIconBadge');
    if(!badge || badge.querySelector('.speaker-badge-svg')) return;
    badge.classList.add('speaker-badge');
    badge.insertAdjacentHTML('beforeend', `
      <svg class="speaker-badge-svg" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="speakerBadgeGradient" x1="18" y1="22" x2="98" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" style="stop-color: var(--p1);"></stop>
            <stop offset="100%" style="stop-color: var(--p2);"></stop>
          </linearGradient>
        </defs>
        <g class="speaker-body">
          <rect class="speaker-shell-fill" x="20" y="46" width="22" height="30" rx="10"></rect>
          <rect class="speaker-shell-glass" x="24" y="50" width="14" height="22" rx="7"></rect>
          <path class="speaker-horn" d="M42 51 L76 36 C82 33 88 37 88 43 V79 C88 85 82 89 76 86 L42 71 Z"></path>
          <path class="speaker-cap" d="M76 36 C82 33 88 37 88 43 V49 L74 53 L60 44 Z"></path>
          <rect class="speaker-handle" x="31" y="73" width="14" height="20" rx="7" transform="rotate(-22 38 83)"></rect>
          <path class="speaker-outline" d="M42 51 L76 36 C82 33 88 37 88 43 V79 C88 85 82 89 76 86 L42 71 Z"></path>
          <rect class="speaker-outline" x="20" y="46" width="22" height="30" rx="10"></rect>
          <rect class="speaker-outline" x="31" y="73" width="14" height="20" rx="7" transform="rotate(-22 38 83)"></rect>
        </g>
        <path class="speaker-wave wave-1" d="M91 48 C101 55 101 68 91 75"></path>
        <path class="speaker-wave wave-2" d="M97 41 C111 52 111 71 97 82"></path>
        <path class="speaker-wave wave-3" d="M104 34 C121 49 121 74 104 89"></path>
      </svg>
    `);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectBadge, { once:true });
  } else {
    injectBadge();
  }
})();
