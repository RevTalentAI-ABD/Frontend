import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage       from "./pages/LandingPage";
import About             from "./pages/About";
import Contact           from "./pages/Contact";
import LoginPage         from "./pages/LoginPage";
import ForgotPassword    from "./pages/ForgotPassword";
import RegisterPage      from "./pages/RegisterPage";
import SecurityPage      from "./pages/SecurityPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";


const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<LandingPage />} />
        <Route path="/about"            element={<About />} />
        <Route path="/contact"          element={<Contact />} />
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/security"         element={<SecurityPage />} />


        <Route path="/employee-dashboard" element={
          <ProtectedRoute allowedRole="EMPLOYEE">
            <EmployeeDashboard />
          </ProtectedRoute>
        } />

        <Route path="/manager-dashboard" element={
          <ProtectedRoute allowedRole="MANAGER">
            <div>Manager Dashboard — Coming Soon</div>
          </ProtectedRoute>
        } />

        <Route path="/hr-dashboard" element={
          <ProtectedRoute allowedRole="HRADMIN">
            <div>HR Admin Dashboard — Coming Soon</div>
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;