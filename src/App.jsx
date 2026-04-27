import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HRDashboard from "./pages/HRDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/hr" element={<HRDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;