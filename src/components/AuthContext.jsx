import React, { createContext, useContext, useState, useCallback } from "react";
import { authAPI } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError("");
    try {
      const res = await authAPI.login(credentials);
      const data = res.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("role",  data.role);
      localStorage.setItem("name",  data.name);
      localStorage.setItem("user",  JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message
        || (typeof err.response?.data === "string" ? err.response.data : null)
        || "Invalid credentials";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // logout does NOT call navigate() — callers handle redirect themselves.
  // This keeps AuthProvider safe to render at any level relative to <Router>.
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // Convenience: save auth payload coming from OTP / magic-link verify responses
  const saveAuthData = useCallback((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role",  data.role);
    localStorage.setItem("name",  data.name);
    localStorage.setItem("user",  JSON.stringify(data));
    setUser(data);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, saveAuthData, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

export default null;