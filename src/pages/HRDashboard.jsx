import React, { useState } from "react";
import "../styles/HRDashboard.css";

export default function HRDashboard() {
  const [active, setActive] = useState("overview");

  const PAGE = {
    overview: <Overview />,
    employees: <Employees />,
    leaves: <Leaves />,
    payroll: <Payroll />,
    recruitment: <Recruitment />,
    reports: <Reports />,
    notifications: <Notifications />,
  };

  return (
    <div className="hr-shell">
      {/* Sidebar */}
      <aside className="hr-sidebar">
        <div className="hr-logo">
          <span className="hr-logo-text">RevTalent</span>
        </div>

        <nav className="hr-nav">
          {[
            "overview",
            "employees",
            "leaves",
            "payroll",
            "recruitment",
            "reports",
            "notifications",
          ].map((item) => (
            <button
              key={item}
              className={`hr-nav-item ${active === item ? "active" : ""}`}
              onClick={() => setActive(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="hr-main">
        <div className="hr-content">{PAGE[active]}</div>
      </main>
    </div>
  );
}

//
// 🔹 OVERVIEW
//
function Overview() {
  return (
    <div className="hr-page">
      <h2 className="hr-page-heading">Overview</h2>

      <div className="hr-empty-state">
        No data loaded
        <br />
        <button className="hr-primary-btn" onClick={() => alert("GET /api/manager/dashboard-summary")}>
          Load Dashboard
        </button>
      </div>
    </div>
  );
}

//
// 🔹 EMPLOYEES
//
function Employees() {
  const [employees, setEmployees] = useState([]);

  const loadEmployees = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
  };

  return (
    <div className="hr-page">
      <h2 className="hr-page-heading">Employees</h2>

      <button className="hr-primary-btn" onClick={loadEmployees}>
        Load Employees
      </button>

      {employees.length === 0 ? (
        <div className="hr-empty-state">No employees found</div>
      ) : (
        <div className="hr-panel">
          {employees.map((e) => (
            <div key={e.id}>{e.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

//
// 🔹 LEAVES
//
function Leaves() {
  const [leaves, setLeaves] = useState([]);

  const loadLeaves = async () => {
    const res = await fetch("/api/leaves/all");
    const data = await res.json();
    setLeaves(data);
  };

  const approve = async (id) => {
    await fetch(`/api/leaves/${id}/approve`, { method: "PUT" });
    alert("Approved");
  };

  const reject = async (id) => {
    await fetch(`/api/leaves/${id}/reject`, { method: "PUT" });
    alert("Rejected");
  };

  return (
    <div className="hr-page">
      <h2 className="hr-page-heading">Leave Management</h2>

      <button className="hr-primary-btn" onClick={loadLeaves}>
        Load Leaves
      </button>

      {leaves.length === 0 ? (
        <div className="hr-empty-state">No leave requests</div>
      ) : (
        <div className="hr-panel">
          {leaves.map((l) => (
            <div key={l.id}>
              {l.employeeName}
              <button onClick={() => approve(l.id)}>Approve</button>
              <button onClick={() => reject(l.id)}>Reject</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

//
// 🔹 PAYROLL
//
function Payroll() {
  const [data, setData] = useState([]);

  const loadPayroll = async () => {
    const res = await fetch("/api/payroll/all");
    const d = await res.json();
    setData(d);
  };

  const runPayroll = async () => {
    await fetch("/api/payroll/run", { method: "POST" });
    alert("Payroll Done");
  };

  return (
    <div className="hr-page">
      <h2 className="hr-page-heading">Payroll</h2>

      <button className="hr-primary-btn" onClick={loadPayroll}>
        Load Payroll
      </button>
      <button className="hr-outline-btn" onClick={runPayroll}>
        Run Payroll
      </button>

      {data.length === 0 ? (
        <div className="hr-empty-state">No payroll data</div>
      ) : (
        <div className="hr-panel">
          {data.map((p, i) => (
            <div key={i}>{p.department}</div>
          ))}
        </div>
      )}
    </div>
  );
}

//
// 🔹 RECRUITMENT
//
function Recruitment() {
  const [jobs, setJobs] = useState([]);

  const loadJobs = async () => {
    const res = await fetch("/api/recruitment/jobs");
    const d = await res.json();
    setJobs(d);
  };

  return (
    <div className="hr-page">
      <h2 className="hr-page-heading">Recruitment</h2>

      <button className="hr-primary-btn" onClick={loadJobs}>
        Load Jobs
      </button>

      {jobs.length === 0 ? (
        <div className="hr-empty-state">No jobs available</div>
      ) : (
        <div className="hr-panel">
          {jobs.map((j) => (
            <div key={j.id}>{j.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}

//
// 🔹 REPORTS
//
function Reports() {
  const [report, setReport] = useState(null);

  const loadReports = async () => {
    const res = await fetch("/api/reports/team-summary");
    const d = await res.json();
    setReport(d);
  };

  return (
    <div className="hr-page">
      <h2 className="hr-page-heading">Reports</h2>

      <button className="hr-primary-btn" onClick={loadReports}>
        Generate Report
      </button>

      {!report ? (
        <div className="hr-empty-state">No reports generated</div>
      ) : (
        <div className="hr-panel">
          <pre>{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

//
// 🔹 NOTIFICATIONS
//
function Notifications() {
  const [notes, setNotes] = useState([]);

  const loadNotifications = async () => {
    const res = await fetch("/api/notifications");
    const d = await res.json();
    setNotes(d);
  };

  return (
    <div className="hr-page">
      <h2 className="hr-page-heading">Notifications</h2>

      <button className="hr-primary-btn" onClick={loadNotifications}>
        Load Notifications
      </button>

      {notes.length === 0 ? (
        <div className="hr-empty-state">No notifications</div>
      ) : (
        <div className="hr-panel">
          {notes.map((n) => (
            <div key={n.id}>{n.message}</div>
          ))}
        </div>
      )}
    </div>
  );
}