// src/pages/LeadDetail.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';


export default function LeadDetail() {
  
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Editable fields state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    preferred_location: '',
    budget: '',
    timeline_days: '',
    stage: '',
    assigned_to: '', // user id of agent
  });

  // Fetch lead details on mount
  useEffect(() => {
    async function fetchLead() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/leads/${id}/`);
        setLead(res.data);
        setFormData({
          full_name: res.data.full_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          preferred_location: res.data.preferred_location || '',
          budget: res.data.budget || '',
          timeline_days: res.data.timeline_days || '',
          stage: res.data.stage || 'lead',
          assigned_to: res.data.assigned_to ? res.data.assigned_to.id : '',
        });
      } catch (err) {
        setError('Failed to load lead');
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axios.put(`/api/leads/${id}/`, formData);
      navigate('/leads');  // back to leads list after save
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  //if (!user) return <p>Please login to view this page.</p>;
  if (loading) return <p>Loading lead details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Edit Lead: {lead.full_name}</h1>
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
          Preferred Location:
          <input
            name="preferred_location"
            value={formData.preferred_location}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Budget:
          <input
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            min="0"
          />
        </label>
        <br />

        <label>
          Timeline (days):
          <input
            name="timeline_days"
            type="number"
            value={formData.timeline_days}
            onChange={handleChange}
            min="0"
          />
        </label>
        <br />

        <label>
          Stage:
          <select name="stage" value={formData.stage} onChange={handleChange}>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="client">Client</option>
          </select>
        </label>
        <br />

        <label>
          Assigned Agent ID:
          <input
            name="assigned_to"
            type="number"
            value={formData.assigned_to}
            onChange={handleChange}
            placeholder="Agent User ID"
          />
        </label>
        <br />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
