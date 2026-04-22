import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Contact from "./pages/Contact";

import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";

import RegisterPage from "./pages/RegisterPage";
import SecurityPage from "./pages/SecurityPage";

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

      </Routes>
    </BrowserRouter>
  );
}

export default App;