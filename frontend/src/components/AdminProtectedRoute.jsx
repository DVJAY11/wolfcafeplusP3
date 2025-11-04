import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminProtectedRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // or <Spinner />

  if (!user) {
    // not logged in → go to login
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    // logged in but not admin → back home
    return <Navigate to="/" replace />;
  }

  // ✅ logged in as admin → allow access
  return <Outlet />;
}
