// src/pages/AgentDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const auth = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

export default function AgentDashboard() {
  const [summary, setSummary] = useState(null); // from /api/dashboard/agent-performance/
  const [analytics, setAnalytics] = useState(null); // from /api/property-analytics/ (optional)
  const [txCount, setTxCount] = useState(null); // from /api/transactions/ (optional)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const reqs = [
          axios.get("/api/dashboard/agent-performance/", { headers: auth() }),
        ];

        // Optional endpoints if you enabled them:
        reqs.push(
          axios.get("/api/property-analytics/", { headers: auth() }).catch(() => null)
        );
        reqs.push(
          axios.get("/api/transactions/", { headers: auth() }).catch(() => null)
        );

        const [perfRes, analyticsRes, txRes] = await Promise.all(reqs);

        if (cancelled) return;

        setSummary(perfRes?.data || []);
        setAnalytics(analyticsRes?.data || null);
        setTxCount(Array.isArray(txRes?.data) ? txRes.data.length : null);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const top3 =
    Array.isArray(summary)
      ? [...summary].sort((a, b) => (b.deals_closed || 0) - (a.deals_closed || 0)).slice(0, 3)
      : [];

  return (
    <div style={{ padding: 20 }}>
      <h1>Agent Dashboard</h1>
      {loading && <p>Loading…</p>}

      {!loading && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
            <KpiCard title="Active Agents" value={Array.isArray(summary) ? summary.length : 0} />
            {txCount !== null && <KpiCard title="Total Transactions" value={txCount} />}
            {analytics && (
              <>
                <KpiCard title="Total Properties" value={analytics.total_properties ?? "-"} />
                <KpiCard title="Total Views" value={analytics.total_views ?? "-"} />
                <KpiCard title="Total Inquiries" value={analytics.total_inquiries ?? "-"} />
                <KpiCard title="Avg Time on Market (days)" value={analytics.avg_time_on_market ?? "-"} />
              </>
            )}
          </div>

          <h2>Top Agents (by deals closed)</h2>
          {top3.length === 0 ? (
            <p>No performance data.</p>
          ) : (
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Deals Closed</th>
                  <th>Total Commission</th>
                </tr>
              </thead>
              <tbody>
                {top3.map((a) => (
                  <tr key={a.agent_id}>
                    <td>{a.username}</td>
                    <td>{a.deals_closed}</td>
                    <td>{a.total_commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minWidth: 220 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
