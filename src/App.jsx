import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage            from "./pages/LandingPage";
import About                  from "./pages/About";
import Contact                from "./pages/Contact";
import LoginPage              from "./pages/LoginPage";
import ForgotPassword         from "./pages/ForgotPassword";
import RegisterPage           from "./pages/RegisterPage";
import SecurityPage           from "./pages/SecurityPage";
import ManagerDashboard       from "./pages/ManagerDashboard";
import EmployeeDashboard      from "./pages/EmployeeDashboard";
import HRDashboard            from "./components/HRDashboard";
import PublicJobBoard         from "./pages/PublicJobBoard";
import ApplyForm              from "./pages/ApplyForm";
import CandidateRegisterPage  from "./pages/CandidateRegisterPage";
import CandidateLoginPage     from "./pages/CandidateLoginPage";
import CandidateDashBoardPage from "./pages/CandidateDashBoardPage";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token) {
    // Send candidates back to candidate login, everyone else to /login
    return <Navigate to={allowedRole === "CANDIDATE" ? "/candidate-login" : "/login"} replace />;
  }
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={allowedRole === "CANDIDATE" ? "/candidate-login" : "/login"} replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"                   element={<LandingPage />} />
        <Route path="/about"              element={<About />} />
        <Route path="/contact"            element={<Contact />} />

        {/* Public Job Board */}
        <Route path="/jobs"               element={<PublicJobBoard />} />
        <Route path="/jobs/:jobId/apply"  element={<ApplyForm />} />

        {/* HR / Employee Auth */}
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/forgot-password"    element={<ForgotPassword />} />
        <Route path="/register"           element={<RegisterPage />} />
        <Route path="/security"           element={<SecurityPage />} />

        {/* Candidate Auth */}
        <Route path="/candidate-register" element={<CandidateRegisterPage />} />
        <Route path="/candidate-login"    element={<CandidateLoginPage />} />

        {/* Candidate Dashboard — protected */}
        <Route path="/candidate/dashboard" element={
          <ProtectedRoute allowedRole="CANDIDATE">
            <CandidateDashBoardPage />
          </ProtectedRoute>
        } />

        {/* Manager Dashboard */}
        <Route path="/managerdashboard" element={
          <ProtectedRoute allowedRole="MANAGER">
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        {/* Employee Dashboard */}
        <Route path="/employee-dashboard" element={
          <ProtectedRoute allowedRole="EMPLOYEE">
            <EmployeeDashboard />
          </ProtectedRoute>
        } />

        {/* HR Dashboard */}
        <Route path="/hr-dashboard" element={
          <ProtectedRoute allowedRole="HR_ADMIN">
            <HRDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;