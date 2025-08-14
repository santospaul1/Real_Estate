import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function LeadList() {
  const { user } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        const res = await api.get('leads/');
        setLeads(res.data);
      } catch {
        setError('Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  if (!user) return <p>Please log in to view leads.</p>;

  return (
    <div>
      <h1>Leads</h1>
      <Link to="/leads/add">Add New Lead</Link>
      {loading && <p>Loading leads...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Preferred Location</th>
            <th>Budget</th>
            <th>Stage</th>
            <th>Assigned Agent</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id}>
              <td>{lead.full_name}</td>
              <td>{lead.email || '-'}</td>
              <td>{lead.phone || '-'}</td>
              <td>{lead.preferred_location || '-'}</td>
              <td>{lead.budget ? `$${lead.budget.toLocaleString()}` : '-'}</td>
              <td>{lead.stage}</td>
              <td>{lead.assigned_to ? lead.assigned_to : 'Unassigned'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
