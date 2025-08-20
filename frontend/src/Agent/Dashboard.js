import React from "react";
import { Link } from "react-router-dom";
import TransactionList from "../pages/TransactionList"; // ✅ import your transactions component

export default function AgentDashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar (same style as Admin) */}
      <aside
        style={{
          width: "220px",
          background: "#2c3e50",
          color: "#ecf0f1",
          padding: "20px",
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: "20px" }}>Agent Panel</h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <Link to="/agent/dashboard" style={linkStyle}>
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/properties" style={linkStyle}>
                🏠 My Properties
              </Link>
            </li>
            <li>
              <Link to="/transactions" style={linkStyle}>
                💰 Transactions
              </Link>
            </li>
            <li>
              <Link to="/clients" style={linkStyle}>
                👥 My Clients
              </Link>
            </li>
            <li>
              <Link to="/logout" style={linkStyle}>
                🔐 Logout
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px", background: "#f5f6fa" }}>
        <h1>Agent Dashboard</h1>

        <section style={{ marginTop: "20px" }}>
          <h2>Transactions & Commissions</h2>
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              marginTop: "10px",
            }}
          >
            <TransactionList />
          </div>
        </section>
      </main>
    </div>
  );
}

const linkStyle = {
  color: "#ecf0f1",
  textDecoration: "none",
  display: "block",
  padding: "10px 0",
};
