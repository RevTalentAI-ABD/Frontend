import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Login from "./Login";
import HRDashboard from "./HRDashboard";

function App() {
  return (
    <Router>
      {/* ✅ AuthProvider is INSIDE Router so useNavigate works */}
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/hr-dashboard" element={<HRDashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;