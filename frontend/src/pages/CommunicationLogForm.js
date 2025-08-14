// src/pages/CommunicationLogForm.js
import React, { useState, useContext } from 'react';
import api from '../api/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function CommunicationLogForm() {
  const { user } = useContext(AuthContext);
  const [note, setNote] = useState('');
  const [direction, setDirection] = useState('outbound');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Either related_client or related_lead required
  const relatedClient = searchParams.get('client');
  const relatedLead = searchParams.get('lead');

  if (!relatedClient && !relatedLead) {
    return <p>Error: Specify related client or lead as query param (e.g. ?client=1)</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await api.post('communicationlogs/', {
        note,
        direction,
        related_client: relatedClient || null,
        related_lead: relatedLead || null,
      });
      navigate(`/communicationlogs?${relatedClient ? `client=${relatedClient}` : `lead=${relatedLead}`}`);
    } catch {
      setError('Failed to save communication log');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <p>Please login to add communication logs.</p>;

  return (
    <div>
      <h1>Add Communication Log</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Direction:
          <select value={direction} onChange={e => setDirection(e.target.value)}>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </label>
        <br />
        <label>
          Note:
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={5} required />
        </label>
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Log'}</button>
      </form>
    </div>
  );
}
