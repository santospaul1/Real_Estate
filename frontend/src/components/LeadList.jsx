import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeadList = () => {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    axios.get('/api/leads/', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(res => setLeads(res.data))
    .catch(err => console.error(err));
  }, []);

  const updateStage = (id, newStage) => {
    axios.patch(`/api/leads/${id}/`, { stage: newStage }, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(() => {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === id ? { ...lead, stage: newStage } : lead
        )
      );
    });
  };

  return (
    <div>
      <h2>Lead Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Budget</th>
            <th>Stage</th>
            <th>Update Stage</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id}>
              <td>{lead.full_name}</td>
              <td>{lead.budget}</td>
              <td>{lead.stage}</td>
              <td>
                <select
                  value={lead.stage}
                  onChange={e => updateStage(lead.id, e.target.value)}
                >
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="client">Client</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadList;
