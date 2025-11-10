const NavBar = ({ user, activeView, onNavigate, onLogout }) => {
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
        <span className="dot" />
        <strong>Learning Launchpad</strong>
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
        <span>{displayName}</span>
        <button type="button" className="ghost" onClick={onLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
