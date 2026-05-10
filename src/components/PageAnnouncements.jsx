import React, { useEffect, useState } from "react";
import axios from "axios";
import { Megaphone, Trash2, AlertTriangle, BellRing, Info, Zap } from "lucide-react";

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');

  .ann-root *, .ann-root *::before, .ann-root *::after { box-sizing: border-box; }
  .ann-root {
    font-family: 'DM Sans', sans-serif;
    padding: 32px 28px 60px;
    min-height: 100vh;
    color: #e2e8f0;
  }

  /* ── HEADER ── */
  .ann-header {
    display: flex; align-items: flex-start; justify-content: flex-start;
    gap: 16px; margin-bottom: 32px;
  }
  .ann-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(22px, 3vw, 30px); font-weight: 800;
    letter-spacing: -0.5px; margin: 0 0 4px;
    background: linear-gradient(120deg, #fff 30%, #fb923c);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .ann-subtitle { font-size: 13px; color: #64748b; margin: 0; }
  .ann-icon-box {
    width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #ea580c, #f97316);
    box-shadow: 0 6px 20px rgba(234,88,12,0.4);
    color: #fff;
  }

  /* ── FORM CARD ── */
  .ann-form-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(251,146,60,0.2);
    border-radius: 18px; overflow: hidden;
    margin-bottom: 32px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  }
  .ann-form-top {
    height: 3px;
    background: linear-gradient(90deg, #ea580c, #fb923c, #fbbf24);
  }
  .ann-form-body { padding: 22px 22px 20px; }
  .ann-form-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #64748b; margin-bottom: 14px;
  }

  .ann-input, .ann-textarea, .ann-select {
    width: 100%; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
    color: #e2e8f0; font-family: 'DM Sans', sans-serif;
    font-size: 14px; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ann-input         { padding: 11px 14px; margin-bottom: 12px; }
  .ann-textarea      { padding: 11px 14px; margin-bottom: 12px; resize: vertical; min-height: 90px; line-height: 1.6; }
  .ann-input::placeholder, .ann-textarea::placeholder { color: #475569; }
  .ann-input:focus, .ann-textarea:focus {
    border-color: rgba(251,146,60,0.5);
    box-shadow: 0 0 0 3px rgba(251,146,60,0.1);
  }

  .ann-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  /* priority select */
  .ann-select {
    width: auto; padding: 10px 32px 10px 14px; cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4.5L6 8.5L10 4.5' stroke='%238b9ab0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
    font-size: 13px; font-weight: 600;
  }
  .ann-select:focus { border-color: rgba(251,146,60,0.5); box-shadow: 0 0 0 3px rgba(251,146,60,0.1); }
  .ann-select option { background: #1e1b2e; color: #e2e8f0; }

  /* post btn */
  .ann-post-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 700;
    cursor: pointer; border: none; outline: none;
    background: linear-gradient(135deg, #ea580c, #f97316);
    color: #fff; box-shadow: 0 4px 16px rgba(234,88,12,0.4);
    transition: all 0.15s; margin-left: auto;
  }
  .ann-post-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(234,88,12,0.55); }
  .ann-post-btn:active { transform: translateY(0); }
  .ann-post-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  /* ── CARDS LIST ── */
  .ann-list { display: flex; flex-direction: column; gap: 14px; }

  .ann-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    animation: annFadeUp 0.35s ease both;
  }
  .ann-card:hover {
    border-color: rgba(255,255,255,0.14);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    transform: translateY(-1px);
  }

  /* left accent bar by priority */
  .ann-card-inner { display: flex; }
  .ann-card-bar   { width: 4px; flex-shrink: 0; border-radius: 0; }
  .ann-card-bar.normal   { background: linear-gradient(180deg, #3b82f6, #6366f1); }
  .ann-card-bar.important{ background: linear-gradient(180deg, #f59e0b, #fb923c); }
  .ann-card-bar.critical { background: linear-gradient(180deg, #ef4444, #f97316); }

  .ann-card-content { flex: 1; padding: 18px 20px 16px; }

  /* card top row */
  .ann-card-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 12px; margin-bottom: 10px;
  }
  .ann-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700; color: #f1f5f9;
    margin: 0 0 4px; line-height: 1.25;
  }
  .ann-card-date { font-size: 11.5px; color: #475569; }

  /* priority badge */
  .ann-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 99px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
    white-space: nowrap; flex-shrink: 0;
  }
  .ann-badge.normal    { background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.25); }
  .ann-badge.important { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
  .ann-badge.critical  { background: rgba(239,68,68,0.15);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

  .ann-card-message {
    font-size: 13.5px; line-height: 1.65; color: #94a3b8;
    margin: 0 0 14px; white-space: pre-wrap;
  }

  /* card footer */
  .ann-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .ann-posted-by {
    font-size: 12px; color: #475569;
    display: flex; align-items: center; gap: 6px;
  }
  .ann-posted-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #475569; flex-shrink: 0;
  }

  .ann-delete-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 13px; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    background: rgba(239,68,68,0.1); color: #f87171;
    border: 1px solid rgba(239,68,68,0.2);
    transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .ann-delete-btn:hover {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.45);
    box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
  }

  /* ── EMPTY STATE ── */
  .ann-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; padding: 60px 24px;
    background: rgba(255,255,255,0.025);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 16px; text-align: center;
  }
  .ann-empty-icon {
    width: 56px; height: 56px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(251,146,60,0.1);
    color: #fb923c; border: 1px solid rgba(251,146,60,0.2);
  }
  .ann-empty-text  { font-size: 15px; font-weight: 600; color: #475569; margin: 0; }
  .ann-empty-sub   { font-size: 13px; color: #334155; margin: 0; }

  /* ── ANIMATION ── */
  @keyframes annFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ann-card:nth-child(1) { animation-delay: 0.04s; }
  .ann-card:nth-child(2) { animation-delay: 0.08s; }
  .ann-card:nth-child(3) { animation-delay: 0.12s; }
  .ann-card:nth-child(4) { animation-delay: 0.16s; }
  .ann-card:nth-child(5) { animation-delay: 0.20s; }

  /* ── RESPONSIVE ── */
  @media (max-width: 540px) {
    .ann-root       { padding: 20px 14px 48px; }
    .ann-actions    { flex-direction: column; align-items: stretch; }
    .ann-post-btn   { margin-left: 0; justify-content: center; }
    .ann-select     { width: 100%; }
    .ann-card-top   { flex-direction: column; gap: 8px; }
  }
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const s = document.createElement("style");
  s.textContent = CSS;
  document.head.appendChild(s);
}

const PRIORITY_META = {
  Normal:    { icon: <Info size={13} />,          cls: "normal"    },
  Important: { icon: <Zap size={13} />,           cls: "important" },
  Critical:  { icon: <AlertTriangle size={13} />, cls: "critical"  },
};

export default function PageAnnouncements() {
  injectCSS();

  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", message: "", priority: "Normal" });
  const [posting, setPosting] = useState(false);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/announcements");
      setAnnouncements(res.data);
    } catch (err) { console.log(err); }
  };

const postAnnouncement = async () => {

  if (
    !form.title.trim() ||
    !form.message.trim()
  ) return;

  setPosting(true);

  try {

    const payload = {
      title: form.title,
      message: form.message,
      priority: form.priority,
      postedBy: "HR Admin",
      createdAt: new Date().toISOString()
    };

    const res = await axios.post(
      "http://localhost:8080/api/announcements",
      payload
    );

    // ADD NEW ANNOUNCEMENT TO TOP

    const newAnnouncement =
      res.data || {
        ...payload,
        id: Date.now()
      };

    setAnnouncements(prev => [
      newAnnouncement,
      ...prev
    ]);

    // CLEAR FORM

    setForm({
      title: "",
      message: "",
      priority: "Normal"
    });

  } catch (err) {

    console.log(
      "POST ERROR:",
      err
    );

    alert(
      "Failed to post announcement"
    );

  } finally {

    setPosting(false);
  }
};

  const deleteAnnouncement = async (id) => {
    // optimistic remove
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try {
      await axios.delete(`http://localhost:8080/api/announcements/${id}`);
    } catch (err) {
      console.log(err);
      fetchAnnouncements(); // restore on error
    }
  };

  const canPost = form.title.trim() && form.message.trim();

  return (
    <div className="ann-root">

      {/* HEADER */}
      <div className="ann-header">
        <div>
          <h1 className="ann-title">Company Announcements</h1>
          <p className="ann-subtitle">Broadcast updates and important notices to your team</p>
        </div>

      </div>

      {/* FORM CARD */}
      <div className="ann-form-card">
        <div className="ann-form-top" />
        <div className="ann-form-body">
          <p className="ann-form-label">New Announcement</p>

          <input
            className="ann-input"
            placeholder="Announcement title..."
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="ann-textarea"
            placeholder="Write your message here..."
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
          />

          <div className="ann-actions">
            <select
              className="ann-select"
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option>Normal</option>
              <option>Important</option>
              <option>Critical</option>
            </select>

            <button
              className="ann-post-btn"
              onClick={postAnnouncement}
              disabled={!canPost || posting}
            >
              <BellRing size={16} />
              {posting ? "Posting..." : "Post Announcement"}
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="ann-list">
        {announcements.length === 0 ? (
          <div className="ann-empty">
            <div className="ann-empty-icon"><Megaphone size={26} /></div>
            <p className="ann-empty-text">No announcements yet</p>
            <p className="ann-empty-sub">Post your first announcement above to notify your team.</p>
          </div>
        ) : (
          announcements.map((a, i) => {
            const priority = a.priority || "Normal";
            const meta = PRIORITY_META[priority] || PRIORITY_META.Normal;
            let dateStr = "";
            try { dateStr = new Date(a.createdAt).toLocaleString(); } catch {}

            return (
              <div key={a.id} className="ann-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="ann-card-inner">
                  <div className={`ann-card-bar ${meta.cls}`} />
                  <div className="ann-card-content">

                    <div className="ann-card-top">
                      <div>
                        <h2 className="ann-card-title">{a.title}</h2>
                        {dateStr && <span className="ann-card-date">{dateStr}</span>}
                      </div>
                      <span className={`ann-badge ${meta.cls}`}>
                        {meta.icon}
                        {priority}
                      </span>
                    </div>

                    <p className="ann-card-message">{a.message}</p>

                    <div className="ann-card-footer">
                      <span className="ann-posted-by">
                        <span className="ann-posted-dot" />
                        Posted by <strong style={{ color: "#64748b", marginLeft: 4 }}>{a.postedBy}</strong>
                      </span>
                      <button
                        className="ann-delete-btn"
                        onClick={() => deleteAnnouncement(a.id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
