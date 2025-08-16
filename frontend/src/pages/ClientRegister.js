import React, { useState } from 'react';
import axios from 'axios';

const ClientRegister = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    preferences: '{}',
    client_type: 'buyer',
    assigned_agent: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const preferencesObj = JSON.parse(form.preferences || '{}');
      await axios.post('/api/register-client/', { ...form, preferences: preferencesObj });
      alert('Client registered successfully');
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="full_name" placeholder="Full Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <textarea name="preferences" placeholder='{"beds":3,"budget_max":5000000}' onChange={handleChange} />
      <select name="client_type" onChange={handleChange}>
        <option value="buyer">Buyer</option>
        <option value="seller">Seller</option>
        <option value="both">Both</option>
      </select>
      <input name="assigned_agent" placeholder="Agent ID (optional)" onChange={handleChange} />
      <button type="submit">Register Client</button>
    </form>
  );
};

export default ClientRegister;
