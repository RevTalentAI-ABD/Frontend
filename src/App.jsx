import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";

import LandingPage       from "./pages/LandingPage";
import About             from "./pages/About";
import Contact           from "./pages/Contact";
import LoginPage         from "./pages/LoginPage";
import ForgotPassword    from "./pages/ForgotPassword";
import RegisterPage      from "./pages/RegisterPage";
import SecurityPage      from "./pages/SecurityPage";
import ManagerDashboard  from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import HRDashboard       from "./components/HRDashboard";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<LandingPage />} />
        <Route path="/about"           element={<About />} />
        <Route path="/contact"         element={<Contact />} />

        <Route path="/login"           element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/security"        element={<SecurityPage />} />

        <Route path="/managerdashboard" element={
          <ProtectedRoute allowedRole="MANAGER">
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/employee-dashboard" element={
          <ProtectedRoute allowedRole="EMPLOYEE">
            <EmployeeDashboard />
          </ProtectedRoute>
        } />

        <Route path="/hr-dashboard" element={
          <AuthProvider>
            <ProtectedRoute allowedRole="HR_ADMIN">
              <HRDashboard />
            </ProtectedRoute>
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;