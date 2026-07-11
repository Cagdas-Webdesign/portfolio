export default function Funnel() {
  return (
    <section id="funnel">
      {"\n"}
      <div className="funnel-stage">
        {"\n"}
        <div aria-hidden="true" className="funnel-head funnel-head--hidden" />
        {"\n"}
        <div aria-hidden="true" className="v33-funnel-visual" id="v33FunnelVisual">
          {"\n"}
          <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 1000 760">
            {"\n"}
            <defs>
              {"\n"}
              <linearGradient id="v33EdgeL" x1="0" x2="1" y1="0" y2="1">
                {"\n"}
                <stop offset="0" stopColor="#eef9ff" stopOpacity=".86" />
                {"\n"}
                <stop offset=".48" stopColor="#7fd2ff" stopOpacity=".30" />
                {"\n"}
                <stop offset="1" stopColor="#ffffff" stopOpacity=".08" />
                {"\n"}
              </linearGradient>
              {"\n"}
              <linearGradient id="v33EdgeR" x1="1" x2="0" y1="0" y2="1">
                {"\n"}
                <stop offset="0" stopColor="#ffe2fc" stopOpacity=".78" />
                {"\n"}
                <stop offset=".48" stopColor="#d58cff" stopOpacity=".28" />
                {"\n"}
                <stop offset="1" stopColor="#ffffff" stopOpacity=".08" />
                {"\n"}
              </linearGradient>
              {"\n"}
              <linearGradient id="v33Inner" x1="0" x2="1" y1="0" y2="0">
                {"\n"}
                <stop offset="0" stopColor="#8ed7ff" stopOpacity=".14" />
                {"\n"}
                <stop offset=".48" stopColor="#ffffff" stopOpacity=".03" />
                {"\n"}
                <stop offset="1" stopColor="#ee8dff" stopOpacity=".12" />
                {"\n"}
              </linearGradient>
              {"\n"}
              <radialGradient cx="50%" cy="50%" id="v33Portal" r="60%">
                {"\n"}
                <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                {"\n"}
                <stop offset=".18" stopColor="#9ce9ff" stopOpacity=".92" />
                {"\n"}
                <stop offset=".45" stopColor="#79d6ff" stopOpacity=".58" />
                {"\n"}
                <stop offset=".72" stopColor="#e78bff" stopOpacity=".42" />
                {"\n"}
                <stop offset="1" stopColor="#000000" stopOpacity="0" />
                {"\n"}
              </radialGradient>
              {"\n"}
              <filter id="v33Blur40">
                <feGaussianBlur stdDeviation="20" />
              </filter>
              {"\n"}
              <filter id="v33Blur16">
                <feGaussianBlur stdDeviation="8" />
              </filter>
              {"\n"}
            </defs>
            {"\n"}
            <ellipse cx="500" cy="350" fill="#73b9ff" filter="url(#v33Blur40)" opacity=".06" rx="340" ry="270" />
            {"\n"}
            <ellipse cx="500" cy="576" fill="#d77bff" filter="url(#v33Blur40)" opacity=".10" rx="220" ry="92" />
            {"\n"}
            <ellipse cx="500" cy="136" fill="none" rx="336" ry="84" stroke="#f2fbff" strokeOpacity=".54" strokeWidth="5" />
            {"\n"}
            <ellipse cx="500" cy="136" fill="rgba(255,255,255,.018)" rx="314" ry="71" stroke="#8bd8ff" strokeOpacity=".34" strokeWidth="3" />
            {"\n"}
            <path d="M176 138 C 250 230 340 374 436 564" fill="none" stroke="url(#v33EdgeL)" strokeLinecap="round" strokeWidth="10" />
            {"\n"}
            <path d="M824 138 C 750 230 660 374 564 564" fill="none" stroke="url(#v33EdgeR)" strokeLinecap="round" strokeWidth="10" />
            {"\n"}
            <path d="M244 154 C 320 252 382 390 446 536" fill="none" stroke="#ffffff" strokeLinecap="round" strokeOpacity=".14" strokeWidth="3.2" />
            {"\n"}
            <path d="M756 154 C 680 252 618 390 554 536" fill="none" stroke="#ffe7fd" strokeLinecap="round" strokeOpacity=".12" strokeWidth="3.2" />
            {"\n"}
            <path d="M250 156 C 336 260 408 402 460 566" fill="none" opacity=".50" stroke="url(#v33Inner)" strokeLinecap="round" strokeWidth="46" />
            {"\n"}
            <path d="M750 156 C 664 260 592 402 540 566" fill="none" opacity=".50" stroke="url(#v33Inner)" strokeLinecap="round" strokeWidth="46" />
            {"\n"}
            <ellipse cx="500" cy="324" fill="none" rx="214" ry="45" stroke="#eaf7ff" strokeOpacity=".16" strokeWidth="2" />
            {"\n"}
            <ellipse cx="500" cy="424" fill="none" rx="132" ry="28" stroke="#eaf7ff" strokeOpacity=".12" strokeWidth="2" />
            {"\n"}
            <ellipse cx="500" cy="504" fill="none" rx="86" ry="18" stroke="#eaf7ff" strokeOpacity=".10" strokeWidth="2" />
            {"\n"}
            <g className="v33-funnel-portal-group">
              {"\n"}
              <ellipse className="v33-portal-glow" cx="500" cy="590" fill="url(#v33Portal)" filter="url(#v33Blur16)" opacity=".72" rx="160" ry="50" />
              {"\n"}
              <ellipse className="v33-portal-ring" cx="500" cy="582" fill="none" rx="125" ry="31" stroke="#95e8ff" strokeOpacity=".96" strokeWidth="8" />
              {"\n"}
              <ellipse className="v33-portal-ring2" cx="500" cy="582" fill="none" rx="109" ry="24" stroke="#eb8eff" strokeOpacity=".75" strokeWidth="5" />
              {"\n"}
              <path className="v33-portal-beam" d="M438 595 Q 500 690 562 595 L 536 724 Q 500 748 464 724 Z" fill="url(#v33Portal)" filter="url(#v33Blur40)" opacity=".24" />
              {"\n"}
            </g>
            {"\n"}
          </svg>
          {"\n"}
        </div>
        {"\n"}
        <canvas id="funnelCanvas" />
        {"\n"}
        <div aria-hidden="true" className="funnel-badge-layer" id="funnelBadgeLayer" />
        {"\n"}
        <div aria-hidden="true" className="funnel-output" id="funnelOutput" />
        {"\n"}
      </div>
      {"\n"}
    </section>
  );
}
