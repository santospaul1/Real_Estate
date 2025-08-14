// src/pages/RegisterClient.jsx
import React, { useState } from "react";
import { registerClient } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterClient() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [ok, setOk]             = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setOk("");
    try {
      await registerClient(fullName, email, password);
      setOk("Registration successful! You are logged in as client.");
      setTimeout(()=> nav("/client"), 800);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 420, margin: "40px auto" }}>
      <h2>Client Registration</h2>
      {error && <p style={{ color:"red" }}>{error}</p>}
      {ok && <p style={{ color:"green" }}>{ok}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e)=>setFullName(e.target.value)}
          required
          style={{ width:"100%", marginBottom: 8 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
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
        <button type="submit">Register</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
