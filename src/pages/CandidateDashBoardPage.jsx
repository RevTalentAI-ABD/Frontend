import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CandidateDashBoardPage.css";

import CandidateDashboardHome     from "../components/candidate/CandidateDashboardHome";
import CandidateApplications      from "../components/candidate/CandidateApplications";
import CandidateOpenPositions     from "../components/candidate/CandidateOpenPositions";
import CandidateInterviews        from "../components/candidate/CandidateInterviews";
import CandidateProfile           from "../components/candidate/CandidateProfile";
import CandidateSidebar           from "../components/candidate/CandidateSidebar";

import { getApiBase } from "../utils/apiBase";

const API_BASE = getApiBase();

const safeFetch = async (url) => {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 401) return { unauthorized: true };
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export default function CandidateDashBoardPage() {
  const navigate             = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");

  const [candidate,     setCandidate]     = useState(null);
  const [applications,  setApplications]  = useState([]);
  const [interview,     setInterview]     = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  const handleLogout = () => {
    ["token", "role", "user", "name"].forEach(k => localStorage.removeItem(k));
    navigate("/");
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const profileData = await safeFetch(`${API_BASE}/candidate/profile`);
      if (profileData?.unauthorized) { handleLogout(); return; }
      if (profileData) {
        setCandidate(profileData);
      } else {
        try { setCandidate(JSON.parse(localStorage.getItem("user") || "{}")); } catch {}
      }

      const appData = await safeFetch(`${API_BASE}/candidate/applications`);
      if (appData && !appData.unauthorized)
        setApplications(Array.isArray(appData) ? appData : appData.content || []);

      const ivData = await safeFetch(`${API_BASE}/candidate/interviews/upcoming`);
      if (ivData && !ivData.unauthorized)
        setInterview(Array.isArray(ivData) ? ivData[0] ?? null : ivData ?? null);

      const notifData = await safeFetch(`${API_BASE}/candidate/notifications`);
      if (notifData && !notifData.unauthorized)
        setNotifications(Array.isArray(notifData) ? notifData.slice(0, 4) : []);

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="cd-loading">
      <div className="cd-spinner" />
      <p>Loading your dashboard…</p>
    </div>
  );

  const sharedProps = { candidate, applications, interview, notifications, setActiveNav };

  const renderPage = () => {
    switch (activeNav) {
      case "applications": return <CandidateApplications {...sharedProps} />;
      case "positions":    return <CandidateOpenPositions {...sharedProps} />;
      case "interviews":   return <CandidateInterviews {...sharedProps} />;
      case "profile":      return <CandidateProfile {...sharedProps} />;
      default:             return <CandidateDashboardHome {...sharedProps} />;
    }
  };

  return (
    <div className="cd-shell">
      <CandidateSidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        candidate={candidate}
        onLogout={handleLogout}
      />
      <main className="cd-main">
        {renderPage()}
      </main>
    </div>
  );
}