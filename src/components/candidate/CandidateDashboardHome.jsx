// const STAGES = ["Applied", "Screened", "Interview", "Offer"];

// const stageIndex = (status) => {
//   const s = (status || "").toLowerCase();
//   if (s === "applied")                            return 1;
//   if (s === "screening" || s === "under review")  return 2;
//   if (s === "interview")                          return 3;
//   if (s === "offered" || s === "hired")           return 4;
//   return 0;
// };

// const statusClass = (status) => {
//   const s = (status || "").toLowerCase().replace(/\s+/g, "-");
//   const map = {
//     interview: "badge-blue", "under-review": "badge-amber", screening: "badge-amber",
//     applied: "badge-gray", "not-selected": "badge-red", rejected: "badge-red",
//     withdrawn: "badge-red", offer: "badge-green", offered: "badge-green",
//     selected: "badge-green", hired: "badge-green",
//   };
//   return map[s] || "badge-gray";
// };

// const notifIcon = (type) => {
//   const t = (type || "").toLowerCase();
//   if (t.includes("interview") || t.includes("schedule")) return { icon: "calendar", cls: "ni-blue" };
//   if (t.includes("review")   || t.includes("view"))     return { icon: "eye",      cls: "ni-amber" };
//   if (t.includes("submit")   || t.includes("apply"))    return { icon: "check",    cls: "ni-green" };
//   if (t.includes("reject")   || t.includes("select"))   return { icon: "x",        cls: "ni-red" };
//   return { icon: "bell", cls: "ni-blue" };
// };

// export default function CandidateDashboardHome({
//   candidate, applications, interview, notifications, setActiveNav,
// }) {
//   const storedUser = (() => {
//     try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
//   })();

//   const firstName = candidate?.firstName
//     || candidate?.name?.split(" ")[0]
//     || storedUser?.name?.split(" ")[0]
//     || localStorage.getItem("name")?.split(" ")[0]
//     || "there";

//   const totalApplied  = applications.length;
//   const inProgress    = applications.filter(a =>
//     !["rejected", "withdrawn", "applied"].includes((a.status || "").toLowerCase())
//   ).length;
//   const upcomingCount = applications.filter(a =>
//     (a.status || "").toLowerCase() === "interview"
//   ).length;

// //   const activeApp = applications.find(a =>
// //     (a.status || "").toLowerCase() === "interview"
// //   ) || applications[0];

//   return (
//     <>
//       <div className="cd-topbar">
//         <div>
//           <h1 className="cd-page-title">Welcome back, {firstName}</h1>
//           <p className="cd-page-sub">Track your applications and interviews</p>
//         </div>
//         <button className="cd-btn-primary" onClick={() => setActiveNav("positions")}>
//           <i className="ti ti-search" aria-hidden="true" /> Browse Openings
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="cd-stats">
//         <div className="cd-stat">
//           <div className="cd-stat-label">Applied</div>
//           <div className="cd-stat-val">{totalApplied}</div>
//           <div className="cd-stat-sub">Across departments</div>
//         </div>
//         <div className="cd-stat">
//           <div className="cd-stat-label">In Progress</div>
//           <div className="cd-stat-val">{inProgress}</div>
//           <div className="cd-stat-sub">Active rounds</div>
//         </div>
//         <div className="cd-stat">
//           <div className="cd-stat-label">Interviews</div>
//           <div className="cd-stat-val">{upcomingCount}</div>
//           <div className="cd-stat-sub">Upcoming</div>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="cd-body">
//         {/* Applications card */}
//         <div className="cd-card">
//           <div className="cd-card-header">
//             <span className="cd-card-title">My Applications</span>
//             <button className="cd-view-all" onClick={() => setActiveNav("applications")}>
//               View all
//             </button>
//           </div>

//           {applications.length === 0 ? (
//             <div className="cd-empty">
//               <i className="ti ti-briefcase" aria-hidden="true" />
//               <p>No applications yet. Browse open positions to get started.</p>
//             </div>
//           ) : (
//             <div className="cd-app-list">
//               {applications.slice(0, 5).map(app => (
//                 <div key={app.id} className="cd-app-item">
//                   <div className="cd-app-info">
//                     <div className="cd-app-title">{app.jobTitle || app.title}</div>
//                     <div className="cd-app-dept">
//                       {app.department}{app.jobType ? ` · ${app.jobType}` : ""}
//                     </div>
//                     <div className="cd-app-date">
//                       Applied {app.appliedDate
//                         ? new Date(app.appliedDate).toLocaleDateString("en-IN", {
//                             day: "numeric", month: "short", year: "numeric",
//                           })
//                         : "—"}
//                     </div>
//                   </div>
//                   <span className={`cd-badge ${statusClass(app.status)}`}>{app.status}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Stage tracker for most active app */}
//           {/* Stage tracker for ALL applications */}
// {applications
//   .filter(app => stageIndex(app.status) > 0)
//   .map(app => (
//     <div key={app.id} className="cd-tracker">
//       <div className="cd-tracker-header">
//         <span>{app.jobTitle || app.title} — Stage</span>
//         <span className={`cd-badge ${statusClass(app.status)}`}>
//           {app.status}
//         </span>
//       </div>
//       <div className="cd-stages">
//         {STAGES.map((stage, i) => {
//           const current = stageIndex(app.status);
//           const done    = i < current - 1;
//           const active  = i === current - 1;
//           return (
//             <div key={stage} className="cd-stage-wrap">
//               <div className="cd-stage-step">
//                 <div className={`cd-stage-circle ${done ? "done" : active ? "active" : "inactive"}`}>
//                   {done ? <i className="ti ti-check" aria-hidden="true" /> : i + 1}
//                 </div>
//                 <div className="cd-stage-label">{stage}</div>
//               </div>
//               {i < STAGES.length - 1 && (
//                 <div className={`cd-stage-line${done ? " done" : ""}`} />
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   ))
// }
//         </div>

