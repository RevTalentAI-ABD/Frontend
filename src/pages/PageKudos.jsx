import React, { useState, useEffect } from "react";
import { ThumbsUp, MessageSquare, Award, Star, Zap, Users, Heart, Target, Lightbulb, Search, Plus, X } from "lucide-react";
import api from "../api/axiosConfig";
import "../styles/EmployeeDashboard.css"; // Reuse dashboard styles

function Avatar({ initials, size = 36, color = "#7c5af0" }) {
  return (
    <div className="ed-avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="ed-stat-card" style={{ "--accent": color }}>
      <div className="ed-stat-icon">{icon}</div>
      <div className="ed-stat-body">
        <div className="ed-stat-value">{value}</div>
        <div className="ed-stat-label">{label}</div>
        {sub && <div className="ed-stat-sub">{sub}</div>}
      </div>
      <div className="ed-stat-glow" />
    </div>
  );
}

const CATEGORY_ICONS = {
  TEAMWORK: <Users size={18} color="#0ea5e9" />,
  LEADERSHIP: <Target size={18} color="#ef4444" />,
  EXECUTION: <Zap size={18} color="#f59e0b" />,
  ATTITUDE: <Heart size={18} color="#ec4899" />,
  MENTORSHIP: <Award size={18} color="#8b5cf6" />,
  INNOVATION: <Lightbulb size={18} color="#eab308" />,
  SUPPORT: <Star size={18} color="#10b981" />
};

