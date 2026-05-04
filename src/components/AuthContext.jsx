import React, { createContext, useContext, useState } from "react";
import { authAPI } from "./api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hr_user"));
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ LOGIN
  const login = async (credentials) => {
    setLoading(true);
    setError("");

    try {
      const res = await authAPI.login(credentials);

      const { token, employee, role } = res.data;

      localStorage.setItem("hr_token", token);

      const userData = { ...employee, role };
      localStorage.setItem("hr_user", JSON.stringify(userData));

      setUser(userData);

      navigate("/hr-dashboard");

      return userData;
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("hr_token");
    localStorage.removeItem("hr_user");

    setUser(null);

    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ SAFE HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};