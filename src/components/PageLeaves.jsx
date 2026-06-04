import React, { useState } from "react";
import {
  Check,
  X,
  PartyPopper,
  Loader2,
  XCircle,
  CheckCircle2,
  Users,
  Clock
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { leaveAPI } from "./api";
import { useFetch, useToast } from "./hooks";
import { Avatar, Badge, Spinner, ErrorState, Toast, EmptyState } from "./UI";

// Returns true if the leave record belongs to a MANAGER (not a plain EMPLOYEE)
function isManagerLeave(l) {
  const role = (
    l.role ||
    l.employeeRole ||
    l.employee?.role ||
    l.user?.role ||
    l.employee?.user?.role ||
    ""
  ).toUpperCase();
  if (role === "EMPLOYEE") return false;
  if (role === "MANAGER")  return true;
  return role !== "" && role !== "EMPLOYEE";
}

export default function PageLeaves() {
  const { data: pendingData, loading: lp, error: ep, refetch: rp } = useFetch(leaveAPI.getPending);
  const { data: allData,     loading: la, error: ea, refetch: ra } = useFetch(leaveAPI.getAll);
  const { toast, showToast } = useToast();
  const [acting, setActing] = useState(null);

  const rawPending = Array.isArray(pendingData) ? pendingData : (pendingData?.leaves || pendingData?.content || []);
  const rawAll     = Array.isArray(allData)     ? allData     : (allData?.leaves     || allData?.content     || []);

  const pendingLeaves = rawPending.filter(isManagerLeave);
  const allLeaves     = rawAll.filter(isManagerLeave);
  
  const PENDING_STATUSES = ["PENDING", "Pending", "APPLIED", "Applied"];
  const pending = allLeaves.filter(r => !r.status || PENDING_STATUSES.includes(r.status));
  const approved = allLeaves.filter(r => (r.status || r.leaveStatus || "").toUpperCase() === "APPROVED");
  const rejected = allLeaves.filter(r => (r.status || r.leaveStatus || "").toUpperCase() === "REJECTED");

  // Calculate currently active leaves
  const today = new Date();
  today.setHours(0,0,0,0);
  const activeLeaves = approved.filter(r => {
    const start = r.startDate || r.fromDate || r.from;
    const end = r.endDate || r.toDate || r.to;
    if (!start || !end) return false;
    const s = new Date(start); s.setHours(0,0,0,0);
    const e = new Date(end); e.setHours(23,59,59,999);
    return today >= s && today <= e;
  });

  const doneLeaves = allLeaves.filter(l =>
    (l.status || l.leaveStatus) !== "Pending" && (l.status || l.leaveStatus) !== "PENDING"
  );

  // Chart data
  let sick = 0, casual = 0, annual = 0, other = 0;
  allLeaves.forEach(r => {
    const t = (r.leaveType || r.type || "").toUpperCase();
    if (t.includes("SICK")) sick++;
    else if (t.includes("CASUAL")) casual++;
    else if (t.includes("ANNUAL")) annual++;
    else other++;
  });
  const totalLeaves = allLeaves.length;
  const PIE_DATA = [
    { name: "Sick leave", value: sick, color: "#ef4444" },
    { name: "Casual leave", value: casual, color: "#f59e0b" },
    { name: "Annual leave", value: annual, color: "#7c5af0" },
    { name: "Other", value: other, color: "#10b981" },
  ];

  const handle = async (id, action) => {
    setActing(id);
    try {
      action === "approve" ? await leaveAPI.approve(id) : await leaveAPI.reject(id);
      await rp(); await ra();
      showToast(
        <span style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          {action === "approve" ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}
          {action === "approve" ? "Leave approved!" : "Leave rejected."}
        </span>
      );
    } catch (err) {
      showToast(
        <span style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <XCircle size={18}/>
          {err.response?.data?.message || "Action failed"}
        </span>
      );
    } finally { setActing(null); }
  };

  const loading = lp || la;
  if (loading) return <Spinner />;
  if (ep && ea) return <ErrorState message={ep} onRetry={() => { rp(); ra(); }} />;

  return (
    <div className="hr-page">
      <Toast message={toast} />
      <div className="hr-page-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 className="hr-page-heading" style={{ margin: 0 }}>Leave Management</h2>
      </div>

      <div className="lm-metric-grid">
        <div className="lm-metric-card">
          <div className="lm-mc-header">
            <Clock size={14} /> PENDING
          </div>
          <div className="lm-mc-value">{pendingLeaves.length}</div>
          <div className="lm-mc-sub">{pendingLeaves.length === 0 ? "No requests awaiting" : "Action required"}</div>
        </div>
        <div className="lm-metric-card">
          <div className="lm-mc-header">
            <Check size={14} /> APPROVED
          </div>
          <div className="lm-mc-value">{approved.length}</div>
          <div className="lm-pill lm-pill-green">↑ This week</div>
        </div>
        <div className="lm-metric-card">
          <div className="lm-mc-header">
            <Users size={14} /> ON LEAVE
          </div>
          <div className="lm-mc-value">{activeLeaves.length}</div>
          <div className="lm-pill lm-pill-yellow">Active now</div>
        </div>
        <div className="lm-metric-card">
          <div className="lm-mc-header">
            <X size={14} /> REJECTED
          </div>
          <div className="lm-mc-value">{rejected.length}</div>
          <div className="lm-mc-sub">All clear</div>
        </div>
      </div>

      {pendingLeaves.length === 0 && doneLeaves.length === 0 && (
        <EmptyState icon={<PartyPopper size={0}/>} text="No manager leave records!" />
      )}

      {pendingLeaves.length > 0 && (
        <div className="lm-panel">
          <div className="lm-panel-header">
            <h3 className="lm-panel-title">Pending Requests</h3>
            <div className="lm-pill lm-pill-yellow">{pendingLeaves.length} records</div>
          </div>
          <div className="lm-processed-list">
            {pendingLeaves.map(l => {
              const id     = l.id || l.leaveId;
              const name   = l.employeeName || `${l.employee?.firstName || ""} ${l.employee?.lastName || ""}`.trim() || "Manager";
              const type   = l.leaveType || l.type || "Leave";
              const from   = l.startDate || l.fromDate || l.from;
              const to     = l.endDate   || l.toDate   || l.to;
              const t = type.toUpperCase();
              let badgeClass = "lm-type-other";
              if (t.includes("SICK")) badgeClass = "lm-type-sick";
              if (t.includes("CASUAL")) badgeClass = "lm-type-casual";
              if (t.includes("ANNUAL")) badgeClass = "lm-type-annual";

              return (
                <div key={id} className="lm-processed-card">
                  <div className="lm-pc-left">
                    <Avatar name={name} size={44} />
                    <div>
                      <div className="lm-pc-name">{name}</div>
                      <div className="lm-pc-dates">{from ? new Date(from).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : ""} → {to ? new Date(to).toLocaleDateString('en-GB', {day:'numeric', month:'short', year: 'numeric'}) : ""}</div>
                    </div>
                  </div>
                  <div className="lm-pc-right">
                    <div className={`lm-type-badge ${badgeClass}`}>{type}</div>
                    <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                      <button onClick={() => handle(id, "approve")} disabled={acting === id} style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        {acting === id ? <Loader2 size={14} className="spin"/> : <Check size={14}/>} Approve
                      </button>
                      <button onClick={() => handle(id, "reject")} disabled={acting === id} style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        {acting === id ? <Loader2 size={14} className="spin"/> : <X size={14}/>} Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {doneLeaves.length > 0 && (
        <div className="lm-panel">
          <div className="lm-panel-header">
            <h3 className="lm-panel-title">Processed Leaves</h3>
            <div className="lm-pill lm-pill-purple">{doneLeaves.length} records</div>
          </div>
          <div className="lm-processed-list">
            {doneLeaves.slice(0, 10).map(l => {
              const id     = l.id || l.leaveId;
              const name   = l.employeeName || `${l.employee?.firstName || ""} ${l.employee?.lastName || ""}`.trim() || "Manager";
              const type   = l.leaveType || l.type || "Leave";
              const from   = l.startDate || l.fromDate || l.from;
              const to     = l.endDate   || l.toDate   || l.to;
              const status = l.status || l.leaveStatus;
              
              const t = type.toUpperCase();
              let badgeClass = "lm-type-other";
              if (t.includes("SICK")) badgeClass = "lm-type-sick";
              if (t.includes("CASUAL")) badgeClass = "lm-type-casual";
              if (t.includes("ANNUAL")) badgeClass = "lm-type-annual";

              return (
                <div key={id} className="lm-processed-card">
                  <div className="lm-pc-left">
                    <Avatar name={name} size={44} />
                    <div>
                      <div className="lm-pc-name">{name}</div>
                      <div className="lm-pc-dates">{from ? new Date(from).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : ""} → {to ? new Date(to).toLocaleDateString('en-GB', {day:'numeric', month:'short', year: 'numeric'}) : ""}</div>
                    </div>
                  </div>
                  <div className="lm-pc-right">
                    <div className={`lm-type-badge ${badgeClass}`}>{type}</div>
                    <Badge status={status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="lm-panel">
        <div className="lm-panel-header">
          <h3 className="lm-panel-title">Leave by type</h3>
          <div className="lm-pill lm-pill-purple">{new Date().toLocaleDateString('en-GB', {month: 'long', year: 'numeric'})}</div>
        </div>
        <div className="lm-chart-container">
          <div style={{ position: "relative", width: 220, height: 220 }}>
            {totalLeaves > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" stroke="none">
                      {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e1340", border: "none", borderRadius: 10, color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#fff", lineHeight: 1 }}>{totalLeaves}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>total</div>
                </div>
              </>
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>No data</div>
            )}
          </div>
          
          <div className="lm-legend-list">
            {PIE_DATA.map(d => {
              const pct = totalLeaves > 0 ? Math.round((d.value / totalLeaves) * 100) : 0;
              return (
                <div key={d.name} className="lm-legend-item">
                  <div className="lm-legend-item-left">
                    <div className="lm-dot" style={{ background: d.color }}></div>
                    {d.name}
                  </div>
                  <div>
                    <span className="lm-legend-count">{d.value}</span>
                    <span className="lm-legend-pct">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
