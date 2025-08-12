import React, { useEffect, useState } from "react";
import { getProperties, deleteProperty } from "../services/propertyService";
import { Link } from "react-router-dom";

export default function PropertyList() {
  const [properties, setProperties] = useState([]);

  const fetchData = () => {
    getProperties().then((res) => setProperties(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Delete this property?")) {
      deleteProperty(id).then(() => fetchData());
    }
  };

  return (
    <div>
      <Link to="/properties/add">Add Property</Link>
      <ul>
        {properties.map((p) => (
          <li key={p.id}>
            {p.title} - {p.agent_name} - ${p.price}
            <Link to={`/properties/edit/${p.id}`}>Edit</Link>
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
