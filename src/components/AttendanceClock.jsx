import React, { useState, useEffect, useRef } from "react";
import api from "../api/axiosConfig";
import { Play, Square, CheckCircle } from "lucide-react";

export default function AttendanceClock({ employeeId, onAttendanceUpdate }) {
  const [status, setStatus] = useState("loading"); // loading, not_clocked_in, clocked_in, clocked_out
  const [elapsed, setElapsed] = useState(0);
  const [checkInTime, setCheckInTime] = useState(null);
  const [durationMin, setDurationMin] = useState(0);
  const timerRef = useRef(null);

  const fetchTodayAttendance = async () => {
    if (!employeeId) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await api.get(`/api/attendance/employee/${employeeId}/range?from=${today}&to=${today}`);
      const records = res.data;

      if (!records || records.length === 0) {
        setStatus("not_clocked_in");
        return;
      }

      const todayRecord = records[0];
      if (todayRecord.checkIn && !todayRecord.checkOut) {
        setCheckInTime(new Date(todayRecord.checkIn));
        setStatus("clocked_in");
      } else if (todayRecord.checkOut) {
        setStatus("clocked_out");
        setDurationMin(todayRecord.durationMin || 0);
      }
    } catch (err) {
      console.error("Failed to fetch today's attendance", err);
      setStatus("not_clocked_in");
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
    return () => clearInterval(timerRef.current);
  }, [employeeId]);

  useEffect(() => {
    if (status === "clocked_in" && checkInTime) {
      // Calculate elapsed time from checkInTime
      const now = new Date();
      const diffInSeconds = Math.floor((now - checkInTime) / 1000);
      setElapsed(diffInSeconds > 0 ? diffInSeconds : 0);

      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [status, checkInTime]);

  const handleClockIn = async () => {
    try {
      await api.post(`/api/attendance/employee/${employeeId}/checkin`, {
        attendanceType: "WFO"
      });
      setCheckInTime(new Date());
      setStatus("clocked_in");
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err) {
      const msg = err.response?.data;
      const msgStr = typeof msg === "string" ? msg : JSON.stringify(msg);
      alert("Clock in failed: " + msgStr);
    }
  };

  const handleClockOut = async () => {
    try {
      await api.put(`/api/attendance/employee/${employeeId}/checkout`);
      clearInterval(timerRef.current);
      fetchTodayAttendance(); // Re-fetch to get durationMin and confirm checkout
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err) {
      const msg = err.response?.data;
      const msgStr = typeof msg === "string" ? msg : JSON.stringify(msg);
      alert("Clock out failed: " + msgStr);
    }
  };

  const formatElapsed = (s) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const formatHoursMin = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  if (status === "loading" || !employeeId) {
    return <div style={{ opacity: 0.5, fontSize: "14px", color: "#9b96b8" }}>Loading clock...</div>;
  }

  if (status === "clocked_out") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.1)", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
        <CheckCircle size={16} color="#10b981" />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "14px", color: "#10b981", fontWeight: 600 }}>Clocked Out</div>
          <div style={{ fontSize: "12px", color: "rgba(16, 185, 129, 0.8)" }}>Total time: {formatHoursMin(durationMin)}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {status === "clocked_in" && (
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "monospace", fontSize: "18px", color: "#7c5af0", fontWeight: 700 }}>
            {formatElapsed(elapsed)}
          </div>
          {checkInTime && (
            <div style={{ fontSize: "11px", color: "#9b96b8" }}>
              Since {checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={status === "clocked_in" ? handleClockOut : handleClockIn}
        style={{
          background: status === "clocked_in" ? "#ef4444" : "#7c5af0",
          color: "white",
          border: "none",
          borderRadius: "10px",
          padding: "10px 20px",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transition: "background 0.2s"
        }}
      >
        {status === "clocked_in" ? (
          <><Square size={14} /> Clock Out</>
        ) : (
          <><Play size={14} /> Clock In</>
        )}
      </button>
    </div>
  );
}
