// src/pages/ClientList.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
//import "./ClientList.css"; // 👈 import CSS file

const auth = () => ({
  Authorization: "Bearer " + localStorage.getItem("accessToken"),
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
    return clients.filter(
      (c) => (c.client_type || "").toLowerCase() === clientTypeFilter
    );
  }, [clients, clientTypeFilter]);

  return (
    <div className="page-container">
      <h1 className="page-title">Clients</h1>

      <div className="filter-container">
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

      {loading && <p className="loading">Loading clients…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && visibleClients.length === 0 && (
        <p className="empty">No clients found.</p>
      )}

      <table className="styled-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visibleClients.map((client) => (
            <tr key={client.id}>
              <td data-label="Name">{client.full_name}</td>
              <td data-label="Type">{client.client_type || "n/a"}</td>
              <td data-label="Email">{client.email || "-"}</td>
              <td data-label="Action">
                <Link className="view-link" to={`/clients/${client.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
