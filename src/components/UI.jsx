import React, { useState, useEffect } from "react";

export function Logo() {
  return (
    <div className="hr-logo">
      <div className="hr-logo-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2"  y="2"  width="9" height="9" rx="2" fill="white" opacity="0.9"/>
          <rect x="13" y="2"  width="9" height="9" rx="2" fill="white" opacity="0.6"/>
          <rect x="2"  y="13" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
          <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <span className="hr-logo-text">Rev<span>Talent</span></span>
    </div>
  );
}

export function Avatar({ name = "", size = 36, color }) {
  const initials = name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  const colors = ["#7c5af0","#06b6d4","#f59e0b","#ef4444","#10b981","#f97316","#8b5cf6","#ec4899"];
  const bg = color || colors[name.charCodeAt(0) % colors.length] || "#7c5af0";
  return (
    <div className="hr-avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.33 }}>
      {initials}
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    Active: "b-green", "On Leave": "b-yellow", Inactive: "b-gray",
    Approved: "b-green", Pending: "b-amber", Rejected: "b-red",
    Processed: "b-green", Paid: "b-green", Generated: "b-blue",
    Hired: "b-green", Interview: "b-blue", Screening: "b-purple",
    Applied: "b-gray", Offer: "b-amber", Published: "b-green", Draft: "b-gray",
    OPEN: "b-green", CLOSED: "b-gray", FILLED: "b-blue",
    PRESENT: "b-green", ABSENT: "b-red", LATE: "b-amber",
  };
  return <span className={`hr-badge ${map[status] || "b-gray"}`}>{status}</span>;
}

export function StatCard({ icon, label, value, sub, color, delta }) {
  const [count, setCount] = useState(0);
  const raw = String(value ?? "").replace(/[^0-9.]/g, "");
  const num = parseFloat(raw);

  useEffect(() => {
    if (isNaN(num) || num === 0) return;
    let s = 0; const step = num / 40;
    const t = setInterval(() => {
      s += step;
      if (s >= num) { setCount(num); clearInterval(t); }
      else setCount(Math.floor(s));
    }, 18);
    return () => clearInterval(t);
  }, [num]);

  const display = value == null
    ? "—"
    : isNaN(num)
    ? value
    : (String(value).startsWith("₹") ? `₹${count.toLocaleString("en-IN")}` : count);

  return (
    <div className="hr-stat-card" style={{ "--acc": color }}>
      <div className="hr-stat-icon">{icon}</div>
      <div className="hr-stat-body">
        <div className="hr-stat-value">{display}</div>
        <div className="hr-stat-label">{label}</div>
        {sub && <div className="hr-stat-sub">{sub}</div>}
      </div>
      {delta !== undefined && (
        <div className={`hr-delta ${delta >= 0 ? "up" : "down"}`}>
          {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}%
        </div>
      )}
      <div className="hr-stat-glow" />
    </div>
  );
}

export function Spinner({ size = 40 }) {
  return (
    <div className="hr-spinner-wrap">
      <div className="hr-spinner" style={{ width: size, height: size }} />
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return <div className="hr-toast">{message}</div>;
}

export function EmptyState({ icon = "📭", text = "No data found" }) {
  return <div className="hr-empty-state">{icon} {text}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="hr-error-state">
      <div>⚠️ {message}</div>
      {onRetry && <button className="hr-outline-btn" onClick={onRetry}>Retry</button>}
    </div>
  );

<button disabled={p.status === "PROCESSED"}>
  {p.status === "PROCESSED" ? "Done" : "Process"}
</button>

}
