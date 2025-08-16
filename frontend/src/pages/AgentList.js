// src/pages/AgentList.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const auth = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

export default function AgentList() {
  const [agents, setAgents] = useState([]);            // /api/agentprofiles/
  const [perf, setPerf] = useState([]);                // /api/dashboard/agent-performance/
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      axios.get("/agentprofiles/", { headers: auth() }),
      axios.get("/api/dashboard/agent-performance/", { headers: auth() }),
    ])
      .then(([aRes, pRes]) => {
        if (cancelled) return;
        setAgents(aRes.data || []);
        setPerf(pRes.data || []);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Failed to load agents/performance.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const perfByAgentId = useMemo(() => {
    const m = new Map();
    (perf || []).forEach((p) => m.set(p.agent_id, p));
    return m;
  }, [perf]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Agents & Performance</h1>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && agents.length === 0 && <p>No agents found.</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Specialization</th>
            <th>Territory</th>
            <th>Phone</th>
            <th>Active</th>
            <th>Deals Closed</th>
            <th>Total Commission</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((ag) => {
            const p = perfByAgentId.get(ag.id);
            return (
              <tr key={ag.id}>
                <td>{ag.id}</td>
                <td>{ag.user}</td>
                <td>{ag.specialization || "-"}</td>
                <td>{ag.territory || "-"}</td>
                <td>{ag.phone || "-"}</td>
                <td>{ag.active ? "Yes" : "No"}</td>
                <td>{p ? p.deals_closed : 0}</td>
                <td>{p ? p.total_commission : 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
