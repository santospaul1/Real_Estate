import React, { useState } from "react";
import { login, getUserProfile } from "../services/authService"; 
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // 1. Login & store JWT/refresh
      await login(username, password);

      // 2. Fetch role (via /me endpoint OR decode JWT)
      const profile = await getUserProfile(); 
      const role = profile.role;  

      // 3. Redirect based on role
      if (role === "admin") {
        nav("/admin/dashboard");
      } else if (role === "client") {
        nav("/client/dashboard");
      } else if (role === "agent") {
        nav("../Dashboard");
      } 
       else {
        nav("/"); // fallback
      }

    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 420, margin: "40px auto" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          required
          style={{ width:"100%", marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
          style={{ width:"100%", marginBottom: 8 }}
        />
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: 12 }}>
        New client? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
