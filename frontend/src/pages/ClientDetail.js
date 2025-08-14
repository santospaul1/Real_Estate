// src/pages/ClientDetail.js
import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ClientDetail() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // preferences as JSON string for easy editing
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    client_type: 'buyer',
    assigned_agent: '', // user id
    preferences: '{}',  // JSON string to edit
  });

  useEffect(() => {
    async function fetchClient() {
      try {
        setLoading(true);
        const res = await api.get(`clients/${id}/`);
        setClient(res.data);
        setFormData({
          full_name: res.data.full_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          client_type: res.data.client_type || 'buyer',
          assigned_agent: res.data.assigned_agent ? res.data.assigned_agent.id : '',
          preferences: JSON.stringify(res.data.preferences || {}, null, 2),
        });
      } catch (err) {
        setError('Failed to load client');
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let parsedPreferences;
    try {
      parsedPreferences = JSON.parse(formData.preferences);
    } catch {
      setError('Preferences must be valid JSON');
      setSaving(false);
      return;
    }

    try {
      await api.put(`clients/${id}/`, {
        ...formData,
        preferences: parsedPreferences,
      });
      navigate('/clients');
    } catch (err) {
      setError('Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <p>Please login to view this page.</p>;
  if (loading) return <p>Loading client details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Edit Client: {client.full_name}</h1>
      <form onSubmit={handleSubmit}>

        <label>
          Full Name:
          <input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Email:
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />
        </label>
        <br />

        <label>
          Phone:
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Client Type:
          <select
            name="client_type"
            value={formData.client_type}
            onChange={handleChange}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="both">Both</option>
          </select>
        </label>
        <br />

        <label>
          Assigned Agent ID:
          <input
            name="assigned_agent"
            type="number"
            value={formData.assigned_agent}
            onChange={handleChange}
            placeholder="Agent User ID"
          />
        </label>
        <br />

        <label>
          Preferences (JSON):
          <textarea
            name="preferences"
            value={formData.preferences}
            onChange={handleChange}
            rows={6}
            cols={40}
          />
        </label>
        <br />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Client'}
        </button>
      </form>
    </div>
  );
}
