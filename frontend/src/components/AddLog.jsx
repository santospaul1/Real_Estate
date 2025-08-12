import React, { useState } from 'react';
import axios from 'axios';

const AddLog = ({ leadId = null, clientId = null }) => {
  const [note, setNote] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      note,
      recorded_by: 1, // Replace with logged-in user ID if available
    };
    if (leadId) payload.related_lead = leadId;
    if (clientId) payload.related_client = clientId;

    axios.post('/api/logs/', payload, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(() => {
      alert("Log added");
      setNote('');
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={note} onChange={e => setNote(e.target.value)} required />
      <button type="submit">Add Log</button>
    </form>
  );
};

export default AddLog;
