export default function Nav() {
  return (
    <nav>
      {"\n"}
      <div className="logo">
        {"ÇU."}
      </div>
      {"\n"}
      <div className="navlinks">
        {"\n"}
        <a href="#funnel">
          {"Funnel"}
        </a>
        <a href="#experience">
          {"Experience"}
        </a>
        <a href="#cert">
          {"Social"}
        </a>
        <a href="#automation">
          {"Automation"}
        </a>
        {"\n"}
        <button className="nav-cta" onClick={() => { document.querySelector('#contact').scrollIntoView({behavior:'smooth'}) }}>
          {"Kontakt →"}
        </button>
        {"\n"}
      </div>
      {"\n"}
    </nav>
  );
}
