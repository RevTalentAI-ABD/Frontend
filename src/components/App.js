import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage   from "./LoginPage";
import HRDashboard from "./HRDashboard";

function AppInner() {
  const { user } = useAuth();
  return user ? <HRDashboard /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
