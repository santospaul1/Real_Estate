import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

export default function Dashboard() {
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [propertyAnalytics, setPropertyAnalytics] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/dashboard/agent-performance/"),
      axios.get("/api/property-analytics/"),
      axios.get("/api/transactions/"),
    ])
      .then(([agentRes, propertyRes, transactionRes]) => {
        setAgentPerformance(agentRes.data);
        setPropertyAnalytics(propertyRes.data);
        setTransactions(transactionRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  // Bar chart: Agent performance
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
        backgroundColor: "rgba(153,102,255,0.6)",
      },
    ],
  };

  // Doughnut: Property status distribution
  const propertyStatusLabels = Object.keys(propertyAnalytics.status_counts || {});
  const propertyStatusData = {
    labels: propertyStatusLabels,
    datasets: [
      {
        data: Object.values(propertyAnalytics.status_counts || {}),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

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

      <section>
        <h2>Recent Transactions</h2>
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Property</th>
              <th>Buyer</th>
              <th>Agent</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.property}</td>
                <td>{t.buyer}</td>
                <td>{t.agent}</td>
                <td>${t.amount}</td>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
