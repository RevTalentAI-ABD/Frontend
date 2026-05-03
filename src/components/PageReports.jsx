import React from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { StatCard, Spinner, ErrorState } from "./UI";
import {
  TrendingUp,
  LogOut,
  CalendarDays,
  Star
} from "lucide-react";

// 🔥 SIMPLE FETCH (NO CONFUSION)
function useFetch(url) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("API ERROR: " + res.status);
        return res.json();
      })
      .then(setData)
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

export default function PageReports() {

  // ✅ FULL URLs (IMPORTANT)
  const { data: summary, loading: l1, error: e1 } =
    useFetch("http://localhost:8080/api/manager/reports/summary");

  const { data: attendance, loading: l2 } =
    useFetch("http://localhost:8080/api/manager/reports/attendance");

  const { data: productivity, loading: l3 } =
    useFetch("http://localhost:8080/api/manager/reports/productivity");

  const { data: team, loading: l4 } =
    useFetch("http://localhost:8080/api/manager/reports/team-summary");

  const loading = l1 || l2 || l3 || l4;
  if (loading) return <Spinner />;
  if (e1) return <ErrorState message={e1} />;

  // ===============================
  // 🔥 NORMALIZATION
  // ===============================

  const headcountChart = team?.monthlyTrend
    ? team.monthlyTrend.map(d => ({
        month: d.month,
        count: d.count
      }))
    : [];

  const productivityChart = productivity?.data
    ? productivity.data.map(d => ({
        month: d.month,
        rate: d.value
      }))
    : [];

  const attendanceChart = attendance?.departments
    ? attendance.departments.map(d => ({
        dept: d.name,
        pct: d.percentage
      }))
    : [];

  // ===============================
  // 🎯 STATS
  // ===============================

  const totalEmployees = summary?.totalEmployees || 0;
  const attritionRate = summary?.attritionRate || 0;
  const avgAttendance = summary?.avgAttendance || 0;
  const productivityScore = summary?.productivity || 0;

  return (
    <div className="hr-page">

      <div className="hr-page-header-row">
        <h2 className="hr-page-heading">Reports & Analytics</h2>
      </div>

      {/* 🔥 STATS */}
      <div className="hr-stats-grid">
        <StatCard icon={<TrendingUp size={18} />} label="Total Employees" value={totalEmployees} color="#10b981" />
        <StatCard icon={<LogOut size={18} />} label="Attrition Rate" value={`${attritionRate}%`} color="#ef4444" />
        <StatCard icon={<CalendarDays size={18} />} label="Avg Attendance" value={`${avgAttendance}%`} color="#7c5af0" />
        <StatCard icon={<Star size={18} />} label="Productivity" value={`${productivityScore}`} color="#f59e0b" />
      </div>

      {/* 📊 CHARTS */}
      <div className="hr-two-col">

        {/* Headcount */}
        <div className="hr-panel">
          <h3 className="hr-panel-title">Headcount Trend</h3>
          {headcountChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={headcountChart}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#f59e0b" fill="#f59e0b33" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="hr-empty-state">No data available</div>}
        </div>

        {/* Productivity */}
        <div className="hr-panel">
          <h3 className="hr-panel-title">Productivity Trend</h3>
          {productivityChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={productivityChart}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#7c5af0" />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="hr-empty-state">No data available</div>}
        </div>

      </div>

      {/* Attendance */}
      <div className="hr-panel">
        <h3 className="hr-panel-title">Attendance by Department</h3>
        {attendanceChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceChart}>
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pct">
                {attendanceChart.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.pct >= 90
                        ? "#10b981"
                        : d.pct >= 75
                        ? "#f59e0b"
                        : "#ef4444"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="hr-empty-state">No data available</div>}
      </div>

    </div>
  );
}