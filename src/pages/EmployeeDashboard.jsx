import React, { useState, useEffect, useRef } from "react";
import "../styles/EmployeeDashboard.css";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
const EMPLOYEE = {
 
};

const ATTENDANCE_DATA = [
  
];

const CALENDAR = (() => {
  
})();

const LEAVES = [
  
];

const LEAVE_HISTORY = [

];

const PAYSLIPS = [
  
];

const SALARY_BREAKDOWN = [
  
];

const NOTIFICATIONS = [

];

const SCHEDULE = [
  
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="ed-logo">
      <div className="ed-logo-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
          <rect x="13" y="2" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
          <rect x="2" y="13" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
          <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <span className="ed-logo-text">Rev<span>Talent</span></span>
    </div>
  );
}

function Avatar({ initials, size=36, color="#7c5af0" }) {
  return (
    <div className="ed-avatar" style={{width:size,height:size,background:color,fontSize:size*0.35}}>
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  const [count, setCount] = useState(0);
  const num = parseFloat(value);
  useEffect(() => {
    if (isNaN(num)) return;
    let start = 0;
    const step = num / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(t); }
      else setCount(Math.floor(start * 10) / 10);
    }, 20);
    return () => clearInterval(t);
  }, [num]);
  return (
    <div className="ed-stat-card" style={{"--accent":color}}>
      <div className="ed-stat-icon">{icon}</div>
      <div className="ed-stat-body">
        <div className="ed-stat-value">{isNaN(num) ? value : (Number.isInteger(num) ? count : count.toFixed(1))}</div>
        <div className="ed-stat-label">{label}</div>
        {sub && <div className="ed-stat-sub">{sub}</div>}
      </div>
      <div className="ed-stat-glow" />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { Approved:"badge-green", Pending:"badge-yellow", Rejected:"badge-red", Ready:"badge-purple", Downloaded:"badge-gray" };
  return <span className={`ed-badge ${map[status]||""}`}>{status}</span>;
}

// ── PAGES ─────────────────────────────────────────────────────────────────────

