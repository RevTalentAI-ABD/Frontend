const NAV_ITEMS = [
  { id: "dashboard",    icon: "layout-dashboard", label: "Dashboard" },
  { id: "applications", icon: "briefcase",         label: "My Applications" },
  { id: "positions",    icon: "search",            label: "Open Positions" },
  { id: "interviews",   icon: "calendar",          label: "Interviews" },
  { id: "profile",      icon: "user",              label: "My Profile" },
];

export default function CandidateSidebar({ activeNav, setActiveNav, candidate, onLogout }) {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  const displayName = candidate?.firstName
    ? `${candidate.firstName} ${candidate.lastName || ""}`
    : candidate?.name || storedUser?.name || "Candidate";

  const initials = displayName
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside className="cd-sidebar">
      <div className="cd-logo">
        <div className="cd-logo-icon">
          <svg width="17" height="17" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="2" />
            <path d="M7 11l3 3 5-5" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="cd-logo-text">RevTalent</span>
      </div>

      <nav className="cd-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`cd-nav-item${activeNav === item.id ? " active" : ""}`}
            onClick={() => setActiveNav(item.id)}
          >
            <i className={`ti ti-${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="cd-sidebar-bottom">
        <div className="cd-avatar-row">
          <div className="cd-avatar">{initials}</div>
          <div className="cd-avatar-info">
            <span className="cd-avatar-name">{displayName}</span>
            <span className="cd-avatar-role">Candidate</span>
          </div>
        </div>
        <button className="cd-logout-btn" onClick={onLogout} title="Logout">
          <i className="ti ti-logout" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
