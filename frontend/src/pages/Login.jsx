import React, { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState(""); // changed from email
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(username, password, role); // send username instead of email
      if (res.role === "admin") nav("../Dashboard");
      else if (res.role === "agent") nav("/agent/dashboard");
      else nav("/properties");
    } catch (err) {
      setError(err.message);
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
        <select value={role} onChange={(e)=>setRole(e.target.value)} style={{ width:"100%", marginBottom: 8 }}>
          <option value="client">Client</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: 12 }}>
        New client? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