function PageHome({ onClockIn }) {
  const [clocked, setClocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const toggle = () => {
    if (!clocked) {
      timerRef.current = setInterval(() => setElapsed(e => e+1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    setClocked(c => !c);
  };
  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="ed-page">
      {/* Welcome */}
      <div className="ed-welcome-banner">
        
        
      </div>

      {/* Stats */}
      <div className="ed-stats-grid">
        <StatCard icon="🏖️" label="Leave Balance"    value=""   sub=""  color="#7c5af0"/>
        <StatCard icon="📅" label="Attendance"       value=""   sub=""    color="#06b6d4"/>
        <StatCard icon="💰" label="Next Payslip"     value=" " sub=" "     color="#f59e0b"/>
        <StatCard icon="⏰" label="Hours This Week"  value=" " sub=" "      color="#10b981"/>
      </div>

      {/* Schedule + Announcements */}
      <div className="ed-two-col">
        <div className="ed-panel">
          <h3 className="ed-panel-title">Today's Schedule</h3>
          <div className="ed-schedule-list">
            {SCHEDULE.map((s,i) => (
              <div key={i} className="ed-schedule-row" style={{"--c":s.color}}>
                <div className="ed-schedule-dot"/>
                <div className="ed-schedule-time">{s.time}</div>
                <div className="ed-schedule-info">
                  <div className="ed-schedule-title">{s.title}</div>
                  <span className="ed-schedule-tag">{s.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ed-panel">
          <h3 className="ed-panel-title">Announcements</h3>
          <div className="ed-announcements">
            <div className="ed-announce-item">
              <span className="ed-announce-dot" style={{background:"#f59e0b"}}/>
              
            </div>
            <div className="ed-announce-item">
              <span className="ed-announce-dot" style={{background:"#10b981"}}/>
              
            </div>
            <div className="ed-announce-item">
              <span className="ed-announce-dot" style={{background:"#7c5af0"}}/>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageAttendance() {
  return (
    <div className="ed-page">
      <h2 className="ed-page-heading">Attendance</h2>
      {/* Calendar */}
      <div className="ed-panel">
        <div className="ed-panel-header">
          <h3 className="ed-panel-title">April 2026</h3>
          <div className="ed-legend">
            {[["present","#10b981"],["absent","#ef4444"],["leave","#f59e0b"],["weekend","#c4bfe0"]].map(([l,c])=>(
              <span key={l} className="ed-legend-item"><span style={{background:c}}/>{l}</span>
            ))}
          </div>
        </div>
        <div className="ed-calendar-grid">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d} className="ed-cal-header">{d}</div>
          ))}
          {Array(2).fill(null).map((_,i)=><div key={"e"+i} className="ed-cal-empty"/>)}
          {CALENDAR.map(({day,type})=>(
            <div key={day} className={`ed-cal-day ed-cal-${type}`}>{day}</div>
          ))}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="ed-panel">
        <h3 className="ed-panel-title">Weekly Hours</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={ATTENDANCE_DATA}>
            <defs>
              <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c5af0" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#7c5af0" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,90,240,0.1)"/>
            <XAxis dataKey="day" tick={{fill:"#9b96b8",fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#9b96b8",fontSize:12}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:"#1e1740",border:"none",borderRadius:10,color:"#fff"}}/>
            <Area type="monotone" dataKey="hours" stroke="#7c5af0" strokeWidth={2.5} fill="url(#hoursGrad)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="ed-stats-grid">
        <StatCard icon="✅" label="Present Days"  value="22" sub="this month" color="#10b981"/>
        <StatCard icon="❌" label="Absent Days"   value="1"  sub="this month" color="#ef4444"/>
        <StatCard icon="🏖️" label="Leave Days"   value="2"  sub="this month" color="#f59e0b"/>
        <StatCard icon="⏱️" label="Avg Hours/Day" value="8.2" sub="this month" color="#7c5af0"/>
      </div>
    </div>
  );
}

function PageLeave() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({type:"Casual",from:"",to:"",reason:""});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (form.from && form.to && form.reason) { setSubmitted(true); setShowForm(false); }
  };

  return (
    <div className="ed-page">
      <div className="ed-page-header-row">
        <h2 className="ed-page-heading">Leave Management</h2>
        <button className="ed-primary-btn" onClick={()=>setShowForm(s=>!s)}>
          {showForm ? "✕ Cancel" : "+ Apply Leave"}
        </button>
      </div>

      {submitted && (
        <div className="ed-success-toast">✅ Leave request submitted successfully!</div>
      )}

      {showForm && (
        <div className="ed-panel ed-form-panel">
          <h3 className="ed-panel-title">New Leave Request</h3>
          <div className="ed-form-grid">
            <div className="ed-form-field">
              <label>Leave Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option>Casual</option><option>Sick</option><option>Earned</option>
              </select>
            </div>
            <div className="ed-form-field">
              <label>From Date</label>
              <input type="date" value={form.from} onChange={e=>setForm(f=>({...f,from:e.target.value}))}/>
            </div>
            <div className="ed-form-field">
              <label>To Date</label>
              <input type="date" value={form.to} onChange={e=>setForm(f=>({...f,to:e.target.value}))}/>
            </div>
            <div className="ed-form-field ed-form-full">
              <label>Reason</label>
              <textarea rows={3} placeholder="Brief reason..." value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}/>
            </div>
          </div>
          <button className="ed-primary-btn" onClick={handleSubmit}>Submit Request</button>
        </div>
      )}

      {/* Balance Cards */}
      <div className="ed-leave-balance-grid">
        {LEAVES.map(l=>(
          <div key={l.type} className="ed-leave-card" style={{"--lc":l.color}}>
            <div className="ed-leave-type">{l.type} Leave</div>
            <div className="ed-leave-numbers">
              <span className="ed-leave-used">{l.used}</span>
              <span className="ed-leave-sep">/</span>
              <span className="ed-leave-total">{l.total}</span>
            </div>
            <div className="ed-leave-bar-bg">
              <div className="ed-leave-bar-fill" style={{width:`${(l.used/l.total)*100}%`}}/>
            </div>
            <div className="ed-leave-remaining">{l.total-l.used} days remaining</div>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="ed-panel">
        <h3 className="ed-panel-title">Leave History</h3>
        <div className="ed-table-wrap">
          <table className="ed-table">
            <thead>
              <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr>
            </thead>
            <tbody>
              {LEAVE_HISTORY.map(r=>(
                <tr key={r.id}>
                  <td>{r.type}</td><td>{r.from}</td><td>{r.to}</td>
                  <td>{r.days}</td><td>{r.reason}</td>
                  <td><StatusBadge status={r.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PagePayroll() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="ed-page">
      <h2 className="ed-page-heading">Payroll</h2>

      {/* Current Payslip */}
      <div className="ed-payslip-hero">
        <div className="ed-payslip-month">April 2026</div>
        <div className="ed-payslip-amounts">
          <div><div className="ed-ps-label">Gross Salary</div><div className="ed-ps-amount"></div></div>
          <div className="ed-ps-divider"/>
          <div><div className="ed-ps-label">Net Take Home</div><div className="ed-ps-amount ed-ps-net"></div></div>
        </div>
        <button className="ed-download-btn" onClick={()=>alert("Downloading payslip PDF...")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Payslip
        </button>
      </div>

      {/* Breakdown */}
      <div className="ed-panel">
        <div className="ed-panel-header">
          <h3 className="ed-panel-title">Salary Breakdown</h3>
          <button className="ed-text-btn" onClick={()=>setExpanded(e=>!e)}>{expanded?"Hide":"Show"} details</button>
        </div>
        <div className={`ed-breakdown-list ${expanded?"expanded":""}`}>
          {SALARY_BREAKDOWN.map((item,i)=>(
            <div key={i} className="ed-breakdown-row">
              <span className="ed-breakdown-label">{item.label}</span>
              <span className={`ed-breakdown-amount ${item.type==="debit"?"debit":""}`}>
                {item.type==="debit"?"-":"+"}  {item.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="ed-panel">
        <h3 className="ed-panel-title">Payslip History</h3>
        {PAYSLIPS.map((p,i)=>(
          <div key={i} className="ed-payslip-row">
            <div>
              <div className="ed-ps-row-month">{p.month}</div>
              <div className="ed-ps-row-net">{p.net}</div>
            </div>
            <div className="ed-ps-row-right">
              <StatusBadge status={p.status}/>
              <button className="ed-icon-btn" title="Download">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageProfile() {
  const [editing, setEditing] = useState(false);
  const [info, setInfo] = useState({name:EMPLOYEE.name,email:EMPLOYEE.email,phone:EMPLOYEE.phone,dept:EMPLOYEE.dept});
  const [saved, setSaved] = useState(false);

  const save = () => { setEditing(false); setSaved(true); setTimeout(()=>setSaved(false),3000); };

  return (
    <div className="ed-page">
      <h2 className="ed-page-heading">My Profile</h2>
      {saved && <div className="ed-success-toast">✅ Profile updated successfully!</div>}
      <div className="ed-profile-hero">
        <Avatar initials={EMPLOYEE.avatar} size={72} color="#7c5af0"/>
        <div>
          <div className="ed-profile-name">{info.name}</div>
          <div className="ed-profile-role">{EMPLOYEE.role} · {EMPLOYEE.dept}</div>
          <div className="ed-profile-meta">ID: {EMPLOYEE.employeeId} · Joined {EMPLOYEE.joined}</div>
        </div>
        <button className="ed-primary-btn" style={{marginLeft:"auto"}} onClick={()=>editing?save():setEditing(true)}>
          {editing?"💾 Save Changes":"✏️ Edit Profile"}
        </button>
      </div>

      <div className="ed-panel">
        <h3 className="ed-panel-title">Personal Information</h3>
        <div className="ed-form-grid">
          {[["Full Name","name"],["Email","email"],["Phone","phone"],["Department","dept"]].map(([label,key])=>(
            <div key={key} className="ed-form-field">
              <label>{label}</label>
              {editing
                ? <input value={info[key]} onChange={e=>setInfo(i=>({...i,[key]:e.target.value}))}/>
                : <div className="ed-profile-value">{info[key]}</div>
              }
            </div>
          ))}
        </div>
      </div>

      <div className="ed-panel">
        <h3 className="ed-panel-title">Change Password</h3>
        <div className="ed-form-grid">
          <div className="ed-form-field"><label>Current Password</label><input type="password" placeholder="••••••••"/></div>
          <div className="ed-form-field"><label>New Password</label><input type="password" placeholder="••••••••"/></div>
          <div className="ed-form-field"><label>Confirm Password</label><input type="password" placeholder="••••••••"/></div>
        </div>
        <button className="ed-primary-btn" style={{marginTop:8}}>Update Password</button>
      </div>
    </div>
  );
}

function PageNotifications() {
  const [notes, setNotes] = useState(NOTIFICATIONS);
  const markAll = () => setNotes(n=>n.map(x=>({...x,unread:false})));
  return (
    <div className="ed-page">
      <div className="ed-page-header-row">
        <h2 className="ed-page-heading">Notifications</h2>
        <button className="ed-text-btn" onClick={markAll}>Mark all as read</button>
      </div>
      <div className="ed-panel">
        {notes.map(n=>(
          <div key={n.id} className={`ed-notif-row ${n.unread?"unread":""}`}
            onClick={()=>setNotes(ns=>ns.map(x=>x.id===n.id?{...x,unread:false}:x))}>
            <div className="ed-notif-icon">{n.icon}</div>
            <div className="ed-notif-body">
              <div className="ed-notif-text">{n.text}</div>
              <div className="ed-notif-time">{n.time}</div>
            </div>
            {n.unread && <div className="ed-notif-dot"/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN SHELL ────────────────────────────────────────────────────────────────
const NAV = [
  { id:"home",          icon:"🏠", label:"Home"           },
  { id:"attendance",    icon:"📅", label:"Attendance"     },
  { id:"leave",         icon:"🏖️", label:"Leave"         },
  { id:"payroll",       icon:"💰", label:"Payroll"        },
  { id:"profile",       icon:"👤", label:"Profile"        },
  { id:"notifications", icon:"🔔", label:"Notifications"  },
];

export default function EmployeeDashboard({ onLogout }) {
  const [active, setActive] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unread = NOTIFICATIONS.filter(n=>n.unread).length;

  const PAGE = { home:<PageHome/>, attendance:<PageAttendance/>, leave:<PageLeave/>,
                 payroll:<PagePayroll/>, profile:<PageProfile/>, notifications:<PageNotifications/> };

  return (
    <div className="ed-shell">
      {/* Sidebar */}
      <aside className={`ed-sidebar ${sidebarOpen?"open":""}`}>
        <Logo/>
        <nav className="ed-nav">
          {NAV.map(n=>(
            <button key={n.id} className={`ed-nav-item ${active===n.id?"active":""}`}
              onClick={()=>{setActive(n.id);setSidebarOpen(false);}}>
              <span className="ed-nav-icon">{n.icon}</span>
              <span className="ed-nav-label">{n.label}</span>
              {n.id==="notifications" && unread>0 && <span className="ed-nav-badge">{unread}</span>}
            </button>
          ))}
        </nav>
        <div className="ed-sidebar-footer">
          <Avatar initials="" size={34} color="#7c5af0"/>
          <div className="ed-sidebar-user">
            <div className="ed-sidebar-name"></div>
            <div className="ed-sidebar-role"></div>
          </div>
          <button className="ed-logout-btn" onClick={onLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="ed-overlay" onClick={()=>setSidebarOpen(false)}/>}

      {/* Main */}
      <main className="ed-main">
        <header className="ed-topbar">
          <button className="ed-hamburger" onClick={()=>setSidebarOpen(s=>!s)}>
            <span/><span/><span/>
          </button>
          <div className="ed-topbar-title">{NAV.find(n=>n.id===active)?.label}</div>
          <button className="ed-topbar-notif" onClick={()=>setActive("notifications")}>
            🔔 {unread>0&&<span className="ed-notif-badge">{unread}</span>}
          </button>
        </header>
        <div className="ed-content">
          {PAGE[active]}
        </div>
      </main>
    </div>
  );
}
