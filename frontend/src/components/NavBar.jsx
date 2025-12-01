import leaseAndDesistLogo from "../assets/leaseanddesistlogo.png";

const NavBar = ({ user, activeView, onNavigate, onLogout }) => {
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.username ||
      "Explorer"
    : "Explorer";

  const squares = [
    { id: "home", label: "Home Square", active: 31 },
    { id: "community", label: "Community Square", active: 12 },
    { id: "events", label: "Event Square"},
  ];

  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <img
          src={leaseAndDesistLogo}
          alt="Lease and Desist logo"
          className="nav-brand__logo"
        />

      </div>
      <div className="nav-squares">
        {squares.map((square) => (
          <button
            key={square.id}
            type="button"
            className={`nav-square ${
              activeView === square.id ? "active" : ""
            }`}
            onClick={() => onNavigate(square.id)}
          >
            <strong>{square.label}</strong>
            <span className="status presence">{square.active} active</span>
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
