// src/pages/ClientRegister.js
import React, { useState } from "react";
import api from "../api/axios";

export default function ClientRegister() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    company_name: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/clients/register/", formData);
      setMessage("✅ Client registered successfully!");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.detail || "Registration failed"));
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Client Registration</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="company_name" placeholder="Company Name" onChange={handleChange} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
