import React from "react";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from "recharts";
import { useFetch } from "./hooks";
import { managerAPI, leaveAPI, notificationAPI, employeeAPI } from "./api";
import { StatCard, Spinner, ErrorState, Avatar } from "./UI";
import { useAuth } from "./AuthContext";

import {
  Users,
  UserPlus,
  ClipboardList,
  Briefcase,
  TrendingUp,
  CalendarDays,
  Star,
  IndianRupee,
  CheckCircle,
  Clock,
  Circle,        // ✅ ADD
  Wallet,        // ✅ ADD
  BarChart3,     // ✅ ADD
  Bell           // ✅ ADD
} from "lucide-react";
const DEPT_COLORS = ["#7c5af0","#f59e0b","#f97316","#10b981","#06b6d4","#ec4899","#a855f7","#64748b"];

export default function PageOverview({ setActive }) {
  const { user } = useAuth();
const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning ☀️";
  if (hour < 17) return "Good afternoon 🌤️";
  if (hour < 21) return "Good evening 🌆";
  return "Good night 🌙";
};
  const { data: summary,  loading: l1, error: e1 } = useFetch(managerAPI.getDashSummary);
  const { data: activity, loading: l2 }             = useFetch(managerAPI.getActivity);
  const { data: pending,  loading: l3, refetch }    = useFetch(leaveAPI.getPending);
  const { data: empData, loading: l4 } = useFetch(employeeAPI.getAll);

  const employees =
    empData?.data?.content ||   // nested paginated
    empData?.data ||            // axios array
    empData?.content ||
    empData?.employees ||
    (Array.isArray(empData) ? empData : []) ;

  const loading = l1 || l2 || l3 || l4;
  if (loading) return <Spinner />;
  if (e1)      return <ErrorState message={e1} onRetry={refetch} />;

  // Build dept pie from employees list
  const deptMap = {};

  (employees || []).forEach(e => {
    const deptName =
      e.department?.name ||
      e.departmentName ||
      e.dept ||
      "Unknown";

    deptMap[deptName] = (deptMap[deptName] || 0) + 1;
  });
  const deptPie = Object.entries(deptMap).map(([name, value], i) => ({
    name,
    value,
    color: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  const s        = summary || {};
  const acts     = Array.isArray(activity) ? activity : (activity?.activities || []);
  const pendCount= Array.isArray(pending) ? pending.length : (pending?.count || 0);

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "there";

  return (
    <div className="hr-page">
      {/* Banner */}
      <div className="hr-welcome-banner">
        <div>
          <p className="hr-welcome-date">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h2 className="hr-welcome-heading">
            {getGreeting()}, {firstName} 👋
          </h2>
          <p className="hr-welcome-sub">
            <strong>{pendCount} leave requests</strong> need approval ·{" "}
            <strong>Payroll</strong> check your status
          </p>
        </div>
        <div className="hr-banner-tag">HR Admin</div>
      </div>

{/*        */}{/* Stats */}
{/*      <div className="hr-stats-grid"> */}
{/*        <StatCard */}
{/*          icon={<Users size={18} />} */}
{/*          label="Total Employees" */}
{/*          value={s.totalEmployees ?? (employees?.length ?? 0)} */}
{/*          sub="headcount" */}
{/*          color="#f59e0b" */}
{/*          delta={8} */}
{/*        /> */}

{/*        <StatCard */}
{/*          icon={<Circle size={18} />} */}
{/*          label="Active Today" */}
{/*          value={s.activeEmployees ?? 0} */}
{/*          sub="in / WFH" */}
{/*          color="#10b981" */}
{/*          delta={2} */}
{/*        /> */}

{/*        <StatCard */}
{/*          icon={<ClipboardList size={18} />} */}
{/*          label="Pending Leaves" */}
{/*          value={pendCount} */}
{/*          sub="need action" */}
{/*          color="#ef4444" */}
{/*        /> */}

{/*        <StatCard */}
{/*          icon={<Briefcase size={18} />} */}
{/*          label="Open Positions" */}
{/*          value={s.openPositions ?? 0} */}
{/*          sub="hiring" */}
{/*          color="#7c5af0" */}
{/*        /> */}
{/*      </div> */}

      {/* Dept Pie + Activity */}
      <div className="hr-two-col">
        <div className="hr-panel">
          <h3 className="hr-panel-title">Headcount by Department</h3>
          {deptPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={deptPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {deptPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e1340", border: "none", borderRadius: 10, color: "#fff" }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="hr-empty-state">No employee data</div>}
        </div>

        <div className="hr-panel">
          <h3 className="hr-panel-title">Recent HR Activity</h3>
          <div className="hr-activity-list">
            {acts.slice(0, 6).map((a, i) => (
              <div key={i} className="hr-activity-row">
                <span className="hr-activity-icon">{a.icon || "📌"}</span>
                <div className="hr-activity-text">{a.text || a.description || a.action}</div>
                <div className="hr-activity-time">{a.time || a.createdAt || ""}</div>
              </div>
            ))}
            {acts.length === 0 && <div className="hr-empty-state">No recent activity</div>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
     <div className="hr-panel">
       <h3 className="hr-panel-title">Quick Actions</h3>

       <div className="hr-quick-actions">
         {[
           { icon: <UserPlus size={19} />, label: "Add Employee",  page: "employees" },
           { icon: <ClipboardList size={19} />, label: "Review Leaves", page: "leaves" },
           { icon: <Wallet size={19} />, label: "Run Payroll",   page: "payroll" },
           { icon: <Briefcase size={19} />, label: "Post Job",   page: "recruitment" },
           { icon: <Bell size={19} />, label: "Notifications", page: "notifications" },
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
