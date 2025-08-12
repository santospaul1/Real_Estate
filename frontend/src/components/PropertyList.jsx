import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    axios.get('/api/properties/', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token') // JWT Token
      }
    })
    .then(res => setProperties(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Property Listings</h2>
      <ul>
        {properties.map((prop) => (
          <li key={prop.id}>
            {prop.title} - ${prop.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PropertyList;
