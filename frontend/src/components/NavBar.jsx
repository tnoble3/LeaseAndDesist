import { useEffect, useMemo, useRef, useState } from "react";
import leaseAndDesistLogo from "../assets/leaseanddesistlogo.png";
import { updateProfile } from "../api/goalService.js";

const NavBar = ({ user, activeView, onNavigate, onLogout, onProfileUpdate }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    avatarUrl:
      user?.avatarUrl || user?.avatar || user?.photo || user?.image || "",
  });
  const profileRef = useRef(null);

  const displayName = useMemo(() => {
    if (!user) return "Explorer";
    return (
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.username ||
      "Explorer"
    );
  }, [user]);

  const username = user?.username || "explorer";
  const avatarUrl =
    profileForm.avatarUrl ||
    user?.avatarUrl ||
    user?.photo ||
    user?.image ||
    user?.profileImage ||
    "";

  const initials = useMemo(() => {
    const source = displayName || username;
    const chars = source
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
    return chars || "U";
  }, [displayName, username]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    setProfileForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      avatarUrl:
        user?.avatarUrl || user?.avatar || user?.photo || user?.image || "",
    });
  }, [user]);

  const handleChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        username: profileForm.username,
        avatarUrl: profileForm.avatarUrl,
      };
      const { user: updated } = await updateProfile(payload);
      window.localStorage.setItem("demo_user", JSON.stringify(updated));
      onProfileUpdate?.(updated);
      setProfileOpen(false);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to update profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const squares = [
    { id: "home", label: "Dashboard" },
    { id: "community", label: "Town Square", active: 12 },
    { id: "events", label: "Event Square", active: 12 },
    { id: "public-square", label: "Public Square", active: 6 },
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
      <div className="nav-user" ref={profileRef}>
        <button
          type="button"
          className={`nav-profile ${profileOpen ? "open" : ""}`}
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={profileOpen}
        >
          <div className="nav-profile__avatar" aria-hidden="true">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="nav-profile__meta">
            <span className="nav-profile__name">{displayName}</span>
            <span className="nav-profile__handle">@{username}</span>
          </div>
        </button>

        {profileOpen && (
          <div className="nav-profile__dropdown" role="menu">
            <div className="nav-profile__fields">
              <label>
                Full name
                <div className="nav-profile__grid">
                  <input
                    type="text"
                    placeholder="First name"
                    value={profileForm.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={profileForm.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                </div>
              </label>
              <label>
                Username
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
              </label>
              <label>
                Profile image URL
                <input
                  type="url"
                  placeholder="https://example.com/me.jpg"
                  value={profileForm.avatarUrl}
                  onChange={(e) => handleChange("avatarUrl", e.target.value)}
                />
              </label>
            </div>

            {error && <p className="error compact">{error}</p>}

            <div className="nav-profile__actions">
              <button
                type="button"
                className="ghost"
                onClick={() => setProfileOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="ghost danger"
                onClick={onLogout}
                role="menuitem"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
