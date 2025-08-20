const API = "http://127.0.0.1:8000/api";

// Login with JWT (no roles, only username & password)
export async function login(username, password) {
  const res = await fetch(`${API}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");

  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("username", username);

  return data;
}

// Register client
export async function registerClient(full_name, email, password) {
  const res = await fetch(`${API}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");

  // auto-login after registration
  if (data.access) {
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("username", data.username);
  }
  return data;
}

// Logout
export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("username");
}

// Helpers
export function getAccessToken() {
  return localStorage.getItem("access");
}

export function getUsername() {
  return localStorage.getItem("username");
}

// src/services/authService.js
import api from "../api/axios";

export async function getUserProfile() {
  try {
    const res = await api.get("http://127.0.0.1:8000/api/users/me");   // adjust to your backend endpoint
    return res.data;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    throw err;
  }
}

