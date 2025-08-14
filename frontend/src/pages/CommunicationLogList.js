// src/pages/CommunicationList.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const auth = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

export default function CommunicationList() {
  const [items, setItems] = useState([]);
  const [direction, setDirection] = useState("");
  const [recordedBy, setRecordedBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = () => {
    setLoading(true);
    setError("");
    const params = {};
    if (direction) params.direction = direction;
    if (recordedBy) params.recorded_by = recordedBy;

    axios
      .get("/api/communications/", { headers: auth(), params })
      .then((res) => setItems(res.data || []))
      .catch((err) => {
        console.error(err);
        setError("Failed to load communications.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [direction, recordedBy]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Communications</h1>

      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <label>
          Direction:&nbsp;
          <select value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="">All</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </label>

        <label>
          Recorded by (username):&nbsp;
          <input
            value={recordedBy}
            onChange={(e) => setRecordedBy(e.target.value)}
            placeholder="e.g. alice"
          />
        </label>
      </div>

      {loading && <p>Loading communications…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && items.length === 0 && <p>No communications found.</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Client (id)</th>
            <th>Direction</th>
            <th>Recorded By</th>
            <th>Note</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.related_client ?? "-"}</td>
              <td>{c.direction}</td>
              <td>{c.recorded_by ?? "-"}</td>
              <td style={{ maxWidth: 500 }}>{c.note}</td>
              <td>{new Date(c.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
