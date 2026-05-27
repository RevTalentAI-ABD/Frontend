import { Calendar, Clock, User, CalendarOff, HelpCircle } from "lucide-react";

export default function CandidateInterviews({ applications }) {
  const interviewApps = applications.filter(a =>
    (a.status || "").toLowerCase() === "interview"
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <>
      <div className="cd-topbar">
        <div>
          <h1 className="cd-page-title">Interviews</h1>
          <p className="cd-page-sub">Your scheduled and upcoming interviews</p>
        </div>
      </div>

      <div className="cd-card">
        {interviewApps.length === 0 ? (
          <div className="cd-empty">
            <CalendarOff size={32} style={{ opacity: 0.4 }} />
            <p>No interviews scheduled yet.</p>
          </div>
        ) : (
          <div className="cd-app-list">
            {interviewApps.map(app => {
              const hasDate = !!app.interviewDate;
              const dateStr = formatDate(app.interviewDate);
              const timeStr = formatTime(app.interviewDate);

              return (
                <div key={app.id} className="cd-app-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
                  {/* Top row: job info + badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div className="cd-app-info" style={{ gap: 4 }}>
                      <div className="cd-app-title">{app.jobTitle || app.title}</div>
                      <div className="cd-app-dept">{app.department}</div>
                    </div>
                    <span className="cd-badge badge-blue">Interview</span>
                  </div>

                  {/* Schedule details card */}
                  {hasDate ? (
                    <div style={{
                      background: "rgba(59,130,246,0.07)",
                      border: "1px solid rgba(59,130,246,0.2)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Calendar size={18} color="#93c5fd" />
                        <div>
                          <div style={{ color: "#93c5fd", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</div>
                          <div style={{ color: "#e0e7ff", fontSize: 15, fontWeight: 600 }}>{dateStr}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Clock size={18} color="#93c5fd" />
                        <div>
                          <div style={{ color: "#93c5fd", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Time</div>
                          <div style={{ color: "#e0e7ff", fontSize: 15, fontWeight: 600 }}>{timeStr}</div>
                        </div>
                      </div>
                      {(app.interviewerName || app.interviewer) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <User size={18} color="#93c5fd" />
                          <div>
                            <div style={{ color: "#93c5fd", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Interviewer</div>
                            <div style={{ color: "#e0e7ff", fontSize: 15, fontWeight: 600 }}>{app.interviewerName || app.interviewer}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      background: "rgba(245,158,11,0.07)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      borderRadius: 10,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <HelpCircle size={16} color="#fde68a" />
                      <span style={{ color: "#fde68a", fontSize: 13 }}>
                        Interview date &amp; time will be confirmed by HR shortly.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}