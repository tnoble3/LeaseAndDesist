import leaseAndDesistLogo from "../assets/leaseanddesistlogo.png";

const NavBar = ({ user, activeView, onNavigate, onLogout, onOpenAIChallenge, onOpenAIFeedback }) => {
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.username ||
      "Explorer"
    : "Explorer";

  const links = [
    { id: "home", label: "Home" },
    { id: "goals", label: "Goals" },
    { id: "challenges", label: "Challenges" },
  ];

  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <img
          src={leaseAndDesistLogo}
          alt="Lease and Desist logo"
          className="nav-brand__logo"
        />
        <strong>Lease And Desist</strong>
      </div>
      <div className="nav-links">
        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            className={`nav-link ${activeView === link.id ? "active" : ""}`}
            onClick={() => onNavigate(link.id)}
          >
            {link.label}
          </button>
        ))}
      </div>
      <div className="nav-user">
        <div className="nav-ai-actions">
          <button type="button" className="ghost" onClick={onOpenAIChallenge}>
            Generate Challenge
          </button>
          <button type="button" className="ghost" onClick={onOpenAIFeedback}>
            Get AI Feedback
          </button>
        </div>
        <span>{displayName}</span>
        <button type="button" className="ghost" onClick={onLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
