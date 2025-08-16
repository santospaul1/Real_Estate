import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    client_type: 'buyer',
    assigned_agent: '',
    preferences: '{}'
  });

  useEffect(() => {
    axios.get(`/api/clients/${id}/`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(res => {
      setFormData({
        full_name: res.data.full_name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        client_type: res.data.client_type || 'buyer',
        assigned_agent: res.data.assigned_agent ? res.data.assigned_agent.id : '',
        preferences: JSON.stringify(res.data.preferences || {}, null, 2)
      });
    })
    .catch(err => console.error(err));
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    let parsedPreferences;
    try {
      parsedPreferences = JSON.parse(formData.preferences);
    } catch {
      alert('Preferences must be valid JSON');
      return;
    }

    axios.put(`/api/clients/${id}/`, {
      ...formData,
      preferences: parsedPreferences
    }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(() => navigate('/clients'))
    .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Edit Client</h2>
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

        <button type="submit">Save Client</button>
      </form>
    </div>
  );
};

export default ClientDetail;
