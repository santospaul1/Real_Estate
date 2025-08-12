import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LogTimeline = ({ leadId = null, clientId = null }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('/api/logs/', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(res => {
      const filtered = res.data.filter(log =>
        leadId ? log.related_lead === leadId : log.related_client === clientId
      );
      setLogs(filtered);
    });
  }, [leadId, clientId]);

  return (
    <div>
      <h3>Communication Timeline</h3>
      <ul>
        {logs.map(log => (
          <li key={log.id}>
            {new Date(log.timestamp).toLocaleString()}: {log.note}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogTimeline;
