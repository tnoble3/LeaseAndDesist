import leaseAndDesistLogo from "../assets/leaseanddesistlogo.png";

const NavBar = ({ user, activeView, onNavigate, onLogout }) => {
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.username ||
      "Explorer"
    : "Explorer";

  const squares = [
    { id: "home", label: "Dashboard" },
    { id: "community", label: "Town Square", active: 12 },
    { id: "events", label: "Event Square", active: 12},
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
            {typeof square.active !== "undefined" && (
              <span className="status presence">{square.active} active</span>
            )}
          </button>
        ))}
      </div>
      <div className="nav-user">
        <span>{displayName}</span>
        <button type="button" className="ghost" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