//         {/* Right column */}
//         <div className="cd-right">
//           {/* Upcoming interview */}
//           <div className="cd-card">
//             <div className="cd-card-header">
//               <span className="cd-card-title">Upcoming Interview</span>
//             </div>
//             {interview ? (
//               <div className="cd-interview-block">
//                 <div className="cd-interview-title">
//                   {interview.jobTitle || interview.title} — {interview.round || "Round 1"}
//                 </div>
//                 <div className="cd-interview-type">
//                   {interview.interviewType || "Technical Interview"}
//                 </div>
//                 <div className="cd-interview-meta">
//                   <span>
//                     <i className="ti ti-calendar" aria-hidden="true" />
//                     {interview.scheduledDate
//                       ? new Date(interview.scheduledDate).toLocaleDateString("en-IN", {
//                           day: "numeric", month: "short", year: "numeric",
//                         })
//                       : interview.date || "—"}
//                   </span>
//                   <span>
//                     <i className="ti ti-clock" aria-hidden="true" />
//                     {interview.scheduledTime || interview.time || "—"}
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="cd-empty-small">
//                 <i className="ti ti-calendar-off" aria-hidden="true" />
//                 <p>No upcoming interviews</p>
//               </div>
//             )}
//           </div>

//           {/* Notifications */}
//           <div className="cd-card">
//             <div className="cd-card-header">
//               <span className="cd-card-title">Notifications</span>
//               {notifications.filter(n => !n.read).length > 0 && (
//                 <span className="cd-badge badge-purple">
//                   {notifications.filter(n => !n.read).length} new
//                 </span>
//               )}
//             </div>
//             {notifications.length === 0 ? (
//               <div className="cd-empty-small">
//                 <i className="ti ti-bell-off" aria-hidden="true" />
//                 <p>No notifications</p>
//               </div>
//             ) : (
//               <div className="cd-notif-list">
//                 {notifications.map(n => {
//                   const { icon, cls } = notifIcon(n.type || n.message || "");
//                   return (
//                     <div key={n.id} className="cd-notif-item">
//                       <div className={`cd-notif-icon ${cls}`}>
//                         <i className={`ti ti-${icon}`} aria-hidden="true" />
//                       </div>
//                       <div>
//                         <div className="cd-notif-text">{n.message || n.text}</div>
//                         <div className="cd-notif-time">
//                           {n.createdAt
//                             ? new Date(n.createdAt).toLocaleString("en-IN", {
//                                 day: "numeric", month: "short",
//                                 hour: "2-digit", minute: "2-digit",
//                               })
//                             : n.time || ""}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


const STAGES = ["Applied", "Screened", "Interview", "Offer"];

const stageIndex = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "applied")                            return 1;
  if (s === "screening" || s === "under review")  return 2;
  if (s === "interview")                          return 3;
  if (s === "offered" || s === "hired")           return 4;
  return 0;
};

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

const notifIcon = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("interview") || t.includes("schedule")) return { icon: "calendar", cls: "ni-blue" };
  if (t.includes("review")   || t.includes("view"))     return { icon: "eye",      cls: "ni-amber" };
  if (t.includes("submit")   || t.includes("apply"))    return { icon: "check",    cls: "ni-green" };
  if (t.includes("reject")   || t.includes("select"))   return { icon: "x",        cls: "ni-red" };
  return { icon: "bell", cls: "ni-blue" };
};

