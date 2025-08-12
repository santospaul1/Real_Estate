import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClientList = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    axios.get('/api/clients/', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(res => setClients(res.data));
  }, []);

  return (
    <div>
      <h2>Client List</h2>
      <ul>
        {clients.map(client => (
          <li key={client.id}>
            {client.name} - Budget: ${client.budget}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientList;
