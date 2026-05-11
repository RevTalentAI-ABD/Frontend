import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from "recharts";
import { useFetch } from "./hooks";
import { leaveAPI, employeeAPI, notificationAPI, recruitmentAPI } from "./api";
import { Spinner, ErrorState } from "./UI";
import { useAuth } from "./AuthContext";
import {
   Users,
   ClipboardList,
   Bell,
   Building2,
   UserPlus,
   Wallet,
   Briefcase,
   FileText,
   User,
   Sparkles
 } from "lucide-react";

const DEPT_COLORS = [
  "#7c5af0","#f59e0b","#f97316","#10b981",
  "#06b6d4","#ec4899","#a855f7","#64748b"
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
};

export default function PageOverview({ setActive }) {

  const { user } = useAuth();

  // ── Only use HR-accessible APIs ──────────────────────────────────────────
  const { data: empData,  loading: l1, error: e1, refetch } = useFetch(employeeAPI.getAll);
  const { data: pending,  loading: l2 }                     = useFetch(leaveAPI.getPending);
  const { data: notifData, loading: l3 }                    = useFetch(notificationAPI.getUnread);

  const loading = l1 || l2 || l3;
  if (loading) return <Spinner />;
  if (e1)      return <ErrorState message={e1} onRetry={refetch} />;

  // ── Normalize employee list ───────────────────────────────────────────────
  const employees =
    empData?.content ||
    empData?.employees ||
    (Array.isArray(empData) ? empData : []);

  // ── Department pie ────────────────────────────────────────────────────────
  const deptMap = {};
  employees.forEach(e => {
    const dept =
      e.department?.name ||
      e.departmentName ||
      e.department ||
      e.dept ||
      "Unknown";
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptPie = Object.entries(deptMap).map(([name, value], i) => ({
    name, value, color: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  // ── Counts ────────────────────────────────────────────────────────────────
  const pendCount  = Array.isArray(pending)   ? pending.length   : (pending?.count   || 0);
  const unreadCount= Array.isArray(notifData) ? notifData.length : (notifData?.count || 0);
  const totalEmps  = employees.length;

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "there";

  // ── Recent employees (last 6 added) ──────────────────────────────────────
  const recentEmps = [...employees].slice(-6).reverse();

  return (
    <div className="hr-page">

      {/* ── Welcome Banner ── */}
      <div className="hr-welcome-banner">
        <div>
          <p className="hr-welcome-date">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric",
              month: "long",  year: "numeric"
            })}
          </p>
         <h2
           className="hr-welcome-heading"
           style={{
             display: "flex",
             alignItems: "center",
             gap: "10px"
           }}
         >

           <Sparkles size={26} />

           <span>
             {getGreeting()}, {firstName}
           </span>

         </h2>
          <p className="hr-welcome-sub">
            <strong>{pendCount} leave requests</strong> need approval ·{" "}
            <strong>{totalEmps} employees</strong> in the system
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >

          {/* NOTIFICATION BUTTON */}

          <button className="hr-top-bell">

            <Bell size={18} />

            {
              unreadCount > 0 && (
                <span className="hr-top-bell-count">
                  {unreadCount}
                </span>
              )
            }

          </button>

          {/* ADMIN TAG */}

          <div className="hr-banner-tag">
            HR Admin
          </div>

        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="hr-stats-grid">

        <div className="hr-stat-card">
          <div className="hr-stat-glow" style={{ "--acc": "#f59e0b" }} />
         <span className="hr-stat-icon">
           <Users size={24} />
         </span>
          <div>
            <div className="hr-stat-value">{totalEmps}</div>
            <div className="hr-stat-label">Total Employees</div>
          </div>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-glow" style={{ "--acc": "#ef4444" }} />
         <span className="hr-stat-icon">
           <ClipboardList size={24} />
         </span>
          <div>
            <div className="hr-stat-value">{pendCount}</div>
            <div className="hr-stat-label">Pending Leaves</div>
          </div>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-glow" style={{ "--acc": "#7c5af0" }} />
         <span className="hr-stat-icon">
           <Bell size={24} />
         </span>
          <div>
            <div className="hr-stat-value">{unreadCount}</div>
            <div className="hr-stat-label">Unread Notifications</div>
          </div>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-glow" style={{ "--acc": "#10b981" }} />
          <span className="hr-stat-icon">
            <Building2 size={24} />
          </span>
          <div>
            <div className="hr-stat-value">{Object.keys(deptMap).length}</div>
            <div className="hr-stat-label">Departments</div>
          </div>
        </div>

      </div>

      {/* ── Dept Pie + Recent Employees ── */}
      <div className="hr-two-col">

        <div className="hr-panel">
          <h3 className="hr-panel-title">Headcount by Department</h3>
          {deptPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={deptPie}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}
                >
                  {deptPie.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e1340", border: "none",
                    borderRadius: 10, color: "#fff"
                  }}
                />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={v => (
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>
                      {v}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="hr-empty-state">No employee data</div>
          )}
        </div>

        <div className="hr-panel">
          <h3 className="hr-panel-title">Recently Added Employees</h3>
          <div className="hr-activity-list">
            {recentEmps.length > 0 ? recentEmps.map((e, i) => {
              const name =
                `${e.firstName || ""} ${e.lastName || e.name || ""}`.trim();
              const dept =
                e.department?.name || e.departmentName ||
                e.department || e.dept || "—";
              const role =
                e.designation || e.role || "Employee";
              return (
                <div key={i} className="hr-activity-row">
                  <span className="hr-activity-icon">
                    <User size={16} />
                  </span>
                  <div className="hr-activity-text">
                    <strong>{name}</strong> · {role}
                  </div>
                  <div className="hr-activity-time">{dept}</div>
                </div>
              );
            }) : (
              <div className="hr-empty-state">No employees yet</div>
            )}
          </div>
        </div>

      </div>

      {/* ── Quick Actions ── */}
      <div className="hr-panel">
        <h3 className="hr-panel-title">Quick Actions</h3>
        <div className="hr-quick-actions">
          {[
            { icon: <UserPlus size={19} />,      label: "Add Employee",   page: "employees"     },
            { icon: <ClipboardList size={19} />, label: "Review Leaves",  page: "leaves"        },
            { icon: <Wallet size={19} />,        label: "Run Payroll",    page: "payroll"       },
            { icon: <Briefcase size={19} />,     label: "Post Job",       page: "recruitment"   },
            { icon: <Bell size={19} />,          label: "Notifications",  page: "notifications" },
          ].map(a => (
            <button
              key={a.label}
              className="hr-quick-btn"
              onClick={() => setActive(a.page)}
            >
              <span className="hr-quick-icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}