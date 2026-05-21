import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { Plus, X, Pencil, Trash2, ArrowLeft, ArrowRight, Calendar as CalIcon } from "lucide-react";
import "../styles/PageCalendar.css";

export default function PageCalendar({ isHr = false }) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", date: "", type: "National" });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/holidays");
      setHolidays(res.data);
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.date) return;
    try {
      if (editingId) {
        await api.put(`/api/holidays/${editingId}`, form);
      } else {
        await api.post("/api/holidays", form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ name: "", date: "", type: "National" });
      fetchHolidays();
    } catch (err) {
      alert("Failed to save holiday");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await api.delete(`/api/holidays/${id}`);
      fetchHolidays();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const openEdit = (h) => {
    setEditingId(h.id);
    setForm({ name: h.name, date: h.date, type: h.type });
    setShowModal(true);
  };

  // Calendar Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Derived Data
  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= new Date().setHours(0,0,0,0)).sort((a,b) => new Date(a.date) - new Date(b.date));
  const nationalCount = holidays.filter(h => h.type?.toLowerCase() === "national").length;
  const festivalCount = holidays.filter(h => h.type?.toLowerCase() === "festival").length;

  return (
    <div className="cal-page-container">
      <div className="cal-header-row">
        <div className="cal-title-section">
          <h2>Calendar</h2>
          <div className="cal-subtitle">Indian public holidays · {year}</div>
        </div>
        <div className="cal-top-badges">
          <div className="cal-badge national">🏢 {nationalCount} National</div>
          <div className="cal-badge festival">🎉 {festivalCount} Festival</div>
        </div>
      </div>

      <div className="cal-grid-layout">
        {/* Left Column: Calendar Widget */}
        <div>
          <div className="cal-widget-panel">
            <div className="cal-widget-header">
              <button className="cal-nav-btn" onClick={prevMonth}><ArrowLeft size={16}/></button>
              <div className="cal-month-year">
                {currentDate.toLocaleString('default', { month: 'long' })} {year}
              </div>
              <button className="cal-nav-btn" onClick={nextMonth}><ArrowRight size={16}/></button>
            </div>

            <div className="cal-days-header">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>

            <div className="cal-days-grid">
              {days.map((d, i) => {
                if (d === null) return <div key={i} className="cal-day-cell empty"></div>;
                
                const isSunday = (i % 7) === 0;
                const isToday = isCurrentMonth && d === today.getDate();
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const isHoliday = holidays.find(h => h.date === dateStr);

                let classes = "cal-day-cell";
                if (isHoliday) classes += " holiday";
                if (isToday) classes += " today";
                if (isSunday && !isHoliday && !isToday) classes += " sunday";

                return (
                  <div key={i} className={classes} title={isHoliday?.name}>
                    {d}
                  </div>
                );
              })}
            </div>

            <div className="cal-legend">
              <div className="cal-legend-item"><div className="cal-legend-dot holiday-dot"></div> Holiday</div>
              <div className="cal-legend-item"><div className="cal-legend-dot today-dot"></div> Today</div>
              <div className="cal-legend-item"><div className="cal-legend-dot sunday-dot"></div> Sunday</div>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming & Summary */}
        <div className="cal-right-column">
          <div className="cal-list-panel">
            <div className="cal-section-title">
              UPCOMING HOLIDAYS
              {isHr && (
                <button className="cal-hr-btn" onClick={() => { setEditingId(null); setForm({name:"", date:"", type:"National"}); setShowModal(true); }}>
                  <Plus size={14}/> Add Holiday
                </button>
              )}
            </div>
            
            {upcomingHolidays.length === 0 ? (
              <div style={{ color: '#9b96b8', fontSize: '14px', padding: '20px 0', textAlign: 'center' }}>No upcoming holidays</div>
            ) : (
              upcomingHolidays.slice(0, 5).map(h => {
                const dateObj = new Date(h.date);
                const day = dateObj.getDate();
                const mmm = dateObj.toLocaleString('default', { month: 'short' });
                const diffTime = dateObj - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const daysText = diffDays === 0 ? "Today" : `In ${diffDays} days`;
                const isNational = h.type?.toLowerCase() === "national";

                return (
                  <div key={h.id} className="cal-holiday-item">
                    <div className={`cal-date-box ${isNational ? 'national-box' : 'festival-box'}`}>
                      <span className="cal-date-day">{day}</span>
                      <span className="cal-date-month">{mmm}</span>
                    </div>
                    <div className="cal-holiday-info">
                      <div className="cal-holiday-name">{h.name}</div>
                      <div className="cal-holiday-daysleft">{daysText}</div>
                    </div>
                    {isHr && (
                      <div className="cal-action-btns">
                        <button className="cal-icon-btn" onClick={() => openEdit(h)}><Pencil size={14}/></button>
                        <button className="cal-icon-btn danger" onClick={() => handleDelete(h.id)}><Trash2 size={14}/></button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="cal-list-panel">
            <div className="cal-section-title" style={{ marginBottom: '16px' }}>{year} SUMMARY</div>
            <div className="cal-summary-grid">
              <div className="cal-summary-card">
                <div className="cal-summary-val">{holidays.length}</div>
                <div className="cal-summary-label">Total holidays</div>
              </div>
              <div className="cal-summary-card">
                <div className="cal-summary-val">{upcomingHolidays.length}</div>
                <div className="cal-summary-label">Remaining</div>
              </div>
              <div className="cal-summary-card">
                <div className="cal-summary-val">{nationalCount}</div>
                <div className="cal-summary-label">National</div>
              </div>
              <div className="cal-summary-card">
                <div className="cal-summary-val">{festivalCount}</div>
                <div className="cal-summary-label">Festival</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HR Add/Edit Modal */}
      {showModal && (
        <div className="cal-modal-overlay">
          <div className="cal-modal">
            <div className="cal-modal-header">
              <h3>{editingId ? "Edit Holiday" : "Add Holiday"}</h3>
              <button className="cal-close-btn" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            
            <div className="cal-form-group">
              <label>Holiday Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Diwali" />
            </div>
            <div className="cal-form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="cal-form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="National">National</option>
                <option value="Festival">Festival</option>
                <option value="Company">Company</option>
              </select>
            </div>

            <div className="cal-modal-footer">
              <button className="cal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cal-btn-save" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
