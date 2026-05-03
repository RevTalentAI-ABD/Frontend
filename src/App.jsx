import { BrowserRouter, Routes, Route } from "react-router-dom";

/* ===== COMMON PAGES ===== */
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Contact from "./pages/Contact";

/* ===== AUTH PAGES ===== */
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";

/* ===== REGISTER FLOW ===== */
import RegisterPage from "./pages/RegisterPage";
import SecurityPage from "./pages/SecurityPage";

/* ===== HR MODULE (FIXED PATH) ===== */
import HRDashboard from "./components/HRDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Common Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Register Flow */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/security" element={<SecurityPage />} />

        {/* HR DASHBOARD */}
        <Route path="/hr" element={<HRDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;