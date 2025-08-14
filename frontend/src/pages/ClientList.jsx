// src/pages/ClientList.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const auth = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [clientTypeFilter, setClientTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    axios
      .get("/api/clients/", { headers: auth() })
      .then((res) => {
        if (!cancelled) setClients(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Failed to load clients.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleClients = useMemo(() => {
    if (!clientTypeFilter) return clients;
    return clients.filter((c) => (c.client_type || "").toLowerCase() === clientTypeFilter);
  }, [clients, clientTypeFilter]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Clients</h1>

      <div style={{ margin: "12px 0" }}>
        <label>
          Filter by type:&nbsp;
          <select
            value={clientTypeFilter}
            onChange={(e) => setClientTypeFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="both">Both</option>
          </select>
        </label>
      </div>

      {loading && <p>Loading clients…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && visibleClients.length === 0 && <p>No clients found.</p>}

      <ul>
        {visibleClients.map((client) => (
          <li key={client.id}>
            <strong>{client.full_name}</strong> — {client.client_type || "n/a"}
            {client.email ? ` — ${client.email}` : ""}
            {"  "}
            <Link to={`/clients/${client.id}`}>View</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
