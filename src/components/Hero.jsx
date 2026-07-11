export default function Hero() {
  return (
    <section id="hero">
      {"\n"}
      <div className="hero-grid" id="hgrid" />
      {"\n"}
      <div aria-hidden="true" className="hero-tool-layer" id="heroToolLayer" />
      <div className="hero-orb ho1" id="ho1" />
      <div className="hero-orb ho2" id="ho2" />
      <div className="hero-orb ho3" id="ho3" />
      {"\n"}
      <div className="hero-code" id="hcode">
        {"const portfolio = {\n  owner: 'Çağdaş Uçar',\n  stack: ['WordPress','WooCommerce','PHP','REST API','GSAP'],\n  social: ['Meta','TikTok','LinkedIn','HubSpot'],\n  automation: ['Make','Zapier','n8n','Webhooks'],\n  output: 'premium digital system'\n}\n\nScrollTrigger.create({\n  trigger: '#funnel',\n  scrub: 1.4,\n  onUpdate: self => buildExperience(self.progress)\n})\n\nfunction buildExperience(progress){\n  return funnel.skills(progress)\n    .connect('code-output')\n    .launch('live-output')\n}"}
      </div>
      {"\n"}
      <div className="hero-badge" style={{"top": "20%", "left": "7%"}}>
        {"WordPress · WooCommerce"}
      </div>
      <div className="hero-badge" style={{"top": "27%", "right": "8%"}}>
        {"GSAP ScrollTrigger"}
      </div>
      <div className="hero-badge" style={{"top": "55%", "left": "4%"}}>
        {"REST API · Webhooks"}
      </div>
      <div className="hero-badge" style={{"top": "64%", "right": "6%"}}>
        {"AI · Content Engine"}
      </div>
      <div className="hero-badge" style={{"top": "78%", "left": "14%"}}>
        {"Performance Fokus"}
      </div>
      {"\n"}
      <div className="hero-center hero-user-animation-center">
        {"\n"}
        <div aria-label="Premium Websites, die wirken." className="hero-type" id="heroType">
          {"\n"}
          <div className="hero-type-line">
            {"\n"}
            <div className="hero-type-word">
              {"\n"}
              <span className="hero-type-char">
                {"P"}
              </span>
              <span className="hero-type-char">
                {"r"}
              </span>
              <span className="hero-type-char">
                {"e"}
              </span>
              <span className="hero-type-char">
                {"m"}
              </span>
              {"\n"}
              <span className="hero-type-char hero-i-wrapper hero-star-wrapper">
                {"\n"}
                <span className="hero-type-char hero-i-stem">
                  {"ı"}
                </span>
                {"\n"}
                <span className="hero-i-dot-positioner">
                  <span className="hero-premium-dot" aria-hidden="true" />
                </span>
                {"\n"}
              </span>
              {"\n"}
              <span className="hero-type-char">
                {"u"}
              </span>
              <span className="hero-type-char">
                {"m"}
              </span>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
          <div className="hero-type-line">
            {"\n"}
            <div className="hero-type-word">
              {"\n"}
              <span className="hero-type-char hero-w-morph-wrapper">
                {"\n"}
                <span className="hero-w-text">
                  {"W"}
                </span>
                {"\n\n"}
              </span>
              {"\n"}
              <span className="hero-type-char">
                {"e"}
              </span>
              <span className="hero-type-char">
                {"b"}
              </span>
              <span className="hero-type-char">
                {"s"}
              </span>
              <span className="hero-type-char">
                {"i"}
              </span>
              {"\n"}
              <span className="hero-type-char hero-t-flip-wrapper">
                {"\n"}
                <span className="hero-t-flip-inner">
                  {"\n"}
                  <span className="hero-t-front">
                    {"t"}
                  </span>
                  {"\n"}
                  <span className="hero-t-back">
                    {"\n"}
                    <span className="hero-lightning">
                      {"\n"}
                      <svg aria-hidden="true" viewBox="0 0 100 100">
                        {"\n"}
                        <polygon fill="#0ae448" points="65,0 15,55 55,55 45,100 95,45 55,45" />
                        {"\n"}
                      </svg>
                      {"\n"}
                    </span>
                    {"\n"}
                  </span>
                  {"\n"}
                </span>
                {"\n"}
              </span>
              {"\n"}
              <span className="hero-type-char">
                {"e"}
              </span>
              <span className="hero-type-char">
                {"s"}
              </span>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
          <div className="hero-type-line">
            {"\n"}
            <div className="hero-type-word">
              {"\n"}
              <span className="hero-type-char">
                {"d"}
              </span>
              {"\n"}
              <span className="hero-type-char hero-i-wrapper hero-eye-wrapper">
                {"\n"}
                <span className="hero-type-char hero-i-stem">
                  {"ı"}
                </span>
                {"\n"}
                <span className="hero-i-dot-positioner">
                  {"\n"}
                  <span className="hero-icon-char hero-eye">
                    {"\n"}
                    <svg aria-hidden="true" viewBox="0 0 100 100">
                      {"\n"}
                      <ellipse className="hero-eye-bg" cx="50" cy="50" fill="white" rx="45" ry="30" />
                      {"\n"}
                      <circle className="hero-eye-pupil" cx="50" cy="50" fill="#111" r="16" />
                      {"\n"}
                      <circle className="hero-eye-glint" cx="55" cy="45" fill="white" r="4" />
                      {"\n"}
                    </svg>
                    {"\n"}
                  </span>
                  {"\n"}
                </span>
                {"\n"}
              </span>
              {"\n"}
              <span className="hero-type-char">
                {"e"}
              </span>
              {"\n"}
            </div>
            {"\n"}
            <div className="hero-type-word hero-flower-trigger">
              {"\n"}
              <span className="hero-type-char">
                {"W"}
              </span>
              {"\n"}
              <span className="hero-type-char hero-i-wrapper hero-flower-wrapper">
                {"\n"}
                <span className="hero-type-char hero-i-stem">
                  {"ı"}
                </span>
                {"\n"}
                <span className="hero-i-dot-positioner">
                  {"\n"}
                  <span className="hero-icon-char hero-flower">
                    {"\n"}
                    <svg aria-hidden="true" viewBox="0 0 100 100">
                      {"\n"}
                      <g className="hero-flower-outer" fill="#f9cd2e">
                        {"\n"}
                        <path d="M50 5 C60 5 70 30 50 50 C30 30 40 5 50 5 Z" />
                        {"\n"}
                        <path d="M50 95 C60 95 70 70 50 50 C30 70 40 95 50 95 Z" />
                        {"\n"}
                        <path d="M5 50 C5 40 30 30 50 50 C30 70 5 60 5 50 Z" />
                        {"\n"}
                        <path d="M95 50 C95 40 70 30 50 50 C70 70 95 60 95 50 Z" />
                        {"\n"}
                        <path d="M18 18 C28 10 45 35 50 50 C35 45 10 28 18 18 Z" />
                        {"\n"}
                        <path d="M82 82 C72 90 55 65 50 50 C65 55 90 72 82 82 Z" />
                        {"\n"}
                        <path d="M82 18 C90 28 65 45 50 50 C55 35 72 10 82 18 Z" />
                        {"\n"}
                        <path d="M18 82 C10 72 35 55 50 50 C45 65 28 90 18 82 Z" />
                        {"\n"}
                      </g>
                      {"\n"}
                      <g className="hero-flower-inner" fill="#FF8C00">
                        {"\n"}
                        <path d="M50 20 C55 20 62 35 50 50 C38 35 45 20 50 20 Z" />
                        {"\n"}
                        <path d="M50 80 C55 80 62 65 50 50 C38 65 45 80 50 80 Z" />
                        {"\n"}
                        <path d="M20 50 C20 45 35 38 50 50 C35 62 20 55 20 50 Z" />
                        {"\n"}
                        <path d="M80 50 C80 45 65 38 50 50 C65 62 80 55 80 50 Z" />
                        {"\n"}
                      </g>
                      {"\n"}
                      <circle className="hero-flower-center" cx="50" cy="50" fill="#FF4B4B" r="9" />
                      {"\n"}
                    </svg>
                    {"\n"}
                  </span>
                  {"\n"}
                </span>
                {"\n"}
              </span>
              {"\n"}
              <span className="hero-type-char">
                {"r"}
              </span>
              <span className="hero-type-char">
                {"k"}
              </span>
              <span className="hero-type-char">
                {"e"}
              </span>
              <span className="hero-type-char">
                {"n"}
              </span>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
        </div>
        {"\n"}
        <div className="hero-actions" id="heroActions">
          {"\n"}
          <button className="btn primary cosmic-btn" onClick={() => { document.querySelector('#funnel').scrollIntoView({behavior:'smooth'}) }}>
            {"\n"}
            <span aria-hidden="true" className="btn-stars" />
            {"\n"}
            <span aria-hidden="true" className="btn-icon">
              {"🚀"}
            </span>
            {"\n"}
            <span className="btn-text">
              {"Experience starten"}
            </span>
            {"\n"}
            <span aria-hidden="true" className="btn-comet" />
            {"\n"}
          </button>
          {"\n"}
          <button className="btn secondary system-btn" onClick={() => { document.querySelector('#social-lottie').scrollIntoView({behavior:'smooth'}) }}>
            {"\n"}
            <span aria-hidden="true" className="btn-icon">
              {"✦"}
            </span>
            {"\n"}
            <span className="btn-text">
              {"System ansehen"}
            </span>
            {"\n"}
          </button>
          {"\n"}
        </div>
        {"\n"}
      </div>
      {"\n"}
      <div className="scrollhint" id="scrollhint">
        {"Scroll"}
        <i />
      </div>
      {"\n"}
    </section>
  );
}
