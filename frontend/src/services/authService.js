// src/services/authService.js
const API = "http://127.0.0.1:8000/api";

export async function login(email, password, role) {
  const res = await fetch(`${API}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password, role })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("role", data.role);
  localStorage.setItem("username", data.username);
  return data;
}

export async function registerClient(full_name, email, password) {
  const res = await fetch(`${API}/auth/register-client/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");

  // optional: auto store tokens from registration
  if (data.access) {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", data.username);
  }
  return data;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
}

export function getAccessToken() {
  return localStorage.getItem("access");
}

export function getRole() {
  return localStorage.getItem("role");
}
