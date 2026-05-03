import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { leaveAPI } from "./api";
import { useFetch, useToast } from "./hooks";
import { Avatar, Badge, Spinner, ErrorState, Toast, EmptyState } from "./UI";

export default function PageLeaves() {
  const { data: pendingData, loading: lp, error: ep, refetch: rp } = useFetch(leaveAPI.getPending);
  const { data: allData,     loading: la, error: ea, refetch: ra } = useFetch(leaveAPI.getAll);
  const { toast, showToast } = useToast();
  const [acting, setActing] = useState(null);

  const pendingLeaves = Array.isArray(pendingData) ? pendingData : (pendingData?.leaves || pendingData?.content || []);
  const allLeaves     = Array.isArray(allData)     ? allData     : (allData?.leaves     || allData?.content     || []);

  const doneLeaves = allLeaves.filter(l =>
    (l.status || l.leaveStatus) !== "Pending" && (l.status || l.leaveStatus) !== "PENDING"
  );

  const handle = async (id, action) => {
    setActing(id);
    try {
      action === "approve" ? await leaveAPI.approve(id) : await leaveAPI.reject(id);
      await rp(); await ra();
      showToast(action === "approve" ? "✅ Leave approved!" : "❌ Leave rejected.");
    } catch (err) {
      showToast("❌ " + (err.response?.data?.message || "Action failed"));
    } finally { setActing(null); }
  };

  const loading = lp || la;
  if (loading) return <Spinner />;
  if (ep && ea) return <ErrorState message={ep} onRetry={() => { rp(); ra(); }} />;

  // Build dept summary from all leaves
  const deptMap = {};
  allLeaves.forEach(l => {
    const dept = l.department || l.dept || l.employee?.department || "Other";
    const short = dept.slice(0, 7);
    deptMap[short] = (deptMap[short] || 0) + 1;
  });
  const deptChart = Object.entries(deptMap).map(([dept, leaves]) => ({ dept, leaves }));

  return (
    <div className="hr-page">
      <Toast message={toast} />
      <div className="hr-page-header-row">
        <h2 className="hr-page-heading">Leave Management</h2>
        <span className="hr-count-chip">{pendingLeaves.length} pending</span>
      </div>

      {pendingLeaves.length === 0 && (
        <EmptyState icon="🎉" text="No pending leave requests!" />
      )}

      {pendingLeaves.map(l => {
        const id     = l.id || l.leaveId;
        const name   = l.employeeName || `${l.employee?.firstName || ""} ${l.employee?.lastName || ""}`.trim() || "Employee";
        const dept   = l.department || l.dept || l.employee?.department || "—";
        const type   = l.leaveType || l.type || "Leave";
        const from   = l.startDate || l.fromDate || l.from;
        const to     = l.endDate   || l.toDate   || l.to;
        const days   = l.numberOfDays || l.days || 1;
        const reason = l.reason || l.description || "";
        return (
          <div key={id} className="hr-leave-card">
            <div className="hr-lc-left">
              <Avatar name={name} size={46} />
              <div>
                <div className="hr-lc-name">{name}</div>
                <div className="hr-lc-meta">
                  <span className="hr-lc-dept">{dept}</span>
                  <span className="hr-lc-type">{type} Leave</span>
                  <span className="hr-lc-dates">
                    {from ? new Date(from).toLocaleDateString("en-IN", { day:"numeric", month:"short" }) : "—"}
                    {" – "}
                    {to   ? new Date(to).toLocaleDateString("en-IN",   { day:"numeric", month:"short" }) : "—"}
                    {" "}({days} day{days > 1 ? "s" : ""})
                  </span>
                </div>
                {reason && <div className="hr-lc-reason">"{reason}"</div>}
              </div>
            </div>
            <div className="hr-lc-actions">
              <button className="hr-approve-btn" disabled={acting === id} onClick={() => handle(id, "approve")}>
                {acting === id ? "…" : "✓ Approve"}
              </button>
              <button className="hr-reject-btn" disabled={acting === id} onClick={() => handle(id, "reject")}>
                {acting === id ? "…" : "✕ Reject"}
              </button>
            </div>
          </div>
        );
      })}

      {/* Processed leaves */}
      {doneLeaves.length > 0 && (
        <div className="hr-panel">
          <h3 className="hr-panel-title">Processed Leaves</h3>
          {doneLeaves.slice(0, 10).map(l => {
            const id   = l.id || l.leaveId;
            const name = l.employeeName || `${l.employee?.firstName || ""} ${l.employee?.lastName || ""}`.trim() || "Employee";
            const type = l.leaveType || l.type || "Leave";
            const from = l.startDate || l.fromDate;
            const to   = l.endDate   || l.toDate;
            const status = l.status || l.leaveStatus;
            return (
              <div key={id} className="hr-done-row">
                <Avatar name={name} size={36} />
                <div className="hr-done-info">
                  <span className="hr-done-name">{name} — {type}</span>
                  <span className="hr-done-detail">
                    {from ? new Date(from).toLocaleDateString("en-IN") : ""} to {to ? new Date(to).toLocaleDateString("en-IN") : ""}
                  </span>
                </div>
                <Badge status={status} />
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {deptChart.length > 0 && (
        <div className="hr-panel">
          <h3 className="hr-panel-title">Leave Summary by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptChart} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="dept" tick={{ fill: "#9b96b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9b96b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e1340", border: "none", borderRadius: 10, color: "#fff" }} />
              <Bar dataKey="leaves" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Leaves" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
