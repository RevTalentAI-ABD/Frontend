export default function CandidateProfile({ candidate, applications }) {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  const displayName = candidate?.firstName
    ? `${candidate.firstName} ${candidate.lastName || ""}`.trim()
    : candidate?.name || storedUser?.name || "—";

  const displayEmail   = candidate?.email    || storedUser?.email    || "—";
  const displayPhone   = candidate?.phone    || storedUser?.phone    || "—";
  const totalApplied   = applications.length;
  const totalInterviews = applications.filter(a =>
    (a.status || "").toLowerCase() === "interview"
  ).length;
  const totalOffers = applications.filter(a =>
    ["offered", "hired", "selected"].includes((a.status || "").toLowerCase())
  ).length;

  const initials = displayName
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const fields = [
    { label: "Full Name",    value: displayName },
    { label: "Email",        value: displayEmail },
    { label: "Phone",        value: displayPhone },
    { label: "Role",         value: "Candidate" },
  ];

  const stats = [
    { label: "Applications", value: totalApplied },
    { label: "Interviews",   value: totalInterviews },
    { label: "Offers",       value: totalOffers },
  ];

  return (
    <>
      <div className="cd-topbar">
        <div>
          <h1 className="cd-page-title">My Profile</h1>
          <p className="cd-page-sub">Your candidate information</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>
        {/* Profile card */}
        <div className="cd-card">
          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(124,58,237,0.25)", border: "2px solid rgba(124,58,237,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: "700", color: "#a78bfa", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#f0eeff" }}>
                {displayName}
              </div>
              <div style={{ fontSize: "12px", color: "#6b6880", marginTop: "3px" }}>Candidate</div>
            </div>
          </div>

          {/* Fields */}
          {fields.map(({ label, value }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ fontSize: "12.5px", color: "#6b6880" }}>{label}</span>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#e8e5f4" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Activity stats card */}
        <div className="cd-card">
          <div className="cd-card-header" style={{ marginBottom: "20px" }}>
            <span className="cd-card-title">Activity Summary</span>
          </div>
          {stats.map(({ label, value }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ fontSize: "13px", color: "#9490a8" }}>{label}</span>
              <span style={{
                fontSize: "20px", fontWeight: "700", color: "#a78bfa",
              }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}