import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import SecurityPage from "./pages/SecurityPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h2>Landing </h2>} />
        <Route path="/login" element={<h1>Login</h1>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