export default function CandidateDashboardHome({
  candidate, applications, interview, notifications, setActiveNav,
}) {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  const firstName = candidate?.firstName
    || candidate?.name?.split(" ")[0]
    || storedUser?.name?.split(" ")[0]
    || localStorage.getItem("name")?.split(" ")[0]
    || "there";

  const totalApplied  = applications.length;
  const inProgress    = applications.filter(a =>
    !["rejected", "withdrawn", "applied"].includes((a.status || "").toLowerCase())
  ).length;
  const upcomingCount = applications.filter(a =>
    (a.status || "").toLowerCase() === "interview"
  ).length;

  return (
    <>
      <div className="cd-topbar">
        <div>
          <h1 className="cd-page-title">Welcome back, {firstName}</h1>
          <p className="cd-page-sub">Track your applications and interviews</p>
        </div>
        <button className="cd-btn-primary" onClick={() => setActiveNav("positions")}>
          <i className="ti ti-search" aria-hidden="true" /> Browse Openings
        </button>
      </div>

      {/* Stats */}
      <div className="cd-stats">
        <div className="cd-stat">
          <div className="cd-stat-label">Applied</div>
          <div className="cd-stat-val">{totalApplied}</div>
          <div className="cd-stat-sub">Across departments</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">In Progress</div>
          <div className="cd-stat-val">{inProgress}</div>
          <div className="cd-stat-sub">Active rounds</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">Interviews</div>
          <div className="cd-stat-val">{upcomingCount}</div>
          <div className="cd-stat-sub">Upcoming</div>
        </div>
      </div>

      {/* Body */}
      <div className="cd-body">
        {/* Applications card */}
        <div className="cd-card">
          <div className="cd-card-header">
            <span className="cd-card-title">My Applications</span>
            <button className="cd-view-all" onClick={() => setActiveNav("applications")}>
              View all
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="cd-empty">
              <i className="ti ti-briefcase" aria-hidden="true" />
              <p>No applications yet. Browse open positions to get started.</p>
            </div>
          ) : (
            <div className="cd-app-list">
              {applications.slice(0, 5).map((app, idx) => (
                <div
                  key={app.id}
                  style={{
                    borderBottom: idx < Math.min(applications.length, 5) - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                    paddingBottom: "0.85rem",
                    marginBottom: idx < Math.min(applications.length, 5) - 1 ? "0.85rem" : "0",
                  }}
                >
                  {/* Application row */}
                  <div className="cd-app-item">
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

                  {/* Stage tracker — inline directly below its own app row */}
                  {stageIndex(app.status) > 0 && (
                    <div
                      style={{
                        padding: "0.6rem 0 0.1rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        {STAGES.map((stage, i) => {
                          const current = stageIndex(app.status);
                          const done    = i < current - 1;
                          const active  = i === current - 1;
                          return (
                            <div
                              key={stage}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                flex: i < STAGES.length - 1 ? 1 : "unset",
                              }}
                            >
                              {/* Circle + label */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    flexShrink: 0,
                                    background: done || active
                                      ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                                      : "rgba(255,255,255,0.06)",
                                    border: done || active
                                      ? "2px solid #7c3aed"
                                      : "2px solid rgba(255,255,255,0.15)",
                                    color: done || active ? "#fff" : "rgba(255,255,255,0.35)",
                                    boxShadow: active
                                      ? "0 0 0 3px rgba(124,58,237,0.25)"
                                      : "none",
                                  }}
                                >
                                  {done
                                    ? <i className="ti ti-check" aria-hidden="true" style={{ fontSize: "13px" }} />
                                    : i + 1}
                                </div>
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: done || active
                                      ? "rgba(255,255,255,0.85)"
                                      : "rgba(255,255,255,0.3)",
                                    fontWeight: active ? 600 : 400,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {stage}
                                </div>
                              </div>

                              {/* Connector line */}
                              {i < STAGES.length - 1 && (
                                <div
                                  style={{
                                    flex: 1,
                                    height: "2px",
                                    marginBottom: "16px",
                                    background: done
                                      ? "linear-gradient(90deg, #7c3aed, #6d28d9)"
                                      : "rgba(255,255,255,0.1)",
                                    borderRadius: "2px",
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="cd-right">
          {/* Upcoming interview */}
          <div className="cd-card">
            <div className="cd-card-header">
              <span className="cd-card-title">Upcoming Interview</span>
            </div>
            {interview ? (
              <div className="cd-interview-block">
                <div className="cd-interview-title">
                  {interview.jobTitle || interview.title} — {interview.round || "Round 1"}
                </div>
                <div className="cd-interview-type">
                  {interview.interviewType || "Technical Interview"}
                </div>
                <div className="cd-interview-meta">
                  <span>
                    <i className="ti ti-calendar" aria-hidden="true" />
                    {interview.scheduledDate
                      ? new Date(interview.scheduledDate).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : interview.date || "—"}
                  </span>
                  <span>
                    <i className="ti ti-clock" aria-hidden="true" />
                    {interview.scheduledTime || interview.time || "—"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="cd-empty-small">
                <i className="ti ti-calendar-off" aria-hidden="true" />
                <p>No upcoming interviews</p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="cd-card">
            <div className="cd-card-header">
              <span className="cd-card-title">Notifications</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="cd-badge badge-purple">
                  {notifications.filter(n => !n.read).length} new
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="cd-empty-small">
                <i className="ti ti-bell-off" aria-hidden="true" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="cd-notif-list">
                {notifications.map(n => {
                  const { icon, cls } = notifIcon(n.type || n.message || "");
                  return (
                    <div key={n.id} className="cd-notif-item">
                      <div className={`cd-notif-icon ${cls}`}>
                        <i className={`ti ti-${icon}`} aria-hidden="true" />
                      </div>
                      <div>
                        <div className="cd-notif-text">{n.message || n.text}</div>
                        <div className="cd-notif-time">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleString("en-IN", {
                                day: "numeric", month: "short",
                                hour: "2-digit", minute: "2-digit",
                              })
                            : n.time || ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}