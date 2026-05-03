// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import LandingPage from "./pages/LandingPage";
// import About from "./pages/About";
// import Contact from "./pages/Contact";

// import LoginPage from "./pages/LoginPage";
// import ForgotPassword from "./pages/ForgotPassword";

// import RegisterPage from "./pages/RegisterPage";
// import SecurityPage from "./pages/SecurityPage";
// import ManagerDashboard from "./pages/ManagerDashboard";
// import EmployeeDashboard from "./pages/EmployeeDashboard";


// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* Common Pages */}
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/contact" element={<Contact />} />

//         {/* Auth Pages */}
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />

//         {/* Register Flow */}
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/security" element={<SecurityPage />} /> 
//         <Route path="/managerdashboard" element={<ManagerDashboard />} />
//         <Route path="/employee-dashboard" element={<EmployeeDashboard />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage       from "./pages/LandingPage";
import About             from "./pages/About";
import Contact           from "./pages/Contact";
import LoginPage         from "./pages/LoginPage";
import ForgotPassword    from "./pages/ForgotPassword";
import RegisterPage      from "./pages/RegisterPage";
import SecurityPage      from "./pages/SecurityPage";
import ManagerDashboard  from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

// Simple guard – redirects to /login if no token
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/about"          element={<About />} />
        <Route path="/contact"        element={<Contact />} />

        {/* Auth pages */}
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/security"       element={<SecurityPage />} />

        {/* Protected dashboards */}
        {/* <Route
          path="/managerdashboard"
          element={
            <ProtectedRoute>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        /> */}
        <Route path="/managerdashboard" element={<ManagerDashboard />} />
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
