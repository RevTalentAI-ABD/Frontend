import React, { useState, useEffect } from "react";
import { Logo, Avatar } from "./UI";
import { notificationAPI, leaveAPI } from "./api";
import { useAuth } from "./AuthContext";
import PageOverview      from "./PageOverview";
import PageEmployees     from "./PageEmployees";
import PageLeaves        from "./PageLeaves";
import PagePayroll       from "./PagePayroll";
import PageRecruitment   from "./PageRecruitment";
import PageReports       from "./PageReports";
import PageNotifications from "./PageNotifications";
import "./HRDashboard.css";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Wallet,
  Briefcase,
  BarChart3,
  Bell
} from "lucide-react";

const NAV = [
  { id: "overview",      icon: <LayoutDashboard size={18} />, label: "Overview" },
  { id: "employees",     icon: <Users size={18} />, label: "Employees" },
  { id: "leaves",        icon: <CalendarCheck size={18} />, label: "Leave Mgmt" },
  { id: "payroll",       icon: <Wallet size={18} />, label: "Payroll" },
  { id: "recruitment",   icon: <Briefcase size={18} />, label: "Recruitment" },
  { id: "notifications", icon: <Bell size={18} />, label: "Notifications" },
];

export default function HRDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive]           = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread,  setUnread]          = useState(0);
  const [pending, setPending]         = useState(0);

  // Poll badge counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [notifRes, leaveRes] = await Promise.all([
          notificationAPI.getUnread(),
          leaveAPI.getPending(),
        ]);
        const notifs  = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data?.notifications || []);
        const leaves  = Array.isArray(leaveRes.data) ? leaveRes.data : (leaveRes.data?.leaves || []);
        setUnread(notifs.length);
        setPending(leaves.length);
      } catch {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [active]);

  const PAGE = {
    overview:      <PageOverview setActive={setActive} />,
    employees:     <PageEmployees />,
    leaves:        <PageLeaves />,
    payroll:       <PagePayroll />,
    recruitment:   <PageRecruitment />,
    reports:       <PageReports />,
    notifications: <PageNotifications />,
  };

  const name = user
    ? `${user.firstName || ""} ${user.lastName || user.name || ""}`.trim()
    : "HR Admin";
  const role = user?.role || user?.designation || "HR Admin";

  return (
    <div className="hr-shell">
      <aside className={`hr-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Logo />
        <nav className="hr-nav">
          {NAV.map(n => (
            <button key={n.id}
              className={`hr-nav-item ${active === n.id ? "active" : ""}`}
              onClick={() => { setActive(n.id); setSidebarOpen(false); }}>
              <span className="hr-nav-icon">{n.icon}</span>
              <span className="hr-nav-label">{n.label}</span>
              {n.id === "leaves"        && pending > 0 && <span className="hr-nav-badge">{pending}</span>}
              {n.id === "notifications" && unread  > 0 && <span className="hr-nav-badge">{unread}</span>}
            </button>
          ))}
        </nav>
        <div className="hr-sidebar-footer">
          <Avatar name={name} size={34} />
          <div className="hr-sidebar-user">
            <div className="hr-sidebar-name">{name}</div>
            <div className="hr-sidebar-role">{role}</div>
          </div>
          <button className="hr-logout-btn" onClick={logout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="hr-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="hr-main">
        <header className="hr-topbar">
          <button className="hr-hamburger" onClick={() => setSidebarOpen(s => !s)}>
            <span /><span /><span />
          </button>
          <div className="hr-topbar-title">{NAV.find(n => n.id === active)?.label}</div>
          <button className="hr-topbar-notif" onClick={() => setActive("notifications")}>
            🔔{unread > 0 && <span className="hr-notif-badge">{unread}</span>}
          </button>
        </header>
        <div className="hr-content">
          {PAGE[active]}
        </div>
      </main>
    </div>
  );
}
