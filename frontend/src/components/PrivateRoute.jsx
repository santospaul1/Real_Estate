// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  // Check if access token exists
  const accessToken = localStorage.getItem('access_token');

  // If no token, redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render children (protected component)
  return children;
}
