// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, getRole } from "../services/authService";

export default function ProtectedRoute({ children, allowRoles = [] }) {
  const token = getAccessToken();
  const role = getRole();

  if (!token) return <Navigate to="/login" replace />;
  if (allowRoles.length && !allowRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
