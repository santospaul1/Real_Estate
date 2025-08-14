import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function AgentForm() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({
    user: '', // user ID
    specialization: '',
    territory: '',
    phone: '',
    active: true,
    joined_at: '',
  });

  const [users, setUsers] = useState([]); // to select user when creating agent profile
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      // Fetch users with role agent for selection (for new agent profile)
      const res = await api.get('accounts/users/?role=agent'); // Adjust endpoint as needed
      setUsers(res.data);
    }

    async function fetchAgent() {
      if (isEdit) {
        try {
          setLoading(true);
          const res = await api.get(`agentprofiles/${id}/`);
          setFormData({
            user: res.data.user,
            specialization: res.data.specialization || '',
            territory: res.data.territory || '',
            phone: res.data.phone || '',
            active: res.data.active,
            joined_at: res.data.joined_at || '',
          });
        } catch {
          setError('Failed to load agent data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchUsers();
    fetchAgent();
  }, [id, isEdit]);

  if (!user || !['admin', 'manager'].includes(user.role)) {
    return <p>Access denied. Admins and Managers only.</p>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(data => ({
      ...data,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        joined_at: formData.joined_at || null,
        user: parseInt(formData.user),
      };

      if (isEdit) {
        await api.put(`agentprofiles/${id}/`, payload);
      } else {
        await api.post('agentprofiles/', payload);
      }
      navigate('/agents');
    } catch {
      setError('Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>{isEdit ? 'Edit Agent' : 'Add New Agent'}</h1>
      {loading ? <p>Loading...</p> : (
        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <label>
              User:
              <select name="user" value={formData.user} onChange={handleChange} required>
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </label>
          )}
          <br />
          <label>
            Specialization:
            <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} />
          </label><br />
          <label>
            Territory:
            <input type="text" name="territory" value={formData.territory} onChange={handleChange} />
          </label><br />
          <label>
            Phone:
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </label><br />
          <label>
            Active:
            <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
          </label><br />
          <label>
            Joined At:
            <input type="date" name="joined_at" value={formData.joined_at || ''} onChange={handleChange} />
          </label><br />
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
