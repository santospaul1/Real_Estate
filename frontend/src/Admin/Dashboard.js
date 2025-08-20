// src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { Link } from "react-router-dom";
import TransactionList from "../pages/TransactionList"; 

export default function AdminDashboard() {
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [propertyAnalytics, setPropertyAnalytics] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/reports/detailed-agent-performance/"),
      axios.get("/api/reports/property-pricing-analysis/"),
      axios.get("/api/transactions/"),
    ])
      .then(([agentRes, propertyRes, transactionRes]) => {
        setAgentPerformance(agentRes.data);
        setPropertyAnalytics(propertyRes.data);
        setTransactions(transactionRes.data);
      })
      .catch((err) => console.error("Error loading dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  // ================= Charts ===================
  const agentNames = agentPerformance.map((a) => a.username);
  const dealsClosed = agentPerformance.map((a) => a.deals_closed);
  const commissions = agentPerformance.map((a) => a.total_commission);

  const agentDealsData = {
    labels: agentNames,
    datasets: [
      {
        label: "Deals Closed",
        data: dealsClosed,
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  const commissionData = {
    labels: agentNames,
    datasets: [
      {
        label: "Total Commission",
        data: commissions,
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.3)",
        fill: true,
      },
    ],
  };

  const propertyStatusLabels = Object.keys(
    propertyAnalytics.status_counts || {}
  );
  const propertyStatusData = {
    labels: propertyStatusLabels,
    datasets: [
      {
        data: Object.values(propertyAnalytics.status_counts || {}),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4CAF50"],
      },
    ],
  };

  // ================= Download Handlers ===================
  const downloadReport = (format) => {
    window.open(`/api/reports/custom-report/?format=${format}`, "_blank");
  };

  const downloadCSV = () => {
    window.open("/api/reports/export-sales-csv/", "_blank");
  };

  // ================= Render ===================
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#2c3e50",
          color: "#ecf0f1",
          padding: "20px",
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: "20px" }}>Admin Panel</h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><Link to="/admin/dashboard" style={linkStyle}>📊 Dashboard</Link></li>
            <li><Link to="/communications" style={linkStyle}>💬 Communications</Link></li>
            <li><Link to="/agents" style={linkStyle}>👥 Manage Agents</Link></li>
            <li><Link to="/clients" style={linkStyle}>🧑‍💼 Manage Clients</Link></li>
            <li><Link to="/properties" style={linkStyle}>🏠 Properties</Link></li>
            <li><Link to="/transactions" style={linkStyle}>💰 Transactions</Link></li>
            <li><Link to="/logout" style={linkStyle}>🔐 Logout</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px", background: "#f5f6fa" }}>
        <h1>Admin Dashboard</h1>

        {/* Download Reports Section */}
        <section style={{ marginBottom: "40px" }}>
          <h2>📑 Download Reports</h2>
          <button onClick={() => downloadReport("pdf")} style={btnStyle}>⬇️ Download PDF</button>
          <button onClick={() => downloadReport("excel")} style={btnStyle}>⬇️ Download Excel</button>
          <button onClick={downloadCSV} style={btnStyle}>⬇️ Download CSV</button>
        </section>
        
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
        <section style={{ marginBottom: "40px" }}>
          <h2>Agent Deals</h2>
          <Bar data={agentDealsData} />
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2>Agent Commissions</h2>
          <Line data={commissionData} />
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2>Property Status Distribution</h2>
          <Doughnut data={propertyStatusData} />
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

const btnStyle = {
  marginRight: "10px",
  padding: "10px 15px",
  border: "none",
  borderRadius: "5px",
  background: "#3498db",
  color: "#fff",
  cursor: "pointer",
};