export default function PageKudos() {
  const [kudosList, setKudosList] = useState([]);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    receiverId: "",
    category: "TEAMWORK",
    message: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kudosRes, statsRes, empRes, meRes] = await Promise.all([
        api.get("/api/kudos"),
        api.get("/api/kudos/stats"),
        api.get("/api/employees"),
        api.get("/api/me")
      ]);
      setKudosList(kudosRes.data);
      setStats(statsRes.data);
      
      const currentUser = meRes.data;
      // Filter out the current user so they can't send kudos to themselves
      const otherEmployees = (empRes.data || []).filter(e => e.id !== currentUser.id);
      setEmployees(otherEmployees);
    } catch (err) {
      console.error("Failed to load kudos data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.receiverId || !form.message) {
      setToast("Please select a colleague and write a message.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/kudos", {
        receiverId: parseInt(form.receiverId),
        category: form.category,
        message: form.message
      });
      setToast("Kudos sent successfully!");
      setShowForm(false);
      setForm({ receiverId: "", category: "TEAMWORK", message: "" });
      fetchData();
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setToast(err.response?.data || "Failed to send kudos.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (kudosId) => {
    try {
      const res = await api.put(`/api/kudos/${kudosId}/like`);
      // Update the list locally to feel snappy
      setKudosList(prev => prev.map(k => k.id === kudosId ? res.data : k));
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  if (loading) {
    return <div className="ed-page"><p style={{color: "#9b96b8", padding: "20px"}}>Loading Kudos...</p></div>;
  }

  return (
    <div className="ed-page">
      <div className="ed-page-header-row">
        <div>
          <h2 className="ed-page-heading" style={{margin: 0}}>Kudos Board</h2>
          <p style={{color: "#9b96b8", fontSize: "14px", marginTop: "4px"}}>Recognize your colleagues' great work</p>
        </div>
        <button className="ed-primary-btn" onClick={() => setShowForm(s => !s)}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: showForm ? "#ef4444" : "#7c5af0" }}>
          {showForm ? <><X size={14}/> Cancel</> : <><Plus size={14}/> Give Kudos</>}
        </button>
      </div>

      {toast && <div className="ed-success-toast">{toast}</div>}

      {/* Stats Row */}
      {stats && (
        <div className="ed-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "24px" }}>
          <StatCard icon={<Award size={20} />} label="Received" value={stats.receivedThisMonth} sub="this month" color="#0ea5e9" />
          <StatCard icon={<Star size={20} />} label="Given" value={stats.givenThisMonth} sub="this month" color="#f59e0b" />
          <StatCard icon={<Users size={20} />} label="Company Wide" value={stats.companyWideThisMonth} sub="this month" color="#8b5cf6" />
        </div>
      )}

      {/* Give Kudos Form */}
      {showForm && (
        <div className="ed-panel ed-form-panel" style={{ marginBottom: "24px", border: "1px solid rgba(124, 90, 240, 0.2)", background: "linear-gradient(145deg, #241b4d 0%, #1a1040 100%)" }}>
          <h3 className="ed-panel-title">Give Kudos</h3>
          <div className="ed-form-grid">
            <div className="ed-form-field">
              <label>Who deserves kudos?</label>
              <select value={form.receiverId} onChange={e => setForm(f => ({ ...f, receiverId: e.target.value }))}>
                <option value="">Select a colleague...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.designation || "Employee"})
                  </option>
                ))}
              </select>
            </div>
            <div className="ed-form-field">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="TEAMWORK">Teamwork</option>
                <option value="LEADERSHIP">Leadership</option>
                <option value="EXECUTION">Execution</option>
                <option value="ATTITUDE">Positive Attitude</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="INNOVATION">Innovation</option>
                <option value="SUPPORT">Support</option>
              </select>
            </div>
            <div className="ed-form-field ed-form-full">
              <label>Message</label>
              <textarea rows={3} value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="What did they do well? Be specific!" />
            </div>
          </div>
          <button className="ed-primary-btn" onClick={handleSubmit} disabled={submitting} style={{marginTop: "16px"}}>
            {submitting ? "Sending..." : "Send Kudos 🚀"}
          </button>
        </div>
      )}

      {/* Kudos Feed */}
      <div className="ed-panel" style={{ background: "transparent", border: "none", padding: 0 }}>
        <h3 className="ed-panel-title" style={{ padding: "0 4px", marginBottom: "16px" }}>Recent Recognition</h3>
        
        {kudosList.length === 0 ? (
          <div className="ed-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
            <Award size={48} color="#4a3e75" style={{ marginBottom: "16px" }} />
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>No kudos yet</div>
            <div style={{ color: "#9b96b8", fontSize: "14px", marginTop: "8px" }}>Be the first to recognize someone's great work!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {kudosList.map(kudos => (
              <div key={kudos.id} className="ed-panel" style={{ padding: "20px", position: "relative", overflow: "hidden" }}>
                {/* Decoration */}
                <div style={{ position: "absolute", top: 0, right: 0, padding: "16px", opacity: 0.1 }}>
                  {CATEGORY_ICONS[kudos.category]}
                </div>
                
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <Avatar initials={kudos.receiverInitials} size={48} color={`hsl(${kudos.receiverId * 40 % 360}, 70%, 60%)`} />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ color: "#fff", fontWeight: "600", fontSize: "16px" }}>{kudos.receiverName}</span>
                      <span style={{ color: "#9b96b8", fontSize: "13px" }}>received kudos from</span>
                      <span style={{ color: "#e2dff0", fontWeight: "500", fontSize: "14px" }}>{kudos.senderName}</span>
                      <span style={{ color: "#6b7280", fontSize: "12px", marginLeft: "auto" }}>
                        {new Date(kudos.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(124, 90, 240, 0.1)", border: "1px solid rgba(124, 90, 240, 0.2)", padding: "4px 10px", borderRadius: "100px", marginTop: "12px", marginBottom: "12px" }}>
                      {CATEGORY_ICONS[kudos.category]}
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#e2dff0", letterSpacing: "0.5px" }}>
                        {kudos.category}
                      </span>
                    </div>
                    
                    <p style={{ color: "#d1cceb", fontSize: "15px", lineHeight: "1.6", margin: "0 0 16px 0" }}>
                      "{kudos.message}"
                    </p>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <button 
                        onClick={() => handleLike(kudos.id)}
                        style={{ 
                          display: "flex", alignItems: "center", gap: "6px", 
                          background: "transparent", border: "none", cursor: "pointer",
                          color: kudos.hasLiked ? "#ec4899" : "#9b96b8",
                          transition: "color 0.2s"
                        }}
                      >
                        <Heart size={16} fill={kudos.hasLiked ? "#ec4899" : "none"} />
                        <span style={{ fontSize: "13px", fontWeight: "500" }}>
                          {kudos.likesCount} {kudos.likesCount === 1 ? 'Like' : 'Likes'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
