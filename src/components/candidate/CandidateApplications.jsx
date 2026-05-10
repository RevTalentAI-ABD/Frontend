const statusClass = (status) => {
  const s = (status || "").toLowerCase().replace(/\s+/g, "-");
  const map = {
    interview: "badge-blue", "under-review": "badge-amber", screening: "badge-amber",
    applied: "badge-gray", "not-selected": "badge-red", rejected: "badge-red",
    withdrawn: "badge-red", offer: "badge-green", offered: "badge-green",
    selected: "badge-green", hired: "badge-green",
  };
  return map[s] || "badge-gray";
};

export default function CandidateApplications({ applications, setActiveNav }) {
  return (
    <>
      <div className="cd-topbar">
        <div>
          <h1 className="cd-page-title">My Applications</h1>
          <p className="cd-page-sub">All jobs you've applied for</p>
        </div>
        <button className="cd-btn-primary" onClick={() => setActiveNav("positions")}>
          <i className="ti ti-search" aria-hidden="true" /> Browse Openings
        </button>
      </div>

      <div className="cd-card">
        {applications.length === 0 ? (
          <div className="cd-empty">
            <i className="ti ti-briefcase" aria-hidden="true" />
            <p>No applications yet. Browse open positions to get started.</p>
          </div>
        ) : (
          <div className="cd-app-list">
            {applications.map(app => (
              <div key={app.id} className="cd-app-item">
                <div className="cd-app-info">
                  <div className="cd-app-title">{app.jobTitle || app.title}</div>
                  <div className="cd-app-dept">
                    {app.department}{app.jobType ? ` · ${app.jobType}` : ""}
                  </div>
                  <div className="cd-app-date">
                    Applied {app.appliedDate
                      ? new Date(app.appliedDate).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : "—"}
                  </div>
                </div>
                <span className={`cd-badge ${statusClass(app.status)}`}>{app.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}